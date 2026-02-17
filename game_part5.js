function startSortingGame() {
    const categories = [
        { name: 'Animals', items: ['🐱', '🐶', '🐰', '🐸'], others: ['🍎', '🚗', '🏠', '⭐'] },
        { name: 'Fruits', items: ['🍎', '🍌', '🍇', '🍊'], others: ['🐱', '🚗', '🏠', '⭐'] },
        { name: 'Vehicles', items: ['🚗', '🚲', '✈️', '🚢'], others: ['🍎', '🐱', '🏠', '⭐'] }
    ];
    
    const currentCategory = categories[Math.floor(Math.random() * categories.length)];
    const allItems = [...currentCategory.items, ...currentCategory.others.slice(0, 2)].sort(() => Math.random() - 0.5);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>📦 Sorting Game</h2>
                <p>Drag the <strong>\${currentCategory.name}</strong> into the box!</p>
                <div class="sorting-area">
                    <div class="sort-box" id="sort-box">
                        <p>Drop \${currentCategory.name} here!</p>
                    </div>
                    <div class="items-to-sort">
    `;
    
    allItems.forEach((item, index) => {
        const isCorrect = currentCategory.items.includes(item);
        gameHtml += \`<div class="sortable-item" onclick="sortItem('\${item}', \${isCorrect})" style="font-size: 2rem; margin: 10px; padding: 10px; background: #f0f8ff; border-radius: 10px; cursor: pointer; display: inline-block;">\${item}</div>\`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

let sortedCorrectly = 0;
let totalToSort = 0;

function sortItem(item, isCorrect) {
    if (isCorrect) {
        sortedCorrectly++;
        event.target.style.background = '#4CAF50';
        event.target.style.color = 'white';
        event.target.textContent += ' ✓';
        event.target.onclick = null;
        
        if (sortedCorrectly >= 4) {
            setTimeout(() => {
                alert('🎉 Perfect sorting! You found all the items!');
                gameState.addScore(20);
                closeMiniGame();
                sortedCorrectly = 0;
            }, 500);
        }
    } else {
        event.target.style.background = '#ff6b6b';
        setTimeout(() => {
            event.target.style.background = '#f0f8ff';
        }, 1000);
        alert('🤔 That doesn\'t belong in this category. Try again!');
    }
}

function startMusicGame() {
    const notes = ['🎵', '🎶', '🎼', '🎹', '🥁', '🎸'];
    const pattern = [];
    const patternLength = 4;
    
    for (let i = 0; i < patternLength; i++) {
        pattern.push(notes[Math.floor(Math.random() * 3)]); // Use only first 3 notes for simplicity
    }
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🎵 Music Memory Game</h2>
                <p>Watch the pattern, then repeat it!</p>
                <div class="music-pattern" id="music-pattern">
    `;
    
    pattern.forEach((note, index) => {
        gameHtml += \`<span class="music-note" style="font-size: 3rem; margin: 10px; opacity: 0.3;" id="note-\${index}">\${note}</span>\`;
    });
    
    gameHtml += `
                </div>
                <div class="music-controls">
                    <button onclick="playMusicPattern([\${pattern.map(n => \`'\${n}'\`).join(', ')}])" style="margin: 10px; padding: 10px;">▶️ Show Pattern</button>
                    <div class="music-input" id="music-input" style="margin-top: 20px;">
                        <p>Now click to repeat the pattern:</p>
    `;
    
    notes.slice(0, 3).forEach(note => {
        gameHtml += \`<button onclick="addMusicNote('\${note}')" style="font-size: 2rem; margin: 5px; padding: 10px;">\${note}</button>\`;
    });
    
    gameHtml += `
                    </div>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    window.currentMusicPattern = pattern;
    window.userMusicInput = [];
}

function playMusicPattern(pattern) {
    pattern.forEach((note, index) => {
        setTimeout(() => {
            document.getElementById(\`note-\${index}\`).style.opacity = '1';
            setTimeout(() => {
                document.getElementById(\`note-\${index}\`).style.opacity = '0.3';
            }, 500);
        }, index * 600);
    });
}

function addMusicNote(note) {
    window.userMusicInput.push(note);
    
    if (window.userMusicInput.length === window.currentMusicPattern.length) {
        checkMusicPattern();
    }
}

function checkMusicPattern() {
    const correct = JSON.stringify(window.userMusicInput) === JSON.stringify(window.currentMusicPattern);
    
    if (correct) {
        alert('🎉 Beautiful music! You repeated the pattern perfectly!');
        gameState.addScore(25);
        closeMiniGame();
    } else {
        alert('🤔 Almost! Try listening to the pattern again.');
        window.userMusicInput = [];
    }
}

function startDrawingGame() {
    let gameHtml = \`
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🎨 Drawing Game</h2>
                <p>Draw your favorite animal or shape!</p>
                <canvas id="drawing-canvas" width="400" height="300" style="border: 2px solid #4ECDC4; border-radius: 10px; background: white;"></canvas>
                <div class="drawing-controls">
                    <button onclick="changeDrawingColor('red')" style="background: red; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="changeDrawingColor('blue')" style="background: blue; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="changeDrawingColor('green')" style="background: green; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="changeDrawingColor('yellow')" style="background: yellow; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="clearDrawing()" style="margin: 10px; padding: 10px;">🗑️ Clear</button>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    \`;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    // Initialize drawing functionality
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentColor = 'black';
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.beginPath();
    }
    
    window.changeDrawingColor = function(color) {
        currentColor = color;
    };
    
    window.clearDrawing = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
}
