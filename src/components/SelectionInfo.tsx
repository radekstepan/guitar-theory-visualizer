import React from 'react';
import NoteDisplay from './NoteDisplay';
import { NoteValue, Mode, ColorThemeOption, ChordsData } from '../types';
import { CHORDS } from '../constants';

interface SelectionInfoProps {
  mode: Mode;
  currentSelectionName: string;
  pickedUniqueNotes: readonly NoteValue[];   // <--- Change here
  currentModeNotes: readonly NoteValue[];    // <--- Change here
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
    <div className="text-center mb-6 min-h-[4rem]">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{currentSelectionName}</h2>
      <div className="mt-1 flex flex-col justify-center items-center space-y-1 h-auto min-h-[2rem]">
        {mode === 'pick' && pickedUniqueNotes.length > 0 && (
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Notes:</span>
            {pickedUniqueNotes.map(note => <NoteDisplay key={`picked-${note}`} note={note} />)}
          </div>
        )}
        {mode === 'chord' && currentModeNotes.length > 0 && chordData && (
          <>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Notes:</span>
              {currentModeNotes.map(note => <NoteDisplay key={`chord-note-${note}`} note={note} />)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">Quality: {chordData.quality}</p>
          </>
        )}
        {mode === 'pick' && identifiedChordsQuality && (
             <p className="text-xs text-gray-500 dark:text-gray-400 italic">Quality: {identifiedChordsQuality}</p>
        )}
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
