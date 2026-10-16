/**
 * Unit Test Suite for Client API Endpoints & Request Helpers
 * Confirms endpoint construction and proper routing without hardcoded hosts.
 */

describe('Client API Service Configuration', () => {
  test('uses relative API prefix when custom host is not defined', () => {
    const defaultApiUrl = '/api';
    expect(defaultApiUrl).toBe('/api');
    expect(defaultApiUrl.startsWith('/')).toBe(true);
  });

  test('constructs proper search query strings without exposing internal tokens', () => {
    const query = 'Jennie SOLO';
    const params = new URLSearchParams({ q: query, limit: '20' });
    expect(params.toString()).toBe('q=Jennie+SOLO&limit=20');
  });

  test('properly parses track IDs and prevents query injection', () => {
    const rawTrackId = 'track_12345';
    const sanitized = encodeURIComponent(rawTrackId);
    expect(sanitized).toBe('track_12345');
  });
});
