# 🎸 Guitar Theory Visualizer 🎶

Welcome to the Guitar Theory Visualizer! This interactive web application helps guitarists understand music theory concepts like scales, modes, chords, and note relationships directly on a virtual fretboard.

![Screenshot](screenshot.png)

## ✨ Features

*   **Interactive Fretboard**: Visualize notes dynamically on a standard 6-string guitar (EADGBe tuning, 12 frets).
*   **Mode Selection**:
    *   🎼 **Scale Mode**:
        *   Select a root note and a scale/mode (e.g., Major, Dorian, Mixolydian) to see all corresponding notes highlighted.
        *   **Modes Education**:
            *   All 7 diatonic modes (Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian) available.
            *   Modes are grouped for discoverability (e.g., "Major: Ionian", "Minor: Aeolian").
            *   Tooltips on scale/mode selection show interval formulas (e.g., "1 2 ♭3 4 5 6 ♭7") and brief descriptors.
        *   **Parent Scale Context**:
            *   Selection Information displays the selected mode (e.g., "D Dorian"), its interval formula, and its relation to the parent major scale (e.g., "Relative to C Ionian (Major)").
            *   **Relative Mode Switcher**: Quickly switch between modes derived from the same parent scale (e.g., if C Ionian is active, easily switch to D Dorian, E Phrygian, etc.).
        *   **Dual-Root Highlighting**:
            *   The mode's root note is highlighted with a primary color.
            *   The parent major scale's root note is highlighted with a secondary color (when relevant and "Show Parent Scale" is active or by default for context).
        *   **Toggle Parent Scale Overlay**: A "Show Parent Scale" option fades the mode notes and overlays the parent major scale notes in a lighter shade for comparison.
        *   **Interval Indicators**: Optionally display interval degrees (e.g., "1", "♭3") below note names on the fretboard for the selected scale/mode.
    *   🎸 **Chord Mode**:
        *   Choose a root note and a chord type (e.g., Major, Minor, Dominant 7th) to display the chord's notes.
        *   **Mode Compatibility**: Suggests modes commonly used over the selected chord (e.g., "Dm7 → Dorian, Aeolian").
    *   👆 **Pick Mode**:
        *   Click directly on frets to select notes.
        *   Identifies potential chords formed by the selected notes.
        *   Suggests additional notes that could complete common chords.
        *   Shows all available notes when 0 or 1 note is selected for easy exploration.
*   **Root Note Highlighting**: Clearly distinguishes the root note in Scale and Chord modes.
*   **Color Themes**:
    *   🎨 **Standard**: Root notes in blue, other scale/chord notes in green (customizable for modes).
    *   🌈 **Unique Notes**: Each of the 12 chromatic notes has its own distinct color for easy identification (forced in Pick Mode).
*   **Customizable Display**:
    *   Standard 6-string guitar tuning (EADGBe).
    *   12 frets displayed with standard fret markers.
*   **Deep Linking 🔗**: Share specific configurations! The app's state (mode, selected key, scale/chord, picked notes) is reflected in the URL, allowing you to bookmark or share exact visualizations.
*   **Responsive Design**: Adapts to different screen sizes (though primarily designed for desktop).
*   **Dark/Light Mode 🌓**: Toggle between dark and light themes for comfortable viewing.

## 🎓 How Modes are Presented

The application aims to make learning and using musical modes intuitive:

1.  **Select a Mode**: E.g., choose "D Dorian" from the Scale dropdown.
2.  **Fretboard Visualization**:
    *   'D' (Dorian root) is highlighted as the primary root.
    *   'C' (parent Ionian root) is highlighted as the secondary (parent) root.
3.  **Information Display**:
    *   Shows: "D Dorian"
    *   Subtext: "Relative to C Ionian (Major)"
    *   Interval Formula: "1 2 ♭3 4 5 6 ♭7"
4.  **Parent Scale Overlay**: Toggle "Show Parent Scale" to see how D Dorian's notes (faded) align with C Major notes (overlaid).
5.  **Relative Mode Switching**: Click "E Phrygian" or other relative modes in the info panel to instantly compare patterns from the same C Major parent scale.

This approach emphasizes the relationship between modes and their parent major scale, providing both theoretical context and practical fretboard visualization.

## 📜 License

This project is licensed under the ISC License.

---

Happy visualizing and rock on! 🤘
