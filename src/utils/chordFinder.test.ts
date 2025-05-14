import {
  getNoteDetailsAtFret,
  getNotesInKey,
  findMatchingChordsVoicing,
  findMatchingChordsPitchClass,
  findPotentialChordsUpdated,
} from './chordFinder';
import { NoteValue, PickData, IdentifiedChord } from '../types';
import { NOTES, SCALES, CHORDS, STANDARD_TUNING, TUNING_MIDI_BASE } from '../constants';

describe('chordFinder utilities', () => {
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

    it('should handle note wrapping correctly', () => {
      expect(getNoteDetailsAtFret(2, 4)).toEqual({ note: 'B', absolutePitch: 59 });
      expect(getNoteDetailsAtFret(2, 5)).toEqual({ note: 'C', absolutePitch: 60 });
    });

    it('should return null for invalid string index', () => {
      expect(getNoteDetailsAtFret(6, 0)).toBeNull();
      expect(getNoteDetailsAtFret(-1, 0)).toBeNull();
    });
  });

  describe('getNotesInKey', () => {
    it('should return correct notes for C Major scale', () => {
      const result = getNotesInKey('C', SCALES.major.intervals); // C D E F G A B
      const expected: NoteValue[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      expect(result).toEqual(expected); // Function already sorts
    });

    it('should return correct notes for A Natural Minor scale', () => {
      const result = getNotesInKey('A', SCALES.minorNatural.intervals); // A B C D E F G
      const expected: NoteValue[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      expect(result).toEqual(expected);
    });

    it('should return correct notes for G Pentatonic Minor scale', () => {
      // G Pentatonic Minor: G, Bb, C, D, F
      // NOTES: G, A#, C, D, F
      const expected: NoteValue[] = ['A#', 'C', 'D', 'F', 'G']; // Sorted by NOTES index
      const result = getNotesInKey('G', SCALES.pentatonicMinor.intervals);
      expect(result).toEqual(expected);
    });

    it('should handle intervals > 11 by taking modulo 12', () => {
      // Root A, intervals [0, 14]. 14 % 12 = 2. A + 2 semitones = B.
      const result = getNotesInKey('A', [0, 14]);
      expect(result).toEqual(['A', 'B']);
    });
    
    it('should return unique notes even if intervals produce duplicates after mod 12', () => {
        // Root A, intervals [0, 2, 14]. 14 % 12 = 2. Effective intervals [0, 2].
        const result = getNotesInKey('A', [0, 2, 14]);
        expect(result).toEqual(['A', 'B']);
    });

    it('should return an empty array for an invalid root note', () => {
      // @ts-expect-error Testing invalid input
      expect(getNotesInKey('Z', SCALES.major.intervals)).toEqual([]);
    });

    it('should return sorted notes by their index in NOTES constant', () => {
      // F Major: F G A Bb C D E (Bb is A#)
      // Sorted: A, A#, C, D, E, F, G
      const result = getNotesInKey('F', SCALES.major.intervals);
      expect(result).toEqual(['A', 'A#', 'C', 'D', 'E', 'F', 'G']);
    });
  });

  describe('findMatchingChordsVoicing', () => {
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
    const G7Picks: PickData[] = [
      { stringIndex: 2, fretIndex: 0, note: 'G', absolutePitch: 55 },
      { stringIndex: 1, fretIndex: 0, note: 'B', absolutePitch: 59 },
      { stringIndex: 1, fretIndex: 3, note: 'D', absolutePitch: 62 },
      { stringIndex: 0, fretIndex: 1, note: 'F', absolutePitch: 65 },
    ];

    it('should identify a C Major chord', () => {
      const result = findMatchingChordsVoicing(CmajPicks);
      expect(result).toEqual([
        { name: 'C Major', quality: CHORDS.major.quality, key: 'major', root: 'C' },
      ]);
    });

    it('should identify an A Minor chord', () => {
      const result = findMatchingChordsVoicing(AminPicks);
      expect(result).toEqual([
        { name: 'A Minor', quality: CHORDS.minor.quality, key: 'minor', root: 'A' },
      ]);
    });
    
    it('should identify a G Dominant 7 chord', () => {
      const result = findMatchingChordsVoicing(G7Picks);
      expect(result).toEqual([
        { name: 'G 7', quality: CHORDS.dominant7.quality, key: 'dominant7', root: 'G' },
      ]);
    });

    it('should handle voicings where the named root is the lowest of its kind and intervals match', () => {
      const CmajRootInBassHigherNotes: PickData[] = [
        { stringIndex: 4, fretIndex: 3, note: 'C', absolutePitch: 48 }, // C3 (this is the lowest C)
        { stringIndex: 2, fretIndex: 5, note: 'C', absolutePitch: 60 }, // C4
        { stringIndex: 3, fretIndex: 2, note: 'E', absolutePitch: 52 }, // E3
        { stringIndex: 2, fretIndex: 0, note: 'G', absolutePitch: 55 }, // G3
      ];
      const resultStrictRoot = findMatchingChordsVoicing(CmajRootInBassHigherNotes);
      expect(resultStrictRoot).toEqual([
        { name: 'C Major', quality: CHORDS.major.quality, key: 'major', root: 'C' },
      ]);
    });
    
    it('should NOT identify slash chords if the named root isn\'t the true bass of the interval structure', () => {
      const CmajOverEPicks: PickData[] = [
        { stringIndex: 5, fretIndex: 0, note: 'E', absolutePitch: 40 }, // E2
        { stringIndex: 4, fretIndex: 3, note: 'C', absolutePitch: 48 }, // C3
        { stringIndex: 2, fretIndex: 0, note: 'G', absolutePitch: 55 }, // G3
      ];
      const resultInversion = findMatchingChordsVoicing(CmajOverEPicks);
      expect(resultInversion).toEqual([]);
    });


    it('should return empty array for less than 2 picked notes', () => {
      const singlePick: PickData[] = [{ stringIndex: 0, fretIndex: 0, note: 'E', absolutePitch: 64 }];
      expect(findMatchingChordsVoicing(singlePick)).toEqual([]);
      expect(findMatchingChordsVoicing([])).toEqual([]);
    });

    it('should return empty array if no matching chord is found', () => {
      const nonChordPicks: PickData[] = [
        { stringIndex: 0, fretIndex: 0, note: 'E', absolutePitch: 64 },
        { stringIndex: 0, fretIndex: 1, note: 'F', absolutePitch: 65 },
      ];
      expect(findMatchingChordsVoicing(nonChordPicks)).toEqual([]);
    });

    it('should handle C Major 7 chord (C E G B) with specific voicing', () => {
        const Cmaj7Picks: PickData[] = [
            { note: 'C', stringIndex: 4, fretIndex: 3, absolutePitch: 48 },
            { note: 'E', stringIndex: 3, fretIndex: 2, absolutePitch: 52 },
            { note: 'G', stringIndex: 2, fretIndex: 0, absolutePitch: 55 },
            { note: 'B', stringIndex: 1, fretIndex: 0, absolutePitch: 59 },
        ];
        const result = findMatchingChordsVoicing(Cmaj7Picks);
        expect(result).toEqual([
            { name: 'C maj7', quality: CHORDS.major7.quality, key: 'major7', root: 'C' }
        ]);
    });
    
    it('should handle C Dominant 9 chord (C E G A# D) with specific voicing for 9th', () => {
        const Cdom9Picks: PickData[] = [
            { note: 'C', stringIndex: 4, fretIndex: 3, absolutePitch: 48 }, // C
            { note: 'E', stringIndex: 3, fretIndex: 2, absolutePitch: 52 }, // E
            { note: 'G', stringIndex: 2, fretIndex: 0, absolutePitch: 55 }, // G
            { note: 'A#', stringIndex: 2, fretIndex: 3, absolutePitch: 58 },// Bb
            { note: 'D', stringIndex: 1, fretIndex: 3, absolutePitch: 62 }, // D (48+14=62)
        ];
        const result = findMatchingChordsVoicing(Cdom9Picks);
        expect(result).toEqual([
            { name: 'C 9', quality: CHORDS.dominant9.quality, key: 'dominant9', root: 'C' }
        ]);
    });

    it('should identify A m7 from [A, C, E, G] where A is the lowest note', () => {
        const Am7_Picks: PickData[] = [
            { note: 'A', stringIndex: 4, fretIndex: 0, absolutePitch: 45 }, // A2
            { note: 'C', stringIndex: 4, fretIndex: 3, absolutePitch: 48 }, // C3
            { note: 'E', stringIndex: 3, fretIndex: 2, absolutePitch: 52 }, // E3
            { note: 'G', stringIndex: 2, fretIndex: 0, absolutePitch: 55 }, // G3
        ];
        const result = findMatchingChordsVoicing(Am7_Picks);
        expect(result).toEqual([
             { name: 'A m7', quality: CHORDS.minor7.quality, key: 'minor7', root: 'A' }
        ]);
    });
  });

  describe('findMatchingChordsPitchClass', () => {
    it('should identify C Major from [C, E, G]', () => {
      expect(findMatchingChordsPitchClass(['C', 'E', 'G'])).toEqual(['C Major']);
    });

    it('should identify A Minor from [A, C, E]', () => {
      expect(findMatchingChordsPitchClass(['A', 'C', 'E'])).toEqual(['A Minor']);
    });
    
    it('should identify G Dominant 7 from [G, B, D, F]', () => {
      expect(findMatchingChordsPitchClass(['G', 'B', 'D', 'F'])).toEqual(['G 7']);
    });

    it('should identify C Major 7 from [C, E, G, B]', () => {
      expect(findMatchingChordsPitchClass(['C', 'E', 'G', 'B'])).toEqual(['C maj7']);
    });

    it('should identify chords regardless of input note order', () => {
      expect(findMatchingChordsPitchClass(['G', 'E', 'C'])).toEqual(['C Major']);
    });
    
    it('should identify C Dominant 9 from [C, E, G, A#, D] (A# is Bb)', () => {
        expect(findMatchingChordsPitchClass(['C', 'E', 'G', 'A#', 'D'])).toEqual(['C 9']);
    });

    it('should return multiple chords if applicable (e.g., Am7 and C6)', () => {
      const notes: NoteValue[] = ['A', 'C', 'E', 'G']; // Forms A m7 and C 6
      const result = findMatchingChordsPitchClass(notes);
      expect(result).toEqual(['A m7', 'C 6']);
    });

    it('should return empty array for less than 2 unique notes', () => {
      expect(findMatchingChordsPitchClass(['C'])).toEqual([]);
      expect(findMatchingChordsPitchClass([])).toEqual([]);
    });

    it('should return empty array if no matching chord is found', () => {
      expect(findMatchingChordsPitchClass(['C', 'C#'])).toEqual([]);
    });

    it('should handle duplicate input notes by effectively using a Set', () => {
      expect(findMatchingChordsPitchClass(['C', 'E', 'G', 'C'])).toEqual(['C Major']);
    });
    
    it('should find only D# Major for notes [D#, G, A#]', () => {
        const complexNotes: NoteValue[] = ['D#', 'G', 'A#'];
        const result = findMatchingChordsPitchClass(complexNotes);
        expect(result).toEqual(['D# Major']);
    });
  });

  describe('findPotentialChordsUpdated', () => {
    it('should return empty array if currentUniqueNotes is empty', () => {
      expect(findPotentialChordsUpdated([], new Set())).toEqual([]);
    });

    it('should return empty suggestions if currentUniqueNotes has 1 note and no 2-note chords are defined', () => {
      const suggestions = findPotentialChordsUpdated(['C'], new Set());
      expect(suggestions).toEqual([]);
    });

    it('should suggest G for current notes [C, E] to make C Major', () => {
      const identifiedChordsSet = new Set<string>();
      const suggestions = findPotentialChordsUpdated(['C', 'E'], identifiedChordsSet);
      
      const addGSuggestion = suggestions.find(s => s.noteToAdd === 'G');
      expect(addGSuggestion).toBeDefined();
      expect(addGSuggestion?.resultingChords).toEqual(['C Major']);
    });

    it('should not suggest notes already in currentUniqueNotes', () => {
      const suggestions = findPotentialChordsUpdated(['C', 'E'], new Set());
      expect(suggestions.find(s => s.noteToAdd === 'C')).toBeUndefined();
      expect(suggestions.find(s => s.noteToAdd === 'E')).toBeUndefined();
    });

    it('should filter out chords already in identifiedChordsSet', () => {
      const currentNotes: NoteValue[] = ['A', 'C', 'E'];
      const alreadyIdentified = new Set(['A m7']);
      const suggestions = findPotentialChordsUpdated(currentNotes, alreadyIdentified);
      
      const addGSuggestion = suggestions.find(s => s.noteToAdd === 'G');
      expect(addGSuggestion).toBeDefined();
      expect(addGSuggestion?.resultingChords).toEqual(['C 6']);
      expect(addGSuggestion?.resultingChords).not.toContain('A m7');
    });

    it('should correctly form chords and sort them for [C,A] + E', () => {
      const suggestions = findPotentialChordsUpdated(['C', 'A'], new Set());
      const addESuggestion = suggestions.find(s => s.noteToAdd === 'E');
      expect(addESuggestion).toBeDefined();
      expect(addESuggestion?.resultingChords).toEqual(['A Minor']);
    });

    it('should sort the list of suggestions by noteToAdd (based on NOTES order)', () => {
      // With currentUniqueNotes = ['C', 'E']
      // Notes that form chords when added:
      // A  -> A Minor (from C,E,A)
      // G  -> C Major (from C,E,G)
      // G# -> C Augmented (from C,E,G#)
      const suggestions = findPotentialChordsUpdated(['C','E'], new Set());
      const noteOrder = suggestions.map(s => s.noteToAdd);
      
      // Expected order of these specific notes that actually form chords, sorted by NOTES constant
      const expectedFormingNotesSorted = new Array<NoteValue>('A', 'G', 'G#')
          .sort((a,b) => NOTES.indexOf(a) - NOTES.indexOf(b)); // Correct order: A, G, G#
      
      expect(noteOrder).toEqual(expectedFormingNotesSorted);
    });
    
    it('should omit suggestion if adding note results in no *new* chords', () => {
        const noNewChordsSuggestions = findPotentialChordsUpdated(['C','E','G'], new Set(['C maj7']));
        const addB = noNewChordsSuggestions.find(s => s.noteToAdd === 'B');
        expect(addB).toBeUndefined();
    });
  });
});
