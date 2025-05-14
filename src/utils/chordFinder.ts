import { Note, Midi, Chord, Scale, Interval } from 'tonal';
import { NoteValue, PickData, IdentifiedChord, ChordDefinition } from '../types';
import { NOTES, CHORDS as APP_CHORDS } from '../constants';

// These constants are locally defined in this file, matching those in constants.ts
// They are used by getNoteDetailsAtFret, which is not part of this change but included for completeness.
const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'] as const;
const TUNING_MIDI_BASE: { readonly [key: number]: number } = {
    0: 64, 1: 59, 2: 55, 3: 50, 4: 45, 5: 40,
};

// Helper constants for the new filtering logic in findPotentialChordsUpdated
// Set of all chord name suffixes (e.g., "M", "m7", "dim") from APP_CHORDS
const APP_CHORD_DEFINED_NAMES: Set<string> = new Set(Object.values(APP_CHORDS).map(def => def.name));
// NOTES sorted by length descending, to correctly parse roots like "A#" before "A"
const NOTES_SORTED_BY_LENGTH_DESC: readonly NoteValue[] = [...NOTES].sort((a, b) => b.length - a.length);

// Helper function to check if a chord symbol string (e.g., "CM", "Am7")
// corresponds to a chord definition in APP_CHORDS.
export const isAppDefinedChordSymbol = (chordSymbol: string): boolean => {
    for (const note of NOTES_SORTED_BY_LENGTH_DESC) {
        if (chordSymbol.startsWith(note)) {
            const suffix = chordSymbol.substring(note.length);
            // If the extracted suffix (e.g., "M" from "CM", "m7" from "Am7")
            // is one of the 'name' properties in APP_CHORDS, it's a valid app-defined chord.
            if (APP_CHORD_DEFINED_NAMES.has(suffix)) {
                return true;
            }
            // If a root note is matched but the suffix isn't in APP_CHORD_DEFINED_NAMES,
            // then this specific parsing (e.g. "A#" as root of "A#blah") means it's not an app chord.
            // We can stop checking for this root and related suffix.
            return false;
        }
    }
    // No root note part of the symbol matched any known note.
    return false;
};


const mapToAppNote = (noteName: string): NoteValue | null => {
    let pc = Note.pitchClass(noteName); 
    if (NOTES.includes(pc as NoteValue)) return pc as NoteValue;
    const sharpEquivalent = Note.enharmonic(pc); 
    if (NOTES.includes(sharpEquivalent as NoteValue)) return sharpEquivalent as NoteValue;
    const simplifiedPc = Note.simplify(pc);
    if (NOTES.includes(simplifiedPc as NoteValue)) return simplifiedPc as NoteValue;
    const simplifiedEnharmonic = Note.simplify(sharpEquivalent);
     if (NOTES.includes(simplifiedEnharmonic as NoteValue)) return simplifiedEnharmonic as NoteValue;
    return null;
}

export const getNoteDetailsAtFret = (stringIndex: number, fret: number): { note: NoteValue; absolutePitch: number } | null => {
    if (stringIndex < 0 || stringIndex >= STANDARD_TUNING.length) return null;
    const baseMidiPitch = TUNING_MIDI_BASE[stringIndex];
    if (baseMidiPitch === undefined) return null;
    const absolutePitch = baseMidiPitch + fret;
    const tonalNoteWithOptionalOctave = Midi.midiToNoteName(absolutePitch, { sharps: true }); 
    const appNote = mapToAppNote(tonalNoteWithOptionalOctave);
    if (appNote) return { note: appNote, absolutePitch };
    return null;
};

export const getNotesForScale = (root: NoteValue, scaleTypeName: string): NoteValue[] => {
  const tonalScale = Scale.get(`${root} ${scaleTypeName}`);
  if (tonalScale.empty) return [];
  return tonalScale.notes
    .map(n => mapToAppNote(n))
    .filter((n): n is NoteValue => n !== null)
    .sort((a, b) => NOTES.indexOf(a) - NOTES.indexOf(b));
};

export const getNotesForChord = (root: NoteValue, appChordKey: string): NoteValue[] => {
  const appChordData = APP_CHORDS[appChordKey as keyof typeof APP_CHORDS];
  if (!appChordData) {
    return [];
  }
  const tonalChordSymbol = `${root}${appChordData.name}`;
  const chordObject = Chord.get(tonalChordSymbol);
  let notesToMap: string[] = [];
  if (!chordObject.empty && chordObject.notes && chordObject.notes.length > 0) {
    notesToMap = chordObject.notes;
  } else {
    if (appChordData.intervals && appChordData.intervals.length > 0) {
        notesToMap = appChordData.intervals.map(semitones => {
            const intervalName = Interval.fromSemitones(semitones);
            return Note.transpose(root, intervalName);
        });
    } else {
        return [];
    }
  }
  const mappedNotes = notesToMap
    .map(n => mapToAppNote(n))
    .filter((n): n is NoteValue => n !== null); 
  return mappedNotes.sort((a, b) => NOTES.indexOf(a) - NOTES.indexOf(b));
};

export const findMatchingChordsVoicing = (pickedNotesDetails: PickData[]): IdentifiedChord[] => {
    if (!pickedNotesDetails || pickedNotesDetails.length < 2) return [];
    const identifiedChords: IdentifiedChord[] = [];
    const uniquePickedNoteNames = [...new Set(pickedNotesDetails.map(p => p.note))];
    for (const potentialRootName of uniquePickedNoteNames) {
        const rootPicks = pickedNotesDetails.filter(p => p.note === potentialRootName);
        if (rootPicks.length === 0) continue; 
        const lowestRootPick = rootPicks.sort((a, b) => a.absolutePitch - b.absolutePitch)[0];
        const lowestRootPitch = lowestRootPick.absolutePitch;
        const uniquePicksForIntervalCalculationMap = new Map<NoteValue, PickData>();
        pickedNotesDetails.forEach(pick => {
            if (!uniquePicksForIntervalCalculationMap.has(pick.note) || pick.absolutePitch < uniquePicksForIntervalCalculationMap.get(pick.note)!.absolutePitch) {
                uniquePicksForIntervalCalculationMap.set(pick.note, pick);
            }
        });
        const uniquePicksArray = Array.from(uniquePicksForIntervalCalculationMap.values());
        const actualIntervals = uniquePicksArray
            .map(pick => pick.absolutePitch - lowestRootPitch)
            .sort((a, b) => a - b);
        for (const [appChordKey, appChordData] of Object.entries(APP_CHORDS as Record<string, ChordDefinition>)) {
            const definedIntervals = [...appChordData.intervals].sort((a, b) => a - b);
            if (actualIntervals.length === definedIntervals.length &&
                actualIntervals.every((interval, index) => interval === definedIntervals[index])) {
                identifiedChords.push({
                    name: `${potentialRootName}${appChordData.name}`, 
                    quality: appChordData.quality,
                    key: appChordKey,
                    root: potentialRootName
                });
            }
        }
    }
    const uniqueChordStrings = new Set(identifiedChords.map(c => JSON.stringify(c)));
    return Array.from(uniqueChordStrings).map(s => JSON.parse(s)).sort((a,b) => a.name.localeCompare(b.name));
};

export const detectChordsWithTonal = (uniqueNotes: NoteValue[]): string[] => {
    if (!uniqueNotes || uniqueNotes.length < 2) return [];
    return Chord.detect(uniqueNotes).sort();
};

export const findPotentialChordsUpdated = (
    currentUniqueNotes: readonly NoteValue[],
    identifiedChordsSet: Set<string> 
): { noteToAdd: NoteValue; resultingChords: string[] }[] => {
    if (currentUniqueNotes.length === 0) return []; 
    
    const potentialSuggestionsOutput: { noteToAdd: NoteValue; resultingChords: string[] }[] = [];
    const currentNotesSet = new Set(currentUniqueNotes);

    for (const noteToAdd of NOTES) {
        if (!currentNotesSet.has(noteToAdd)) {
            const potentialPitchClassesArray: NoteValue[] = [...currentUniqueNotes, noteToAdd];
            const potentialPitchClassesSet = new Set(potentialPitchClassesArray);

            // 1. Get Tonal detected symbols
            const tonalDetectedSymbols = detectChordsWithTonal(potentialPitchClassesArray);

            // 2. Get app-specific chord symbols
            // These are chords from APP_CHORDS that can be formed by the (current notes + noteToAdd)
            const appSpecificSymbols: string[] = [];
            for (const potentialRoot of potentialPitchClassesArray) {
                for (const [appChordKey, appChordData] of Object.entries(APP_CHORDS as Record<string, ChordDefinition>)) {
                    const appChordNotes = getNotesForChord(potentialRoot, appChordKey);
                    const appChordNotesSet = new Set(appChordNotes);

                    if (appChordNotesSet.size === potentialPitchClassesSet.size &&
                        [...appChordNotesSet].every(pc => potentialPitchClassesSet.has(pc))) {
                        appSpecificSymbols.push(`${potentialRoot}${appChordData.name}`);
                    }
                }
            }
            
            // Combine all detected symbols (app-specific and Tonal), then deduplicate
            const allPossibleSymbols = [...new Set([...appSpecificSymbols, ...tonalDetectedSymbols])];
            
            // Filter out chords already identified for the current selection (without noteToAdd)
            // AND filter to only include chords that are defined in APP_CHORDS
            const newlyPossibleChords = allPossibleSymbols
                .filter(chordSymbol => !identifiedChordsSet.has(chordSymbol)) 
                .filter(isAppDefinedChordSymbol) // Apply the new filter here
                .sort();

            if (newlyPossibleChords.length > 0) {
                potentialSuggestionsOutput.push({ noteToAdd, resultingChords: newlyPossibleChords });
            }
        }
    }
    // Sort suggestions by the noteToAdd, based on NOTES constant order
    return potentialSuggestionsOutput.sort((a, b) => NOTES.indexOf(a.noteToAdd) - NOTES.indexOf(b.noteToAdd));
};
