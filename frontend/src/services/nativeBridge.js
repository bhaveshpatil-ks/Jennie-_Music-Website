import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';

export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const isStandaloneApp = () => {
  if (typeof window === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;
  if (window.electronAPI?.isElectron) return true;
  if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
  if (window.navigator?.standalone === true) return true;
  if (window.location.protocol === 'file:' || window.location.protocol === 'capacitor:') return true;
  return false;
};

export const getPlatform = () => {
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    return window.electronAPI.platform || 'electron';
  }
  return Capacitor.getPlatform(); // 'android', 'ios', or 'web'
};

/**
 * Configure native mobile status bar styling
 */
export const initNativeStatusBar = async () => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#080808' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.debug('StatusBar initialization fallback:', err);
  }
};

/**
 * Subtle tactile haptic feedback for mobile interactions
 * @param {'light' | 'medium' | 'heavy'} type
 */
export const triggerHaptic = async (type = 'light') => {
  if (isNativePlatform()) {
    try {
      if (type === 'heavy') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'medium') {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } else {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      return;
    } catch (err) {
      // ignore silently on unsupported hardware
    }
  }

  // Web vibration fallback for Android browsers
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(type === 'heavy' ? 30 : 15);
    } catch (e) {
      // ignore
    }
  }
};

/**
 * Android hardware back button handler
 * Closes active overlays/drawers or minimizes app to background if music is playing
 */
export const setupHardwareBackButton = (onBackRequested) => {
  if (!isNativePlatform()) return () => {};

  let listenerHandle = null;

  App.addListener('backButton', ({ canGoBack }) => {
    if (onBackRequested && onBackRequested()) {
      // Back action consumed by modal/drawer closure
      return;
    }

    if (canGoBack) {
      window.history.back();
    } else {
      // If audio is playing, minimize app to background instead of killing process
      const isPlaying = typeof window !== 'undefined' && Boolean(window.__jennieIsPlaying);
      if (isPlaying) {
        try {
          App.minimizeApp().catch(() => App.exitApp());
        } catch (_) {
          App.exitApp();
        }
      } else {
        App.exitApp();
      }
    }
  }).then((handle) => {
    listenerHandle = handle;
  });

  return () => {
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};

/**
 * Sync MediaSession lockscreen controls across mobile and desktop
 */
export const updateMediaSessionMetadata = ({ track, isPlaying, onPlay, onPause, onNext, onPrevious, onSeek }) => {
  if (typeof window === 'undefined' || !('mediaSession' in navigator) || !track) return;

  try {
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Jennie Artist',
      album: track.album || 'Jennie Music',
      artwork: [
        { src: track.artwork || track.thumbnail || '/icon-512.png', sizes: '512x512', type: 'image/jpeg' },
        { src: track.artwork || track.thumbnail || '/icon-192.png', sizes: '192x192', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', onPlay || null);
    navigator.mediaSession.setActionHandler('pause', onPause || null);
    navigator.mediaSession.setActionHandler('previoustrack', onPrevious || null);
    navigator.mediaSession.setActionHandler('nexttrack', onNext || null);
    if (onSeek) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          onSeek(details.seekTime);
        }
      });
    }
  } catch (err) {
    console.debug('MediaSession registration error:', err);
  }
};

/**
 * Desktop Electron Media Key listener hook
 */
export const setupElectronMediaKeys = ({ onPlayPause, onNext, onPrevious }) => {
  if (typeof window === 'undefined' || !window.electronAPI?.onMediaKey) return () => {};

  return window.electronAPI.onMediaKey((action) => {
    if (action === 'play-pause') onPlayPause?.();
    if (action === 'next-track') onNext?.();
    if (action === 'previous-track') onPrevious?.();
  });
};
