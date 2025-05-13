import React from 'react';
import { NoteValue, Mode, ColorThemeOption, PickData } from '../types';
import { UNIQUE_NOTE_COLORS, UNIQUE_NOTE_TEXT_COLORS, COMMON_NOTE_TEXT_STYLE, SELECTED_FRET_CELL_BG, NOTES } from '../constants';
import { getNoteDetailsAtFret } from '../utils/chordFinder';
import { cn } from './ui';

interface FretProps {
  stringIndex: number;
  fretIndex: number;
  note: NoteValue;
  isHighlighted: boolean; // This now correctly reflects if the note should be shown in "pick mode show all"
  isRoot: boolean;
  isSelected: boolean;
  selectedPicksCount?: number; // New prop
  mode: Mode;
  colorTheme: ColorThemeOption;
  isOpenString: boolean;
  onFretClick?: (pickData: PickData) => void;
  suggestedNotes?: readonly NoteValue[];
}

const Fret: React.FC<FretProps> = ({
  stringIndex, fretIndex, note, isHighlighted, isRoot, isSelected,
  selectedPicksCount, // Destructure
  mode, colorTheme, isOpenString, onFretClick, suggestedNotes
}) => {
  const isPickModeShowAllInitial = mode === 'pick' && typeof selectedPicksCount === 'number' && selectedPicksCount <= 1;

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

  // Determine if a marker should be shown
  const showMarker = 
    (mode === 'pick' && isSelected) || // Always show selected notes
    (mode === 'pick' && !isSelected && !isPickModeShowAllInitial && suggestedNotes?.includes(note)) || // Show suggested if not selected and not in "show all" mode
    (isPickModeShowAllInitial && isHighlighted) || // Show if in "show all" mode and this fret is highlighted (i.e., its note is one of the 12)
    (mode !== 'pick' && isHighlighted); // Standard highlighting for scale/chord

  if (mode === 'pick' && isSelected) { // Style for selected notes (takes precedence)
    fretCellBgClass = SELECTED_FRET_CELL_BG;
    noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400';
    noteMarkerTextColor = `${UNIQUE_NOTE_TEXT_COLORS[note] || 'text-white'} ${COMMON_NOTE_TEXT_STYLE}`;
  } else if (showMarker) { // Style for other types of markers
    noteMarkerTextColor = `${UNIQUE_NOTE_TEXT_COLORS[note] || 'text-white'} ${COMMON_NOTE_TEXT_STYLE}`;
    noteMarkerBgColor = UNIQUE_NOTE_COLORS[note] || 'bg-gray-400'; // Default to unique colors for pick mode / unique theme

    if (mode === 'pick') {
      if (isPickModeShowAllInitial && isHighlighted) {
        // "Show all notes" state: full opacity, unique color.
        // Colors are already set above. Opacity is default (full).
        markerOpacityClass = ''; 
      } else if (!isSelected && suggestedNotes?.includes(note)) { // This is for suggested notes when > 1 pick
        markerOpacityClass = 'opacity-60';
      }
    } else { // Scale or Chord mode highlighting
      if (colorTheme === 'standard') {
        noteMarkerBgColor = isRoot ? 'bg-blue-500 dark:bg-blue-400' : 'bg-green-500 dark:bg-green-400';
        noteMarkerTextColor = `text-white dark:text-gray-900 ${COMMON_NOTE_TEXT_STYLE}`;
        if (isRoot) ringColor = 'ring-2 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-800 ring-blue-600 dark:ring-blue-500';
      } else { // Unique note colors for scale/chord
        // noteMarkerBgColor already set to unique.
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
