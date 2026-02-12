// TIC-TAC-TOE GAME
let ticTacToeState = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    difficulty: 'easy',
    gameOver: false
};

function startTicTacToeGame() {
    ticTacToeState = {
        board: ['', '', '', '', '', '', '', '', ''],
        currentPlayer: 'X',
        difficulty: 'easy',
        gameOver: false
    };
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>❌⭕ Tic-Tac-Toe</h2>
                <p>You are <span style="color: #FF6B6B; font-weight: bold;">❌</span> - Try to get 3 in a row!</p>
                <div style="margin: 1rem 0;">
                    <label>Difficulty: </label>
                    <select id="ttt-difficulty" onchange="changeTTTDifficulty(this.value)" style="padding: 0.5rem; border-radius: 5px; border: 2px solid #4ECDC4;">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div id="ttt-board" class="ttt-board" style="display: grid; grid-template-columns: repeat(3, 100px); gap: 10px; margin: 2rem auto; width: fit-content;">
                </div>
                <div id="ttt-status" style="text-align: center; font-size: 1.2rem; font-weight: bold; margin: 1rem 0;"></div>
                <button onclick="closeMiniGame(); setTimeout(startTicTacToeGame, 100);" class="control-btn" style="margin: 0.5rem;">🔄 New Game</button>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    renderTTTBoard();
}

function renderTTTBoard() {
    const board = document.getElementById('ttt-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.style.width = '100px';
        cell.style.height = '100px';
        cell.style.background = 'white';
        cell.style.border = '3px solid #4ECDC4';
        cell.style.borderRadius = '10px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.fontSize = '3rem';
        cell.style.cursor = ticTacToeState.board[i] === '' && !ticTacToeState.gameOver ? 'pointer' : 'not-allowed';
        cell.textContent = ticTacToeState.board[i] === 'X' ? '❌' : (ticTacToeState.board[i] === 'O' ? '⭕' : '');
        
        if (!ticTacToeState.gameOver && ticTacToeState.board[i] === '') {
            cell.onclick = () => makeTTTMove(i);
            cell.onmouseover = () => cell.style.background = '#f0f8ff';
            cell.onmouseout = () => cell.style.background = 'white';
        }
        
        board.appendChild(cell);
    }
}

function makeTTTMove(index) {
    if (ticTacToeState.board[index] !== '' || ticTacToeState.gameOver) return;
    
    ticTacToeState.board[index] = 'X';
    renderTTTBoard();
    
    const winner = checkTTTWinner();
    if (winner) {
        endTTTGame(winner);
        return;
    }
    
    if (ticTacToeState.board.every(cell => cell !== '')) {
        endTTTGame('draw');
        return;
    }
    
    // Computer's turn
    setTimeout(() => {
        makeComputerMove();
        const winner = checkTTTWinner();
        if (winner) {
            endTTTGame(winner);
        } else if (ticTacToeState.board.every(cell => cell !== '')) {
            endTTTGame('draw');
        }
    }, 500);
}

function makeComputerMove() {
    const difficulty = ticTacToeState.difficulty;
    let move;
    
    if (difficulty === 'easy') {
        // Random move
        const empty = ticTacToeState.board.map((cell, idx) => cell === '' ? idx : null).filter(x => x !== null);
        move = empty[Math.floor(Math.random() * empty.length)];
    } else if (difficulty === 'medium') {
        // Try to win or block
        move = findWinningMove('O') || findWinningMove('X');
        if (move === null) {
            const empty = ticTacToeState.board.map((cell, idx) => cell === '' ? idx : null).filter(x => x !== null);
            move = empty[Math.floor(Math.random() * empty.length)];
        }
    } else {
        // Hard: Best strategy
        move = findBestMove();
    }
    
    if (move !== undefined && move !== null) {
        ticTacToeState.board[move] = 'O';
        renderTTTBoard();
    }
}

function findWinningMove(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const cells = [ticTacToeState.board[a], ticTacToeState.board[b], ticTacToeState.board[c]];
        const playerCount = cells.filter(cell => cell === player).length;
        const emptyCount = cells.filter(cell => cell === '').length;
        
        if (playerCount === 2 && emptyCount === 1) {
            return pattern.find(idx => ticTacToeState.board[idx] === '');
        }
    }
    return null;
}

function findBestMove() {
    // Simplified minimax: prioritize center, corners, then edges
    const center = 4;
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];
    
    // Try to win
    let move = findWinningMove('O');
    if (move !== null) return move;
    
    // Block player
    move = findWinningMove('X');
    if (move !== null) return move;
    
    // Take center
    if (ticTacToeState.board[center] === '') return center;
    
    // Take corner
    const emptyCorners = corners.filter(idx => ticTacToeState.board[idx] === '');
    if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    
    // Take edge
    const emptyEdges = edges.filter(idx => ticTacToeState.board[idx] === '');
    if (emptyEdges.length > 0) return emptyEdges[0];
    
    return null;
}

function checkTTTWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (ticTacToeState.board[a] && 
            ticTacToeState.board[a] === ticTacToeState.board[b] && 
            ticTacToeState.board[a] === ticTacToeState.board[c]) {
            return ticTacToeState.board[a];
        }
    }
    return null;
}

function endTTTGame(result) {
    ticTacToeState.gameOver = true;
    const status = document.getElementById('ttt-status');
    
    if (result === 'X') {
        status.textContent = '🎉 You won! Great job!';
        status.style.color = '#66BB6A';
        audioManager.playSound('win');
    } else if (result === 'O') {
        status.textContent = '🤖 Computer wins! Try again!';
        status.style.color = '#FF6B6B';
    } else {
        status.textContent = '🤝 It\'s a draw! Well played!';
        status.style.color = '#FFA726';
    }
}

function changeTTTDifficulty(diff) {
    ticTacToeState.difficulty = diff;
}
