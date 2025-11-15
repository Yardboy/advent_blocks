We are building a simple web app allowing someone to arrange a series of square blocks on screen by dragging and dropping them in place. The application is written in javascript and runs in a single browser window. The appication uses tailwind CSS for styling and layout. There should be three files: an index.html file with the markup, an app.js file with the javascript code, and a styles.css file with any CSS rules for the page.

Blocks are 100px by 100px.

There is a supply area at the bottom of the page with blocks numbered 1 through 24 and one blank block. The blocks are green background with a black border 2px thick and white numbers.

The rest of the page is laid out as a grid with 10 columns and 10 rows. Grid cells are the same size as the blocks. Grid cells are white background with a black border 2px thick.

When the user drags a numbered block from the supply area and drops it on the grid, the block aligns to the closest grid cell and stays there. The block disappears from the supply area. Only one of each numbered block can be on the grid at a time.

If the user drops a numbered block when it is not touching the grid, the block moves back to the supply area.

When the user drags the blank block from the supply area and drops it on the grid, the block alings to the closest grid cell and stays there. The blank block does not disappear from the supply area when it is dragged and dropped on the grid. The user can drag as many blank blocks onto the grid as they like.

If the user drags a numbered block that has already been placed on the grid outside the grid, the block moves back to the supply area.

If the user drags a blank block that has already been placed on the grid outside the grid, the block disappears.

If the user drags a block that has already been placed on the grid to a new location, the block moves and aligns to the closest grid cell when it is dropped.

Blocks cannot overlap.

If the user double-clicks on a block, it cycles through the available background colors:

green
red
yellow
blue

If the user double-clicks on a blue block, it goes back to green. All blocks regardless of background color have the same black border 2px thick and white numbers.

A button to the far right of the supply area is labeled "Capture". When the user clicks this button, a modal window pops up. The window displays 10 lines of text, 10 characters each line. Each character represents the corresponding grid cell. If the grid cell is blank, the character should be an O. If the grid cell is blank, the character should be an X.

When the user clicks away from the modal window, the modal window disappears.
