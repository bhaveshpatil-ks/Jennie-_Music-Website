import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Shuffle, 
  Check, 
  Plus, 
  Disc, 
  Share2, 
  ChevronRight, 
  CheckCircle,
  Music2,
  Clock,
  ListPlus,
  ListMusic
} from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { useLibraryStore } from '../store/useLibraryStore';
import { LikeButton } from '../components/common/LikeButton';
import { AddToPlaylistModal } from '../components/common/AddToPlaylistModal';
import { formatDuration } from '../utils/formatters';
import { getTrackCoverUrl } from '../data/mockTracks';

export const ArtistDetail = ({ artist }) => {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const togglePlay = usePlayerStore((state) => state.togglePlay);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const showToast = usePlayerStore((state) => state.showToast);

  const openArtist = useLibraryStore((state) => state.openArtist);
  const openAlbum = useLibraryStore((state) => state.openAlbum);
  const isFollowingArtist = useLibraryStore((state) => state.isFollowingArtist);
  const toggleFollowArtist = useLibraryStore((state) => state.toggleFollowArtist);
  const setActiveView = useLibraryStore((state) => state.setActiveView);

  const [showAllTopTracks, setShowAllTopTracks] = useState(false);
  const [discographyTab, setDiscographyTab] = useState('all'); // 'all' | 'albums' | 'singles'
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);

  if (!artist) {
    return (
      <div className="py-20 text-center text-neutral-400">
        <p>No artist profile found.</p>
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className="mt-4 px-5 py-2.5 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
        >
          Explore Music
        </button>
      </div>
    );
  }

  const isFollowing = isFollowingArtist(artist.id);
  const topTracks = artist.topTracks || [];
  const visibleTracks = showAllTopTracks ? topTracks.slice(0, 10) : topTracks.slice(0, 5);

  const isCurrentArtistPlaying = topTracks.some((t) => t.id === currentTrack?.id) && isPlaying;

  const handlePlayArtist = () => {
    if (isCurrentArtistPlaying) {
      togglePlay();
    } else if (topTracks.length > 0) {
      playTrack(topTracks[0], topTracks);
    }
  };

  const handleShuffleArtist = () => {
    if (topTracks.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * topTracks.length);
      playTrack(topTracks[randomIndex], topTracks);
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      if (showToast) showToast(`Copied ${artist.name}'s profile link!`);
    }
  };

  // Discography filtering
  const allReleases = [
    ...(artist.albums || []).map((a) => ({ ...a, category: 'album' })),
    ...(artist.singles || []).map((s) => ({ ...s, category: 'single' }))
  ];

  const filteredReleases = discographyTab === 'all'
    ? allReleases
    : discographyTab === 'albums'
      ? allReleases.filter((r) => r.category === 'album')
      : allReleases.filter((r) => r.category === 'single');

  return (
    <div className="space-y-8 pb-28 -mx-4 sm:-mx-6 -mt-6">
      {/* ─── ARCHITECTURAL HERO BANNER ────────────────────────────────────────── */}
      <div className="relative min-h-[280px] md:min-h-[340px] flex flex-col justify-end p-6 md:p-10 overflow-hidden bg-gradient-to-br from-[#18181F] via-[#101014] to-[#0A0A0C] border-b border-white/[0.06]">
        {/* Subtle architectural radial illumination */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: artist.headerColor || '#3B82F6' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Minimalist Monogram Badge instead of fake stock photo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center shadow-2xl flex-shrink-0 select-none">
              <span className="text-xl sm:text-2xl font-black text-white tracking-wider">
                {(artist.name || 'Artist').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
              </span>
            </div>

            <div className="space-y-1.5 min-w-0">
              {/* Verified Badge */}
              {artist.verified && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
                  <CheckCircle size={13} className="text-blue-400" />
                  <span>Verified Artist</span>
                </div>
              )}

              {/* Artist Name */}
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none truncate">
                {artist.name}
              </h1>
            </div>
          </div>

          {/* Stats & Genres */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300 font-medium pt-1">
            <span className="text-white font-semibold">
              {artist.monthlyListeners || '12,500,000'} monthly listeners
            </span>
            {artist.followers && (
              <>
                <span className="text-neutral-500">•</span>
                <span>{artist.followers} followers</span>
              </>
            )}
            {artist.genres && artist.genres.length > 0 && (
              <>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">{artist.genres.slice(0, 3).join(', ')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 space-y-10">
        {/* ─── ACTION BAR (PLAY / FOLLOW / SHUFFLE / SHARE) ──────────────────── */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {/* Big Spotify-Style Play Button */}
          <button
            type="button"
            onClick={handlePlayArtist}
            aria-label={isCurrentArtistPlaying ? `Pause ${artist.name}` : `Play ${artist.name}`}
            className="w-14 h-14 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {isCurrentArtistPlaying ? (
              <Pause size={24} className="fill-black" />
            ) : (
              <Play size={24} className="fill-black ml-1" />
            )}
          </button>

          {/* Shuffle Button */}
          <button
            type="button"
            onClick={handleShuffleArtist}
            title="Shuffle play"
            className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Shuffle size={22} />
          </button>

          {/* Follow Button */}
          <button
            type="button"
            onClick={() => toggleFollowArtist(artist.id)}
            className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isFollowing
                ? 'bg-transparent text-white border-white/40 hover:border-white'
                : 'bg-white text-black border-white hover:bg-neutral-200'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            title="Share profile"
            className="p-3 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* ─── POPULAR / TOP TRACKS ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">Popular</h2>
          
          <div className="space-y-1">
            {visibleTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentTrackPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, topTracks)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      playTrack(track, topTracks);
                    }
                  }}
                  className={`group flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.07] transition-colors cursor-pointer border border-transparent hover:border-white/5 ${
                    isCurrent ? 'bg-white/10 text-white' : 'text-neutral-300'
                  }`}
                >
                  {/* Left: Index # or Play Icon, Cover & Title */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="w-5 text-center text-sm font-semibold text-neutral-400 group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) togglePlay();
                        else playTrack(track, topTracks);
                      }}
                      className="w-5 hidden group-hover:flex items-center justify-center text-white"
                      aria-label="Play song"
                    >
                      {isCurrentTrackPlaying ? (
                        <Pause size={15} className="fill-white" />
                      ) : (
                        <Play size={15} className="fill-white ml-0.5" />
                      )}
                    </button>

                    <img
                      src={getTrackCoverUrl(track)}
                      alt=""
                      className="w-11 h-11 rounded-lg object-cover bg-neutral-900 flex-shrink-0 shadow-md"
                    />

                    <div className="min-w-0 flex-1 pr-4">
                      <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-white font-bold' : 'text-neutral-200'}`}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-neutral-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Play count */}
                  <div className="hidden sm:block text-xs text-neutral-400 font-mono w-32 text-right">
                    {track.plays || '24,500,000'}
                  </div>

                  {/* Right: Actions & Duration */}
                  <div className="flex items-center gap-2 sm:gap-3 ml-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      title="Add to queue"
                      className="p-1.5 rounded-full text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ListMusic size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrackForPlaylist(track);
                      }}
                      title="Add to playlist"
                      className="p-1.5 rounded-full text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ListPlus size={16} />
                    </button>

                    <div onClick={(e) => e.stopPropagation()}>
                      <LikeButton trackId={track.id} size={16} />
                    </div>

                    <span className="text-xs text-neutral-400 font-mono w-10 text-right">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {topTracks.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllTopTracks(!showAllTopTracks)}
              className="text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white pt-2 transition-colors"
            >
              {showAllTopTracks ? 'Show less' : 'See more'}
            </button>
          )}
        </div>

        {/* ─── DISCOGRAPHY / ALBUMS & SINGLES ───────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Discography</h2>
            <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-full border border-white/5 text-xs">
              {[
                { id: 'all', label: 'All Releases' },
                { id: 'albums', label: 'Albums' },
                { id: 'singles', label: 'Singles & EPs' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDiscographyTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold transition-all ${
                    discographyTab === tab.id
                      ? 'bg-white text-black shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredReleases.length === 0 ? (
            <p className="text-xs text-neutral-500 py-6">No releases found in this category.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredReleases.map((release) => (
                <div
                  key={release.id}
                  onClick={() => openAlbum(release, artist.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openAlbum(release, artist.name);
                    }
                  }}
                  className="group relative p-3.5 rounded-2xl bg-[#141416] hover:bg-[#1A1A1E] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/15 flex flex-col justify-between"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 mb-3 shadow-lg">
                    <img
                      src={release.coverUrl}
                      alt={release.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        <Play size={18} className="fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-white transition-colors" title={release.title}>
                      {release.title}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5 font-medium">
                      <span>{release.releaseYear}</span>
                      <span>•</span>
                      <span className="capitalize">{release.type || 'Album'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── ABOUT / BIO CARD ─────────────────────────────────────────────── */}
        {artist.bio && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">About</h2>
            <div 
              onClick={handleShare}
              role="button"
              tabIndex={0}
              className="relative rounded-3xl overflow-hidden p-8 md:p-10 bg-gradient-to-br from-[#16161A] to-[#0E0E12] cursor-pointer group shadow-2xl border border-white/10"
              style={{ minHeight: '220px' }}
            >
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="text-3xl font-black text-white block">
                  {artist.monthlyListeners || '12,500,000'} monthly listeners
                </span>
                <p className="text-sm text-neutral-300 leading-relaxed line-clamp-4">
                  {artist.bio}
                </p>
                <div className="pt-2">
                  <span className="text-xs font-semibold text-white/90 group-hover:text-white flex items-center gap-1">
                    Verified Artist Profile <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── FANS ALSO LIKE / RELATED ARTISTS ─────────────────────────────── */}
        {artist.relatedArtists && artist.relatedArtists.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Fans Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artist.relatedArtists.map((related) => (
                <div
                  key={related.id}
                  onClick={() => openArtist(related)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openArtist(related);
                    }
                  }}
                  className="group p-4 rounded-2xl bg-[#141416] hover:bg-[#1A1A1E] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/15 flex flex-col items-center text-center select-none"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 shadow-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all duration-300">
                    <span className="text-lg sm:text-xl font-bold tracking-wider text-neutral-200 group-hover:text-white">
                      {(related.name || 'Artist').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate w-full group-hover:text-white">
                    {related.name}
                  </h4>
                  <span className="text-xs text-neutral-400 mt-0.5">Artist</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Playlist addition modal */}
      <AddToPlaylistModal
        isOpen={Boolean(selectedTrackForPlaylist)}
        onClose={() => setSelectedTrackForPlaylist(null)}
        track={selectedTrackForPlaylist}
      />
    </div>
  );
};
