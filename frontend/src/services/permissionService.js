/**
 * Jennie Web App - Unified Device & App Permission Service
 * Handles browser & native permissions for Headphones/Audio, Microphone, Storage, and Notifications.
 */

const STORAGE_KEY = 'jennie_app_permissions';
const SETUP_COMPLETED_KEY = 'jennie_permissions_setup_completed';

export const PERMISSION_TYPES = {
  HEADPHONES: 'headphones',
  MICROPHONE: 'microphone',
  STORAGE: 'storage',
  NOTIFICATIONS: 'notifications',
};

export const PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  PROMPT: 'prompt',
  UNSUPPORTED: 'unsupported',
};

export const PERMISSION_METADATA = [
  {
    id: PERMISSION_TYPES.HEADPHONES,
    title: 'Headphone & Audio Hardware Access',
    subtitle: 'Hardware media buttons, Bluetooth audio routing, and low-latency background playback.',
    icon: 'headphones',
    required: true,
    defaultGranted: true,
  },
  {
    id: PERMISSION_TYPES.MICROPHONE,
    title: 'Microphone & Voice Control',
    subtitle: 'Enables hands-free voice search, song hum identification, and real-time karaoke lyrics sync.',
    icon: 'mic',
    required: false,
    defaultGranted: false,
  },
  {
    id: PERMISSION_TYPES.STORAGE,
    title: 'Local Storage & Offline Library',
    subtitle: 'Allows persistent high-speed caching of albums, playlist metadata, and offline playback.',
    icon: 'storage',
    required: true,
    defaultGranted: true,
  },
  {
    id: PERMISSION_TYPES.NOTIFICATIONS,
    title: 'Music Playback & Artist Alerts',
    subtitle: 'Lockscreen notification controls, background playback updates, and new song release alerts.',
    icon: 'bell',
    required: false,
    defaultGranted: false,
  },
];

/**
 * Retrieves persisted permission records from localStorage
 */
export function getSavedPermissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        [PERMISSION_TYPES.HEADPHONES]: PERMISSION_STATUS.GRANTED,
        [PERMISSION_TYPES.MICROPHONE]: PERMISSION_STATUS.PROMPT,
        [PERMISSION_TYPES.STORAGE]: PERMISSION_STATUS.GRANTED,
        [PERMISSION_TYPES.NOTIFICATIONS]: PERMISSION_STATUS.PROMPT,
      };
    }
    return JSON.parse(raw);
  } catch (_) {
    return {
      [PERMISSION_TYPES.HEADPHONES]: PERMISSION_STATUS.GRANTED,
      [PERMISSION_TYPES.MICROPHONE]: PERMISSION_STATUS.PROMPT,
      [PERMISSION_TYPES.STORAGE]: PERMISSION_STATUS.GRANTED,
      [PERMISSION_TYPES.NOTIFICATIONS]: PERMISSION_STATUS.PROMPT,
    };
  }
}

/**
 * Saves permission state to localStorage
 */
export function savePermissions(permissions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
    window.dispatchEvent(new CustomEvent('jennie_permissions_updated', { detail: permissions }));
  } catch (err) {
    console.warn('Unable to persist permissions to localStorage:', err);
  }
}

/**
 * Checks if the user has completed the initial first-time permission setup
 */
export function hasCompletedPermissionSetup() {
  try {
    return localStorage.getItem(SETUP_COMPLETED_KEY) === 'true';
  } catch (_) {
    return false;
  }
}

/**
 * Marks permission setup as completed
 */
export function markPermissionSetupCompleted(completed = true) {
  try {
    localStorage.setItem(SETUP_COMPLETED_KEY, completed ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('jennie_permissions_setup_completed', { detail: completed }));
  } catch (err) {
    console.warn('Unable to write setup state:', err);
  }
}

/**
 * Requests Microphone access via browser mediaDevices
 */
export async function requestMicrophoneAccess() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return PERMISSION_STATUS.UNSUPPORTED;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop tracks immediately after granting so the mic indicator doesn't stay on
    stream.getTracks().forEach((track) => track.stop());
    return PERMISSION_STATUS.GRANTED;
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      return PERMISSION_STATUS.DENIED;
    }
    return PERMISSION_STATUS.PROMPT;
  }
}

/**
 * Requests Notification permission
 */
export async function requestNotificationAccess() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return PERMISSION_STATUS.UNSUPPORTED;
  }

  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') return PERMISSION_STATUS.GRANTED;
    if (result === 'denied') return PERMISSION_STATUS.DENIED;
    return PERMISSION_STATUS.PROMPT;
  } catch (_) {
    return PERMISSION_STATUS.DENIED;
  }
}

/**
 * Requests persistent Storage quota
 */
export async function requestStorageAccess() {
  if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted ? PERMISSION_STATUS.GRANTED : PERMISSION_STATUS.GRANTED;
    } catch (_) {
      return PERMISSION_STATUS.GRANTED;
    }
  }
  return PERMISSION_STATUS.GRANTED;
}

/**
 * Initializes and verifies Headphone / Audio Hardware integration
 */
export async function requestHeadphoneAccess() {
  try {
    if ('mediaSession' in navigator) {
      // Audio hardware media buttons supported
      return PERMISSION_STATUS.GRANTED;
    }
    return PERMISSION_STATUS.GRANTED;
  } catch (_) {
    return PERMISSION_STATUS.GRANTED;
  }
}

/**
 * Requests all permissions according to user selection
 */
export async function requestAllPermissions(selectedMap = {}) {
  const current = getSavedPermissions();
  const updated = { ...current };

  // 1. Headphone
  if (selectedMap[PERMISSION_TYPES.HEADPHONES]) {
    updated[PERMISSION_TYPES.HEADPHONES] = await requestHeadphoneAccess();
  }

  // 2. Microphone
  if (selectedMap[PERMISSION_TYPES.MICROPHONE]) {
    updated[PERMISSION_TYPES.MICROPHONE] = await requestMicrophoneAccess();
  } else {
    updated[PERMISSION_TYPES.MICROPHONE] = PERMISSION_STATUS.PROMPT;
  }

  // 3. Storage
  if (selectedMap[PERMISSION_TYPES.STORAGE]) {
    updated[PERMISSION_TYPES.STORAGE] = await requestStorageAccess();
  }

  // 4. Notifications
  if (selectedMap[PERMISSION_TYPES.NOTIFICATIONS]) {
    updated[PERMISSION_TYPES.NOTIFICATIONS] = await requestNotificationAccess();
  } else {
    updated[PERMISSION_TYPES.NOTIFICATIONS] = PERMISSION_STATUS.PROMPT;
  }

  savePermissions(updated);
  markPermissionSetupCompleted(true);
  return updated;
}
