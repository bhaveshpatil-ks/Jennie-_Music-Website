import { create } from 'zustand';
import {
  PERMISSION_TYPES,
  PERMISSION_STATUS,
  getSavedPermissions,
  savePermissions,
  hasCompletedPermissionSetup,
  markPermissionSetupCompleted,
  requestBackgroundPlaybackAccess,
  requestBatteryExemptionAccess,
  requestMicrophoneAccess,
  requestNotificationAccess,
  requestStorageAccess,
  requestHeadphoneAccess,
  requestAllPermissions,
} from '../services/permissionService';

export const usePermissionStore = create((set, get) => ({
  permissions: getSavedPermissions(),
  hasCompletedSetup: hasCompletedPermissionSetup(),
  isSetupModalOpen: false,
  isRequesting: false,

  openSetupModal: () => set({ isSetupModalOpen: true }),
  closeSetupModal: () => set({ isSetupModalOpen: false }),

  // Set initial status check
  initPermissions: () => {
    const saved = getSavedPermissions();
    const completed = hasCompletedPermissionSetup();
    set({
      permissions: saved,
      hasCompletedSetup: completed,
      isSetupModalOpen: !completed,
    });
  },

  // Toggle or update a specific permission
  updatePermission: (type, status) => {
    const current = get().permissions;
    const updated = { ...current, [type]: status };
    savePermissions(updated);
    set({ permissions: updated });
  },

  // Request Background Playback
  requestBackground: async () => {
    set({ isRequesting: true });
    try {
      const status = await requestBackgroundPlaybackAccess();
      get().updatePermission(PERMISSION_TYPES.BACKGROUND, status);
      return status;
    } finally {
      set({ isRequesting: false });
    }
  },

  // Request Battery Exemption
  requestBattery: async () => {
    set({ isRequesting: true });
    try {
      const status = await requestBatteryExemptionAccess();
      get().updatePermission(PERMISSION_TYPES.BATTERY, status);
      return status;
    } finally {
      set({ isRequesting: false });
    }
  },

  // Request Microphone permission
  requestMic: async () => {
    set({ isRequesting: true });
    try {
      const status = await requestMicrophoneAccess();
      get().updatePermission(PERMISSION_TYPES.MICROPHONE, status);
      return status;
    } finally {
      set({ isRequesting: false });
    }
  },

  // Request Notification permission
  requestNotifications: async () => {
    set({ isRequesting: true });
    try {
      const status = await requestNotificationAccess();
      get().updatePermission(PERMISSION_TYPES.NOTIFICATIONS, status);
      return status;
    } finally {
      set({ isRequesting: false });
    }
  },

  // Request Storage permission
  requestStorage: async () => {
    set({ isRequesting: true });
    try {
      const status = await requestStorageAccess();
      get().updatePermission(PERMISSION_TYPES.STORAGE, status);
      return status;
    } finally {
      set({ isRequesting: false });
    }
  },

  // Request Headphone permission
  requestHeadphones: async () => {
    set({ isRequesting: true });
    try {
      const status = await requestHeadphoneAccess();
      get().updatePermission(PERMISSION_TYPES.HEADPHONES, status);
      return status;
    } finally {
      set({ isRequesting: false });
    }
  },

  // Bulk request & complete onboarding
  completeOnboarding: async (selectedMap) => {
    set({ isRequesting: true });
    try {
      const updated = await requestAllPermissions(selectedMap);
      markPermissionSetupCompleted(true);
      set({
        permissions: updated,
        hasCompletedSetup: true,
        isSetupModalOpen: false,
      });
      return updated;
    } finally {
      set({ isRequesting: false });
    }
  },

  // Dismiss setup modal without altering current permissions
  dismissModal: () => {
    markPermissionSetupCompleted(true);
    set({ hasCompletedSetup: true, isSetupModalOpen: false });
  },

  // Reset onboarding (allows re-running wizard from settings)
  resetSetup: () => {
    markPermissionSetupCompleted(false);
    set({ hasCompletedSetup: false, isSetupModalOpen: true });
  },
}));
