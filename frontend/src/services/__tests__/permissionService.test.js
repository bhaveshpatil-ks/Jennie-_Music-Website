/**
 * Unit & Integration Test Suite for Jennie App Permissions System
 * Verifies permission schema, default values, storage persistence, and setup flags.
 */

import {
  PERMISSION_TYPES,
  PERMISSION_STATUS,
  PERMISSION_METADATA,
  getSavedPermissions,
  savePermissions,
  hasCompletedPermissionSetup,
  markPermissionSetupCompleted,
} from '../permissionService';

describe('App Permissions Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('contains all expected permission types: background, battery, headphones, mic, storage, notifications', () => {
    expect(PERMISSION_TYPES.BACKGROUND).toBe('background');
    expect(PERMISSION_TYPES.BATTERY).toBe('battery');
    expect(PERMISSION_TYPES.HEADPHONES).toBe('headphones');
    expect(PERMISSION_TYPES.MICROPHONE).toBe('microphone');
    expect(PERMISSION_TYPES.STORAGE).toBe('storage');
    expect(PERMISSION_TYPES.NOTIFICATIONS).toBe('notifications');
  });

  test('validates metadata exists with titles and descriptions for each permission', () => {
    expect(PERMISSION_METADATA.length).toBe(6);
    PERMISSION_METADATA.forEach((meta) => {
      expect(meta.id).toBeDefined();
      expect(meta.title).toBeDefined();
      expect(meta.subtitle).toBeDefined();
      expect(meta.icon).toBeDefined();
    });
  });

  test('defaults essential playback permissions to granted initially', () => {
    const defaults = getSavedPermissions();
    expect(defaults[PERMISSION_TYPES.BACKGROUND]).toBe(PERMISSION_STATUS.GRANTED);
    expect(defaults[PERMISSION_TYPES.BATTERY]).toBe(PERMISSION_STATUS.GRANTED);
    expect(defaults[PERMISSION_TYPES.HEADPHONES]).toBe(PERMISSION_STATUS.GRANTED);
    expect(defaults[PERMISSION_TYPES.STORAGE]).toBe(PERMISSION_STATUS.GRANTED);
    expect(defaults[PERMISSION_TYPES.MICROPHONE]).toBe(PERMISSION_STATUS.PROMPT);
  });

  test('properly saves and retrieves updated permission states', () => {
    const custom = {
      [PERMISSION_TYPES.BACKGROUND]: PERMISSION_STATUS.GRANTED,
      [PERMISSION_TYPES.BATTERY]: PERMISSION_STATUS.GRANTED,
      [PERMISSION_TYPES.HEADPHONES]: PERMISSION_STATUS.GRANTED,
      [PERMISSION_TYPES.MICROPHONE]: PERMISSION_STATUS.GRANTED,
      [PERMISSION_TYPES.STORAGE]: PERMISSION_STATUS.GRANTED,
      [PERMISSION_TYPES.NOTIFICATIONS]: PERMISSION_STATUS.DENIED,
    };

    savePermissions(custom);
    const retrieved = getSavedPermissions();
    expect(retrieved[PERMISSION_TYPES.MICROPHONE]).toBe(PERMISSION_STATUS.GRANTED);
    expect(retrieved[PERMISSION_TYPES.NOTIFICATIONS]).toBe(PERMISSION_STATUS.DENIED);
  });

  test('tracks first-time permission setup completion state accurately', () => {
    expect(hasCompletedPermissionSetup()).toBe(false);
    markPermissionSetupCompleted(true);
    expect(hasCompletedPermissionSetup()).toBe(true);
    markPermissionSetupCompleted(false);
    expect(hasCompletedPermissionSetup()).toBe(false);
  });
});
