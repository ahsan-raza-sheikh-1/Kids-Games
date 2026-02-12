// ====================
// NEW GAMES IMPLEMENTATION
// ====================

// SUDOKU GAME
let sudokuState = {
    grid: [],
    solution: [],
    difficulty: '4x4',
    hintsLeft: 3
};

function startSudokuGame() {
    sudokuState.difficulty = '4x4'; // Kid-friendly 4x4 grid
    sudokuState.hintsLeft = 3;
    generateSudoku();
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content" style="max-width: 500px;">
                <h2>🔢 Sudoku Puzzle</h2>
                <p>Fill each row and column with numbers 1-4!</p>
                <div class="sudoku-info" style="margin-bottom: 1rem; display: flex; justify-content: space-between;">
                    <span>💡 Hints left: <strong>${sudokuState.hintsLeft}</strong></span>
                    <button onclick="toggleSudokuDifficulty()" style="padding: 0.5rem 1rem; background: #4ECDC4; color: white; border: none; border-radius: 8px; cursor: pointer;">Switch to 6x6</button>
                </div>
                <div id="sudoku-grid" class="sudoku-grid">
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
                    <button onclick="getSudokuHint()" class="control-btn" style="background: #FFA726;">💡 Get Hint</button>
                    <button onclick="checkSudokuSolution()" class="control-btn primary">✅ Check</button>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    renderSudokuGrid();
}

function generateSudoku() {
    const size = sudokuState.difficulty === '4x4' ? 4 : 6;
    sudokuState.grid = [];
    sudokuState.solution = [];
    
    // Generate complete solution first
    for (let i = 0; i < size; i++) {
        sudokuState.solution[i] = [];
        for (let j = 0; j < size; j++) {
            sudokuState.solution[i][j] = ((i * (size === 4 ? 2 : 3) + i / (size === 4 ? 2 : 3) + j) % size) + 1;
        }
    }
    
    // Create puzzle by removing some numbers
    for (let i = 0; i < size; i++) {
        sudokuState.grid[i] = [];
        for (let j = 0; j < size; j++) {
            // Remove about 40% of numbers
            sudokuState.grid[i][j] = Math.random() > 0.4 ? sudokuState.solution[i][j] : 0;
        }
    }
}

function renderSudokuGrid() {
    const container = document.getElementById('sudoku-grid');
    const size = sudokuState.difficulty === '4x4' ? 4 : 6;
    const cellSize = sudokuState.difficulty === '4x4' ? '60px' : '45px';
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${size}, ${cellSize})`;
    container.style.gap = '2px';
    container.style.margin = '0 auto';
    container.style.width = 'fit-content';
    
    container.innerHTML = '';
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.style.width = cellSize;
            cell.style.height = cellSize;
            cell.style.border = '2px solid #4ECDC4';
            cell.style.borderRadius = '5px';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '1.5rem';
            cell.style.fontWeight = 'bold';
            cell.style.cursor = 'pointer';
            cell.style.background = sudokuState.grid[i][j] !== 0 ? '#f0f0f0' : 'white';
            
            if (sudokuState.grid[i][j] !== 0) {
                cell.textContent = sudokuState.grid[i][j];
                cell.style.color = '#666';
            } else {
                cell.onclick = () => selectSudokuCell(i, j, cell);
            }
            
            container.appendChild(cell);
        }
    }
}

function selectSudokuCell(row, col, cellElement) {
    const size = sudokuState.difficulty === '4x4' ? 4 : 6;
    const choice = prompt(`Enter a number (1-${size}):`);
    const num = parseInt(choice);
    
    if (num >= 1 && num <= size) {
        sudokuState.grid[row][col] = num;
        cellElement.textContent = num;
        cellElement.style.color = '#FF6B6B';
        cellElement.style.background = '#fff9f0';
    }
}

function getSudokuHint() {
    if (sudokuState.hintsLeft <= 0) {
        alert('❌ No hints left!');
        return;
    }
    
    const size = sudokuState.difficulty === '4x4' ? 4 : 6;
    const emptyCells = [];
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (sudokuState.grid[i][j] === 0) {
                emptyCells.push([i, j]);
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        sudokuState.grid[row][col] = sudokuState.solution[row][col];
        sudokuState.hintsLeft--;
        closeMiniGame();
        startSudokuGame(); // Refresh display
    }
}

function checkSudokuSolution() {
    const size = sudokuState.difficulty === '4x4' ? 4 : 6;
    let correct = true;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (sudokuState.grid[i][j] !== sudokuState.solution[i][j]) {
                correct = false;
                break;
            }
        }
    }
    
    if (correct) {
        alert('🎉 Amazing! You solved the Sudoku puzzle!');
        audioManager.playSound('success');
        closeMiniGame();
    } else {
        alert('🤔 Not quite right yet! Keep trying or use a hint!');
    }
}

function toggleSudokuDifficulty() {
    sudokuState.difficulty = sudokuState.difficulty === '4x4' ? '6x6' : '4x4';
    sudokuState.hintsLeft = 3;
    closeMiniGame();
    startSudokuGame();
}
