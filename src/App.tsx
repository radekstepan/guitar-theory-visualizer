import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  NoteValue, Mode, ColorThemeOption, ThemeMode, PickData, IdentifiedChord, PotentialChordSuggestion,
  ScalesData, ChordsData
} from './types';
import { NOTES, SCALES, CHORDS, STANDARD_TUNING, NUM_FRETS } from './constants';
import { getNotesInKey, findMatchingChordsVoicing, findPotentialChordsUpdated } from './utils/chordFinder';

import AppHeader from './components/AppHeader';
import ModeSelection from './components/ModeSelection';
import Controls from './components/Controls';
import ColorThemeToggle from './components/ColorThemeToggle';
import SelectionInfo from './components/SelectionInfo';
import Fretboard from './components/Fretboard';
import PickModeAnalysis from './components/PickModeAnalysis';
import AppFooter from './components/AppFooter';

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<NoteValue>('A');
  const [selectedScale, setSelectedScale] = useState<string>('major');
  const [selectedChordKey, setSelectedChordKey] = useState<string>('');
  const [mode, setMode] = useState<Mode>('scale');
  const [colorTheme, setColorTheme] = useState<ColorThemeOption>('standard');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
    }
    return 'light';
  });

  const [selectedPicks, setSelectedPicks] = useState<PickData[]>([]); // This can remain mutable as it's actively modified
  const [identifiedChords, setIdentifiedChords] = useState<IdentifiedChord[]>([]); // Mutable
  const [potentialChords, setPotentialChords] = useState<PotentialChordSuggestion[]>([]); // Mutable

  // This state is derived from `potentialChords` which is mutable,
  // but if it's passed to a component expecting readonly, its type should reflect that.
  // For now, if Fretboard expects readonly, this should be readonly.
  const [suggestedNotesForDisplay, setSuggestedNotesForDisplay] = useState<readonly NoteValue[]>([]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (themeMode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('theme', themeMode);
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setAppMode = (newMode: Mode) => {
    setMode(newMode);
    if (newMode !== 'scale') setSelectedScale('');
    if (newMode !== 'chord') setSelectedChordKey('');
    if (newMode !== 'pick') {
      setSelectedPicks([]);
      setIdentifiedChords([]);
      setPotentialChords([]);
      setSuggestedNotesForDisplay([]);
    }
    if (newMode === 'scale' && !selectedScale) setSelectedScale('major');
    if (!selectedKey) setSelectedKey('A');
  };

  // getNotesInKey returns NoteValue[], which is mutable.
  // If SelectionInfo or Fretboard expect readonly, this needs to be cast or its type updated.
  const currentModeNotes: readonly NoteValue[] = useMemo(() => { // <--- Make readonly
    if (!selectedKey || !NOTES.includes(selectedKey)) return [];
    if (mode === 'scale' && selectedScale && SCALES[selectedScale as keyof ScalesData]) {
      return getNotesInKey(selectedKey, SCALES[selectedScale as keyof ScalesData].intervals);
    } else if (mode === 'chord' && selectedChordKey && CHORDS[selectedChordKey as keyof ChordsData]) {
      const intervalsMod12 = CHORDS[selectedChordKey as keyof ChordsData].intervals.map(i => i % 12);
      return getNotesInKey(selectedKey, intervalsMod12);
    }
    return [];
  }, [selectedKey, selectedScale, selectedChordKey, mode]);

  const currentSelectionName = useMemo(() => {
    const currentKeyDisplay = selectedKey && NOTES.includes(selectedKey) ? selectedKey : 'A';
    if (mode === 'scale' && selectedScale && SCALES[selectedScale as keyof ScalesData]) return `${currentKeyDisplay} ${SCALES[selectedScale as keyof ScalesData].name}`;
    if (mode === 'chord' && selectedChordKey && CHORDS[selectedChordKey as keyof ChordsData]) return `${currentKeyDisplay} ${CHORDS[selectedChordKey as keyof ChordsData].name}`;
    if (mode === 'pick') {
      const chordsText = identifiedChords.map(c => c.name).join(' / ');
      return `Pick Mode Active ${chordsText ? `- ${chordsText}` : ''}`;
    }
    return 'Select Mode/Key/Scale/Chord';
  }, [selectedKey, selectedScale, selectedChordKey, mode, identifiedChords]);
  
  const identifiedChordsQuality = useMemo(() => {
    if (mode === 'pick' && identifiedChords.length > 0) {
        return identifiedChords[0].quality;
    }
    return null;
  }, [mode, identifiedChords]);


  const pickedUniqueNotes: readonly NoteValue[] = useMemo(() => { // <--- Make readonly
    const uniqueNotesMap = new Map<NoteValue, PickData>();
    selectedPicks.forEach(pick => {
      if (!uniqueNotesMap.has(pick.note) || pick.absolutePitch < (uniqueNotesMap.get(pick.note) as PickData).absolutePitch) {
        uniqueNotesMap.set(pick.note, pick);
      }
    });
    return [...uniqueNotesMap.values()]
      .sort((a, b) => a.absolutePitch - b.absolutePitch)
      .map(pick => pick.note);
  }, [selectedPicks]);

  const handleKeyChange = (value: string) => { if (value) setSelectedKey(value as NoteValue); };
  const handleScaleChange = (value: string) => {
    if (value) { setSelectedScale(value); setMode('scale'); setSelectedChordKey(''); setSelectedPicks([]); }
    else { setSelectedScale(''); }
  };
  const handleChordChange = (value: string) => {
    if (value) { setSelectedChordKey(value); setMode('chord'); setSelectedScale(''); setSelectedPicks([]); }
    else { setSelectedChordKey(''); }
  };
  const handleThemeToggle = (isChecked: boolean) => { setColorTheme(isChecked ? 'uniqueNotes' : 'standard'); };
  const handleClearPicks = () => { setSelectedPicks([]); };

  const handleFretClick = useCallback((pickDataWithDetails: PickData) => {
    if (mode !== 'pick') return;
    setSelectedPicks(prevPicks => {
      const { stringIndex, fretIndex } = pickDataWithDetails;
      const existingPickIndex = prevPicks.findIndex(p => p.stringIndex === stringIndex && p.fretIndex === fretIndex);
      if (existingPickIndex > -1) {
        return prevPicks.filter((_, index) => index !== existingPickIndex);
      } else {
        return [...prevPicks, pickDataWithDetails];
      }
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'pick') {
      const currentChordsObjects = findMatchingChordsVoicing(selectedPicks);
      const currentChordsNamesSet = new Set(currentChordsObjects.map(c => c.name));
      setIdentifiedChords(currentChordsObjects);

      const currentUniqueNoteNames = [...new Set(selectedPicks.map(p => p.note))];
      const potential = findPotentialChordsUpdated(currentUniqueNoteNames, currentChordsNamesSet);
      setPotentialChords(potential);
      
      // This assignment is okay because map returns a new (mutable) array.
      // If setSuggestedNotesForDisplay expected readonly, this would be fine.
      const notesToSuggest: NoteValue[] = [...new Set(potential.map(s => s.noteToAdd))];
      setSuggestedNotesForDisplay(notesToSuggest); // Assigning NoteValue[] to readonly NoteValue[] is fine
    } else {
      setIdentifiedChords([]);
      setPotentialChords([]);
      setSuggestedNotesForDisplay([]);
    }
  }, [selectedPicks, mode]);

  return (
    <div className="container mx-auto p-4 font-sans text-gray-900 dark:text-gray-100 min-h-screen">
      <AppHeader themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
      <ModeSelection currentMode={mode} onSetMode={setAppMode} />
      <Controls
        mode={mode}
        selectedKey={selectedKey}
        onKeyChange={handleKeyChange}
        selectedScale={selectedScale}
        onScaleChange={handleScaleChange}
        selectedChordKey={selectedChordKey}
        onChordChange={handleChordChange}
      />
      <ColorThemeToggle
        colorTheme={colorTheme}
        onThemeToggle={handleThemeToggle}
        mode={mode}
      />
      <SelectionInfo
        mode={mode}
        currentSelectionName={currentSelectionName}
        pickedUniqueNotes={pickedUniqueNotes} // This is now readonly NoteValue[]
        currentModeNotes={currentModeNotes}   // This is now readonly NoteValue[]
        selectedChordKey={selectedChordKey}
        colorTheme={colorTheme}
        identifiedChordsQuality={identifiedChordsQuality}
      />
      <Fretboard
        tuning={STANDARD_TUNING} // STANDARD_TUNING is readonly, Fretboard prop 'tuning' is now readonly
        numFrets={NUM_FRETS}
        highlightedNotes={currentModeNotes} // currentModeNotes is readonly, Fretboard prop is readonly
        rootNote={mode === 'pick' ? null : selectedKey}
        selectedPicks={selectedPicks} // selectedPicks is mutable, Fretboard prop is readonly. This is fine.
        mode={mode}
        colorTheme={mode === 'pick' ? 'uniqueNotes' : colorTheme}
        onFretClick={handleFretClick}
        suggestedNotesForDisplay={suggestedNotesForDisplay} // suggestedNotesForDisplay is readonly, Fretboard prop is readonly
      />
      {mode === 'pick' && (
        <PickModeAnalysis
          selectedPicks={selectedPicks} // selectedPicks is mutable, PickModeAnalysis prop can be mutable or readonly
          potentialChords={potentialChords} // potentialChords is mutable, PickModeAnalysis prop can be mutable or readonly
          onClearPicks={handleClearPicks}
        />
      )}
      <AppFooter />
    </div>
  );
};

export default App;
