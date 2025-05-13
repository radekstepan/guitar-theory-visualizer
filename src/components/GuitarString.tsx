import React from 'react';
import Fret from './Fret';
import { NoteValue, Mode, ColorThemeOption, PickData } from '../types';
import { getNoteDetailsAtFret } from '../utils/chordFinder';

interface GuitarStringProps {
  stringIndex: number;
  openNote: NoteValue;
  numFrets: number;
  highlightedNotes: readonly NoteValue[];
  rootNote: NoteValue | null;
  selectedPicks: readonly PickData[];
  selectedPicksCount?: number; // New prop
  mode: Mode;
  colorTheme: ColorThemeOption;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotes?: readonly NoteValue[];
}

const GuitarString: React.FC<GuitarStringProps> = ({
  stringIndex, openNote, numFrets, highlightedNotes, rootNote,
  selectedPicks, selectedPicksCount, // Destructure new prop
  mode, colorTheme, onFretClick, suggestedNotes
}) => {
  const frets = [];

  const isFretHighlighted = (currentNote: NoteValue): boolean => {
    if (mode === 'pick') {
      // When selectedPicksCount <= 1, App.tsx passes all NOTES as highlightedNotes.
      // So, if highlightedNotes includes currentNote, it means it should be shown.
      if (typeof selectedPicksCount === 'number' && selectedPicksCount <= 1) {
        return highlightedNotes.includes(currentNote);
      }
      // Otherwise (selectedPicksCount > 1), standard highlighting doesn't apply for pick mode base notes;
      // selected and suggested notes are handled separately.
      return false;
    }
    // For scale/chord mode
    return highlightedNotes.includes(currentNote);
  };


  for (let i = 0; i <= numFrets; i++) {
    const noteDetails = getNoteDetailsAtFret(stringIndex, i);
    if (!noteDetails) continue;
    const note = noteDetails.note;

    const isSelected = mode === 'pick' && selectedPicks.some(p => p.stringIndex === stringIndex && p.fretIndex === i);
    const fretIsHighlightedStatus = isFretHighlighted(note);
    const isRoot = mode !== 'pick' && note === rootNote;

    frets.push(
      <Fret
        key={`${openNote}-${i}`} stringIndex={stringIndex} fretIndex={i} note={note}
        isHighlighted={fretIsHighlightedStatus} 
        isRoot={isRoot} 
        isSelected={isSelected}
        selectedPicksCount={selectedPicksCount} // Pass down
        mode={mode} colorTheme={colorTheme} isOpenString={i === 0} onFretClick={onFretClick}
        suggestedNotes={suggestedNotes}
      />
    );
  }
  return <div className="string flex items-center border-b border-gray-400 dark:border-gray-500 last:border-b-0">{frets}</div>;
};

export default GuitarString;
