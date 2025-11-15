# Agent Guidelines for Blocks Project

## Project Structure
- **index.html**: Main HTML markup with Tailwind CSS CDN
- **app.js**: Vanilla JavaScript for drag-and-drop functionality
- **styles.css**: Custom CSS rules for grid and blocks

## Testing
No automated tests configured. Test manually in browser by opening `index.html`.

## Code Style
- **Language**: Vanilla JavaScript (ES6+), no frameworks
- **Styling**: Tailwind CSS for layout, custom CSS for specific styling
- **Naming**: camelCase for JS variables/functions, kebab-case for CSS classes
- **Constants**: Use const for block dimensions (100px), grid size (10x10), colors (green/red/yellow/blue)
- **DOM**: Use querySelector/querySelectorAll for element selection
- **Events**: addEventListener for drag/drop events and double-clicks
- **Error Handling**: Validate grid bounds, prevent block overlap

## Key Requirements
- Blocks: 100px × 100px, 2px black border, white text
- Grid: 10×10 cells matching block size
- Drag-and-drop with snap-to-grid alignment
- Numbered blocks (1-24): single instance on grid, return to supply if dragged off
- Blank blocks: unlimited on grid, disappear if dragged off
- Double-click cycles colors: green → red → yellow → blue → green
- "Capture" button shows modal with 10×10 grid state (O=empty, X=filled)
