// src/components/Controls.tsx
import React from 'react'; // Removed useState as showModeHelp is removed
// import { HelpCircle } from 'lucide-react'; // HelpCircle removed
import { Card, CardHeader, CardTitle, CardContent, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Switch, Button } from './ui';
import { NoteValue, Mode, ScalesData, ChordsData } from '../types';
import { NOTES, SCALES, CHORDS, MODE_NAMES_ORDERED } from '../constants';

interface ControlsProps {
  mode: Mode;
  selectedKey: NoteValue;
  onKeyChange: (value: NoteValue) => void;
  selectedScaleKey: string;
  onScaleChange: (value: string) => void;
  selectedChordKey: string;
  onChordChange: (value: string) => void;
  showParentScaleOverlay: boolean;
  onShowParentScaleOverlayChange: (value: boolean) => void;
  showIntervalIndicators: boolean;
  onShowIntervalIndicatorsChange: (value: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
  mode, selectedKey, onKeyChange, selectedScaleKey, onScaleChange, selectedChordKey, onChordChange,
  showParentScaleOverlay, onShowParentScaleOverlayChange,
  showIntervalIndicators, onShowIntervalIndicatorsChange
}) => {
  // const [showModeHelp, setShowModeHelp] = useState(false); // Removed

  if (mode === 'pick') return null;

  const getChordDisplayLabel = (key: string, chordDef: typeof CHORDS[keyof typeof CHORDS]): string => {
    return chordDef.name || chordDef.quality.split(',')[0] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  const commonScales = ['major', 'minorNatural'];
  const modeKeys = MODE_NAMES_ORDERED;

  const currentScaleDef = SCALES[selectedScaleKey];

  return (
    <>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scale</CardTitle>
            {/* HelpCircle button removed */}
          </CardHeader>
          <CardContent>
            <Select onValueChange={onScaleChange} value={selectedScaleKey} disabled={mode !== 'scale'}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Scale" /></SelectTrigger>
              <SelectContent>
                <optgroup label="Common Scales">
                  {commonScales.map(key => {
                    const scale = SCALES[key];
                    return (
                      <SelectItem 
                        key={key} 
                        value={key}
                        title={scale.formula && scale.descriptor ? `${scale.name}: ${scale.formula} - ${scale.descriptor}`: scale.name}
                      >
                        {scale.name}
                      </SelectItem>
                    );
                  })}
                </optgroup>
                <optgroup label="Modes">
                  {modeKeys.map((key) => {
                    const scale = SCALES[key as keyof ScalesData];
                    if (!scale) return null;
                    const displayPrefix = key === 'ionian' ? 'Major: ' : (key === 'aeolian' ? 'Minor: ' : '');
                    return (
                      <SelectItem 
                        key={key} 
                        value={key}
                        title={`${scale.name}: ${scale.formula} - ${scale.descriptor}`}
                      >
                        {displayPrefix}{scale.name}
                      </SelectItem>
                    );
                  })}
                </optgroup>
              </SelectContent>
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

      {mode === 'scale' && currentScaleDef?.isMode && (
        // Removed border and specific background from this div
        <div className="mb-6 p-4 flex flex-col md:flex-row justify-around items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-parent-scale"
              checked={showParentScaleOverlay}
              onCheckedChange={onShowParentScaleOverlayChange}
            />
            <Label htmlFor="show-parent-scale">Show Parent Scale Overlay</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-interval-indicators"
              checked={showIntervalIndicators}
              onCheckedChange={onShowIntervalIndicatorsChange}
            />
            <Label htmlFor="show-interval-indicators">Show Interval Labels</Label>
          </div>
        </div>
      )}
      
      {/* Mode Help Panel Removed */}
    </>
  );
};

export default Controls;
