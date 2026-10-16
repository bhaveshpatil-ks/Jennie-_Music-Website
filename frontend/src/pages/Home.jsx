import React, { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Headphones,
  Moon,
  Zap,
  Music4,
  Disc3,
  User,
  Play,
} from 'lucide-react';
import { MOCK_TRACKS, GENRES, FEATURED_MIXES } from '../data/mockTracks';
import { ARTISTS_DATA } from '../data/artistsData';
import { TrackCard } from '../components/tracks';
import { GenreTile } from '../components/common';
import { useLibraryStore } from '../store/useLibraryStore';
import { useAuthStore } from '../store/useAuthStore';
import { fetchHomeFeed } from '../services/api';

export const Home = () => {
  const setActiveView = useLibraryStore((state) => state.setActiveView);
  const openAlbum = useLibraryStore((state) => state.openAlbum);
  const openArtist = useLibraryStore((state) => state.openArtist);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const [feed, setFeed] = useState({
    featured: MOCK_TRACKS.find((t) => t.featured) || MOCK_TRACKS[0],
    trending: MOCK_TRACKS.slice(0, 8),
    bollywood: MOCK_TRACKS.filter((t) => t.genre === 'Bollywood'),
    punjabi: MOCK_TRACKS.filter((t) => t.genre?.includes('Punjabi')),
    lofi: MOCK_TRACKS.filter((t) => t.genre === 'Lo-Fi'),
    synthwave: MOCK_TRACKS.filter((t) => t.genre === 'Synthwave'),
    ambient: MOCK_TRACKS.filter((t) => t.genre === 'Ambient'),
    house: MOCK_TRACKS.filter((t) => t.genre === 'Deep House'),
    acoustic: MOCK_TRACKS.filter((t) => t.genre === 'Acoustic' || t.genre === 'Classical'),
  });

  useEffect(() => {
    let mounted = true;
    fetchHomeFeed().then((data) => {
      if (mounted && data) {
        setFeed((prev) => ({
          ...prev,
          ...data,
          featured: data.featured || prev.featured,
        }));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const top50Tracks = [
    'yt-BddP6PYo2gs', // Kesariya
    'yt-n_FCrCQ6-9U', // 295
    'yt-iAIBF2ngbWY', // Pehle Bhi Main
    'yt-LK7-_dgAVQE', // Softly
    'yt-SAcpESN_Fk4', // Dil Diyan Gallan
    'yt-3A-xVp-sW_4', // Sunn Raha Hai
    'yt-4tywp83zkmk', // Cheques
    'yt-cl0a3i2wFcc', // Lover
    'yt-Dmm_s6O_t7o', // Jugnu
    'yt-a18py61_F_w'  // Tajdar-e-Haram
  ].map(id => MOCK_TRACKS.find(t => t.id === id)).filter(Boolean);

  const bollywoodTracks = [
    'yt-RLzC55ai0eo', // Satranga
    'yt-zRtPUIumXcY', // Deewani Mastani
    'yt-Il4wSflh4a4', // Tere Sang Yaara
    'yt-a_V8F788-p8', // Kaise Hua
    'yt-sCbbMZ-q4-I', // Lut Gaye
    'yt-T94PHkuydcw', // Kun Faya Kun
    'yt-pp8vbcOCm8k', // Ghar More Pardesiya
    'yt-Bi7sSC046dk'  // Tum Se Hi
  ].map(id => MOCK_TRACKS.find(t => t.id === id)).filter(Boolean);

  const punjabiTracks = [
    'yt-6xoB4ZiKKn0', // The Last Ride
    'yt-vsWxs1tuwDk', // Winning Speech
    'yt-4DfVxVeqk2o', // Born to Shine
    'yt-VNs_cCtdbPc', // Brown Munde
    'yt-GgmFC83T24Y', // So High
    'yt-p4oX1lqA8U8', // Kinni Kinni
    'yt-vX2cDW8LUWk', // Excuses
    'yt-ZgG-2XG_r34'  // Same Beef
  ].map(id => MOCK_TRACKS.find(t => t.id === id)).filter(Boolean);

  const romanceTracks = [
    'yt-V7LwfY5U5WI', // Jeena Jeena
    'yt-K3b2wcfP_u0', // Saibo
    'yt-ElZfdU54Cp8', // Apna Bana Le
    'yt-gvyUuxdRdR4', // Raataan Lambiyan
    'yt-P8PWN1OmZOA', // Tu Jaane Na
    'yt-H2Fp18rYFJE', // Naseeb Se
    'yt-Vn_Vhycfhrc', // Teri Ore
    'yt-cWMxCE2HTag'  // Channa Mereya
  ].map(id => MOCK_TRACKS.find(t => t.id === id)).filter(Boolean);

  const viralTracks = [
    'yt-0pWsCiBvLOk', // Tauba Tauba
    'yt-Dmm_s6O_t7o', // Jugnu
    'yt-p4oX1lqA8U8', // Kinni Kinni
    'yt-F5S6ALIxyik', // Elevated
    'yt-SD4Z8dlZPd8', // Genda Phool
    'yt-GfO-3P_L2Fw', // Proper Patola
    'yt-BadBAMnpXSc', // Pehli Nazar Mein
    'yt-nfNc0XJdZ98'  // Param Sundari
  ].map(id => MOCK_TRACKS.find(t => t.id === id)).filter(Boolean);

  // Sketch 3: "Albums featuring songs you like"
  const albumsFeaturingLikedSongs = [
    {
      id: 'album-brahmastra',
      title: 'Brahmastra',
      artist: 'Arijit Singh & Pritam',
      year: 2022,
      coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
      badge: 'Features Kesariya & Rasiya',
    },
    {
      id: 'album-animal',
      title: 'ANIMAL',
      artist: 'Vishal Mishra & Harshavardhan Rameshwar',
      year: 2023,
      coverUrl: 'https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg',
      badge: 'Features Satranga & Arjan Vailly',
    },
    {
      id: 'album-bhediya',
      title: 'Bhediya',
      artist: 'Arijit Singh & Sachin-Jigar',
      year: 2022,
      coverUrl: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg',
      badge: 'Features Apna Bana Le',
    },
    {
      id: 'album-street-dreams',
      title: 'Street Dreams',
      artist: 'Karan Aujla & DIVINE',
      year: 2024,
      coverUrl: 'https://i.ytimg.com/vi/Zf0YfKjKxZ4/hqdefault.jpg',
      badge: 'Features 100 Million',
    },
    {
      id: 'album-ghost',
      title: 'Ghost',
      artist: 'Diljit Dosanjh',
      year: 2023,
      coverUrl: 'https://i.ytimg.com/vi/p4oX1lqA8U8/hqdefault.jpg',
      badge: 'Features Kinni Kinni & Case',
    },
    {
      id: 'album-making-memories',
      title: 'Making Memories',
      artist: 'Karan Aujla & Ikky',
      year: 2023,
      coverUrl: 'https://i.ytimg.com/vi/3RHMp4b3p88/hqdefault.jpg',
      badge: 'Features Softly & Admirin You',
    },
    {
      id: 'album-aashiqui2',
      title: 'Aashiqui 2',
      artist: 'Arijit Singh & Mithoon',
      year: 2013,
      coverUrl: 'https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg',
      badge: 'Features Tum Hi Ho',
    },
  ];

  // Sketch 3: "Popular albums and artists"
  const popularArtists = ARTISTS_DATA.slice(0, 10);
  const popularSoundtracks = [
    {
      id: 'album-rockstar',
      title: 'Rockstar',
      artist: 'A.R. Rahman & Mohit Chauhan',
      year: 2011,
      coverUrl: 'https://i.ytimg.com/vi/T94PHkuydcw/hqdefault.jpg',
      badge: 'Masterpiece Album',
    },
    {
      id: 'album-kabir-singh',
      title: 'Kabir Singh',
      artist: 'Sachet Tandon & Vishal Mishra',
      year: 2019,
      coverUrl: 'https://i.ytimg.com/vi/a_V8F788-p8/hqdefault.jpg',
      badge: 'All-Time Hit',
    },
    {
      id: 'album-yjhd',
      title: 'Yeh Jawaani Hai Deewani',
      artist: 'Pritam',
      year: 2013,
      coverUrl: 'https://i.ytimg.com/vi/0wS_f51K9-4/hqdefault.jpg',
      badge: 'Classic Celebration',
    },
    {
      id: 'album-shershaah',
      title: 'Shershaah',
      artist: 'B Praak & Jasleen Royal',
      year: 2021,
      coverUrl: 'https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg',
      badge: 'Heartfelt Melodies',
    },
  ];

  // Horizontal scroll shelf helper
  const ShelfRow = ({ title, icon: Icon, tracks, id }) => {
    const rowRef = useRef(null);

    const scroll = (direction) => {
      if (rowRef.current) {
        const scrollAmount = direction === 'left' ? -380 : 380;
        rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
      <section className="space-y-3.5 my-8" aria-label={title}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && <Icon size={20} className="text-white" aria-hidden="true" />}
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#252525] text-neutral-300 hover:text-white flex items-center justify-center transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Scroll ${title} carousel left`}
              title="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-[#181818] hover:bg-[#252525] text-neutral-300 hover:text-white flex items-center justify-center transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={`Scroll ${title} carousel right`}
              title="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={rowRef}
          data-lenis-prevent
          className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tracks.map((track) => (
            <div key={track.id} className="w-44 md:w-52 flex-shrink-0">
              <TrackCard track={track} queue={tracks} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Quick Curated Playlists Row */}
      <section aria-label="Top Playlists in India">
        <h2 className="text-lg md:text-xl font-bold text-white mb-3.5 tracking-tight flex items-center gap-2">
          <span>🇮🇳</span>
          <span>India&apos;s Top Playlists</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {FEATURED_MIXES.map((mix) => (
            <div
              key={mix.id}
              onClick={() => setActiveView('playlist', mix)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveView('playlist', mix);
                }
              }}
              aria-label={`Open curated playlist ${mix.title}`}
              className="group flex items-center gap-3.5 p-3 rounded-2xl bg-[#161616] hover:bg-[#202020] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md border border-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <img
                src={
                  mix.coverUrl && !mix.coverUrl.includes('unsplash.com')
                    ? mix.coverUrl
                    : 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg'
                }
                alt={`Playlist artwork for ${mix.title}`}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow"
              />
              <div className="min-w-0 flex-grow">
                <h3 className="text-sm font-bold text-white group-hover:text-neutral-100 transition-colors truncate">
                  {mix.title}
                </h3>
                <p className="text-xs text-neutral-400 truncate mt-0.5 line-clamp-1">
                  {mix.description}
                </p>
                <span className="text-[10px] text-neutral-400 font-medium mt-1 inline-block">
                  Top Playlist • Free Stream
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sketch 3 Section 1: "Albums featuring songs you like" */}
      <section className="space-y-3.5 my-8" aria-label="Albums featuring songs you like">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Disc3 size={20} className="text-emerald-400" aria-hidden="true" />
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Albums featuring songs you like
              </h3>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Complete soundtrack albums containing your most played melodies
              </p>
            </div>
          </div>
        </div>

        <div
          data-lenis-prevent
          className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {albumsFeaturingLikedSongs.map((album) => (
            <div
              key={album.id}
              onClick={() => openAlbum(album.title, album.artist)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openAlbum(album.title, album.artist);
                }
              }}
              className="w-44 md:w-52 flex-shrink-0 p-3 rounded-2xl bg-[#141416] hover:bg-[#1C1C1F] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                <img
                  src={album.coverUrl}
                  alt={`Album cover for ${album.title}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={18} className="fill-black ml-0.5" />
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                {album.title}
              </h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5">{album.artist}</p>
              <p className="text-[10px] text-emerald-400/90 font-medium mt-1 truncate">
                {album.badge}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sketch 3 Section 2: "Popular albums and artists" */}
      <section className="space-y-6 my-8" aria-label="Popular albums and artists">
        <div className="flex items-center gap-2.5">
          <Disc3 size={20} className="text-emerald-400" aria-hidden="true" />
          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Popular albums and artists
          </h3>
        </div>

        {/* Popular Artists Circular Row */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
            <User size={13} className="text-zinc-400" />
            <span>Top Artists in Rotation</span>
          </h4>
          <div
            data-lenis-prevent
            className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {popularArtists.map((artist) => (
              <div
                key={artist.id}
                onClick={() => openArtist(artist.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openArtist(artist.name);
                  }
                }}
                className="w-28 md:w-32 flex-shrink-0 flex flex-col items-center text-center p-3 rounded-2xl bg-[#141416] hover:bg-[#1C1C1F] border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group select-none"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black shadow-lg border-2 border-white/10 group-hover:border-white/30 transition-all duration-300 flex items-center justify-center">
                  <span className="text-base md:text-lg font-bold tracking-wider text-neutral-200 group-hover:text-white">
                    {(artist.name || 'Artist').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>
                <h5 className="text-xs md:text-sm font-bold text-white truncate w-full group-hover:text-emerald-400 transition-colors">
                  {artist.name}
                </h5>
                <span className="text-[10px] text-neutral-400 mt-0.5">Artist</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Soundtracks Row */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
            <Disc3 size={13} className="text-zinc-400" />
            <span>Blockbuster Albums &amp; Soundtracks</span>
          </h4>
          <div
            data-lenis-prevent
            className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {popularSoundtracks.map((album) => (
              <div
                key={album.id}
                onClick={() => openAlbum(album.title, album.artist)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openAlbum(album.title, album.artist);
                  }
                }}
                className="w-44 md:w-52 flex-shrink-0 p-3 rounded-2xl bg-[#141416] hover:bg-[#1C1C1F] border border-white/5 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-xl"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[#202020] shadow-md">
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={18} className="fill-black ml-0.5" />
                    </div>
                  </div>
                </div>
                <h5 className="text-sm font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                  {album.title}
                </h5>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{album.artist}</p>
                <p className="text-[10px] text-amber-400/90 font-medium mt-1 truncate">
                  {album.badge}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Horizontal Shelves - Chartbusters & Hits */}
      <ShelfRow
        title="🇮🇳 Top 50 - India (Most Played Songs)"
        icon={Flame}
        tracks={top50Tracks}
        id="top50"
      />

      <ShelfRow
        title="🔥 Hot Hits Hindi (Arijit Singh, Vishal Mishra, Anirudh & Pritam)"
        icon={Flame}
        tracks={bollywoodTracks}
        id="bollywood"
      />

      <ShelfRow
        title="⚡ Today's Top Punjabi Hits (Karan Aujla, Diljit & AP Dhillon)"
        icon={Zap}
        tracks={punjabiTracks}
        id="punjabi"
      />

      <ShelfRow
        title="💖 Soulful Hindi Romance & Melodies"
        icon={Headphones}
        tracks={romanceTracks}
        id="romance"
      />

      <ShelfRow
        title="🌟 Viral Hits India & Chartbusters"
        icon={Zap}
        tracks={viralTracks}
        id="viral"
      />
    </div>
  );
};
export default Home;
