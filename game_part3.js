function startCountingGame() {
    const count = Math.floor(Math.random() * 5) + 3; // 3-7 objects
    const animals = ['🐰', '🐱', '🐶', '🐸', '🐯', '🦁', '🐼'];
    const selectedAnimal = animals[Math.floor(Math.random() * animals.length)];
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🔢 Counting Game</h2>
                <p>Count the ${selectedAnimal} animals!</p>
                <div class="counting-area">
    `;
    
    // Add animals in random positions
    for (let i = 0; i < count; i++) {
        const left = Math.random() * 80 + 10; // 10-90%
        const top = Math.random() * 60 + 20;  // 20-80%
        gameHtml += `<span class="counting-item" style="position: absolute; left: \${left}%; top: \${top}%; font-size: 2rem;">\${selectedAnimal}</span>`;
    }
    
    gameHtml += `
                </div>
                <div class="mini-game-controls">
                    <p>How many \${selectedAnimal} do you see?</p>
                    <div class="number-buttons">
    `;
    
    // Add number buttons
    for (let i = 1; i <= 10; i++) {
        gameHtml += `<button class="number-btn" onclick="checkCountingAnswer(\${i}, \${count})">\${i}</button>`;
    }
    
    gameHtml += `
                    </div>
                    <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkCountingAnswer(guess, correct) {
    if (guess === correct) {
        alert('🎉 Correct! Well done counting!');
        gameState.addScore(10);
        closeMiniGame();
    } else {
        alert('🤔 Try again! Count carefully.');
    }
}

function startMatchingGame() {
    const pairs = ['🐱', '🐶', '🐰', '🐸'];
    const cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🎯 Memory Match</h2>
                <p>Find the matching pairs!</p>
                <div class="memory-grid">
    `;
    
    cards.forEach((card, index) => {
        gameHtml += `
            <div class="memory-card" onclick="flipCard(\${index}, '\${card}')">
                <div class="card-front">❓</div>
                <div class="card-back hidden">\${card}</div>
            </div>
        `;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function startPuzzleGame() {
    alert('🧩 Puzzle game coming soon! Try the counting or matching games for now.');
}

function startColorGame() {
    const colors = ['🔴', '🟡', '🟢', '🔵', '🟣', '🟠'];
    const colorNames = ['Red', 'Yellow', 'Green', 'Blue', 'Purple', 'Orange'];
    const targetColor = Math.floor(Math.random() * colors.length);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🎨 Color Learning Game</h2>
                <p>Click on the <strong>\${colorNames[targetColor]}</strong> circle!</p>
                <div class="color-grid">
    `;
    
    // Shuffle colors for display
    const shuffledIndexes = [...Array(colors.length).keys()].sort(() => Math.random() - 0.5);
    shuffledIndexes.forEach(index => {
        gameHtml += \`<div class="color-circle" onclick="checkColorAnswer(\${index}, \${targetColor})" style="background: \${getColorHex(index)}; width: 80px; height: 80px; border-radius: 50%; margin: 10px; cursor: pointer; display: inline-block;"></div>\`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function getColorHex(index) {
    const hexColors = ['#ff4444', '#ffdd44', '#44dd44', '#4444ff', '#dd44dd', '#ff8844'];
    return hexColors[index];
}

function checkColorAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Perfect! You found the right color!');
        gameState.addScore(5);
        closeMiniGame();
    } else {
        alert('🤔 Try again! Look for the color I asked for.');
    }
}

function startShapeGame() {
    const shapes = ['⭕', '🔺', '🟦', '⭐', '💠', '🔷'];
    const shapeNames = ['Circle', 'Triangle', 'Square', 'Star', 'Diamond', 'Blue Diamond'];
    const targetShape = Math.floor(Math.random() * shapes.length);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>📐 Shape Recognition Game</h2>
                <p>Find the <strong>\${shapeNames[targetShape]}</strong>!</p>
                <div class="shape-grid">
    `;
    
    const shuffledIndexes = [...Array(shapes.length).keys()].sort(() => Math.random() - 0.5);
    shuffledIndexes.forEach(index => {
        gameHtml += \`<div class="shape-item" onclick="checkShapeAnswer(\${index}, \${targetShape})" style="font-size: 3rem; margin: 15px; cursor: pointer; display: inline-block;">\${shapes[index]}</div>\`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkShapeAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Excellent! You identified the shape correctly!');
        gameState.addScore(5);
        closeMiniGame();
    } else {
        alert('🤔 Not quite! Try to find the shape I mentioned.');
    }
}
