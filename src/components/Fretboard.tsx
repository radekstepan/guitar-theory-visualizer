import React from 'react';
import GuitarString from './GuitarString';
import { NoteValue, Mode, ColorThemeOption, PickData } from '../types';
import { cn } from '../utils/utils'; // Updated import

interface FretboardProps {
  tuning: readonly NoteValue[];
  numFrets: number;
  highlightedNotes?: readonly NoteValue[];
  rootNote?: NoteValue | null;
  selectedPicks?: readonly PickData[];
  selectedPicksCount?: number; 
  mode: Mode;
  colorTheme: ColorThemeOption;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotesForDisplay?: readonly NoteValue[];
}

const Fretboard: React.FC<FretboardProps> = ({
  tuning, numFrets, highlightedNotes = [], rootNote = null, selectedPicks = [],
  selectedPicksCount, 
  mode, colorTheme, onFretClick, suggestedNotesForDisplay
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
        "overflow-x-auto" 
      )}
    >
      <div className="flex items-center mb-1">
        <div className="w-12 h-4"></div> 
        {[...Array(numFrets)].map((_, i) => {
          const fretNumber = i + 1;
          return (
            <div key={`fret-num-${fretNumber}`} className="fret-number w-16 h-4 text-center text-xs text-gray-600 dark:text-gray-300 relative">
              {markerPositions[fretNumber] && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 bottom-5 flex ${markerPositions[fretNumber] === 'double' ? 'space-x-1' : ''}`}>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  {markerPositions[fretNumber] === 'double' && <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>}
                </div>
              )}
              {fretNumber}
            </div>
          );
        })}
      </div>
      {tuning.map((openNote, stringIndex) => (
        <GuitarString
          key={`string-${stringIndex}-${openNote}`}
          stringIndex={stringIndex}
          openNote={openNote}
          numFrets={numFrets}
          highlightedNotes={highlightedNotes}
          rootNote={rootNote}
          selectedPicks={selectedPicks}
          selectedPicksCount={selectedPicksCount} 
          mode={mode}
          colorTheme={colorTheme}
          onFretClick={onFretClick}
          suggestedNotes={suggestedNotesForDisplay}
        />
      ))}
    </div>
  );
};

export default Fretboard;
