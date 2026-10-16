/**
 * Jennie Web App - Unplayable & Restricted Tracks Registry
 * Tracks, logs, and caches video IDs that fail YouTube's embed restrictions (150/101, 153, 100, 5).
 * Prevents repeating broken tracks in upcoming recommendations, autoplay queues, and shuffles.
 */

const STORAGE_KEY = 'jennie_unplayable_tracks_v2';

export const YOUTUBE_ERROR_CODES = {
  INVALID_PARAM: 2,
  HTML5_ERROR: 5,
  NOT_FOUND_OR_PRIVATE: 100,
  EMBED_NOT_ALLOWED_101: 101,
  EMBED_NOT_ALLOWED_150: 150,
  MISSING_REFERRER_153: 153,
};

export const YOUTUBE_ERROR_DESCRIPTIONS = {
  2: 'Invalid video ID parameter or malformed request',
  5: 'HTML5 player failure or system autoplay policy restricted',
  100: 'Video was deleted or marked private by author',
  101: 'Owner does not permit embedded playback (label copyright restrictions)',
  150: 'Owner prohibits embedded playback on external domains (e.g. Sony, T-Series, Universal)',
  153: 'Missing or rejected origin/referrer header in WebView handshake',
};

// In-memory cache for fast lookup during queue traversal
let unplayableMap = new Map();

function loadRegistry() {
  if (typeof window === 'undefined') return;
  try {
    // Clear out old v1 blacklist created during origin-mismatch localhost runs
    if (localStorage.getItem('jennie_unplayable_tracks_v1')) {
      localStorage.removeItem('jennie_unplayable_tracks_v1');
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const now = Date.now();
        // Expire records older than 24 hours so resolved tracks are retried
        const validRecords = parsed.filter(
          (item) => !item.expiresAt || item.expiresAt > now
        );
        unplayableMap = new Map(validRecords.map((item) => [item.id, item]));
      }
    }
  } catch (_) {
    unplayableMap = new Map();
  }
}

function persistRegistry() {
  if (typeof window === 'undefined') return;
  try {
    const serialized = Array.from(unplayableMap.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (err) {
    console.warn('[UnplayableRegistry] Failed to save to localStorage:', err);
  }
}

// Initial load on script import
loadRegistry();

/**
 * Marks a track or video ID as unplayable due to embed restriction
 * @param {string} trackOrVideoId - ID or clean 11-char youtube ID
 * @param {number} errorCode - YouTube onError event data
 * @param {string} [extraInfo] - Optional track title or artist context
 */
export function markTrackUnplayable(trackOrVideoId, errorCode, extraInfo = '') {
  if (!trackOrVideoId) return;
  const cleanId = typeof trackOrVideoId === 'string' && trackOrVideoId.startsWith('yt-')
    ? trackOrVideoId.replace('yt-', '')
    : trackOrVideoId;

  const desc = YOUTUBE_ERROR_DESCRIPTIONS[errorCode] || `Unknown playback error (${errorCode})`;
  const record = {
    id: cleanId,
    code: errorCode,
    reason: desc,
    extraInfo,
    timestamp: new Date().toISOString(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };

  unplayableMap.set(cleanId, record);
  // Also index the original ID if prefixed
  if (trackOrVideoId !== cleanId) {
    unplayableMap.set(trackOrVideoId, record);
  }

  persistRegistry();
  console.warn(`[UnplayableRegistry] Blacklisted video ${cleanId} (Code ${errorCode}: ${desc})`);
}

/**
 * Checks whether a track is recorded as unplayable
 * @param {string} trackOrVideoId 
 * @returns {boolean}
 */
export function isTrackUnplayable(trackOrVideoId) {
  if (!trackOrVideoId) return false;
  const cleanId = typeof trackOrVideoId === 'string' && trackOrVideoId.startsWith('yt-')
    ? trackOrVideoId.replace('yt-', '')
    : trackOrVideoId;

  return unplayableMap.has(cleanId) || unplayableMap.has(trackOrVideoId);
}

/**
 * Returns detailed failure record for a track
 */
export function getUnplayableRecord(trackOrVideoId) {
  if (!trackOrVideoId) return null;
  const cleanId = typeof trackOrVideoId === 'string' && trackOrVideoId.startsWith('yt-')
    ? trackOrVideoId.replace('yt-', '')
    : trackOrVideoId;

  return unplayableMap.get(cleanId) || unplayableMap.get(trackOrVideoId) || null;
}

/**
 * Clears the blacklist registry
 */
export function clearUnplayableRegistry() {
  unplayableMap.clear();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_) {}
}
