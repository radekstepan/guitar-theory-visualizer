// src/constants.ts
import { ScaleDefinition, ChordDefinition, NoteValue } from './types';
import { Interval, Note } from 'tonal';

export const NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'] as const;

export const STANDARD_TUNING: readonly NoteValue[] = ['E', 'A', 'D', 'G', 'B', 'E'] as const;

export const TUNING_MIDI_BASE: { readonly [key: number]: number } = {
    0: 64, 1: 59, 2: 55, 3: 50, 4: 45, 5: 40,
};
export const NUM_FRETS = 12;

export const MODE_NAMES_ORDERED = [
  'ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'
] as const;

export type ModeKey = typeof MODE_NAMES_ORDERED[number];

export const MAJOR_SCALE_INTERVALS_FROM_ROOT = [0, 2, 4, 5, 7, 9, 11]; // P1, M2, M3, P4, P5, M6, M7

export const SCALES: Record<string, ScaleDefinition> = {
  // Main "Scales" for quick access, effectively modes
  major: { 
    name: 'Major (Ionian)', 
    intervals: MAJOR_SCALE_INTERVALS_FROM_ROOT, 
    isMode: true, parentScaleDegree: 1, parentScaleKey: 'ionian',
    formula: "1 2 3 4 5 6 7", 
    descriptor: "The standard major scale. Bright, happy.",
    commonUsage: "Foundation of Western music, pop, rock, classical."
  },
  minorNatural: { 
    name: 'Natural Minor (Aeolian)', 
    intervals: [0, 2, 3, 5, 7, 8, 10], 
    isMode: true, parentScaleDegree: 6, parentScaleKey: 'aeolian',
    formula: "1 2 ♭3 4 5 ♭6 ♭7", 
    descriptor: "The standard natural minor scale. Sad, serious.",
    commonUsage: "Pop, rock, classical, folk music for a melancholic feel."
  },

  // Explicit Modes
  ionian: { 
    name: 'Ionian', 
    intervals: MAJOR_SCALE_INTERVALS_FROM_ROOT, 
    isMode: true, parentScaleDegree: 1, parentScaleKey: 'ionian',
    formula: "1 2 3 4 5 6 7", 
    descriptor: "Same as the Major scale. Bright, happy, resolved.",
    commonUsage: "Used as the primary major sound in most genres."
  },
  dorian: { 
    name: 'Dorian', 
    intervals: [0, 2, 3, 5, 7, 9, 10], 
    isMode: true, parentScaleDegree: 2, parentScaleKey: 'ionian',
    formula: "1 2 ♭3 4 5 6 ♭7", 
    descriptor: "Minor-like with a natural 6th. Jazzy, melancholic but hopeful.",
    commonUsage: "Jazz, funk, folk, rock (e.g., Santana, Pink Floyd). Good over minor or m7 chords."
  },
  phrygian: { 
    name: 'Phrygian', 
    intervals: [0, 1, 3, 5, 7, 8, 10], 
    isMode: true, parentScaleDegree: 3, parentScaleKey: 'ionian',
    formula: "1 ♭2 ♭3 4 5 ♭6 ♭7", 
    descriptor: "Minor-like with a flat 2nd. Spanish, exotic, dark.",
    commonUsage: "Flamenco, metal, film scores. Creates tension with its ♭2."
  },
  lydian: { 
    name: 'Lydian', 
    intervals: [0, 2, 4, 6, 7, 9, 11], 
    isMode: true, parentScaleDegree: 4, parentScaleKey: 'ionian',
    formula: "1 2 3 ♯4 5 6 7", 
    descriptor: "Major-like with a sharp 4th. Dreamy, ethereal, bright.",
    commonUsage: "Jazz, film scores (e.g., The Simpsons theme), alternative rock. Over major or maj7 chords for a floaty sound."
  },
  mixolydian: { 
    name: 'Mixolydian', 
    intervals: [0, 2, 4, 5, 7, 9, 10], 
    isMode: true, parentScaleDegree: 5, parentScaleKey: 'ionian',
    formula: "1 2 3 4 5 6 ♭7", 
    descriptor: "Major-like with a flat 7th. Bluesy, dominant, leading.",
    commonUsage: "Blues, rock, country, funk. The sound of dominant 7th chords."
  },
  aeolian: { 
    name: 'Aeolian', 
    intervals: [0, 2, 3, 5, 7, 8, 10], 
    isMode: true, parentScaleDegree: 6, parentScaleKey: 'ionian',
    formula: "1 2 ♭3 4 5 ♭6 ♭7", 
    descriptor: "Same as the Natural Minor scale. Sad, serious, common minor sound.",
    commonUsage: "Most common minor sound in pop, rock, and classical music."
  },
  locrian: { 
    name: 'Locrian', 
    intervals: [0, 1, 3, 5, 6, 8, 10], 
    isMode: true, parentScaleDegree: 7, parentScaleKey: 'ionian',
    formula: "1 ♭2 ♭3 4 ♭5 ♭6 ♭7", 
    descriptor: "Diminished-like with a flat 5th and flat 2nd. Dissonant, unstable.",
    commonUsage: "Rarely used melodically due to its tritone with the root (♭5). Sometimes in jazz or metal for extreme tension. Often over m7♭5 chords."
  },
  // Future: pentatonicMinor, etc.
};

// Helper to get parent major root note for a given mode root and mode type
export const getParentMajorRoot = (modeRoot: NoteValue, modeKey: string): NoteValue | null => {
  const scaleDef = SCALES[modeKey];
  if (!scaleDef || !scaleDef.isMode || typeof scaleDef.parentScaleDegree !== 'number') return null;
  
  const intervalFromParentRootToModeRoot = MAJOR_SCALE_INTERVALS_FROM_ROOT[scaleDef.parentScaleDegree - 1];
  const transposed = Note.transpose(modeRoot, Interval.fromSemitones(-intervalFromParentRootToModeRoot));
  const simplified = Note.simplify(transposed);
  return NOTES.includes(simplified as NoteValue) ? simplified as NoteValue : Note.enharmonic(simplified) as NoteValue;
};

// Helper to get all relative modes from a given parent major root
export const getRelativeModes = (parentMajorRoot: NoteValue): { key: ModeKey, root: NoteValue, name: string }[] => {
  return MODE_NAMES_ORDERED.map(modeKey => {
    const scaleDef = SCALES[modeKey];
    if (!scaleDef || !scaleDef.isMode || typeof scaleDef.parentScaleDegree !== 'number') throw new Error("Invalid mode key: "+ modeKey);
    
    const intervalFromParentRoot = MAJOR_SCALE_INTERVALS_FROM_ROOT[scaleDef.parentScaleDegree - 1];
    let modeRootCalc = Note.transpose(parentMajorRoot, Interval.fromSemitones(intervalFromParentRoot));
    modeRootCalc = Note.simplify(modeRootCalc);
    if (!NOTES.includes(modeRootCalc as NoteValue)) { // Ensure it's in our NOTES format (e.g. A# not Bb)
        modeRootCalc = Note.enharmonic(modeRootCalc);
    }

    return {
      key: modeKey,
      root: modeRootCalc as NoteValue,
      name: `${modeRootCalc} ${scaleDef.name}`
    };
  });
};

// For Chord-Mode Integration: Mode Compatibility
export const CHORD_MODE_SUGGESTIONS: Record<string, ModeKey[]> = {
  'major': ['ionian', 'lydian'],
  'minor': ['aeolian', 'dorian', 'phrygian'],
  'diminished': ['locrian'], 
  'augmented': [], 
  'sus2': ['dorian', 'mixolydian', 'ionian'], 
  'sus4': ['mixolydian', 'dorian', 'ionian'], 
  'add2': ['ionian', 'lydian'],
  'minorAdd2': ['aeolian', 'dorian'],
  'add9': ['ionian', 'lydian'],
  'minorAdd9': ['aeolian', 'dorian'],
  'major6': ['ionian', 'lydian'], 
  'minor6': ['dorian'], // Melodic minor is often used, but Dorian fits from natural modes.
  'dominant7': ['mixolydian'],
  'major7': ['ionian', 'lydian'],
  'minor7': ['dorian', 'aeolian', 'phrygian'],
  'diminished7': [], 
  'augmented7': [], 
};


export const CHORDS: Record<string, ChordDefinition> = {
  major:       { name: 'M',    intervals: [0, 4, 7],       quality: 'Stable, Bright' },
  minor:       { name: 'm',    intervals: [0, 3, 7],       quality: 'Somber, Reflective' },
  diminished:  { name: 'dim',  intervals: [0, 3, 6],       quality: 'Tense, Unstable' },
  augmented:   { name: 'aug',  intervals: [0, 4, 8],       quality: 'Suspenseful, Ethereal' },
  sus2:        { name: 'sus2', intervals: [0, 2, 7],       quality: 'Open, Airy' },
  sus4:        { name: 'sus4', intervals: [0, 5, 7],       quality: 'Anticipatory, Floating' },
  add2:        { name: 'add2',      intervals: [0, 2, 4, 7],   quality: 'Open, Bright Extension' },
  minorAdd2:   { name: 'm(add2)',   intervals: [0, 2, 3, 7],   quality: 'Somber, Open Extension' },
  add9:        { name: 'add9',      intervals: [0, 4, 7, 14],  quality: 'Rich, Extended Major' }, // 14 % 12 = 2
  minorAdd9:   { name: 'm(add9)',   intervals: [0, 3, 7, 14],  quality: 'Rich, Extended Minor' }, // 14 % 12 = 2
  major6:      { name: '6',    intervals: [0, 4, 7, 9],       quality: 'Sweet, Nostalgic' },
  minor6:      { name: 'm6',   intervals: [0, 3, 7, 9],       quality: 'Jazzy Minor, Sophisticated' },
  dominant7:   { name: '7',      intervals: [0, 4, 7, 10],  quality: 'Bluesy, Driving' },
  major7:      { name: 'maj7',   intervals: [0, 4, 7, 11],  quality: 'Jazzy, Smooth' },
  minor7:      { name: 'm7',     intervals: [0, 3, 7, 10],  quality: 'Soulful, Mellow' },
  diminished7: { name: 'dim7',   intervals: [0, 3, 6, 9],   quality: 'Very Tense, Dramatic' },
  augmented7:  { name: 'aug7',  intervals: [0, 4, 8, 10],  quality: 'Unusual, Searching' },
  dominant9:   { name: '9',      intervals: [0, 4, 7, 10, 14], quality: 'Funky, Rich' },
  major9:      { name: 'maj9',   intervals: [0, 4, 7, 11, 14], quality: 'Lush, Dreamy' },
  minor9:      { name: 'm9',     intervals: [0, 3, 7, 10, 14], quality: 'Smooth, Introspective' },
};

export const UNIQUE_NOTE_COLORS: Record<NoteValue, string> = { 'A': 'bg-red-500', 'A#': 'bg-orange-500', 'B': 'bg-yellow-400', 'C': 'bg-lime-500', 'C#': 'bg-green-500', 'D': 'bg-teal-500', 'D#': 'bg-cyan-500', 'E': 'bg-blue-500', 'F': 'bg-indigo-500', 'F#': 'bg-purple-500', 'G': 'bg-fuchsia-500', 'G#': 'bg-pink-500', };
export const UNIQUE_NOTE_TEXT_COLORS: Record<NoteValue, string> = { 'A': 'text-white', 'A#': 'text-white', 'B': 'text-black', 'C': 'text-black', 'C#': 'text-white', 'D': 'text-white', 'D#': 'text-white', 'E': 'text-white', 'F': 'text-white', 'F#': 'text-white', 'G': 'text-white', 'G#': 'text-white', };
export const COMMON_NOTE_TEXT_STYLE = 'font-semibold text-xs';
export const SELECTED_FRET_CELL_BG = 'bg-yellow-200 dark:bg-yellow-300';

// Interval names for display on fretboard
export const INTERVAL_NAMES: Record<number, string> = {
  0: "1", 1: "♭2", 2: "2", 3: "♭3", 4: "3", 5: "4", 6: "♯4/♭5", 7: "5", 8: "♯5/♭6", 9: "6", 10: "♭7", 11: "7"
};
// Specific interval names based on scale formula
export const getIntervalNameFromFormula = (semitone: number, scaleDef: ScaleDefinition): string | null => {
  if (!scaleDef.intervals || !scaleDef.formula) return null;
  const indexInIntervals = scaleDef.intervals.indexOf(semitone);
  if (indexInIntervals === -1) return null;
  const formulaParts = scaleDef.formula.split(' ');
  return formulaParts[indexInIntervals] || null;
};
