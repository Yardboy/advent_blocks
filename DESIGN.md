We are building a simple web app allowing someone to arrange a series of square blocks on screen by dragging and dropping them in place. The application is written in javascript and runs in a single browser window. The appication uses tailwind CSS for styling and layout. There should be three files: an index.html file with the markup, an app.js file with the javascript code, and a styles.css file with any CSS rules for the page.

The page is laid out in two sections, 2/3 width to the left, and 1/3 to the right.

The right-hand side is a supply area with blocks numbered 1 through 24 and one blank block. The blocks are green background with white numbers and no border. Blocks are 40px by 40px. Numbers on the blocks are centered horizontally and vertically and font size 36px or the equivalent.

At the bottom of the supply area are two buttons, one labeled "Capture" and one labeled "Load", with a text area input field below them. The text area has the prompt text "Paste your design data here...".

The left-hand side of the page is the Design Grid, consisting of a 50 x 50 grid. Grid cells are 20px by 20px, including any borders.Individual cells have a 1px solid medium gray border. Groups of 4 blocks starting at the top-left have a 1px solid black border. The entire grid has a 1px solid black border. Borders collapse.

The application should identify each cell on the grid by it's row and column, starting at 0, and maintain the state of each cell regarding:

* the number of the block in the cell, if any (blank blocks can be tracked with a 0)
* the background color of the block in the cell, if any

The application should not track grid cells by absolute position on the page.

When the user drags a numbered block from the supply area and drops it on the grid, the block aligns to the closest grid cell and stays there. The block disappears from the supply area. Only one of each numbered block can be on the grid at a time.

If the user drops a numbered block when it is not touching the grid, the block moves back to the supply area.

When the user drags the blank block from the supply area and drops it on the grid, the block aligns to the closest grid cell and stays there. The blank block does not disappear from the supply area when it is dragged and dropped on the grid. The user can drag as many blank blocks onto the grid as they like.

If the user drags a numbered block that has already been placed on the grid outside the grid, the block moves back to the supply area.

If the user drags a blank block that has already been placed on the grid outside the grid, the block disappears.

If the user drags a block that has already been placed on the grid to a new location, the block moves and aligns to the closest grid cell when it is dropped.

Blocks cannot overlap. Blocks must be completely on the grid.
