import React, { useState } from 'react';
import {
  Headphones,
  Mic,
  HardDrive,
  Bell,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { usePermissionStore } from '../../store/usePermissionStore';
import { PERMISSION_TYPES, PERMISSION_STATUS } from '../../services/permissionService';

export const PermissionSettingsSection = () => {
  const permissions = usePermissionStore((state) => state.permissions);
  const isRequesting = usePermissionStore((state) => state.isRequesting);
  const requestMic = usePermissionStore((state) => state.requestMic);
  const requestNotifications = usePermissionStore((state) => state.requestNotifications);
  const requestStorage = usePermissionStore((state) => state.requestStorage);
  const requestHeadphones = usePermissionStore((state) => state.requestHeadphones);
  const updatePermission = usePermissionStore((state) => state.updatePermission);
  const openSetupModal = usePermissionStore((state) => state.openSetupModal);

  const [feedbackMsg, setFeedbackMsg] = useState('');

  const triggerNotify = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const getStatusBadge = (status) => {
    if (status === PERMISSION_STATUS.GRANTED) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} />
          <span>Allowed</span>
        </span>
      );
    }
    if (status === PERMISSION_STATUS.DENIED) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
          <XCircle size={12} />
          <span>Blocked</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 border border-white/10">
        <AlertCircle size={12} />
        <span>Not Set</span>
      </span>
    );
  };

  const handleToggleMic = async () => {
    if (permissions[PERMISSION_TYPES.MICROPHONE] === PERMISSION_STATUS.GRANTED) {
      updatePermission(PERMISSION_TYPES.MICROPHONE, PERMISSION_STATUS.PROMPT);
      triggerNotify('Microphone access paused for voice search.');
    } else {
      const res = await requestMic();
      triggerNotify(res === PERMISSION_STATUS.GRANTED ? 'Microphone permission granted!' : 'Microphone permission not granted.');
    }
  };

  const handleToggleNotifications = async () => {
    if (permissions[PERMISSION_TYPES.NOTIFICATIONS] === PERMISSION_STATUS.GRANTED) {
      updatePermission(PERMISSION_TYPES.NOTIFICATIONS, PERMISSION_STATUS.PROMPT);
      triggerNotify('Notifications turned off.');
    } else {
      const res = await requestNotifications();
      triggerNotify(res === PERMISSION_STATUS.GRANTED ? 'Notifications allowed!' : 'Notifications permission not granted.');
    }
  };

  const handleToggleStorage = async () => {
    await requestStorage();
    triggerNotify('Storage offline quota refreshed.');
  };

  const handleToggleHeadphones = async () => {
    await requestHeadphones();
    triggerNotify('Headphone hardware routing verified.');
  };

  return (
    <section className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>Device Permissions & Hardware</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-0.5">
            Manage device hardware integrations, voice features, and local offline storage permissions.
          </p>
        </div>

        <button
          onClick={openSetupModal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 text-xs font-medium transition border border-white/10 flex-shrink-0"
        >
          <RotateCcw size={13} />
          <span>Launch Setup Wizard</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-white/[0.04] border border-white/10 text-neutral-200 text-xs rounded-xl animate-fadeIn">
          {feedbackMsg}
        </div>
      )}

      {/* Permission Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Headphones & Audio */}
        <div className="p-4 rounded-xl bg-neutral-950/40 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-neutral-300 flex items-center justify-center flex-shrink-0">
                <Headphones size={18} />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Headphones & Bluetooth</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Media keys, remote volume, background playback</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.HEADPHONES])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">Hardware Session</span>
            <button
              onClick={handleToggleHeadphones}
              disabled={isRequesting}
              className="text-xs font-medium text-neutral-300 hover:text-white transition"
            >
              Verify Connection
            </button>
          </div>
        </div>

        {/* 2. Microphone */}
        <div className="p-4 rounded-xl bg-neutral-950/40 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-neutral-300 flex items-center justify-center flex-shrink-0">
                <Mic size={18} />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Microphone & Voice</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Voice song search, hum-to-find, lyrics sync</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.MICROPHONE])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">Audio Input Stream</span>
            <button
              onClick={handleToggleMic}
              disabled={isRequesting}
              className="text-xs font-medium text-neutral-300 hover:text-white transition"
            >
              {permissions[PERMISSION_TYPES.MICROPHONE] === PERMISSION_STATUS.GRANTED ? 'Revoke Access' : 'Allow Access'}
            </button>
          </div>
        </div>

        {/* 3. Storage */}
        <div className="p-4 rounded-xl bg-neutral-950/40 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-neutral-300 flex items-center justify-center flex-shrink-0">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Storage & Offline Cache</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Offline album cache, cached tracks, audio buffer</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.STORAGE])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">Persistent Quota</span>
            <button
              onClick={handleToggleStorage}
              disabled={isRequesting}
              className="text-xs font-medium text-neutral-300 hover:text-white transition"
            >
              Check Quota
            </button>
          </div>
        </div>

        {/* 4. Notifications */}
        <div className="p-4 rounded-xl bg-neutral-950/40 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 text-neutral-300 flex items-center justify-center flex-shrink-0">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-medium text-white text-sm">Notifications & Alerts</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Lockscreen player, song releases, status updates</p>
              </div>
            </div>
            {getStatusBadge(permissions[PERMISSION_TYPES.NOTIFICATIONS])}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
            <span className="text-xs text-neutral-500">System Notification API</span>
            <button
              onClick={handleToggleNotifications}
              disabled={isRequesting}
              className="text-xs font-medium text-neutral-300 hover:text-white transition"
            >
              {permissions[PERMISSION_TYPES.NOTIFICATIONS] === PERMISSION_STATUS.GRANTED ? 'Turn Off' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PermissionSettingsSection;
