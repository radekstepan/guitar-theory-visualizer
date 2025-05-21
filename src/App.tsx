// src/App.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
// import { Note } from 'tonal'; // Not directly used here, but used in constants.ts helpers

import {
  NoteValue, Mode, ColorThemeOption, ThemeMode, PickData, IdentifiedChord, PotentialChordSuggestion,
  ScalesData, ChordsData, ScaleDefinition
} from './types';
import { 
  NOTES, SCALES, CHORDS, STANDARD_TUNING, NUM_FRETS, 
  getParentMajorRoot // Removed getRelativeModes as it's used in SelectionInfo directly
} from './constants';
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

  // Core state
  const [mode, setInternalMode] = useState<Mode>(() => (searchParams.get('mode') as Mode | null) || 'scale');
  const [selectedKey, setInternalSelectedKey] = useState<NoteValue>(() => {
    const keyParam = searchParams.get('key')?.trim() as NoteValue | null;
    return (keyParam && NOTES.includes(keyParam)) ? keyParam : 'C';
  });
  const [selectedScaleKey, setInternalSelectedScaleKey] = useState<string>(() => {
    const scaleParam = searchParams.get('scale')?.trim();
    return (scaleParam && SCALES[scaleParam as keyof ScalesData]) ? scaleParam : 'ionian';
  });
  const [selectedChordKey, setInternalSelectedChordKey] = useState<string>(() => {
    const chordParam = searchParams.get('chord')?.trim();
    return (chordParam && CHORDS[chordParam as keyof ChordsData]) ? chordParam : 'major';
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

  // UI/Display State
  const [colorTheme, setColorTheme] = useState<ColorThemeOption>('uniqueNotes');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => (localStorage.getItem('theme') as ThemeMode | null) || 'light');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Mode specific state
  const [showParentScaleOverlay, setShowParentScaleOverlay] = useState<boolean>(false);
  const [showIntervalIndicators, setShowIntervalIndicators] = useState<boolean>(false);
  
  // Derived state for modes
  const currentScaleDefinition = useMemo(() => SCALES[selectedScaleKey] as ScaleDefinition | undefined, [selectedScaleKey]);
  
  const parentMajorRoot = useMemo(() => {
    if (mode === 'scale' && currentScaleDefinition?.isMode && selectedKey) {
      return getParentMajorRoot(selectedKey, selectedScaleKey);
    }
    return null;
  }, [mode, selectedKey, selectedScaleKey, currentScaleDefinition]);

  const parentScaleNotes = useMemo(() => {
    if (parentMajorRoot) {
      return getNotesForScale(parentMajorRoot, "major");
    }
    return [];
  }, [parentMajorRoot]);

  // Pick mode logic (moved up for correct declaration order)
  const [identifiedChords, setIdentifiedChords] = useState<IdentifiedChord[]>([]);
  const [potentialChords, setPotentialChords] = useState<PotentialChordSuggestion[]>([]);
  const [suggestedNotesForDisplay, setSuggestedNotesForDisplay] = useState<readonly NoteValue[]>([]);
  const pickedUniqueNotes: readonly NoteValue[] = useMemo(() => {
      const uniqueNotesMap = new Map<NoteValue, PickData>(); 
      selectedPicks.forEach(pick => { 
          if (!uniqueNotesMap.has(pick.note) || pick.absolutePitch < (uniqueNotesMap.get(pick.note) as PickData).absolutePitch) { 
              uniqueNotesMap.set(pick.note, pick); 
          } 
      }); 
      return [...uniqueNotesMap.values()]
          .sort((a, b) => NOTES.indexOf(a.note) - NOTES.indexOf(b.note))
          .map(pick => pick.note); 
  }, [selectedPicks]);

  useEffect(() => { 
    if (mode === 'pick') { 
      const currentChordsObjects = findMatchingChordsVoicing(selectedPicks); 
      const currentChordsNamesSet = new Set(currentChordsObjects.map(c => c.name)); 
      setIdentifiedChords(currentChordsObjects); 
      const potential = findPotentialChordsUpdated(pickedUniqueNotes, currentChordsNamesSet); 
      setPotentialChords(potential); 
      setSuggestedNotesForDisplay([...new Set(potential.map(s => s.noteToAdd))]); 
    } else { 
      setIdentifiedChords([]); 
      setPotentialChords([]); 
      setSuggestedNotesForDisplay([]); 
    } 
  }, [selectedPicks, mode, pickedUniqueNotes]);
  
  const identifiedChordsQuality = useMemo(() => (mode === 'pick' && identifiedChords.length > 0 ? identifiedChords[0].quality : null), [mode, identifiedChords]);


  // Effect for URL sync
  useEffect(() => {
    if (isInitialLoad) return;
    const newParams = new URLSearchParams(searchParams); // Start with current to preserve other params
    newParams.set('mode', mode);
    newParams.set('key', selectedKey); // Always set key

    if (mode === 'scale') {
      newParams.set('scale', selectedScaleKey);
      newParams.delete('chord');
      newParams.delete('picks');
    } else if (mode === 'chord') {
      newParams.set('chord', selectedChordKey);
      newParams.delete('scale');
      newParams.delete('picks');
    } else if (mode === 'pick') {
      if (selectedPicks.length > 0) {
        newParams.set('picks', selectedPicks.map(p => `${p.stringIndex}-${p.fretIndex}`).sort().join('_'));
      } else {
        newParams.delete('picks');
      }
      newParams.delete('scale');
      newParams.delete('chord');
    }
    
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [isInitialLoad, mode, selectedKey, selectedScaleKey, selectedChordKey, selectedPicks, setSearchParams, searchParams]);

  // Effect for loading from URL
 useEffect(() => {
    const modeParam = searchParams.get('mode') as Mode | null;
    const keyParam = searchParams.get('key')?.trim() as NoteValue | null; 
    const scaleParam = searchParams.get('scale')?.trim(); 
    const chordParam = searchParams.get('chord')?.trim(); 
    const picksParam = searchParams.get('picks');

    const newMode = modeParam || 'scale';
    if (newMode !== mode) setInternalMode(newMode);

    const newKey = (keyParam && NOTES.includes(keyParam)) ? keyParam : 'C';
    if (newKey !== selectedKey) setInternalSelectedKey(newKey);
    
    if (newMode === 'scale') {
      const newScale = (scaleParam && SCALES[scaleParam as keyof ScalesData]) ? scaleParam : 'ionian';
      if (newScale !== selectedScaleKey) setInternalSelectedScaleKey(newScale);
    } else if (newMode === 'chord') {
      const newChord = (chordParam && CHORDS[chordParam as keyof ChordsData]) ? chordParam : 'major';
      if (newChord !== selectedChordKey) setInternalSelectedChordKey(newChord);
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
      if (JSON.stringify(newPicksFromUrl) !== JSON.stringify(selectedPicks)) {
        setInternalSelectedPicks(newPicksFromUrl);
      }
    }
    setIsInitialLoad(false); 
  }, []); 


  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    localStorage.setItem('theme', themeMode);
  }, [themeMode]);

  const toggleThemeMode = () => setThemeMode(prev => (prev === 'light' ? 'dark' : 'light'));
  const handleColorThemeChange = (newTheme: ColorThemeOption) => { if (mode !== 'pick') setColorTheme(newTheme); };

  const handleModeChange = useCallback((newMode: Mode) => {
    setInternalMode(newMode);
    // Reset to defaults if current selection is invalid for the new mode
    if (newMode === 'scale' && (!selectedScaleKey || !SCALES[selectedScaleKey])) {
      setInternalSelectedScaleKey('ionian');
    }
    if (newMode === 'chord' && (!selectedChordKey || !CHORDS[selectedChordKey])) {
      setInternalSelectedChordKey('major');
    }
    // Clear picks if not in pick mode
    if (newMode !== 'pick') {
      setInternalSelectedPicks([]);
    }
    // Reset mode-specific display toggles
    if (newMode !== 'scale') {
        setShowParentScaleOverlay(false);
        setShowIntervalIndicators(false);
    }
  }, [selectedScaleKey, selectedChordKey]);

  const currentModeNotes: readonly NoteValue[] = useMemo(() => {
    if (!selectedKey || !NOTES.includes(selectedKey)) return [];
    if (mode === 'scale' && currentScaleDefinition) {
      const tonalScaleType = selectedScaleKey; 
      return getNotesForScale(selectedKey, tonalScaleType === 'major' ? 'major' : tonalScaleType === 'minorNatural' ? 'minor' : tonalScaleType);
    } else if (mode === 'chord' && selectedChordKey && CHORDS[selectedChordKey]) {
      return getNotesForChord(selectedKey, selectedChordKey);
    }
    return [];
  }, [selectedKey, selectedScaleKey, selectedChordKey, mode, currentScaleDefinition]);

  const currentSelectionName = useMemo(() => {
    const keyDisplay = selectedKey || "";
    if (mode === 'scale' && currentScaleDefinition) {
      return `${keyDisplay} ${currentScaleDefinition.name}`;
    }
    if (mode === 'chord' && selectedChordKey && CHORDS[selectedChordKey]) {
      return `${keyDisplay}${CHORDS[selectedChordKey].name}`;
    }
    if (mode === 'pick') {
      const chordsText = identifiedChords.map(c => c.name).join(' / ');
      return `Pick Mode Active ${chordsText ? `- ${chordsText}` : ''}`;
    }
    return 'Select Mode/Key/Scale/Chord';
  }, [selectedKey, selectedScaleKey, selectedChordKey, mode, currentScaleDefinition, identifiedChords]);
  

  const handleKeyChange = (value: string) => { if (NOTES.includes(value as NoteValue)) setInternalSelectedKey(value as NoteValue); };
  const handleScaleChange = (value: string) => { if (SCALES[value]) setInternalSelectedScaleKey(value); };
  const handleChordChange = (value: string) => { if (CHORDS[value]) setInternalSelectedChordKey(value); };
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

  const handleSelectRelativeMode = (newKey: NoteValue, newScaleKey: string) => {
    setInternalSelectedKey(newKey);
    setInternalSelectedScaleKey(newScaleKey);
  };

  const highlightedNotesForFretboard = useMemo(() => {
    if (mode === 'pick') return selectedPicks.length <= 1 ? NOTES : [];
    return currentModeNotes;
  }, [mode, selectedPicks.length, currentModeNotes]);

  const effectiveColorTheme = mode === 'pick' ? 'uniqueNotes' : colorTheme;
  const modeRootToPass = mode === 'scale' || mode === 'chord' ? selectedKey : null;

  return (
    <div className="container mx-auto p-4 font-sans text-gray-900 dark:text-gray-100 min-h-screen">
      <AppHeader
        themeMode={themeMode} toggleThemeMode={toggleThemeMode}
        colorTheme={colorTheme} onColorThemeChange={handleColorThemeChange}
        currentAppMode={mode}
      />
      <ModeSelection currentMode={mode} onSetMode={handleModeChange} />
      <Controls
        mode={mode}
        selectedKey={selectedKey} onKeyChange={handleKeyChange}
        selectedScaleKey={selectedScaleKey} onScaleChange={handleScaleChange}
        selectedChordKey={selectedChordKey} onChordChange={handleChordChange}
        showParentScaleOverlay={showParentScaleOverlay} onShowParentScaleOverlayChange={setShowParentScaleOverlay}
        showIntervalIndicators={showIntervalIndicators} onShowIntervalIndicatorsChange={setShowIntervalIndicators}
      />
      <SelectionInfo
        mode={mode}
        currentSelectionName={currentSelectionName}
        selectedKey={selectedKey}
        selectedScaleKey={selectedScaleKey}
        pickedUniqueNotes={pickedUniqueNotes}
        currentModeNotes={currentModeNotes}
        selectedChordKey={selectedChordKey}
        colorTheme={effectiveColorTheme}
        identifiedChordsQuality={identifiedChordsQuality}
        onSelectRelativeMode={handleSelectRelativeMode}
      />
      <div className="flex justify-center my-4">
        <Fretboard
          tuning={STANDARD_TUNING} numFrets={NUM_FRETS}
          highlightedNotes={highlightedNotesForFretboard}
          selectedPicks={selectedPicks} selectedPicksCount={selectedPicks.length}
          mode={mode} colorTheme={effectiveColorTheme}
          onFretClick={handleFretClick}
          suggestedNotesForDisplay={selectedPicks.length > 1 ? suggestedNotesForDisplay : []}
          currentScaleDef={currentScaleDefinition}
          modeRootNote={modeRootToPass}
          parentScaleRootNote={parentMajorRoot}
          showParentScaleOverlay={showParentScaleOverlay}
          parentScaleNotes={parentScaleNotes}
          showIntervalIndicators={showIntervalIndicators}
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
