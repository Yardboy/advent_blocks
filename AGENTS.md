# Agent Guidelines for Blocks Project

## Project Structure
- **index.html**: Main HTML with Tailwind CSS CDN, no build step required
- **app-553d21.js**: Vanilla JavaScript for drag-and-drop logic, state management (note: hash suffix in filename)
- **styles-553d21.css**: Custom CSS for grid borders, blocks, and layout specifics not covered by Tailwind (note: hash suffix in filename)

## Build/Test Commands
- **Run**: Open `index.html` in browser (no build system)
- **Test**: Manual testing only - drag blocks, double-click for colors, test capture/load/reset, verify grid alignment and validation
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
- Grid is 18x18 cells (50px each), blocks are 2x2 cells (100px total)
- Grid cells identified by row/col (0-indexed), NOT absolute pixel positions
- Numbered blocks (1-24): single instance only, disappear from supply when placed (placeholders remain in supply)
- Blank block (0): unlimited instances, stays in supply when placed
- Blocks align to nearest grid cell on drop; return to supply if dropped outside grid
- Double-click blocks to open color menu; 8 color options (Red, Green, Blue, White, Gold, Silver, Brown, Yellow) with custom bg/border/text colors defined in COLOR_OPTIONS
- Design validation: blocks must be contiguous (touching at least one other block edge-to-edge)
- Capture/Load: JSON format with array of `{row, col, number, bgColor, borderColor, textColor}` objects