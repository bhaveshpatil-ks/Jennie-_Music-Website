import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, Sparkles, User, Music2, Shield, LogOut, Mail, CheckCircle2, Trash2, Sliders, HelpCircle } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useAuthStore } from '../../store/useAuthStore';
import { UserProfileDrawer } from './UserProfileDrawer';
import { isStandaloneApp } from '../../services/nativeBridge';

export const TopHeader = () => {
  const activeView = useLibraryStore((state) => state.activeView);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const searchQuery = useLibraryStore((state) => state.searchQuery);
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);

  const { user, profile, openAuthModal } = useAuthStore();
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    setIsApp(isStandaloneApp());
  }, []);

  const handleSearchFocus = () => {
    if (activeView !== 'search') {
      setActiveView('search');
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'home': return 'Home';
      case 'search': return 'Search';
      case 'library': return 'Your Library';
      case 'favorites': return 'Liked Songs';
      case 'download': return 'Download App';
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms & Conditions';
      case 'cookies': return 'Cookie Policy';
      case 'refund': return 'Refund Policy';
      case 'business': return 'Business Details';
      case 'feedback': return 'Help & Feedback';
      default: return 'Jennie Music';
    }
  };

  const displayName = profile?.username || user?.displayName || user?.email?.split('@')[0] || 'Bhavesh';
  const initial = (displayName.charAt(0) || 'B').toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-8 py-3 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Mobile Profile Avatar & Branding */}
      <div className="flex md:hidden items-center gap-2.5">
        <button
          type="button"
          onClick={() => setIsProfileDrawerOpen(true)}
          aria-label="Open profile menu"
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 text-white font-bold text-sm flex items-center justify-center shadow-md border border-white/20 hover:scale-105 active:scale-95 transition-transform"
          title="Account & Profile"
        >
          {initial}
        </button>
        <div 
          onClick={() => setActiveView('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveView('home'); }}
          className="flex items-center gap-1.5 cursor-pointer focus-visible:outline-none"
          aria-label="Jennie Music Home"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center shadow-md">
            <Music2 size={14} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-base font-bold tracking-tight text-white font-serif">Jennie</span>
        </div>
      </div>

      {/* Desktop Navigation History Controls */}
      <div className="hidden md:flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            try {
              if (window.history.length > 1) window.history.back();
              else useLibraryStore.getState().setActiveView('home');
            } catch (_) {
              useLibraryStore.getState().setActiveView('home');
            }
          }}
          aria-label="Go back in browsing history"
          className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title="Go Back"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              window.history.forward();
            } catch (_) {}
          }}
          aria-label="Go forward in browsing history"
          className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-[#222222] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title="Go Forward"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Global Search Input (Desktop Only - Search Page has its own on mobile) */}
      <div className="hidden md:block relative flex-grow max-w-md mx-4">
        <div className="relative flex items-center">
          <label htmlFor="global-search-input" className="sr-only">
            Search songs, artists, or genres
          </label>
          <Search size={15} className="absolute left-3.5 text-neutral-400 pointer-events-none" aria-hidden="true" />
          <input
            id="global-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            placeholder="Search royalty-free songs, artists, or genres..."
            className="w-full pl-10 pr-10 py-2 bg-[#161616] hover:bg-[#1E1E1E] focus:bg-[#202020] rounded-full text-xs md:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all shadow-inner border border-white/5"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search input"
              className="absolute right-3 text-xs text-neutral-400 hover:text-white bg-white/10 w-4 h-4 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right User Badge & Auth State */}
      <div className="flex items-center gap-2.5">
        {currentTrack && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={`Open now playing for ${currentTrack.title}`}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium max-w-[130px] truncate transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/5"
            title="Now Playing"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'}`} aria-hidden="true" />
            <span className="truncate text-[11px] font-semibold">{currentTrack.title}</span>
          </button>
        )}

        {!isApp && (
          <a
            href="/download"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Jennie App for Android and Windows (opens in a new page)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-95 border ${
              activeView === 'download'
                ? 'bg-white text-black border-white shadow-sm font-bold'
                : 'bg-[#181818] hover:bg-[#222225] text-neutral-200 hover:text-white border-white/10 hover:border-white/20'
            }`}
            title="Download Jennie App for Android and Windows (opens in a new page)"
          >
            <Download size={13} className={activeView === 'download' ? 'text-black' : 'text-neutral-300'} aria-hidden="true" />
            <span>Download App</span>
          </a>
        )}

        {/* User Auth Section (Desktop only - mobile uses dedicated bottom nav) */}
        {!user ? (
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 active:scale-95"
            >
              <User size={13} className="stroke-[2.5]" />
              <span>Create Account</span>
            </button>
          </div>
        ) : (
          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => setIsProfileDrawerOpen(true)}
              aria-label="User Account Menu"
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#181818] hover:bg-[#222222] border border-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              title="Open Account Menu"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 text-white font-bold text-xs flex items-center justify-center border border-zinc-600 shadow-sm">
                {initial}
              </div>
              <span className="text-xs font-medium text-white max-w-[90px] truncate hidden sm:inline">
                {displayName}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile Side Drawer from Sketch 3 */}
      <UserProfileDrawer 
        isOpen={isProfileDrawerOpen} 
        onClose={() => setIsProfileDrawerOpen(false)} 
      />
    </header>
  );
};

