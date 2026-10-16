import { MOCK_TRACKS, getTrackCoverUrl } from './mockTracks';

/**
 * Curated database of top Indian & international artists, albums, and discographies.
 * Follows Spotify's metadata structure:
 * - Verified status, monthly listeners, bio, banner & avatar imagery
 * - Aliases for typo-tolerant fuzzy matching (e.g. "arjit singh" -> "Arijit Singh")
 * - Discography categorized into Albums, Singles, and EPs
 * - Top Popular tracks
 * - Related Artists ("Fans Also Like")
 */

export const ARTISTS_DATA = [
  {
    id: 'arijit_singh',
    name: 'Arijit Singh',
    aliases: [
      'arjit singh', 'arjit', 'arijit', 'arijeet', 'arijit singh', 
      'arijitsingh', 'arjeet', 'arjeet singh', 'arijitsing'
    ],
    verified: true,
    monthlyListeners: '38,920,410',
    followers: '42,100,000',
    bio: 'Arijit Singh is India’s foremost playback icon, widely considered one of the most versatile and celebrated vocalists of modern Hindi cinema. With a record number of Filmfare Awards and global chart-toppers, his voice defines romantic and soulful Bollywood melodies.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#A16207',
    genres: ['Bollywood Romantic', 'Soulful', 'Acoustic', 'Sufi'],
    topTrackIds: [
      'yt-BddP6PYo2gs', // Kesariya
      'yt-ElZfdU54Cp8', // Apna Bana Le
      'yt-HrnrqYxYrbk', // Satranga
      'yt-RLzC55ai0eo', // Heeriye
      'yt-KUpwupYj_tY', // Tere Hawaale
      'yt-AFTIVN8rRbI', // Sajni
      'yt-Bi7sSC046dk', // Chaleya
      'yt-bzSTpdcs-EI', // Channa Mereya
      'yt-sK7riqg2mr4'  // Agar Tum Saath Ho
    ],
    albums: [
      {
        id: 'album-brahmastra',
        title: 'Brahmastra (Original Motion Picture Soundtrack)',
        type: 'Album',
        releaseYear: 2022,
        coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
        trackIds: ['yt-BddP6PYo2gs'],
        totalTracks: 6,
        genre: 'Bollywood'
      },
      {
        id: 'album-animal',
        title: 'ANIMAL (Soundtrack)',
        type: 'Album',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/HrnrqYxYrbk/hqdefault.jpg',
        trackIds: ['yt-HrnrqYxYrbk'],
        totalTracks: 8,
        genre: 'Bollywood Romantic'
      },
      {
        id: 'album-bhediya',
        title: 'Bhediya (Soundtrack)',
        type: 'Album',
        releaseYear: 2022,
        coverUrl: 'https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg',
        trackIds: ['yt-ElZfdU54Cp8'],
        totalTracks: 5,
        genre: 'Bollywood'
      },
      {
        id: 'album-jawan',
        title: 'Jawan (Original Motion Picture Soundtrack)',
        type: 'Album',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/Bi7sSC046dk/hqdefault.jpg',
        trackIds: ['yt-Bi7sSC046dk'],
        totalTracks: 7,
        genre: 'Bollywood Action / Pop'
      }
    ],
    singles: [
      {
        id: 'single-heeriye',
        title: 'Heeriye',
        type: 'Single',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg',
        trackIds: ['yt-RLzC55ai0eo'],
        totalTracks: 1,
        genre: 'Indie Pop'
      },
      {
        id: 'single-sajni',
        title: 'Sajni (Laapataa Ladies)',
        type: 'Single',
        releaseYear: 2024,
        coverUrl: 'https://i.ytimg.com/vi/AFTIVN8rRbI/hqdefault.jpg',
        trackIds: ['yt-AFTIVN8rRbI'],
        totalTracks: 1,
        genre: 'Soulful'
      }
    ],
    relatedArtistIds: ['pritam', 'vishal_mishra', 'jubin_nautiyal', 'shreya_ghoshal', 'diljit_dosanjh']
  },

  {
    id: 'karan_aujla',
    name: 'Karan Aujla',
    aliases: [
      'karan aujla', 'karan', 'aujla', 'karanaujla', 
      'geetan di machine', 'jaskaran singh aujla'
    ],
    verified: true,
    monthlyListeners: '14,350,190',
    followers: '8,420,000',
    bio: 'Karan Aujla (Geetan Di Machine) is an internationally acclaimed Punjabi singer, rapper, and lyricist from Ghurala, Punjab. Known for his witty penmanship, hard-hitting 808 beats, and global hits like Tauba Tauba and 52 Bars.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#DC2626',
    genres: ['Punjabi Pop', 'Hip-Hop', 'UK Drill', 'Bhangra'],
    topTrackIds: [
      'yt-LK7-_dgAVQE', // Tauba Tauba
      'yt-4DfVxVeqk2o', // 52 Bars
      'yt-cWMxCE2HTag', // Softly
      'yt-vsWxs1tuwDk', // Winning Speech
      'yt-k85UB5b6pJU', // Admirin' You
      'yt-Pd1yGW_g2T8', // Ashke
      'yt-XTp5jaRU3Ws', // Wavy
      'yt-3j7bhOvW6jw'  // Low Fade
    ],
    albums: [
      {
        id: 'album-making-memories',
        title: 'Making Memories',
        type: 'Album',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg',
        trackIds: ['yt-cWMxCE2HTag', 'yt-k85UB5b6pJU', 'yt-Pd1yGW_g2T8'],
        totalTracks: 9,
        genre: 'Punjabi Pop'
      },
      {
        id: 'album-street-dreams',
        title: 'Street Dreams (with Divine)',
        type: 'Album',
        releaseYear: 2024,
        coverUrl: 'https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg',
        trackIds: ['yt-vsWxs1tuwDk', 'yt-XTp5jaRU3Ws'],
        totalTracks: 7,
        genre: 'Desi Hip-Hop'
      },
      {
        id: 'album-four-you',
        title: 'Four You EP',
        type: 'EP',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/4DfVxVeqk2o/hqdefault.jpg',
        trackIds: ['yt-4DfVxVeqk2o', 'yt-3j7bhOvW6jw'],
        totalTracks: 4,
        genre: 'Punjabi Drill'
      }
    ],
    singles: [
      {
        id: 'single-tauba-tauba',
        title: 'Tauba Tauba (Bad Newz)',
        type: 'Single',
        releaseYear: 2024,
        coverUrl: 'https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg',
        trackIds: ['yt-LK7-_dgAVQE'],
        totalTracks: 1,
        genre: 'Punjabi Pop / Dance'
      },
      {
        id: 'single-winning-speech',
        title: 'Winning Speech',
        type: 'Single',
        releaseYear: 2024,
        coverUrl: 'https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg',
        trackIds: ['yt-vsWxs1tuwDk'],
        totalTracks: 1,
        genre: 'Desi Hip-Hop'
      }
    ],
    relatedArtistIds: ['diljit_dosanjh', 'ap_dhillon', 'shubh', 'sidhu_moose_wala', 'badshah']
  },

  {
    id: 'diljit_dosanjh',
    name: 'Diljit Dosanjh',
    aliases: [
      'diljit dosanjh', 'diljit', 'diljeet', 'diljeet dosanjh', 
      'dosanjh', 'diljitdosanjh', 'diljit doshanjh'
    ],
    verified: true,
    monthlyListeners: '18,890,320',
    followers: '15,600,000',
    bio: 'Diljit Dosanjh is a global superstar, singer, actor, and live entertainer. The first Punjabi artist to perform at Coachella, Diljit blends traditional Punjabi folk with futuristic synth-pop, R&B, and dance beats.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#7C3AED',
    genres: ['Punjabi Pop', 'Urban Folk', 'Bhangra', 'Dance'],
    topTrackIds: [
      'yt-mH_LFkWxpI0', // Lover
      'yt-cl0a3i2wFcc', // G.O.A.T.
      'yt-p4oX1lqA8U8', // Kinni Kinni
      'yt-3u6lLWGjFLY', // Naina
      'yt-GfO-3P_L2Fw'  // Proper Patola
    ],
    albums: [
      {
        id: 'album-ghost',
        title: 'Ghost',
        type: 'Album',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg',
        trackIds: ['yt-mH_LFkWxpI0', 'yt-p4oX1lqA8U8'],
        totalTracks: 22,
        genre: 'Punjabi Pop'
      },
      {
        id: 'album-goat',
        title: 'G.O.A.T.',
        type: 'Album',
        releaseYear: 2020,
        coverUrl: 'https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg',
        trackIds: ['yt-cl0a3i2wFcc'],
        totalTracks: 16,
        genre: 'Bhangra'
      }
    ],
    singles: [
      {
        id: 'single-naina',
        title: 'Naina (Crew)',
        type: 'Single',
        releaseYear: 2024,
        coverUrl: 'https://i.ytimg.com/vi/3u6lLWGjFLY/hqdefault.jpg',
        trackIds: ['yt-3u6lLWGjFLY'],
        totalTracks: 1,
        genre: 'Bollywood / Punjabi'
      },
      {
        id: 'single-lover',
        title: 'Lover',
        type: 'Single',
        releaseYear: 2021,
        coverUrl: 'https://i.ytimg.com/vi/mH_LFkWxpI0/hqdefault.jpg',
        trackIds: ['yt-mH_LFkWxpI0'],
        totalTracks: 1,
        genre: 'Punjabi Pop'
      }
    ],
    relatedArtistIds: ['karan_aujla', 'ap_dhillon', 'badshah', 'sidhu_moose_wala']
  },

  {
    id: 'ap_dhillon',
    name: 'AP Dhillon',
    aliases: [
      'ap dhillon', 'ap', 'dhillon', 'apdhillon', 
      'amritpal', 'amritpal singh dhillon'
    ],
    verified: true,
    monthlyListeners: '9,740,210',
    followers: '6,200,000',
    bio: 'Amritpal Singh Dhillon, known professionally as AP Dhillon, is an Indo-Canadian singer, songwriter, and record producer who redefined brown diaspora music with seamless blends of synthwave, trap, R&B, and Punjabi hooks.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#2563EB',
    genres: ['Punjabi Synthwave', 'R&B', 'Trap', 'Indie'],
    topTrackIds: [
      'yt-pXRviuL6vMY', // With You
      'yt-VNs_cCtdbPc', // Brown Munde
      'yt-vX2cDW8LUWk'  // Excuses
    ],
    albums: [
      {
        id: 'album-not-by-chance',
        title: 'Not By Chance',
        type: 'Album',
        releaseYear: 2020,
        coverUrl: 'https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg',
        trackIds: ['yt-VNs_cCtdbPc', 'yt-vX2cDW8LUWk'],
        totalTracks: 7,
        genre: 'Trap / R&B'
      }
    ],
    singles: [
      {
        id: 'single-with-you',
        title: 'With You',
        type: 'Single',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/pXRviuL6vMY/hqdefault.jpg',
        trackIds: ['yt-pXRviuL6vMY'],
        totalTracks: 1,
        genre: 'Acoustic Pop'
      },
      {
        id: 'single-excuses',
        title: 'Excuses',
        type: 'Single',
        releaseYear: 2020,
        coverUrl: 'https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg',
        trackIds: ['yt-vX2cDW8LUWk'],
        totalTracks: 1,
        genre: 'Punjabi Synth-Pop'
      }
    ],
    relatedArtistIds: ['karan_aujla', 'diljit_dosanjh', 'shubh', 'the_weeknd']
  },

  {
    id: 'sidhu_moose_wala',
    name: 'Sidhu Moose Wala',
    aliases: [
      'sidhu', 'moosewala', 'moose wala', 'sidhu moosewala', 
      'sidhu moose wala', 'shubhdeep singh sidhu', '295'
    ],
    verified: true,
    monthlyListeners: '12,890,000',
    followers: '16,400,000',
    bio: 'Shubhdeep Singh Sidhu, known globally as Sidhu Moose Wala, was an iconic Punjabi singer, rapper, and songwriter whose bold lyricism and powerful anthems conquered charts worldwide.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#B91C1C',
    genres: ['Punjabi Rap', 'Desi Hip-Hop', 'Folk Rap', 'Gangsta Rap'],
    topTrackIds: [
      'yt-n_FCrCQ6-9U', // 295
      'yt-6xoB4ZiKKn0', // The Last Ride
      'yt-GgmFC83T24Y', // So High
      'yt-ZgG-2XG_r34'  // Same Beef
    ],
    albums: [
      {
        id: 'album-moosetape',
        title: 'Moosetape',
        type: 'Album',
        releaseYear: 2021,
        coverUrl: 'https://i.ytimg.com/vi/n_FCrCQ6-9U/hqdefault.jpg',
        trackIds: ['yt-n_FCrCQ6-9U', 'yt-6xoB4ZiKKn0'],
        totalTracks: 32,
        genre: 'Punjabi Hip-Hop'
      }
    ],
    singles: [
      {
        id: 'single-so-high',
        title: 'So High',
        type: 'Single',
        releaseYear: 2017,
        coverUrl: 'https://i.ytimg.com/vi/GgmFC83T24Y/hqdefault.jpg',
        trackIds: ['yt-GgmFC83T24Y'],
        totalTracks: 1,
        genre: 'Desi Hip-Hop'
      }
    ],
    relatedArtistIds: ['karan_aujla', 'diljit_dosanjh', 'shubh']
  },

  {
    id: 'the_weeknd',
    name: 'The Weeknd',
    aliases: [
      'weeknd', 'the weeknd', 'the weekend', 'weekend', 
      'abel', 'abel tesfaye', 'starboy'
    ],
    verified: true,
    monthlyListeners: '114,820,950',
    followers: '88,000,000',
    bio: 'Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer, songwriter, and record producer known for his sonic versatility, dark lyricism, and cinematic 80s synth-pop aesthetics.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#E11D48',
    genres: ['R&B', 'Synth-Pop', 'Alternative Pop', 'Electronic'],
    topTrackIds: [
      'yt-34Na4j8AVgA', // Starboy
      'yt-4NRXx6U8ABQ'  // Blinding Lights
    ],
    albums: [
      {
        id: 'album-starboy',
        title: 'Starboy',
        type: 'Album',
        releaseYear: 2016,
        coverUrl: 'https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg',
        trackIds: ['yt-34Na4j8AVgA'],
        totalTracks: 18,
        genre: 'Synth-Pop / R&B'
      },
      {
        id: 'album-after-hours',
        title: 'After Hours',
        type: 'Album',
        releaseYear: 2020,
        coverUrl: 'https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
        trackIds: ['yt-4NRXx6U8ABQ'],
        totalTracks: 14,
        genre: 'Synthwave'
      }
    ],
    singles: [],
    relatedArtistIds: ['ap_dhillon', 'karan_aujla', 'arijit_singh']
  },

  {
    id: 'vishal_mishra',
    name: 'Vishal Mishra',
    aliases: ['vishal mishra', 'vishal', 'vishalmishra', 'vishal mishara'],
    verified: true,
    monthlyListeners: '16,210,000',
    followers: '5,800,000',
    bio: 'Vishal Mishra is an Indian music composer and singer known for intensely emotional romantic ballads, soaring vocals, and chart-topping soundtracks for films like ANIMAL and Kabir Singh.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#059669',
    genres: ['Bollywood Romantic', 'Sufi', 'Acoustic'],
    topTrackIds: [
      'yt-iAIBF2ngbWY', // Pehle Bhi Main
      'yt-a_V8F788-p8', // Kaise Hua
      'yt-H2Fp18rYFJE'  // Naseeb Se
    ],
    albums: [
      {
        id: 'album-animal-vishal',
        title: 'ANIMAL (Original Soundtrack)',
        type: 'Album',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/iAIBF2ngbWY/hqdefault.jpg',
        trackIds: ['yt-iAIBF2ngbWY'],
        totalTracks: 8,
        genre: 'Bollywood Romantic'
      }
    ],
    singles: [
      {
        id: 'single-pehle-bhi-main',
        title: 'Pehle Bhi Main',
        type: 'Single',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/iAIBF2ngbWY/hqdefault.jpg',
        trackIds: ['yt-iAIBF2ngbWY'],
        totalTracks: 1,
        genre: 'Bollywood'
      },
      {
        id: 'single-kaise-hua',
        title: 'Kaise Hua',
        type: 'Single',
        releaseYear: 2019,
        coverUrl: 'https://i.ytimg.com/vi/a_V8F788-p8/hqdefault.jpg',
        trackIds: ['yt-a_V8F788-p8'],
        totalTracks: 1,
        genre: 'Bollywood'
      }
    ],
    relatedArtistIds: ['arijit_singh', 'pritam', 'jubin_nautiyal']
  },

  {
    id: 'shubh',
    name: 'Shubh',
    aliases: ['shubh', 'shubneet', 'shubneet singh', 'still rollin', 'shubh music'],
    verified: true,
    monthlyListeners: '8,420,000',
    followers: '4,100,000',
    bio: 'Shubneet Singh, popularly known as Shubh, is an Indian rapper and singer-songwriter based in Canada. Known for his viral hits No Love, Elevated, Cheques, and Baller.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#D97706',
    genres: ['Desi Hip-Hop', 'Trap', 'Punjabi Rap'],
    topTrackIds: [
      'yt-0pWsCiBvLOk', // One Love
      'yt-4tywp83zkmk'  // Cheques
    ],
    albums: [
      {
        id: 'album-still-rollin',
        title: 'Still Rollin',
        type: 'Album',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg',
        trackIds: ['yt-4tywp83zkmk'],
        totalTracks: 7,
        genre: 'Punjabi Hip-Hop'
      }
    ],
    singles: [
      {
        id: 'single-one-love',
        title: 'One Love',
        type: 'Single',
        releaseYear: 2023,
        coverUrl: 'https://i.ytimg.com/vi/0pWsCiBvLOk/hqdefault.jpg',
        trackIds: ['yt-0pWsCiBvLOk'],
        totalTracks: 1,
        genre: 'Desi Hip-Hop'
      }
    ],
    relatedArtistIds: ['karan_aujla', 'ap_dhillon', 'diljit_dosanjh', 'sidhu_moose_wala']
  },

  {
    id: 'pritam',
    name: 'Pritam',
    aliases: ['pritam', 'pritam da', 'pritam chakraborty', 'pritham'],
    verified: true,
    monthlyListeners: '29,480,000',
    followers: '19,200,000',
    bio: 'Pritam Chakraborty is India’s legendary music composer and record producer who has composed iconic soundtracks for over 125 Bollywood films, spanning romantic anthems, rock ballads, and dance hits.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#4F46E5',
    genres: ['Bollywood', 'Romantic', 'Pop Rock', 'Sufi'],
    topTrackIds: [
      'yt-BddP6PYo2gs', // Kesariya
      'yt-bzSTpdcs-EI', // Channa Mereya
      'yt-pp8vbcOCm8k', // Ghar More Pardesiya
      'yt-P8PWN1OmZOA', // Tu Jaane Na
      'yt-BadBAMnpXSc'  // Pehli Nazar Mein
    ],
    albums: [
      {
        id: 'album-brahmastra-pritam',
        title: 'Brahmastra',
        type: 'Album',
        releaseYear: 2022,
        coverUrl: 'https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg',
        trackIds: ['yt-BddP6PYo2gs', 'yt-bzSTpdcs-EI'],
        totalTracks: 6,
        genre: 'Bollywood'
      }
    ],
    singles: [],
    relatedArtistIds: ['arijit_singh', 'vishal_mishra', 'shreya_ghoshal']
  },

  {
    id: 'shreya_ghoshal',
    name: 'Shreya Ghoshal',
    aliases: ['shreya', 'shreya ghoshal', 'shreya ghosal', 'shreyaghoshal'],
    verified: true,
    monthlyListeners: '25,600,000',
    followers: '28,100,000',
    bio: 'Shreya Ghoshal is a legendary Indian singer renowned for her melodic range, classical perfection, and countless cinematic masterpieces in Hindi, Bengali, Tamil, and Telugu cinema.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#EC4899',
    genres: ['Bollywood Classical', 'Romantic', 'Playback'],
    topTrackIds: ['yt-3A-xVp-sW_4', 'yt-zRtPUIumXcY', 'yt-pp8vbcOCm8k', 'yt-Vn_Vhycfhrc', 'yt-K3b2wcfP_u0', 'yt-nfNc0XJdZ98'],
    albums: [{ id: 'album-aashiqui-2', title: 'Aashiqui 2 (Original Soundtrack)', type: 'Album', releaseYear: 2013, coverUrl: 'https://i.ytimg.com/vi/3A-xVp-sW_4/hqdefault.jpg', trackIds: ['yt-3A-xVp-sW_4'], totalTracks: 11, genre: 'Bollywood Romantic' }, { id: 'album-bajirao', title: 'Bajirao Mastani', type: 'Album', releaseYear: 2015, coverUrl: 'https://i.ytimg.com/vi/zRtPUIumXcY/hqdefault.jpg', trackIds: ['yt-zRtPUIumXcY'], totalTracks: 10, genre: 'Classical Fusion' }],
    singles: [],
    relatedArtistIds: ['arijit_singh', 'pritam', 'alka_yagnik']
  },

  {
    id: 'badshah',
    name: 'Badshah',
    aliases: ['badshah', 'badshaah', 'aditya prateek singh sisodia'],
    verified: true,
    monthlyListeners: '17,400,000',
    followers: '14,200,000',
    bio: 'Badshah is an Indian rapper, singer, and music producer known for club anthems, Desi pop bangers, and chartbuster collaborations.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#F59E0B',
    genres: ['Desi Hip-Hop', 'Commercial Pop', 'Club'],
    topTrackIds: ['yt-Dmm_s6O_t7o', 'yt-SD4Z8dlZPd8', 'yt-GfO-3P_L2Fw'],
    albums: [{ id: 'album-jugnu', title: 'Jugnu', type: 'Single', releaseYear: 2021, coverUrl: 'https://i.ytimg.com/vi/Dmm_s6O_t7o/hqdefault.jpg', trackIds: ['yt-Dmm_s6O_t7o'], totalTracks: 1, genre: 'Pop' }],
    singles: [],
    relatedArtistIds: ['karan_aujla', 'diljit_dosanjh']
  },

  {
    id: 'jubin_nautiyal',
    name: 'Jubin Nautiyal',
    aliases: ['jubin', 'jubin nautiyal', 'zubin', 'jubinnautiyal'],
    verified: true,
    monthlyListeners: '21,300,000',
    followers: '18,500,000',
    bio: 'Jubin Nautiyal is an Indian playback singer and performer known for his acoustic touch, soul-stirring love songs, and blockbuster film soundtracks.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#10B981',
    genres: ['Bollywood Romantic', 'Acoustic', 'Sufi'],
    topTrackIds: ['yt-sCbbMZ-q4-I', 'yt-tLqtnGLfm4Q', 'yt-gvyUuxdRdR4'],
    albums: [{ id: 'album-lut-gaye', title: 'Lut Gaye', type: 'Single', releaseYear: 2021, coverUrl: 'https://i.ytimg.com/vi/sCbbMZ-q4-I/hqdefault.jpg', trackIds: ['yt-sCbbMZ-q4-I'], totalTracks: 1, genre: 'Romantic' }],
    singles: [],
    relatedArtistIds: ['arijit_singh', 'vishal_mishra']
  },

  {
    id: 'atif_aslam',
    name: 'Atif Aslam',
    aliases: ['atif', 'atif aslam', 'atifaslam'],
    verified: true,
    monthlyListeners: '23,100,000',
    followers: '25,000,000',
    bio: 'Atif Aslam is an iconic South Asian singer and songwriter renowned for his soaring vocal range, emotive rock ballads, and evergreen Bollywood classics.',
    avatarUrl: '',
    bannerUrl: '',
    headerColor: '#6366F1',
    genres: ['Sufi Rock', 'Bollywood Romantic', 'Pop'],
    topTrackIds: ['yt-a18py61_F_w', 'yt-SAcpESN_Fk4', 'yt-Il4wSflh4a4', 'yt-V7LwfY5U5WI', 'yt-P8PWN1OmZOA', 'yt-BadBAMnpXSc'],
    albums: [{ id: 'album-coke-studio-8', title: 'Coke Studio Season 8', type: 'Album', releaseYear: 2015, coverUrl: 'https://i.ytimg.com/vi/a18py61_F_w/hqdefault.jpg', trackIds: ['yt-a18py61_F_w'], totalTracks: 7, genre: 'Sufi' }, { id: 'album-tiger-zinda-hai', title: 'Tiger Zinda Hai', type: 'Album', releaseYear: 2017, coverUrl: 'https://i.ytimg.com/vi/SAcpESN_Fk4/hqdefault.jpg', trackIds: ['yt-SAcpESN_Fk4'], totalTracks: 6, genre: 'Bollywood' }],
    singles: [],
    relatedArtistIds: ['arijit_singh', 'pritam', 'jubin_nautiyal']
  }
,

  {
    "id": "ar_rahman",
    "name": "A.R. Rahman",
    "aliases": [
      "ar rahman",
      "rahman",
      "a.r. rahman",
      "allah rakha rahman",
      "isai puyal"
    ],
    "verified": true,
    "monthlyListeners": "34,200,000",
    "followers": "28,500,000",
    "bio": "Allah Rakha Rahman is an Indian music director, composer, and music producer known for integrating Indian classical music with electronic music, world music, and traditional orchestral arrangements. Recipient of 2 Academy Awards, 2 Grammy Awards, and a BAFTA.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#047857",
    "genres": [
      "World Music",
      "Soundtrack",
      "Sufi",
      "Classical Fusion"
    ],
    "topTrackIds": [
      "yt-T94PHkuydcw",
      "yt-PQmrmVs10X8",
      "yt-nfNc0XJdZ98"
    ],
    "albums": [
      {
        "id": "album-rockstar",
        "title": "Rockstar (Original Motion Picture Soundtrack)",
        "type": "Album",
        "releaseYear": 2011,
        "coverUrl": "https://i.ytimg.com/vi/T94PHkuydcw/hqdefault.jpg",
        "trackIds": [
          "yt-T94PHkuydcw"
        ],
        "totalTracks": 14,
        "genre": "Sufi Rock"
      }
    ],
    "singles": [],
    "relatedArtistIds": [
      "pritam",
      "arijit_singh"
    ]
  }
,

  {
    "id": "neha_kakkar",
    "name": "Neha Kakkar",
    "aliases": [
      "neha kakkar",
      "neha",
      "tony kakkar",
      "sonu kakkar"
    ],
    "verified": true,
    "monthlyListeners": "22,400,000",
    "followers": "35,000,000",
    "bio": "Neha Kakkar is an Indian playback singer known for high-energy Bollywood dance party tracks, romantic pop singles, and television appearances.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#DB2777",
    "genres": [
      "Bollywood Dance",
      "Pop",
      "Party"
    ],
    "topTrackIds": [],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "badshah",
      "jubin_nautiyal"
    ]
  }
,

  {
    "id": "darshan_raval",
    "name": "Darshan Raval",
    "aliases": [
      "darshan raval",
      "darshan",
      "darshan rawal"
    ],
    "verified": true,
    "monthlyListeners": "15,800,000",
    "followers": "12,900,000",
    "bio": "Darshan Raval is an Indian singer, composer, and lyricist renowned for monsoon romantic anthems and indie pop chartbusters.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#4338CA",
    "genres": [
      "Indie Pop",
      "Romantic",
      "Acoustic"
    ],
    "topTrackIds": [],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "arijit_singh",
      "jubin_nautiyal"
    ]
  }
,

  {
    "id": "sonu_nigam",
    "name": "Sonu Nigam",
    "aliases": [
      "sonu nigam",
      "sonu",
      "sonunigam"
    ],
    "verified": true,
    "monthlyListeners": "21,100,000",
    "followers": "19,500,000",
    "bio": "Sonu Nigam is a legendary Indian playback singer and live performer who has sung thousands of songs across dozens of languages over three decades.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#B45309",
    "genres": [
      "Bollywood Classic",
      "Romantic",
      "Ghazal",
      "Playback"
    ],
    "topTrackIds": [],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "arijit_singh",
      "shreya_ghoshal"
    ]
  }
,

  {
    "id": "honey_singh",
    "name": "Yo Yo Honey Singh",
    "aliases": [
      "honey singh",
      "yo yo honey singh",
      "yoyo honey singh",
      "honey",
      "yoyo"
    ],
    "verified": true,
    "monthlyListeners": "16,900,000",
    "followers": "21,000,000",
    "bio": "Hirdesh Singh, known professionally as Yo Yo Honey Singh, is an Indian music producer, rapper, singer, and songwriter who revolutionized Desi hip-hop and commercial rap in mainstream Indian cinema.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#D97706",
    "genres": [
      "Desi Hip-Hop",
      "Commercial Rap",
      "Punjabi Pop"
    ],
    "topTrackIds": [],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "badshah",
      "karan_aujla",
      "diljit_dosanjh"
    ]
  }
,

  {
    "id": "b_praak",
    "name": "B Praak",
    "aliases": [
      "b praak",
      "bpraak",
      "praak",
      "pratik bachchan"
    ],
    "verified": true,
    "monthlyListeners": "19,200,000",
    "followers": "14,000,000",
    "bio": "B Praak is an Indian singer and music composer who rose to national fame with heart-wrenching emotional ballads like Teri Mitti, Filhall, and Mann Bharrya.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#9333EA",
    "genres": [
      "Punjabi Soul",
      "Emotional Ballad",
      "Soundtrack"
    ],
    "topTrackIds": [],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "arijit_singh",
      "vishal_mishra",
      "jubin_nautiyal"
    ]
  }
,

  {
    "id": "jasleen_royal",
    "name": "Jasleen Royal",
    "aliases": [
      "jasleen royal",
      "jasleen"
    ],
    "verified": true,
    "monthlyListeners": "14,500,000",
    "followers": "8,200,000",
    "bio": "Jasleen Kaur Royal is an Indian singer, songwriter, and composer who sings in Punjabi, Hindi, and English. Known for chartbusters like Heeriye, Din Shagna Da, and Ranjha.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#EC4899",
    "genres": [
      "Indie Folk",
      "Acoustic Pop",
      "Bollywood"
    ],
    "topTrackIds": [
      "yt-RLzC55ai0eo" // Heeriye
    ],
    "albums": [],
    "singles": [
      {
        "id": "single-heeriye-jasleen",
        "title": "Heeriye",
        "type": "Single",
        "releaseYear": 2023,
        "coverUrl": "https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg",
        "trackIds": ["yt-RLzC55ai0eo"],
        "totalTracks": 1,
        "genre": "Indie Pop"
      }
    ],
    "relatedArtistIds": [
      "arijit_singh",
      "pritam"
    ]
  }
,

  {
    "id": "sachin_jigar",
    "name": "Sachin-Jigar",
    "aliases": [
      "sachin jigar",
      "sachin-jigar",
      "sachin",
      "jigar"
    ],
    "verified": true,
    "monthlyListeners": "20,800,000",
    "followers": "9,500,000",
    "bio": "Sachin-Jigar is an Indian music composer duo consisting of Sachin Sanghvi and Jigar Saraiya. Known for Bhediya (Apna Bana Le), Stree 2, Badlapur, and ABCD.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#10B981",
    "genres": [
      "Bollywood Pop",
      "Romantic",
      "Dance"
    ],
    "topTrackIds": [
      "yt-ElZfdU54Cp8" // Apna Bana Le
    ],
    "albums": [
      {
        "id": "album-bhediya-sj",
        "title": "Bhediya",
        "type": "Album",
        "releaseYear": 2022,
        "coverUrl": "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg",
        "trackIds": ["yt-ElZfdU54Cp8"],
        "totalTracks": 5,
        "genre": "Bollywood"
      }
    ],
    "singles": [],
    "relatedArtistIds": [
      "arijit_singh",
      "pritam"
    ]
  }
,

  {
    "id": "anirudh",
    "name": "Anirudh Ravichander",
    "aliases": [
      "anirudh",
      "anirudh ravichander",
      "rockstar anirudh"
    ],
    "verified": true,
    "monthlyListeners": "23,400,000",
    "followers": "21,000,000",
    "bio": "Anirudh Ravichander is an Indian music composer and singer known for explosive, high-energy soundtracks across Tamil, Telugu, and Hindi cinema (Jawan, Jailer, Leo, Vikram).",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#EA580C",
    "genres": [
      "High-Energy Pop",
      "EDM Fusion",
      "Action Score"
    ],
    "topTrackIds": [
      "yt-Bi7sSC046dk" // Chaleya (Jawan)
    ],
    "albums": [
      {
        "id": "album-jawan-anirudh",
        "title": "Jawan",
        "type": "Album",
        "releaseYear": 2023,
        "coverUrl": "https://i.ytimg.com/vi/Bi7sSC046dk/hqdefault.jpg",
        "trackIds": [
          "yt-Bi7sSC046dk"
        ],
        "totalTracks": 7,
        "genre": "Action Pop"
      }
    ],
    "singles": [],
    "relatedArtistIds": [
      "arijit_singh",
      "pritam"
    ]
  }
,

  {
    "id": "alka_yagnik",
    "name": "Alka Yagnik",
    "aliases": [
      "alka yagnik",
      "alka",
      "alkayagnik"
    ],
    "verified": true,
    "monthlyListeners": "24,000,000",
    "followers": "22,000,000",
    "bio": "Alka Yagnik is an iconic Indian playback singer with a career spanning over four decades and thousands of unforgettable Hindi cinema melodies.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#F43F5E",
    "genres": [
      "Bollywood Classic",
      "Romantic Melody",
      "Playback"
    ],
    "topTrackIds": [
      "yt-Bi7sSC046dk"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "kumar_sanu",
      "shreya_ghoshal",
      "sonu_nigam"
    ]
  }
,

  {
    "id": "kumar_sanu",
    "name": "Kumar Sanu",
    "aliases": [
      "kumar sanu",
      "sanu da",
      "kedarnath bhattacharya"
    ],
    "verified": true,
    "monthlyListeners": "18,500,000",
    "followers": "17,000,000",
    "bio": "Kumar Sanu is a legendary Indian playback singer who holds the Guinness World Record for recording 28 songs in a single day and defined the sound of 90s Bollywood romance.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#D97706",
    "genres": [
      "90s Bollywood",
      "Romantic Melody"
    ],
    "topTrackIds": [
      "yt-Bi7sSC046dk"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "alka_yagnik",
      "sonu_nigam"
    ]
  }
,

  {
    "id": "kk",
    "name": "KK (Krishnakumar Kunnath)",
    "aliases": [
      "kk",
      "krishnakumar kunnath",
      "kay kay"
    ],
    "verified": true,
    "monthlyListeners": "19,800,000",
    "followers": "18,000,000",
    "bio": "Krishnakumar Kunnath, popularly known as KK, was one of India’s most beloved vocalists whose raw, heartfelt voice defined the youth anthems of a generation.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#4F46E5",
    "genres": [
      "Indie Rock",
      "Romantic Ballad",
      "Bollywood"
    ],
    "topTrackIds": [
      "yt-Bi7sSC046dk"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "arijit_singh",
      "sonu_nigam"
    ]
  }
,

  {
    "id": "divine",
    "name": "DIVINE",
    "aliases": [
      "divine",
      "gully gang",
      "vivian divine",
      "vivian fernandes"
    ],
    "verified": true,
    "monthlyListeners": "7,900,000",
    "followers": "6,400,000",
    "bio": "Vivian Fernandes, known as DIVINE, is the pioneer of the Mumbai Gully Rap movement that brought Indian street hip-hop into the international spotlight.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#1E293B",
    "genres": [
      "Desi Hip-Hop",
      "Gully Rap",
      "Boom Bap"
    ],
    "topTrackIds": [
      "yt-pXRviuL6vMY"
    ],
    "albums": [
      {
        "id": "album-street-dreams-divine",
        "title": "Street Dreams (with Karan Aujla)",
        "type": "Album",
        "releaseYear": 2024,
        "coverUrl": "https://i.ytimg.com/vi/vsWxs1tuwDk/hqdefault.jpg",
        "trackIds": [
          "yt-vsWxs1tuwDk",
          "yt-XTp5jaRU3Ws"
        ],
        "totalTracks": 7,
        "genre": "Desi Hip-Hop"
      }
    ],
    "singles": [],
    "relatedArtistIds": [
      "karan_aujla",
      "badshah",
      "sidhu_moose_wala"
    ]
  }
,

  {
    "id": "emiway_bantai",
    "name": "Emiway Bantai",
    "aliases": [
      "emiway",
      "emiway bantai",
      "bantai",
      "bilal shaikh"
    ],
    "verified": true,
    "monthlyListeners": "6,200,000",
    "followers": "8,900,000",
    "bio": "Emiway Bantai is an independent Indian rapper, songwriter, and founder of Bantai Records, known for explosive flow and record-breaking viral numbers.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#F59E0B",
    "genres": [
      "Desi Hip-Hop",
      "Drill",
      "Independent Rap"
    ],
    "topTrackIds": [
      "yt-4DfVxVeqk2o"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "divine",
      "mc_stan"
    ]
  }
,

  {
    "id": "mc_stan",
    "name": "MC Stan",
    "aliases": [
      "mc stan",
      "stan",
      "altaf shaikh",
      "basti ka hasti"
    ],
    "verified": true,
    "monthlyListeners": "5,800,000",
    "followers": "11,200,000",
    "bio": "Altaf Tadavi, known professionally as MC Stan, is an Indian rapper and music producer from Pune, Maharashtra known for pioneering modern new-school trap music in India.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#6B7280",
    "genres": [
      "New School Trap",
      "Desi Rap"
    ],
    "topTrackIds": [
      "yt-4DfVxVeqk2o"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "divine",
      "emiway_bantai"
    ]
  }
,

  {
    "id": "king",
    "name": "King",
    "aliases": [
      "king",
      "king rocco",
      "arpan kumar chandel",
      "maan meri jaan"
    ],
    "verified": true,
    "monthlyListeners": "14,100,000",
    "followers": "9,800,000",
    "bio": "Arpan Kumar Chandel, known by his stage name King, is an Indian rapper, singer, and songwriter known for global cross-over hits like Maan Meri Jaan.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#10B981",
    "genres": [
      "Pop Rap",
      "Desi Pop",
      "R&B"
    ],
    "topTrackIds": [
      "yt-AFTIVN8rRbI"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "karan_aujla",
      "badshah"
    ]
  }
,

  {
    "id": "seedhe_maut",
    "name": "Seedhe Maut",
    "aliases": [
      "seedhe maut",
      "sm",
      "encore abj",
      "calm",
      "nanchaku"
    ],
    "verified": true,
    "monthlyListeners": "3,800,000",
    "followers": "2,400,000",
    "bio": "Seedhe Maut is a New Delhi-based hip-hop duo consisting of Siddhant Sharma (Calm) and Abhijay Negi (Encore ABJ), celebrated as pioneers of modern DHH lyricism.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#DC2626",
    "genres": [
      "Delhi Underground Rap",
      "Desi Hip-Hop",
      "Trap"
    ],
    "topTrackIds": [
      "yt-4DfVxVeqk2o"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "divine",
      "karan_aujla"
    ]
  }
,

  {
    "id": "taylor_swift",
    "name": "Taylor Swift",
    "aliases": [
      "taylor swift",
      "taylor",
      "swift"
    ],
    "verified": true,
    "monthlyListeners": "108,000,000",
    "followers": "115,000,000",
    "bio": "Taylor Alison Swift is an American singer-songwriter whose narrative songwriting and cultural impact have earned her four Album of the Year Grammy Awards.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#D97706",
    "genres": [
      "Pop",
      "Synth-Pop",
      "Folk Pop"
    ],
    "topTrackIds": [
      "yt-34Na4j8AVgA"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "the_weeknd"
    ]
  }
,

  {
    "id": "justin_bieber",
    "name": "Justin Bieber",
    "aliases": [
      "justin bieber",
      "justin",
      "bieber"
    ],
    "verified": true,
    "monthlyListeners": "89,500,000",
    "followers": "78,000,000",
    "bio": "Justin Drew Bieber is a Canadian singer recognized for multi-genre musicianship and global chart dominance across pop, R&B, and electronic music.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#2563EB",
    "genres": [
      "Pop",
      "R&B",
      "Dance Pop"
    ],
    "topTrackIds": [
      "yt-4NRXx6U8ABQ"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "the_weeknd"
    ]
  }
,

  {
    "id": "drake",
    "name": "Drake",
    "aliases": [
      "drake",
      "champagnepapi",
      "aubrey graham",
      "drizzy"
    ],
    "verified": true,
    "monthlyListeners": "88,900,000",
    "followers": "85,000,000",
    "bio": "Aubrey Drake Graham is a Canadian rapper, singer, and songwriter credited with popularizing R&B sensibilities in hip-hop.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#1E293B",
    "genres": [
      "Hip-Hop",
      "Trap",
      "R&B"
    ],
    "topTrackIds": [
      "yt-34Na4j8AVgA"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "the_weeknd"
    ]
  }
,

  {
    "id": "bruno_mars",
    "name": "Bruno Mars",
    "aliases": [
      "bruno mars",
      "bruno",
      "peter gene hernandez"
    ],
    "verified": true,
    "monthlyListeners": "124,000,000",
    "followers": "56,000,000",
    "bio": "Peter Gene Hernandez, known professionally as Bruno Mars, is an American singer, songwriter, and record producer renowned for his retro showmanship and stage energy.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#D97706",
    "genres": [
      "Funk",
      "Soul",
      "R&B",
      "Pop"
    ],
    "topTrackIds": [
      "yt-4NRXx6U8ABQ"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "the_weeknd"
    ]
  }
,

  {
    "id": "billie_eilish",
    "name": "Billie Eilish",
    "aliases": [
      "billie eilish",
      "billie"
    ],
    "verified": true,
    "monthlyListeners": "106,000,000",
    "followers": "92,000,000",
    "bio": "Billie Eilish Pirate Baird O’Connell is an American singer-songwriter who first gained public attention with her debut single Ocean Eyes and has won nine Grammy Awards and two Oscars.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#059669",
    "genres": [
      "Alternative Pop",
      "Electropop",
      "Dark Pop"
    ],
    "topTrackIds": [
      "yt-cWMxCE2HTag"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "the_weeknd"
    ]
  }
,

  {
    "id": "dua_lipa",
    "name": "Dua Lipa",
    "aliases": [
      "dua lipa",
      "dua"
    ],
    "verified": true,
    "monthlyListeners": "74,000,000",
    "followers": "48,000,000",
    "bio": "Dua Lipa is an English and Albanian singer and songwriter known for her signature mezzo-soprano vocal range and modern disco-pop bangers.",
    "avatarUrl": "",
    "bannerUrl": "",
    "headerColor": "#7C3AED",
    "genres": [
      "Nu-Disco",
      "Dance Pop"
    ],
    "topTrackIds": [
      "yt-4NRXx6U8ABQ"
    ],
    "albums": [],
    "singles": [],
    "relatedArtistIds": [
      "the_weeknd"
    ]
  }
];

/**
 * Strips special characters, vowels, and excess spaces for high-tolerance phonetic comparison
 */
const normalizeText = (str = '') => {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Checks if a search query matches an artist name or their common aliases/misspellings
 */
export const checkArtistQueryMatch = (query = '', artist) => {
  if (!query || !artist) return false;
  const cleanQ = normalizeText(query);
  const cleanName = normalizeText(artist.name);

  if (cleanName.includes(cleanQ) || cleanQ.includes(cleanName)) return true;

  // Direct word containment (e.g. "singh" or "arijit" in "Arijit Singh")
  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length >= 3);
  const nameTokens = artist.name.toLowerCase().split(/\s+/);
  if (queryTokens.some((qt) => nameTokens.some((nt) => nt.includes(qt) || qt.includes(nt)))) {
    return true;
  }

  // Check aliases (like 'arjit singh', 'arjit', 'diljeet', 'moosewala')
  if (Array.isArray(artist.aliases)) {
    return artist.aliases.some((alias) => {
      const cleanAlias = normalizeText(alias);
      return (
        cleanAlias === cleanQ ||
        cleanAlias.includes(cleanQ) ||
        cleanQ.includes(cleanAlias)
      );
    });
  }

  return false;
};

/**
 * Normalizes an artist name for lookup
 */
export const normalizeArtistKey = (name = '') => {
  return name
    .toLowerCase()
    .replace(/[&,]/g, ' ')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
};

/**
 * Strict validator to verify that a track is performed, composed, or featured by an artist.
 * Prevents songs from leaking into other artists' profiles.
 */
export const isTrackByArtist = (track, artistName, artistId = '', artistAliases = []) => {
  if (!track || !track.artist) return false;

  // 1. Direct artist_id or featured_artist_ids match
  if (artistId && (track.artist_id === artistId || (Array.isArray(track.featured_artist_ids) && track.featured_artist_ids.includes(artistId)))) {
    return true;
  }

  const trackArtist = track.artist.toLowerCase();
  const target = (artistName || '').toLowerCase().trim();
  if (!target) return false;

  // 2. Break multi-artist credits into individual artist names
  // e.g. "Karan Aujla & Ikky", "Badshah, Diljit Dosanjh & Aastha Gill", "Arijit Singh, Shilpa Rao & Anirudh"
  const artists = trackArtist
    .split(/[,&/|•+]|\s+ft\.?\s+|\s+feat\.?\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const directMatch = artists.some((art) => {
    if (art === target) return true;
    if (art.includes(target)) return true;
    // Check significant tokens with 4+ characters (e.g. "Diljit", "Aujla", "Arijit", "Moose")
    const words = target.split(/\s+/).filter((w) => w.length >= 4);
    return words.length > 0 && words.some((w) => art.includes(w));
  });

  if (directMatch) return true;

  // 3. Check aliases
  if (Array.isArray(artistAliases) && artistAliases.length > 0) {
    return artistAliases.some((alias) => {
      const a = alias.toLowerCase().trim();
      if (a.length < 3) return false;
      return artists.some((art) => art === a || art.includes(a));
    });
  }

  return false;
};

/**
 * Finds or synthesizes an Artist Profile object
 * @param {string|Object} artistIdOrName 
 * @param {Array} additionalTracks - Optional live search tracks by this artist
 * @returns {Object} Comprehensive Spotify-like artist profile
 */
export const getArtistProfile = (artistIdOrName, additionalTracks = []) => {
  if (!artistIdOrName) return null;

  const raw = typeof artistIdOrName === 'object' 
    ? (artistIdOrName.name || artistIdOrName.artist || '') 
    : String(artistIdOrName).trim();
  const lower = raw.toLowerCase();
  const cleanKey = normalizeArtistKey(raw);

  // 1. Direct or alias match in curated database
  const found = ARTISTS_DATA.find((a) => {
    return (
      a.id.toLowerCase() === lower ||
      a.name.toLowerCase() === lower ||
      checkArtistQueryMatch(raw, a)
    );
  });

  const artistName = found ? found.name : (raw.split('&')[0].split(',')[0].trim() || 'Artist');
  const artistId = found ? found.id : cleanKey;
  const artistAliases = found ? (found.aliases || []) : [];

  // Collect strictly matching tracks for this artist across mock catalog and live tracks
  const combinedTracks = [
    ...additionalTracks,
    ...MOCK_TRACKS
  ];

  const artistTracks = combinedTracks.filter((t) => {
    return isTrackByArtist(t, artistName, artistId, artistAliases);
  });

  // Deduplicate tracks by id or title
  const trackMap = new Map();
  artistTracks.forEach((t) => {
    const key = t.id || t.title;
    if (!trackMap.has(key)) {
      trackMap.set(key, t);
    }
  });
  const uniqueTracks = Array.from(trackMap.values());

  if (found) {
    // Resolve full track objects for top tracks and ensure strict ownership
    const resolvedTopTracks = (found.topTrackIds || [])
      .map((id) => MOCK_TRACKS.find((t) => t.id === id))
      .filter((t) => Boolean(t) && isTrackByArtist(t, found.name, found.id, found.aliases));

    // Merge in any other strictly-matched tracks
    const finalTopTracks = [
      ...resolvedTopTracks,
      ...uniqueTracks.filter((ut) => !resolvedTopTracks.some((rt) => rt.id === ut.id))
    ];

    // Resolve albums with tracks (strictly filtered by artist ownership)
    const resolvedAlbums = (found.albums || []).map((alb) => {
      const albTracks = (alb.trackIds || [])
        .map((tid) => MOCK_TRACKS.find((t) => t.id === tid))
        .filter((t) => Boolean(t) && isTrackByArtist(t, found.name, found.id, found.aliases));
      return {
        ...alb,
        artist: found.name,
        tracks: albTracks
      };
    });

    // Resolve singles with tracks (strictly filtered by artist ownership)
    const resolvedSingles = (found.singles || []).map((single) => {
      const singleTracks = (single.trackIds || [])
        .map((tid) => MOCK_TRACKS.find((t) => t.id === tid))
        .filter((t) => Boolean(t) && isTrackByArtist(t, found.name, found.id, found.aliases));
      return {
        ...single,
        artist: found.name,
        tracks: singleTracks
      };
    });

    // Resolve related artists
    const relatedArtists = (found.relatedArtistIds || [])
      .map((rid) => ARTISTS_DATA.find((a) => a.id === rid))
      .filter(Boolean);

    return {
      ...found,
      topTracks: finalTopTracks,
      albums: resolvedAlbums,
      singles: resolvedSingles,
      relatedArtists: relatedArtists.length > 0 ? relatedArtists : ARTISTS_DATA.filter((a) => a.id !== found.id).slice(0, 4)
    };
  }

  // 2. Dynamic profile synthesis for any searched artist (from YouTube or web search)
  const displayName = artistName;
  const coverTrack = uniqueTracks[0] || null;
  const dynamicAvatar = coverTrack ? getTrackCoverUrl(coverTrack) : '';

  // Group tracks by album
  const albumGroups = {};
  uniqueTracks.forEach((t) => {
    const albName = t.album || `${displayName} Collection`;
    if (!albumGroups[albName]) {
      albumGroups[albName] = [];
    }
    albumGroups[albName].push(t);
  });

  const dynamicAlbums = Object.entries(albumGroups).map(([albName, trks], idx) => ({
    id: `dyn-album-${idx}-${albName.replace(/\s+/g, '-').toLowerCase()}`,
    title: albName,
    type: trks.length > 2 ? 'Album' : 'Single',
    artist: displayName,
    releaseYear: trks[0]?.releaseYear || 2024,
    coverUrl: getTrackCoverUrl(trks[0]),
    tracks: trks,
    totalTracks: trks.length,
    genre: trks[0]?.genre || 'Music'
  }));

  return {
    id: `artist-${cleanKey.replace(/\s+/g, '_')}`,
    name: displayName,
    verified: true,
    monthlyListeners: `${(Math.floor(Math.random() * 8) + 3)},${Math.floor(Math.random() * 899 + 100)},${Math.floor(Math.random() * 899 + 100)}`,
    followers: `${(Math.floor(Math.random() * 4) + 1)},${Math.floor(Math.random() * 899 + 100)},000`,
    bio: `${displayName} is an acclaimed musical artist featured on Jennie Music, delivering trending releases, chart-topping soundtracks, and stream hits.`,
    avatarUrl: dynamicAvatar,
    bannerUrl: dynamicAvatar,
    headerColor: '#1E293B',
    genres: [coverTrack?.genre || 'Popular', 'Trending'],
    topTracks: uniqueTracks,
    albums: dynamicAlbums,
    singles: [],
    relatedArtists: ARTISTS_DATA.slice(0, 4)
  };
};

/**
 * Resolves an Album object from an album ID, title, or artist catalog
 */
export const getAlbumData = (albumIdOrTitle, artistName = '') => {
  if (!albumIdOrTitle) return null;
  const raw = String(albumIdOrTitle).trim();
  const lower = raw.toLowerCase();

  // 1. Search through all curated artists' albums & singles
  for (const artist of ARTISTS_DATA) {
    const allReleases = [...(artist.albums || []), ...(artist.singles || [])];
    for (const alb of allReleases) {
      if (
        alb.id.toLowerCase() === lower ||
        alb.title.toLowerCase() === lower ||
        alb.title.toLowerCase().includes(lower) ||
        lower.includes(alb.title.toLowerCase())
      ) {
        const resolvedTracks = (alb.trackIds || [])
          .map((tid) => MOCK_TRACKS.find((t) => t.id === tid))
          .filter((t) => Boolean(t) && isTrackByArtist(t, artist.name, artist.id, artist.aliases));

        return {
          ...alb,
          artist: artist.name,
          artistId: artist.id,
          artistAvatar: artist.avatarUrl,
          tracks: resolvedTracks,
          totalTracks: resolvedTracks.length || alb.totalTracks || 1,
          moreByArtist: allReleases.filter((r) => r.id !== alb.id)
        };
      }
    }
  }

  // 2. Synthesize from MOCK_TRACKS matching album name
  const matchingTracks = MOCK_TRACKS.filter(
    (t) => t.album && (t.album.toLowerCase().includes(lower) || lower.includes(t.album.toLowerCase()))
  );

  if (matchingTracks.length > 0) {
    const first = matchingTracks[0];
    const artist = ARTISTS_DATA.find((a) => a.name.toLowerCase() === first.artist.toLowerCase()) || {
      id: `artist-${first.artist_id || 'unknown'}`,
      name: first.artist,
      avatarUrl: getTrackCoverUrl(first)
    };

    return {
      id: `album-${raw.replace(/\s+/g, '-').toLowerCase()}`,
      title: first.album || raw,
      type: matchingTracks.length > 1 ? 'Album' : 'Single',
      artist: artist.name,
      artistId: artist.id,
      artistAvatar: artist.avatarUrl,
      coverUrl: getTrackCoverUrl(first),
      releaseYear: first.releaseYear || 2023,
      tracks: matchingTracks,
      totalTracks: matchingTracks.length,
      genre: first.genre || 'Hindi Pop',
      moreByArtist: []
    };
  }

  // 3. Fallback generic album
  return {
    id: `album-${raw.replace(/\s+/g, '-').toLowerCase()}`,
    title: raw,
    type: 'Album',
    artist: artistName || 'Featured Artists',
    artistId: 'featured_artists',
    artistAvatar: '',
    coverUrl: '',
    releaseYear: 2024,
    tracks: [],
    totalTracks: 0,
    genre: 'Soundtrack',
    moreByArtist: []
  };
};

/**
 * Searches across curated artists, aliases, albums, and live search tracks
 */
export const searchArtistsAndAlbums = (query = '', liveTracks = []) => {
  if (!query || typeof query !== 'string') return { artists: [], albums: [] };
  const cleanQ = query.trim().toLowerCase();

  // 1. Find direct curated matches with aliases and fuzzy token matching
  const matchingArtists = ARTISTS_DATA.filter((a) => {
    return checkArtistQueryMatch(cleanQ, a);
  });

  // 2. Scan liveTracks from YouTube/Backend for artist mentions
  if (Array.isArray(liveTracks) && liveTracks.length > 0) {
    liveTracks.forEach((track) => {
      if (!track || !track.artist) return;
      const rawArtist = track.artist.trim();
      
      // Filter out record label channels like T-Series, Zee Music, etc.
      const lowerArtist = rawArtist.toLowerCase();
      const isRecordLabel = [
        't-series', 'tseries', 'sony music', 'zee music', 
        'speed records', 'yrf', 'tips official', 'eros now', 'saregama'
      ].some((label) => lowerArtist.includes(label));

      if (isRecordLabel) return;

      // Check if this artist in liveTracks matches an entry in ARTISTS_DATA
      const existing = ARTISTS_DATA.find((a) => checkArtistQueryMatch(rawArtist, a));
      if (existing) {
        if (!matchingArtists.some((ma) => ma.id === existing.id)) {
          matchingArtists.push(existing);
        }
      } else if (
        rawArtist.toLowerCase().includes(cleanQ) || 
        cleanQ.includes(rawArtist.toLowerCase())
      ) {
        // Synthesize dynamic profile for this live track artist
        const dynProfile = getArtistProfile(rawArtist, liveTracks);
        if (dynProfile && !matchingArtists.some((ma) => ma.name.toLowerCase() === dynProfile.name.toLowerCase())) {
          matchingArtists.push(dynProfile);
        }
      }
    });
  }

  // 3. Find matching albums
  const matchingAlbums = [];
  ARTISTS_DATA.forEach((artist) => {
    const releases = [...(artist.albums || []), ...(artist.singles || [])];
    releases.forEach((rel) => {
      if (
        rel.title.toLowerCase().includes(cleanQ) ||
        artist.name.toLowerCase().includes(cleanQ)
      ) {
        if (!matchingAlbums.some((ma) => ma.id === rel.id)) {
          matchingAlbums.push({
            ...rel,
            artist: artist.name,
            artistId: artist.id
          });
        }
      }
    });
  });

  return {
    artists: matchingArtists,
    albums: matchingAlbums
  };
};
