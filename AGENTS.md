# Agent Guidelines for Blocks Project

## Project Structure
- **index.html**: Main HTML with Tailwind CSS CDN, no build step required
- **app-f4c7d2.js**: Vanilla JavaScript for drag-and-drop logic, state management (note: hash suffix in filename)
- **styles-f4c7d2.css**: Custom CSS for grid borders, blocks, and layout specifics not covered by Tailwind (note: hash suffix in filename)

## Build/Test Commands
- **Run**: Open `index.html` in browser (no build system)
- **Test**: Manual testing only - drag blocks, double-click for colors, test capture/load/reset, verify grid alignment
- **Lint**: No automated linting configured

## Code Style
- **Language**: Vanilla JavaScript ES6+, no frameworks, no TypeScript
- **Imports**: None - all code in single file loaded via `<script>` tag
- **Styling**: Tailwind CSS utilities via CDN; custom CSS only for grid borders and block sizing
- **Naming**: camelCase (variables/functions), kebab-case (CSS classes), SCREAMING_SNAKE_CASE (constants)
- **Types**: No type annotations - use JSDoc comments for complex functions if needed
- **State Management**: Track grid state as object with `"row,col"` string keys containing `{blockNumber, backgroundColor}`
- **Error Handling**: Wrap DOM operations and drag-and-drop handlers in try-catch blocks
- **Formatting**: 4-space indentation, semicolons optional, prefer arrow functions and const/let

## Key Implementation Notes
- Grid: 18x18 cells (40px each), blocks are 2x2 cells (80px total), half-blocks available (40x80 vertical, 80x40 horizontal)
- Layout: 50/50 split between design grid (left) and supply area (right)
- Grid cells identified by row/col (0-indexed), NOT absolute pixel positions
- Grid borders: 1px solid gray for cells, 1px solid black for 2x2 groupings and outer edges
- Numbered blocks (1-24): single instance only, disappear from supply when placed (placeholders remain)
- Blank blocks (0): unlimited instances, stays in supply when placed (full, half-vertical, half-horizontal variants)
- Drag behavior: clicked quadrant within block is tracked; on drop, that quadrant aligns with hovered grid cell
- Blocks align to grid cells on drop; return to supply if dropped outside grid or if boundary check fails
- Double-click blocks to open color menu; 8 color options (Red, Green, Blue, White, Gold, Silver, Brown, Yellow) in COLOR_OPTIONS
- Colors: text and border color always match for each option; background is distinct
- Block stats: displayed in supply area showing (color)-(type): (count) format, updated on place/move/remove/color change
- Capture/Load: JSON format with `{row, col, number, blockType, color}` objects; color stored as name (not RGB)
- No design validation - blocks can be placed anywhere on grid without contiguity requirements