import React from 'react';
import { Trash2, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from './ui';
import NoteDisplay from './NoteDisplay';
import { PickData, PotentialChordSuggestion } from '../types';

interface PickModeAnalysisProps {
  selectedPicks: PickData[];
  potentialChords: PotentialChordSuggestion[];
  onClearPicks: () => void;
}

const PickModeAnalysis: React.FC<PickModeAnalysisProps> = ({ selectedPicks, potentialChords, onClearPicks }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pick Mode Analysis</span>
          <Button variant="outline" size="sm" onClick={onClearPicks} disabled={selectedPicks.length === 0}>
            <Trash2 className="w-4 h-4 mr-1" /> Clear Picks
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Selected Frets (Pitch):</h4>
          {selectedPicks.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {[...selectedPicks].sort((a, b) => a.absolutePitch - b.absolutePitch).map((pick) => (
                <Badge key={`pick-${pick.stringIndex}-${pick.fretIndex}-${pick.absolutePitch}`} variant="secondary" className="text-xs">
                  {`S${pick.stringIndex + 1}-F${pick.fretIndex} (${pick.note}${Math.floor(pick.absolutePitch / 12) - 1})`}
                </Badge>
              ))}
            </div>
          ) : (<p className="text-sm text-gray-500 dark:text-gray-400 italic">Click frets on the board above to select notes.</p>)}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center">
            <PlusCircle className="w-4 h-4 mr-1.5 text-blue-500" /> Potential Chords (Add One Note):
          </h4>
          {potentialChords.length > 0 ? (
            <div className="space-y-2">
              {potentialChords.map((suggestion, index) => (
                <div key={`suggestion-${suggestion.noteToAdd}-${index}`} className="text-sm flex items-center flex-wrap">
                  <span className="font-semibold mr-2">Add</span>
                  <NoteDisplay note={suggestion.noteToAdd} />
                  <span className="font-semibold ml-1 mr-2">to make:</span>
                  <span className="inline-flex flex-wrap gap-1">
                    {suggestion.resultingChords.map((chordName, chordIndex) => (
                      <Badge
                        key={`${chordName}-${chordIndex}`}
                        variant="secondary"
                        className="text-xs"
                      >
                        {String(chordName)}
                      </Badge>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {selectedPicks.length >= 1 ? "No potential chords found by adding one more note." : "Select at least 1 note to see suggestions."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PickModeAnalysis;
