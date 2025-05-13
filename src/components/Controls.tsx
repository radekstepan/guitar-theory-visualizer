import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui';
import { NoteValue, Mode, ScalesData, ChordsData } from '../types'; // Ensure NoteValue is imported
import { NOTES, SCALES, CHORDS } from '../constants';

interface ControlsProps {
  mode: Mode;
  selectedKey: NoteValue;
  onKeyChange: (value: NoteValue) => void;
  selectedScale: string;
  onScaleChange: (value: string) => void;
  selectedChordKey: string;
  onChordChange: (value: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  mode, selectedKey, onKeyChange, selectedScale, onScaleChange, selectedChordKey, onChordChange
}) => {
  if (mode === 'pick') return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Key Selection */}
      <Card>
        <CardHeader><CardTitle>Root Note</CardTitle></CardHeader>
        <CardContent>
          <Select onValueChange={(value) => onKeyChange(value as NoteValue)} value={selectedKey}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Key" /></SelectTrigger>
            <SelectContent>{NOTES.map((note: NoteValue) => (<SelectItem key={note} value={note}>{note}</SelectItem>))}</SelectContent>
          </Select>
        </CardContent>
      </Card>
      {/* Scale Selection */}
      <Card className={`transition-opacity ${mode !== 'scale' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
        <CardHeader><CardTitle>Scale</CardTitle></CardHeader>
        <CardContent>
          <Select onValueChange={onScaleChange} value={selectedScale} disabled={mode !== 'scale'}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Scale" /></SelectTrigger>
            <SelectContent>{Object.entries(SCALES as ScalesData).map(([key, scale]) => (<SelectItem key={key} value={key}>{scale.name}</SelectItem>))}</SelectContent>
          </Select>
        </CardContent>
      </Card>
      {/* Chord Selection */}
      <Card className={`transition-opacity ${mode !== 'chord' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
        <CardHeader><CardTitle>Chord</CardTitle></CardHeader>
        <CardContent>
          <Select onValueChange={onChordChange} value={selectedChordKey} disabled={mode !== 'chord'}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Chord" /></SelectTrigger>
            <SelectContent>{Object.entries(CHORDS as ChordsData).map(([key, chord]) => (<SelectItem key={key} value={key}>{chord.name}</SelectItem>))}</SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default Controls;
