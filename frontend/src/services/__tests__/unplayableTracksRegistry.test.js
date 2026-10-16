/**
 * Unit Test Suite for YouTube Unplayable Tracks Registry & Error Mapping
 * Verifies error code classification, ID normalization, and persistence.
 */

import {
  YOUTUBE_ERROR_CODES,
  YOUTUBE_ERROR_DESCRIPTIONS,
  markTrackUnplayable,
  isTrackUnplayable,
  getUnplayableRecord,
  clearUnplayableRegistry,
} from '../unplayableTracksRegistry';

describe('YouTube Unplayable Tracks Registry', () => {
  beforeEach(() => {
    clearUnplayableRegistry();
  });

  test('maps official YouTube error codes to diagnostic descriptions', () => {
    expect(YOUTUBE_ERROR_CODES.EMBED_NOT_ALLOWED_150).toBe(150);
    expect(YOUTUBE_ERROR_CODES.EMBED_NOT_ALLOWED_101).toBe(101);
    expect(YOUTUBE_ERROR_CODES.MISSING_REFERRER_153).toBe(153);
    expect(YOUTUBE_ERROR_CODES.NOT_FOUND_OR_PRIVATE).toBe(100);

    expect(YOUTUBE_ERROR_DESCRIPTIONS[150]).toContain('Owner prohibits embedded playback');
    expect(YOUTUBE_ERROR_DESCRIPTIONS[153]).toContain('origin/referrer');
  });

  test('successfully blacklists an unplayable video and queries by clean or prefixed ID', () => {
    const rawId = 'dQw4w9WgXcQ';
    markTrackUnplayable(rawId, 150, 'Rick Astley - Never Gonna Give You Up');

    expect(isTrackUnplayable(rawId)).toBe(true);
    expect(isTrackUnplayable(`yt-${rawId}`)).toBe(true);

    const record = getUnplayableRecord(rawId);
    expect(record).not.toBeNull();
    expect(record.code).toBe(150);
    expect(record.reason).toContain('prohibits embedded playback');
  });

  test('handles prefixed IDs when blacklisting', () => {
    markTrackUnplayable('yt-LK7-_dgAVQE', 101, 'Restricted Track');

    expect(isTrackUnplayable('LK7-_dgAVQE')).toBe(true);
    expect(isTrackUnplayable('yt-LK7-_dgAVQE')).toBe(true);
  });

  test('clears unplayable registry', () => {
    markTrackUnplayable('testId12345', 100);
    expect(isTrackUnplayable('testId12345')).toBe(true);

    clearUnplayableRegistry();
    expect(isTrackUnplayable('testId12345')).toBe(false);
  });
});
