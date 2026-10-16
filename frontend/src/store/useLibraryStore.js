import { create } from 'zustand';
import { MOCK_TRACKS, GENRES, FEATURED_MIXES } from '../data/mockTracks';
import { getArtistProfile, getAlbumData } from '../data/artistsData';
import {
  fetchPlaylistsApi,
  createPlaylistApi,
  updatePlaylistApi,
  deletePlaylistApi,
  fetchFavoritesApi,
  toggleFavoriteApi,
} from '../services/api';

// Load initial liked from localStorage (clean without demo entries)
const getInitialLikes = () => {
  try {
    const saved =
      localStorage.getItem('jennie_liked_tracks') ||
      localStorage.getItem('lora_liked_tracks') ||
      localStorage.getItem('aura_liked_tracks');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strip out legacy demo placeholder IDs
        return parsed.filter(
          (id) =>
            !String(id).startsWith('track-') &&
            !['track-1', 'track-5', 'track-9', 'track-12', 'track-18'].includes(id)
        );
      }
    }
  } catch (e) {}
  return [];
};

const getInitialLikedTrackObjects = () => {
  try {
    const saved = localStorage.getItem('jennie_liked_track_objects');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((t) => !String(t?.id).startsWith('track-'));
      }
    }
  } catch (e) {}
  return [];
};

const getInitialPlaylists = () => {
  try {
    const saved =
      localStorage.getItem('jennie_custom_playlists') ||
      localStorage.getItem('lora_custom_playlists');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strip out legacy demo playlists
        return parsed.filter((pl) => pl.id !== 'pl-coding' && pl.id !== 'pl-morning');
      }
    }
  } catch (e) {}
  return [];
};

export const useLibraryStore = create((set, get) => ({
  // Navigation
  activeView: 'home', // 'home' | 'search' | 'library' | 'favorites' | 'genre' | 'playlist' | 'feedback'
  selectedItem: null, // Holds genre object or playlist object when on detail pages

  // Feedback Modal Global State
  isFeedbackModalOpen: false,
  feedbackInitialContext: null,
  openFeedbackModal: (context = null) =>
    set({ isFeedbackModalOpen: true, feedbackInitialContext: context }),
  closeFeedbackModal: () => set({ isFeedbackModalOpen: false, feedbackInitialContext: null }),

  // Search
  searchQuery: '',
  searchFilter: 'all', // 'all' | 'songs' | 'artists' | 'genres'

  // Liked Tracks (IDs and full track objects)
  likedTrackIds: getInitialLikes(),
  likedTracks: getInitialLikedTrackObjects(),

  // User Playlists
  customPlaylists: getInitialPlaylists(),

  // Followed Artists & Saved Albums
  followedArtistIds: (() => {
    try {
      const saved = localStorage.getItem('jennie_followed_artists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),
  savedAlbumIds: (() => {
    try {
      const saved = localStorage.getItem('jennie_saved_albums');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),

  // Sync with MongoDB backend on initial startup
  syncWithBackend: async () => {
    try {
      // 1. Fetch playlists from MongoDB
      const remotePlaylists = await fetchPlaylistsApi();
      if (Array.isArray(remotePlaylists) && remotePlaylists.length > 0) {
        set({ customPlaylists: remotePlaylists });
        try {
          localStorage.setItem('jennie_custom_playlists', JSON.stringify(remotePlaylists));
        } catch (e) {}
      }

      // 2. Fetch favorites from MongoDB
      const remoteFavorites = await fetchFavoritesApi();
      if (Array.isArray(remoteFavorites) && remoteFavorites.length > 0) {
        const ids = remoteFavorites.map((f) => String(f.trackId || f.track?.id)).filter(Boolean);
        const fullTracks = remoteFavorites
          .map((f) => {
            const t = f.track || {};
            const ytId =
              t.youtubeId ||
              (typeof t.id === 'string' && t.id.startsWith('yt-')
                ? t.id.replace('yt-', '')
                : undefined);
            return { ...t, youtubeId: ytId };
          })
          .filter((t) => t.id);

        set({ likedTrackIds: ids, likedTracks: fullTracks });
        try {
          localStorage.setItem('jennie_liked_tracks', JSON.stringify(ids));
          localStorage.setItem('jennie_liked_track_objects', JSON.stringify(fullTracks));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Backend sync failed, running in local mode:', err.message);
    }
  },

  // Navigation actions
  setActiveView: (view, selectedItem = null) => {
    set({ activeView: view, selectedItem });
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSearchFilter: (filter) => {
    set({ searchFilter: filter });
  },

  // Open Artist Profile
  openArtist: (artistOrName, additionalTracks = []) => {
    const profile =
      typeof artistOrName === 'object' && artistOrName?.topTracks
        ? artistOrName
        : getArtistProfile(
            typeof artistOrName === 'object'
              ? artistOrName?.name || artistOrName?.artist
              : artistOrName,
            additionalTracks
          );
    set({ activeView: 'artist', selectedItem: profile });
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Open Album Page
  openAlbum: (albumOrTitle, artistName = '') => {
    const album =
      typeof albumOrTitle === 'object' && albumOrTitle?.tracks
        ? albumOrTitle
        : getAlbumData(
            typeof albumOrTitle === 'object' ? albumOrTitle?.title : albumOrTitle,
            artistName
          );
    set({ activeView: 'album', selectedItem: album });
    const mainEl = document.getElementById('main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Follow / Unfollow Artist
  toggleFollowArtist: (artistId) => {
    const { followedArtistIds } = get();
    const id = String(artistId);
    const updated = followedArtistIds.includes(id)
      ? followedArtistIds.filter((item) => item !== id)
      : [...followedArtistIds, id];
    set({ followedArtistIds: updated });
    try {
      localStorage.setItem('jennie_followed_artists', JSON.stringify(updated));
    } catch {}
  },

  isFollowingArtist: (artistId) => {
    return get().followedArtistIds.includes(String(artistId));
  },

  // Save / Unsave Album
  toggleSaveAlbum: (albumId) => {
    const { savedAlbumIds } = get();
    const id = String(albumId);
    const updated = savedAlbumIds.includes(id)
      ? savedAlbumIds.filter((item) => item !== id)
      : [...savedAlbumIds, id];
    set({ savedAlbumIds: updated });
    try {
      localStorage.setItem('jennie_saved_albums', JSON.stringify(updated));
    } catch {}
  },

  isAlbumSaved: (albumId) => {
    return get().savedAlbumIds.includes(String(albumId));
  },

  // Liked tracks actions
  toggleLike: (trackId, trackObject = null) => {
    const { likedTrackIds, likedTracks } = get();
    const strId = String(trackId);
    const exists = likedTrackIds.includes(strId);
    let updatedIds;
    let updatedTracks;

    if (exists) {
      updatedIds = likedTrackIds.filter((id) => id !== strId);
      updatedTracks = likedTracks.filter((t) => String(t.id) !== strId);
    } else {
      updatedIds = [...likedTrackIds, strId];
      const targetTrack = trackObject ||
        MOCK_TRACKS.find((t) => t.id === strId) || { id: strId, title: 'Saved Track' };
      const ytId =
        targetTrack.youtubeId ||
        (typeof targetTrack.id === 'string' && targetTrack.id.startsWith('yt-')
          ? targetTrack.id.replace('yt-', '')
          : undefined);
      const enrichedTrack = {
        ...targetTrack,
        youtubeId: ytId,
        source: ytId ? 'youtube' : targetTrack.source || 'jamendo',
      };
      updatedTracks = [enrichedTrack, ...likedTracks.filter((t) => String(t.id) !== strId)];
    }

    set({ likedTrackIds: updatedIds, likedTracks: updatedTracks });
    try {
      localStorage.setItem('jennie_liked_tracks', JSON.stringify(updatedIds));
      localStorage.setItem('jennie_liked_track_objects', JSON.stringify(updatedTracks));
    } catch (e) {}

    // Async MongoDB sync
    const target = trackObject || MOCK_TRACKS.find((t) => t.id === strId) || { id: strId };
    toggleFavoriteApi(target).catch(() => {});
  },

  isLiked: (trackId) => {
    return get().likedTrackIds.includes(String(trackId));
  },

  getLikedTracks: () => {
    const { likedTrackIds, likedTracks } = get();
    const map = new Map();
    // 1. Add locally saved full objects with enriched youtubeId
    likedTracks.forEach((t) => {
      if (t && t.id) {
        const ytId =
          t.youtubeId ||
          (typeof t.id === 'string' && t.id.startsWith('yt-')
            ? t.id.replace('yt-', '')
            : undefined);
        map.set(String(t.id), {
          ...t,
          youtubeId: ytId,
          source: ytId ? 'youtube' : t.source || 'jamendo',
        });
      }
    });

    // 2. Add fallback mock tracks if not yet populated
    MOCK_TRACKS.forEach((t) => {
      const sId = String(t.id);
      if (likedTrackIds.includes(sId) && !map.has(sId)) {
        map.set(sId, t);
      }
    });

    return Array.from(map.values());
  },

  // Custom playlists
  createPlaylist: (title, description = '') => {
    const newPlaylist = {
      id: `pl-${Date.now()}`,
      title: title || 'New Playlist',
      description: description || 'Personal curated music collection.',
      coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
      trackIds: [],
      tracks: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    set((state) => {
      const updated = [newPlaylist, ...state.customPlaylists];
      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}
      return { customPlaylists: updated };
    });

    // Async MongoDB sync
    createPlaylistApi(newPlaylist).catch(() => {});

    return newPlaylist;
  },

  deletePlaylist: (playlistId) => {
    set((state) => {
      const updated = state.customPlaylists.filter((p) => p.id !== playlistId);
      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}
      return {
        customPlaylists: updated,
        activeView: state.selectedItem?.id === playlistId ? 'library' : state.activeView,
      };
    });

    // Async MongoDB sync
    deletePlaylistApi(playlistId).catch(() => {});
  },

  addTrackToPlaylist: (playlistId, trackId, trackObject = null) => {
    set((state) => {
      const updated = state.customPlaylists.map((p) => {
        if (p.id === playlistId && !p.trackIds.includes(trackId)) {
          const newTrackIds = [...p.trackIds, trackId];
          const newTracks = trackObject ? [...(p.tracks || []), trackObject] : p.tracks || [];
          return { ...p, trackIds: newTrackIds, tracks: newTracks };
        }
        return p;
      });

      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}

      const pl = updated.find((p) => p.id === playlistId);
      if (pl) {
        updatePlaylistApi(playlistId, { trackIds: pl.trackIds, tracks: pl.tracks }).catch(() => {});
      }

      return { customPlaylists: updated };
    });
  },

  removeTrackFromPlaylist: (playlistId, trackId) => {
    set((state) => {
      const updated = state.customPlaylists.map((p) => {
        if (p.id === playlistId) {
          const newTrackIds = p.trackIds.filter((id) => id !== trackId);
          const newTracks = (p.tracks || []).filter((t) => t.id !== trackId);
          return { ...p, trackIds: newTrackIds, tracks: newTracks };
        }
        return p;
      });

      try {
        localStorage.setItem('jennie_custom_playlists', JSON.stringify(updated));
      } catch (e) {}

      const pl = updated.find((p) => p.id === playlistId);
      if (pl) {
        updatePlaylistApi(playlistId, { trackIds: pl.trackIds, tracks: pl.tracks }).catch(() => {});
      }

      return { customPlaylists: updated };
    });
  },
}));
