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
const APP_CHORD_DEFINED_NAMES: Set<string> = new Set(Object.values(APP_CHORDS).map(def => def.name));
const NOTES_SORTED_BY_LENGTH_DESC: readonly NoteValue[] = [...NOTES].sort((a, b) => b.length - a.length);

export const isAppDefinedChordSymbol = (chordSymbol: string): boolean => {
    for (const note of NOTES_SORTED_BY_LENGTH_DESC) {
        if (chordSymbol.startsWith(note)) {
            const suffix = chordSymbol.substring(note.length);
            if (APP_CHORD_DEFINED_NAMES.has(suffix)) {
                return true;
            }
            return false;
        }
    }
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
  // Construct a canonical representation for Tonal to get notes, if possible,
  // or use intervals if Tonal cannot parse the appChordData.name directly as a suffix.
  // Tonal typically expects common suffixes like "m", "maj7", "7", etc.
  const tonalChordSymbol = `${root}${appChordData.name}`;
  const chordObject = Chord.get(tonalChordSymbol);

  let notesToMap: string[] = [];

  // If Tonal successfully parsed our Root+Name combo and gave notes:
  if (!chordObject.empty && chordObject.notes && chordObject.notes.length > 0) {
    notesToMap = chordObject.notes;
  } 
  // Fallback: If Tonal didn't parse it (e.g. complex app-specific name), use defined intervals.
  // This path is crucial if APP_CHORDS.name contains suffices Tonal doesn't recognize directly.
  else if (appChordData.intervals && appChordData.intervals.length > 0) {
      notesToMap = appChordData.intervals.map(semitones => {
          const intervalName = Interval.fromSemitones(semitones);
          return Note.transpose(root, intervalName);
      });
  } else {
      return []; // No way to determine notes
  }

  const mappedNotes = notesToMap
    .map(n => mapToAppNote(n)) // Convert to App's NoteValue format (e.g. A# not Bb)
    .filter((n): n is NoteValue => n !== null);
  
  // Return unique notes, sorted according to the NOTES constant order.
  return [...new Set(mappedNotes)].sort((a, b) => NOTES.indexOf(a) - NOTES.indexOf(b));
};

export const findMatchingChordsVoicing = (pickedNotesDetails: PickData[]): IdentifiedChord[] => {
    if (!pickedNotesDetails || pickedNotesDetails.length < 2) return [];

    const uniquePickedNoteValues = [...new Set(pickedNotesDetails.map(p => p.note))];
    // Sort the unique picked notes according to the NOTES constant for consistent comparisons.
    const sortedUniquePickedPitchClasses = NOTES.filter(n => uniquePickedNoteValues.includes(n));

    if (sortedUniquePickedPitchClasses.length < 2) return [];

    const identifiedChords: IdentifiedChord[] = [];

    // Iterate through each unique picked note, treating it as a potential root.
    for (const potentialRoot of sortedUniquePickedPitchClasses) {
        // Iterate through all defined chords in APP_CHORDS.
        for (const [appChordKey, appChordDefinition] of Object.entries(APP_CHORDS as Record<string, ChordDefinition>)) {
            // Get the theoretical notes for this appChordDefinition if its root were 'potentialRoot'.
            // getNotesForChord returns sorted, unique pitch classes.
            const theoreticalChordNotes = getNotesForChord(potentialRoot, appChordKey);

            // Check if the set of theoretical notes exactly matches the set of unique picked notes.
            // Both arrays are sorted according to NOTES constant.
            if (theoreticalChordNotes.length === sortedUniquePickedPitchClasses.length &&
                theoreticalChordNotes.every((note, index) => note === sortedUniquePickedPitchClasses[index])) {
                
                identifiedChords.push({
                    name: `${potentialRoot}${appChordDefinition.name}`,
                    quality: appChordDefinition.quality,
                    key: appChordKey,
                    root: potentialRoot
                });
            }
        }
    }

    // Deduplicate results by chord name. This handles cases where different APP_CHORD entries
    // might coincidentally produce the same set of notes for a given root (e.g. add2 vs add9).
    // It also ensures that if multiple roots could form the *same named chord* (less likely), only one is listed.
    const uniqueByName = new Map<string, IdentifiedChord>();
    identifiedChords.forEach(chord => {
        if (!uniqueByName.has(chord.name)) {
            uniqueByName.set(chord.name, chord);
        }
    });

    return Array.from(uniqueByName.values()).sort((a,b) => a.name.localeCompare(b.name));
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

            const tonalDetectedSymbols = detectChordsWithTonal(potentialPitchClassesArray);
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
            
            const allPossibleSymbols = [...new Set([...appSpecificSymbols, ...tonalDetectedSymbols])];
            
            const newlyPossibleChords = allPossibleSymbols
                .filter(chordSymbol => !identifiedChordsSet.has(chordSymbol)) 
                .filter(isAppDefinedChordSymbol) 
                .sort();

            if (newlyPossibleChords.length > 0) {
                potentialSuggestionsOutput.push({ noteToAdd, resultingChords: newlyPossibleChords });
            }
        }
    }
    return potentialSuggestionsOutput.sort((a, b) => NOTES.indexOf(a.noteToAdd) - NOTES.indexOf(b.noteToAdd));
};
