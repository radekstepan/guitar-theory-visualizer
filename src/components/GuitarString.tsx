// src/components/GuitarString.tsx
import React from 'react';
import Fret from './Fret';
import { NoteValue, Mode, ColorThemeOption, PickData, ScaleDefinition } from '../types'; // Added ScaleDefinition
import { getNoteDetailsAtFret } from '../utils/chordFinder';

interface GuitarStringProps {
  stringIndex: number;
  openNote: NoteValue;
  numFrets: number;
  highlightedNotes: readonly NoteValue[];
  // rootNote: NoteValue | null; // Removed, Fret component now uses modeRootNote
  selectedPicks: readonly PickData[];
  selectedPicksCount?: number;
  mode: Mode;
  colorTheme: ColorThemeOption;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotes?: readonly NoteValue[];

  // New props for modes, to be passed to Fret
  currentScaleDef?: ScaleDefinition;
  modeRootNote?: NoteValue | null;
  parentScaleRootNote?: NoteValue | null;
  showParentScaleOverlay?: boolean;
  parentScaleNotes?: readonly NoteValue[];
  showIntervalIndicators?: boolean;
}

const GuitarString: React.FC<GuitarStringProps> = ({
  stringIndex, openNote, numFrets, highlightedNotes, 
  selectedPicks, selectedPicksCount,
  mode, colorTheme, onFretClick, suggestedNotes,
  currentScaleDef, modeRootNote, parentScaleRootNote,
  showParentScaleOverlay, parentScaleNotes, showIntervalIndicators
}) => {
  const frets = [];

  const isFretHighlightedForMode = (currentNote: NoteValue): boolean => {
    if (mode === 'pick') {
      if (typeof selectedPicksCount === 'number' && selectedPicksCount <= 1) {
        return highlightedNotes.includes(currentNote);
      }
      return false;
    }
    return highlightedNotes.includes(currentNote);
  };

  for (let i = 0; i <= numFrets; i++) {
    const noteDetails = getNoteDetailsAtFret(stringIndex, i);
    if (!noteDetails) continue;
    const note = noteDetails.note;

    const isSelected = mode === 'pick' && selectedPicks.some(p => p.stringIndex === stringIndex && p.fretIndex === i);
    const fretIsHighlighted = isFretHighlightedForMode(note);
    // const isRoot = mode !== 'pick' && note === rootNote; // Replaced by modeRootNote logic in Fret

    frets.push(
      <Fret
        key={`${openNote}-${i}`} stringIndex={stringIndex} fretIndex={i} note={note}
        isHighlighted={fretIsHighlighted}
        // isRoot={isRoot} // Removed
        isSelected={isSelected}
        selectedPicksCount={selectedPicksCount}
        mode={mode} colorTheme={colorTheme} isOpenString={i === 0} onFretClick={onFretClick}
        suggestedNotes={suggestedNotes}
        // Pass new props
        currentScaleDef={currentScaleDef}
        modeRootNote={modeRootNote}
        parentScaleRootNote={parentScaleRootNote}
        showParentScaleOverlay={showParentScaleOverlay}
        parentScaleNotes={parentScaleNotes}
        showIntervalIndicators={showIntervalIndicators}
      />
    );
  }
  return <div className="string flex items-center border-b border-gray-400 dark:border-gray-500 last:border-b-0">{frets}</div>;
};

export default GuitarString;
