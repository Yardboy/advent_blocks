# Agent Guidelines for Blocks Project

## Project Structure
- **index.html**: Main HTML with Tailwind CSS CDN, no build step required
- **app.js**: Vanilla JavaScript for drag-and-drop logic, state management
- **styles.css**: Custom CSS for grid borders, blocks, and layout specifics not covered by Tailwind

## Build/Test Commands
- **Run**: Open `index.html` in browser (no build system)
- **Test**: Manual testing only - drag blocks, test capture/load, verify grid alignment
- **Lint**: No automated linting configured

## Code Style
- **Language**: Vanilla JavaScript ES6+, no frameworks, no TypeScript
- **Imports**: None - all code in single `app.js` file loaded via `<script>` tag
- **Styling**: Tailwind CSS utilities via CDN; custom CSS only for grid borders and block sizing
- **Naming**: camelCase (variables/functions), kebab-case (CSS classes), SCREAMING_SNAKE_CASE (constants)
- **Types**: No type annotations - use JSDoc comments for complex functions if needed
- **State Management**: Track grid state as object with row/col keys containing {blockNumber, backgroundColor}
- **Error Handling**: Wrap DOM operations and drag-and-drop handlers in try-catch blocks
- **Formatting**: 4-space indentation, semicolons optional, prefer arrow functions and const/let

## Key Implementation Notes
- Grid cells identified by row/col (0-indexed), NOT absolute pixel positions
- Numbered blocks (1-24): single instance only, disappear from supply when placed
- Blank block (0): unlimited instances, stays in supply when placed
- Blocks align to nearest grid cell on drop; return to supply if dropped outside grid