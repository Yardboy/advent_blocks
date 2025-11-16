# Agent Guidelines for Blocks Project

## Project Structure
- **index.html**: Main HTML with Tailwind CSS CDN
- **app.js**: Vanilla JavaScript drag-and-drop logic
- **styles.css**: Custom CSS for grid, blocks, and context menu

## Build/Test Commands
No build system or automated tests. Test manually by opening `index.html` in browser.

## Code Style
- **Language**: Vanilla JavaScript (ES6+), no frameworks or TypeScript
- **Styling**: Tailwind CSS (via CDN) for utility classes, custom CSS for components
- **Naming**: camelCase for JS (variables/functions), kebab-case for CSS classes, SCREAMING_SNAKE_CASE for constants
- **Constants**: GRID_SIZE=9, BLOCK_SIZE=96, CELL_SIZE=100, COLORS array
- **DOM**: querySelector/querySelectorAll, dataset attributes for state tracking
- **Events**: addEventListener for drag/drop, dblclick, contextmenu, click
- **State**: Map for grid tracking (`gridBlocks`), global vars for drag state
- **Error Handling**: Validate bounds, check overlap with `wouldOverlapWithBlock()`, prevent context menu on supply blocks

## Key Features
- **Blocks**: 96px × 96px (BLOCK_SIZE), centered in 100px cells (CELL_SIZE)
- **Grid**: 9×9 cells (GRID_SIZE), 2px black borders
- **Drag-drop**: Snap to grid, collision detection, numbered blocks return to supply, blank blocks disappear when removed
- **Color cycling**: Double-click cycles green → red → yellow → blue → green
- **Half-cell shifting**: Right-click shows context menu to shift blocks 50px (half-cell) in available directions
- **Scene capture/load**: JSON serialization with absolute positioning, clipboard integration
