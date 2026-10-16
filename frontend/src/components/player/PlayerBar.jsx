import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  ListMusic, 
  Maximize2, 
  ShieldCheck, 
  Mic2,
  ListPlus,
  Flag,
  Headphones,
  Speaker,
  Laptop,
  Check,
  X,
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { LikeButton } from '../common/LikeButton';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { LyricsView } from './LyricsView';
import { AddToPlaylistModal } from '../common/AddToPlaylistModal';
import { getTrackCoverUrl } from '../../data/mockTracks';

export const PlayerBar = () => {
  const openArtist = useLibraryStore((state) => state.openArtist);
  const openFeedbackModal = useLibraryStore((state) => state.openFeedbackModal);
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const nextTrack = usePlayerStore((state) => state.nextTrack);
  const prevTrack = usePlayerStore((state) => state.prevTrack);
  const isShuffled = usePlayerStore((state) => state.isShuffled);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const toggleRepeat = usePlayerStore((state) => state.toggleRepeat);
  const isQueueOpen = usePlayerStore((state) => state.isQueueOpen);
  const toggleQueue = usePlayerStore((state) => state.toggleQueue);
  const toggleFullscreen = usePlayerStore((state) => state.toggleFullscreen);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const isLyricsOpen = usePlayerStore((state) => state.isLyricsOpen);
  const toggleLyrics = usePlayerStore((state) => state.toggleLyrics);
  const setLyricsOpen = usePlayerStore((state) => state.setLyricsOpen);
  const toastMessage = usePlayerStore((state) => state.toastMessage);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState('speaker');

  if (!currentTrack) return null;
  const isYouTubeTrack = currentTrack.source === 'youtube' || Boolean(currentTrack.youtubeId);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Mobile Spotify-Style Mini Player Bar (< 768px, sits right above bottom nav) */}
      <div
        role="region"
        aria-label="Mobile Mini Player"
        className="md:hidden fixed bottom-[64px] left-2 right-2 z-40 bg-[#111111]/95 backdrop-blur-3xl border border-white/[0.08] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-2.5 flex flex-col overflow-hidden animate-luxury-slide-up"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Tappable track info to expand fullscreen player */}
          <div
            onClick={toggleFullscreen}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFullscreen(); }}
            aria-label={`Open now playing for ${currentTrack.title}`}
            className="flex items-center gap-3 min-w-0 flex-grow cursor-pointer"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#222] shadow">
              <img
                src={getTrackCoverUrl(currentTrack)}
                alt={`Artwork for ${currentTrack.title}`}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-grow pr-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                {currentTrack.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p 
                  onClick={(e) => {
                    e.stopPropagation();
                    openArtist(currentTrack.artist);
                  }}
                  className="text-[11px] text-neutral-400 hover:text-white hover:underline truncate cursor-pointer transition-colors"
                >
                  {currentTrack.artist}
                </p>
                {isYouTubeTrack && (
                  <span className="text-[9px] text-red-400 bg-red-500/10 px-1 py-0.2 rounded font-medium">
                    YouTube
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions: Output Device (Sketch 3), Playlist, Like, Play/Pause */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Output Device selector from Sketch 3 */}
            <button
              type="button"
              onClick={() => setShowDevicePicker(true)}
              aria-label="Audio Output Device"
              title="Listening Device"
              className="p-1.5 rounded-full text-neutral-400 hover:text-emerald-400 transition-colors"
            >
              <Headphones size={17} className={selectedDeviceId === 'headphones' ? 'text-emerald-400' : 'text-neutral-400'} />
            </button>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setIsPlaylistModalOpen(true)}
                aria-label="Add to playlist"
                title="Add to Playlist"
                className="p-1.5 rounded-full text-neutral-400 hover:text-white transition-colors"
              >
                <ListPlus size={18} />
              </button>
              <div className="p-1">
                <LikeButton trackId={currentTrack.id} size={18} />
              </div>
            </div>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transition-all duration-300 hover:bg-neutral-200 active:opacity-75 shadow-md ml-0.5"
            >
              {isPlaying ? (
                <Pause size={18} className="fill-black" />
              ) : (
                <Play size={18} className="fill-black ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar line along bottom of mini card */}
        <div className="w-full h-[2.5px] bg-white/10 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Desktop Audio Player (>= 768px) */}
      <footer
        role="region"
        aria-label="Desktop Audio Player"
        className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-t border-white/[0.08] px-6 py-2.5 shadow-2xl transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Track Information & Attribution */}
          <div className="flex items-center gap-3 min-w-0 w-[30%] max-w-[320px]">
            <div 
              onClick={toggleFullscreen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleFullscreen(); }}
              aria-label={`Open now playing for ${currentTrack.title}`}
              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#1A1A1A] cursor-pointer group shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <img
                src={getTrackCoverUrl(currentTrack)}
                alt={`Currently playing album art for ${currentTrack.title}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" aria-hidden="true">
                <Maximize2 size={14} className="text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-grow">
              <div className="flex items-center gap-1.5">
                <h4 
                  onClick={toggleFullscreen}
                  className="text-sm font-semibold text-white truncate hover:underline cursor-pointer"
                  title={currentTrack.title}
                >
                  {currentTrack.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p 
                  onClick={(e) => {
                    e.stopPropagation();
                    openArtist(currentTrack.artist);
                  }}
                  className="text-xs text-neutral-400 hover:text-white hover:underline truncate cursor-pointer transition-colors" 
                  title={currentTrack.artist}
                >
                  {currentTrack.artist}
                </p>
                <span 
                  className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-neutral-300 bg-neutral-800 px-1.5 py-0.2 rounded-full"
                  title={`License (${currentTrack.license})`}
                >
                  <ShieldCheck size={10} aria-hidden="true" />
                  {currentTrack.license || 'Free Stream'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsPlaylistModalOpen(true)}
                aria-label="Add to playlist"
                title="Add to Playlist"
                className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ListPlus size={18} />
              </button>
              <LikeButton trackId={currentTrack.id} size={18} />
            </div>
          </div>

          {/* Center: Playback Controls & Progress Bar */}
          <div className="flex flex-col items-center w-full max-w-[520px] px-2">
            <div className="flex items-center gap-5 mb-1" role="toolbar" aria-label="Playback Controls">
              {/* Shuffle */}
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
                aria-pressed={isShuffled}
                className={`p-1.5 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isShuffled ? 'text-white' : 'text-neutral-400'
                }`}
                title={isShuffled ? 'Disable Shuffle' : 'Enable Shuffle'}
              >
                <Shuffle size={16} />
              </button>

              {/* Prev Track */}
              <button
                type="button"
                onClick={prevTrack}
                aria-label="Play previous track"
                className="p-1.5 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Previous Track"
              >
                <SkipBack size={18} />
              </button>

              {/* Play / Pause Main CTA */}
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? `Pause ${currentTrack.title}` : `Play ${currentTrack.title}`}
                title={isPlaying ? 'Pause' : 'Play'}
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-neutral-200 transition-all flex items-center justify-center shadow-md active:opacity-80 duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {isPlaying ? (
                  <Pause size={18} className="fill-black" />
                ) : (
                  <Play size={18} className="fill-black ml-0.5" />
                )}
              </button>

              {/* Next Track */}
              <button
                type="button"
                onClick={nextTrack}
                aria-label="Play next track"
                className="p-1.5 rounded-full text-neutral-300 hover:text-white transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                title="Next Track"
              >
                <SkipForward size={18} />
              </button>

              {/* Repeat Mode */}
              <button
                type="button"
                onClick={toggleRepeat}
                aria-label={`Toggle repeat, currently ${repeatMode}`}
                className={`p-1.5 rounded-full hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  repeatMode !== 'off' ? 'text-white' : 'text-neutral-400'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
              </button>
            </div>

            {/* Draggable Progress Bar */}
            <ProgressBar showTimes={true} className="w-full flex" />
          </div>

          {/* Right: Auxiliary Controls (Queue, Volume, Video, Fullscreen) */}
          <div className="flex items-center justify-end gap-2.5 w-[30%] max-w-[280px]">

            {/* Report Playback Issue Button */}
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
              aria-label="Report playback issue"
              className="p-2 rounded-full text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Report Playback Issue"
            >
              <Flag size={15} />
            </button>


            {/* Lyrics View Toggle Button */}
            <button
              type="button"
              onClick={toggleLyrics}
              aria-label={isLyricsOpen ? 'Close lyrics' : 'Open lyrics'}
              aria-expanded={isLyricsOpen}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isLyricsOpen ? 'text-white bg-white/10' : 'text-neutral-300 hover:text-white'
              }`}
              title="Lyrics"
            >
              <Mic2 size={17} />
            </button>

            {/* Queue Drawer Button */}
            <button
              type="button"
              onClick={toggleQueue}
              aria-label={isQueueOpen ? 'Close queue drawer' : 'Open queue drawer'}
              aria-expanded={isQueueOpen}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isQueueOpen ? 'text-white bg-white/10' : 'text-neutral-300 hover:text-white'
              }`}
              title="Current Queue"
            >
              <ListMusic size={18} />
            </button>

            {/* Fullscreen Player Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Expand fullscreen player"
              className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Expand View"
            >
              <Maximize2 size={17} />
            </button>

            {/* Output Device Selector (Sketch 3) */}
            <button
              type="button"
              onClick={() => setShowDevicePicker(true)}
              aria-label="Audio output devices"
              className={`p-2 rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                showDevicePicker ? 'text-emerald-400 bg-white/10' : 'text-neutral-300 hover:text-white'
              }`}
              title="Select Output Device"
            >
              <Headphones size={17} />
            </button>

            {/* Volume Control */}
            <div className="hidden lg:block">
              <VolumeControl />
            </div>
          </div>

        </div>
      </footer>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        track={currentTrack}
      />

      {/* Standalone Lyrics View Modal */}
      <LyricsView
        isOpen={isLyricsOpen}
        onClose={() => setLyricsOpen(false)}
      />

      {/* Audio Output Device Modal (Sketch 3) */}
      {showDevicePicker && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowDevicePicker(false)}
        >
          <div 
            className="w-full max-w-sm bg-[#141416] border border-white/10 rounded-3xl p-5 shadow-2xl relative animate-slideUp text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Speaker size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold">Connect to a Device</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDevicePicker(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white"
                aria-label="Close device picker"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 mt-2 mb-3">
              Currently playing in lossless high-definition audio (320 kbps).
            </p>

            <div className="space-y-2">
              {[
                { id: 'speaker', name: 'This Device (Windows PC Speakers)', icon: Laptop, status: 'Default Audio' },
                { id: 'headphones', name: 'Bluetooth Headphones / Earphones', icon: Headphones, status: 'Paired' },
                { id: 'hifi', name: 'External USB DAC / Hi-Fi Output', icon: Speaker, status: 'Ready' },
              ].map((device) => {
                const DevIcon = device.icon;
                const isSelected = selectedDeviceId === device.id;
                return (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeviceId(device.id);
                      setShowDevicePicker(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white' 
                        : 'bg-white/[0.03] border-white/5 text-neutral-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-neutral-400'}`}>
                        <DevIcon size={16} />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>{device.name}</p>
                        <p className="text-[10px] text-neutral-400">{device.status}</p>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Toast Feedback (e.g. Added to Queue) */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-pop border border-neutral-200">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
