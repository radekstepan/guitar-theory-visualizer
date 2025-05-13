// We will import NOTES after it's defined with 'as const' to break the circularity
// For now, let's prepare for it.
// Or, the better fix is to define NOTES as 'const' in constants.ts first.

// Forward declaration or a more primitive type initially if needed, but the 'as const' approach is cleaner.
// For now, let's assume constants.ts will export a well-typed NOTES.
import { NOTES as AppNotes } from './constants'; // Use an alias to avoid conflict if necessary, though not strictly needed here

export type NoteValue = typeof AppNotes[number]; // This will work once NOTES in constants.ts is 'as const'

export interface ScaleDefinition {
  name: string;
  intervals: readonly number[]; // Make intervals readonly
}

export interface ChordDefinition {
  name: string;
  intervals: readonly number[]; // Make intervals readonly
  quality: string;
}

// Import SCALES and CHORDS for type derivation if needed, or use Record<string, X>
import { SCALES, CHORDS } from './constants';
export type ScalesData = typeof SCALES;
export type ChordsData = typeof CHORDS;


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
