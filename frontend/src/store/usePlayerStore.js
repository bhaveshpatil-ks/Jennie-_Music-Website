import { create } from 'zustand';
import { MOCK_TRACKS, getTrackCoverUrl } from '../data/mockTracks';
import { shuffleArray } from '../utils/formatters';
import { decideNextSong, buildRecommendedQueue } from '../services/recommendationEngine';
import { markTrackUnplayable, isTrackUnplayable } from '../services/unplayableTracksRegistry';

// Singleton HTML5 Audio instance for real audio streaming (Jamendo & Audius)
let globalAudio = null;
if (typeof window !== 'undefined') {
  globalAudio = new Audio();
  globalAudio.preload = 'auto';
}

// Silent Audio Carrier: plays an inaudible looping audio signal on the main document
// This signals to Chromium/Edge that the tab is an "Active Audio Producer",
// preventing tab throttling, freezing, or pausing when the window is minimized or backgrounded.
const SILENT_AUDIO_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let silentCarrierAudio = null;
if (typeof window !== 'undefined') {
  try {
    silentCarrierAudio = new Audio(SILENT_AUDIO_URI);
    silentCarrierAudio.loop = true;
    silentCarrierAudio.volume = 0.001;
  } catch (_) {}
}

let audioCtxKeepAlive = null;

const startSilentCarrier = () => {
  if (silentCarrierAudio) {
    try {
      silentCarrierAudio.play().catch(() => {});
    } catch (_) {}
  }

  // Web Audio Context Keep-Alive (guarantees Chromium marks tab as audio-active)
  try {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxKeepAlive) {
          audioCtxKeepAlive = new AudioCtx();
          const osc = audioCtxKeepAlive.createOscillator();
          const gain = audioCtxKeepAlive.createGain();
          gain.gain.value = 0.00001; // Inaudible sub-threshold
          osc.connect(gain);
          gain.connect(audioCtxKeepAlive.destination);
          osc.start();
        } else if (audioCtxKeepAlive.state === 'suspended') {
          audioCtxKeepAlive.resume();
        }
      }
    }
  } catch (_) {}
};

const stopSilentCarrier = () => {
  if (silentCarrierAudio) {
    try {
      silentCarrierAudio.pause();
    } catch (_) {}
  }
  if (audioCtxKeepAlive && audioCtxKeepAlive.state === 'running') {
    try {
      audioCtxKeepAlive.suspend();
    } catch (_) {}
  }
};

let wakeLockSentinel = null;
const acquireWakeLock = async () => {
  try {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !wakeLockSentinel) {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
    }
  } catch (_) {}
};

const releaseWakeLock = async () => {
  try {
    if (wakeLockSentinel) {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    }
  } catch (_) {}
};

// Synchronize browser MediaSession API (native OS lock screen & background controls)
// and Native Android MediaPlaybackService bridge
const syncMediaSession = (track, isPlaying) => {
  if (typeof window === 'undefined') return;

  // 1. Sync Native Android Foreground Service for lockscreen controls and CPU partial wakelock
  try {
    if (window.AndroidMediaBridge && typeof window.AndroidMediaBridge.updatePlayback === 'function') {
      if (track && isPlaying) {
        window.AndroidMediaBridge.updatePlayback(
          track.title || 'Unknown Track',
          track.artist || 'Jennie Music',
          true
        );
      } else if (track) {
        window.AndroidMediaBridge.updatePlayback(
          track.title || 'Unknown Track',
          track.artist || 'Jennie Music',
          false
        );
      } else {
        window.AndroidMediaBridge.stopPlayback?.();
      }
    }
  } catch (_) {}

  // 2. Manage Web Screen WakeLock
  if (isPlaying) {
    acquireWakeLock();
  } else {
    releaseWakeLock();
  }

  // 3. Sync standard Web MediaSession
  if (!('mediaSession' in navigator) || !track) return;
  try {
    const cover = getTrackCoverUrl(track);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Track',
      artist: track.artist || 'Jennie Music',
      album: track.album || 'Jennie Music',
      artwork: cover
        ? [
            { src: cover, sizes: '96x96', type: 'image/jpeg' },
            { src: cover, sizes: '128x128', type: 'image/jpeg' },
            { src: cover, sizes: '192x192', type: 'image/jpeg' },
            { src: cover, sizes: '256x256', type: 'image/jpeg' },
            { src: cover, sizes: '512x512', type: 'image/jpeg' },
          ]
        : [],
    });
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  } catch (_) {}
};

const syncMediaPosition = (currentTime, duration) => {
  if (typeof window === 'undefined' || !('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
  try {
    const validDuration = typeof duration === 'number' && duration > 0 ? duration : 180;
    const validPos = Math.max(0, Math.min(currentTime || 0, validDuration));
    navigator.mediaSession.setPositionState({
      duration: validDuration,
      playbackRate: 1,
      position: validPos,
    });
  } catch (_) {}
};

export const usePlayerStore = create((set, get) => {
  let tickerInterval = null;

  // Universal Live Timekeeper: runs continuously whenever isPlaying is true
  // Guarantees timeline NEVER gets stuck at 0:00 under any circumstances!
  const startTicker = () => {
    if (tickerInterval) clearInterval(tickerInterval);
    tickerInterval = setInterval(() => {
      const state = get();
      if (!state.isPlaying || state.isScrubbing || !state.currentTrack) return;

      // Priority 1: If YouTube controller reports a live time, synchronize with it
      const ytTime = state.ytController?.getCurrentTime?.();
      if (typeof ytTime === 'number' && !isNaN(ytTime) && ytTime > 0) {
        const ytDuration = state.ytController?.getDuration?.();
        const cur = Math.floor(ytTime);
        const dur = typeof ytDuration === 'number' && ytDuration > 0 ? Math.floor(ytDuration) : state.duration;
        set({
          currentTime: cur,
          duration: dur,
        });
        syncMediaPosition(cur, dur);
        return;
      }

      // Priority 2: If HTML5 Audio is actively playing and has a valid currentTime, use it
      if (
        globalAudio &&
        !globalAudio.paused &&
        !isNaN(globalAudio.currentTime) &&
        globalAudio.currentTime > 0
      ) {
        const cur = Math.floor(globalAudio.currentTime);
        const dur = Math.floor(globalAudio.duration) || state.duration;
        set({
          currentTime: cur,
          duration: dur,
        });
        syncMediaPosition(cur, dur);
        return;
      }

      // Priority 3: Resilient progressive increment so timeline NEVER stays stuck at 0:00!
      const trackDuration = state.duration || state.currentTrack.duration || 180;
      const nextTime = state.currentTime + 1;
      if (nextTime >= trackDuration) {
        if (state.repeatMode === 'one') {
          set({ currentTime: 0 });
          state.seekTo(0);
        } else {
          state.nextTrack();
        }
      } else {
        set({ currentTime: nextTime });
        syncMediaPosition(nextTime, trackDuration);
      }
    }, 1000);
  };

  const stopTicker = () => {
    if (tickerInterval) {
      clearInterval(tickerInterval);
      tickerInterval = null;
    }
  };

  // Setup HTML5 Audio event listeners
  if (globalAudio) {
    globalAudio.addEventListener('timeupdate', () => {
      const { isScrubbing, isPlaying, currentTrack } = get();
      if (!isScrubbing && isPlaying && globalAudio.duration && currentTrack?.audioUrl) {
        set({
          currentTime: Math.floor(globalAudio.currentTime),
          duration: Math.floor(globalAudio.duration) || get().duration,
        });
      }
    });

    globalAudio.addEventListener('loadedmetadata', () => {
      if (globalAudio.duration && !isNaN(globalAudio.duration)) {
        set({ duration: Math.floor(globalAudio.duration) });
      }
    });

    globalAudio.addEventListener('ended', () => {
      const { repeatMode, currentTrack } = get();
      if (repeatMode === 'one' && currentTrack?.audioUrl) {
        globalAudio.currentTime = 0;
        globalAudio.play().catch(() => {});
      } else {
        get().nextTrack();
      }
    });

    globalAudio.addEventListener('error', () => {
      const current = get().currentTrack;
      if (current?.audioUrl) {
        console.warn('Audio playback error, falling back to simulated ticker.');
        startTicker();
      }
    });
  }

  return {
    // Current Playback State (Default: No track loaded - user chooses their own music)
    currentTrack: null,
    isPlaying: false,
    queue: [],
    originalQueue: [],
    currentIndex: -1,
    history: [],
    consecutiveSkips: 0,
    recommendationDecision: null,

    // YouTube Controller reference
    ytController: null,
    registerYouTubeController: (controller) => set({ ytController: controller }),

    // Video Mode Toggle
    isVideoMode: false,
    toggleVideoMode: () => set((state) => ({ isVideoMode: !state.isVideoMode })),
    setVideoMode: (val) => set({ isVideoMode: val }),

    // Timing
    currentTime: 0,
    duration: 0,
    isScrubbing: false,

    // Controls
    volume: 1.0,
    isMuted: false,
    previousVolume: 1.0,
    isShuffled: false,
    repeatMode: 'off', // 'off' | 'all' | 'one'
    vocalClarity: true, // Studio Vocal Clarity & Loudness Enhancement
    toggleVocalClarity: () => set((state) => ({ vocalClarity: !state.vocalClarity })),

    // Toast Notification Feedback
    toastMessage: null,
    showToast: (message) => {
      set({ toastMessage: message });
      setTimeout(() => {
        if (get().toastMessage === message) {
          set({ toastMessage: null });
        }
      }, 2500);
    },

    // UI Modals / Drawers & Filter Tabs
    isFullscreenOpen: false,
    isQueueOpen: false,
    isLyricsOpen: false,
    toggleLyrics: () => set((state) => ({ isLyricsOpen: !state.isLyricsOpen })),
    setLyricsOpen: (isOpen) => set({ isLyricsOpen: isOpen }),
    queueFilterTab: 'all', // 'all' | 'search' | 'artist' | 'genre'
    setQueueFilterTab: (tab) => set({ queueFilterTab: tab }),

    // Live Adaptation & Search Context
    sessionArtistPenalties: {},
    sessionPoolSkips: [],
    searchResultsContext: [],
    setSearchResultsContext: (results) => set({ searchResultsContext: results || [] }),

    // Actions
    /**
     * Initiates playback of a track and constructs a YouTube Mix queue if needed
     * @param {Object} track - The song object to play
     * @param {Array} [newQueue] - Optional queue to override current session
     */
    playTrack: (track, newQueue = null) => {
      if (!track) return;

      const currentQueue = newQueue || get().queue;
      let targetIndex = currentQueue.findIndex((t) => t.id === track.id);
      let updatedQueue = currentQueue;

      // Extract clean 11-char youtubeId reliably
      const rawYt =
        track.youtubeId ||
        (typeof track.id === 'string' && track.id.startsWith('yt-') ? track.id : null) ||
        (track.source === 'youtube' ? track.id : '');
      let youtubeId = null;
      if (typeof rawYt === 'string' && rawYt.trim()) {
        const withoutPrefix = rawYt.trim().startsWith('yt-')
          ? rawYt.trim().replace('yt-', '')
          : rawYt.trim();
        const match = withoutPrefix.match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))?([\w-]{11})/
        );
        youtubeId =
          match && match[1] ? match[1] : /^[\w-]{11}$/.test(withoutPrefix) ? withoutPrefix : null;
      }
      const isYouTube = track.source === 'youtube' || Boolean(youtubeId);
      const normalizedTrack = {
        ...track,
        youtubeId: youtubeId || track.youtubeId,
        source: isYouTube ? 'youtube' : track.source || 'jamendo',
        coverUrl: getTrackCoverUrl(track),
      };

      // Deduplicated candidate pool from catalog & existing queues
      const poolMap = new Map();
      [...MOCK_TRACKS, ...(newQueue || []), ...(get().queue || [])].forEach((t) => {
        if (t && t.id) poolMap.set(t.id, t);
      });
      const candidatePool = Array.from(poolMap.values());

      // If user plays a standalone track or empty queue, generate cohesive YouTube Mix queue from structured profile
      if (targetIndex === -1 || !newQueue || newQueue.length <= 1) {
        const recommended = buildRecommendedQueue(
          normalizedTrack,
          10,
          {
            history: get().history,
            consecutiveSkips: get().consecutiveSkips,
            sessionArtistPenalties: get().sessionArtistPenalties,
          },
          candidatePool
        ).map((r) => ({
          ...r,
          recommendationReason: r.reason || r.recommendationReason,
          recommendationConfidence: r.score || r.recommendationConfidence,
          recommendationCategory:
            r.recommendationCategory || (r.source_pool === 'A' ? 'same_artist' : 'related_artist'),
        }));
        updatedQueue = [normalizedTrack, ...recommended.filter((r) => r.id !== normalizedTrack.id)];
        targetIndex = 0;
      }

      const prevTrack = get().currentTrack;
      const history = prevTrack ? [prevTrack, ...get().history.slice(0, 29)] : get().history;

      // Evaluate single next-song decision
      const nextDecision = decideNextSong(
        normalizedTrack,
        {
          history,
          consecutiveSkips: get().consecutiveSkips,
          sessionArtistPenalties: get().sessionArtistPenalties,
        },
        candidatePool
      );

      set({
        currentTrack: normalizedTrack,
        queue: updatedQueue,
        originalQueue: newQueue ? newQueue : updatedQueue,
        currentIndex: targetIndex,
        isPlaying: true,
        currentTime: 0,
        duration: normalizedTrack.duration || 180,
        history,
        recommendationDecision: nextDecision,
      });

      stopTicker();

      if (isYouTube && youtubeId) {
        // Pause HTML5 audio engine and activate background keep-alive carrier
        if (globalAudio) {
          globalAudio.pause();
          globalAudio.src = '';
        }
        startSilentCarrier();
        const { ytController } = get();
        if (ytController) {
          if (ytController.loadVideo) {
            ytController.loadVideo(youtubeId);
          }
          if (!get().isMuted && ytController.unMute) {
            ytController.unMute();
            ytController.setVolume(get().volume);
          }
          if (ytController.play) {
            ytController.play();
          }
        }
      } else if (normalizedTrack.audioUrl && globalAudio) {
        stopSilentCarrier();
        // Stop YouTube player if playing
        const { ytController } = get();
        if (ytController?.pause) {
          ytController.pause();
        }

        globalAudio.src = normalizedTrack.audioUrl;
        globalAudio.currentTime = 0;
        globalAudio.volume = get().isMuted ? 0 : get().volume;
        globalAudio.play().catch((err) => {
          console.warn('Audio play prevented or errored:', err.message);
        });
      }

      syncMediaSession(normalizedTrack, true);

      // Always start universal live timekeeper for guaranteed smooth progression
      startTicker();
    },

    togglePlay: () => {
      const { isPlaying, currentTrack, ytController } = get();
      if (!currentTrack) {
        if (get().queue.length > 0) {
          get().playTrack(get().queue[0]);
        }
        return;
      }

      const isYouTube = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);

      if (isPlaying) {
        stopSilentCarrier();
        if (isYouTube) {
          ytController?.pause();
        } else if (globalAudio && currentTrack.audioUrl) {
          globalAudio.pause();
        }
        stopTicker();
        set({ isPlaying: false });
        syncMediaSession(currentTrack, false);
      } else {
        if (isYouTube) {
          startSilentCarrier();
          const ytId =
            currentTrack.youtubeId ||
            (typeof currentTrack.id === 'string' && currentTrack.id.startsWith('yt-')
              ? currentTrack.id.replace('yt-', '')
              : null);
          if (ytController?.play) {
            if (!get().isMuted) {
              ytController.unMute();
              ytController.setVolume(get().volume);
            }
            ytController.play();
          } else if (ytController?.loadVideo && ytId) {
            ytController.loadVideo(ytId);
            ytController.play();
          }
        } else if (globalAudio && currentTrack.audioUrl) {
          stopSilentCarrier();
          globalAudio.play().catch(() => {});
        }
        startTicker();
        set({ isPlaying: true });
        syncMediaSession(currentTrack, true);
      }
    },

    pause: () => {
      stopSilentCarrier();
      const { currentTrack, ytController } = get();
      const isYouTube = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
      if (isYouTube) {
        ytController?.pause();
      } else if (globalAudio && currentTrack?.audioUrl) {
        globalAudio.pause();
      }
      stopTicker();
      set({ isPlaying: false });
      syncMediaSession(currentTrack, false);
    },

    resume: () => {
      const { currentTrack, ytController } = get();
      const isYouTube = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);
      if (isYouTube) {
        startSilentCarrier();
        if (!get().isMuted) {
          ytController?.unMute();
          ytController?.setVolume(get().volume);
        }
        ytController?.play();
      } else if (globalAudio && currentTrack?.audioUrl) {
        stopSilentCarrier();
        globalAudio.play().catch(() => startTicker());
      } else {
        startTicker();
      }
      set({ isPlaying: true });
      syncMediaSession(currentTrack, true);
    },

    nextTrack: (isExplicitSkip = false, options = {}) => {
      const {
        queue,
        currentIndex,
        repeatMode,
        currentTime,
        consecutiveSkips,
        currentTrack,
        history,
        sessionArtistPenalties,
        sessionPoolSkips,
      } = get();

      if (!currentTrack && queue.length === 0) return;

      const isErrorSkip = Boolean(options && options.isErrorSkip);

      let nextIndex = currentIndex + 1;
      let newPenalties = { ...sessionArtistPenalties };
      let newPoolSkips = [...sessionPoolSkips];

      // Live Adaptation (Step 5):
      // Skip under 5 seconds: strong negative -> drop artist weight by 60% and regenerate rest of queue
      // BUT if this is an automated embed/copyright error skip, NEVER penalize the artist or category!
      const isQuickSkip =
        !isErrorSkip &&
        ((currentTime > 0 && currentTime < 5) || (isExplicitSkip && currentTime < 5));
      if (isQuickSkip && currentTrack) {
        const artistKey = currentTrack.artist_id || currentTrack.artist?.toLowerCase();
        if (artistKey) {
          newPenalties[artistKey] = Math.min(0.9, (newPenalties[artistKey] || 0) + 0.6);
        }
        if (currentTrack.source_pool) {
          newPoolSkips.push(currentTrack.source_pool);
        }
      } else if (currentTime >= 30 && currentTrack && !isErrorSkip) {
        // Full listen or > 30 seconds: boost artist weight by 30%
        const artistKey = currentTrack.artist_id || currentTrack.artist?.toLowerCase();
        if (artistKey) {
          newPenalties[artistKey] = Math.max(-0.5, (newPenalties[artistKey] || 0) - 0.3);
        }
        newPoolSkips = [];
      }

      let activeQueue = [...queue];

      // If quick skip (< 5s), regenerate the upcoming queue to immediately enforce the 60% drop
      if (isQuickSkip && nextIndex < activeQueue.length) {
        const nextSeed = activeQueue[nextIndex] || currentTrack;
        const freshUpcoming = buildRecommendedQueue(
          nextSeed,
          8,
          {
            history: [currentTrack, ...history],
            sessionArtistPenalties: newPenalties,
          },
          MOCK_TRACKS
        );
        activeQueue = [
          ...activeQueue.slice(0, nextIndex + 1),
          ...freshUpcoming.filter((r) => r.id !== nextSeed.id),
        ];
      }

      // Background autoplay refill: When 3 tracks remain in queue, append fresh recommendations
      if (activeQueue.length - nextIndex <= 3) {
        const tailSeed = activeQueue[activeQueue.length - 1] || currentTrack;
        const tailExtension = buildRecommendedQueue(
          tailSeed,
          8,
          {
            history: [currentTrack, ...history],
            sessionArtistPenalties: newPenalties,
          },
          MOCK_TRACKS
        );
        const existingIds = new Set(activeQueue.map((t) => t.id || t.youtubeId));
        const newToAdd = tailExtension.filter((t) => !existingIds.has(t.id || t.youtubeId));
        activeQueue = [...activeQueue, ...newToAdd];
      }

      set({
        sessionArtistPenalties: newPenalties,
        sessionPoolSkips: newPoolSkips,
        consecutiveSkips: isQuickSkip ? consecutiveSkips + 1 : 0,
        queue: activeQueue,
      });

      if (nextIndex >= activeQueue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          // Infinite cohesive radio autoplay
          const nextRecs = buildRecommendedQueue(
            currentTrack,
            6,
            {
              history: [currentTrack, ...history],
              sessionArtistPenalties: newPenalties,
            },
            MOCK_TRACKS
          );
          if (nextRecs.length > 0) {
            get().playTrack(nextRecs[0], nextRecs);
            return;
          }
          if (globalAudio) globalAudio.pause();
          get().ytController?.pause();
          stopTicker();
          set({ isPlaying: false, currentTime: 0 });
          return;
        }
      }

      // Skip over any upcoming songs marked unplayable by YouTube embed restrictions
      while (
        nextIndex < activeQueue.length &&
        isTrackUnplayable(activeQueue[nextIndex]?.id || activeQueue[nextIndex]?.youtubeId)
      ) {
        nextIndex++;
      }

      const nextSong = activeQueue[nextIndex];
      if (nextSong) {
        get().playTrack(nextSong, activeQueue);
      }
    },

    markTrackUnplayable: (trackId, errorCode, reason) => {
      markTrackUnplayable(trackId, errorCode, reason);
      const cleanQueue = get().queue.filter((t) => !isTrackUnplayable(t.id || t.youtubeId));
      set({ queue: cleanQueue });
    },

    prevTrack: () => {
      const { queue, currentIndex, currentTime } = get();
      if (currentTime > 3) {
        get().seekTo(0);
        return;
      }

      if (queue.length === 0) return;
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }

      const prevSong = queue[prevIndex];
      get().playTrack(prevSong, queue);
    },

    seekTo: (seconds) => {
      const { currentTrack, ytController } = get();
      const targetTime = Math.max(0, Math.min(seconds, get().duration));
      const isYouTube = currentTrack?.source === 'youtube' || Boolean(currentTrack?.youtubeId);

      if (isYouTube) {
        ytController?.seekTo(targetTime);
      } else if (globalAudio && currentTrack?.audioUrl) {
        globalAudio.currentTime = targetTime;
      }
      set({ currentTime: targetTime });
    },

    setIsScrubbing: (isScrubbing) => {
      set({ isScrubbing });
    },

    setVolume: (val) => {
      const clamped = Math.max(0, Math.min(1, val));
      const { ytController } = get();
      if (globalAudio) {
        globalAudio.volume = clamped;
      }
      if (ytController) {
        ytController.setVolume(clamped);
      }
      set({
        volume: clamped,
        isMuted: clamped === 0,
        previousVolume: clamped > 0 ? clamped : get().previousVolume,
      });
    },

    toggleMute: () => {
      const { isMuted, volume, previousVolume, ytController } = get();
      if (isMuted) {
        const targetVol = previousVolume || 1.0;
        if (globalAudio) globalAudio.volume = targetVol;
        if (ytController) {
          ytController.unMute();
          ytController.setVolume(targetVol);
        }
        set({
          isMuted: false,
          volume: targetVol,
        });
      } else {
        if (globalAudio) globalAudio.volume = 0;
        if (ytController) {
          ytController.mute();
        }
        set({
          isMuted: true,
          previousVolume: volume,
          volume: 0,
        });
      }
    },

    toggleShuffle: () => {
      const { isShuffled, queue, originalQueue, currentTrack } = get();
      if (isShuffled) {
        const currentIdx = originalQueue.findIndex((t) => t.id === currentTrack?.id);
        set({
          isShuffled: false,
          queue: originalQueue,
          currentIndex: currentIdx >= 0 ? currentIdx : 0,
        });
      } else {
        const remaining = queue.filter((t) => t.id !== currentTrack?.id);
        const shuffled = currentTrack
          ? [currentTrack, ...shuffleArray(remaining)]
          : shuffleArray(queue);
        set({
          isShuffled: true,
          queue: shuffled,
          currentIndex: 0,
        });
      }
    },

    toggleRepeat: () => {
      const modes = ['off', 'all', 'one'];
      const current = get().repeatMode;
      const nextMode = modes[(modes.indexOf(current) + 1) % modes.length];
      set({ repeatMode: nextMode });
    },

    toggleFullscreen: () => {
      set((state) => ({ isFullscreenOpen: !state.isFullscreenOpen }));
    },

    toggleQueue: () => {
      set((state) => ({ isQueueOpen: !state.isQueueOpen }));
    },

    setQueueOpen: (isOpen) => {
      set({ isQueueOpen: isOpen });
    },

    addToQueue: (track) => {
      if (!track) return;
      const { queue } = get();
      const exists = queue.some((t) => t.id === track.id);
      if (exists) {
        get().showToast(`"${track.title}" is already in queue`);
        return;
      }
      set({ queue: [...queue, track] });
      get().showToast(`Added "${track.title}" to queue`);
    },

    playNext: (track) => {
      if (!track) return;
      const { queue, currentIndex } = get();
      const filtered = queue.filter((t) => t.id !== track.id);
      const insertAt = Math.max(0, currentIndex + 1);
      filtered.splice(insertAt, 0, track);
      set({ queue: filtered });
      get().showToast(`Playing "${track.title}" next`);
    },

    removeFromQueue: (trackId) => {
      const { queue, currentIndex, currentTrack } = get();
      if (currentTrack?.id === trackId) {
        get().nextTrack();
        return;
      }
      const updated = queue.filter((t) => t.id !== trackId);
      const newIdx = updated.findIndex((t) => t.id === currentTrack?.id);
      set({
        queue: updated,
        currentIndex: newIdx >= 0 ? newIdx : currentIndex,
      });
      get().showToast(`Removed from queue`);
    },

    clearQueue: () => {
      const { currentTrack } = get();
      set({ queue: currentTrack ? [currentTrack] : [], currentIndex: 0 });
      get().showToast(`Queue cleared`);
    },
  };
});

// Setup OS hardware multimedia keys & native lock screen MediaSession listeners
if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
  try {
    navigator.mediaSession.setActionHandler('play', () => {
      usePlayerStore.getState().resume();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      usePlayerStore.getState().pause();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      usePlayerStore.getState().prevTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      usePlayerStore.getState().nextTrack(true);
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') {
        usePlayerStore.getState().seekTo(details.seekTime);
      }
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const { currentTime, duration, seekTo } = usePlayerStore.getState();
      seekTo(Math.min(duration || 180, currentTime + (details.seekOffset || 10)));
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const { currentTime, seekTo } = usePlayerStore.getState();
      seekTo(Math.max(0, currentTime - (details.seekOffset || 10)));
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      usePlayerStore.getState().pause();
    });
  } catch (_) {}
}

// Background & Offscreen visibility change listener
// Ensures seamless background playback when the screen is locked or tab is hidden
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    try {
      const store = usePlayerStore.getState();
      if (store.isPlaying && store.currentTrack) {
        startSilentCarrier();
        if (globalAudio && store.currentTrack?.audioUrl && globalAudio.paused) {
          globalAudio.play().catch(() => {});
        }
        if (store.ytController && (store.currentTrack?.source === 'youtube' || store.currentTrack?.youtubeId)) {
          store.ytController.play();
        }
      }
    } catch (_) {}
  });
}

// Register native Android notification media button bridge handler
if (typeof window !== 'undefined') {
  window.__onNativeMediaAction = (action) => {
    try {
      const store = usePlayerStore.getState();
      if (action === 'play_pause') {
        store.togglePlay();
      } else if (action === 'next') {
        store.nextTrack(true);
      } else if (action === 'prev') {
        store.prevTrack();
      } else if (action === 'stop') {
        store.pause();
      }
    } catch (_) {}
  };
}
