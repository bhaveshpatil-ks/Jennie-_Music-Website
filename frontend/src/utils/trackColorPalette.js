/**
 * Track Color Palette Engine
 * Generates an ambient 2-color gradient mix according to track genre, artist, and mood.
 * Directly fulfills the design spec: "background according to track mix of two colours".
 */

const GENRE_PALETTES = {
  bollywood: { primary: '#b91c1c', secondary: '#c2410c' }, // Crimson & Amber
  punjabi: { primary: '#c026d3', secondary: '#f59e0b' },   // Fuchsia & Golden
  pop: { primary: '#ec4899', secondary: '#6366f1' },       // Rose & Indigo
  kpop: { primary: '#f43f5e', secondary: '#8b5cf6' },      // Rose & Purple
  lofi: { primary: '#059669', secondary: '#0284c7' },      // Emerald & Cyan
  hiphop: { primary: '#7c3aed', secondary: '#db2777' },    // Purple & Pink
  synthwave: { primary: '#ec4899', secondary: '#06b6d4' }, // Neon Pink & Cyan
  ambient: { primary: '#1e3a8a', secondary: '#0f766e' },   // Deep Blue & Teal
  rock: { primary: '#dc2626', secondary: '#475569' },      // Crimson & Slate
  rnb: { primary: '#9333ea', secondary: '#e11d48' },       // Violet & Ruby
  classical: { primary: '#d97706', secondary: '#78350f' }, // Amber & Mahogany
};

const DEFAULT_PALETTES = [
  { primary: '#7c3aed', secondary: '#db2777' }, // Purple / Rose
  { primary: '#2563eb', secondary: '#059669' }, // Royal Blue / Emerald
  { primary: '#dc2626', secondary: '#d97706' }, // Crimson / Amber
  { primary: '#0891b2', secondary: '#4f46e5' }, // Cyan / Indigo
  { primary: '#e11d48', secondary: '#7c3aed' }, // Rose / Violet
];

/**
 * Derives a deterministic 2-color mix from a track object
 */
export function getTrackTwoColorMix(track) {
  if (!track) {
    return {
      primary: '#18181b',
      secondary: '#09090b',
      gradient: 'radial-gradient(ellipse at 50% 20%, rgba(124, 58, 237, 0.25) 0%, rgba(7, 7, 7, 0.95) 75%)',
    };
  }

  const genreKey = (track.genre || '').toLowerCase().replace(/[^a-z]/g, '');
  for (const [key, palette] of Object.entries(GENRE_PALETTES)) {
    if (genreKey.includes(key)) {
      return {
        primary: palette.primary,
        secondary: palette.secondary,
        gradient: `radial-gradient(circle at 35% 25%, ${palette.primary}44 0%, transparent 60%), radial-gradient(circle at 75% 75%, ${palette.secondary}38 0%, #070707 85%)`,
      };
    }
  }

  // Hash track id/title for a deterministic pairing
  const seed = (track.id || track.title || 'jennie').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const palette = DEFAULT_PALETTES[seed % DEFAULT_PALETTES.length];

  return {
    primary: palette.primary,
    secondary: palette.secondary,
    gradient: `radial-gradient(circle at 30% 25%, ${palette.primary}44 0%, transparent 60%), radial-gradient(circle at 75% 75%, ${palette.secondary}38 0%, #070707 85%)`,
  };
}
