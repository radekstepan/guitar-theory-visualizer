// src/components/SelectionInfo.tsx
import React from 'react';
import NoteDisplay from './NoteDisplay';
import { Button } from './ui/Button';
import { NoteValue, Mode, ColorThemeOption, ChordsData, ScaleDefinition } from '../types';
import { 
    CHORDS, SCALES, getParentMajorRoot, getRelativeModes, 
    CHORD_MODE_SUGGESTIONS, MODE_NAMES_ORDERED, ModeKey
} from '../constants';

interface SelectionInfoProps {
  mode: Mode;
  currentSelectionName: string;
  selectedKey: NoteValue;
  selectedScaleKey: string;
  pickedUniqueNotes: readonly NoteValue[];
  currentModeNotes: readonly NoteValue[];
  selectedChordKey: string;
  colorTheme: ColorThemeOption;
  identifiedChordsQuality: string | null;
  onSelectRelativeMode: (newKey: NoteValue, newScaleKey: string) => void;
}

const SelectionInfo: React.FC<SelectionInfoProps> = ({
  mode, currentSelectionName, selectedKey, selectedScaleKey,
  pickedUniqueNotes, currentModeNotes,
  selectedChordKey: currentChordAppKey,
  colorTheme, identifiedChordsQuality,
  onSelectRelativeMode,
}) => {
  const chordData = CHORDS[currentChordAppKey as keyof typeof CHORDS];
  const scaleData = SCALES[selectedScaleKey as keyof typeof SCALES] as ScaleDefinition | undefined;

  let parentScaleDisplay: string | null = null;
  let intervalFormulaDisplay: string | null = null;
  let relativeModes: { key: ModeKey, root: NoteValue, name: string }[] = [];

  if (mode === 'scale' && scaleData?.isMode && selectedKey) {
    intervalFormulaDisplay = scaleData.formula || null;
    const parentRoot = getParentMajorRoot(selectedKey, selectedScaleKey);
    if (parentRoot) {
      const parentScaleDef = SCALES[scaleData.parentScaleKey || 'ionian'];
      parentScaleDisplay = `Relative to ${parentRoot} ${parentScaleDef?.name.replace(/\s*\(.*\)\s*/, '').trim() || 'Major'}`;
      relativeModes = getRelativeModes(parentRoot);
    }
  }
  
  let chordModeCompatibility: string[] = [];
  if (mode === 'chord' && currentChordAppKey && selectedKey) {
    const suggestedModeKeys = CHORD_MODE_SUGGESTIONS[currentChordAppKey] || [];
    chordModeCompatibility = suggestedModeKeys.map(modeKey => {
      const modeDef = SCALES[modeKey];
      return `${selectedKey} ${modeDef?.name.replace(/\s*\(.*\)\s*/, '').trim() || modeKey}`;
    });
  }

  return (
    // Removed border and specific background from this main div
    <div className="text-center mb-6 min-h-[6rem] p-3">
      <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{currentSelectionName}</h2>
      
      {mode === 'scale' && scaleData?.isMode && (
        <div className="mt-1 text-xs space-y-1">
          {parentScaleDisplay && <p className="text-gray-500 dark:text-gray-400">{parentScaleDisplay}</p>}
          {intervalFormulaDisplay && <p className="text-gray-600 dark:text-gray-300 font-mono">Formula: {intervalFormulaDisplay}</p>}
        </div>
      )}

      <div className="mt-2 flex flex-col justify-center items-center space-y-1 h-auto min-h-[2rem]">
        {mode === 'pick' && (
          <>
            <div className="flex items-center space-x-1">
              {pickedUniqueNotes.length > 0 ? (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Notes:</span>
                  {pickedUniqueNotes.map(note => <NoteDisplay key={`picked-${note}`} note={note} />)}
                </>
              ) : ( <span className="text-sm">&nbsp;</span> )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {(pickedUniqueNotes.length > 0 && identifiedChordsQuality)
                ? `Quality: ${identifiedChordsQuality}`
                : <>&nbsp;</>}
            </p>
          </>
        )}

        {mode === 'chord' && (
          <>
            <div className="flex items-center space-x-1">
              {(chordData && currentModeNotes.length > 0) ? (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Notes:</span>
                  {currentModeNotes.map(note => <NoteDisplay key={`chord-note-${note}`} note={note} />)}
                </>
              ) : ( <span className="text-sm">&nbsp;</span> )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
              {chordData ? `Quality: ${chordData.quality}` : <>&nbsp;</>}
            </p>
            {chordModeCompatibility.length > 0 && (
              <div className="mt-2 text-xs">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Suggested Modes: </span>
                <span className="text-gray-500 dark:text-gray-400">{chordModeCompatibility.join(', ')}</span>
              </div>
            )}
          </>
        )}

        {mode === 'scale' && !scaleData?.isMode && ( 
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Color Theme: {colorTheme === 'standard' ? 'Standard (Root/Other)' : 'Unique Notes'}
          </p>
        )}
      </div>

      {mode === 'scale' && scaleData?.isMode && relativeModes.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Relative Modes:</p>
          <div className="flex flex-wrap justify-center gap-1">
            {relativeModes.map(relMode => (
              <Button
                key={relMode.key}
                variant={(selectedKey === relMode.root && selectedScaleKey === relMode.key) ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSelectRelativeMode(relMode.root, relMode.key)}
                className="text-xs px-2 py-1 h-auto"
              >
                {relMode.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionInfo;
