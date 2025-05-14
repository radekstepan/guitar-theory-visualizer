import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  NoteValue, Mode, ColorThemeOption, ThemeMode, PickData, IdentifiedChord, PotentialChordSuggestion,
  ScalesData, ChordsData
} from './types';
import { NOTES, SCALES, CHORDS, STANDARD_TUNING, NUM_FRETS } from './constants';
import { 
  getNoteDetailsAtFret, 
  findMatchingChordsVoicing, 
  findPotentialChordsUpdated,
  getNotesForScale,
  getNotesForChord
} from './utils/chordFinder';

import AppHeader from './components/AppHeader';
import ModeSelection from './components/ModeSelection';
import Controls from './components/Controls';
import SelectionInfo from './components/SelectionInfo';
import Fretboard from './components/Fretboard';
import PickModeAnalysis from './components/PickModeAnalysis';

const App: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [mode, setInternalMode] = useState<Mode>(() => {
    const modeParam = searchParams.get('mode') as Mode | null;
    return modeParam || 'scale';
  });

  const [selectedKey, setInternalSelectedKey] = useState<NoteValue>(() => {
    const keyParam = searchParams.get('key')?.trim() as NoteValue | null;
    return (keyParam && NOTES.includes(keyParam)) ? keyParam : 'A';
  });

  const [selectedScale, setInternalSelectedScale] = useState<string>(() => {
    const scaleParam = searchParams.get('scale')?.trim();
    return (scaleParam && SCALES[scaleParam as keyof ScalesData]) ? scaleParam : 'major';
  });

  const [selectedChordKey, setInternalSelectedChordKey] = useState<string>(() => {
    const chordParam = searchParams.get('chord')?.trim();
    const currentMode = searchParams.get('mode') as Mode | null;
    if (currentMode === 'chord') {
      return (chordParam && CHORDS[chordParam as keyof ChordsData]) ? chordParam : 'major';
    }
    return (chordParam && CHORDS[chordParam as keyof ChordsData]) ? chordParam : '';
  });
  
  const [selectedPicks, setInternalSelectedPicks] = useState<PickData[]>(() => {
    const picksParam = searchParams.get('picks'); 
    const initialPicks: PickData[] = [];
    if (picksParam) {
      picksParam.split('_').forEach(pairStr => {
        const parts = pairStr.split('-');
        if (parts.length === 2) {
          const sIdx = parseInt(parts[0], 10);
          const fIdx = parseInt(parts[1], 10);
          if (!isNaN(sIdx) && !isNaN(fIdx)) {
            const noteDetails = getNoteDetailsAtFret(sIdx, fIdx);
            if (noteDetails) initialPicks.push({ ...noteDetails, stringIndex: sIdx, fretIndex: fIdx });
          }
        }
      });
    }
    return initialPicks;
  });

  const [colorTheme, setColorTheme] = useState<ColorThemeOption>('uniqueNotes'); 
  
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    return (storedTheme === 'light' || storedTheme === 'dark') ? storedTheme : 'light';
  });

  const [identifiedChords, setIdentifiedChords] = useState<IdentifiedChord[]>([]);
  const [potentialChords, setPotentialChords] = useState<PotentialChordSuggestion[]>([]);
  const [suggestedNotesForDisplay, setSuggestedNotesForDisplay] = useState<readonly NoteValue[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const modeParam = searchParams.get('mode') as Mode | null;
    const keyParam = searchParams.get('key')?.trim() as NoteValue | null; 
    const scaleParam = searchParams.get('scale')?.trim(); 
    const chordParam = searchParams.get('chord')?.trim(); 
    const picksParam = searchParams.get('picks');

    const newMode = modeParam || 'scale';
    if (mode !== newMode) setInternalMode(newMode);

    const newKey = (keyParam && NOTES.includes(keyParam)) ? keyParam : 'A';
    if (selectedKey !== newKey) setInternalSelectedKey(newKey);

    if (newMode === 'scale') {
      const newScale = (scaleParam && SCALES[scaleParam as keyof ScalesData]) ? scaleParam : 'major';
      if (selectedScale !== newScale) setInternalSelectedScale(newScale);
    } else if (newMode === 'chord') {
      const defaultChord = 'major'; 
      const newChord = (chordParam && CHORDS[chordParam as keyof ChordsData]) ? chordParam : defaultChord;
      if (selectedChordKey !== newChord) setInternalSelectedChordKey(newChord);
    } else if (newMode === 'pick') {
      const newPicksFromUrl: PickData[] = [];
      if (picksParam) {
        picksParam.split('_').forEach(pairStr => {
          const parts = pairStr.split('-');
          if (parts.length === 2) {
            const sIdx = parseInt(parts[0], 10);
            const fIdx = parseInt(parts[1], 10);
            if (!isNaN(sIdx) && !isNaN(fIdx)) {
              const noteDetails = getNoteDetailsAtFret(sIdx, fIdx);
              if (noteDetails) newPicksFromUrl.push({ ...noteDetails, stringIndex: sIdx, fretIndex: fIdx });
            }
          }
        });
      }
      const currentPicksString = selectedPicks.map(p => `${p.stringIndex}-${p.fretIndex}`).sort().join('_');
      const urlPicksString = newPicksFromUrl.map(p => `${p.stringIndex}-${p.fretIndex}`).sort().join('_');
      if (currentPicksString !== urlPicksString) setInternalSelectedPicks(newPicksFromUrl);
    }
    setIsInitialLoad(false); 
  }, [searchParams]); 

  useEffect(() => {
    if (isInitialLoad) return; 
    const newParams = new URLSearchParams();
    newParams.set('mode', mode);
    if (mode === 'scale') {
      newParams.set('key', selectedKey);
      if (selectedScale) newParams.set('scale', selectedScale);
    } else if (mode === 'chord') {
      newParams.set('key', selectedKey);
      if (selectedChordKey && CHORDS[selectedChordKey.trim() as keyof ChordsData]) { 
        newParams.set('chord', selectedChordKey.trim());
      } else if (CHORDS['major']) { 
        newParams.set('chord', 'major');
      }
    } else if (mode === 'pick') {
      if (selectedPicks.length > 0) {
        const serializedPicks = selectedPicks.map(p => `${p.stringIndex}-${p.fretIndex}`).sort().join('_');
        newParams.set('picks', serializedPicks);
      } else {
        newParams.delete('picks');
      }
    }

    const currentParamsString = searchParams.toString();
    const newParamsString = newParams.toString();
    if (newParamsString !== currentParamsString) {
        setSearchParams(newParams, { replace: true });
    }
  }, [isInitialLoad, mode, selectedKey, selectedScale, selectedChordKey, selectedPicks, setSearchParams, searchParams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', themeMode === 'dark');
      localStorage.setItem('theme', themeMode);
    }
  }, [themeMode]);

  const toggleThemeMode = () => setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  
  const handleColorThemeChange = (newTheme: ColorThemeOption) => {
    if (mode !== 'pick') { 
      setColorTheme(newTheme);
    }
  };

  const handleModeChange = useCallback((newMode: Mode) => {
    const prevMode = mode;
    setInternalMode(newMode);
    if (newMode === 'scale') {
      if (!selectedScale || !SCALES[selectedScale as keyof ScalesData]) {
        setInternalSelectedScale('major');
      }
      if (prevMode === 'pick') setInternalSelectedPicks([]);
    } else if (newMode === 'chord') {
      if (!selectedChordKey.trim() || !CHORDS[selectedChordKey.trim() as keyof ChordsData]) {
          setInternalSelectedChordKey('major');
      }
      if (prevMode === 'pick') setInternalSelectedPicks([]);
    }
  }, [mode, selectedScale, selectedChordKey]);

  const currentModeNotes: readonly NoteValue[] = useMemo(() => {
    const cleanSelectedChordKey = selectedChordKey.trim();
    if (!selectedKey || !NOTES.includes(selectedKey)) return [];
    if (mode === 'scale' && selectedScale && SCALES[selectedScale as keyof ScalesData]) {
      const scaleTonalName = SCALES[selectedScale as keyof ScalesData].name;
      return getNotesForScale(selectedKey, scaleTonalName);
    } else if (mode === 'chord' && cleanSelectedChordKey && CHORDS[cleanSelectedChordKey as keyof ChordsData]) {
      return getNotesForChord(selectedKey, cleanSelectedChordKey); 
    }
    return [];
  }, [selectedKey, selectedScale, selectedChordKey, mode]);

  const currentSelectionName = useMemo(() => {
    const currentKeyDisplay = selectedKey && NOTES.includes(selectedKey) ? selectedKey : 'A';
    const cleanSelectedChordKey = selectedChordKey.trim();

    if (mode === 'scale' && selectedScale && SCALES[selectedScale as keyof ScalesData]) {
      const displayScaleName = SCALES[selectedScale as keyof ScalesData].name;
      return `${currentKeyDisplay} ${displayScaleName.charAt(0).toUpperCase() + displayScaleName.slice(1)}`;
    }
    if (mode === 'chord' && cleanSelectedChordKey && CHORDS[cleanSelectedChordKey as keyof ChordsData]) {
      const chordData = CHORDS[cleanSelectedChordKey as keyof ChordsData];
      return `${currentKeyDisplay}${chordData.name}`; 
    }
    if (mode === 'pick') {
      const chordsText = identifiedChords.map(c => c.name).join(' / ');
      return `Pick Mode Active ${chordsText ? `- ${chordsText}` : ''}`;
    }
    return 'Select Mode/Key/Scale/Chord';
  }, [selectedKey, selectedScale, selectedChordKey, mode, identifiedChords]);
  
  const identifiedChordsQuality = useMemo(() => { if (mode === 'pick' && identifiedChords.length > 0) { return identifiedChords[0].quality; } return null; }, [mode, identifiedChords]);
  const pickedUniqueNotes: readonly NoteValue[] = useMemo(() => { const uniqueNotesMap = new Map<NoteValue, PickData>(); selectedPicks.forEach(pick => { if (!uniqueNotesMap.has(pick.note) || pick.absolutePitch < (uniqueNotesMap.get(pick.note) as PickData).absolutePitch) { uniqueNotesMap.set(pick.note, pick); } }); return [...uniqueNotesMap.values()] .sort((a, b) => NOTES.indexOf(a.note) - NOTES.indexOf(b.note)) .map(pick => pick.note); }, [selectedPicks]);
  const handleKeyChange = (value: string) => { const trimmedValue = value.trim() as NoteValue; if (NOTES.includes(trimmedValue)) setInternalSelectedKey(trimmedValue); };
  const handleScaleChange = (value: string) => { const trimmedValue = value.trim(); if (SCALES[trimmedValue as keyof ScalesData]) { setInternalSelectedScale(trimmedValue); } };
  const handleChordChange = (value: string) => { const trimmedValue = value.trim(); if (CHORDS[trimmedValue as keyof ChordsData]) { setInternalSelectedChordKey(trimmedValue); } };
  
  const handleClearPicks = () => setInternalSelectedPicks([]);
  const handleFretClick = useCallback((pickDataWithDetails: PickData) => { if (mode !== 'pick') return; setInternalSelectedPicks(prevPicks => { const existingPickIndex = prevPicks.findIndex(p => p.stringIndex === pickDataWithDetails.stringIndex && p.fretIndex === pickDataWithDetails.fretIndex); if (existingPickIndex > -1) { return prevPicks.filter((_, index) => index !== existingPickIndex); } else { return [...prevPicks, pickDataWithDetails]; } }); }, [mode]);
  
  useEffect(() => { if (mode === 'pick') { const currentChordsObjects = findMatchingChordsVoicing(selectedPicks); const currentChordsNamesSet = new Set(currentChordsObjects.map(c => c.name)); setIdentifiedChords(currentChordsObjects); const potential = findPotentialChordsUpdated(pickedUniqueNotes, currentChordsNamesSet); setPotentialChords(potential); setSuggestedNotesForDisplay([...new Set(potential.map(s => s.noteToAdd))]); } else { setIdentifiedChords([]); setPotentialChords([]); setSuggestedNotesForDisplay([]); } }, [selectedPicks, mode, pickedUniqueNotes]);
  
  const highlightedNotesForFretboard = useMemo(() => { if (mode === 'pick') { if (selectedPicks.length <= 1) return NOTES; return []; } return currentModeNotes; }, [mode, selectedPicks.length, currentModeNotes]);

  const effectiveColorTheme = useMemo(() => {
    return mode === 'pick' ? 'uniqueNotes' : colorTheme;
  }, [mode, colorTheme]);

  return (
    <div className="container mx-auto p-4 font-sans text-gray-900 dark:text-gray-100 min-h-screen">
      <AppHeader 
        themeMode={themeMode} 
        toggleThemeMode={toggleThemeMode}
        colorTheme={colorTheme} 
        onColorThemeChange={handleColorThemeChange} 
        currentAppMode={mode} 
      />
      <ModeSelection currentMode={mode} onSetMode={handleModeChange} />
      <Controls
        mode={mode}
        selectedKey={selectedKey}
        onKeyChange={handleKeyChange}
        selectedScale={selectedScale}
        onScaleChange={handleScaleChange}
        selectedChordKey={selectedChordKey.trim()}
        onChordChange={handleChordChange}
      />
      <SelectionInfo
        mode={mode}
        currentSelectionName={currentSelectionName}
        pickedUniqueNotes={pickedUniqueNotes}
        currentModeNotes={currentModeNotes}
        selectedChordKey={selectedChordKey.trim()}
        colorTheme={effectiveColorTheme} 
        identifiedChordsQuality={identifiedChordsQuality}
      />
      <div className="flex justify-center my-4">
        <Fretboard
          tuning={STANDARD_TUNING}
          numFrets={NUM_FRETS}
          highlightedNotes={highlightedNotesForFretboard}
          rootNote={mode === 'pick' ? null : selectedKey}
          selectedPicks={selectedPicks}
          selectedPicksCount={selectedPicks.length}
          mode={mode}
          colorTheme={effectiveColorTheme} 
          onFretClick={handleFretClick}
          suggestedNotesForDisplay={selectedPicks.length > 1 ? suggestedNotesForDisplay : []}
        />
      </div>
      {mode === 'pick' && (
        <PickModeAnalysis
          selectedPicks={selectedPicks}
          potentialChords={potentialChords}
          onClearPicks={handleClearPicks}
        />
      )}
    </div>
  );
};

export default App;
