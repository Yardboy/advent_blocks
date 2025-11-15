const GRID_SIZE = 9;
const BLOCK_SIZE = 96;
const CELL_SIZE = 100;
const COLORS = ['bg-green', 'bg-red', 'bg-yellow', 'bg-blue'];

let draggedBlock = null;
let dragOffset = { x: 0, y: 0 };
let gridBlocks = new Map(); // Map of "row,col" -> block element

// Initialize grid
function initGrid() {
    const grid = document.getElementById('grid');
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = Math.floor(i / GRID_SIZE);
        cell.dataset.col = i % GRID_SIZE;
        grid.appendChild(cell);
    }
}

// Initialize supply area
function initSupply() {
    const supply = document.getElementById('supply');
    
    // Add numbered blocks (1-24)
    for (let i = 1; i <= 24; i++) {
        const block = createBlock(i.toString(), false);
        supply.appendChild(block);
    }
    
    // Add blank block
    const blankBlock = createBlock('', true);
    supply.appendChild(blankBlock);
}

// Create a block element
function createBlock(text, isBlank) {
    const block = document.createElement('div');
    block.className = 'block bg-green';
    block.textContent = text;
    block.dataset.isBlank = isBlank;
    block.dataset.number = text;
    block.draggable = true;
    
    block.addEventListener('dragstart', handleDragStart);
    block.addEventListener('dragend', handleDragEnd);
    block.addEventListener('dblclick', handleDoubleClick);
    block.addEventListener('contextmenu', handleContextMenu);
    
    return block;
}

// Handle drag start
function handleDragStart(e) {
    draggedBlock = e.target;
    draggedBlock.classList.add('dragging');
    
    const rect = draggedBlock.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    
    e.dataTransfer.effectAllowed = 'move';
}

// Handle drag end
function handleDragEnd(e) {
    if (!draggedBlock) return;
    
    draggedBlock.classList.remove('dragging');
    
    // Use the cursor position to determine which grid cell we're over
    const cursorX = e.clientX;
    const cursorY = e.clientY;
    
    const gridRect = document.getElementById('grid').getBoundingClientRect();
    const isOverGrid = 
        cursorX >= gridRect.left && 
        cursorX < gridRect.right && 
        cursorY >= gridRect.top && 
        cursorY < gridRect.bottom;
    
    const wasOnGrid = draggedBlock.dataset.onGrid === 'true';
    const isBlank = draggedBlock.dataset.isBlank === 'true';
    
    if (isOverGrid) {
        // Calculate grid position based on cursor position
        const col = Math.floor((cursorX - gridRect.left) / CELL_SIZE);
        const row = Math.floor((cursorY - gridRect.top) / CELL_SIZE);
        
        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
            const key = `${row},${col}`;
            
            // Check if cell is occupied
            if (!gridBlocks.has(key)) {
                // Remove from previous position
                if (wasOnGrid) {
                    removeBlockFromGrid(draggedBlock);
                }
                
                // For blank blocks from supply, create a clone
                let blockToPlace = draggedBlock;
                if (isBlank && !wasOnGrid) {
                    // Clone the blank block
                    blockToPlace = createBlock('', true);
                    // Copy the color from the dragged block
                    COLORS.forEach(c => blockToPlace.classList.remove(c));
                    const currentColor = COLORS.find(c => draggedBlock.classList.contains(c));
                    if (currentColor) {
                        blockToPlace.classList.add(currentColor);
                    }
                }
                
                // Place on grid
                placeBlockOnGrid(blockToPlace, row, col);
            }
        }
    } else {
        // Dropped outside grid
        if (wasOnGrid) {
            removeBlockFromGrid(draggedBlock);
            
            if (isBlank) {
                // Blank blocks disappear
                draggedBlock.remove();
            } else {
                // Numbered blocks return to supply
                returnBlockToSupply(draggedBlock);
            }
        }
    }
    
    draggedBlock = null;
}

// Place block on grid
function placeBlockOnGrid(block, row, col) {
    const grid = document.getElementById('grid');
    
    // Remove block from DOM first to ensure clean layout calculation
    if (block.parentElement) {
        block.remove();
    }
    
    // Get the grid rect after removing the block
    const gridRect = grid.getBoundingClientRect();
    
    // Find the actual grid cell at this position to get its exact position
    const cells = grid.querySelectorAll('.grid-cell');
    const cellIndex = row * GRID_SIZE + col;
    const cell = cells[cellIndex];
    const cellRect = cell.getBoundingClientRect();
    
    // Position the block to be centered in the cell
    // Cell is 100px, block is 96px, so we need 2px offset
    const scrollX = window.pageXOffset || window.scrollX || 0;
    const scrollY = window.pageYOffset || window.scrollY || 0;
    const blockOffset = 2; // (100 - 96) / 2 = 2px to center
    
    const finalLeft = cellRect.left + scrollX + blockOffset;
    const finalTop = cellRect.top + scrollY + blockOffset;
    
    // Set positioning
    block.style.position = 'absolute';
    block.style.left = finalLeft + 'px';
    block.style.top = finalTop + 'px';
    block.dataset.onGrid = 'true';
    block.dataset.gridRow = row;
    block.dataset.gridCol = col;
    
    gridBlocks.set(`${row},${col}`, block);
    
    // Append to body to position absolutely
    document.body.appendChild(block);
}

// Remove block from grid
function removeBlockFromGrid(block) {
    const row = block.dataset.gridRow;
    const col = block.dataset.gridCol;
    if (row !== undefined && col !== undefined) {
        gridBlocks.delete(`${row},${col}`);
    }
    
    delete block.dataset.onGrid;
    delete block.dataset.gridRow;
    delete block.dataset.gridCol;
    block.style.position = '';
    block.style.left = '';
    block.style.top = '';
}

// Return numbered block to supply
function returnBlockToSupply(block) {
    removeBlockFromGrid(block);
    const supply = document.getElementById('supply');
    
    // Get all blocks in supply
    const allBlocks = Array.from(supply.children);
    
    // Add the returning block
    allBlocks.push(block);
    
    // Sort blocks: numbered blocks in order, then blank blocks
    allBlocks.sort((a, b) => {
        const aIsBlank = a.dataset.isBlank === 'true';
        const bIsBlank = b.dataset.isBlank === 'true';
        
        // Blank blocks go to the end
        if (aIsBlank && !bIsBlank) return 1;
        if (!aIsBlank && bIsBlank) return -1;
        if (aIsBlank && bIsBlank) return 0;
        
        // Sort numbered blocks numerically
        const aNum = parseInt(a.dataset.number);
        const bNum = parseInt(b.dataset.number);
        return aNum - bNum;
    });
    
    // Clear and re-append in sorted order
    supply.innerHTML = '';
    allBlocks.forEach(b => supply.appendChild(b));
}

// Handle double-click to cycle colors
function handleDoubleClick(e) {
    const block = e.target;
    const currentColorIndex = COLORS.findIndex(color => block.classList.contains(color));
    const nextColorIndex = (currentColorIndex + 1) % COLORS.length;
    
    COLORS.forEach(color => block.classList.remove(color));
    block.classList.add(COLORS[nextColorIndex]);
}

// Handle right-click context menu
let contextMenuBlock = null;

function handleContextMenu(e) {
    e.preventDefault();
    
    const block = e.target;
    
    // Only show context menu for blocks that are positioned on the page (not in supply)
    if (!block.style.position || block.style.position !== 'absolute') {
        return;
    }
    
    contextMenuBlock = block;
    
    const menu = document.getElementById('contextMenu');
    const menuItems = menu.querySelectorAll('.context-menu-item');
    
    // For blocks on the grid, check adjacent cells
    if (block.dataset.onGrid === 'true') {
        const row = parseInt(block.dataset.gridRow);
        const col = parseInt(block.dataset.gridCol);
        
        const grid = document.getElementById('grid');
        const cells = grid.querySelectorAll('.grid-cell');
        const scrollX = window.pageXOffset || window.scrollX || 0;
        const scrollY = window.pageYOffset || window.scrollY || 0;
        const halfCell = CELL_SIZE / 2;
        const blockOffset = 2;
        
        // Get current cell position
        const currentCellIndex = row * GRID_SIZE + col;
        const currentCell = cells[currentCellIndex];
        const currentCellRect = currentCell.getBoundingClientRect();
        const currentLeft = currentCellRect.left + scrollX + blockOffset;
        const currentTop = currentCellRect.top + scrollY + blockOffset;
        
        // Check which directions are available (no overlap)
        const directions = {
            up: row > 0 && !wouldOverlapWithBlock(currentLeft, currentTop - halfCell),
            down: row < GRID_SIZE - 1 && !wouldOverlapWithBlock(currentLeft, currentTop + halfCell),
            left: col > 0 && !wouldOverlapWithBlock(currentLeft - halfCell, currentTop),
            right: col < GRID_SIZE - 1 && !wouldOverlapWithBlock(currentLeft + halfCell, currentTop)
        };
        
        // Show/hide menu items based on available directions
        menuItems.forEach(item => {
            const direction = item.dataset.direction;
            if (directions[direction]) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    } else {
        // For shifted blocks, only show directions on the same axis
        const shiftAxis = block.dataset.shiftAxis;
        const blockRect = block.getBoundingClientRect();
        const grid = document.getElementById('grid');
        const gridRect = grid.getBoundingClientRect();
        
        // Calculate which grid cells the block is between
        const scrollX = window.pageXOffset || window.scrollX || 0;
        const scrollY = window.pageYOffset || window.scrollY || 0;
        
        // Get block center relative to grid
        const blockCenterX = blockRect.left + (BLOCK_SIZE / 2) - gridRect.left;
        const blockCenterY = blockRect.top + (BLOCK_SIZE / 2) - gridRect.top;
        
        // Determine which cells the block is near
        const nearCol = Math.floor(blockCenterX / CELL_SIZE);
        const nearRow = Math.floor(blockCenterY / CELL_SIZE);
        
        // Get current position of shifted block
        const currentLeft = parseFloat(block.style.left);
        const currentTop = parseFloat(block.style.top);
        const halfCell = CELL_SIZE / 2;
        
        menuItems.forEach(item => {
            const direction = item.dataset.direction;
            let shouldShow = false;
            
            // Calculate new position for this direction
            let newLeft = currentLeft;
            let newTop = currentTop;
            
            switch(direction) {
                case 'up':
                    newTop -= halfCell;
                    break;
                case 'down':
                    newTop += halfCell;
                    break;
                case 'left':
                    newLeft -= halfCell;
                    break;
                case 'right':
                    newLeft += halfCell;
                    break;
            }
            
            // Only show directions on the same axis as the shift
            if (shiftAxis === 'vertical' && (direction === 'up' || direction === 'down')) {
                // Check bounds and overlap
                if ((direction === 'up' && nearRow > 0) || (direction === 'down' && nearRow < GRID_SIZE - 1)) {
                    shouldShow = !wouldOverlapWithBlock(newLeft, newTop);
                }
            } else if (shiftAxis === 'horizontal' && (direction === 'left' || direction === 'right')) {
                // Check bounds and overlap
                if ((direction === 'left' && nearCol > 0) || (direction === 'right' && nearCol < GRID_SIZE - 1)) {
                    shouldShow = !wouldOverlapWithBlock(newLeft, newTop);
                }
            }
            
            if (shouldShow) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }
    
    // Position and show the menu
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';
    menu.classList.remove('hidden');
}

// Shift block in a direction
function shiftBlock(direction) {
    if (!contextMenuBlock) return;
    
    const scrollX = window.pageXOffset || window.scrollX || 0;
    const scrollY = window.pageYOffset || window.scrollY || 0;
    const halfCell = CELL_SIZE / 2;
    
    let newLeft, newTop;
    
    if (contextMenuBlock.dataset.onGrid === 'true') {
        // Block is on grid - shift from grid position
        const row = parseInt(contextMenuBlock.dataset.gridRow);
        const col = parseInt(contextMenuBlock.dataset.gridCol);
        
        // Get the current cell
        const grid = document.getElementById('grid');
        const cells = grid.querySelectorAll('.grid-cell');
        const currentCellIndex = row * GRID_SIZE + col;
        const currentCell = cells[currentCellIndex];
        const currentCellRect = currentCell.getBoundingClientRect();
        
        const blockOffset = 2; // Original offset to center block in cell
        newLeft = currentCellRect.left + scrollX + blockOffset;
        newTop = currentCellRect.top + scrollY + blockOffset;
        
        // Remove from grid tracking
        const oldKey = `${row},${col}`;
        gridBlocks.delete(oldKey);
        
        // Mark as no longer on grid
        delete contextMenuBlock.dataset.onGrid;
        delete contextMenuBlock.dataset.gridRow;
        delete contextMenuBlock.dataset.gridCol;
    } else {
        // Block is already shifted - shift from current position
        newLeft = parseFloat(contextMenuBlock.style.left);
        newTop = parseFloat(contextMenuBlock.style.top);
    }
    
    // Adjust position based on direction
    switch(direction) {
        case 'up':
            newTop -= halfCell;
            break;
        case 'down':
            newTop += halfCell;
            break;
        case 'left':
            newLeft -= halfCell;
            break;
        case 'right':
            newLeft += halfCell;
            break;
    }
    
    // Update block position
    contextMenuBlock.style.position = 'absolute';
    contextMenuBlock.style.left = newLeft + 'px';
    contextMenuBlock.style.top = newTop + 'px';
    
    // Check if the block is now centered in a grid cell
    const grid = document.getElementById('grid');
    const gridRect = grid.getBoundingClientRect();
    const cells = grid.querySelectorAll('.grid-cell');
    
    let isCentered = false;
    let centeredRow = -1;
    let centeredCol = -1;
    
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const cellRect = cell.getBoundingClientRect();
        const blockOffset = 2;
        const expectedLeft = cellRect.left + scrollX + blockOffset;
        const expectedTop = cellRect.top + scrollY + blockOffset;
        
        // Check if block is centered in this cell (within 1px tolerance)
        if (Math.abs(newLeft - expectedLeft) < 1 && Math.abs(newTop - expectedTop) < 1) {
            centeredRow = Math.floor(i / GRID_SIZE);
            centeredCol = i % GRID_SIZE;
            isCentered = true;
            break;
        }
    }
    
    if (isCentered) {
        // Block is back on grid - restore grid status
        contextMenuBlock.dataset.onGrid = 'true';
        contextMenuBlock.dataset.gridRow = centeredRow;
        contextMenuBlock.dataset.gridCol = centeredCol;
        delete contextMenuBlock.dataset.shiftAxis;
        
        // Add to grid tracking
        gridBlocks.set(`${centeredRow},${centeredCol}`, contextMenuBlock);
    } else {
        // Store which axis this block is shifted on
        if (direction === 'up' || direction === 'down') {
            contextMenuBlock.dataset.shiftAxis = 'vertical';
        } else {
            contextMenuBlock.dataset.shiftAxis = 'horizontal';
        }
    }
    
    // Hide menu
    hideContextMenu();
}

// Check if a block at a given position would overlap with any other block
function wouldOverlapWithBlock(newLeft, newTop) {
    const allBlocks = document.querySelectorAll('.block');
    
    for (let block of allBlocks) {
        // Skip the block we're checking for (the one with the context menu)
        if (block === contextMenuBlock) continue;
        
        // Only check blocks that are positioned absolutely (on grid or shifted)
        if (block.style.position === 'absolute') {
            const blockLeft = parseFloat(block.style.left);
            const blockTop = parseFloat(block.style.top);
            
            // Calculate the bounding boxes
            // New position box
            const newRight = newLeft + BLOCK_SIZE;
            const newBottom = newTop + BLOCK_SIZE;
            
            // Existing block box
            const blockRight = blockLeft + BLOCK_SIZE;
            const blockBottom = blockTop + BLOCK_SIZE;
            
            // Check for rectangle overlap (AABB collision detection)
            const xOverlap = newLeft < blockRight && newRight > blockLeft;
            const yOverlap = newTop < blockBottom && newBottom > blockTop;
            
            if (xOverlap && yOverlap) {
                return true;
            }
        }
    }
    
    return false;
}

// Check if there's a shifted block at a specific position that would block movement
function hasShiftedBlockAt(fromRow, fromCol, toRow, toCol, axis) {
    const grid = document.getElementById('grid');
    const gridRect = grid.getBoundingClientRect();
    
    // Get all blocks on the page that are shifted (exclude the current context menu block)
    const allBlocks = document.querySelectorAll('.block');
    
    for (let block of allBlocks) {
        // Skip the block we're checking for (the one with the context menu)
        if (block === contextMenuBlock) continue;
        
        if (block.dataset.shiftAxis === axis && block.style.position === 'absolute') {
            const blockRect = block.getBoundingClientRect();
            const blockCenterX = blockRect.left + (BLOCK_SIZE / 2) - gridRect.left;
            const blockCenterY = blockRect.top + (BLOCK_SIZE / 2) - gridRect.top;
            
            const blockNearCol = Math.floor(blockCenterX / CELL_SIZE);
            const blockNearRow = Math.floor(blockCenterY / CELL_SIZE);
            
            // Check if this block is in the position we want to move to
            if (axis === 'vertical') {
                // Check if block is between the same two rows
                if (blockNearCol === fromCol && blockNearRow === Math.min(fromRow, toRow)) {
                    return true;
                }
            } else { // horizontal
                // Check if block is between the same two columns
                if (blockNearRow === fromRow && blockNearCol === Math.min(fromCol, toCol)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

function hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    menu.classList.add('hidden');
    contextMenuBlock = null;
}

// Capture grid state as JSON
function captureGridState() {
    const scene = {
        blocks: []
    };
    
    // Get all blocks that are positioned on the page (grid or shifted)
    const allBlocks = document.querySelectorAll('.block');
    
    allBlocks.forEach(block => {
        if (block.style.position === 'absolute') {
            const blockData = {
                number: block.dataset.number,
                isBlank: block.dataset.isBlank === 'true',
                left: parseFloat(block.style.left),
                top: parseFloat(block.style.top),
                color: COLORS.find(c => block.classList.contains(c)) || 'bg-green',
                onGrid: block.dataset.onGrid === 'true'
            };
            
            if (blockData.onGrid) {
                blockData.row = parseInt(block.dataset.gridRow);
                blockData.col = parseInt(block.dataset.gridCol);
            }
            
            if (block.dataset.shiftAxis) {
                blockData.shiftAxis = block.dataset.shiftAxis;
            }
            
            scene.blocks.push(blockData);
        }
    });
    
    const sceneJSON = JSON.stringify(scene, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(sceneJSON).then(() => {
        alert('Scene copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy to clipboard: ', err);
        alert('Failed to copy to clipboard');
    });
}

// Load scene from JSON
function loadScene() {
    const sceneJSON = document.getElementById('gridData').value;
    
    if (!sceneJSON.trim()) {
        alert('No scene data to load');
        return;
    }
    
    try {
        const scene = JSON.parse(sceneJSON);
        
        // Clear all blocks from grid
        const allBlocks = document.querySelectorAll('.block');
        allBlocks.forEach(block => {
            if (block.style.position === 'absolute') {
                // Remove from grid tracking
                if (block.dataset.onGrid === 'true') {
                    const row = parseInt(block.dataset.gridRow);
                    const col = parseInt(block.dataset.gridCol);
                    gridBlocks.delete(`${row},${col}`);
                }
                
                // Return to supply
                const supply = document.getElementById('supply');
                block.style.position = '';
                block.style.left = '';
                block.style.top = '';
                delete block.dataset.onGrid;
                delete block.dataset.gridRow;
                delete block.dataset.gridCol;
                delete block.dataset.shiftAxis;
                
                // Reset to green
                COLORS.forEach(c => block.classList.remove(c));
                block.classList.add('bg-green');
                
                supply.appendChild(block);
            }
        });
        
        // Re-sort supply
        const supply = document.getElementById('supply');
        const supplyBlocks = Array.from(supply.children);
        supplyBlocks.sort((a, b) => {
            const aIsBlank = a.dataset.isBlank === 'true';
            const bIsBlank = b.dataset.isBlank === 'true';
            if (aIsBlank && !bIsBlank) return 1;
            if (!aIsBlank && bIsBlank) return -1;
            if (aIsBlank && bIsBlank) return 0;
            const aNum = parseInt(a.dataset.number);
            const bNum = parseInt(b.dataset.number);
            return aNum - bNum;
        });
        supply.innerHTML = '';
        supplyBlocks.forEach(b => supply.appendChild(b));
        
        // Place blocks according to scene data
        scene.blocks.forEach(blockData => {
            let blockToPlace;
            
            if (blockData.isBlank) {
                // For blank blocks, always create a new one (never remove from supply)
                blockToPlace = createBlock('', true);
            } else {
                // For numbered blocks, find and use the existing block
                blockToPlace = Array.from(allBlocks).find(b => 
                    b.dataset.number === blockData.number && 
                    b.dataset.isBlank === String(blockData.isBlank)
                );
                
                if (blockToPlace && blockToPlace.parentElement) {
                    blockToPlace.remove();
                }
            }
            
            if (blockToPlace) {
                // Set color
                COLORS.forEach(c => blockToPlace.classList.remove(c));
                blockToPlace.classList.add(blockData.color);
                
                // Position the block
                blockToPlace.style.position = 'absolute';
                blockToPlace.style.left = blockData.left + 'px';
                blockToPlace.style.top = blockData.top + 'px';
                
                if (blockData.onGrid) {
                    blockToPlace.dataset.onGrid = 'true';
                    blockToPlace.dataset.gridRow = blockData.row;
                    blockToPlace.dataset.gridCol = blockData.col;
                    gridBlocks.set(`${blockData.row},${blockData.col}`, blockToPlace);
                } else {
                    delete blockToPlace.dataset.onGrid;
                    delete blockToPlace.dataset.gridRow;
                    delete blockToPlace.dataset.gridCol;
                }
                
                if (blockData.shiftAxis) {
                    blockToPlace.dataset.shiftAxis = blockData.shiftAxis;
                } else {
                    delete blockToPlace.dataset.shiftAxis;
                }
                
                document.body.appendChild(blockToPlace);
            }
        });
        
        // Clear the text area after successful load
        document.getElementById('gridData').value = '';
        alert('Scene loaded successfully!');
    } catch (e) {
        alert('Error loading scene: ' + e.message);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    initSupply();
    
    // Capture button
    document.getElementById('captureBtn').addEventListener('click', captureGridState);
    
    // Load button
    document.getElementById('loadBtn').addEventListener('click', loadScene);
    
    // Allow drops on grid
    const grid = document.getElementById('grid');
    grid.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    
    // Context menu event listeners
    const contextMenu = document.getElementById('contextMenu');
    const menuItems = contextMenu.querySelectorAll('.context-menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const direction = item.dataset.direction;
            shiftBlock(direction);
        });
    });
    
    // Hide context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target) && e.button !== 2) {
            hideContextMenu();
        }
    });
    
    // Prevent context menu from closing when right-clicking on it
    contextMenu.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});
