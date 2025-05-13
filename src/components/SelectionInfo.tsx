import React from 'react';
import NoteDisplay from './NoteDisplay';
import { NoteValue, Mode, ColorThemeOption, ChordsData } from '../types';
import { CHORDS } from '../constants';

interface SelectionInfoProps {
  mode: Mode;
  currentSelectionName: string;
  pickedUniqueNotes: readonly NoteValue[];
  currentModeNotes: readonly NoteValue[];
  selectedChordKey: string;
  colorTheme: ColorThemeOption;
  identifiedChordsQuality: string | null;
}

const SelectionInfo: React.FC<SelectionInfoProps> = ({
  mode, currentSelectionName, pickedUniqueNotes, currentModeNotes,
  selectedChordKey, colorTheme, identifiedChordsQuality
}) => {
  const chordData = CHORDS[selectedChordKey as keyof typeof CHORDS];

  return (
    <div className="text-center mb-6 min-h-[4rem]"> {/* Ensure min-height to prevent layout shifts */}
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{currentSelectionName}</h2>
      <div className="mt-1 flex flex-col justify-center items-center space-y-1 h-auto min-h-[2rem]">
        {/* Pick Mode Display */}
        {mode === 'pick' && (
          <>
            <div className="flex items-center space-x-1">
              {pickedUniqueNotes.length > 0 ? (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Notes:</span>
                  {pickedUniqueNotes.map(note => <NoteDisplay key={`picked-${note}`} note={note} />)}
                </>
              ) : (
                <span className="text-sm">&nbsp;</span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {(pickedUniqueNotes.length > 0 && identifiedChordsQuality)
                ? `Quality: ${identifiedChordsQuality}`
                : <>&nbsp;</> /* Placeholder for Quality line height */
              }
            </p>
          </>
        )}

        {/* Chord Mode Display */}
        {mode === 'chord' && (
          <>
            <div className="flex items-center space-x-1">
              {(chordData && currentModeNotes.length > 0) ? (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Notes:</span>
                  {currentModeNotes.map(note => <NoteDisplay key={`chord-note-${note}`} note={note} />)}
                </>
              ) : (
                <span className="text-sm">&nbsp;</span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {chordData ? `Quality: ${chordData.quality}` : <>&nbsp;</>} {/* Placeholder for Quality line height */}
            </p>
          </>
        )}

        {/* Scale Mode Display */}
        {mode === 'scale' && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Color Theme: {colorTheme === 'standard' ? 'Standard (Root/Other)' : 'Unique Notes'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectionInfo;
