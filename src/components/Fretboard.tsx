import React from 'react';
import GuitarString from './GuitarString';
import { NoteValue, Mode, ColorThemeOption, PickData } from '../types';

interface FretboardProps {
  tuning: readonly NoteValue[]; // <--- Change here: NoteValue[] to readonly NoteValue[]
  numFrets: number;
  highlightedNotes?: readonly NoteValue[]; // Also make this readonly for consistency
  rootNote?: NoteValue | null;
  selectedPicks?: readonly PickData[]; // And this
  mode: Mode;
  colorTheme: ColorThemeOption;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotesForDisplay?: readonly NoteValue[]; // And this
}

const Fretboard: React.FC<FretboardProps> = ({
  tuning, numFrets, highlightedNotes = [], rootNote = null, selectedPicks = [],
  mode, colorTheme, onFretClick, suggestedNotesForDisplay
}) => {
  const fretMarkers = [3, 5, 7, 9, 12];
  const markerPositions: Record<number, 'single' | 'double'> = {};
  fretMarkers.forEach(fret => markerPositions[fret] = 'single');
  if (numFrets >= 12) markerPositions[12] = 'double';

  return (
    <div className="fretboard-container bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-lg overflow-x-auto">
      {/* Fret Numbers Row */}
      <div className="flex items-center mb-1">
        <div className="w-12 h-4"></div> {/* Placeholder for open string area */}
        {[...Array(numFrets)].map((_, i) => {
          const fretNumber = i + 1;
          return (
            <div key={`fret-num-${fretNumber}`} className="fret-number w-16 h-4 text-center text-xs text-gray-600 dark:text-gray-300 relative">
              {fretNumber}
              {markerPositions[fretNumber] && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 -bottom-3 flex ${markerPositions[fretNumber] === 'double' ? 'space-x-1' : ''}`}>
                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                  {markerPositions[fretNumber] === 'double' && <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Guitar Strings */}
      {tuning.map((openNote, stringIndex) => ( // .map is fine on readonly arrays
        <GuitarString
          key={`string-${stringIndex}-${openNote}`}
          stringIndex={stringIndex}
          openNote={openNote} // openNote is a NoteValue, not an array
          numFrets={numFrets}
          highlightedNotes={highlightedNotes}
          rootNote={rootNote}
          selectedPicks={selectedPicks}
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
