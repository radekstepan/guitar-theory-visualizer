import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui'; // Updated import
import { NoteValue, Mode, ScalesData, ChordsData } from '../types';
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

  const getChordDisplayLabel = (key: string, chordDef: typeof CHORDS[string]): string => {
    return chordDef.name || chordDef.quality.split(',')[0] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader><CardTitle>Root Note</CardTitle></CardHeader>
        <CardContent>
          <Select onValueChange={(value) => onKeyChange(value as NoteValue)} value={selectedKey}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Key" /></SelectTrigger>
            <SelectContent>{NOTES.map((note: NoteValue) => (<SelectItem key={note} value={note}>{note}</SelectItem>))}</SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card className={`transition-opacity ${mode !== 'scale' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
        <CardHeader><CardTitle>Scale</CardTitle></CardHeader>
        <CardContent>
          <Select onValueChange={onScaleChange} value={selectedScale} disabled={mode !== 'scale'}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Scale" /></SelectTrigger>
            <SelectContent>{Object.entries(SCALES as ScalesData).map(([key, scale]) => (<SelectItem key={key} value={key}>{scale.name}</SelectItem>))}</SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card className={`transition-opacity ${mode !== 'chord' ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
        <CardHeader><CardTitle>Chord</CardTitle></CardHeader>
        <CardContent>
          <Select onValueChange={onChordChange} value={selectedChordKey} disabled={mode !== 'chord'}>
            <SelectTrigger className="w-full"><SelectValue placeholder="Select Chord" /></SelectTrigger>
            <SelectContent>
              {Object.entries(CHORDS as ChordsData).map(([key, chordDef]) => (
                <SelectItem key={key} value={key}>
                  {getChordDisplayLabel(key, chordDef)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
};

export default Controls;
