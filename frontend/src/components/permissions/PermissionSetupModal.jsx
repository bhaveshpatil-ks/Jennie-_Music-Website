import React, { useState } from 'react';
import {
  Radio,
  BatteryCharging,
  Bell,
  Headphones,
  HardDrive,
  Mic,
  Check,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { usePermissionStore } from '../../store/usePermissionStore';
import { PERMISSION_TYPES, PERMISSION_STATUS } from '../../services/permissionService';

export const PermissionSetupModal = ({ isOpen, onClose }) => {
  const isRequesting = usePermissionStore((state) => state.isRequesting);
  const permissions = usePermissionStore((state) => state.permissions);
  const completeOnboarding = usePermissionStore((state) => state.completeOnboarding);
  const dismissModal = usePermissionStore((state) => state.dismissModal);
  const updatePermission = usePermissionStore((state) => state.updatePermission);
  const requestBackground = usePermissionStore((state) => state.requestBackground);
  const requestBattery = usePermissionStore((state) => state.requestBattery);
  const requestNotifications = usePermissionStore((state) => state.requestNotifications);
  const requestHeadphones = usePermissionStore((state) => state.requestHeadphones);
  const requestStorage = usePermissionStore((state) => state.requestStorage);
  const requestMic = usePermissionStore((state) => state.requestMic);

  // Local card state
  const [activeMap, setActiveMap] = useState({
    [PERMISSION_TYPES.BACKGROUND]: true,
    [PERMISSION_TYPES.BATTERY]: true,
    [PERMISSION_TYPES.NOTIFICATIONS]: true,
    [PERMISSION_TYPES.HEADPHONES]: true,
    [PERMISSION_TYPES.STORAGE]: true,
    [PERMISSION_TYPES.MICROPHONE]: false,
  });

  if (!isOpen) return null;

  const permissionCards = [
    {
      id: PERMISSION_TYPES.BACKGROUND,
      title: 'Background & Offscreen Playback',
      badge: 'Core Audio',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Keep music playing seamlessly when your phone screen turns off, when the app is minimized, or while using other apps.',
      icon: Radio,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      onRequest: async () => {
        await requestBackground();
        setActiveMap((prev) => ({ ...prev, [PERMISSION_TYPES.BACKGROUND]: true }));
      },
    },
    {
      id: PERMISSION_TYPES.BATTERY,
      title: 'Battery Saver Exemption',
      badge: 'Keep Alive',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Prevents Android OS power saving from sleeping or killing the playback service during long background listening sessions.',
      icon: BatteryCharging,
      iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      onRequest: async () => {
        await requestBattery();
        setActiveMap((prev) => ({ ...prev, [PERMISSION_TYPES.BATTERY]: true }));
      },
    },
    {
      id: PERMISSION_TYPES.NOTIFICATIONS,
      title: 'Lock Screen & Media Controls',
      badge: 'Lockscreen',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Displays song details, high-res artwork, and quick play, pause, and skip controls in your phone notification drawer.',
      icon: Bell,
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      onRequest: async () => {
        const res = await requestNotifications();
        setActiveMap((prev) => ({ ...prev, [PERMISSION_TYPES.NOTIFICATIONS]: res === PERMISSION_STATUS.GRANTED }));
      },
    },
    {
      id: PERMISSION_TYPES.HEADPHONES,
      title: 'Headphones & Bluetooth Hardware',
      badge: 'Hardware',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      description: 'Supports earbud touch gestures, car steering wheel buttons, and automatic pause when headphones disconnect.',
      icon: Headphones,
      iconBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      onRequest: async () => {
        await requestHeadphones();
        setActiveMap((prev) => ({ ...prev, [PERMISSION_TYPES.HEADPHONES]: true }));
      },
    },
    {
      id: PERMISSION_TYPES.STORAGE,
      title: 'Offline Storage & Audio Cache',
      badge: 'Instant Play',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Caches song streams, album artwork, and synced lyrics locally for high-speed playback with zero buffering.',
      icon: HardDrive,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      onRequest: async () => {
        await requestStorage();
        setActiveMap((prev) => ({ ...prev, [PERMISSION_TYPES.STORAGE]: true }));
      },
    },
    {
      id: PERMISSION_TYPES.MICROPHONE,
      title: 'Microphone & Voice Search',
      badge: 'Voice',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'Hands-free voice search, hum-to-find music discovery, and live karaoke lyrics synchronization.',
      icon: Mic,
      iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      onRequest: async () => {
        const res = await requestMic();
        setActiveMap((prev) => ({ ...prev, [PERMISSION_TYPES.MICROPHONE]: res === PERMISSION_STATUS.GRANTED }));
      },
    },
  ];

  const toggleCard = (id) => {
    setActiveMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAllowAll = async () => {
    const all = {
      [PERMISSION_TYPES.BACKGROUND]: true,
      [PERMISSION_TYPES.BATTERY]: true,
      [PERMISSION_TYPES.NOTIFICATIONS]: true,
      [PERMISSION_TYPES.HEADPHONES]: true,
      [PERMISSION_TYPES.STORAGE]: true,
      [PERMISSION_TYPES.MICROPHONE]: true,
    };
    await completeOnboarding(all);
    if (onClose) onClose();
  };

  const handleContinueSelected = async () => {
    await completeOnboarding(activeMap);
    if (onClose) onClose();
  };

  const handleSkip = () => {
    dismissModal();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-[#0f0f11] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-modal-title"
      >
        {/* Dismiss Button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition"
          aria-label="Skip permission setup"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-4 sm:mb-5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 text-xs font-semibold mb-2.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>App Permissions & Background Audio</span>
          </div>
          <h2 id="permission-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            App Permissions
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1 leading-relaxed">
            Configure standalone permissions for background music playback, lock screen controls, and hardware integrations.
          </p>
        </div>

        {/* Individual Permission Cards List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 mb-5 custom-scrollbar">
          {permissionCards.map((card) => {
            const IconComponent = card.icon;
            const isEnabled = activeMap[card.id];
            const isStoreGranted = permissions[card.id] === PERMISSION_STATUS.GRANTED;

            return (
              <div
                key={card.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isEnabled
                    ? 'bg-white/[0.04] border-white/15 shadow-sm'
                    : 'bg-white/[0.015] border-white/5 opacity-75'
                }`}
              >
                {/* Left Content */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${card.iconBg}`}>
                    <IconComponent size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm sm:text-base">
                        {card.title}
                      </span>
                      <span className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                        {card.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Right Action Button & Status Pill */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5 flex-shrink-0">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isEnabled
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-neutral-400 border border-white/10'
                  }`}>
                    {isEnabled ? (
                      <>
                        <Check size={12} />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <span>Disabled</span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      if (!isEnabled) {
                        card.onRequest();
                      } else {
                        toggleCard(card.id);
                      }
                    }}
                    className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 ${
                      isEnabled
                        ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                        : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    {isEnabled ? 'Turn Off' : 'Allow Access'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons & Footer */}
        <div className="space-y-3 pt-3 border-t border-white/10 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleAllowAll}
              disabled={isRequesting}
              className="flex-1 bg-white hover:bg-neutral-200 text-black font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 text-sm shadow-lg shadow-white/10"
            >
              <CheckCircle2 size={18} />
              <span>Allow All & Continue</span>
            </button>
            <button
              onClick={handleContinueSelected}
              disabled={isRequesting}
              className="bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold py-3 px-5 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.98] disabled:opacity-50 border border-white/10 text-sm"
            >
              <span>Save & Continue</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-0.5">
            <span>Permissions can be modified anytime in Settings</span>
            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-white transition font-medium"
            >
              Skip Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionSetupModal;
