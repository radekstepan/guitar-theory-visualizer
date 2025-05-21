// src/components/Fret.tsx
import React from 'react';
import { NoteValue, Mode, ColorThemeOption, PickData, ScaleDefinition } from '../types';
import { 
    UNIQUE_NOTE_COLORS, UNIQUE_NOTE_TEXT_COLORS, COMMON_NOTE_TEXT_STYLE, 
    SELECTED_FRET_CELL_BG, getIntervalNameFromFormula, NOTES // Added NOTES import
} from '../constants';
import { getNoteDetailsAtFret } from '../utils/chordFinder';
import { cn } from '../utils/utils';

interface FretProps {
  stringIndex: number;
  fretIndex: number;
  note: NoteValue;
  isHighlighted: boolean;
  isSelected: boolean;
  selectedPicksCount?: number;
  mode: Mode;
  colorTheme: ColorThemeOption;
  isOpenString: boolean;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotes?: readonly NoteValue[];
  currentScaleDef?: ScaleDefinition;
  modeRootNote?: NoteValue | null;
  parentScaleRootNote?: NoteValue | null;
  showParentScaleOverlay?: boolean;
  parentScaleNotes?: readonly NoteValue[];
  showIntervalIndicators?: boolean;
}

const Fret: React.FC<FretProps> = ({
  stringIndex, fretIndex, note, isHighlighted, isSelected,
  selectedPicksCount,
  mode, colorTheme, isOpenString, onFretClick, suggestedNotes,
  currentScaleDef, modeRootNote, parentScaleRootNote,
  showParentScaleOverlay = false, parentScaleNotes = [], showIntervalIndicators = false
}) => {
  const isPickModeShowAllInitial = mode === 'pick' && typeof selectedPicksCount === 'number' && selectedPicksCount <= 1;

  let fretCellBgClass = isOpenString ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-300 dark:bg-gray-600';
  let noteMarkerBgColor = '';
  let noteMarkerTextColor = '';
  let noteMarkerOutlineClass = ''; 
  let noteMarkerOpacityClass = '';
  let noteText = note;
  let cursorClass = '';
  let intervalLabel: string | null = null;

  const isModeRoot = note === modeRootNote;
  const isParentRoot = note === parentScaleRootNote;

  const isNoteInCurrentMode = isHighlighted; 
  const isNoteInParentScale = parentScaleNotes.includes(note);

  let showMarker = false;
  if (mode === 'pick') {
    showMarker = isSelected || 
                 (!isSelected && !isPickModeShowAllInitial && suggestedNotes?.includes(note)) ||
                 (isPickModeShowAllInitial && isHighlighted); 
  } else { 
    if (showParentScaleOverlay) {
      showMarker = isNoteInParentScale || (isNoteInCurrentMode && !isNoteInParentScale); 
    } else {
      showMarker = isNoteInCurrentMode;
    }
  }
  
  if (mode === 'pick' && isSelected) {
    fretCellBgClass = SELECTED_FRET_CELL_BG;
  }

  if (showMarker) {
    noteMarkerTextColor = `${UNIQUE_NOTE_TEXT_COLORS[note] || 'text-white'} ${COMMON_NOTE_TEXT_STYLE}`;

    if (mode === 'pick') { 
      noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400';
      if (isPickModeShowAllInitial && isHighlighted) { 
        noteMarkerOpacityClass = '';
      } else if (!isSelected && suggestedNotes?.includes(note)) { 
        noteMarkerOpacityClass = 'opacity-60';
      }
    } else { 
      if (showParentScaleOverlay) {
        if (isNoteInParentScale) {
          noteMarkerBgColor = 'bg-gray-400 dark:bg-gray-500'; 
          noteMarkerTextColor = `text-black dark:text-white ${COMMON_NOTE_TEXT_STYLE}`;
          if (isNoteInCurrentMode) { 
             noteMarkerOpacityClass = ''; 
          } else {
            noteMarkerOpacityClass = 'opacity-70'; 
          }
        } else if (isNoteInCurrentMode) { 
           noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400'; 
           noteMarkerOpacityClass = 'opacity-30'; 
        }
      } else { 
        if (colorTheme === 'standard') {
          noteMarkerBgColor = isModeRoot ? 'bg-blue-500 dark:bg-blue-400' : 'bg-green-500 dark:bg-green-400';
          noteMarkerTextColor = `text-white dark:text-gray-900 ${COMMON_NOTE_TEXT_STYLE}`;
        } else { 
          noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400';
        }
      }

      if (isModeRoot) {
        noteMarkerOutlineClass = 'ring-2 ring-offset-1 ring-blue-600 dark:ring-blue-500 ring-offset-gray-100 dark:ring-offset-gray-800'; 
        noteMarkerBgColor = colorTheme === 'standard' && !showParentScaleOverlay ? 'bg-blue-500 dark:bg-blue-400' : noteMarkerBgColor; 
         if (showParentScaleOverlay && !isNoteInParentScale) noteMarkerOpacityClass = 'opacity-50'; 
      }
      if (isParentRoot && showParentScaleOverlay) {
        if (!isModeRoot) { 
           noteMarkerOutlineClass = 'ring-2 ring-offset-1 ring-green-500 dark:ring-green-400 ring-offset-gray-100 dark:ring-offset-gray-800'; // Solid green for now
        }
         noteMarkerBgColor = isModeRoot ? noteMarkerBgColor : 'bg-green-300 dark:bg-green-600'; 
         noteMarkerOpacityClass = ''; 
      } 
      
      if (showIntervalIndicators && mode === 'scale' && currentScaleDef && modeRootNote) {
        const rootNoteIndex = NOTES.indexOf(modeRootNote);
        const currentNoteIndex = NOTES.indexOf(note);
        if (rootNoteIndex !== -1 && currentNoteIndex !== -1) {
          let semitonesFromRoot = (currentNoteIndex - rootNoteIndex + 12) % 12;
          if (isNoteInCurrentMode || (showParentScaleOverlay && isNoteInParentScale)) { 
             intervalLabel = getIntervalNameFromFormula(semitonesFromRoot, currentScaleDef);
          }
        }
      }
    }
  }

  if (mode === 'pick') {
    cursorClass = 'cursor-pointer hover:bg-opacity-80';
  }

  const handleClick = () => {
    if (mode === 'pick' && onFretClick) {
      const noteDetails = getNoteDetailsAtFret(stringIndex, fretIndex);
      if (noteDetails) {
        onFretClick({ stringIndex, fretIndex, ...noteDetails });
      }
    }
  };

  const borderClasses = isOpenString
    ? 'border-l-2 border-gray-600 dark:border-gray-400 border-r border-gray-500 dark:border-gray-400'
    : 'border-r border-gray-500 dark:border-gray-400';

  return (
    <div
      className={cn(
        `fret ${isOpenString ? 'w-12' : 'w-16'} h-10 flex items-center justify-center relative transition-colors duration-150 group`,
        borderClasses,
        fretCellBgClass,
        cursorClass
      )}
      onClick={handleClick}
      role={mode === 'pick' ? 'button' : undefined}
      aria-pressed={mode === 'pick' ? isSelected : undefined}
      aria-label={mode === 'pick' ? `Fret ${fretIndex} on string ${stringIndex + 1}, Note ${note}` : `Fret ${fretIndex} on string ${stringIndex + 1}, Note ${note}`}
    >
      {isOpenString && !showMarker && (<span className="text-xs font-medium text-gray-600 dark:text-gray-300">{noteText}</span>)}
      {showMarker && (
        <div className={cn(
          `note-marker ${isOpenString ? 'w-6 h-6' : 'w-7 h-7'} rounded-full flex flex-col items-center justify-center shadow-md transition-all duration-200 relative`,
          noteMarkerBgColor,
          noteMarkerTextColor,
          noteMarkerOutlineClass,
          noteMarkerOpacityClass
        )}>
          <span>{noteText}</span>
          {intervalLabel && (
            <span className="absolute -bottom-3 text-[0.6rem] text-gray-700 dark:text-gray-300 font-mono group-hover:font-semibold">
              {intervalLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Fret;
