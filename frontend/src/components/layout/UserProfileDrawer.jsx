import React from 'react';
import {
  X,
  UserPlus,
  Settings as SettingsIcon,
  User,
  Shield,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLibraryStore } from '../../store/useLibraryStore';

export const UserProfileDrawer = ({ isOpen, onClose }) => {
  const { user, profile, signOutUser, openAuthModal } = useAuthStore();
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  if (!isOpen) return null;

  // Derive initial from user display name or email (e.g. "B" for Bhavesh)
  const displayName = profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Bhavesh';
  const initial = (displayName[0] || 'B').toUpperCase();
  const email = user?.email || 'bhaveshpatil4251@gmail.com';

  const handleNavigateSettings = () => {
    setActiveView('settings');
    onClose();
  };

  const handleOpenProfileEdit = () => {
    setActiveView('settings');
    onClose();
  };

  const handleAddAccount = () => {
    openAuthModal();
    onClose();
  };

  const handleSignOut = async () => {
    await signOutUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="relative z-10 w-full max-w-sm bg-[#0f0f11] border-r border-neutral-800 text-white flex flex-col justify-between shadow-2xl animate-luxury-slide-right p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="User Profile Drawer"
      >
        <div>
          {/* Header & Close */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-800/80">
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">
              Account Overview
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>

          {/* User Avatar Circle with Initial ("B") */}
          <div className="flex items-center gap-4 py-6 border-b border-neutral-800/80">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl flex-shrink-0 border-2 border-white/20">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white truncate">{displayName}</h2>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{email}</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-400 text-[10px] font-semibold">
                <Sparkles size={10} />
                <span>Jennie Member</span>
              </span>
            </div>
          </div>

          {/* Options Menu directly matching sketch:
              - + Add account
              - Settings and privacy
              - Profile view and changes */}
          <div className="py-4 space-y-1">
            <button
              onClick={handleAddAccount}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-800/60 transition group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-800/80 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:bg-rose-500/20 group-hover:text-rose-400 transition">
                  <UserPlus size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-neutral-200 group-hover:text-white block">
                    + Add Account
                  </span>
                  <span className="text-xs text-neutral-500 block">Switch or add multiple profiles</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition" />
            </button>

            <button
              onClick={handleNavigateSettings}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-800/60 transition group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-800/80 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:bg-purple-500/20 group-hover:text-purple-400 transition">
                  <SettingsIcon size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-neutral-200 group-hover:text-white block">
                    Settings and Privacy
                  </span>
                  <span className="text-xs text-neutral-500 block">Preferences, audio quality & rules</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition" />
            </button>

            <button
              onClick={handleOpenProfileEdit}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-neutral-800/60 transition group text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-800/80 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:bg-blue-500/20 group-hover:text-blue-400 transition">
                  <User size={18} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-neutral-200 group-hover:text-white block">
                    Profile View &amp; Changes
                  </span>
                  <span className="text-xs text-neutral-500 block">Edit username, gender &amp; birthdate</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition" />
            </button>
          </div>
        </div>

        {/* Footer: Sign Out Button */}
        <div className="pt-4 border-t border-neutral-800/80">
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-red-500/10 hover:text-red-400 text-neutral-300 border border-neutral-800 hover:border-red-500/20 transition flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98]"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDrawer;
