import React, { useState } from 'react';
import {
  Headphones,
  Mic,
  HardDrive,
  Bell,
  Check,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { usePermissionStore } from '../../store/usePermissionStore';
import { PERMISSION_TYPES } from '../../services/permissionService';

export const PermissionSetupModal = ({ isOpen, onClose }) => {
  const isRequesting = usePermissionStore((state) => state.isRequesting);
  const completeOnboarding = usePermissionStore((state) => state.completeOnboarding);
  const dismissModal = usePermissionStore((state) => state.dismissModal);

  // Local state for checkboxes
  const [selected, setSelected] = useState({
    [PERMISSION_TYPES.HEADPHONES]: true,
    [PERMISSION_TYPES.MICROPHONE]: true,
    [PERMISSION_TYPES.STORAGE]: true,
    [PERMISSION_TYPES.NOTIFICATIONS]: true,
  });

  if (!isOpen) return null;

  const toggleItem = (key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAllowAll = async () => {
    const all = {
      [PERMISSION_TYPES.HEADPHONES]: true,
      [PERMISSION_TYPES.MICROPHONE]: true,
      [PERMISSION_TYPES.STORAGE]: true,
      [PERMISSION_TYPES.NOTIFICATIONS]: true,
    };
    await completeOnboarding(all);
    if (onClose) onClose();
  };

  const handleContinueSelected = async () => {
    await completeOnboarding(selected);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    dismissModal();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-[#121214] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl relative flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
      >
        {/* Dismiss Button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition"
          aria-label="Skip permission setup"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 text-xs font-medium mb-3">
            <ShieldCheck size={14} className="text-neutral-400" />
            <span>Device & Permissions</span>
          </div>
          <h2 id="permission-modal-title" className="text-2xl font-bold tracking-tight text-white">
            Set up permissions
          </h2>
          <p className="text-neutral-400 text-sm mt-1.5 leading-relaxed">
            Select the capabilities you want Jennie Music to use for audio hardware, voice features, and offline storage.
          </p>
        </div>

        {/* Permission Checklist */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 mb-6">
          {/* 1. Headphone & Audio Hardware */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.HEADPHONES)}
            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
              selected[PERMISSION_TYPES.HEADPHONES]
                ? 'bg-white/[0.04] border-white/15'
                : 'bg-white/[0.01] border-white/5 opacity-60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Headphones size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-white text-sm">Headphones & Hardware Controls</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/5">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Connects Bluetooth & wired buttons (play, pause, skip) and background audio routing.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.HEADPHONES]}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer pointer-events-none"
            />
          </div>

          {/* 2. Microphone (Voice Search & Lyrics) */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.MICROPHONE)}
            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
              selected[PERMISSION_TYPES.MICROPHONE]
                ? 'bg-white/[0.04] border-white/15'
                : 'bg-white/[0.01] border-white/5 opacity-60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mic size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-white text-sm">Microphone & Voice Search</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/5">
                  Voice
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Enables hands-free song search, voice recognition, and karaoke lyric sync.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.MICROPHONE]}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer pointer-events-none"
            />
          </div>

          {/* 3. Storage & Offline Caching */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.STORAGE)}
            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
              selected[PERMISSION_TYPES.STORAGE]
                ? 'bg-white/[0.04] border-white/15'
                : 'bg-white/[0.01] border-white/5 opacity-60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <HardDrive size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-white text-sm">Storage & Offline Cache</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/5">
                  Offline
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Stores cached audio tracks and metadata for fast offline playback.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.STORAGE]}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer pointer-events-none"
            />
          </div>

          {/* 4. Playback Notifications */}
          <div
            onClick={() => toggleItem(PERMISSION_TYPES.NOTIFICATIONS)}
            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3.5 ${
              selected[PERMISSION_TYPES.NOTIFICATIONS]
                ? 'bg-white/[0.04] border-white/15'
                : 'bg-white/[0.01] border-white/5 opacity-60'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/10 text-neutral-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-white text-sm">Notifications & Lock Screen</span>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-white/[0.06] text-neutral-400 border border-white/5">
                  Optional
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Displays playback controls on lock screen and download completion alerts.
              </p>
            </div>
            <input
              type="checkbox"
              checked={selected[PERMISSION_TYPES.NOTIFICATIONS]}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded accent-emerald-500 cursor-pointer pointer-events-none"
            />
          </div>
        </div>

        {/* Buttons & Footer */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleAllowAll}
              disabled={isRequesting}
              className="flex-1 bg-white hover:bg-neutral-200 text-black font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              <Check size={16} />
              <span>Allow All & Continue</span>
            </button>
            <button
              onClick={handleContinueSelected}
              disabled={isRequesting}
              className="bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 border border-white/10 text-sm"
            >
              <span>Save Selected</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-0.5">
            <span>You can change these anytime in Settings</span>
            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-white transition"
            >
              Setup Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionSetupModal;

