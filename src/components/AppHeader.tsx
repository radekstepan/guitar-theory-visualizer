import React, { useState, useRef, useEffect } from 'react';
import { Guitar, Music, Sun, Moon, Settings } from 'lucide-react'; // Removed Check icon
import { ThemeMode, ColorThemeOption, Mode } from '../types';
import { 
  Button,
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  // DropdownMenuCheckboxItem, // REMOVE THIS
  DropdownMenuLabel,
  DropdownMenuRadioGroup, // ADD THIS
  DropdownMenuRadioItem   // ADD THIS
} from './ui';

interface AppHeaderProps {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
  colorTheme: ColorThemeOption; 
  onColorThemeChange: (theme: ColorThemeOption) => void;
  currentAppMode: Mode; 
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  themeMode, 
  toggleThemeMode,
  colorTheme, 
  onColorThemeChange,
  currentAppMode
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleRadioColorThemeChange = (newThemeValue: string) => {
    if (currentAppMode !== 'pick') {
      onColorThemeChange(newThemeValue as ColorThemeOption);
    }
    // setIsDropdownOpen(false); // Optionally close
  };

  // This determines the value for the RadioGroup.
  // If in pick mode, it's 'uniqueNotes', otherwise it's the user's preferred `colorTheme`.
  const radioGroupValue = currentAppMode === 'pick' ? 'uniqueNotes' : colorTheme;

  return (
    <header className="text-center mb-6 relative">
      <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center space-x-2">
        <Guitar className="w-8 h-8" /> <span>Guitar Theory Visualizer</span> <Music className="w-8 h-8" />
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">Visualize scales, chords, or pick notes to identify chords.</p>
      
      <div className="absolute top-0 right-0 mt-1 mr-1 md:mt-0 md:mr-0" ref={dropdownRef}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDropdown}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open settings menu"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          {isDropdownOpen && (
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Display Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleThemeMode} className="flex items-center justify-between">
                <span>Toggle Dark/Light</span>
                {themeMode === 'light' ? <Moon className="h-4 w-4 ml-2" /> : <Sun className="h-4 w-4 ml-2" />}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Note Color Theme</DropdownMenuLabel>
              
              <DropdownMenuRadioGroup 
                value={radioGroupValue} 
                onValueChange={handleRadioColorThemeChange}
              >
                <DropdownMenuRadioItem 
                  value="uniqueNotes" 
                  disabled={currentAppMode === 'pick'} // User can't change it from uniqueNotes in pick mode
                >
                  Unique Note Colors
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem 
                  value="standard"
                  disabled={currentAppMode === 'pick'} // User can't change to standard in pick mode
                >
                  Standard (Root/Other)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
