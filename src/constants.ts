import { ScaleDefinition, ChordDefinition, NoteValue } from './types'; // NoteValue will be derived

export const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'] as const;

// type NoteValue = typeof NOTES[number]; // Defined in types.ts

export const STANDARD_TUNING: readonly NoteValue[] = ['E', 'A', 'D', 'G', 'B', 'E'] as const;

export const TUNING_MIDI_BASE: { readonly [key: number]: number } = {
    0: 64, 1: 59, 2: 55, 3: 50, 4: 45, 5: 40,
};
export const NUM_FRETS = 12;

export const SCALES: Record<string, ScaleDefinition> = {
  major: { name: 'major', intervals: [0, 2, 4, 5, 7, 9, 11] },
  minorNatural: { name: 'minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
  // pentatonicMinor: { name: 'minor pentatonic', intervals: [0, 3, 5, 7, 10] },
};

export const CHORDS: Record<string, ChordDefinition> = {
  // Triads
  major:       { name: 'M',    intervals: [0, 4, 7],       quality: 'Stable, Bright' },
  minor:       { name: 'm',    intervals: [0, 3, 7],       quality: 'Somber, Reflective' },
  diminished:  { name: 'dim',  intervals: [0, 3, 6],       quality: 'Tense, Unstable' },
  augmented:   { name: 'aug',  intervals: [0, 4, 8],       quality: 'Suspenseful, Ethereal' },

  // Suspended triads
  sus2:        { name: 'sus2', intervals: [0, 2, 7],       quality: 'Open, Airy' },
  sus4:        { name: 'sus4', intervals: [0, 5, 7],       quality: 'Anticipatory, Floating' },

  // "Add" chords (extensions without seventh)
  add2:        { name: 'add2',      intervals: [0, 2, 4, 7],   quality: 'Open, Bright Extension' },
  minorAdd2:   { name: 'm(add2)',   intervals: [0, 2, 3, 7],   quality: 'Somber, Open Extension' },
  add9:        { name: 'add9',      intervals: [0, 4, 7, 14],  quality: 'Rich, Extended Major' },
  minorAdd9:   { name: 'm(add9)',   intervals: [0, 3, 7, 14],  quality: 'Rich, Extended Minor' },

  // Sixth chords
  major6:      { name: '6',    intervals: [0, 4, 7, 9],       quality: 'Sweet, Nostalgic' },
  minor6:      { name: 'm6',   intervals: [0, 3, 7, 9],       quality: 'Jazzy Minor, Sophisticated' },

  // Seventh chords
  dominant7:   { name: '7',      intervals: [0, 4, 7, 10],  quality: 'Bluesy, Driving' },
  major7:      { name: 'maj7',   intervals: [0, 4, 7, 11],  quality: 'Jazzy, Smooth' },
  minor7:      { name: 'm7',     intervals: [0, 3, 7, 10],  quality: 'Soulful, Mellow' },
  diminished7: { name: 'dim7',   intervals: [0, 3, 6, 9],   quality: 'Very Tense, Dramatic' },
  // halfDiminished7: { name: 'm7b5', intervals: [0, 3, 6, 10], quality: 'Jazzy, Unsettled' },
  // minorMajor7:     { name: 'mM7',  intervals: [0, 3, 7, 11], quality: 'Mysterious, Cinematic' },

  // Seventh extension
  augmented7:  { name: 'aug7',  intervals: [0, 4, 8, 10],  quality: 'Unusual, Searching' },

  // Ninth chords
  dominant9:   { name: '9',      intervals: [0, 4, 7, 10, 14], quality: 'Funky, Rich' },
  major9:      { name: 'maj9',   intervals: [0, 4, 7, 11, 14], quality: 'Lush, Dreamy' },
  minor9:      { name: 'm9',     intervals: [0, 3, 7, 10, 14], quality: 'Smooth, Introspective' },
  // sixNine:       { name: '69',   intervals: [0, 4, 7, 9, 14],  quality: 'Jazzy, Full' },
  // sevenSharpNine:{ name: '7#9', intervals: [0, 4, 7, 10, 15], quality: 'Hendrix Chord, Edgy' },
  // sevenFlatNine: { name: '7b9', intervals: [0, 4, 7, 10, 13], quality: 'Tense Dominant, Jazzy' },
};


// ... (UNIQUE_NOTE_COLORS, etc. remain the same)
export const UNIQUE_NOTE_COLORS: Record<NoteValue, string> = { 'A': 'bg-red-500', 'A#': 'bg-orange-500', 'B': 'bg-yellow-400', 'C': 'bg-lime-500', 'C#': 'bg-green-500', 'D': 'bg-teal-500', 'D#': 'bg-cyan-500', 'E': 'bg-blue-500', 'F': 'bg-indigo-500', 'F#': 'bg-purple-500', 'G': 'bg-fuchsia-500', 'G#': 'bg-pink-500', };
export const UNIQUE_NOTE_TEXT_COLORS: Record<NoteValue, string> = { 'A': 'text-white', 'A#': 'text-white', 'B': 'text-black', 'C': 'text-black', 'C#': 'text-white', 'D': 'text-white', 'D#': 'text-white', 'E': 'text-white', 'F': 'text-white', 'F#': 'text-white', 'G': 'text-white', 'G#': 'text-white', };
export const COMMON_NOTE_TEXT_STYLE = 'font-semibold text-xs';
export const SELECTED_FRET_CELL_BG = 'bg-yellow-200 dark:bg-yellow-300';
