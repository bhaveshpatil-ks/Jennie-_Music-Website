import React, { useState } from 'react';
import {
  Radio,
  BatteryCharging,
  Bell,
  Headphones,
  HardDrive,
  Mic,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { usePermissionStore } from '../../store/usePermissionStore';
import { PERMISSION_TYPES, PERMISSION_STATUS } from '../../services/permissionService';

export const PermissionSettingsSection = () => {
  const permissions = usePermissionStore((state) => state.permissions);
  const isRequesting = usePermissionStore((state) => state.isRequesting);
  const requestBackground = usePermissionStore((state) => state.requestBackground);
  const requestBattery = usePermissionStore((state) => state.requestBattery);
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
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 size={12} />
          <span>Granted</span>
        </span>
      );
    }
    if (status === PERMISSION_STATUS.DENIED) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
          <XCircle size={12} />
          <span>Denied</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 border border-white/10">
        <AlertCircle size={12} />
        <span>Prompt</span>
      </span>
    );
  };

  const handleToggleBackground = async () => {
    await requestBackground();
    triggerNotify('Background & Offscreen audio active.');
  };

  const handleToggleBattery = async () => {
    await requestBattery();
    triggerNotify('Battery optimization exemption refreshed.');
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

  const cards = [
    {
      type: PERMISSION_TYPES.BACKGROUND,
      title: 'Background & Offscreen Playback',
      desc: 'Keeps audio playing when screen locks or app is minimized',
      icon: Radio,
      iconColor: 'text-emerald-400',
      actionText: 'Keep Active',
      handler: handleToggleBackground,
    },
    {
      type: PERMISSION_TYPES.BATTERY,
      title: 'Battery Saver Exemption',
      desc: 'Prevents OS sleep throttling during long background sessions',
      icon: BatteryCharging,
      iconColor: 'text-amber-400',
      actionText: 'Exempt',
      handler: handleToggleBattery,
    },
    {
      type: PERMISSION_TYPES.NOTIFICATIONS,
      title: 'Lock Screen & Notifications',
      desc: 'Lockscreen player controls, artwork, and track status',
      icon: Bell,
      iconColor: 'text-rose-400',
      actionText: permissions[PERMISSION_TYPES.NOTIFICATIONS] === PERMISSION_STATUS.GRANTED ? 'Turn Off' : 'Enable',
      handler: handleToggleNotifications,
    },
    {
      type: PERMISSION_TYPES.HEADPHONES,
      title: 'Headphones & Bluetooth',
      desc: 'Media keys, Bluetooth routing, and earbud click gestures',
      icon: Headphones,
      iconColor: 'text-sky-400',
      actionText: 'Verify Link',
      handler: handleToggleHeadphones,
    },
    {
      type: PERMISSION_TYPES.STORAGE,
      title: 'Storage & Offline Cache',
      desc: 'Instant zero-lag audio caching and local lyrics storage',
      icon: HardDrive,
      iconColor: 'text-purple-400',
      actionText: 'Refresh Quota',
      handler: handleToggleStorage,
    },
    {
      type: PERMISSION_TYPES.MICROPHONE,
      title: 'Microphone & Voice Search',
      desc: 'Voice song lookup, hum recognition, and karaoke lyrics',
      icon: Mic,
      iconColor: 'text-cyan-400',
      actionText: permissions[PERMISSION_TYPES.MICROPHONE] === PERMISSION_STATUS.GRANTED ? 'Revoke' : 'Allow',
      handler: handleToggleMic,
    },
  ];

  return (
    <section className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-6 sm:p-7 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Device Permissions & Background Playback</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Manage individual permissions for background audio, battery optimization, lockscreen controls, and hardware keys.
          </p>
        </div>

        <button
          onClick={openSetupModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-neutral-200 text-xs font-semibold transition border border-white/10 flex-shrink-0"
        >
          <RotateCcw size={14} />
          <span>Launch Setup Wizard</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-white/[0.04] border border-white/10 text-neutral-200 text-xs rounded-xl animate-fadeIn">
          {feedbackMsg}
        </div>
      )}

      {/* Permission Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const status = permissions[card.type];

          return (
            <div
              key={card.type}
              className="p-4 rounded-2xl bg-neutral-950/50 border border-white/5 flex flex-col justify-between space-y-4 hover:border-white/10 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={19} className={card.iconColor} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm leading-snug">{card.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60">
                {getStatusBadge(status)}
                <button
                  onClick={card.handler}
                  disabled={isRequesting}
                  className="text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition"
                >
                  {card.actionText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PermissionSettingsSection;
