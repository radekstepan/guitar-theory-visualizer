import { NoteValue, PickData, IdentifiedChord, ChordDefinition } from '../types';
import { NOTES, TUNING_MIDI_BASE, CHORDS } from '../constants';

export const getNoteDetailsAtFret = (stringIndex: number, fret: number): { note: NoteValue; absolutePitch: number } | null => {
    const baseMidi = TUNING_MIDI_BASE[stringIndex];
    if (baseMidi === undefined) return null;

    const absolutePitch = baseMidi + fret;
    const noteIndex = absolutePitch % 12;
    const ourNoteIndex = (noteIndex - 9 + 12) % 12; // Map MIDI C=0 to our A=0
    const note = NOTES[ourNoteIndex];
    if (!note) return null;
    return { note, absolutePitch };
};

export const getNotesInKey = (rootNote: NoteValue, intervals: readonly number[]): NoteValue[] => {
  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) return [];
  const notesInKeySet = new Set<NoteValue>();
   intervals.forEach(interval => {
    const noteIndex = (rootIndex + (interval % 12) + NOTES.length) % NOTES.length;
    notesInKeySet.add(NOTES[noteIndex]);
  });
  return [...notesInKeySet].sort((a, b) => NOTES.indexOf(a) - NOTES.indexOf(b));
};

export const findMatchingChordsVoicing = (pickedNotesDetails: PickData[]): IdentifiedChord[] => {
    if (!pickedNotesDetails || pickedNotesDetails.length < 2) return [];

    const identifiedChords: IdentifiedChord[] = [];
    const uniqueNoteNames = [...new Set(pickedNotesDetails.map(p => p.note))];

    for (const potentialRootName of uniqueNoteNames) {
        const rootPicks = pickedNotesDetails.filter(p => p.note === potentialRootName);
        if (!rootPicks.length) continue;
        const lowestRootPick = rootPicks.sort((a, b) => a.absolutePitch - b.absolutePitch)[0];
        const lowestRootPitch = lowestRootPick.absolutePitch;

        const uniquePicksForIntervals = uniqueNoteNames.map(noteName => {
            return pickedNotesDetails
                .filter(p => p.note === noteName)
                .sort((a, b) => a.absolutePitch - b.absolutePitch)[0];
        });

        const actualIntervals = uniquePicksForIntervals
            .map(pick => pick.absolutePitch - lowestRootPitch)
            .sort((a, b) => a - b);

        for (const [chordKey, chordData] of Object.entries(CHORDS as Record<string, ChordDefinition>)) {
            const definedIntervals = [...chordData.intervals].sort((a, b) => a - b);
            if (actualIntervals.length === definedIntervals.length &&
                actualIntervals.every((interval, index) => interval === definedIntervals[index]))
            {
                identifiedChords.push({
                    name: `${potentialRootName} ${chordData.name}`,
                    quality: chordData.quality,
                    key: chordKey,
                    root: potentialRootName
                });
            }
        }
    }
    return [...new Set(identifiedChords.map(c => JSON.stringify(c)))].map(s => JSON.parse(s)).sort((a,b) => a.name.localeCompare(b.name));
};

export const findMatchingChordsPitchClass = (uniqueNotes: NoteValue[]): string[] => {
    if (!uniqueNotes || uniqueNotes.length < 2) return [];
    const identifiedChords: string[] = [];
    const uniqueNotesSet = new Set(uniqueNotes);

    for (const potentialRoot of uniqueNotes) {
        const relativeIntervals = [...uniqueNotesSet]
            .map(note => (NOTES.indexOf(note) - NOTES.indexOf(potentialRoot) + NOTES.length) % 12)
            .sort((a, b) => a - b);

        for (const [chordKey, chordData] of Object.entries(CHORDS as Record<string, ChordDefinition>)) {
            const chordIntervalsSet = new Set(chordData.intervals.map(i => i % 12));
            const sortedChordIntervals = [...chordIntervalsSet].sort((a, b) => a - b);

            if (relativeIntervals.length === sortedChordIntervals.length &&
                relativeIntervals.every((interval, index) => interval === sortedChordIntervals[index])) {
                identifiedChords.push(`${potentialRoot} ${chordData.name}`);
            }
        }
    }
    return [...new Set(identifiedChords)].sort();
};

export const findPotentialChordsUpdated = (currentUniqueNotes: NoteValue[], identifiedChordsSet: Set<string>): { noteToAdd: NoteValue; resultingChords: string[] }[] => {
    if (currentUniqueNotes.length < 2 && currentUniqueNotes.length === 0) return []; // Allow suggestion for 1 note
    const potentialSuggestions: { noteToAdd: NoteValue; resultingChords: string[] }[] = [];
    const currentNotesSet = new Set(currentUniqueNotes);

    for (const noteToAdd of NOTES) {
        if (!currentNotesSet.has(noteToAdd)) {
            const potentialNoteNames: NoteValue[] = [...currentUniqueNotes, noteToAdd];
            const possibleChords = findMatchingChordsPitchClass(potentialNoteNames);
            const newlyPossibleChords = possibleChords
                .filter(chord => !identifiedChordsSet.has(chord))
                .sort();
            if (newlyPossibleChords.length > 0) {
                potentialSuggestions.push({ noteToAdd, resultingChords: newlyPossibleChords });
            }
        }
    }
    return potentialSuggestions.sort((a, b) => NOTES.indexOf(a.noteToAdd) - NOTES.indexOf(b.noteToAdd));
};
