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
  const hasSelectedPicks = selectedPicks.length > 0;
  const hasPotentialChords = potentialChords.length > 0;

  // If there are no selected picks, hide the entire analysis section.
  // (If selectedPicks is empty, potentialChords will also be empty based on current findPotentialChordsUpdated logic)
  if (!hasSelectedPicks) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pick Mode Analysis</span>
          {/* "Clear Picks" button is always relevant if the card is shown, 
              its disabled state is handled by hasSelectedPicks which is true here */}
          <Button variant="outline" size="sm" onClick={onClearPicks}>
            <Trash2 className="w-4 h-4 mr-1" /> Clear Picks
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* "Selected Frets" section is always shown if hasSelectedPicks is true */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Selected Frets (Pitch):</h4>
          <div className="flex flex-wrap gap-2">
            {[...selectedPicks].sort((a, b) => a.absolutePitch - b.absolutePitch).map((pick) => (
              <Badge key={`pick-${pick.stringIndex}-${pick.fretIndex}-${pick.absolutePitch}`} variant="secondary" className="text-xs">
                {`S${pick.stringIndex + 1}-F${pick.fretIndex} (${pick.note}${Math.floor(pick.absolutePitch / 12) - 1})`}
              </Badge>
            ))}
          </div>
        </div>

        {/* "Potential Chords" section */}
        <div className={`pt-4 ${hasSelectedPicks ? 'border-t border-gray-200 dark:border-gray-700' : ''}`}>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center">
            <PlusCircle className="w-4 h-4 mr-1.5 text-blue-500" /> Potential Chords (Add One Note):
          </h4>
          {hasPotentialChords ? (
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
            // This message is shown when selectedPicks > 0 but no potentialChords are found
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {selectedPicks.length >= 2 ? "No potential chords found by adding one more note to the current selection." :
               selectedPicks.length === 1 ? "Select at least one more note to see more suggestions or identify a chord." :
               "" /* This case should ideally not be reached if !hasSelectedPicks returns null earlier */}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PickModeAnalysis;
