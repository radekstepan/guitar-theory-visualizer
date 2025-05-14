import { Note, Midi, Chord, ChordType, Scale, Interval } from 'tonal';
import { NoteValue, PickData, IdentifiedChord, ChordDefinition } from '../types';
import { NOTES, CHORDS as APP_CHORDS } from '../constants';

const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'] as const;
const TUNING_MIDI_BASE: { readonly [key: number]: number } = {
    0: 64, 1: 59, 2: 55, 3: 50, 4: 45, 5: 40,
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
    // console.log(`DEBUG: mapToAppNote - FAILED to map input "${noteName}" (derived pc: "${pc}", enh: "${sharpEquivalent}", simplifiedPc: "${simplifiedPc}", simplifiedEnh: "${simplifiedEnharmonic}") to a NoteValue in NOTES.`);
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
    // console.warn(`getNoteDetailsAtFret: Could not map MIDI ${absolutePitch} (Tonal note: ${tonalNoteWithOptionalOctave}) to a note in NOTES const.`);
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

// Removed normalizeTonalSymbol as it might be too aggressive or not needed if we rely on APP_CHORDS for preferred names.

export const findPotentialChordsUpdated = (
    currentUniqueNotes: readonly NoteValue[],
    identifiedChordsSet: Set<string> 
): { noteToAdd: NoteValue; resultingChords: string[] }[] => {
    if (currentUniqueNotes.length === 0) return []; 
    
    const potentialSuggestions: { noteToAdd: NoteValue; resultingChords: string[] }[] = [];
    const currentNotesSet = new Set(currentUniqueNotes);

    for (const noteToAdd of NOTES) {
        if (!currentNotesSet.has(noteToAdd)) {
            const potentialPitchClassesArray: NoteValue[] = [...currentUniqueNotes, noteToAdd];
            const potentialPitchClassesSet = new Set(potentialPitchClassesArray);

            // 1. Get Tonal detected symbols
            const tonalDetectedSymbols = detectChordsWithTonal(potentialPitchClassesArray);

            // 2. Get app-specific chord symbols
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
            
            // Combine all detected symbols (app-specific and Tonal)
            const allPossibleSymbols = [...appSpecificSymbols, ...tonalDetectedSymbols];
            
            // Deduplicate based on the final string symbol
            const uniqueCombinedSymbols = [...new Set(allPossibleSymbols)];
            
            const newlyPossibleChords = uniqueCombinedSymbols
                .filter(chordSymbol => !identifiedChordsSet.has(chordSymbol)) 
                .sort();

            if (newlyPossibleChords.length > 0) {
                potentialSuggestions.push({ noteToAdd, resultingChords: newlyPossibleChords });
            }
        }
    }
    return potentialSuggestions.sort((a, b) => NOTES.indexOf(a.noteToAdd) - NOTES.indexOf(b.noteToAdd));
};
