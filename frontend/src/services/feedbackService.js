import { db, storage } from '../config/firebase';
import { collection, addDoc, getDocs, updateDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export const FEEDBACK_CATEGORIES = [
  {
    id: 'playback',
    label: 'Playback issue (song won\'t play, buffering, audio/video mismatch)',
    shortLabel: 'Playback Issue',
    priority: 'medium',
    placeholder: 'Steps to reproduce:\n1. Started playing track...\n2. After 15 seconds, buffering occurred...\n3. Error showed...',
  },
  {
    id: 'account',
    label: 'Account / login issue',
    shortLabel: 'Account & Login',
    priority: 'medium',
    placeholder: 'Describe your login or account trouble:\n- What email or device are you using?\n- Did you see an error message during sign-in?',
  },
  {
    id: 'recommendation',
    label: 'Recommendation / algorithm issue (e.g. repetitive songs)',
    shortLabel: 'Recommendation',
    priority: 'low',
    placeholder: 'Tell us how recommendations can improve:\n- What genre or artist was playing?\n- Was the next track repetitive or out of place?',
  },
  {
    id: 'payment',
    label: 'Payment / subscription issue',
    shortLabel: 'Payment & Billing',
    priority: 'high',
    placeholder: 'Please describe the transaction or billing question:\n- Date of attempt:\n- Payment reference / transaction ID (if any):',
  },
  {
    id: 'bug',
    label: 'Bug / crash report',
    shortLabel: 'Bug / Crash Report',
    priority: 'high',
    placeholder: 'Steps to reproduce the crash/bug:\n1. Navigated to...\n2. Clicked on button...\n3. Screen turned blank or froze...',
  },
  {
    id: 'abuse',
    label: 'Abuse or inappropriate content report',
    shortLabel: 'Abuse & Content Safety',
    priority: 'high',
    placeholder: 'Specify what violates community standards:\n- Which artist, track title, playlist, or comment?\n- Description of offensive or copyright-infringing content:',
  },
  {
    id: 'feature_request',
    label: 'Feature request',
    shortLabel: 'Feature Request',
    priority: 'low',
    placeholder: 'What feature would make Jennie better for you?\n- Describe the idea:\n- How should it work?',
  },
  {
    id: 'other',
    label: 'Other',
    shortLabel: 'Other Inquiry',
    priority: 'medium',
    placeholder: 'Please share your feedback or question with our support engineering team...',
  },
];

const LOCAL_STORAGE_USER_REPORTS_KEY = 'jennie_user_feedback_reports';
const LOCAL_STORAGE_ALL_REPORTS_KEY = 'jennie_all_feedback_reports';
const RATE_LIMIT_STORAGE_KEY = 'jennie_feedback_rate_limit';
const MAX_SUBMISSIONS_PER_HOUR = 5;

/**
 * Detect client OS and browser environment
 */
export function detectEnvironmentContext() {
  if (typeof window === 'undefined') {
    return { os: 'Unknown', browser: 'Unknown', platform: 'web' };
  }

  const ua = window.navigator.userAgent;
  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Electron/i.test(ua)) browser = 'Electron Desktop';
  else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';

  const isNative = Boolean(window.Capacitor?.isNativePlatform?.());
  const platform = isNative ? 'mobile-native' : /Electron/i.test(ua) ? 'desktop-electron' : 'web';

  return {
    os,
    browser,
    platform,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    appVersion: '0.1.0',
    userAgentSummary: `${browser} on ${os}`,
  };
}

/**
 * Determine auto priority based on category
 */
export function getCategoryPriority(categoryId) {
  const match = FEEDBACK_CATEGORIES.find((c) => c.id === categoryId);
  return match?.priority || 'medium';
}

/**
 * Check and enforce rate limiting (max 5 submissions per hour)
 */
export function checkFeedbackRateLimit() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    let timestamps = raw ? JSON.parse(raw) : [];
    // Filter to last 1 hour
    timestamps = timestamps.filter((t) => typeof t === 'number' && now - t < oneHour);

    if (timestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
      const oldest = Math.min(...timestamps);
      const minutesRemaining = Math.max(1, Math.ceil((oldest + oneHour - now) / 60000));
      return {
        allowed: false,
        remainingCount: 0,
        waitMinutes: minutesRemaining,
      };
    }

    return {
      allowed: true,
      remainingCount: MAX_SUBMISSIONS_PER_HOUR - timestamps.length,
      waitMinutes: 0,
    };
  } catch (_) {
    return { allowed: true, remainingCount: 5, waitMinutes: 0 };
  }
}

/**
 * Record a submission into rate limit history
 */
function recordSubmissionForRateLimit() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    let timestamps = raw ? JSON.parse(raw) : [];
    timestamps = timestamps.filter((t) => typeof t === 'number' && now - t < oneHour);
    timestamps.push(now);
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(timestamps));
  } catch (_) {}
}

/**
 * Generate unique Human-readable Reference ID e.g. REF-FB-8F2D4C1A
 */
export function generateReferenceId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${rand}`;
}

/**
 * Upload screenshot to Firebase Storage or compress to base64
 */
async function processScreenshot(screenshotDataUrl, refId) {
  if (!screenshotDataUrl) return null;

  // If Firebase Storage is initialized with a bucket
  if (storage) {
    try {
      const storageRef = ref(storage, `feedback-screenshots/${refId}.jpg`);
      await uploadString(storageRef, screenshotDataUrl, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.warn('[Feedback] Firebase Storage upload skipped, retaining local data url:', err.message);
    }
  }

  // Return local base64/data url as fallback
  return screenshotDataUrl;
}

/**
 * Submit feedback report
 */
export async function submitFeedbackReport(payload) {
  const rateLimit = checkFeedbackRateLimit();
  if (!rateLimit.allowed) {
    throw new Error(
      `Rate limit exceeded: You have submitted 5 reports within the last hour. Please wait ${rateLimit.waitMinutes} minute(s) before sending another report.`
    );
  }

  const {
    userId,
    userEmail,
    category,
    subject,
    description,
    reportedItem,
    screenshotDataUrl,
    playerContext,
  } = payload;

  if (!category) throw new Error('Please select a feedback category.');
  if (!subject || subject.trim().length < 4) throw new Error('Subject must be at least 4 characters long.');
  if (!description || description.trim().length < 15) {
    throw new Error('Please provide at least 15 characters describing what happened so we can diagnose it.');
  }
  if (category === 'abuse' && (!reportedItem || reportedItem.trim().length < 3)) {
    throw new Error('For abuse or inappropriate content reports, specifying the reported content or user ID is required.');
  }

  const refId = generateReferenceId();
  const priority = getCategoryPriority(category);
  const envContext = detectEnvironmentContext();

  const screenshotUrl = await processScreenshot(screenshotDataUrl, refId);

  const reportData = {
    reference_id: refId,
    user_id: userId || 'anonymous_guest',
    category,
    subject: subject.trim(),
    description: description.trim(),
    reported_item: reportedItem ? reportedItem.trim() : null,
    screenshot_url: screenshotUrl,
    contact_email: (userEmail || '').trim(),
    context: {
      app_version: envContext.appVersion,
      device: envContext.userAgentSummary,
      platform: envContext.platform,
      screen: envContext.screenSize,
      song_id: playerContext?.songId || null,
      artist: playerContext?.artist || null,
      track_title: playerContext?.trackTitle || null,
      playback_position: playerContext?.playbackPosition || null,
    },
    status: 'open',
    priority,
    created_at: Date.now(),
    resolved_at: null,
    admin_notes: null,
  };

  // 1. Persist to Firestore if available
  let firestoreDocId = null;
  if (db) {
    try {
      const feedbackCol = collection(db, 'feedback');
      const docRef = await addDoc(feedbackCol, {
        ...reportData,
        server_timestamp: serverTimestamp(),
      });
      firestoreDocId = docRef.id;
    } catch (err) {
      console.warn('[Feedback] Firestore write failed or unauthenticated, falling back to local sync:', err.message);
    }
  }

  const finalRecord = {
    ...reportData,
    id: firestoreDocId || refId,
  };

  // 2. Persist in Local Storage for user history
  saveUserReportLocally(finalRecord);

  // 3. Persist in Admin Local Storage cache
  saveAdminReportLocally(finalRecord);

  // 4. Update Rate Limiter
  recordSubmissionForRateLimit();

  // 5. High Priority Webhook / Notification Logging
  if (priority === 'high') {
    console.info(`[High Priority Alert] ${category.toUpperCase()} report received: Ref #${refId}`);
  }

  return finalRecord;
}

/**
 * Save to user's local history
 */
function saveUserReportLocally(report) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_REPORTS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    // Prepend newest first
    list.unshift(report);
    localStorage.setItem(LOCAL_STORAGE_USER_REPORTS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (_) {}
}

/**
 * Retrieve current user's submitted reports
 */
export function getUserSubmittedReports() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

/**
 * Save to global admin reports list
 */
function saveAdminReportLocally(report) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALL_REPORTS_KEY);
    let list = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((r) => r.reference_id === report.reference_id || r.id === report.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...report };
    } else {
      list.unshift(report);
    }
    localStorage.setItem(LOCAL_STORAGE_ALL_REPORTS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch (_) {}
}

/**
 * Fetch all reports for Admin Resolver Dashboard
 */
export async function getAllReportsForAdmin() {
  let firestoreReports = [];

  if (db) {
    try {
      const feedbackCol = collection(db, 'feedback');
      const q = query(feedbackCol, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      firestoreReports = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    } catch (err) {
      console.warn('[Feedback] Could not read Firestore reports:', err.message);
    }
  }

  // Merge with locally saved admin reports
  let localReports = [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALL_REPORTS_KEY);
    localReports = raw ? JSON.parse(raw) : [];
  } catch (_) {}

  // Deduplicate by reference_id or id
  const map = new Map();
  [...firestoreReports, ...localReports].forEach((r) => {
    const key = r.reference_id || r.id;
    if (key && !map.has(key)) {
      map.set(key, r);
    }
  });

  const all = Array.from(map.values());

  // Sort by priority (high -> medium -> low), then newest first
  const priorityWeight = { high: 3, medium: 2, low: 1 };
  all.sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return (b.created_at || 0) - (a.created_at || 0);
  });

  return all;
}

/**
 * Update report status and internal notes
 */
export async function updateReportStatus(reportId, newStatus, adminNotes = null) {
  const resolvedAt = newStatus === 'resolved' || newStatus === 'closed' ? Date.now() : null;

  // 1. Update Firestore if available
  if (db && reportId && !reportId.startsWith('REF-')) {
    try {
      const docRef = doc(db, 'feedback', reportId);
      await updateDoc(docRef, {
        status: newStatus,
        resolved_at: resolvedAt,
        ...(adminNotes !== null ? { admin_notes: adminNotes } : {}),
      });
    } catch (err) {
      console.warn('[Feedback] Firestore status update failed:', err.message);
    }
  }

  // 2. Update local storage copies
  const updateList = (storageKey) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const list = JSON.parse(raw);
      const updated = list.map((item) => {
        if (item.id === reportId || item.reference_id === reportId) {
          return {
            ...item,
            status: newStatus,
            resolved_at: resolvedAt,
            ...(adminNotes !== null ? { admin_notes: adminNotes } : {}),
          };
        }
        return item;
      });
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (_) {}
  };

  updateList(LOCAL_STORAGE_USER_REPORTS_KEY);
  updateList(LOCAL_STORAGE_ALL_REPORTS_KEY);

  return { success: true, status: newStatus, resolved_at: resolvedAt };
}
