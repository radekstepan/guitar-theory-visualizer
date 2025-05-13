import React from 'react';
import { NoteValue } from '../types';
import { UNIQUE_NOTE_COLORS, UNIQUE_NOTE_TEXT_COLORS, COMMON_NOTE_TEXT_STYLE } from '../constants';
import { cn } from './ui';

interface NoteDisplayProps {
  note: NoteValue;
}

const NoteDisplay: React.FC<NoteDisplayProps> = ({ note }) => {
  const textColor = UNIQUE_NOTE_TEXT_COLORS[note] || 'text-white';
  return (
    <span className={cn(
      'note-marker inline-flex w-6 h-5 rounded items-center justify-center shadow-md mx-0.5',
      UNIQUE_NOTE_COLORS[note] || 'bg-gray-400',
      textColor,
      COMMON_NOTE_TEXT_STYLE
    )}>
      {note}
    </span>
  );
};

export default NoteDisplay;
