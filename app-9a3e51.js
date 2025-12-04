// Constants
const GRID_SIZE = 18;
const CELL_SIZE = 40;
const BLOCK_SIZE = 80;
const HALF_BLOCK_VERTICAL_WIDTH = 40;
const HALF_BLOCK_VERTICAL_HEIGHT = 80;
const HALF_BLOCK_HORIZONTAL_WIDTH = 80;
const HALF_BLOCK_HORIZONTAL_HEIGHT = 40;
const NUM_BLOCKS = 24;

// State management
const gridState = {};
let draggedBlock = null;
let draggedBlockOriginalParent = null;
let draggedBlockOriginalPosition = null;
let offsetX = 0;
let offsetY = 0;
let clickedQuadrant = { row: 0, col: 0 }; // Which quadrant within the block was clicked

// Initialize the application
function init() {
    createGrid();
    createSupplyBlocks();
    setupEventListeners();
}

// Create the 50x50 grid
function createGrid() {
    const grid = document.getElementById('design-grid');
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            grid.appendChild(cell);
        }
    }
}

// Create supply blocks (1-24 and blank)
function createSupplyBlocks() {
    const supplyArea = document.getElementById('supply-area');
    
    // Create numbered blocks 1-24
    for (let i = 1; i <= NUM_BLOCKS; i++) {
        const block = createBlock(i);
        supplyArea.appendChild(block);
    }
    
    // Create blank block (full size)
    const blankBlock = createBlock(0);
    blankBlock.classList.add('blank');
    supplyArea.appendChild(blankBlock);
    
    // Create half-size vertical blank block (50px x 100px)
    const halfVerticalBlock = createBlock(0, 'half-vertical');
    halfVerticalBlock.classList.add('blank', 'half-vertical');
    supplyArea.appendChild(halfVerticalBlock);
    
    // Create half-size horizontal blank block (100px x 50px)
    const halfHorizontalBlock = createBlock(0, 'half-horizontal');
    halfHorizontalBlock.classList.add('blank', 'half-horizontal');
    supplyArea.appendChild(halfHorizontalBlock);
}

// Create a single block element
function createBlock(number, blockType = 'full') {
    const block = document.createElement('div');
    block.className = 'block';
    block.dataset.number = number;
    block.dataset.blockType = blockType;
    block.draggable = true;
    
    // Add number text
    const numberText = document.createElement('span');
    numberText.textContent = number === 0 ? '' : number;
    numberText.style.position = 'relative';
    numberText.style.top = '-2px';
    block.appendChild(numberText);
    
    block.addEventListener('dragstart', handleDragStart);
    block.addEventListener('dragend', handleDragEnd);
    block.addEventListener('dblclick', handleBlockDoubleClick);
    
    return block;
}

// Create a placeholder for a numbered block
function createPlaceholder(number) {
    const placeholder = document.createElement('div');
    placeholder.className = 'block placeholder';
    placeholder.dataset.number = number;
    placeholder.textContent = number;
    placeholder.draggable = false;
    
    return placeholder;
}

// Handle drag start
function handleDragStart(e) {
    try {
        draggedBlock = e.target;
        const rect = draggedBlock.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        draggedBlockOriginalParent = draggedBlock.parentElement;
        
        // Store original position if on grid
        if (draggedBlock.classList.contains('on-grid')) {
            draggedBlockOriginalPosition = {
                left: draggedBlock.style.left,
                top: draggedBlock.style.top
            };
        }
        
        // Determine which quadrant was clicked within the block
        const blockType = draggedBlock.dataset.blockType || 'full';
        const blockWidth = rect.width;
        const blockHeight = rect.height;
        
        if (blockType === 'full') {
            // Full block is 2x2 cells
            clickedQuadrant = {
                col: offsetX < blockWidth / 2 ? 0 : 1,
                row: offsetY < blockHeight / 2 ? 0 : 1
            };
        } else if (blockType === 'half-vertical') {
            // Half-vertical is 1 cell wide, 2 cells tall
            clickedQuadrant = {
                col: 0,
                row: offsetY < blockHeight / 2 ? 0 : 1
            };
        } else if (blockType === 'half-horizontal') {
            // Half-horizontal is 2 cells wide, 1 cell tall
            clickedQuadrant = {
                col: offsetX < blockWidth / 2 ? 0 : 1,
                row: 0
            };
        }
        
        draggedBlock.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', draggedBlock.innerHTML);
    } catch (error) {
        console.error('Error in handleDragStart:', error);
    }
}

// Handle drag end
function handleDragEnd(e) {
    try {
        if (!draggedBlock) return;
        
        draggedBlock.classList.remove('dragging');
        
        const gridElement = document.getElementById('design-grid');
        const gridRect = gridElement.getBoundingClientRect();
        
        // Use cursor position instead of block corner
        const cursorX = e.clientX;
        const cursorY = e.clientY;
        
        // Check if cursor is on grid
        const isOnGrid = cursorX >= gridRect.left && 
                        cursorX <= gridRect.right &&
                        cursorY >= gridRect.top && 
                        cursorY <= gridRect.bottom;
        
        if (isOnGrid) {
            placeBlockOnGrid(cursorX, cursorY, gridRect);
        } else {
            returnBlockToSupply();
        }
        
        draggedBlock = null;
        draggedBlockOriginalParent = null;
        draggedBlockOriginalPosition = null;
    } catch (error) {
        console.error('Error in handleDragEnd:', error);
    }
}

// Place block on grid
function placeBlockOnGrid(cursorX, cursorY, gridRect) {
    const relativeX = cursorX - gridRect.left;
    const relativeY = cursorY - gridRect.top;
    
    // Calculate grid cell where cursor is
    const cursorCellCol = Math.floor(relativeX / CELL_SIZE);
    const cursorCellRow = Math.floor(relativeY / CELL_SIZE);
    
    // Adjust for the quadrant that was clicked - the clicked quadrant should be at the cursor position
    const col = cursorCellCol - clickedQuadrant.col;
    const row = cursorCellRow - clickedQuadrant.row;
    
    // Get block type and determine cells it will occupy
    const blockType = draggedBlock.dataset.blockType || 'full';
    let cells = [];
    
    // Check if block fits completely on grid based on its size
    if (blockType === 'half-vertical') {
        // 50px x 100px (1 cell wide, 2 cells tall)
        if (col < 0 || col >= GRID_SIZE || row < 0 || row + 1 >= GRID_SIZE) {
            returnBlockToSupply();
            return;
        }
        cells = [
            `${row},${col}`,
            `${row + 1},${col}`
        ];
    } else if (blockType === 'half-horizontal') {
        // 100px x 50px (2 cells wide, 1 cell tall)
        if (col < 0 || col + 1 >= GRID_SIZE || row < 0 || row >= GRID_SIZE) {
            returnBlockToSupply();
            return;
        }
        cells = [
            `${row},${col}`,
            `${row},${col + 1}`
        ];
    } else {
        // Full size: 100px x 100px (2x2 cells)
        if (col < 0 || col + 1 >= GRID_SIZE || row < 0 || row + 1 >= GRID_SIZE) {
            returnBlockToSupply();
            return;
        }
        cells = [
            `${row},${col}`,
            `${row},${col + 1}`,
            `${row + 1},${col}`,
            `${row + 1},${col + 1}`
        ];
    }
    
    // Remove old position from grid state if moving from grid
    if (draggedBlock.classList.contains('on-grid') && draggedBlockOriginalPosition) {
        const oldRow = parseInt(draggedBlock.dataset.gridRow);
        const oldCol = parseInt(draggedBlock.dataset.gridCol);
        const oldBlockType = draggedBlock.dataset.blockType || 'full';
        removeBlockFromGridState(oldRow, oldCol, oldBlockType);
    }
    
    // Check if any cell is occupied by a different block
    const draggedBlockNumber = parseInt(draggedBlock.dataset.number);
    const isMovingExistingBlock = draggedBlock.classList.contains('on-grid') && draggedBlockOriginalPosition;
    
    for (const cellKey of cells) {
        if (gridState[cellKey]) {
            // Allow if this is the same block being moved (not blank blocks, which can have multiple instances)
            const isSameBlock = isMovingExistingBlock && 
                               gridState[cellKey].blockNumber === draggedBlockNumber &&
                               draggedBlockNumber !== 0;
            
            if (!isSameBlock) {
                // Cell occupied by another block, return to original position or supply
                if (draggedBlockOriginalPosition) {
                    draggedBlock.style.left = draggedBlockOriginalPosition.left;
                    draggedBlock.style.top = draggedBlockOriginalPosition.top;
                    // Re-add to grid state since we removed it earlier
                    const oldRow = parseInt(draggedBlock.dataset.gridRow);
                    const oldCol = parseInt(draggedBlock.dataset.gridCol);
                    const oldBlockType = draggedBlock.dataset.blockType || 'full';
                    let oldCells = [];
                    
                    if (oldBlockType === 'half-vertical') {
                        oldCells = [
                            `${oldRow},${oldCol}`,
                            `${oldRow + 1},${oldCol}`
                        ];
                    } else if (oldBlockType === 'half-horizontal') {
                        oldCells = [
                            `${oldRow},${oldCol}`,
                            `${oldRow},${oldCol + 1}`
                        ];
                    } else {
                        oldCells = [
                            `${oldRow},${oldCol}`,
                            `${oldRow},${oldCol + 1}`,
                            `${oldRow + 1},${oldCol}`,
                            `${oldRow + 1},${oldCol + 1}`
                        ];
                    }
                    
                    const blockNum = parseInt(draggedBlock.dataset.number);
                    const bgColor = window.getComputedStyle(draggedBlock).backgroundColor;
                    for (const cellKey of oldCells) {
                        gridState[cellKey] = {
                            blockNumber: blockNum,
                            backgroundColor: bgColor
                        };
                    }
                } else {
                    returnBlockToSupply();
                }
                updateBlockStats();
                return;
            }
        }
    }
    
    // Place block
    const gridElement = document.getElementById('design-grid');
    if (draggedBlock.parentElement !== gridElement) {
        gridElement.appendChild(draggedBlock);
    }
    
    draggedBlock.classList.add('on-grid');
    draggedBlock.style.left = `${col * CELL_SIZE}px`;
    draggedBlock.style.top = `${row * CELL_SIZE}px`;
    draggedBlock.dataset.gridRow = row;
    draggedBlock.dataset.gridCol = col;
    
    // Update grid state
    const blockNumber = parseInt(draggedBlock.dataset.number);
    const backgroundColor = window.getComputedStyle(draggedBlock).backgroundColor;
    
    for (const cellKey of cells) {
        gridState[cellKey] = {
            blockNumber: blockNumber,
            backgroundColor: backgroundColor
        };
    }
    
    // If it's a blank block (0), keep it in supply
    if (blockNumber === 0) {
        const supplyArea = document.getElementById('supply-area');
        const currentBlockType = draggedBlock.dataset.blockType || 'full';
        const hasBlankInSupply = Array.from(supplyArea.children).some(
            child => child.dataset.number === '0' && 
                     child.dataset.blockType === currentBlockType &&
                     !child.classList.contains('on-grid')
        );
        
        if (!hasBlankInSupply) {
            const newBlankBlock = createBlock(0, currentBlockType);
            newBlankBlock.classList.add('blank');
            if (currentBlockType === 'half-vertical') {
                newBlankBlock.classList.add('half-vertical');
            } else if (currentBlockType === 'half-horizontal') {
                newBlankBlock.classList.add('half-horizontal');
            }
            
            // Insert blank block in correct sorted position
            const allBlocks = Array.from(supplyArea.children);
            const blankBlocks = allBlocks.filter(b => b.dataset.number === '0');
            const order = { 'full': 0, 'half-vertical': 1, 'half-horizontal': 2 };
            
            // Find the correct position to insert
            let insertBefore = null;
            for (const block of blankBlocks) {
                const blockType = block.dataset.blockType || 'full';
                if (order[blockType] > order[currentBlockType]) {
                    insertBefore = block;
                    break;
                }
            }
            
            if (insertBefore) {
                supplyArea.insertBefore(newBlankBlock, insertBefore);
            } else {
                supplyArea.appendChild(newBlankBlock);
            }
        }
    } else {
        // For numbered blocks, create a placeholder in supply if coming from supply
        if (draggedBlockOriginalParent && draggedBlockOriginalParent.id === 'supply-area') {
            const placeholder = createPlaceholder(blockNumber);
            draggedBlockOriginalParent.appendChild(placeholder);
            sortSupplyArea();
        }
    }
    
    // Update block stats after placing block
    updateBlockStats();
}

// Return block to supply
function returnBlockToSupply() {
    const blockNumber = parseInt(draggedBlock.dataset.number);
    const blockType = draggedBlock.dataset.blockType || 'full';
    
    // If it's a blank block on grid, just remove it
    if (blockNumber === 0 && draggedBlock.classList.contains('on-grid')) {
        const row = parseInt(draggedBlock.dataset.gridRow);
        const col = parseInt(draggedBlock.dataset.gridCol);
        removeBlockFromGridState(row, col, blockType);
        draggedBlock.remove();
        updateBlockStats();
        return;
    }
    
    // Remove from grid state if it was on grid
    if (draggedBlock.classList.contains('on-grid')) {
        const row = parseInt(draggedBlock.dataset.gridRow);
        const col = parseInt(draggedBlock.dataset.gridCol);
        removeBlockFromGridState(row, col, blockType);
    }
    
    // Return numbered block to supply
    draggedBlock.classList.remove('on-grid');
    draggedBlock.style.left = '';
    draggedBlock.style.top = '';
    delete draggedBlock.dataset.gridRow;
    delete draggedBlock.dataset.gridCol;
    
    const supplyArea = document.getElementById('supply-area');
    
    // Only add back if it's not already in supply (numbered blocks only)
    if (blockNumber !== 0) {
        // Find and replace placeholder if it exists
        const placeholder = Array.from(supplyArea.children).find(
            child => child.classList.contains('placeholder') && 
                     child.dataset.number === draggedBlock.dataset.number
        );
        
        if (placeholder) {
            supplyArea.replaceChild(draggedBlock, placeholder);
            sortSupplyArea();
        } else {
            const existingInSupply = Array.from(supplyArea.children).find(
                child => child.dataset.number === draggedBlock.dataset.number
            );
            
            if (!existingInSupply) {
                supplyArea.appendChild(draggedBlock);
                sortSupplyArea();
            }
        }
    }
    
    // Update block stats after returning block
    updateBlockStats();
}

// Remove block from grid state
function removeBlockFromGridState(row, col, blockType = 'full') {
    let cells = [];
    
    if (blockType === 'half-vertical') {
        cells = [
            `${row},${col}`,
            `${row + 1},${col}`
        ];
    } else if (blockType === 'half-horizontal') {
        cells = [
            `${row},${col}`,
            `${row},${col + 1}`
        ];
    } else {
        cells = [
            `${row},${col}`,
            `${row},${col + 1}`,
            `${row + 1},${col}`,
            `${row + 1},${col + 1}`
        ];
    }
    
    for (const cellKey of cells) {
        delete gridState[cellKey];
    }
}

// Sort supply area blocks by number
function sortSupplyArea() {
    const supplyArea = document.getElementById('supply-area');
    const blocks = Array.from(supplyArea.children);
    
    blocks.sort((a, b) => {
        const numA = parseInt(a.dataset.number);
        const numB = parseInt(b.dataset.number);
        const typeA = a.dataset.blockType || 'full';
        const typeB = b.dataset.blockType || 'full';
        
        // Blank blocks (0) always go last
        if (numA === 0 && numB === 0) {
            // Sort blank blocks: full, half-vertical, half-horizontal
            const order = { 'full': 0, 'half-vertical': 1, 'half-horizontal': 2 };
            return order[typeA] - order[typeB];
        }
        if (numA === 0) return 1;
        if (numB === 0) return -1;
        
        return numA - numB;
    });
    
    // Re-append in sorted order
    blocks.forEach(block => supplyArea.appendChild(block));
}

// Setup event listeners for buttons
function setupEventListeners() {
    document.getElementById('capture-btn').addEventListener('click', captureScene);
    document.getElementById('load-btn').addEventListener('click', loadScene);
    document.getElementById('reset-btn').addEventListener('click', resetPage);
    
    // Close context menu when clicking anywhere
    document.addEventListener('click', closeContextMenu);
}

// Reset page with confirmation
function resetPage() {
    if (confirm('Are you sure you want to reset? This will clear all blocks and reload the page.')) {
        location.reload();
    }
}

// Capture scene to clipboard
function captureScene() {
    try {
        // Get all blocks on grid
        const gridElement = document.getElementById('design-grid');
        const blocksOnGrid = gridElement.querySelectorAll('.block');
        
        // Do nothing if no blocks on grid
        if (blocksOnGrid.length === 0) {
            return;
        }
        
        const blocks = [];
        blocksOnGrid.forEach(block => {
            const row = parseInt(block.dataset.gridRow);
            const col = parseInt(block.dataset.gridCol);
            const blockNumber = parseInt(block.dataset.number);
            const blockType = block.dataset.blockType || 'full';
            const backgroundColor = block.style.backgroundColor || window.getComputedStyle(block).backgroundColor;
            
            // Convert background color to color name
            const colorName = getColorNameFromRgb(backgroundColor);
            
            blocks.push({
                row,
                col,
                number: blockNumber,
                blockType: blockType,
                color: colorName
            });
        });
        
        const sceneData = JSON.stringify(blocks);
        
        // Copy to clipboard
        navigator.clipboard.writeText(sceneData).then(() => {
            alert('Scene captured to clipboard!');
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
            alert('Error copying to clipboard');
        });
    } catch (error) {
        console.error('Error in captureScene:', error);
        alert('Error capturing scene');
    }
}

// Load scene from textarea
function loadScene() {
    try {
        const textarea = document.getElementById('scene-data');
        const sceneData = textarea.value.trim();
        
        if (!sceneData) {
            return;
        }
        
        const blocks = JSON.parse(sceneData);
        
        // Clear current grid
        clearGrid();
        
        // Recreate blocks from loaded data
        const gridElement = document.getElementById('design-grid');
        const supplyArea = document.getElementById('supply-area');
        
        blocks.forEach(blockData => {
            const { row, col, number, blockType = 'full', color, bgColor, borderColor, textColor } = blockData;
            
            // Get color object - support both new format (color name) and old format (RGB values)
            let colorObj;
            if (color) {
                // New format: color name
                colorObj = getColorFromName(color);
            } else if (bgColor) {
                // Old format: RGB values - convert to color name first
                colorObj = getColorFromName(getColorNameFromRgb(bgColor));
            } else {
                // Fallback to default
                colorObj = COLOR_OPTIONS[1]; // Green
            }
            
            // Create or find block
            let block;
            
            if (number === 0) {
                block = createBlock(0, blockType);
                block.classList.add('blank');
                if (blockType === 'half-vertical') {
                    block.classList.add('half-vertical');
                } else if (blockType === 'half-horizontal') {
                    block.classList.add('half-horizontal');
                }
            } else {
                // Find existing block in supply area
                block = Array.from(supplyArea.children).find(
                    child => parseInt(child.dataset.number) === number && 
                             !child.classList.contains('placeholder')
                );
                
                if (!block) {
                    block = createBlock(number, blockType);
                }
            }
            
            // Place block on grid
            gridElement.appendChild(block);
            
            block.classList.add('on-grid');
            block.style.left = `${col * CELL_SIZE}px`;
            block.style.top = `${row * CELL_SIZE}px`;
            block.style.backgroundColor = colorObj.bg;
            block.style.borderColor = colorObj.border;
            block.style.color = colorObj.textColor;
            block.dataset.gridRow = row;
            block.dataset.gridCol = col;
            block.dataset.blockType = blockType;
            
            // Update grid state based on block type
            let cells = [];
            if (blockType === 'half-vertical') {
                cells = [
                    `${row},${col}`,
                    `${row + 1},${col}`
                ];
            } else if (blockType === 'half-horizontal') {
                cells = [
                    `${row},${col}`,
                    `${row},${col + 1}`
                ];
            } else {
                cells = [
                    `${row},${col}`,
                    `${row},${col + 1}`,
                    `${row + 1},${col}`,
                    `${row + 1},${col + 1}`
                ];
            }
            
            for (const cellKey of cells) {
                gridState[cellKey] = {
                    blockNumber: number,
                    backgroundColor: colorObj.bg
                };
            }
            
            // If numbered block, create placeholder in supply
            if (number !== 0) {
                const placeholder = createPlaceholder(number);
                supplyArea.appendChild(placeholder);
                sortSupplyArea();
            }
        });
        
        updateBlockStats();
        alert('Scene loaded successfully!');
    } catch (error) {
        console.error('Error in loadScene:', error);
        alert('Error loading scene. Please check the data format.');
    }
}

// Clear grid
function clearGrid() {
    const gridElement = document.getElementById('design-grid');
    const blocksOnGrid = Array.from(gridElement.querySelectorAll('.block'));
    const supplyArea = document.getElementById('supply-area');
    
    blocksOnGrid.forEach(block => {
        const blockNumber = parseInt(block.dataset.number);
        const blockType = block.dataset.blockType || 'full';
        
        // Remove from grid state
        if (block.classList.contains('on-grid')) {
            const row = parseInt(block.dataset.gridRow);
            const col = parseInt(block.dataset.gridCol);
            removeBlockFromGridState(row, col, blockType);
        }
        
        // Return numbered blocks to supply
        if (blockNumber !== 0) {
            // Find and replace placeholder if it exists
            const placeholder = Array.from(supplyArea.children).find(
                child => child.classList.contains('placeholder') && 
                         child.dataset.number === block.dataset.number
            );
            
            if (placeholder) {
                block.classList.remove('on-grid');
                block.style.left = '';
                block.style.top = '';
                delete block.dataset.gridRow;
                delete block.dataset.gridCol;
                supplyArea.replaceChild(block, placeholder);
                sortSupplyArea();
            }
        }
        
        // Remove blank blocks (they stay in supply)
        if (blockNumber === 0) {
            block.remove();
        }
    });
    
    // Clear grid state
    for (const key in gridState) {
        delete gridState[key];
    }
}

// Color options with their properties
const COLOR_OPTIONS = [
    { name: 'Red', bg: '#c92d22', border: '#5a0f0a', textColor: '#5a0f0a' },
    { name: 'Green', bg: '#4caf50', border: '#14532d', textColor: '#14532d' },
    { name: 'Blue', bg: '#2196f3', border: '#0d47a1', textColor: '#0d47a1' },
    { name: 'White', bg: '#ffffff', border: '#999999', textColor: '#999999' },
    { name: 'Gold', bg: '#ffc107', border: '#b8860b', textColor: '#b8860b' },
    { name: 'Silver', bg: '#c0c0c0', border: '#808080', textColor: '#808080' },
    { name: 'Brown', bg: '#795548', border: '#3e2723', textColor: '#3e2723' },
    { name: 'Yellow', bg: '#ffee58', border: '#b8860b', textColor: '#b8860b' }
];

let currentContextBlock = null;

// Helper function to convert RGB to hex
function rgbToHex(rgb) {
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    const r = parseInt(result[0]);
    const g = parseInt(result[1]);
    const b = parseInt(result[2]);
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// Helper function to get color name from RGB background color
function getColorNameFromRgb(bgColor) {
    const hexColor = bgColor.startsWith('#') ? bgColor.toLowerCase() : rgbToHex(bgColor).toLowerCase();
    
    const colorOption = COLOR_OPTIONS.find(option => option.bg.toLowerCase() === hexColor);
    return colorOption ? colorOption.name : 'Green'; // Default to Green if not found
}

// Helper function to get color object from name
function getColorFromName(colorName) {
    const colorOption = COLOR_OPTIONS.find(option => option.name === colorName);
    return colorOption || COLOR_OPTIONS[1]; // Default to Green if not found
}

// Handle block double-click
function handleBlockDoubleClick(e) {
    try {
        e.preventDefault();
        e.stopPropagation();
        
        const block = e.currentTarget;
        
        // Don't show menu for placeholders
        if (block.classList.contains('placeholder')) {
            return;
        }
        
        currentContextBlock = block;
        
        // Remove existing context menu
        closeContextMenu();
        
        // Get block position
        const rect = block.getBoundingClientRect();
        
        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.id = 'color-context-menu';
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;
        
        // Add color options
        COLOR_OPTIONS.forEach(color => {
            const item = document.createElement('div');
            item.className = 'context-menu-item';
            
            const preview = document.createElement('div');
            preview.className = 'color-preview';
            preview.style.backgroundColor = color.bg;
            preview.style.borderColor = color.border;
            
            const label = document.createElement('span');
            label.textContent = color.name;
            
            item.appendChild(preview);
            item.appendChild(label);
            
            item.addEventListener('click', (event) => {
                event.stopPropagation();
                changeBlockColor(color);
                closeContextMenu();
            });
            
            menu.appendChild(item);
        });
        
        document.body.appendChild(menu);
    } catch (error) {
        console.error('Error in handleBlockDoubleClick:', error);
    }
}

// Close context menu
function closeContextMenu() {
    const menu = document.getElementById('color-context-menu');
    if (menu) {
        menu.remove();
    }
}

// Change block color
function changeBlockColor(color) {
    if (!currentContextBlock) return;
    
    try {
        currentContextBlock.style.backgroundColor = color.bg;
        currentContextBlock.style.borderColor = color.border;
        currentContextBlock.style.color = color.textColor;
        
        // Update grid state if block is on grid
        if (currentContextBlock.classList.contains('on-grid')) {
            const row = parseInt(currentContextBlock.dataset.gridRow);
            const col = parseInt(currentContextBlock.dataset.gridCol);
            
            const cells = [
                `${row},${col}`,
                `${row},${col + 1}`,
                `${row + 1},${col}`,
                `${row + 1},${col + 1}`
            ];
            
            for (const cellKey of cells) {
                if (gridState[cellKey]) {
                    gridState[cellKey].backgroundColor = color.bg;
                }
            }
        }
        
        // Update block stats if block is on grid
        if (currentContextBlock.classList.contains('on-grid')) {
            updateBlockStats();
        }
        
        currentContextBlock = null;
    } catch (error) {
        console.error('Error in changeBlockColor:', error);
    }
}

// Update block statistics
function updateBlockStats() {
    const gridElement = document.getElementById('design-grid');
    const blocksOnGrid = Array.from(gridElement.querySelectorAll('.block'));
    const statsElement = document.getElementById('block-stats');
    
    if (blocksOnGrid.length === 0) {
        statsElement.innerHTML = '';
        return;
    }
    
    // Count by color-type combination
    const colorTypeCounts = {};
    
    blocksOnGrid.forEach(block => {
        const blockNumber = parseInt(block.dataset.number);
        const blockType = block.dataset.blockType || 'full';
        const backgroundColor = block.style.backgroundColor || window.getComputedStyle(block).backgroundColor;
        
        // Get color name
        const colorName = getColorNameFromRgb(backgroundColor);
        
        // Determine type label
        let typeLabel;
        if (blockNumber === 0) {
            if (blockType === 'half-vertical') {
                typeLabel = 'Half-Vertical Blank';
            } else if (blockType === 'half-horizontal') {
                typeLabel = 'Half-Horizontal Blank';
            } else {
                typeLabel = 'Full Blank';
            }
        } else {
            typeLabel = 'Numbered';
        }
        
        // Create color-type key
        const key = `${colorName}-${typeLabel}`;
        colorTypeCounts[key] = (colorTypeCounts[key] || 0) + 1;
    });
    
    // Build stats display
    const stats = Object.entries(colorTypeCounts)
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .map(([key, count]) => {
            const [color, ...typeParts] = key.split('-');
            const type = typeParts.join('-');
            const colorObj = getColorFromName(color);
            return `<span class="inline-flex items-center gap-1">
                <span class="inline-block w-4 h-4 border" style="background-color: ${colorObj.bg}; border-color: ${colorObj.border};"></span>
                <span>${color}-${type}: ${count}</span>
            </span>`;
        });
    
    statsElement.innerHTML = stats.join(', ');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
