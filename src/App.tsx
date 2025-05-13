import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  NoteValue, Mode, ColorThemeOption, ThemeMode, PickData, IdentifiedChord, PotentialChordSuggestion,
  ScalesData, ChordsData
} from './types';
import { NOTES, SCALES, CHORDS, STANDARD_TUNING, NUM_FRETS } from './constants';
import { getNotesInKey, findMatchingChordsVoicing, findPotentialChordsUpdated, getNoteDetailsAtFret } from './utils/chordFinder';

import AppHeader from './components/AppHeader';
import ModeSelection from './components/ModeSelection';
import Controls from './components/Controls';
import ColorThemeToggle from './components/ColorThemeToggle';
import SelectionInfo from './components/SelectionInfo';
import Fretboard from './components/Fretboard';
import PickModeAnalysis from './components/PickModeAnalysis';
import AppFooter from './components/AppFooter';

const App: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- State Declarations ---
  const [mode, setInternalMode] = useState<Mode>(() => (searchParams.get('mode') as Mode) || 'scale');
  const [selectedKey, setInternalSelectedKey] = useState<NoteValue>(() => {
    const keyParam = searchParams.get('key') as NoteValue | null;
    return (keyParam && NOTES.includes(keyParam)) ? keyParam : 'A';
  });
  const [selectedScale, setInternalSelectedScale] = useState<string>(() => searchParams.get('scale') || 'major');
  const [selectedChordKey, setInternalSelectedChordKey] = useState<string>(() => searchParams.get('chord') || '');
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

  const [colorTheme, setColorTheme] = useState<ColorThemeOption>('standard');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    return (storedTheme === 'light' || storedTheme === 'dark') ? storedTheme : 'light';
  });

  const [identifiedChords, setIdentifiedChords] = useState<IdentifiedChord[]>([]);
  const [potentialChords, setPotentialChords] = useState<PotentialChordSuggestion[]>([]);
  const [suggestedNotesForDisplay, setSuggestedNotesForDisplay] = useState<readonly NoteValue[]>([]);
  
  // Flag to prevent initial URL sync from overriding valid URL params
  const [isInitialLoad, setIsInitialLoad] = useState(true);


  // --- URL to State Synchronization (on load and back/forward navigation) ---
  useEffect(() => {
    const modeParam = searchParams.get('mode') as Mode | null;
    const keyParam = searchParams.get('key') as NoteValue | null;
    const scaleParam = searchParams.get('scale');
    const chordParam = searchParams.get('chord');
    const picksParam = searchParams.get('picks');

    const newMode = modeParam || 'scale';
    if (mode !== newMode) setInternalMode(newMode);

    const newKey = (keyParam && NOTES.includes(keyParam)) ? keyParam : 'A';
    if (selectedKey !== newKey) setInternalSelectedKey(newKey);

    if (newMode === 'scale') {
      const newScale = (scaleParam && SCALES[scaleParam as keyof ScalesData]) ? scaleParam : 'major';
      if (selectedScale !== newScale) setInternalSelectedScale(newScale);
      if (selectedChordKey !== '') setInternalSelectedChordKey('');
      if (selectedPicks.length > 0) setInternalSelectedPicks([]);
    } else if (newMode === 'chord') {
      const newChord = (chordParam && CHORDS[chordParam as keyof ChordsData]) ? chordParam : 'major';
      if (selectedChordKey !== newChord) setInternalSelectedChordKey(newChord);
      if (selectedScale !== '') setInternalSelectedScale('');
      if (selectedPicks.length > 0) setInternalSelectedPicks([]);
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
      // Compare stringified versions to avoid issues with array reference equality
      if (JSON.stringify(selectedPicks) !== JSON.stringify(newPicksFromUrl)) {
        setInternalSelectedPicks(newPicksFromUrl);
      }
      if (selectedScale !== '') setInternalSelectedScale('');
      if (selectedChordKey !== '') setInternalSelectedChordKey('');
    }
    setIsInitialLoad(false); // Mark initial load as complete
  }, [searchParams]); // Only run when searchParams change (e.g. back/forward, initial load)

  // --- State to URL Synchronization ---
  useEffect(() => {
    if (isInitialLoad) return; // Don't sync state to URL on the very first render cycle if URL has params

    const newParams = new URLSearchParams();
    newParams.set('mode', mode);

    if (mode === 'scale') {
      newParams.set('key', selectedKey);
      if (selectedScale) newParams.set('scale', selectedScale);
    } else if (mode === 'chord') {
      newParams.set('key', selectedKey);
      if (selectedChordKey) newParams.set('chord', selectedChordKey);
    } else if (mode === 'pick') {
      if (selectedPicks.length > 0) {
        const serializedPicks = selectedPicks.map(p => `${p.stringIndex}-${p.fretIndex}`).join('_');
        newParams.set('picks', serializedPicks);
      }
    }

    // Only update URL if it's different, to prevent loops and unnecessary history entries
    // Note: searchParams from useSearchParams is an instance that might change reference even if content is same.
    // So, comparing strings is more reliable.
    if (newParams.toString() !== searchParams.toString()) {
        setSearchParams(newParams, { replace: true });
    }
  }, [isInitialLoad, mode, selectedKey, selectedScale, selectedChordKey, selectedPicks, setSearchParams, searchParams]);


  // --- Dark Mode ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', themeMode === 'dark');
      localStorage.setItem('theme', themeMode);
    }
  }, [themeMode]);

  const toggleThemeMode = () => setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));

  // --- Mode Change Handler (from ModeSelection component) ---
  const handleModeChange = useCallback((newMode: Mode) => {
    setInternalMode(newMode);
    // Apply defaults for the new mode
    if (newMode === 'scale') {
      if (!selectedScale || !SCALES[selectedScale as keyof ScalesData]) {
        setInternalSelectedScale('major');
      }
      setInternalSelectedChordKey('');
      setInternalSelectedPicks([]);
    } else if (newMode === 'chord') {
      if (!selectedChordKey || !CHORDS[selectedChordKey as keyof ChordsData]) {
          setInternalSelectedChordKey('major');
      }
      setInternalSelectedScale('');
      setInternalSelectedPicks([]);
    } else if (newMode === 'pick') {
      setInternalSelectedScale('');
      setInternalSelectedChordKey('');
      // selectedPicks remain as they are or get cleared by user
    }
  }, [selectedScale, selectedChordKey]);

  // --- Derived State & Computations ---
  const currentModeNotes = useMemo(() => { /* ... as before ... */
    if (!selectedKey || !NOTES.includes(selectedKey)) return [];
    if (mode === 'scale' && selectedScale && SCALES[selectedScale as keyof ScalesData]) {
      return getNotesInKey(selectedKey, SCALES[selectedScale as keyof ScalesData].intervals);
    } else if (mode === 'chord' && selectedChordKey && CHORDS[selectedChordKey as keyof ChordsData]) {
      const intervalsMod12 = CHORDS[selectedChordKey as keyof ChordsData].intervals.map(i => i % 12);
      return getNotesInKey(selectedKey, intervalsMod12);
    }
    return [];
  }, [selectedKey, selectedScale, selectedChordKey, mode]);

  const currentSelectionName = useMemo(() => { /* ... as before ... */
    const currentKeyDisplay = selectedKey && NOTES.includes(selectedKey) ? selectedKey : 'A';
    if (mode === 'scale' && selectedScale && SCALES[selectedScale as keyof ScalesData]) return `${currentKeyDisplay} ${SCALES[selectedScale as keyof ScalesData].name}`;
    if (mode === 'chord' && selectedChordKey && CHORDS[selectedChordKey as keyof ChordsData]) return `${currentKeyDisplay} ${CHORDS[selectedChordKey as keyof ChordsData].name}`;
    if (mode === 'pick') {
      const chordsText = identifiedChords.map(c => c.name).join(' / ');
      return `Pick Mode Active ${chordsText ? `- ${chordsText}` : ''}`;
    }
    return 'Select Mode/Key/Scale/Chord';
  }, [selectedKey, selectedScale, selectedChordKey, mode, identifiedChords]);
  
  const identifiedChordsQuality = useMemo(() => { /* ... as before ... */
    if (mode === 'pick' && identifiedChords.length > 0) {
        return identifiedChords[0].quality;
    }
    return null;
  }, [mode, identifiedChords]);

  const pickedUniqueNotes = useMemo(() => { /* ... as before ... */
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

  // --- Event Handlers ---
  const handleKeyChange = (value: string) => {
    if (NOTES.includes(value as NoteValue)) setInternalSelectedKey(value as NoteValue);
  };
  
  const handleScaleChange = (value: string) => {
    if (SCALES[value as keyof ScalesData]) {
      setInternalMode('scale'); // Ensure mode is scale
      setInternalSelectedScale(value);
      setInternalSelectedChordKey(''); // Clear chord
      setInternalSelectedPicks([]);    // Clear picks
    }
  };
  
  const handleChordChange = (value: string) => {
    if (CHORDS[value as keyof ChordsData]) {
      setInternalMode('chord'); // Ensure mode is chord
      setInternalSelectedChordKey(value);
      setInternalSelectedScale('');   // Clear scale
      setInternalSelectedPicks([]);   // Clear picks
    }
  };

  const handleThemeToggle = (isChecked: boolean) => setColorTheme(isChecked ? 'uniqueNotes' : 'standard');
  const handleClearPicks = () => setInternalSelectedPicks([]);

  const handleFretClick = useCallback((pickDataWithDetails: PickData) => {
    if (mode !== 'pick') return;
    setInternalSelectedPicks(prevPicks => {
      const existingPickIndex = prevPicks.findIndex(p => p.stringIndex === pickDataWithDetails.stringIndex && p.fretIndex === pickDataWithDetails.fretIndex);
      if (existingPickIndex > -1) {
        return prevPicks.filter((_, index) => index !== existingPickIndex);
      } else {
        return [...prevPicks, pickDataWithDetails];
      }
    });
  }, [mode]);

  // --- Pick Mode Analysis Effect ---
  useEffect(() => {
    if (mode === 'pick') {
      const currentChordsObjects = findMatchingChordsVoicing(selectedPicks);
      const currentChordsNamesSet = new Set(currentChordsObjects.map(c => c.name));
      setIdentifiedChords(currentChordsObjects);
      const currentUniqueNoteNames = [...new Set(selectedPicks.map(p => p.note))];
      const potential = findPotentialChordsUpdated(currentUniqueNoteNames, currentChordsNamesSet);
      setPotentialChords(potential);
      setSuggestedNotesForDisplay([...new Set(potential.map(s => s.noteToAdd))]);
    } else {
      setIdentifiedChords([]);
      setPotentialChords([]);
      setSuggestedNotesForDisplay([]);
    }
  }, [selectedPicks, mode]);

  const highlightedNotesForFretboard = useMemo(() => { /* ... as before ... */
    if (mode === 'pick') {
      if (selectedPicks.length <= 1) return NOTES;
      return [];
    }
    return currentModeNotes;
  }, [mode, selectedPicks.length, currentModeNotes]);

  // --- Render ---
  return (
    <div className="container mx-auto p-4 font-sans text-gray-900 dark:text-gray-100 min-h-screen">
      <AppHeader themeMode={themeMode} toggleThemeMode={toggleThemeMode} />
      <ModeSelection currentMode={mode} onSetMode={handleModeChange} />
      <Controls
        mode={mode}
        selectedKey={selectedKey}
        onKeyChange={handleKeyChange}
        selectedScale={selectedScale}
        onScaleChange={handleScaleChange}
        selectedChordKey={selectedChordKey}
        onChordChange={handleChordChange}
      />
      <ColorThemeToggle colorTheme={colorTheme} onThemeToggle={handleThemeToggle} mode={mode} />
      <SelectionInfo
        mode={mode}
        currentSelectionName={currentSelectionName}
        pickedUniqueNotes={pickedUniqueNotes}
        currentModeNotes={currentModeNotes}
        selectedChordKey={selectedChordKey}
        colorTheme={colorTheme}
        identifiedChordsQuality={identifiedChordsQuality}
      />
      <Fretboard
        tuning={STANDARD_TUNING}
        numFrets={NUM_FRETS}
        highlightedNotes={highlightedNotesForFretboard}
        rootNote={mode === 'pick' ? null : selectedKey}
        selectedPicks={selectedPicks}
        selectedPicksCount={selectedPicks.length}
        mode={mode}
        colorTheme={mode === 'pick' ? 'uniqueNotes' : colorTheme}
        onFretClick={handleFretClick}
        suggestedNotesForDisplay={selectedPicks.length > 1 ? suggestedNotesForDisplay : []}
      />
      {mode === 'pick' && (
        <PickModeAnalysis
          selectedPicks={selectedPicks}
          potentialChords={potentialChords}
          onClearPicks={handleClearPicks}
        />
      )}
      <AppFooter />
    </div>
  );
};

export default App;
