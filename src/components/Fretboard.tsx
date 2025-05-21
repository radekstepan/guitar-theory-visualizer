// src/components/Fretboard.tsx
import React from 'react';
import GuitarString from './GuitarString';
import { NoteValue, Mode, ColorThemeOption, PickData, ScaleDefinition } from '../types';
import { cn } from '../utils/utils';

interface FretboardProps {
  tuning: readonly NoteValue[];
  numFrets: number;
  highlightedNotes?: readonly NoteValue[]; // Notes of the current mode/scale
  // rootNote?: NoteValue | null; // Replaced by modeRootNote
  selectedPicks?: readonly PickData[];
  selectedPicksCount?: number;
  mode: Mode;
  colorTheme: ColorThemeOption;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotesForDisplay?: readonly NoteValue[];

  // New props for modes
  currentScaleDef?: ScaleDefinition;
  modeRootNote?: NoteValue | null;
  parentScaleRootNote?: NoteValue | null;
  showParentScaleOverlay?: boolean;
  parentScaleNotes?: readonly NoteValue[];
  showIntervalIndicators?: boolean;
}

const Fretboard: React.FC<FretboardProps> = ({
  tuning, numFrets, highlightedNotes = [], 
  selectedPicks = [], selectedPicksCount,
  mode, colorTheme, onFretClick, suggestedNotesForDisplay,
  currentScaleDef, modeRootNote, parentScaleRootNote,
  showParentScaleOverlay = false, parentScaleNotes = [], showIntervalIndicators = false,
}) => {
  const fretMarkers = [3, 5, 7, 9, 12];
  const markerPositions: Record<number, 'single' | 'double'> = {};
  fretMarkers.forEach(fret => markerPositions[fret] = 'single');
  if (numFrets >= 12) markerPositions[12] = 'double';

  return (
    <div
      className={cn(
        "fretboard-container bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-lg",
        "inline-flex flex-col",
        "overflow-x-auto relative" // Added relative for absolute positioned interval labels
      )}
    >
      <div className="flex items-center mb-1"> {/* Fret numbers row */}
        <div className="w-12 h-4"></div> {/* Spacer for open string notes */}
        {[...Array(numFrets)].map((_, i) => {
          const fretNumber = i + 1;
          return (
            <div key={`fret-num-${fretNumber}`} className="fret-number w-16 h-8 text-center text-xs text-gray-600 dark:text-gray-300 relative flex items-end justify-center">
              {/* Fret Markers (dots) moved above the numbers for clarity */}
              {markerPositions[fretNumber] && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 -top-3 flex ${markerPositions[fretNumber] === 'double' ? 'space-x-2' : ''}`}>
                  <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  {markerPositions[fretNumber] === 'double' && <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>}
                </div>
              )}
              {fretNumber}
            </div>
          );
        })}
      </div>
      {tuning.slice().reverse().map((openNote, index) => { // Reverse for standard guitar top-to-bottom (low E at bottom)
        const originalStringIndex = tuning.length - 1 - index;
        return (
          <GuitarString
            key={`string-${originalStringIndex}-${openNote}`}
            stringIndex={originalStringIndex}
            openNote={openNote}
            numFrets={numFrets}
            highlightedNotes={highlightedNotes}
            // rootNote prop removed, using modeRootNote from Fret directly
            selectedPicks={selectedPicks}
            selectedPicksCount={selectedPicksCount}
            mode={mode}
            colorTheme={colorTheme}
            onFretClick={onFretClick}
            suggestedNotes={suggestedNotesForDisplay}
            // Pass new props
            currentScaleDef={currentScaleDef}
            modeRootNote={modeRootNote}
            parentScaleRootNote={parentScaleRootNote}
            showParentScaleOverlay={showParentScaleOverlay}
            parentScaleNotes={parentScaleNotes}
            showIntervalIndicators={showIntervalIndicators}
          />
        );
      })}
    </div>
  );
};

export default Fretboard;
