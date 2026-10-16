import React, { useState } from 'react';
import { Home, Search, Library, Sparkles, Plus, Check, X, Crown } from 'lucide-react';
import { useLibraryStore } from '../../store/useLibraryStore';

export const MobileNav = ({ onOpenCreatePlaylist }) => {
  const activeView = useLibraryStore((state) => state.activeView);
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleCreateClick = () => {
    if (onOpenCreatePlaylist) {
      onOpenCreatePlaylist();
    } else {
      window.dispatchEvent(new CustomEvent('open-create-playlist'));
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      onClick: () => setActiveView('home'),
      isActive: activeView === 'home',
    },
    {
      id: 'library',
      label: 'Library',
      icon: Library,
      onClick: () => setActiveView('library'),
      isActive: activeView === 'library',
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      onClick: () => setActiveView('search'),
      isActive: activeView === 'search',
    },
    {
      id: 'premium',
      label: 'Premium',
      icon: Sparkles,
      onClick: () => setShowPremiumModal(true),
      isActive: false,
      badgeText: 'PRO',
    },
    {
      id: 'create',
      label: 'Add',
      icon: Plus,
      onClick: handleCreateClick,
      isActive: false,
      isSpecialPlus: true,
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[62px] bg-black/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 flex items-center justify-around shadow-2xl safe-area-pb"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          if (item.isSpecialPlus) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                aria-label="Create Playlist"
                className="flex flex-col items-center justify-center py-1 px-2.5 transition-transform active:scale-90 focus-visible:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Plus size={20} className="stroke-[2.5]" aria-hidden="true" />
                </div>
                <span className="text-[10px] font-semibold text-neutral-300 tracking-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all relative focus-visible:outline-none ${
                isActive ? 'text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={isActive ? 'stroke-[2.5px] text-emerald-400' : 'stroke-2'}
                  aria-hidden="true"
                />
                {item.badgeText && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] font-black uppercase px-1 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black rounded-full ring-1 ring-black">
                    {item.badgeText}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight ${isActive ? 'text-white font-semibold' : 'text-neutral-400'}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Premium Perks Modal (Sketch 3 Feature) */}
      {showPremiumModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            className="w-full max-w-sm bg-[#121214] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-slideUp text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Crown size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Jennie Premium</h3>
                <p className="text-xs text-neutral-400">Pure sound, no interruptions</p>
              </div>
            </div>

            <div className="space-y-2.5 my-5 text-xs text-neutral-300">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03]">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>Lossless Studio Audio (320 kbps fidelity)</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03]">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>100% Ad-Free uninterrupted playback</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03]">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>Offline caching & background playback</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03]">
                <Check size={16} className="text-emerald-400 shrink-0" />
                <span>Unlimited skips & custom ambient visualizer</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPremiumModal(false)}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Included with Jennie (Enjoy Free)
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
