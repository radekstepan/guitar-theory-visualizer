import React from 'react';
import { Guitar, Music, Hand } from 'lucide-react';
import { Button } from './ui';
import { Mode } from '../types';

interface ModeSelectionProps {
  currentMode: Mode;
  onSetMode: (mode: Mode) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ currentMode, onSetMode }) => {
  return (
    <div className="flex justify-center space-x-2 mb-6">
      <Button variant={currentMode === 'scale' ? 'default' : 'outline'} onClick={() => onSetMode('scale')}>
        <Music className="w-4 h-4 mr-2" /> Scale Mode
      </Button>
      <Button variant={currentMode === 'chord' ? 'default' : 'outline'} onClick={() => onSetMode('chord')}>
        <Guitar className="w-4 h-4 mr-2" /> Chord Mode
      </Button>
      <Button variant={currentMode === 'pick' ? 'default' : 'outline'} onClick={() => onSetMode('pick')}>
        <Hand className="w-4 h-4 mr-2" /> Pick Mode
      </Button>
    </div>
  );
};

export default ModeSelection;
