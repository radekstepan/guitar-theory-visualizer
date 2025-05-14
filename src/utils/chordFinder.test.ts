import {
  getNoteDetailsAtFret,
  getNotesForScale,
  getNotesForChord,
  findMatchingChordsVoicing,
  detectChordsWithTonal,
  findPotentialChordsUpdated,
  isAppDefinedChordSymbol 
} from './chordFinder';
import { NoteValue, PickData } from '../types';
import { NOTES, CHORDS as APP_CHORDS } from '../constants';

const APP_SCALES_TONAL_MAP = {
  major: 'major',
  minorNatural: 'minor', 
  pentatonicMinor: 'minor pentatonic',
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
        const result = getNotesForChord('A', 'add2');
        const expected: NoteValue[] = ['A', 'B', 'C#', 'E'];
        expect(result).toEqual(expected);
    });
    it('should return correct notes for A m(add2) chord (appKey: minorAdd2), sorted', () => {
        const result = getNotesForChord('A', 'minorAdd2');
        const expected: NoteValue[] = ['A', 'B', 'C', 'E'];
        expect(result).toEqual(expected);
    });
    //  it('should return correct notes for AmM7 chord (appKey: minorMajor7), sorted', () => {
    //     const result = getNotesForChord('A', 'minorMajor7');
    //     const expected: NoteValue[] = ['A', 'C', 'E', 'G#'];
    //     expect(result).toEqual(expected);
    // });
  });


  describe('findMatchingChordsVoicing (using APP_CHORDS)', () => {
    const CmajPicks: PickData[] = [ 
      { stringIndex: 4, fretIndex: 3, note: 'C', absolutePitch: 48 }, 
      { stringIndex: 3, fretIndex: 2, note: 'E', absolutePitch: 52 }, 
      { stringIndex: 2, fretIndex: 0, note: 'G', absolutePitch: 55 }, 
    ];
    const AminPicks: PickData[] = [ 
      { stringIndex: 4, fretIndex: 0, note: 'A', absolutePitch: 45 }, 
      { stringIndex: 4, fretIndex: 3, note: 'C', absolutePitch: 48 }, 
      { stringIndex: 3, fretIndex: 2, note: 'E', absolutePitch: 52 }, 
    ];
     const G7Picks_CorrectIntervals: PickData[] = [ 
      { stringIndex: 5, fretIndex: 3, note: 'G', absolutePitch: 43 }, 
      { stringIndex: 4, fretIndex: 2, note: 'B', absolutePitch: 47 }, 
      { stringIndex: 3, fretIndex: 0, note: 'D', absolutePitch: 50 }, 
      { stringIndex: 3, fretIndex: 3, note: 'F', absolutePitch: 53 }, 
    ];

    it('should identify a C Major chord (appKey: major)', () => {
      const result = findMatchingChordsVoicing(CmajPicks);
      expect(result).toEqual([
        { name: 'CM', quality: APP_CHORDS.major.quality, key: 'major', root: 'C' },
      ]);
    });

    it('should identify an A Minor chord (appKey: minor)', () => {
      const result = findMatchingChordsVoicing(AminPicks);
      expect(result).toEqual([
        { name: 'Am', quality: APP_CHORDS.minor.quality, key: 'minor', root: 'A' },
      ]);
    });
    
    it('should identify a G Dominant 7 chord (appKey: dominant7)', () => {
      const result = findMatchingChordsVoicing(G7Picks_CorrectIntervals);
      expect(result).toEqual([
        { name: 'G7', quality: APP_CHORDS.dominant7.quality, key: 'dominant7', root: 'G' },
      ]);
    });

    it('should identify Aadd2 from [A2, C#3, E3, B2]', () => {
        const Aadd2Picks: PickData[] = [
            { stringIndex: 5, fretIndex: 5, note: 'A', absolutePitch: 45 },   
            { stringIndex: 5, fretIndex: 9, note: 'C#', absolutePitch: 49 }, 
            { stringIndex: 4, fretIndex: 7, note: 'E', absolutePitch: 52 },   
            { stringIndex: 5, fretIndex: 7, note: 'B', absolutePitch: 47 },   
        ];
        const result = findMatchingChordsVoicing(Aadd2Picks);
        expect(result).toEqual([
            { name: 'Aadd2', quality: APP_CHORDS.add2.quality, key: 'add2', root: 'A'}
        ]);
    });

    it('should identify Am(add2) from [A2, C3, E3, B2]', () => {
        const AmAdd2Picks: PickData[] = [
            { stringIndex: 5, fretIndex: 5, note: 'A', absolutePitch: 45 }, 
            { stringIndex: 5, fretIndex: 8, note: 'C', absolutePitch: 48 }, 
            { stringIndex: 4, fretIndex: 7, note: 'E', absolutePitch: 52 }, 
            { stringIndex: 5, fretIndex: 7, note: 'B', absolutePitch: 47 }, 
        ];
        const result = findMatchingChordsVoicing(AmAdd2Picks);
        expect(result).toEqual([
            { name: 'Am(add2)', quality: APP_CHORDS.minorAdd2.quality, key: 'minorAdd2', root: 'A' }
        ]);
    });


    it('should NOT identify slash chords if the app definition does not match the bass note as root', () => {
      const CmajOverEPicks: PickData[] = [ 
        { stringIndex: 5, fretIndex: 0, note: 'E', absolutePitch: 40 }, 
        { stringIndex: 4, fretIndex: 3, note: 'C', absolutePitch: 48 }, 
        { stringIndex: 2, fretIndex: 0, note: 'G', absolutePitch: 55 }, 
      ];
      const resultInversion = findMatchingChordsVoicing(CmajOverEPicks);
      expect(resultInversion).toEqual([]);
    });


    it('should return empty array for less than 2 picked notes', () => {
      const singlePick: PickData[] = [{ stringIndex: 0, fretIndex: 0, note: 'E', absolutePitch: 64 }];
      expect(findMatchingChordsVoicing(singlePick)).toEqual([]);
      expect(findMatchingChordsVoicing([])).toEqual([]);
    });

    it('should return empty array if no matching (root-in-bass) chord is found', () => {
      const nonChordPicks: PickData[] = [ 
        { stringIndex: 0, fretIndex: 0, note: 'E', absolutePitch: 64 },
        { stringIndex: 0, fretIndex: 1, note: 'F', absolutePitch: 65 },
      ];
      expect(findMatchingChordsVoicing(nonChordPicks)).toEqual([]);
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
    
    // it('should identify G Dominant 7 from [G, B, D, A# (for Bb)] -> includes "G7"', () => {
    //     // This test assumes Tonal will find G7. If the test env consistently differs, this might need adjustment.
    //     expect(detectChordsWithTonal(['G', 'B', 'D', 'A#'])).toEqual(expect.arrayContaining(['G7']));
    //   });

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
      // For notes [C, E, G], APP_CHORDS has "CM". Tonal also detects "CM".
      // The filter isAppDefinedChordSymbol("CM") is true.
      expect(addGSuggestion?.resultingChords.sort()).toEqual(['CM'].sort());
    });

    it('should suggest B for current notes [A, C#, E] to make "Aadd2" (app) and include Tonal results like "Aadd9"', () => {
        const currentPicksData: PickData[] = [ 
            { stringIndex: 0, fretIndex: 0, note: 'A', absolutePitch: 45 },
            { stringIndex: 0, fretIndex: 0, note: 'C#', absolutePitch: 49 },
            { stringIndex: 0, fretIndex: 0, note: 'E', absolutePitch: 52 },
        ];
        const identifiedVoicings = findMatchingChordsVoicing(currentPicksData); // "AM"
        const identifiedSet = new Set(identifiedVoicings.map(c => c.name)); 

        const suggestions = findPotentialChordsUpdated(['A', 'C#', 'E'], identifiedSet);
        const addBSuggestion = suggestions.find(s => s.noteToAdd === 'B');
        
        // With notes [A, B, C#, E]:
        // App-specific chords: Aadd2 (from APP_CHORDS 'add2'), Aadd9 (from APP_CHORDS 'add9')
        // Tonal detected: "Aadd9", "C#m7#5/A"
        // Combined unique: "Aadd2", "Aadd9", "C#m7#5/A"
        // Filtered by isAppDefinedChordSymbol:
        // - "Aadd2" (suffix "add2" is known) -> Keep
        // - "Aadd9" (suffix "add9" is known) -> Keep
        // - "C#m7#5/A" (suffix "m7#5/A" or "m7#5" is not known) -> Remove
        // Expected: ["Aadd2", "Aadd9"]
        expect(addBSuggestion).toBeDefined();
        expect(addBSuggestion?.resultingChords.sort()).toEqual(['Aadd2', 'Aadd9'].sort());
    });


    it('should not suggest notes already in currentUniqueNotes', () => {
      const suggestions = findPotentialChordsUpdated(['C', 'E'], new Set());
      expect(suggestions.find(s => s.noteToAdd === 'C')).toBeUndefined();
      expect(suggestions.find(s => s.noteToAdd === 'E')).toBeUndefined();
    });

    it('should filter out chords already in identifiedChordsSet', () => {
      const currentNotes: NoteValue[] = ['A', 'C', 'E']; 
      const currentPicksData: PickData[] = [
          {note: 'A', absolutePitch: 45, stringIndex: 0, fretIndex:0},
          {note: 'C', absolutePitch: 48, stringIndex: 0, fretIndex:0},
          {note: 'E', absolutePitch: 52, stringIndex: 0, fretIndex:0},
      ];
      const identifiedVoicings = findMatchingChordsVoicing(currentPicksData); 
      const alreadyIdentifiedVoicingNames = new Set(identifiedVoicings.map(c => c.name)); // {"Am"}
      
      const suggestions = findPotentialChordsUpdated(currentNotes, alreadyIdentifiedVoicingNames);
      const addGSuggestion = suggestions.find(s => s.noteToAdd === 'G');
      
      // For notes [A, C, E, G]:
      // App-specific: Am7 (from APP_CHORDS 'minor7'), C6 (from APP_CHORDS 'major6')
      // Tonal detected: "Am7", "C6/A"
      // Combined unique: "Am7", "C6", "C6/A"
      // Filtered by identifiedChordsSet ("Am"): no change to this list
      // Filtered by isAppDefinedChordSymbol:
      // - "Am7" (suffix "m7" is known) -> Keep
      // - "C6" (suffix "6" is known) -> Keep
      // - "C6/A" (suffix "6/A" is not known) -> Remove
      // Expected: ["Am7", "C6"]
      expect(addGSuggestion).toBeDefined();
      expect(addGSuggestion?.resultingChords.sort()).toEqual(['Am7', 'C6'].sort());
    });

    it('should sort the list of suggestions by noteToAdd (based on NOTES order)', () => {
      const baseNotes: NoteValue[] = ['C','E'];
      const suggestions = findPotentialChordsUpdated(baseNotes, new Set());
      const noteOrder = suggestions.map(s => s.noteToAdd);
      
      // This part of the test is to ensure the primary sort order of suggestions is by note.
      // The exact content of `expectedOrder` might change if `isAppDefinedChordSymbol` changes,
      // but the core check is that `noteOrder` is sorted according to `NOTES`.
      const expectedOrderSortedByNotes = NOTES.filter((n_val): n_val is NoteValue => !baseNotes.includes(n_val))
                                  .filter(n_val => { 
                                      // Check if adding this note can form any *app-defined* chord
                                      const combined: NoteValue[] = [...baseNotes, n_val];
                                      
                                      // Check Tonal detection first
                                      const tonalChords = detectChordsWithTonal(combined)
                                                          .filter(isAppDefinedChordSymbol); // Apply app filter
                                      if (tonalChords.length > 0) return true;

                                      // Check app-specific definitions
                                      for(const root_val of combined) { 
                                          for(const key in APP_CHORDS) {
                                              const appNotes = new Set(getNotesForChord(root_val, key));
                                              if(appNotes.size === combined.length && combined.every((cn_val: NoteValue) => appNotes.has(cn_val))) {
                                                  // Formed an app chord. Check if its symbol is app-defined (it should be by construction)
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
