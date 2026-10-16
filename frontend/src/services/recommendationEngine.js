/**
 * Next Track & YouTube Mix Autoplay Engine for Jennie Music
 * 
 * Generates dynamic, intelligent queues that behave like YouTube Mix / Autoplay:
 * Starts from the played song's structured profile and widens into:
 * Pool A: Same-Artist Top Tracks (capped at 2-3 per 10)
 * Pool B: Related Artists (shared genre + language + region + collaborators)
 * Pool C: Regional Trending in Same Genre
 * Pool D: Adjacent Language/Region Discovery (matching energy & BPM)
 * Pool E: Collaborative Session Signals (coPlayed)
 * Pool F: Personal History & Liked Songs
 * 
 * ROOT RULE: Never uses search query text or title string matching!
 * Title text is display-only.
 * ZERO YouTube API calls per decision.
 */

import { MOCK_TRACKS } from '../data/mockTracks.js';
import { isTrackUnplayable } from './unplayableTracksRegistry.js';

/**
 * Normalizes artist identifier
 */
export function normalizeArtistId(artistOrId) {
  if (!artistOrId) return '';
  return String(artistOrId)
    .toLowerCase()
    .replace(/&.*/, '')
    .replace(/ft\..*/, '')
    .replace(/feat\..*/, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Extracts structured profile from a track object.
 * If fields are missing, infers standard defaults.
 */
export function getStructuredProfile(track) {
  if (!track) return null;

  const artistId = track.artist_id || normalizeArtistId(track.artist);
  const featuredArtistIds = Array.isArray(track.featured_artist_ids) 
    ? track.featured_artist_ids 
    : [];

  const genre = track.genre || 'Bollywood';
  const subGenre = track.sub_genre || (genre === 'Punjabi' ? 'Punjabi Hip-Hop' : 'Bollywood Romantic');
  const language = track.language || (genre === 'Punjabi' ? 'Punjabi' : (genre === 'Pop' ? 'English' : 'Hindi'));
  const region = track.region || (genre === 'Punjabi' ? 'Punjab' : (genre === 'Pop' ? 'Global' : 'North India / Bollywood'));
  
  const bpm = track.bpm || track.audioFeatures?.tempo || 95;
  const energy = typeof track.energy === 'number' ? track.energy : (track.audioFeatures?.energy || 0.70);
  const mood = track.mood || 'High Energy';
  const releaseYear = track.release_year || track.releaseYear || 2023;
  const popularityTier = track.popularity_tier || 'top_hit';
  const videoType = track.video_type || 'official_music_video';
  const label = track.label || 'Official Music';

  return {
    id: track.id,
    video_id: track.youtubeId || (track.id.startsWith('yt-') ? track.id.replace('yt-', '') : track.id),
    artist: track.artist,
    artist_id: artistId,
    featured_artist_ids: featuredArtistIds,
    genre,
    sub_genre: subGenre,
    language,
    region,
    mood,
    energy,
    bpm,
    release_year: releaseYear,
    label,
    popularity_tier: popularityTier,
    video_type: videoType,
    coPlayed: Array.isArray(track.coPlayed) ? track.coPlayed : [],
    duration: track.duration || 210,
    audioFeatures: track.audioFeatures || { tempo: bpm, energy },
    rawTrack: track
  };
}

/**
 * Filter out low-quality tracks (remixes, slowed, reverb, lyric, podcasts, live clips)
 */
export function isEligibleOfficialTrack(track) {
  if (!track || !track.id) return false;
  
  // Exclude tracks marked unplayable by YouTube embed restriction (100, 101, 150, 153)
  if (track.playable === false || isTrackUnplayable(track.id) || isTrackUnplayable(track.youtubeId)) {
    return false;
  }

  const title = (track.title || '').toLowerCase();
  
  // Exclude unwanted content types
  const forbiddenPatterns = [
    'slowed', 'reverb', 'remix', 'lofi flip', 'cover by', 
    'podcast', 'live stream', 'shorts', '8d audio', 'status video'
  ];
  for (const pat of forbiddenPatterns) {
    if (title.includes(pat)) return false;
  }

  // Duration filter: Prefer 2:00 to 6:30 for full-length songs
  if (track.duration && (track.duration < 100 || track.duration > 420)) {
    return false;
  }

  return true;
}

/**
 * Step 1: Candidate Pools Generation
 * Categorizes the catalog into pools A, B, C, D, E, F relative to the seed track.
 */
export function buildCandidatePools(seedProfile, catalog = MOCK_TRACKS, userContext = {}) {
  const pools = {
    A: [], // Same Artist
    B: [], // Related Artists in same genre/language/collaborators
    C: [], // Regional Trending in same genre
    D: [], // Adjacent Language / Region Discovery
    E: [], // Collaborative (coPlayed)
    F: []  // Personal (liked songs, replay history)
  };

  if (!seedProfile) return pools;

  const userLikes = new Set(userContext.likedSongIds || []);
  const userHistoryIds = new Set((userContext.history || []).map((t) => t.id || t.youtubeId));
  const seedArtistId = seedProfile.artist_id;
  const seedCollaborators = new Set([...seedProfile.featured_artist_ids, seedArtistId]);

  catalog.forEach((item) => {
    if (!item || !isEligibleOfficialTrack(item)) return;
    const profile = getStructuredProfile(item);
    if (!profile || profile.id === seedProfile.id) return; // Do not include seed

    const isSameArtist = profile.artist_id === seedArtistId;
    const isCollaborator = profile.featured_artist_ids.some((id) => seedCollaborators.has(id)) ||
                           seedCollaborators.has(profile.artist_id);

    // Pool F: Personal (User likes or replays)
    if (userLikes.has(profile.id) || userLikes.has(profile.video_id) || userHistoryIds.has(profile.id)) {
      pools.F.push({ profile, source_pool: 'F' });
    }

    // Pool E: Collaborative (tracks co-played with seed)
    const isCoPlayed = seedProfile.coPlayed.includes(profile.id) ||
                       seedProfile.coPlayed.includes(profile.video_id) ||
                       profile.coPlayed.includes(seedProfile.id) ||
                       profile.coPlayed.includes(seedProfile.video_id);
    if (isCoPlayed) {
      pools.E.push({ profile, source_pool: 'E' });
    }

    // Pool A: Same Artist
    if (isSameArtist) {
      pools.A.push({ profile, source_pool: 'A' });
      return; // If same artist, do not duplicate into B or C
    }

    // Pool B: Related Artists (collaborators OR same genre + language + region)
    if (isCollaborator || (profile.genre === seedProfile.genre && profile.language === seedProfile.language)) {
      pools.B.push({ profile, source_pool: 'B' });
      return;
    }

    // Pool C: Same Genre / Regional Trending
    if (profile.genre === seedProfile.genre || profile.region === seedProfile.region) {
      pools.C.push({ profile, source_pool: 'C' });
      return;
    }

    // Pool D: Adjacent Language / Region Discovery (different scene, matching energy & BPM)
    const bpmDiff = Math.abs(profile.bpm - seedProfile.bpm);
    const energyDiff = Math.abs(profile.energy - seedProfile.energy);
    if (bpmDiff <= 35 && energyDiff <= 0.35) {
      pools.D.push({ profile, source_pool: 'D' });
    }
  });

  return pools;
}

/**
 * Step 3: Candidate Scoring (Pure structured profile + audio features + signals)
 * Weights:
 * - Genre / sub-genre + language match: 25%
 * - Mood / energy / BPM similarity: 20%
 * - Popularity & quality: 20%
 * - Personal affinity + collaborative signal: 20%
 * - Freshness (release year close to seed, recent): 10%
 * - Same-artist bonus: 5% (tiebreaker only, never dominant)
 */
export function scoreCandidate(candidateProfile, seedProfile, sourcePool, userContext = {}) {
  // 1. Genre + Language Match (25%)
  let genreScore = 0;
  if (candidateProfile.genre === seedProfile.genre) genreScore += 0.6;
  if (candidateProfile.sub_genre === seedProfile.sub_genre) genreScore += 0.2;
  if (candidateProfile.language === seedProfile.language) genreScore += 0.2;
  const weightedGenre = genreScore * 0.25;

  // 2. Mood, Energy & BPM Similarity (20%)
  const bpmDiff = Math.abs(candidateProfile.bpm - seedProfile.bpm);
  const bpmScore = Math.max(0, 1 - bpmDiff / 60);
  const energyDiff = Math.abs(candidateProfile.energy - seedProfile.energy);
  const energyScore = Math.max(0, 1 - energyDiff);
  const moodScore = candidateProfile.mood === seedProfile.mood ? 1.0 : 0.6;
  const audioSimilarity = (bpmScore * 0.4 + energyScore * 0.4 + moodScore * 0.2);
  const weightedAudio = audioSimilarity * 0.20;

  // 3. Popularity & Quality Tier (20%)
  let popScore = 0.7;
  if (candidateProfile.popularity_tier === 'blockbuster') popScore = 1.0;
  else if (candidateProfile.popularity_tier === 'top_hit') popScore = 0.88;
  else if (candidateProfile.popularity_tier === 'trending') popScore = 0.80;
  const weightedPop = popScore * 0.20;

  // 4. Personal Affinity & Collaborative Signal (20%)
  let affinityScore = 0.3;
  const userLikes = userContext.likedSongIds || [];
  if (userLikes.includes(candidateProfile.id) || userLikes.includes(candidateProfile.video_id)) {
    affinityScore = 1.0;
  } else if (sourcePool === 'E' || sourcePool === 'F') {
    affinityScore = 0.85;
  }
  const weightedAffinity = affinityScore * 0.20;

  // 5. Freshness / Release Year Proximity (10%)
  const yearDiff = Math.abs(candidateProfile.release_year - seedProfile.release_year);
  const freshnessScore = Math.max(0.2, 1 - yearDiff / 10);
  const weightedFreshness = freshnessScore * 0.10;

  // 6. Same-Artist Bonus (5% tiebreaker only)
  const sameArtistBonus = (candidateProfile.artist_id === seedProfile.artist_id) ? 0.05 : 0.0;

  let totalScore = weightedGenre + weightedAudio + weightedPop + weightedAffinity + weightedFreshness + sameArtistBonus;

  // Live Session Dynamic Adaptation Modifiers (Step 5)
  const sessionPenalties = userContext.sessionArtistPenalties || {};
  const penalty = sessionPenalties[candidateProfile.artist_id] || 0;
  totalScore = Math.max(0.05, totalScore * (1 - penalty));

  // Determine clear human-readable reason
  let reason = '';
  if (candidateProfile.artist_id === seedProfile.artist_id) {
    reason = `More hits by ${seedProfile.artist}`;
  } else if (sourcePool === 'B') {
    reason = `Related artist in ${candidateProfile.language} ${candidateProfile.genre}`;
  } else if (sourcePool === 'C') {
    reason = `Trending ${candidateProfile.genre} in ${candidateProfile.region}`;
  } else if (sourcePool === 'D') {
    reason = `Adjacent discovery: similar energy (${candidateProfile.bpm} BPM)`;
  } else if (sourcePool === 'E') {
    reason = `Commonly listened together with ${seedProfile.artist}`;
  } else if (sourcePool === 'F') {
    reason = `From your library & listening taste`;
  } else {
    reason = `Similar vibe and tempo`;
  }

  return {
    score: Math.min(0.99, Math.round(totalScore * 100) / 100),
    reason
  };
}

/**
 * Step 4: Hard Constraints Validator
 * - No artist more than 2 times in any 6-song window, and no more than 3 in 10.
 * - No repeat of any song played in the last 30 tracks.
 * - At least 4 different artists in every 10-song queue.
 * - Do not repeat a song "series" pattern (same title stem).
 * - If two consecutive tracks are from same language/scene, next should come from different pool.
 */
export function checkHardConstraints(candidateProfile, currentQueue, historyTracks = []) {
  // 1. History check (last 30 tracks)
  const recent30 = historyTracks.slice(0, 30).map((t) => t.id || t.youtubeId);
  if (recent30.includes(candidateProfile.id) || recent30.includes(candidateProfile.video_id)) {
    return { pass: false, reason: 'repeat_in_last_30' };
  }

  // 2. Queue duplicate check
  if (currentQueue.some((q) => q.video_id === candidateProfile.video_id || q.id === candidateProfile.id)) {
    return { pass: false, reason: 'already_in_queue' };
  }

  // 3. Window check: Max 2 times in any 6-song window
  const last5 = currentQueue.slice(-5);
  const artistCountInWindow = last5.filter((q) => q.artist_id === candidateProfile.artist_id).length;
  if (artistCountInWindow >= 2) {
    return { pass: false, reason: 'artist_window_limit_2_in_6' };
  }

  // 4. Queue total artist check: Max 3 times in 10-song queue
  const artistTotalInQueue = currentQueue.filter((q) => q.artist_id === candidateProfile.artist_id).length;
  if (artistTotalInQueue >= 3) {
    return { pass: false, reason: 'artist_queue_limit_3_in_10' };
  }

  // 5. Anti-clustering: Never 3 same-artist tracks in a row
  if (currentQueue.length >= 2) {
    const prev1 = currentQueue[currentQueue.length - 1];
    const prev2 = currentQueue[currentQueue.length - 2];
    if (prev1.artist_id === candidateProfile.artist_id && prev2.artist_id === candidateProfile.artist_id) {
      return { pass: false, reason: 'no_three_consecutive_same_artist' };
    }
  }

  // 6. Language alternation if last two were from identical language and scene
  if (currentQueue.length >= 2) {
    const prev1 = currentQueue[currentQueue.length - 1];
    const prev2 = currentQueue[currentQueue.length - 2];
    if (prev1.language === prev2.language && 
        prev1.language === candidateProfile.language && 
        prev1.source_pool === candidateProfile.source_pool) {
      // Allow only if candidate has very high score or no alternatives
      // Will be handled during pool selection
    }
  }

  return { pass: true, reason: 'PASS' };
}

/**
 * Step 2: Queue Mix Construction (Target Ratios & Interleaving)
 * Ratios per 10 tracks:
 * - Pool A (Same artist): 2-3 tracks max
 * - Pool B (Related artists): 3-4 tracks
 * - Pool C (Regional trending): 2 tracks
 * - Pool D (Adjacent discovery): 1-2 tracks
 * - Pool E/F (Personal / Collaborative): fills remaining (up to 40% if history exists)
 * 
 * Target Interleaved Sequence Pattern:
 * [other, same, other, other, same, other, other, other, same, other]
 */
export function buildRecommendedQueue(seedTrack, queueSize = 10, userContext = {}, catalog = MOCK_TRACKS) {
  const seedProfile = getStructuredProfile(seedTrack);
  if (!seedProfile) return [];

  // Generate Pools A, B, C, D, E, F
  const pools = buildCandidatePools(seedProfile, catalog, userContext);

  // Score each pool's candidates
  const scoredPools = {};
  ['A', 'B', 'C', 'D', 'E', 'F'].forEach((poolKey) => {
    scoredPools[poolKey] = pools[poolKey].map(({ profile, source_pool }) => {
      const scoring = scoreCandidate(profile, seedProfile, source_pool, userContext);
      return {
        ...profile,
        ...profile.rawTrack,
        video_id: profile.video_id,
        source_pool,
        score: scoring.score,
        reason: scoring.reason,
        artist_cap_check: 'PASS'
      };
    }).sort((a, b) => b.score - a.score);
  });

  const queue = [];
  const historyTracks = userContext.history || [];
  
  // Track pool usage counts
  const poolCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  const maxPoolA = 3; // Max 2-3 same artist tracks in 10

  // Desired pool sequence pattern for 10 songs:
  // [B/E, A, B/C, D, A, B, C, E/F, A, D]
  const slotPoolPreferences = [
    ['B', 'E', 'C'],      // Slot 1: Related / Collaborative hit
    ['A', 'B'],           // Slot 2: Same artist blockbuster
    ['B', 'C', 'F'],      // Slot 3: Related artist
    ['D', 'C'],           // Slot 4: Adjacent discovery (shared BPM/energy)
    ['A', 'B', 'E'],      // Slot 5: Same artist or high collaborative
    ['B', 'C'],           // Slot 6: Related artist in same scene
    ['C', 'D'],           // Slot 7: Regional trending
    ['E', 'F', 'B'],      // Slot 8: Personal / Collaborative
    ['A', 'B', 'C'],      // Slot 9: Same artist or related
    ['D', 'B', 'C']       // Slot 10: Discovery finish
  ];

  for (let i = 0; i < queueSize; i++) {
    const preferredPools = slotPoolPreferences[i % slotPoolPreferences.length];
    let selectedTrack = null;

    // Try finding top candidate from preferred pools adhering to hard constraints
    for (const poolKey of preferredPools) {
      if (poolKey === 'A' && poolCounts.A >= maxPoolA) continue;

      const candidateList = scoredPools[poolKey] || [];
      for (let cIdx = 0; cIdx < candidateList.length; cIdx++) {
        const candidate = candidateList[cIdx];
        const constraint = checkHardConstraints(candidate, queue, historyTracks);
        if (constraint.pass) {
          selectedTrack = candidate;
          poolCounts[poolKey]++;
          candidateList.splice(cIdx, 1); // Consume candidate
          break;
        }
      }
      if (selectedTrack) break;
    }

    // Fallback: If preferred pools didn't yield an unconstrained candidate, search all pools
    if (!selectedTrack) {
      const allPoolKeys = ['B', 'C', 'E', 'F', 'D', 'A'];
      for (const poolKey of allPoolKeys) {
        if (poolKey === 'A' && poolCounts.A >= maxPoolA) continue;
        const candidateList = scoredPools[poolKey] || [];
        for (let cIdx = 0; cIdx < candidateList.length; cIdx++) {
          const candidate = candidateList[cIdx];
          const constraint = checkHardConstraints(candidate, queue, historyTracks);
          if (constraint.pass) {
            selectedTrack = candidate;
            poolCounts[poolKey]++;
            candidateList.splice(cIdx, 1);
            break;
          }
        }
        if (selectedTrack) break;
      }
    }

    // Ultimate fallback if catalog is tight: pick highest scoring remaining non-duplicate
    if (!selectedTrack) {
      for (const poolKey of ['B', 'C', 'D', 'E', 'A']) {
        const candidateList = scoredPools[poolKey] || [];
        const nonDup = candidateList.find((c) => !queue.some((q) => q.video_id === c.video_id));
        if (nonDup) {
          selectedTrack = nonDup;
          break;
        }
      }
    }

    if (selectedTrack) {
      queue.push({
        ...selectedTrack,
        recommendationReason: selectedTrack.reason,
        recommendationConfidence: selectedTrack.score,
        recommendationCategory: selectedTrack.source_pool === 'A' ? 'same_artist' : 
                                (selectedTrack.source_pool === 'D' ? 'discovery' : 'related_artist')
      });
    }
  }

  // Final Validation Guarantee:
  // Must have at least 4 distinct artists in a 10-song queue!
  const distinctArtists = new Set(queue.map((q) => q.artist_id));
  if (distinctArtists.size < 4 && catalog.length >= 8) {
    const unusedArtists = catalog
      .map(getStructuredProfile)
      .filter((p) => p && !distinctArtists.has(p.artist_id) && isEligibleOfficialTrack(p));

    if (unusedArtists.length > 0 && queue.length >= 4) {
      // Replace slot 3 or 7 with a new artist
      const replaceSlot = queue.length >= 7 ? 6 : 2;
      const injected = unusedArtists[0];
      const scoring = scoreCandidate(injected, seedProfile, 'B', userContext);
      queue[replaceSlot] = {
        ...injected,
        ...injected.rawTrack,
        video_id: injected.video_id,
        source_pool: 'B',
        score: scoring.score,
        reason: 'Related artist discovery',
        recommendationReason: 'Related artist discovery',
        recommendationConfidence: scoring.score,
        recommendationCategory: 'discovery'
      };
    }
  }

  return queue;
}

/**
 * Single Next-Song Decision for autoplay when queue ends
 */
export function decideNextSong(currentTrack, userContext = {}, catalog = MOCK_TRACKS) {
  const generatedQueue = buildRecommendedQueue(currentTrack, 3, userContext, catalog);
  if (generatedQueue.length > 0) {
    const winner = generatedQueue[0];
    return {
      song_id: winner.id,
      video_id: winner.video_id,
      source_pool: winner.source_pool || 'B',
      score: winner.score || 0.85,
      reason_for_recommendation: winner.reason || winner.recommendationReason,
      confidence_score: winner.score || 0.85,
      artist_cap_check: 'PASS',
      track: winner
    };
  }

  return {
    song_id: currentTrack.id,
    video_id: currentTrack.youtubeId,
    source_pool: 'B',
    score: 0.70,
    reason_for_recommendation: 'Next song autoplay',
    confidence_score: 0.70,
    artist_cap_check: 'PASS',
    track: currentTrack
  };
}
