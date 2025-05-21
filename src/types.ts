// src/types.ts
import { NOTES as AppNotes } from './constants';

export type NoteValue = typeof AppNotes[number];

export interface ScaleDefinition {
  name: string; // Display name, e.g., "Major", "Dorian"
  intervals: readonly number[]; // Semitones from its own root, e.g., Dorian [0, 2, 3, 5, 7, 9, 10]
  // For modes:
  isMode?: boolean;
  formula?: string; // e.g., "1 2 ♭3 4 5 6 ♭7"
  descriptor?: string; // e.g., "Minor-like with natural 6th"
  parentScaleDegree?: number; // 1 for Ionian, 2 for Dorian, etc. (degree of parent major scale)
  parentScaleKey?: string; // Key of the parent scale, e.g., 'ionian'
  commonUsage?: string; // For help section
}

export interface ChordDefinition {
  name: string;
  intervals: readonly number[];
  quality: string;
}

// Import SCALES and CHORDS for type derivation if needed, or use Record<string, X>
// These will be properly typed based on constants.ts definitions
import { SCALES as AppScales, CHORDS as AppChords } from './constants'; // Use alias to avoid conflict if they were named the same
export type ScalesData = typeof AppScales;
export type ChordsData = typeof AppChords;


export interface PickData {
  stringIndex: number;
  fretIndex: number;
  note: NoteValue;
  absolutePitch: number;
}

export interface IdentifiedChord {
  name: string;
  quality: string;
  key: string;
  root: NoteValue;
}

export interface PotentialChordSuggestion {
  noteToAdd: NoteValue;
  resultingChords: string[];
}

export type Mode = 'scale' | 'chord' | 'pick';
export type ColorThemeOption = 'standard' | 'uniqueNotes';
export type ThemeMode = 'light' | 'dark';

// For interval display on fretboard
export type IntervalDisplayType = Record<number, string>; // Maps semitone offset to interval string e.g. {0: "1", 3: "♭3"}
