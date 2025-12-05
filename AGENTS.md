# Agent Guidelines for Advent Blocks

## Project Files
- **index.html**: Main HTML, Tailwind CDN, no build system
- **app-7c4e92.js**: Vanilla JS drag-and-drop logic (hash suffix in filename - don't change without updating HTML)
- **styles-7c4e92.css**: Custom CSS for grid borders, block sizing, tooltips, clips (hash suffix in filename - don't change without updating HTML)

## Build/Test
- **Run**: Open `index.html` in browser directly (no build needed)
- **Test**: Manual only - drag blocks, double-click colors, test capture/load/reset, color buttons, smart positioning, clip visualization
- **Lint**: None configured

## Code Style
- **Language**: Vanilla JS ES6+, no frameworks/TypeScript/imports
- **Naming**: camelCase (JS), kebab-case (CSS), SCREAMING_SNAKE_CASE (constants)
- **Formatting**: 4-space indent, semicolons optional, arrow functions, const/let
- **Error Handling**: Wrap DOM ops and drag handlers in try-catch
- **State**: Object with `"row,col"` keys → `{blockNumber, backgroundColor}`
- **DOM Structure**: Supply area has `.flex-wrap` child for blocks, use `getSupplyBlocksContainer()` helper

## Key Details
- 18×18 grid (40px cells), blocks 2×2 (80px), half-blocks 1×2 or 2×1
- Numbered 1-24: single instance, placeholder with diagonal slash on place | Blank (0): unlimited
- Drag: cursor-based quadrant detection, smart positioning checks 8 neighbors (±1 offset) clockwise when blocked
- Colors: 8 options in COLOR_OPTIONS at top of file, double-click block or use color buttons (right side of supply)
- Color buttons: bottom-right of supply area, only affect blocks still in supply (not on grid)
- Tooltips: Custom styled with `data-tooltip` attribute, left-aligned for color buttons
- Placeholders: Gray blocks with diagonal slash (::after pseudo-element) when numbered blocks placed on grid
- Captions: Dynamic - "Drag a block..." when empty, "Double-click..." when blocks on grid
- Block stats: Auto-update on place/move/remove, show placeholder text when empty, includes clip count (×2)
- Capture/Load: JSON `{row, col, number, blockType, color}` with color as name
- Smart positioning: When drop blocked, checks 8 neighbors starting from cursor position direction, moves clockwise

## Clip System
- **Visual**: 10×10 black squares positioned at grid intersections where blocks connect
- **Detection**: `updateClips()` called from `updateBlockStats()` - runs on every block change
- **Rules**: 
  - Clips appear where two blocks share a complete common border (2 cells long)
  - Clips appear where three blocks meet in a T-junction (one block shares half-borders with two others)
  - NO clips where blocks only touch at corners or share less than a full edge
- **Implementation**:
  - Build `cellToBlockMap` mapping cells to block indices
  - For complete borders: check horizontal/vertical border segments form 2-cell spans between same block pairs
  - For T-junctions: verify 3 blocks meet AND one occupies 2 quadrants, two occupy 1 each (validates edge-sharing)
  - Clips positioned at grid intersections (whole number coordinates), rendered with -5px offset to center 10px square
- **Count**: Display shows 2× actual clip positions (each position needs 2 physical clips)

## Helper Functions
- `getSupplyBlocksContainer()`: Get the blocks container within supply area (not the area itself)
- `getCellsForBlock(row, col, type)`: Returns array of "row,col" strings for cells occupied by block
- `isPositionValid(row, col, type, blockNum, isMoving)`: Check if position valid for placement
- `getNeighboringPositions(row, col, quadrant, type)`: Get 8 neighboring positions in clockwise order
- `updateClips()`: Calculate and render all clips, returns count of clip positions
- `updateBlockStats()`: Update stats display and trigger clip recalculation

## Important Notes
- Always use `getSupplyBlocksContainer()` instead of direct `#supply-area` children access
- Tooltips for buttons use `data-tooltip` not `title` attribute
- Grid state tracks blocks by `"row,col"` string keys, remove old position before adding new
- Smart drop only tries 8 immediate neighbors (within 4×4 area for full blocks), not farther positions
- Clips auto-update whenever blocks change - no manual triggering needed
- Clip detection uses quadrant analysis to distinguish T-junctions from mere corner touching
