import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Check,
  Sliders,
  Trash2,
  LogOut,
  Database,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  FileText,
  Code2,
  HeartHandshake,
  BookOpen,
  Info,
  AlertTriangle,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { PermissionSettingsSection } from './PermissionSettingsSection';

export function SpotifySettings({ onClose, onOpenCookieSettings }) {
  const {
    user,
    profile,
    signOutUser,
    updateProfileDetails,
    deleteAccountPermanently,
    authActionLoading,
    error,
    clearAuthNotice,
  } = useAuthStore();

  const {
    audioQuality,
    setAudioQuality,
    autoplay,
    toggleAutoplay,
    crossfade,
    setCrossfade,
    normalizeVolume,
    toggleNormalizeVolume,
    monoAudio,
    toggleMonoAudio,
    backgroundPlayback,
    toggleBackgroundPlayback,
    youtubeNewReleasesSync,
    toggleYoutubeNewReleasesSync,
    cacheSize,
    clearAppCache,
  } = useSettingsStore();

  const setActiveView = useLibraryStore((state) => state.setActiveView);

  // Search filter for settings (Sketch 2 & 4: "search for settings")
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications state (Sketch 2 & 4)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [playbackNotifications, setPlaybackNotifications] = useState(true);

  // Profile editable fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(
    profile?.username || user?.displayName || 'Bhavesh Patil'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cacheClearedNotice, setCacheClearedNotice] = useState(false);

  // Permanent Delete Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  // About & Support Modals (Sketch 2 & 4)
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAppDetailsModal, setShowAppDetailsModal] = useState(false);
  const [showDevDetailsModal, setShowDevDetailsModal] = useState(false);

  const matches = (keywords) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return keywords.toLowerCase().includes(q);
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!editUsername.trim()) return;

    const ok = await updateProfileDetails({
      username: editUsername.trim(),
    });

    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      setIsEditingProfile(false);
    }
  };

  const handleClearCache = () => {
    clearAppCache();
    setCacheClearedNotice(true);
    setTimeout(() => setCacheClearedNotice(false), 3000);
  };

  const handleDeletePermanent = async () => {
    if (!confirmCheckbox) return;
    const ok = await deleteAccountPermanently();
    if (ok) {
      if (onClose) onClose();
      setActiveView('home');
    }
  };

  const currentUsername = profile?.username || user?.displayName || 'Bhavesh Patil';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 text-neutral-200">
      {/* ────────────────────────────────────────────────────────────
          PAGE HEADER WITH BACK ARROW (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              else {
                try {
                  if (window.history.length > 1) window.history.back();
                  else setActiveView('home');
                } catch (_) {
                  setActiveView('home');
                }
              }
            }}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
            aria-label="Back"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-xs text-neutral-400 mt-0.5 hidden sm:block">
              Manage account, notifications, audio quality, and support
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────
          SEARCH BAR (Sketch 2 & 4: "search for settings")
         ──────────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="search for settings"
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-[#161618] border border-white/10 text-white placeholder:text-neutral-500 text-sm focus:outline-none focus:border-white/30 transition-colors shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Alerts */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-luxury-fade">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Username updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2 animate-luxury-fade">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          {clearAuthNotice && (
            <button onClick={clearAuthNotice} className="text-xs hover:underline">
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          CATEGORY 1: ACCOUNT (Sketch 2 & 4: username, close account)
         ──────────────────────────────────────────────────────────── */}
      {matches('account username close user name profile') && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Account
          </h2>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-4">
            {/* Username Row */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 text-white font-bold flex items-center justify-center text-sm shadow">
                  {(currentUsername.charAt(0) || 'B').toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-neutral-400 font-medium">Username</p>
                  <p className="text-sm font-semibold text-white">{currentUsername}</p>
                  <p className="text-[11px] text-neutral-500">{user?.email || 'Active Listener'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Username'}
              </button>
            </div>

            {/* Inline Username Form */}
            {isEditingProfile && (
              <form
                onSubmit={handleSaveProfile}
                className="pt-3 border-t border-zinc-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Enter username"
                  className="flex-grow px-3 py-2 rounded-xl bg-black/60 border border-zinc-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={authActionLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow"
                >
                  Save
                </button>
              </form>
            )}

            <div className="h-px bg-zinc-800/80" />

            {/* Close Account Row (Sketch 2 & 4) */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Close account</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Permanently erase your credentials, history, and stored data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors shrink-0"
              >
                Close account
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          CATEGORY 2: NOTIFICATIONS (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      {matches('notification push alert playback') && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Notifications
          </h2>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Push Notifications</p>
                  <p className="text-xs text-neutral-400">
                    Receive alerts when new playlists, releases, or trending tracks drop.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  notificationsEnabled ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    notificationsEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-zinc-800/80" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Playback Status Banner</p>
                <p className="text-xs text-neutral-400">
                  Notify of song progress, queue transitions, and background audio updates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPlaybackNotifications(!playbackNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  playbackNotifications ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    playbackNotifications
                      ? 'translate-x-5 bg-black'
                      : 'translate-x-0 bg-neutral-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          CATEGORY 3: SUPPORT AND REPORT (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      {matches('support report privacy terms problem problems rules guidelines') && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Support and report
          </h2>
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md divide-y divide-zinc-800/80 overflow-hidden">
            {/* Privacy policy (Sketch 2 & 4) */}
            <div
              onClick={() => {
                if (onClose) onClose();
                setActiveView('privacy');
              }}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Privacy policy</p>
                  <p className="text-xs text-neutral-400">
                    DPDP Act 2023 statutory privacy and encryption rules
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>

            {/* Terms and condition (Sketch 2 & 4) */}
            <div
              onClick={() => {
                if (onClose) onClose();
                setActiveView('terms');
              }}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-zinc-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Terms and condition</p>
                  <p className="text-xs text-neutral-400">
                    Platform license terms, user rights, and service agreements
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>

            {/* Report for problems (Sketch 2 & 4) */}
            <div
              onClick={() => {
                if (onClose) onClose();
                setActiveView('feedback');
              }}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Report for problems</p>
                  <p className="text-xs text-neutral-400">
                    Report playback buffering, missing audio, or app defects with tracking
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>

            {/* Support (Sketch 2 & 4) */}
            <div
              onClick={() => setShowSupportModal(true)}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <HeartHandshake className="w-5 h-5 text-teal-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Support</p>
                  <p className="text-xs text-neutral-400">
                    Contact developer assistance, customer care, and help desk
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>

            {/* Platform rules (Sketch 2 & 4) */}
            <div
              onClick={() => setShowRulesModal(true)}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Platform rules</p>
                  <p className="text-xs text-neutral-400">
                    Community standards, fair playback, and terms of respect
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          CATEGORY 4: ABOUT (Sketch 2 & 4: App details, developer details, version)
         ──────────────────────────────────────────────────────────── */}
      {matches('about developer version app details') && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            About
          </h2>
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md divide-y divide-zinc-800/80 overflow-hidden">
            {/* App details (Sketch 2 & 4) */}
            <div
              onClick={() => setShowAppDetailsModal(true)}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-zinc-300" />
                <div>
                  <p className="text-sm font-semibold text-white">App details</p>
                  <p className="text-xs text-neutral-400">
                    Jennie Music • Luxury audio streaming web application
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>

            {/* Developer details (Sketch 2 & 4) */}
            <div
              onClick={() => setShowDevDetailsModal(true)}
              role="button"
              tabIndex={0}
              className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Developer details</p>
                  <p className="text-xs text-neutral-400">
                    Designed &amp; Developed by Bhavesh Patil
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </div>

            {/* Version (Sketch 2 & 4) */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Version</p>
                  <p className="text-xs text-neutral-400">Production Build</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                v1.1.0 (Latest Release)
              </span>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          SECTION: AUDIO FIDELITY & STREAMING QUALITY
         ──────────────────────────────────────────────────────────── */}
      {matches('audio quality sound bitrate crossfade autoplay') && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Audio Quality &amp; Playback
          </h2>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Streaming Audio Quality</h3>
                <p className="text-xs text-neutral-400 mt-0.5">High bitrate studio delivery</p>
              </div>
              <select
                value={audioQuality}
                onChange={(e) => setAudioQuality(e.target.value)}
                className="bg-black/80 text-white text-xs px-3 py-2 rounded-xl border border-zinc-700 focus:outline-none"
              >
                <option value="auto">Auto (Adaptive)</option>
                <option value="low">Low (96 kbps)</option>
                <option value="normal">Normal (160 kbps)</option>
                <option value="high">High (256 kbps)</option>
                <option value="very_high">Very High (320 kbps Lossless)</option>
              </select>
            </div>

            <div className="h-px bg-zinc-800/80" />

            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Autoplay Next Similar Track</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Keep the music going after your queue ends
                </p>
              </div>
              <button
                type="button"
                onClick={toggleAutoplay}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  autoplay ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    autoplay ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-zinc-800/80" />

            {/* Crossfade */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Crossfade Songs</span>
                <span className="font-mono text-emerald-400 font-bold">{crossfade}s</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={crossfade}
                onChange={(e) => setCrossfade(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>

            <div className="h-px bg-zinc-800/80" />

            {/* Normalize Volume */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Normalize Volume</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Set the same volume level for all tracks
                </p>
              </div>
              <button
                type="button"
                onClick={toggleNormalizeVolume}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  normalizeVolume ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    normalizeVolume ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-zinc-800/80" />

            {/* Mono Audio */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Mono Audio</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Combine left and right audio channels
                </p>
              </div>
              <button
                type="button"
                onClick={toggleMonoAudio}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  monoAudio ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    monoAudio ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-zinc-800/80" />

            {/* Background & Offscreen Playback */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Background &amp; Offscreen Playback</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Keep music streaming when the app is minimized, switching apps, or screen is turned off
                </p>
              </div>
              <button
                type="button"
                onClick={toggleBackgroundPlayback}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  backgroundPlayback !== false ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    backgroundPlayback !== false ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            <div className="h-px bg-zinc-800/80" />

            {/* YouTube New Releases Sync */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white">YouTube New Releases Auto-Sync</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Automatically refresh trending 2024-2025 chartbusters and viral tracks
                </p>
              </div>
              <button
                type="button"
                onClick={toggleYoutubeNewReleasesSync}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  youtubeNewReleasesSync !== false ? 'bg-emerald-500' : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    youtubeNewReleasesSync !== false ? 'translate-x-5 bg-black' : 'translate-x-0 bg-neutral-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          SECTION: APP PERMISSIONS & HARDWARE ACCESS
         ──────────────────────────────────────────────────────────── */}
      {matches('permission permissions hardware audio storage mic headphone') && (
        <PermissionSettingsSection />
      )}

      {/* ────────────────────────────────────────────────────────────
          SECTION: STORAGE & CACHE
         ──────────────────────────────────────────────────────────── */}
      {matches('storage cache buffer clear') && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1">
            Storage &amp; Cache
          </h2>
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-zinc-400" />
                  <span>Cached Data &amp; Audio Buffer</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Clearing cache frees space without deleting playlists or liked tracks.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-300 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
                {cacheSize}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-neutral-500">Fast local storage buffer</span>
              <button
                type="button"
                onClick={handleClearCache}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-colors"
              >
                Clear Cache
              </button>
            </div>

            {cacheClearedNotice && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                <Check className="w-3.5 h-3.5" /> Cache buffer cleaned successfully.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────
          LOG OUT BUTTON (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      {matches('log out logout sign out signout') && (
        <div className="pt-2">
          <button
            type="button"
            onClick={async () => {
              await signOutUser();
              if (onClose) onClose();
              setActiveView('home');
            }}
            className="w-full py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 font-bold text-sm border border-zinc-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL: SUPPORT (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <HeartHandshake className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold">Jennie Support &amp; Help Desk</h3>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              We provide round-the-clock developer support for Jennie Music listeners. Reach out for
              any playback assistance or queries.
            </p>
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 space-y-2 text-xs">
              <p>
                <strong className="text-white">Lead Engineer:</strong> Bhavesh Patil
              </p>
              <p>
                <strong className="text-white">Email:</strong> bhaveshpatil4251@gmail.com
              </p>
              <p>
                <strong className="text-white">Response Time:</strong> Within 24-48 hours
              </p>
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL: PLATFORM RULES (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold">Platform Rules</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-neutral-300">
              <p>
                1. <strong className="text-white">Respectful Listening:</strong> Enjoy music
                responsibly without abusive streaming bots or automated scrobble scraping.
              </p>
              <p>
                2. <strong className="text-white">Artist Integrity:</strong> All audio playback
                utilizes licensed YouTube IFrame embeds honoring content creators and rights
                holders.
              </p>
              <p>
                3. <strong className="text-white">Zero Exploits:</strong> Reverse-engineering
                playback streams or tampering with player restrictions is strictly prohibited.
              </p>
            </div>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL: APP DETAILS (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      {showAppDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-zinc-300" />
                <h3 className="text-base font-bold">App Details</h3>
              </div>
              <button
                onClick={() => setShowAppDetailsModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-neutral-300">
              <p>
                <strong className="text-white">Application Name:</strong> Jennie Music
              </p>
              <p>
                <strong className="text-white">Audio Engine:</strong> YouTube IFrame Embed &amp;
                Lossless HTML5 Media Engine
              </p>
              <p>
                <strong className="text-white">Fidelity:</strong> Up to 320 kbps High Definition
              </p>
              <p>
                <strong className="text-white">Platform Target:</strong> Responsive Web &amp;
                Windows Desktop Client
              </p>
            </div>
            <button
              onClick={() => setShowAppDetailsModal(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          MODAL: DEVELOPER DETAILS (Sketch 2 & 4)
         ──────────────────────────────────────────────────────────── */}
      {showDevDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Code2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Developer Details</h3>
              </div>
              <button
                onClick={() => setShowDevDetailsModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-neutral-300">
              <p>
                <strong className="text-white">Lead Developer:</strong> Bhavesh Patil
              </p>
              <p>
                <strong className="text-white">Email:</strong> bhaveshpatil4251@gmail.com
              </p>
              <p>
                <strong className="text-white">Project:</strong> Jennie Music Streaming Web App
              </p>
              <p>
                <strong className="text-white">Architecture:</strong> React, Vite, Tailwind CSS,
                Zustand, Firebase &amp; MongoDB
              </p>
            </div>
            <button
              onClick={() => setShowDevDetailsModal(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────
          DELETE ACCOUNT CONFIRMATION MODAL
         ──────────────────────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-red-500/30 shadow-2xl space-y-4 text-center animate-luxury-fade">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Permanently Close Account?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Under Section 12 of India&apos;s{' '}
                <strong className="text-white">DPDP Act, 2023</strong> (Right to Erasure), all your
                account data, credentials, and encrypted records will be deleted immediately.
              </p>
            </div>

            <label className="flex items-start gap-2.5 text-left cursor-pointer p-2.5 rounded-lg bg-black/40 border border-white/5">
              <input
                type="checkbox"
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                className="mt-0.5 accent-red-500 rounded"
              />
              <span className="text-xs text-neutral-300">
                I understand this deletion is permanent and cannot be reversed.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmCheckbox(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmCheckbox || authActionLoading}
                onClick={handleDeletePermanent}
                className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpotifySettings;
