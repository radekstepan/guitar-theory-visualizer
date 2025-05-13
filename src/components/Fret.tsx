import React from 'react';
import { NoteValue, Mode, ColorThemeOption, PickData } from '../types';
import { UNIQUE_NOTE_COLORS, UNIQUE_NOTE_TEXT_COLORS, COMMON_NOTE_TEXT_STYLE, SELECTED_FRET_CELL_BG } from '../constants';
import { getNoteDetailsAtFret } from '../utils/chordFinder';
import { cn } from './ui';

interface FretProps {
  stringIndex: number;
  fretIndex: number;
  note: NoteValue;
  isHighlighted: boolean;
  isRoot: boolean;
  isSelected: boolean;
  mode: Mode;
  colorTheme: ColorThemeOption;
  isOpenString: boolean;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotes?: readonly NoteValue[]; // <--- Change here
}

const Fret: React.FC<FretProps> = ({
  stringIndex, fretIndex, note, isHighlighted, isRoot, isSelected,
  mode, colorTheme, isOpenString, onFretClick, suggestedNotes
}) => {
  let fretCellBgClass = isOpenString ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-300 dark:bg-gray-600';
  let noteMarkerBgColor = '';
  let noteMarkerTextColor = '';
  let ringColor = '';
  let borderClasses = isOpenString
    ? 'border-l-2 border-gray-600 dark:border-gray-400 border-r border-gray-500 dark:border-gray-400'
    : 'border-r border-gray-500 dark:border-gray-400';
  let noteText = note;
  let cursorClass = '';
  let markerOpacityClass = '';

  // .includes() is fine on readonly arrays
  const isActuallySuggested = mode === 'pick' && !isSelected && suggestedNotes && suggestedNotes.includes(note);
  const showMarker = (mode === 'pick' && (isSelected || isActuallySuggested)) || (mode !== 'pick' && isHighlighted);

  if (mode === 'pick' && isSelected) {
    fretCellBgClass = SELECTED_FRET_CELL_BG;
    noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400';
    noteMarkerTextColor = `${UNIQUE_NOTE_TEXT_COLORS[note] || 'text-white'} ${COMMON_NOTE_TEXT_STYLE}`;
  } else if (showMarker) {
    noteMarkerTextColor = `${UNIQUE_NOTE_TEXT_COLORS[note] || 'text-white'} ${COMMON_NOTE_TEXT_STYLE}`;
    noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400';

    if (isActuallySuggested) {
      markerOpacityClass = 'opacity-60';
    } else if (mode !== 'pick' && isHighlighted) {
      if (colorTheme === 'standard') {
        noteMarkerBgColor = isRoot ? 'bg-blue-500 dark:bg-blue-400' : 'bg-green-500 dark:bg-green-400';
        noteMarkerTextColor = `text-white dark:text-gray-900 ${COMMON_NOTE_TEXT_STYLE}`;
        if (isRoot) ringColor = 'ring-2 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-800 ring-blue-600 dark:ring-blue-500';
      } else {
        noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400';
        if (isRoot) ringColor = 'ring-2 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-800 ring-black dark:ring-white';
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

  return (
    <div
      className={cn(
        `fret ${isOpenString ? 'w-12' : 'w-16'} h-8 flex items-center justify-center relative transition-colors duration-150`,
        borderClasses,
        fretCellBgClass,
        cursorClass
      )}
      onClick={handleClick}
      role={mode === 'pick' ? 'button' : undefined}
      aria-pressed={mode === 'pick' ? isSelected : undefined}
      aria-label={mode === 'pick' ? `Fret ${fretIndex} on string ${stringIndex + 1}, Note ${note}` : undefined}
    >
      {isOpenString && !showMarker && (<span className="text-xs font-medium text-gray-600 dark:text-gray-300">{noteText}</span>)}
      {showMarker && (
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={cn(
            `note-marker ${isOpenString ? 'w-5 h-5' : 'w-6 h-5'} rounded flex items-center justify-center shadow-md transition-all duration-200`,
            noteMarkerBgColor,
            noteMarkerTextColor,
            ringColor,
            markerOpacityClass
          )}>
            {noteText}
          </div>
        </div>
      )}
    </div>
  );
};

export default Fret;
