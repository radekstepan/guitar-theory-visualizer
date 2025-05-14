import {
  getNoteDetailsAtFret,
  getNotesForScale,
  getNotesForChord,
  findMatchingChordsVoicing,
  detectChordsWithTonal,
  findPotentialChordsUpdated,
  isAppDefinedChordSymbol // Imported here
} from './chordFinder';
import { NoteValue, PickData, IdentifiedChord } from '../types';
import { NOTES, CHORDS as APP_CHORDS } from '../constants';

const APP_SCALES_TONAL_MAP = {
  major: 'major',
  minorNatural: 'minor', 
  pentatonicMinor: 'minor pentatonic',
};

// Helper to create PickData array from note names, with dummy pitch/string/fret values
// The new findMatchingChordsVoicing only cares about the unique note names.
const createPicks = (notes: NoteValue[]): PickData[] => {
    return notes.map((note, index) => ({
        note,
        absolutePitch: 40 + index, // Dummy value
        stringIndex: 0, // Dummy value
        fretIndex: index // Dummy value
    }));
};


describe('chordFinder utilities (Tonal version)', () => {
  describe('getNoteDetailsAtFret', () => {
    it('should return correct note and absolute pitch for standard tuning open strings', () => {
      expect(getNoteDetailsAtFret(0, 0)).toEqual({ note: 'E', absolutePitch: 64 }); 
      expect(getNoteDetailsAtFret(1, 0)).toEqual({ note: 'B', absolutePitch: 59 }); 
      expect(getNoteDetailsAtFret(2, 0)).toEqual({ note: 'G', absolutePitch: 55 }); 
      expect(getNoteDetailsAtFret(3, 0)).toEqual({ note: 'D', absolutePitch: 50 }); 
      expect(getNoteDetailsAtFret(4, 0)).toEqual({ note: 'A', absolutePitch: 45 }); 
      expect(getNoteDetailsAtFret(5, 0)).toEqual({ note: 'E', absolutePitch: 40 }); 
    });

    it('should return correct note and absolute pitch for fretted notes', () => {
      expect(getNoteDetailsAtFret(5, 5)).toEqual({ note: 'A', absolutePitch: 45 }); 
      expect(getNoteDetailsAtFret(0, 1)).toEqual({ note: 'F', absolutePitch: 65 }); 
      expect(getNoteDetailsAtFret(4, 2)).toEqual({ note: 'B', absolutePitch: 47 }); 
      expect(getNoteDetailsAtFret(2, 3)).toEqual({ note: 'A#', absolutePitch: 58 });
    });

    it('should handle enharmonics and map to NOTES (sharps)', () => {
        expect(getNoteDetailsAtFret(2,6)).toEqual({ note: 'C#', absolutePitch: 61 }); 
        expect(getNoteDetailsAtFret(3,4)).toEqual({ note: 'F#', absolutePitch: 54 });
    });


    it('should handle note wrapping correctly', () => {
      expect(getNoteDetailsAtFret(2, 4)).toEqual({ note: 'B', absolutePitch: 59 });
      expect(getNoteDetailsAtFret(2, 5)).toEqual({ note: 'C', absolutePitch: 60 });
    });

    it('should return null for invalid string index', () => {
      expect(getNoteDetailsAtFret(6, 0)).toBeNull();
      expect(getNoteDetailsAtFret(-1, 0)).toBeNull();
    });
  });

  describe('getNotesForScale', () => {
    it('should return correct notes for C Major scale, sorted by NOTES constant', () => {
      const result = getNotesForScale('C', APP_SCALES_TONAL_MAP.major);
      const expected: NoteValue[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      expect(result).toEqual(expected);
    });

    it('should return correct notes for A Natural Minor scale, sorted by NOTES constant', () => {
      const result = getNotesForScale('A', APP_SCALES_TONAL_MAP.minorNatural);
      const expected: NoteValue[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      expect(result).toEqual(expected);
    });

    it('should return correct notes for G Pentatonic Minor scale, sorted by NOTES constant', () => {
      const result = getNotesForScale('G', APP_SCALES_TONAL_MAP.pentatonicMinor);
      const expected: NoteValue[] = ['A#', 'C', 'D', 'F', 'G'];
      expect(result).toEqual(expected);
    });

    it('should return empty array for an invalid root note', () => {
      // @ts-expect-error Testing invalid input
      expect(getNotesForScale('Z', APP_SCALES_TONAL_MAP.major)).toEqual([]);
    });
  });

  describe('getNotesForChord', () => {
    it('should return correct notes for C Major chord (appKey: major), sorted', () => {
        const result = getNotesForChord('C', 'major');
        const expected: NoteValue[] = ['C', 'E', 'G'];
        expect(result).toEqual(expected);
    });
    it('should return correct notes for A Minor 7 chord (appKey: minor7), sorted', () => {
        const result = getNotesForChord('A', 'minor7');
        const expected: NoteValue[] = ['A', 'C', 'E', 'G'];
        expect(result).toEqual(expected);
    });
    it('should return correct notes for A add2 chord (appKey: add2), sorted', () => {
        const result = getNotesForChord('A', 'add2'); // A, B, C#, E
        const expected: NoteValue[] = ['A', 'B', 'C#', 'E'];
        expect(result).toEqual(expected);
    });
     it('should return correct notes for A add9 chord (appKey: add9), sorted, which are same pitch classes as add2', () => {
        const result = getNotesForChord('A', 'add9'); // A, B, C#, E
        const expected: NoteValue[] = ['A', 'B', 'C#', 'E'];
        expect(result).toEqual(expected);
    });
    it('should return correct notes for A m(add2) chord (appKey: minorAdd2), sorted', () => {
        const result = getNotesForChord('A', 'minorAdd2');
        const expected: NoteValue[] = ['A', 'B', 'C', 'E'];
        expect(result).toEqual(expected);
    });
  });


  describe('findMatchingChordsVoicing (using APP_CHORDS)', () => {
    // Original tests might need slight adjustment if multiple roots can form the same set of notes
    // and the old logic was dependent on bass note. The new logic is set-based.

    it('should identify a C Major chord (CM) from [C, E, G]', () => {
      const result = findMatchingChordsVoicing(createPicks(['C', 'E', 'G']));
      expect(result).toEqual([
        { name: 'CM', quality: APP_CHORDS.major.quality, key: 'major', root: 'C' as NoteValue },
      ]);
    });
    
    it('should identify an A Minor chord (Am) from [A, C, E]', () => {
      const result = findMatchingChordsVoicing(createPicks(['A', 'C', 'E']));
      expect(result).toEqual([
        { name: 'Am', quality: APP_CHORDS.minor.quality, key: 'minor', root: 'A' as NoteValue },
      ]);
    });

    it('should identify Am from [C, E, A] (1st inversion)', () => {
      const result = findMatchingChordsVoicing(createPicks(['C', 'E', 'A']));
      expect(result).toEqual([
        { name: 'Am', quality: APP_CHORDS.minor.quality, key: 'minor', root: 'A' as NoteValue },
      ]);
    });

    it('should identify Am from [E, A, C] (2nd inversion)', () => {
      const result = findMatchingChordsVoicing(createPicks(['E', 'A', 'C']));
      expect(result).toEqual([
        { name: 'Am', quality: APP_CHORDS.minor.quality, key: 'minor', root: 'A' as NoteValue },
      ]);
    });
    
    it('should identify G7 from [G, B, D, F]', () => {
      const result = findMatchingChordsVoicing(createPicks(['G', 'B', 'D', 'F']));
      expect(result).toEqual([
        { name: 'G7', quality: APP_CHORDS.dominant7.quality, key: 'dominant7', root: 'G' as NoteValue },
      ]);
    });

    it('should identify G7 from [F, G, B, D] (inversion)', () => {
      const result = findMatchingChordsVoicing(createPicks(['F', 'G', 'B', 'D']));
      expect(result).toEqual([
        { name: 'G7', quality: APP_CHORDS.dominant7.quality, key: 'dominant7', root: 'G' as NoteValue },
      ]);
    });

    it('should identify Cdim from [C, D#, F#]', () => {
        const result = findMatchingChordsVoicing(createPicks(['C', 'D#', 'F#']));
        expect(result).toEqual([
            { name: 'Cdim', quality: APP_CHORDS.diminished.quality, key: 'diminished', root: 'C' as NoteValue}
        ]);
    });
    
    it('should identify Cdim from [D#, F#, C] (inversion)', () => {
        const result = findMatchingChordsVoicing(createPicks(['D#','F#','C']));
         expect(result).toEqual([
            { name: 'Cdim', quality: APP_CHORDS.diminished.quality, key: 'diminished', root: 'C' as NoteValue}
        ]);
    });

    it('should identify Aadd2 and Aadd9 from [A, B, C#, E]', () => {
        const result = findMatchingChordsVoicing(createPicks(['A', 'B', 'C#', 'E']));
        // Expect both Aadd2 and Aadd9 as they share the same pitch classes and are both in APP_CHORDS
        const expectedResult: IdentifiedChord[] = [
            { name: 'Aadd2', quality: APP_CHORDS.add2.quality, key: 'add2', root: 'A' as NoteValue },
            { name: 'Aadd9', quality: APP_CHORDS.add9.quality, key: 'add9', root: 'A' as NoteValue }
        ].sort((a,b) => a.name.localeCompare(b.name)); // ensure expected order matches function output

        expect(result.length).toBe(2);
        expect(result).toEqual(expect.arrayContaining(expectedResult));
        // To be very precise about the contents and order (after sort):
        expect(result).toEqual(expectedResult); 
    });

    it('should return empty array for less than 2 unique picked notes', () => {
      expect(findMatchingChordsVoicing(createPicks(['E']))).toEqual([]);
      expect(findMatchingChordsVoicing(createPicks([]))).toEqual([]);
      // Test with multiple picks of the same note
      expect(findMatchingChordsVoicing(createPicks(['E', 'E', 'E']))).toEqual([]);
    });

    it('should return empty array if no matching APP_CHORD is found for the set of notes', () => {
      // A, B, C# is not Asus2, Aadd2, or Aadd9 as it's missing E.
      expect(findMatchingChordsVoicing(createPicks(['A', 'B', 'C#']))).toEqual([]);
    });

    it('should identify multiple chords if different roots form APP_CHORDS with the same set of notes (e.g. Am7 and C6 for A,C,E,G)', () => {
        const result = findMatchingChordsVoicing(createPicks(['A', 'C', 'E', 'G']));
        const expected: IdentifiedChord[] = [
            { name: 'Am7', quality: APP_CHORDS.minor7.quality, key: 'minor7', root: 'A' as NoteValue},
            { name: 'C6', quality: APP_CHORDS.major6.quality, key: 'major6', root: 'C' as NoteValue}
        ].sort((a,b) => a.name.localeCompare(b.name)); // Ensure expected is sorted like the function output
        expect(result).toEqual(expected);
    });

  });

  describe('detectChordsWithTonal (Tonal Chord.detect wrapper)', () => {
    it('should identify C Major from [C, E, G] -> includes "CM"', () => {
      expect(detectChordsWithTonal(['C', 'E', 'G'])).toEqual(expect.arrayContaining(['CM']));
    });

    it('should identify A Minor from [A, C, E] -> ["Am"]', () => {
      expect(detectChordsWithTonal(['A', 'C', 'E'])).toEqual(['Am']);
    });
    
    it('should identify G Dominant 7 from [G, B, D, F] -> ["G7"]', () => {
      expect(detectChordsWithTonal(['G', 'B', 'D', 'F'])).toEqual(['G7']);
    });
    
    it('should identify C Major 7 from [C, E, G, B] -> ["Cmaj7"]', () => {
      expect(detectChordsWithTonal(['C', 'E', 'G', 'B'])).toEqual(['Cmaj7']);
    });

    it('should identify chords regardless of input note order, includes "CM" or "CM/X"', () => {
      const result = detectChordsWithTonal(['G', 'E', 'C']);
      expect(result.some(s => s.startsWith('CM'))).toBe(true);
    });
    
    it('should identify C Dominant 9 from [C, E, G, A#, D] (A# is Bb) -> ["C9"]', () => {
        expect(detectChordsWithTonal(['C', 'E', 'G', 'A#', 'D'])).toEqual(['C9']);
    });

    it('should return multiple chords if Tonal detects them (e.g., Am7 and C6/A from A C E G)', () => {
      const notes: NoteValue[] = ['A', 'C', 'E', 'G'];
      const result = detectChordsWithTonal(notes);
      expect(result).toEqual(['Am7', 'C6/A'].sort());
    });

    it('should return empty array for less than 2 unique notes', () => {
      expect(detectChordsWithTonal(['C'])).toEqual([]);
      expect(detectChordsWithTonal([])).toEqual([]);
    });

    it('should return empty array if no matching chord is found by Tonal', () => {
      expect(detectChordsWithTonal(['C', 'C#'])).toEqual([]);
    });
  });

  describe('findPotentialChordsUpdated (using APP_CHORDS for app-specific suggestions)', () => {
    it('should return empty array if currentUniqueNotes is empty', () => {
      expect(findPotentialChordsUpdated([], new Set())).toEqual([]);
    });

    it('should suggest G for current notes [C, E] to make "CM" (app and Tonal)', () => {
      const identifiedChordsSet = new Set<string>();
      const suggestions = findPotentialChordsUpdated(['C', 'E'], identifiedChordsSet);
      const addGSuggestion = suggestions.find(s => s.noteToAdd === 'G');
      expect(addGSuggestion).toBeDefined();
      expect(addGSuggestion?.resultingChords.sort()).toEqual(['CM'].sort());
    });

    it('should suggest B for current notes [A, C#, E] to make "Aadd2" and "Aadd9"', () => {
        const identifiedSet = new Set(['AM']); // Assume AM was already identified from A, C#, E

        const suggestions = findPotentialChordsUpdated(['A', 'C#', 'E'], identifiedSet);
        const addBSuggestion = suggestions.find(s => s.noteToAdd === 'B');
        
        expect(addBSuggestion).toBeDefined();
        // For notes [A, B, C#, E]:
        // App-specific and Tonal can give Aadd2, Aadd9. Both have app-defined suffixes.
        expect(addBSuggestion?.resultingChords.sort()).toEqual(['Aadd2', 'Aadd9'].sort());
    });


    it('should not suggest notes already in currentUniqueNotes', () => {
      const suggestions = findPotentialChordsUpdated(['C', 'E'], new Set());
      expect(suggestions.find(s => s.noteToAdd === 'C')).toBeUndefined();
      expect(suggestions.find(s => s.noteToAdd === 'E')).toBeUndefined();
    });

    it('should filter out chords already in identifiedChordsSet', () => {
      const currentNotes: NoteValue[] = ['A', 'C', 'E']; 
      const alreadyIdentifiedVoicingNames = new Set(['Am']);
      
      const suggestions = findPotentialChordsUpdated(currentNotes, alreadyIdentifiedVoicingNames);
      const addGSuggestion = suggestions.find(s => s.noteToAdd === 'G');
      
      expect(addGSuggestion).toBeDefined();
      // For notes [A, C, E, G], forms Am7 and C6. Neither is in "Am". Both "m7" and "6" are app-defined.
      expect(addGSuggestion?.resultingChords.sort()).toEqual(['Am7', 'C6'].sort());
    });

    it('should sort the list of suggestions by noteToAdd (based on NOTES order)', () => {
      const baseNotes: NoteValue[] = ['C','E'];
      const suggestions = findPotentialChordsUpdated(baseNotes, new Set());
      const noteOrder = suggestions.map(s => s.noteToAdd);
      
      const expectedOrderSortedByNotes = NOTES.filter((n_val): n_val is NoteValue => !baseNotes.includes(n_val))
                                  .filter(n_val => { 
                                      const combined: NoteValue[] = [...baseNotes, n_val];
                                      const tonalChords = detectChordsWithTonal(combined)
                                                          .filter(isAppDefinedChordSymbol); 
                                      if (tonalChords.length > 0) return true;

                                      for(const root_val of combined) { 
                                          for(const key in APP_CHORDS) {
                                              const appNotes = new Set(getNotesForChord(root_val, key));
                                              if(appNotes.size === combined.length && combined.every((cn_val: NoteValue) => appNotes.has(cn_val))) {
                                                  const appChordSymbol = `${root_val}${APP_CHORDS[key].name}`;
                                                  if(isAppDefinedChordSymbol(appChordSymbol)) return true;
                                              }
                                          }
                                      }
                                      return false;
                                  });
      
      expect(noteOrder).toEqual(expectedOrderSortedByNotes);
    });
  });
});
