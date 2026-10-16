import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Mic2,
  ListPlus,
  ListMusic,
  Flag,
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { getTrackCoverUrl } from '../../data/mockTracks';
import { LikeButton } from '../common/LikeButton';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { LyricsView } from './LyricsView';
import { AddToPlaylistModal } from '../common/AddToPlaylistModal';
import { getTrackTwoColorMix } from '../../utils/trackColorPalette';

export const FullscreenPlayer = () => {
  const isFullscreenOpen = usePlayerStore((state) => state.isFullscreenOpen);
  const openArtist = useLibraryStore((state) => state.openArtist);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const toggleQueue = usePlayerStore((state) => state.toggleQueue);
  const setQueueOpen = usePlayerStore((state) => state.setQueueOpen);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const openFeedbackModal = useLibraryStore((state) => state.openFeedbackModal);

  const [showLyrics, setShowLyrics] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const touchStartY = useRef(0);

  // Keyboard accessibility: Escape minimizes the fullscreen view
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreenOpen) {
        toggleFullscreen();
      }
    };
    if (isFullscreenOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen, toggleFullscreen]);

  if (!isFullscreenOpen || !currentTrack) return null;
  const isYouTubeTrack = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);
  const colorMix = getTrackTwoColorMix(currentTrack);

  // Swipe gesture handlers
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    // Swipe UP (deltaY > 50px) reveals queue
    if (deltaY > 50) {
      setQueueOpen(true);
    }
    // Swipe DOWN (deltaY < -60px) minimizes player
    if (deltaY < -60) {
      toggleFullscreen();
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Now Playing: ${currentTrack.title} by ${currentTrack.artist}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ background: colorMix.gradient, backgroundColor: '#070707' }}
        className="fixed inset-0 z-50 flex flex-col justify-between p-5 md:p-10 overflow-hidden animate-luxury-slide-up select-none transition-colors duration-1000"
      >
        {/* Dynamic 2-Color Ambient Background Glows */}
        <div
          className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full blur-[150px] opacity-30 pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: colorMix.primary }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[160px] opacity-25 pointer-events-none transition-all duration-1000"
          style={{ backgroundColor: colorMix.secondary }}
          aria-hidden="true"
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Minimize player"
            title="Minimize"
            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-neutral-300 hover:text-white transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10 shadow-sm active:scale-95"
          >
            <ChevronDown size={22} />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 block">
              Playing from {(currentTrack.source || 'CATALOG').toUpperCase()}
            </span>
            <span className="text-xs font-semibold text-white/90">
              {currentTrack.album || 'Single'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Persistent Report Playback Issue Button */}
            <button
              type="button"
              onClick={() => {
                openFeedbackModal({
                  category: 'playback',
                  songId: currentTrack.id,
                  artist: currentTrack.artist,
                  trackTitle: currentTrack.title,
                  playbackPosition: `${Math.floor(currentTime / 60)}:${('0' + Math.floor(currentTime % 60)).slice(-2)}`,
                });
              }}
              aria-label="Report issue with this song"
              title="Report an issue with this song"
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-red-500/20 text-neutral-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all flex items-center justify-center shadow-sm active:scale-95"
            >
              <Flag size={16} />
            </button>

            {/* Lyrics Card Flip Toggle Button */}
            <button
              type="button"
              onClick={() => setShowLyrics(!showLyrics)}
              aria-label={showLyrics ? 'Flip to cover art' : 'Flip to lyrics'}
              title="Flip Card for Lyrics"
              className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center border shadow-md active:scale-95 ${
                showLyrics
                  ? 'bg-white text-black border-white shadow-white/20'
                  : 'bg-black/40 hover:bg-black/60 text-neutral-300 hover:text-white border-white/10'
              }`}
            >
              <Mic2 size={17} />
            </button>
          </div>
        </div>

        {/* Main Center Area: 3D Flip Card (Cover Artwork <-> Synchronized Lyrics) */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto max-w-lg mx-auto w-full">
          <div
            onClick={() => setShowLyrics(!showLyrics)}
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 [perspective:1000px] cursor-pointer mb-6 group select-none"
            title="Click or tap to flip card between artwork & lyrics"
          >
            <div
              className={`w-full h-full relative transition-transform duration-700 [transform-style:preserve-3d] ${
                showLyrics ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              {/* FRONT: Album Artwork Thumbnail Card */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-3xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-white/25 transition-all bg-neutral-900">
                <img
                  src={getTrackCoverUrl(currentTrack)}
                  alt={`Album cover artwork for ${currentTrack.title} by ${currentTrack.artist}`}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-50 pointer-events-none" />

                {/* Floating "Flip for lyrics" hint pill */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/15 flex items-center gap-1.5 shadow-lg group-hover:bg-black/80 transition-all">
                  <Mic2 size={13} className="text-rose-400" />
                  <span>Flip for lyrics ↻</span>
                </div>
              </div>

              {/* BACK: Synchronized Lyrics View */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl overflow-hidden shadow-2xl bg-neutral-950/95 border border-white/15 p-4 backdrop-blur-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 px-1">
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                    <Mic2 size={14} /> Synchronized Lyrics
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-white/10 px-2.5 py-0.5 rounded-full">
                    Tap to flip cover ↻
                  </span>
                </div>
                <div className="flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <LyricsView isOpen={true} embedded={true} />
                </div>
              </div>
            </div>
          </div>

          {/* Track Details & Playlist Plus Button (Matching sketch: song details on left, + playlist on right) */}
          <div className="w-full flex items-center justify-between mb-4">
            <div className="min-w-0 pr-3 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate tracking-tight">
                {currentTrack.title}
              </h1>
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                  openArtist(currentTrack.artist);
                }}
                className="text-sm md:text-base text-neutral-300 hover:text-white hover:underline font-medium truncate mt-0.5 cursor-pointer transition-colors"
                title={`View ${currentTrack.artist}'s profile`}
              >
                {currentTrack.artist} •{' '}
                <span className="text-neutral-400 text-xs">
                  {currentTrack.album || currentTrack.genre || 'Single'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* + Playlist button matching sketch label "playlist +" */}
              <button
                type="button"
                onClick={() => setIsPlaylistModalOpen(true)}
                aria-label="Add to playlist"
                title="Add to Playlist (+)"
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                <ListPlus size={20} />
              </button>
              <LikeButton trackId={currentTrack.id} size={24} />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full mb-6">
            <ProgressBar showTimes={true} />
          </div>

          {/* Playback Controls */}
          <div
            className="flex items-center justify-center gap-6 md:gap-8 w-full"
            role="toolbar"
            aria-label="Fullscreen Controls"
          >
            <button
              type="button"
              onClick={toggleShuffle}
              aria-label={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
              aria-pressed={isShuffled}
              className={`p-2 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isShuffled ? 'text-white' : 'text-neutral-400'
              }`}
            >
              <Shuffle size={20} />
            </button>

            <button
              type="button"
              onClick={prevTrack}
              aria-label="Previous Track"
              className="p-3 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <SkipBack size={26} />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
              className="w-16 h-16 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center shadow-xl transition-all duration-300 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {isPlaying ? (
                <Pause size={28} className="fill-black" />
              ) : (
                <Play size={28} className="fill-black ml-1" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              aria-label="Next Track"
              className="p-3 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <SkipForward size={26} />
            </button>

            <button
              type="button"
              onClick={toggleRepeat}
              aria-label={`Toggle repeat mode, currently ${repeatMode}`}
              className={`p-2 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                repeatMode !== 'off' ? 'text-white' : 'text-neutral-400'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>
        </div>

        {/* Bottom Actions & Swipe-Up Queue Trigger (Preserves Suspense) */}
        <div className="relative z-10 flex flex-col items-center gap-3 max-w-sm mx-auto w-full">
          <VolumeControl className="w-full justify-center hidden sm:flex" />

          {/* Suspense-Friendly Swipe-Up Queue Trigger */}
          <button
            type="button"
            onClick={toggleQueue}
            aria-label="View upcoming queue"
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-semibold transition-all border border-white/5 active:scale-95 cursor-pointer shadow-lg"
          >
            <ChevronUp size={15} className="group-hover:-translate-y-0.5 transition-transform" />
            <ListMusic size={14} />
            <span>Up Next (Swipe up to view)</span>
          </button>
        </div>
      </div>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        track={currentTrack}
      />
    </>
  );
};
