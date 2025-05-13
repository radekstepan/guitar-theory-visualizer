import React from 'react';
import Fret from './Fret';
import { NoteValue, Mode, ColorThemeOption, PickData } from '../types';
import { getNoteDetailsAtFret } from '../utils/chordFinder';

interface GuitarStringProps {
  stringIndex: number;
  openNote: NoteValue;
  numFrets: number;
  highlightedNotes: readonly NoteValue[]; // <--- Change here
  rootNote: NoteValue | null;
  selectedPicks: readonly PickData[];   // <--- Change here
  mode: Mode;
  colorTheme: ColorThemeOption;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotes?: readonly NoteValue[]; // <--- Change here
}

const GuitarString: React.FC<GuitarStringProps> = ({
  stringIndex, openNote, numFrets, highlightedNotes, rootNote,
  selectedPicks, mode, colorTheme, onFretClick, suggestedNotes
}) => {
  const frets = [];
  for (let i = 0; i <= numFrets; i++) {
    const noteDetails = getNoteDetailsAtFret(stringIndex, i);
    if (!noteDetails) continue;
    const note = noteDetails.note;

    const isSelected = mode === 'pick' && selectedPicks.some(p => p.stringIndex === stringIndex && p.fretIndex === i);
    // .includes() is fine on readonly arrays
    const isHighlighted = mode !== 'pick' && highlightedNotes.includes(note);
    const isRoot = mode !== 'pick' && note === rootNote;

    frets.push(
      <Fret
        key={`${openNote}-${i}`} stringIndex={stringIndex} fretIndex={i} note={note}
        isHighlighted={isHighlighted} isRoot={isRoot} isSelected={isSelected}
        mode={mode} colorTheme={colorTheme} isOpenString={i === 0} onFretClick={onFretClick}
        suggestedNotes={suggestedNotes}
      />
    );
  }
  return <div className="string flex items-center border-b border-gray-400 dark:border-gray-500 last:border-b-0">{frets}</div>;
};

export default GuitarString;
