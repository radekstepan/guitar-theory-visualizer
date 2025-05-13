import React from 'react';
import { Guitar, Music, Sun, Moon } from 'lucide-react';
import { Button } from './ui';
import { ThemeMode } from '../types';

interface AppHeaderProps {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ themeMode, toggleThemeMode }) => {
  return (
    <header className="text-center mb-6 relative">
      <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center space-x-2">
        <Guitar className="w-8 h-8" /> <span>Guitar Theory Visualizer</span> <Music className="w-8 h-8" />
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Visualize scales, chords, or pick notes to identify chords.</p>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleThemeMode}
        className="absolute top-0 right-0 mt-2 mr-2 md:mt-0 md:mr-0 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle light/dark theme"
      >
        {themeMode === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
    </header>
  );
};

export default AppHeader;
