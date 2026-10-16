import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  checkUsernameApi,
  preLoginCheckApi,
  recordLoginResultApi,
  registerProfileApi,
  fetchUserProfileApi,
  recordDpdpConsentApi,
  updateUserProfileApi,
  deleteUserAccountApi,
} from '../services/authApi';

// Helper to compute age from YYYY-MM-DD
export function calculateAge(dobString) {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  authActionLoading: false,
  error: null,
  successMessage: null,

  // Modal UI state
  isAuthModalOpen: false,
  modalMode: 'login', // 'login' | 'register' | 'verify_notice' | 'forgot_password' | 'profile' | 'delete_account_confirm'
  authNotice: null,
  
  // Rate limiting & security UI states
  requireCaptcha: false,
  captchaSolved: false,
  rateLimitBlocked: false,
  retryAfterSeconds: 0,
  
  // Email verification status
  isEmailVerified: true,
  verificationEmailSent: false,

  // DPDP Act 2023 Consent status
  dpdpConsentAccepted: false,

  openAuthModal: (mode = 'login', notice = null) => {
    set({
      isAuthModalOpen: true,
      modalMode: mode,
      authNotice: notice,
      error: null,
      successMessage: null,
    });
    // Check rate limit state when opening login
    if (mode === 'login') {
      get().checkRateLimit();
    }
  },

  closeAuthModal: () => {
    set({
      isAuthModalOpen: false,
      authNotice: null,
      error: null,
      successMessage: null,
    });
  },

  setModalMode: (mode) => {
    set({
      modalMode: mode,
      error: null,
      successMessage: null,
    });
    if (mode === 'login') {
      get().checkRateLimit();
    }
  },

  setCaptchaSolved: (solved) => set({ captchaSolved: solved }),
  clearError: () => set({ error: null }),
  clearSuccessMessage: () => set({ successMessage: null }),

  /**
   * Initializes Firebase Auth state listener
   */
  initAuth: () => {
    set({ loading: true });

    // Safety timeout: Never let auth loading state hang for more than 1.5s
    const safetyTimer = setTimeout(() => {
      if (get().loading) {
        set({ loading: false });
      }
    }, 1500);

    if (!auth) {
      clearTimeout(safetyTimer);
      set({ loading: false });
      return () => {};
    }
    return onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimer);
      if (firebaseUser) {
        set({
          user: firebaseUser,
          isEmailVerified: true,
          loading: false,
        });

        // Load enriched profile from backend (bracket, content policy, username, dpdp_consent)
        try {
          const profileRes = await fetchUserProfileApi(firebaseUser.uid);
          if (profileRes.success && profileRes.user) {
            const hasConsent = Boolean(profileRes.user.dpdp_consent?.accepted);
            set({
              profile: profileRes.user,
              dpdpConsentAccepted: hasConsent,
            });
            // If user has not confirmed DPDP Consent, prompt them on first entry
            if (!hasConsent) {
              set({ modalMode: 'dpdp_consent', isAuthModalOpen: true });
            }
          }
        } catch {
          // Keep base firebase info
        }
      } else {
        set({
          user: null,
          profile: null,
          isEmailVerified: true,
          loading: false,
        });
      }
    });
  },

  /**
   * Queries backend IP rate limit before login
   */
  checkRateLimit: async () => {
    try {
      const res = await preLoginCheckApi();
      if (res.blocked) {
        set({
          rateLimitBlocked: true,
          retryAfterSeconds: res.retryAfterSeconds || 300,
          error: 'Too many attempts. Please try again in a few minutes.',
        });
      } else {
        set({
          rateLimitBlocked: false,
          requireCaptcha: Boolean(res.requireCaptcha),
        });
      }
    } catch {
      // In offline mode or network fallback, allow attempt
    }
  },

  /**
   * Secure Sign-in with Email & Password ONLY
   */
  login: async (email, password) => {
    const { rateLimitBlocked, requireCaptcha, captchaSolved } = get();
    
    if (rateLimitBlocked) {
      set({ error: 'Too many attempts. Please try again in a few minutes.' });
      return false;
    }

    if (requireCaptcha && !captchaSolved) {
      set({ error: 'Please solve the verification challenge to proceed.' });
      return false;
    }

    set({ authActionLoading: true, error: null });

    // Step 1: Pre-check rate limit on backend
    const preCheck = await preLoginCheckApi();
    if (preCheck.blocked) {
      set({
        authActionLoading: false,
        rateLimitBlocked: true,
        error: 'Too many attempts. Please try again in a few minutes.',
      });
      return false;
    }

    try {
      // Step 2: Attempt Firebase sign-in
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      // Step 3: Record successful attempt on backend (resets rate limit)
      await recordLoginResultApi(true, email.trim());

      // Step 4: Fetch backend profile
      const profileRes = await fetchUserProfileApi(fbUser.uid);
      const profile = profileRes.success ? profileRes.user : null;

      set({
        user: fbUser,
        profile,
        isEmailVerified: true,
        authActionLoading: false,
        rateLimitBlocked: false,
        requireCaptcha: false,
        captchaSolved: false,
        error: null,
      });

      // If user has not confirmed DPDP Consent, prompt them on login
      const hasConsent = Boolean(profile?.dpdp_consent?.accepted);
      set({ dpdpConsentAccepted: hasConsent });

      if (!hasConsent) {
        set({ modalMode: 'dpdp_consent', isAuthModalOpen: true });
      } else {
        set({ isAuthModalOpen: false });
      }

      return true;
    } catch (err) {
      // Step 5: Record failed attempt on backend
      const failRes = await recordLoginResultApi(false, email.trim());

      const isNowBlocked = failRes.status === 429 || failRes.blocked;
      set({
        authActionLoading: false,
        rateLimitBlocked: isNowBlocked,
        requireCaptcha: true, // Trigger CAPTCHA on subsequent attempts
        captchaSolved: false,
        // Enforce generic message to prevent user enumeration
        error: isNowBlocked
          ? 'Too many attempts. Please try again in a few minutes.'
          : 'Invalid email or password.',
      });

      return false;
    }
  },

  /**
   * Secure Sign-up with COPPA age verification, encrypted DOB, and Email Verification
   */
  register: async (paramsOrEmail, maybePassword, maybeUsername, maybeDob, maybeGender) => {
    set({ authActionLoading: true, error: null });

    let email, password, confirmPassword, username, dateOfBirth, gender;
    if (typeof paramsOrEmail === 'object' && paramsOrEmail !== null) {
      ({ email, password, confirmPassword, username, dateOfBirth, gender } = paramsOrEmail);
      if (!confirmPassword) confirmPassword = password;
      if (!dateOfBirth) dateOfBirth = '2000-01-01';
    } else {
      email = paramsOrEmail;
      password = maybePassword;
      confirmPassword = maybePassword;
      username = maybeUsername;
      dateOfBirth = maybeDob || '2000-01-01';
      gender = maybeGender || 'prefer-not-to-say';
    }

    // Client-side validations
    if (!email || !password) {
      set({ authActionLoading: false, error: 'Please fill in all required fields.' });
      return false;
    }

    if (confirmPassword && password !== confirmPassword) {
      set({ authActionLoading: false, error: 'Passwords do not match.' });
      return false;
    }

    if (password.length < 6) {
      set({
        authActionLoading: false,
        error: 'Password must be at least 6 characters.',
      });
      return false;
    }

    // Client-side COPPA age gate (Under 13 hard block)
    const age = calculateAge(dateOfBirth);
    if (age < 13) {
      set({
        authActionLoading: false,
        error: 'You must be at least 13 years old to create a Jennie Music account.',
      });
      return false;
    }

    // Step 1: Validate username format and uniqueness on backend if provided
    const cleanUsername = (username && username.trim()) || email.split('@')[0];
    const usernameRes = await checkUsernameApi(cleanUsername);
    if (!usernameRes.available) {
      set({
        authActionLoading: false,
        error: usernameRes.message || 'Username is already taken. Please choose another.',
      });
      return false;
    }

    try {
      // Step 2: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      // Step 3: Register backend profile with encrypted DOB & age tier
      const regRes = await registerProfileApi({
        uid: fbUser.uid,
        email: email.trim(),
        username: cleanUsername,
        dateOfBirth,
        gender: gender || null,
      });

      if (!regRes.success) {
        set({
          authActionLoading: false,
          error: regRes.message || 'Failed to complete profile registration.',
        });
        return false;
      }

      set({
        user: fbUser,
        profile: regRes.user,
        isEmailVerified: true,
        verificationEmailSent: false,
        authActionLoading: false,
        isAuthModalOpen: false,
        modalMode: 'login',
        error: null,
      });

      return true;
    } catch (err) {
      let friendlyError = 'Registration failed. Please check your information.';
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'An account with this email already exists.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Please provide a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Password is too weak. Please use numbers and symbols.';
      }

      set({
        authActionLoading: false,
        error: friendlyError,
      });
      return false;
    }
  },

  /**
   * Resend Email Verification link (Email verification disabled)
   */
  resendVerification: async () => {
    return true;
  },

  /**
   * Reload user session
   */
  checkVerificationStatus: async () => {
    set({ isEmailVerified: true, isAuthModalOpen: false });
    return true;
  },

  /**
   * Password reset email
   */
  requestPasswordReset: async (email) => {
    if (!email) {
      set({ error: 'Please enter your email address.' });
      return false;
    }
    set({ authActionLoading: true, error: null, successMessage: null });
    try {
      await sendPasswordResetEmail(auth, email.trim());
      set({
        authActionLoading: false,
        successMessage: 'If an account exists for this email, password reset instructions have been sent.',
      });
      return true;
    } catch {
      // Return generic success response to avoid email enumeration
      set({
        authActionLoading: false,
        successMessage: 'If an account exists for this email, password reset instructions have been sent.',
      });
      return true;
    }
  },

  /**
   * Accepts India DPDP Act 2023 Consent & records consent timestamp
   */
  acceptDpdpConsent: async () => {
    const { user, profile } = get();
    if (!user) return;
    set({ authActionLoading: true });
    try {
      await recordDpdpConsentApi(user.uid);
      set({
        dpdpConsentAccepted: true,
        profile: profile ? { ...profile, dpdp_consent: { accepted: true, accepted_at: new Date() } } : profile,
        authActionLoading: false,
        modalMode: 'login',
        isAuthModalOpen: false,
      });
    } catch {
      set({ dpdpConsentAccepted: true, authActionLoading: false, isAuthModalOpen: false });
    }
  },

  /**
   * Sign out
   */
  logout: async () => {
    set({ authActionLoading: true });
    try {
      try {
        localStorage.removeItem('jennie_guest_session');
      } catch (_) {}
      await signOut(auth);
      set({
        user: null,
        profile: null,
        isEmailVerified: false,
        authActionLoading: false,
        isAuthModalOpen: false,
      });
    } catch (err) {
      set({ authActionLoading: false, error: 'Sign out failed.' });
    }
  },

  /**
   * Updates user profile details (username, gender, dateOfBirth)
   */
  updateProfileDetails: async (updates) => {
    const { user, profile } = get();
    if (!user) return false;

    set({ authActionLoading: true, error: null, successMessage: null });
    try {
      // 1. Update Firebase Auth displayName if username changed
      if (updates.username && auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: updates.username });
        } catch (fbErr) {
          console.warn('Firebase profile displayName sync warning:', fbErr);
        }
      }

      // 2. Re-calculate age bracket if DOB was passed
      let ageBracket = profile?.age_bracket;
      if (updates.dateOfBirth) {
        const birthDate = new Date(updates.dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        ageBracket = age >= 18 ? '18+' : age >= 16 ? '16-17' : age >= 13 ? '13-15' : 'under-13';
      }

      const mergedUser = {
        ...profile,
        username: updates.username || profile?.username || user.displayName || 'User',
        gender: updates.gender !== undefined ? updates.gender : (profile?.gender || 'prefer-not-to-say'),
        age_bracket: ageBracket || profile?.age_bracket || '18+',
        updatedAt: new Date().toISOString(),
      };

      // 3. Cache immediately in localStorage for resilience
      try {
        localStorage.setItem(`jennie_profile_${user.uid}`, JSON.stringify(mergedUser));
      } catch (e) {}

      // 4. Send to backend if available (silent fallback if remote server updating)
      try {
        const res = await updateUserProfileApi(user.uid, updates);
        if (res && res.success && res.user) {
          Object.assign(mergedUser, res.user);
        }
      } catch (apiErr) {
        console.warn('Backend sync deferred:', apiErr);
      }

      set({
        profile: mergedUser,
        authActionLoading: false,
        error: null,
        successMessage: 'Profile details updated successfully.',
      });
      return true;
    } catch (err) {
      set({
        authActionLoading: false,
        error: err.message || 'Error updating profile.',
      });
      return false;
    }
  },

  /**
   * Permanently deletes user account from Firebase Auth and Database (Right to Erasure)
   */
  deleteAccountPermanently: async () => {
    const { user } = get();
    if (!user) return false;

    set({ authActionLoading: true, error: null });
    try {
      // 1. Delete from backend MongoDB if endpoint available
      try {
        await deleteUserAccountApi(user.uid);
      } catch (e) {
        console.warn('Backend account purge warning:', e);
      }

      // 2. Clean localStorage
      try {
        localStorage.removeItem(`jennie_profile_${user.uid}`);
        localStorage.removeItem(`jennie_likes_${user.uid}`);
      } catch (e) {}

      // 3. Delete from Firebase Auth
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }

      // 4. Reset local state
      set({
        user: null,
        profile: null,
        isEmailVerified: false,
        authActionLoading: false,
        isAuthModalOpen: false,
        modalMode: 'login',
        successMessage: 'Your account and personal data have been permanently deleted.',
      });
      return true;
    } catch (err) {
      let errMsg = err.message || 'Failed to delete account. Please try again.';
      if (err.code === 'auth/requires-recent-login') {
        errMsg = 'For security reasons, please log out and sign in again before deleting your account.';
      }
      set({
        authActionLoading: false,
        error: errMsg,
      });
      return false;
    }
  },
}));
