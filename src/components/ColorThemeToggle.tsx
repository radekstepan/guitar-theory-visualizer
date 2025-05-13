import React from 'react';
import { Palette } from 'lucide-react';
import { Label, Switch } from './ui';
import { Mode, ColorThemeOption } from '../types';

interface ColorThemeToggleProps {
  colorTheme: ColorThemeOption;
  onThemeToggle: (isChecked: boolean) => void;
  mode: Mode;
}

const ColorThemeToggle: React.FC<ColorThemeToggleProps> = ({ colorTheme, onThemeToggle, mode }) => {
  return (
    <div className="flex items-center justify-center space-x-2 my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
      <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      <Label htmlFor="color-theme-switch" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Use Unique Note Colors (Forced in Pick mode)
      </Label>
      <Switch
        id="color-theme-switch"
        checked={mode === 'pick' || colorTheme === 'uniqueNotes'}
        onCheckedChange={onThemeToggle}
        disabled={mode === 'pick'}
      />
    </div>
  );
};

export default ColorThemeToggle;
