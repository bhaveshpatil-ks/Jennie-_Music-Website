import React, { useState, useEffect, useRef, Suspense } from 'react';
import Lenis from 'lenis';
import { Music } from 'lucide-react';
import { Sidebar, TopHeader, MobileNav } from './index';
import { PlayerBar, QueueDrawer, FullscreenPlayer, YouTubePlayerEmbed } from '../player';
import { CreatePlaylistModal, OfflineAlert } from '../common';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { PermissionSetupModal } from '../permissions/PermissionSetupModal';
import { AuthModal } from '../auth/AuthModal';
import { WelcomeAuthScreen } from '../auth/WelcomeAuthScreen';
import { useLibraryStore } from '../../store/useLibraryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { usePlayerStore } from '../../store/usePlayerStore';
import { usePermissionStore } from '../../store/usePermissionStore';
import {
  initNativeStatusBar,
  setupHardwareBackButton,
  setupElectronMediaKeys,
  triggerHaptic,
} from '../../services/nativeBridge';

// Core Views (Loaded upfront for instant initial render)
import { Home, Search, Library, Favorites } from '../../pages';

// Code-split Lazy Views (Loaded on demand to keep initial bundle ultra-fast)
const PlaylistDetail = React.lazy(() => import('../../pages/PlaylistDetail').then((m) => ({ default: m.PlaylistDetail })));
const ArtistDetail = React.lazy(() => import('../../pages/ArtistDetail').then((m) => ({ default: m.ArtistDetail })));
const AlbumDetail = React.lazy(() => import('../../pages/AlbumDetail').then((m) => ({ default: m.AlbumDetail })));
const Settings = React.lazy(() => import('../../pages/Settings').then((m) => ({ default: m.Settings })));
const Feedback = React.lazy(() => import('../../pages/Feedback').then((m) => ({ default: m.Feedback })));
const DownloadApp = React.lazy(() => import('../../pages/DownloadApp').then((m) => ({ default: m.DownloadApp })));
const NotFound = React.lazy(() => import('../../pages/NotFound').then((m) => ({ default: m.NotFound })));
const PrivacyPolicy = React.lazy(() => import('../../pages/legal/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })));
const TermsAndConditions = React.lazy(() => import('../../pages/legal/TermsAndConditions').then((m) => ({ default: m.TermsAndConditions })));
const CookiePolicy = React.lazy(() => import('../../pages/legal/CookiePolicy').then((m) => ({ default: m.CookiePolicy })));
const RefundPolicy = React.lazy(() => import('../../pages/legal/RefundPolicy').then((m) => ({ default: m.RefundPolicy })));
const BusinessDetails = React.lazy(() => import('../../pages/legal/BusinessDetails').then((m) => ({ default: m.BusinessDetails })));

const ViewLoadingFallback = () => (
  <div className="py-24 flex flex-col items-center justify-center animate-pulse text-neutral-400">
    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
      <Music size={22} className="text-white/60 animate-spin" />
    </div>
    <div className="h-3 w-32 bg-white/10 rounded-full" />
  </div>
);

export const AppLayout = () => {
  const activeView = useLibraryStore((state) => state.activeView);
  const selectedItem = useLibraryStore((state) => state.selectedItem);
  const syncWithBackend = useLibraryStore((state) => state.syncWithBackend);
  const isFeedbackModalOpen = useLibraryStore((state) => state.isFeedbackModalOpen);
  const feedbackInitialContext = useLibraryStore((state) => state.feedbackInitialContext);
  const closeFeedbackModal = useLibraryStore((state) => state.closeFeedbackModal);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // App Permissions state
  const isSetupModalOpen = usePermissionStore((state) => state.isSetupModalOpen);
  const closeSetupModal = usePermissionStore((state) => state.closeSetupModal);
  const initPermissions = usePermissionStore((state) => state.initPermissions);

  useEffect(() => {
    initPermissions();
  }, [initPermissions]);

  useEffect(() => {
    const handleOpenCreate = () => setIsCreateModalOpen(true);
    window.addEventListener('open-create-playlist', handleOpenCreate);
    return () => window.removeEventListener('open-create-playlist', handleOpenCreate);
  }, []);

  const mainRef = useRef(null);
  const contentRef = useRef(null);
  const lenisRef = useRef(null);

  // Auth state & onboarding gate
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [hasEnteredGuest, setHasEnteredGuest] = useState(true);

  // Safety splash timeout: Ensure the initial loading state never hangs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (useAuthStore.getState().loading) {
        useAuthStore.setState({ loading: false });
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize Firebase Auth listener
  const initAuth = useAuthStore((state) => state.initAuth);
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initAuth]);

  // Sync library with MongoDB backend
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Native Mobile & Desktop Platform Lifecycle Integration
  useEffect(() => {
    // 1. Set dark status bar for Android/iOS
    initNativeStatusBar();

    // 2. Register Android hardware back button listener
    const cleanupBackButton = setupHardwareBackButton(() => {
      // Check if Fullscreen Player is open
      const playerState = usePlayerStore.getState();
      if (playerState.isFullscreen) {
        playerState.toggleFullscreen();
        triggerHaptic('light');
        return true;
      }
      // Check if Queue Drawer is open
      if (playerState.isQueueOpen) {
        playerState.setIsQueueOpen(false);
        triggerHaptic('light');
        return true;
      }
      // Check if Create Modal is open
      if (isCreateModalOpen) {
        setIsCreateModalOpen(false);
        return true;
      }
      // Check if Feedback Modal is open
      const libState = useLibraryStore.getState();
      if (libState.isFeedbackModalOpen) {
        libState.closeFeedbackModal();
        return true;
      }
      return false; // let system navigate back or exit
    });

    // 3. Register Desktop Electron global media shortcuts
    const cleanupMediaKeys = setupElectronMediaKeys({
      onPlayPause: () => usePlayerStore.getState().togglePlay(),
      onNext: () => usePlayerStore.getState().nextTrack(),
      onPrevious: () => usePlayerStore.getState().prevTrack(),
    });

    return () => {
      if (cleanupBackButton) cleanupBackButton();
      if (cleanupMediaKeys) cleanupMediaKeys();
    };
  }, [isCreateModalOpen]);

  // Initialize Lenis smooth scrolling with minimal luxury physics
  useEffect(() => {
    if (!mainRef.current) return;

    const lenis = new Lenis({
      wrapper: mainRef.current,
      content: contentRef.current,
      duration: 1.35, // Deliberate luxury momentum
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Silky exponential deceleration
      smoothWheel: true,
      wheelMultiplier: 0.88, // Soft, measured scroll rate
      touchMultiplier: 1.0,
      gestureOrientation: 'vertical',
      normalizeWheel: true,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    let animationFrameId;
    function raf(time) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, []);

  // Silk glide to top on view change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false, duration: 0.5 });
    } else if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [activeView, selectedItem]);

  const setActiveView = useLibraryStore((state) => state.setActiveView);

  // Sync URL/Hash with activeView safely across Web, Electron, and Native Mobile
  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const isNativeOrFile = typeof window !== 'undefined' && (
          window.location.protocol === 'file:' ||
          window.location.protocol === 'capacitor:' ||
          window.location.pathname.endsWith('.html') ||
          window.location.pathname.includes('index.html')
        );

        if (isNativeOrFile) {
          // Native / Electron App mode: route via hash without path corruption
          const hash = (window.location.hash || '').toLowerCase().replace(/^#\/?/, '');
          if (hash === 'search') setActiveView('search');
          else if (hash === 'library') setActiveView('library');
          else if (hash === 'favorites') setActiveView('favorites');
          else if (hash === 'download' || hash === 'downloads' || hash === 'get-app') setActiveView('download');
          else if (hash === 'privacy' || hash === 'privacy-policy') setActiveView('privacy');
          else if (hash === 'terms' || hash === 'terms-and-conditions') setActiveView('terms');
          else if (hash === 'cookies' || hash === 'cookie-policy') setActiveView('cookies');
          else if (hash === 'refund' || hash === 'refund-policy') setActiveView('refund');
          else if (hash === 'business' || hash === 'business-details') setActiveView('business');
          else if (hash === 'settings' || hash === 'account') setActiveView('settings');
          else if (hash === 'feedback' || hash === 'help' || hash === 'complaints') setActiveView('feedback');
          else setActiveView('home'); // Always default safely to 'home' in native app
          return;
        }

        const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
        if (path === '/' || path === '' || path === '/index.html' || path === '/home') setActiveView('home');
        else if (path === '/search') setActiveView('search');
        else if (path === '/library') setActiveView('library');
        else if (path === '/favorites') setActiveView('favorites');
        else if (path === '/download' || path === '/downloads' || path === '/get-app') setActiveView('download');
        else if (path === '/privacy-policy' || path === '/privacy') setActiveView('privacy');
        else if (path === '/terms-and-conditions' || path === '/terms') setActiveView('terms');
        else if (path === '/cookie-policy' || path === '/cookies') setActiveView('cookies');
        else if (path === '/refund-policy' || path === '/refund') setActiveView('refund');
        else if (path === '/business-details' || path === '/business') setActiveView('business');
        else if (path === '/settings' || path === '/account') setActiveView('settings');
        else if (path === '/feedback' || path === '/help' || path === '/complaints') setActiveView('feedback');
        else setActiveView('404');
      } catch (_) {
        setActiveView('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [setActiveView]);

  // Keep URL / Hash synchronized when activeView changes
  useEffect(() => {
    try {
      const isNativeOrFile = typeof window !== 'undefined' && (
        window.location.protocol === 'file:' ||
        window.location.protocol === 'capacitor:' ||
        window.location.pathname.endsWith('.html') ||
        window.location.pathname.includes('index.html')
      );

      if (isNativeOrFile) {
        if (!['genre', 'playlist', 'artist', 'album'].includes(activeView)) {
          if (activeView === 'home') {
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          } else {
            window.location.hash = `#${activeView}`;
          }
        }
        return;
      }

      const pathToView = {
        home: '/',
        search: '/search',
        library: '/library',
        favorites: '/favorites',
        download: '/download',
        privacy: '/privacy-policy',
        terms: '/terms-and-conditions',
        cookies: '/cookie-policy',
        refund: '/refund-policy',
        business: '/business-details',
        settings: '/settings',
        feedback: '/feedback',
        404: '/404',
      };
      const targetPath = pathToView[activeView];
      if (targetPath && window.location.pathname !== targetPath && !['genre', 'playlist', 'artist', 'album'].includes(activeView)) {
        window.history.pushState(null, '', targetPath);
      }
    } catch (_) {
      // Never allow history state exceptions to bubble or crash the application
    }
  }, [activeView]);

  // Render current view
  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Home />;
      case 'search':
        return <Search />;
      case 'library':
        return <Library onOpenCreatePlaylist={() => setIsCreateModalOpen(true)} />;
      case 'favorites':
        return <Favorites />;
      case 'download':
        return <DownloadApp />;
      case 'genre':
        return <PlaylistDetail playlist={selectedItem} isGenre={true} />;
      case 'playlist':
        return <PlaylistDetail playlist={selectedItem} isGenre={false} />;
      case 'artist':
        return <ArtistDetail artist={selectedItem} />;
      case 'album':
        return <AlbumDetail album={selectedItem} />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsAndConditions />;
      case 'cookies':
        return <CookiePolicy />;
      case 'refund':
        return <RefundPolicy />;
      case 'business':
        return <BusinessDetails />;
      case 'settings':
        return <Settings />;
      case 'feedback':
        return <Feedback />;
      case '404':
      case 'notfound':
        return <NotFound />;
      default:
        return <NotFound />;
    }
  };

  // 1. Initial Splash Loader while Firebase session state initializes
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#070708] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl mb-4 animate-pulse">
          <Music size={26} className="fill-black" />
        </div>
        <span className="text-xl font-bold font-serif tracking-tight">Jennie</span>
        <div className="flex items-center gap-1.5 mt-5">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  // 2. Onboarding Auth Gate: When opening the app first, require login / account creation before moving to home
  if (!user && !hasEnteredGuest) {
    return <WelcomeAuthScreen onEnterGuest={() => setHasEnteredGuest(true)} />;
  }

  return (
    <div className="flex h-screen bg-[#080808] text-white overflow-hidden selection:bg-neutral-700 selection:text-white relative">
      {/* Real-time Offline Device Alert */}
      <OfflineAlert />
      {/* Keyboard Accessibility: Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:font-bold focus:rounded-full focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar (hidden on mobile < 768px) */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar onOpenCreatePlaylist={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Header */}
        <TopHeader />

        {/* Scrollable View Content with Lenis Smooth Scroll */}
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          className="flex-grow overflow-y-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 pb-36 md:pb-28 transition-all focus:outline-none"
        >
          <div ref={contentRef} className="max-w-7xl mx-auto">
            <div key={`${activeView}-${selectedItem?.id || ''}`} className="animate-luxury-fade">
              <Suspense fallback={<ViewLoadingFallback />}>
                {renderView()}
              </Suspense>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenCreatePlaylist={() => setIsCreateModalOpen(true)} />

      {/* Persistent Frosted Player Bar */}
      <PlayerBar />

      {/* Slide-out Queue Panel */}
      <QueueDrawer />

      {/* Immersive Fullscreen Now Playing Modal */}
      <FullscreenPlayer />

      {/* Official YouTube IFrame Player Host */}
      <YouTubePlayerEmbed />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Luxury Authentication Modal */}
      <AuthModal />

      {/* Help & Feedback Complaint Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={closeFeedbackModal}
        initialContext={feedbackInitialContext}
        onOpenMyReports={() => {
          closeFeedbackModal();
          setActiveView('feedback');
        }}
      />

      {/* App Permissions Setup Onboarding Modal */}
      <PermissionSetupModal
        isOpen={isSetupModalOpen}
        onClose={closeSetupModal}
      />
    </div>
  );
};
