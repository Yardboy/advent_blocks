// Constants
const GRID_SIZE = 18;
const CELL_SIZE = 50;
const BLOCK_SIZE = 100;
const NUM_BLOCKS = 24;

// State management
const gridState = {};
let draggedBlock = null;
let draggedBlockOriginalParent = null;
let draggedBlockOriginalPosition = null;
let offsetX = 0;
let offsetY = 0;

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
    
    // Create blank block
    const blankBlock = createBlock(0);
    blankBlock.classList.add('blank');
    supplyArea.appendChild(blankBlock);
}

// Create a single block element
function createBlock(number) {
    const block = document.createElement('div');
    block.className = 'block';
    block.dataset.number = number;
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
    
    // Calculate grid cell where cursor is (this becomes top-left corner of block)
    const col = Math.floor(relativeX / CELL_SIZE);
    const row = Math.floor(relativeY / CELL_SIZE);
    
    // Check if block fits completely on grid (2x2 cells)
    if (col + 1 >= GRID_SIZE || row + 1 >= GRID_SIZE) {
        returnBlockToSupply();
        return;
    }
    
    // Check if cells are occupied
    const cells = [
        `${row},${col}`,
        `${row},${col + 1}`,
        `${row + 1},${col}`,
        `${row + 1},${col + 1}`
    ];
    
    // Remove old position from grid state if moving from grid
    if (draggedBlock.classList.contains('on-grid') && draggedBlockOriginalPosition) {
        const oldRow = parseInt(draggedBlock.dataset.gridRow);
        const oldCol = parseInt(draggedBlock.dataset.gridCol);
        removeBlockFromGridState(oldRow, oldCol);
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
                    const oldCells = [
                        `${oldRow},${oldCol}`,
                        `${oldRow},${oldCol + 1}`,
                        `${oldRow + 1},${oldCol}`,
                        `${oldRow + 1},${oldCol + 1}`
                    ];
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
                validateDesign();
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
        const hasBlankInSupply = Array.from(supplyArea.children).some(
            child => child.dataset.number === '0'
        );
        
        if (!hasBlankInSupply) {
            const newBlankBlock = createBlock(0);
            newBlankBlock.classList.add('blank');
            supplyArea.appendChild(newBlankBlock);
        }
    } else {
        // For numbered blocks, create a placeholder in supply if coming from supply
        if (draggedBlockOriginalParent && draggedBlockOriginalParent.id === 'supply-area') {
            const placeholder = createPlaceholder(blockNumber);
            draggedBlockOriginalParent.appendChild(placeholder);
            sortSupplyArea();
        }
    }
    
    // Validate design after placing block
    validateDesign();
}

// Return block to supply
function returnBlockToSupply() {
    const blockNumber = parseInt(draggedBlock.dataset.number);
    
    // If it's a blank block on grid, just remove it
    if (blockNumber === 0 && draggedBlock.classList.contains('on-grid')) {
        const row = parseInt(draggedBlock.dataset.gridRow);
        const col = parseInt(draggedBlock.dataset.gridCol);
        removeBlockFromGridState(row, col);
        draggedBlock.remove();
        return;
    }
    
    // Remove from grid state if it was on grid
    if (draggedBlock.classList.contains('on-grid')) {
        const row = parseInt(draggedBlock.dataset.gridRow);
        const col = parseInt(draggedBlock.dataset.gridCol);
        removeBlockFromGridState(row, col);
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
    
    // Validate design after returning block
    validateDesign();
}

// Remove block from grid state
function removeBlockFromGridState(row, col) {
    const cells = [
        `${row},${col}`,
        `${row},${col + 1}`,
        `${row + 1},${col}`,
        `${row + 1},${col + 1}`
    ];
    
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
        
        // Blank block (0) always goes last
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
            const backgroundColor = block.style.backgroundColor || window.getComputedStyle(block).backgroundColor;
            const borderColor = block.style.borderColor || window.getComputedStyle(block).borderColor;
            const textColor = block.style.color || window.getComputedStyle(block).color;
            
            blocks.push({
                row,
                col,
                number: blockNumber,
                bgColor: backgroundColor,
                borderColor: borderColor,
                textColor: textColor
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
            const { row, col, number, bgColor, borderColor, textColor } = blockData;
            
            // Create or find block
            let block;
            
            if (number === 0) {
                block = createBlock(0);
                block.classList.add('blank');
            } else {
                // Find existing block in supply area
                block = Array.from(supplyArea.children).find(
                    child => parseInt(child.dataset.number) === number && 
                             !child.classList.contains('placeholder')
                );
                
                if (!block) {
                    block = createBlock(number);
                }
            }
            
            // Place block on grid
            gridElement.appendChild(block);
            
            block.classList.add('on-grid');
            block.style.left = `${col * CELL_SIZE}px`;
            block.style.top = `${row * CELL_SIZE}px`;
            block.style.backgroundColor = bgColor;
            block.style.borderColor = borderColor;
            block.style.color = textColor;
            block.dataset.gridRow = row;
            block.dataset.gridCol = col;
            
            // Update grid state
            const cells = [
                `${row},${col}`,
                `${row},${col + 1}`,
                `${row + 1},${col}`,
                `${row + 1},${col + 1}`
            ];
            
            for (const cellKey of cells) {
                gridState[cellKey] = {
                    blockNumber: number,
                    backgroundColor: bgColor
                };
            }
            
            // If numbered block, create placeholder in supply
            if (number !== 0) {
                const placeholder = createPlaceholder(number);
                supplyArea.appendChild(placeholder);
                sortSupplyArea();
            }
        });
        
        alert('Scene loaded successfully!');
    } catch (error) {
        console.error('Error in loadScene:', error);
        alert('Error loading scene. Please check the data format.');
    }
}

// Clear grid
function clearGrid() {
    const gridElement = document.getElementById('design-grid');
    const blocksOnGrid = gridElement.querySelectorAll('.block');
    
    blocksOnGrid.forEach(block => {
        const blockNumber = parseInt(block.dataset.number);
        if (blockNumber !== 0) {
            returnBlockToSupply();
        }
        block.remove();
    });
    
    // Clear grid state
    for (const key in gridState) {
        delete gridState[key];
    }
}

// Color options with their properties
const COLOR_OPTIONS = [
    { name: 'Red', bg: '#f44336', border: '#c62828', textColor: 'white' },
    { name: 'Green', bg: '#4caf50', border: '#14532d', textColor: 'white' },
    { name: 'Blue', bg: '#2196f3', border: '#0d47a1', textColor: 'white' },
    { name: 'White', bg: '#ffffff', border: '#999999', textColor: 'black' },
    { name: 'Gold', bg: '#ffc107', border: '#b8860b', textColor: 'black' },
    { name: 'Silver', bg: '#c0c0c0', border: '#808080', textColor: 'black' },
    { name: 'Brown', bg: '#795548', border: '#3e2723', textColor: 'white' },
    { name: 'Yellow', bg: '#ffee58', border: '#b8860b', textColor: 'black' }
];

let currentContextBlock = null;

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
        
        currentContextBlock = null;
    } catch (error) {
        console.error('Error in changeBlockColor:', error);
    }
}

// Validate design and check for errors
function validateDesign() {
    const errors = new Set();
    const errorCells = new Set();
    const gridElement = document.getElementById('design-grid');
    const blocksOnGrid = Array.from(gridElement.querySelectorAll('.block'));
    
    // Clear all existing error cell highlights
    const allCells = gridElement.querySelectorAll('.grid-cell');
    allCells.forEach(cell => cell.classList.remove('error-cell'));
    
    if (blocksOnGrid.length === 0) {
        displayErrors([]);
        return;
    }
    
    // Check for contiguity - all blocks should touch at least one other block
    if (blocksOnGrid.length > 1) {
        // For each block, check if all its border cells are empty
        for (const block of blocksOnGrid) {
            const row = parseInt(block.dataset.gridRow);
            const col = parseInt(block.dataset.gridCol);
            
            // Define the 8 border cells around this 2x2 block
            // Top row (above the block)
            // Left column (to the left)
            // Right column (to the right)
            // Bottom row (below the block)
            const borderCells = [
                // Top edge (2 cells above)
                `${row - 1},${col}`,
                `${row - 1},${col + 1}`,
                // Bottom edge (2 cells below)
                `${row + 2},${col}`,
                `${row + 2},${col + 1}`,
                // Left edge (2 cells to the left)
                `${row},${col - 1}`,
                `${row + 1},${col - 1}`,
                // Right edge (2 cells to the right)
                `${row},${col + 2}`,
                `${row + 1},${col + 2}`
            ];
            
            // Check if any border cell is occupied
            let hasNeighbor = false;
            for (const cellKey of borderCells) {
                if (gridState[cellKey]) {
                    hasNeighbor = true;
                    break;
                }
            }
            
            // If all border cells are empty, this block is isolated
            if (!hasNeighbor) {
                errors.add('Design has non-contiguous blocks');
                break; // Only need to report the error once
            }
        }
    }
    
    // Apply error cell highlighting
    errorCells.forEach(cellKey => {
        const [row, col] = cellKey.split(',').map(Number);
        const cellIndex = row * GRID_SIZE + col;
        const cell = allCells[cellIndex];
        if (cell) {
            cell.classList.add('error-cell');
        }
    });
    
    displayErrors(Array.from(errors));
}

// Display design errors
function displayErrors(errors) {
    const errorSection = document.getElementById('design-errors');
    const errorList = document.getElementById('error-list');
    
    if (errors.length === 0) {
        errorSection.classList.add('hidden');
        errorList.innerHTML = '';
    } else {
        errorSection.classList.remove('hidden');
        errorList.innerHTML = errors.map(error => `<li>${error}</li>`).join('');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
