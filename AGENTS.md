# Agent Guidelines for Advent Blocks

## Project Files
- **index.html**: Main HTML, Tailwind CDN, no build system
- **app-2f8d91.js**: Vanilla JS drag-and-drop logic (hash suffix in filename - don't change without updating HTML)
- **styles-2f8d91.css**: Custom CSS for grid borders, block sizing, tooltips (hash suffix in filename - don't change without updating HTML)

## Build/Test
- **Run**: Open `index.html` in browser directly (no build needed)
- **Test**: Manual only - drag blocks, double-click colors, test capture/load/reset, color buttons, smart positioning
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
- Block stats: Auto-update on place/move/remove, show placeholder text when empty
- Capture/Load: JSON `{row, col, number, blockType, color}` with color as name
- Smart positioning: When drop blocked, checks 8 neighbors starting from cursor position direction, moves clockwise
- Helper functions: `getSupplyBlocksContainer()`, `getCellsForBlock()`, `isPositionValid()`, `getNeighboringPositions()`

## Important Notes
- Always use `getSupplyBlocksContainer()` instead of direct `#supply-area` children access
- Tooltips for buttons use `data-tooltip` not `title` attribute
- Grid state tracks blocks by `"row,col"` string keys, remove old position before adding new
- Smart drop only tries 8 immediate neighbors (within 4×4 area for full blocks), not farther positions