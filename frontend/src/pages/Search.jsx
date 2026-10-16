import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search as SearchIcon, 
  X, 
  Disc, 
  Play, 
  Pause, 
  Clock, 
  Trash2, 
  Music, 
  CheckCircle,
  User,
  ChevronRight
} from 'lucide-react';
import { TrackTable } from '../components/tracks';
import { useLibraryStore } from '../store/useLibraryStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchTracks } from '../services/api';
import { searchArtistsAndAlbums, getArtistProfile, getAlbumData, checkArtistQueryMatch } from '../data/artistsData';
import { getTrackCoverUrl } from '../data/mockTracks';

export const Search = () => {
  const searchQuery = useLibraryStore((state) => state.searchQuery);
  const setSearchQuery = useLibraryStore((state) => state.setSearchQuery);
  const searchFilter = useLibraryStore((state) => state.searchFilter);
  const setSearchFilter = useLibraryStore((state) => state.setSearchFilter);
  const openArtist = useLibraryStore((state) => state.openArtist);
  const openAlbum = useLibraryStore((state) => state.openAlbum);

  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const togglePlay = usePlayerStore((state) => state.togglePlay);

  const [liveTracks, setLiveTracks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [source, setSource] = useState('all'); // 'all' | 'youtube' | 'audius' | 'jamendo'

  // Spotify-style Search History (tracks played from search)
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('jennie_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToRecentSearches = (track) => {
    if (!track || !track.id) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 15);
      try {
        localStorage.setItem('jennie_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeFromRecentSearches = (e, trackId) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t.id !== trackId);
      try {
        localStorage.setItem('jennie_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('jennie_recent_searches');
    } catch {}
  };

  const query = searchQuery.trim().toLowerCase();

  // Curated Artists & Albums match with liveTracks fallback
  const { artists: matchingArtists, albums: matchingAlbums } = useMemo(() => {
    if (!query) return { artists: [], albums: [] };
    const res = searchArtistsAndAlbums(query, liveTracks);

    // If still no artists matched, scan liveTracks from YouTube to find artists
    if (res.artists.length === 0 && Array.isArray(liveTracks) && liveTracks.length > 0) {
      const extracted = [];
      liveTracks.forEach((t) => {
        if (!t || !t.artist) return;
        const rawArtist = t.artist.trim();
        const lower = rawArtist.toLowerCase();
        const isLabel = [
          't-series', 'tseries', 'sony music', 'zee music', 
          'speed records', 'yrf', 'tips official', 'eros now', 'saregama'
        ].some((lbl) => lower.includes(lbl));
        if (isLabel) return;

        if (!extracted.some((a) => a.name.toLowerCase() === rawArtist.toLowerCase())) {
          extracted.push(getArtistProfile(rawArtist, liveTracks));
        }
      });
      if (extracted.length > 0) {
        res.artists = extracted;
      }
    }

    return res;
  }, [query, liveTracks]);

  // Live Track Search from Backend API / YouTube
  useEffect(() => {
    if (!query) {
      setLiveTracks([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      searchTracks(query, searchFilter === 'albums' ? 'all' : searchFilter, source)
        .then((tracks) => {
          setLiveTracks(tracks || []);
          setIsSearching(false);
        })
        .catch(() => {
          setIsSearching(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query, searchFilter, source]);

  const setSearchResultsContext = usePlayerStore((state) => state.setSearchResultsContext);

  const filteredTracks = liveTracks;

  // Determine Spotify-Style Top Result:
  // If the query is matching an artist strongly, the top result is the Artist profile card!
  // If the query is matching an album, the top result is the Album card!
  // Otherwise, it is the top song track.
  const isArtistQuery = matchingArtists.length > 0 && (
    searchFilter === 'artists' ||
    checkArtistQueryMatch(query, matchingArtists[0]) ||
    matchingArtists[0].name.toLowerCase().includes(query) ||
    query.includes(matchingArtists[0].name.toLowerCase().slice(0, 4)) ||
    liveTracks.slice(0, 4).some((t) => t.artist && checkArtistQueryMatch(t.artist, matchingArtists[0]))
  );

  const isAlbumQuery = !isArtistQuery && matchingAlbums.length > 0 && (
    searchFilter === 'albums' ||
    matchingAlbums[0].title.toLowerCase().includes(query)
  );

  const topArtist = isArtistQuery ? matchingArtists[0] : null;
  const topAlbum = isAlbumQuery ? matchingAlbums[0] : null;
  const topSong = filteredTracks.length > 0 ? filteredTracks[0] : null;

  const isTopSongPlaying = topSong && currentTrack?.id === topSong.id && isPlaying;

  const handleTopSongPlay = () => {
    if (!topSong) return;
    saveToRecentSearches(topSong);
    setSearchResultsContext(filteredTracks);
    if (currentTrack?.id === topSong.id) {
      togglePlay();
    } else {
      playTrack(topSong);
    }
  };

  const handleArtistPlay = (artist) => {
    const profile = getArtistProfile(artist.name || artist, liveTracks);
    if (profile && profile.topTracks && profile.topTracks.length > 0) {
      playTrack(profile.topTracks[0], profile.topTracks);
    }
  };

  const handleAlbumPlay = (album) => {
    const albumData = getAlbumData(album.title || album, album.artist);
    if (albumData && albumData.tracks && albumData.tracks.length > 0) {
      playTrack(albumData.tracks[0], albumData.tracks);
    }
  };

  const handleRecentTrackPlay = (track) => {
    saveToRecentSearches(track);
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleTrackTablePlay = (track) => {
    saveToRecentSearches(track);
    setSearchResultsContext(filteredTracks);
  };

  const quickSuggestions = [
    'Arijit Singh',
    'Karan Aujla',
    'Diljit Dosanjh',
    'AP Dhillon',
    'The Weeknd',
    'ANIMAL',
    'Brahmastra',
    'Tauba Tauba',
    'Kesariya',
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* ─── SEARCH INPUT BAR ─────────────────────────────────────────────── */}
      <div className="space-y-3.5">
        <div className="relative max-w-2xl">
          <label htmlFor="main-search-input" className="sr-only">
            Search songs, artists, or albums
          </label>
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" aria-hidden="true" />
          <input
            id="main-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to play? (Artists, albums, songs)"
            autoFocus
            className="w-full pl-11 pr-10 py-3.5 bg-[#161616] hover:bg-[#1C1C1C] focus:bg-[#202020] focus-visible:ring-2 focus-visible:ring-white rounded-2xl text-white text-sm placeholder:text-neutral-500 focus:outline-none transition-all shadow-inner border border-white/5"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              title="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-400 hover:text-white bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Content Type Filter Pills */}
        {query && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs" role="toolbar" aria-label="Search Filters">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {['all', 'songs', 'artists', 'albums'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSearchFilter(f)}
                  aria-pressed={searchFilter === f}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-300 active:opacity-75 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    searchFilter === f
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-[#141414] text-neutral-300 hover:text-white hover:bg-[#1E1E1E] border border-white/[0.06]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-white/10 flex-shrink-0 mx-1" aria-hidden="true" />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {[
                { id: 'all', label: 'All Sources' },
                { id: 'youtube', label: 'YouTube Hits' },
                { id: 'jamendo', label: 'Jamendo' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSource(s.id)}
                  aria-pressed={source === s.id}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    source === s.id
                      ? 'bg-neutral-800 text-white font-semibold border-white/20 shadow-sm'
                      : 'bg-[#141414] text-neutral-400 hover:text-white border-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── ACTIVE SEARCH RESULTS ────────────────────────────────────────── */}
      {query ? (
        <div className="space-y-8 animate-luxury-fade">
          {isSearching && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 py-1" role="status">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" aria-hidden="true" />
              <span className="font-medium tracking-wide">Searching songs, artists & albums...</span>
            </div>
          )}

          {/* 1. ARTISTS ONLY FILTER VIEW */}
          {searchFilter === 'artists' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Artists ({matchingArtists.length})
              </h3>
              {matchingArtists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {matchingArtists.map((artist) => (
                    <div
                      key={artist.id}
                      onClick={() => openArtist(artist, liveTracks)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openArtist(artist, liveTracks);
                        }
                      }}
                      className="group p-5 rounded-2xl bg-[#141416] hover:bg-[#1C1C20] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/15 flex flex-col items-center text-center relative"
                    >
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden mb-3 shadow-xl bg-neutral-900">
                        <img
                          src={artist.avatarUrl}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArtistPlay(artist);
                          }}
                          className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                          title={`Play ${artist.name}`}
                        >
                          <Play size={18} className="fill-black ml-0.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate w-full group-hover:text-white">
                        {artist.name}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
                        <span>Artist</span>
                        {artist.verified && <Sparkles size={11} className="text-blue-400" />}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-400 bg-[#121212] rounded-2xl border border-white/5">
                  <User size={32} className="mx-auto mb-2 text-neutral-500" />
                  <p className="text-sm font-medium">No verified artists found for &quot;{searchQuery}&quot;</p>
                  {topSong && (
                    <button
                      type="button"
                      onClick={() => openArtist(topSong.artist, liveTracks)}
                      className="mt-3 px-4 py-2 rounded-full bg-white text-black text-xs font-bold hover:bg-neutral-200"
                    >
                      View Profile for {topSong.artist}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. ALBUMS ONLY FILTER VIEW */}
          {searchFilter === 'albums' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Albums ({matchingAlbums.length})
              </h3>
              {matchingAlbums.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {matchingAlbums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => openAlbum(album, album.artist)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openAlbum(album, album.artist);
                        }
                      }}
                      className="group p-3.5 rounded-2xl bg-[#141416] hover:bg-[#1C1C20] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/15 flex flex-col justify-between"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 mb-3 shadow-md">
                        <img
                          src={album.coverUrl}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlbumPlay(album);
                          }}
                          className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                          title={`Play ${album.title}`}
                        >
                          <Play size={16} className="fill-black ml-0.5" />
                        </button>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate" title={album.title}>
                          {album.title}
                        </h4>
                        <p className="text-xs text-neutral-400 mt-1 truncate">
                          {album.releaseYear} • {album.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-400 bg-[#121212] rounded-2xl border border-white/5">
                  <Disc size={32} className="mx-auto mb-2 text-neutral-500 opacity-60" />
                  <p className="text-sm font-medium">No albums matching &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>
          )}

          {/* 3. SONGS ONLY FILTER VIEW */}
          {searchFilter === 'songs' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Songs ({filteredTracks.length})
              </h3>
              <div className="bg-[#121212] rounded-2xl p-2 border border-white/5 shadow-xl">
                <TrackTable 
                  tracks={filteredTracks} 
                  queue={filteredTracks} 
                  onPlay={saveToRecentSearches}
                />
              </div>
            </div>
          )}

          {/* 4. ALL FILTER VIEW (SPOTIFY COMPREHENSIVE VIEW) */}
          {searchFilter === 'all' && (
            <div className="space-y-8">
              {/* Top Row: Top Match + 4 Songs Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* ── SPOTIFY TOP MATCH (ARTIST OR SONG OR ALBUM) ── */}
                <div className="col-span-1 space-y-2 flex flex-col">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Top Result</h3>

                  {topArtist ? (
                    /* ARTIST TOP RESULT */
                    <div
                      onClick={() => openArtist(topArtist, liveTracks)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openArtist(topArtist, liveTracks);
                        }
                      }}
                      className="group relative p-6 rounded-2xl bg-[#141416] hover:bg-[#1A1A1E] transition-all duration-300 cursor-pointer border border-white/[0.06] hover:border-white/15 shadow-xl flex flex-col justify-between flex-grow"
                    >
                      <div>
                        <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-2xl mb-4 bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center select-none">
                          {topArtist.avatarUrl ? (
                            <img
                              src={topArtist.avatarUrl}
                              alt={topArtist.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-3xl font-black text-white tracking-wider">
                              {(topArtist.name || 'Artist').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h4 className="text-2xl font-black text-white tracking-tight leading-tight">
                          {topArtist.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black">
                            Artist
                          </span>
                          {topArtist.verified && (
                            <span className="text-xs text-blue-400 flex items-center gap-1 font-semibold">
                              <CheckCircle size={11} /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 mt-2 font-medium">
                          {topArtist.monthlyListeners || '15,000,000'} monthly listeners
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArtistPlay(topArtist);
                        }}
                        className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
                        title={`Play ${topArtist.name}`}
                      >
                        <Play size={20} className="fill-black ml-0.5" />
                      </button>
                    </div>
                  ) : topAlbum ? (
                    /* ALBUM TOP RESULT */
                    <div
                      onClick={() => openAlbum(topAlbum, topAlbum.artist)}
                      role="button"
                      tabIndex={0}
                      className="group relative p-6 rounded-2xl bg-[#141416] hover:bg-[#1A1A1E] transition-all duration-300 cursor-pointer border border-white/[0.06] hover:border-white/15 shadow-xl flex flex-col justify-between flex-grow"
                    >
                      <div>
                        <img
                          src={topAlbum.coverUrl}
                          alt={topAlbum.title}
                          className="w-24 h-24 rounded-xl object-cover shadow-2xl mb-4 bg-neutral-900 group-hover:scale-[1.02] transition-transform duration-500"
                        />
                        <h4 className="text-2xl font-bold text-white tracking-tight leading-tight line-clamp-2">
                          {topAlbum.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black">
                            Album
                          </span>
                          <span className="text-xs text-neutral-300 font-medium">
                            {topAlbum.artist} • {topAlbum.releaseYear}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlbumPlay(topAlbum);
                        }}
                        className="absolute right-5 bottom-5 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                      >
                        <Play size={20} className="fill-black ml-0.5" />
                      </button>
                    </div>
                  ) : topSong ? (
                    /* SONG TOP RESULT */
                    <div
                      onClick={handleTopSongPlay}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTopSongPlay();
                        }
                      }}
                      className="group relative p-5 rounded-2xl bg-[#141414] hover:bg-[#181818] transition-all duration-300 cursor-pointer border border-white/[0.06] hover:border-white/15 shadow-xl flex flex-col justify-between flex-grow"
                    >
                      <div>
                        <img
                          src={getTrackCoverUrl(topSong)}
                          alt={`Artwork for ${topSong.title}`}
                          className="w-24 h-24 rounded-xl object-cover shadow-2xl mb-4 bg-neutral-900 group-hover:scale-[1.02] transition-transform duration-500"
                        />
                        <h4 className="text-2xl font-bold text-white tracking-tight leading-tight line-clamp-2">
                          {topSong.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-neutral-400 font-medium">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-black">
                            Song
                          </span>
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              openArtist(topSong.artist, liveTracks);
                            }}
                            className="text-white hover:underline truncate max-w-[140px]"
                          >
                            {topSong.artist}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopSongPlay();
                        }}
                        aria-label={isTopSongPlaying ? `Pause ${topSong.title}` : `Play ${topSong.title}`}
                        className={`absolute right-5 bottom-5 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                          isTopSongPlaying
                            ? 'opacity-100 translate-y-0'
                            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                        }`}
                      >
                        {isTopSongPlaying ? (
                          <Pause size={20} className="fill-black" />
                        ) : (
                          <Play size={20} className="fill-black ml-0.5" />
                        )}
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* ── TOP SONGS TABLE ── */}
                <div className="col-span-1 lg:col-span-2 space-y-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Songs ({Math.min(filteredTracks.length, 4)})
                  </h3>
                  <div className="bg-[#121212] rounded-2xl p-2 border border-white/5 shadow-xl h-[calc(100%-24px)] flex flex-col justify-center">
                    <TrackTable 
                      tracks={filteredTracks.slice(0, 4)} 
                      queue={null} 
                      onPlay={handleTrackTablePlay}
                    />
                  </div>
                </div>
              </div>

              {/* ── MATCHING ARTISTS SECTION ── */}
              {matchingArtists.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white tracking-tight">Artists</h3>
                    <button
                      type="button"
                      onClick={() => setSearchFilter('artists')}
                      className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                    >
                      Show all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {matchingArtists.slice(0, 5).map((artist) => (
                      <div
                        key={artist.id}
                        onClick={() => openArtist(artist, liveTracks)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openArtist(artist, liveTracks);
                          }
                        }}
                        className="group p-4 rounded-2xl bg-[#141416] hover:bg-[#1A1A1E] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/15 flex flex-col items-center text-center relative"
                      >
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-3 shadow-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center select-none">
                          {artist.avatarUrl ? (
                            <img
                              src={artist.avatarUrl}
                              alt={artist.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <span className="text-xl sm:text-2xl font-black text-white tracking-wider">
                              {(artist.name || 'Artist').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArtistPlay(artist);
                            }}
                            className="absolute right-1 bottom-1 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                            title={`Play ${artist.name}`}
                          >
                            <Play size={16} className="fill-black ml-0.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate w-full group-hover:text-white">
                          {artist.name}
                        </h4>
                        <span className="text-xs text-neutral-400 mt-0.5">Artist</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── MATCHING ALBUMS SECTION ── */}
              {matchingAlbums.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white tracking-tight">Albums & Singles</h3>
                    <button
                      type="button"
                      onClick={() => setSearchFilter('albums')}
                      className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                    >
                      Show all
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {matchingAlbums.slice(0, 6).map((album) => (
                      <div
                        key={album.id}
                        onClick={() => openAlbum(album, album.artist)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openAlbum(album, album.artist);
                          }
                        }}
                        className="group p-3 rounded-2xl bg-[#141416] hover:bg-[#1A1A1E] transition-all duration-300 cursor-pointer border border-white/[0.05] hover:border-white/15"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 mb-2.5 shadow-md">
                          <img
                            src={album.coverUrl}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlbumPlay(album);
                            }}
                            className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95"
                          >
                            <Play size={15} className="fill-black ml-0.5" />
                          </button>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate" title={album.title}>
                          {album.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                          {album.releaseYear} • {album.artist}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── MORE SONGS ── */}
              {filteredTracks.length > 4 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    More Songs ({filteredTracks.length - 4})
                  </h3>
                  <div className="bg-[#121212] rounded-2xl p-2 border border-white/5 shadow-xl">
                    <TrackTable
                      tracks={filteredTracks.slice(4)}
                      queue={null}
                      startIndex={4}
                      onPlay={handleTrackTablePlay}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {filteredTracks.length === 0 && matchingArtists.length === 0 && matchingAlbums.length === 0 && !isSearching && (
            <div className="text-center py-16 bg-[#121212] rounded-2xl p-6 border border-white/5">
              <Disc size={32} className="text-neutral-500 mx-auto mb-2.5 opacity-60" aria-hidden="true" />
              <h3 className="text-base font-bold text-white">No results found for &quot;{searchQuery}&quot;</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                Try searching for artists like Arijit Singh, Karan Aujla, Diljit Dosanjh, or albums like Brahmastra or ANIMAL.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Empty Query: Spotify-Style Recent Searches */
        <div className="space-y-6 animate-luxury-fade">
          {recentSearches.length > 0 ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-neutral-400" />
                  <h2 className="text-base md:text-lg font-bold text-white tracking-tight">Recent searches</h2>
                </div>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 hover:underline"
                >
                  <Trash2 size={13} />
                  <span>Clear recent searches</span>
                </button>
              </div>

              <div className="bg-[#121212] rounded-2xl border border-white/5 p-2 shadow-xl divide-y divide-white/[0.04]">
                {recentSearches.map((track) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isCurrentPlaying = isCurrent && isPlaying;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleRecentTrackPlay(track)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRecentTrackPlay(track);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Play ${track.title} by ${track.artist}`}
                      className="group flex items-center justify-between gap-3.5 p-2.5 sm:p-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 shadow">
                          <img
                            src={getTrackCoverUrl(track)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isCurrentPlaying ? (
                              <Pause size={16} className="fill-white text-white" />
                            ) : (
                              <Play size={16} className="fill-white text-white ml-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-semibold truncate ${isCurrent ? 'text-white font-bold' : 'text-neutral-200'}`}>
                            {track.title}
                          </h4>
                          <p 
                            onClick={(e) => {
                              e.stopPropagation();
                              openArtist(track.artist, liveTracks);
                            }}
                            className="text-xs text-neutral-400 hover:text-white hover:underline truncate mt-0.5 cursor-pointer"
                          >
                            Song • {track.artist}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeFromRecentSearches(e, track.id)}
                        aria-label={`Remove ${track.title} from history`}
                        title="Remove from history"
                        className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-[#121212] rounded-2xl border border-white/5 p-8 max-w-lg mx-auto">
              <SearchIcon size={36} className="mx-auto mb-3 text-neutral-500 opacity-60" />
              <h3 className="text-base font-bold text-white">Find your favorite music</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                Search for your favorite artists, albums, and songs in Hindi, Punjabi, and Bollywood.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {quickSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setSearchQuery(sug)}
                    className="px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/15 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
