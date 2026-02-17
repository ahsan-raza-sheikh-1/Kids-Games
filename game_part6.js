function startMazeGame() {
    const maze = [
        ['S', '.', '#', '#', '#'],
        ['#', '.', '#', '.', '#'],
        ['#', '.', '.', '.', '#'],
        ['#', '#', '#', '.', '#'],
        ['#', '#', '#', '.', 'E']
    ];
    
    let playerPos = { x: 0, y: 0 };
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🗺️ Maze Adventure</h2>
                <p>Help the character reach the exit! Use arrow buttons to move.</p>
                <div class="maze-grid" id="maze-grid">
    `;
    
    maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            let cellContent = '';
            if (cell === 'S') cellContent = '🏠';
            else if (cell === 'E') cellContent = '🏆';
            else if (cell === '#') cellContent = '🧱';
            else if (x === playerPos.x && y === playerPos.y) cellContent = '👤';
            else cellContent = '⬜';
            
            gameHtml += \`<div class="maze-cell" id="cell-\${x}-\${y}" style="width: 40px; height: 40px; margin: 2px; display: inline-block; font-size: 1.5rem; text-align: center; line-height: 40px;">\${cellContent}</div>\`;
        });
        gameHtml += '<br>';
    });
    
    gameHtml += `
                </div>
                <div class="maze-controls">
                    <button onclick="moveMaze('up')" style="margin: 5px; padding: 10px;">⬆️</button><br>
                    <button onclick="moveMaze('left')" style="margin: 5px; padding: 10px;">⬅️</button>
                    <button onclick="moveMaze('right')" style="margin: 5px; padding: 10px;">➡️</button><br>
                    <button onclick="moveMaze('down')" style="margin: 5px; padding: 10px;">⬇️</button>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    window.mazeData = { maze, playerPos };
}

function moveMaze(direction) {
    const { maze, playerPos } = window.mazeData;
    let newX = playerPos.x;
    let newY = playerPos.y;
    
    switch(direction) {
        case 'up': newY--; break;
        case 'down': newY++; break;
        case 'left': newX--; break;
        case 'right': newX++; break;
    }
    
    // Check bounds and walls
    if (newY >= 0 && newY < maze.length && newX >= 0 && newX < maze[0].length && maze[newY][newX] !== '#') {
        // Clear old position
        document.getElementById(\`cell-\${playerPos.x}-\${playerPos.y}\`).textContent = '⬜';
        
        // Update position
        playerPos.x = newX;
        playerPos.y = newY;
        
        // Check if reached exit
        if (maze[newY][newX] === 'E') {
            alert('🎉 Congratulations! You found the exit!');
            gameState.addScore(30);
            closeMiniGame();
            return;
        }
        
        // Draw player at new position
        document.getElementById(\`cell-\${newX}-\${newY}\`).textContent = '👤';
    }
}

function startRiddleGame() {
    const riddles = [
        { question: "I have a face and hands but no arms or legs. What am I?", answer: "clock", options: ["clock", "mirror", "picture"] },
        { question: "What has teeth but cannot bite?", answer: "comb", options: ["comb", "shark", "dog"] },
        { question: "What goes up but never comes down?", answer: "age", options: ["balloon", "age", "bird"] },
        { question: "What has ears but cannot hear?", answer: "corn", options: ["corn", "rabbit", "elephant"] }
    ];
    
    const currentRiddle = riddles[Math.floor(Math.random() * riddles.length)];
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🤔 Riddle Time</h2>
                <p style="font-size: 1.2rem; margin: 20px 0;"><strong>\${currentRiddle.question}</strong></p>
                <div class="riddle-options">
    `;
    
    currentRiddle.options.sort(() => Math.random() - 0.5).forEach(option => {
        gameHtml += \`<button onclick="checkRiddleAnswer('\${option}', '\${currentRiddle.answer}')" style="margin: 10px; padding: 15px; font-size: 1.1rem;">\${option}</button>\`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkRiddleAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Brilliant! You solved the riddle!');
        gameState.addScore(20);
        closeMiniGame();
    } else {
        alert('🤔 Think harder! What could it be?');
    }
}

function startWeatherGame() {
    const weatherTypes = ['☀️', '🌧️', '⛅', '❄️', '⛈️'];
    const weatherNames = ['Sunny', 'Rainy', 'Cloudy', 'Snowy', 'Stormy'];
    const weatherActivities = [
        ['Beach', 'Picnic', 'Swimming'],
        ['Reading inside', 'Board games', 'Cooking'],
        ['Walking', 'Photography', 'Kite flying'],
        ['Sledding', 'Snowman', 'Hot chocolate'],
        ['Stay inside', 'Movie time', 'Cozy reading']
    ];
    
    const targetWeather = Math.floor(Math.random() * weatherTypes.length);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🌤️ Weather Game</h2>
                <p>It's <strong>\${weatherNames[targetWeather]}</strong> today! \${weatherTypes[targetWeather]}</p>
                <p>What's a good activity for this weather?</p>
                <div class="weather-activities">
    `;
    
    // Mix correct activities with one wrong one
    const correctActivities = weatherActivities[targetWeather];
    const wrongActivity = weatherActivities[(targetWeather + 1) % weatherActivities.length][0];
    const allActivities = [...correctActivities, wrongActivity].sort(() => Math.random() - 0.5);
    
    allActivities.forEach(activity => {
        const isCorrect = correctActivities.includes(activity);
        gameHtml += \`<button onclick="checkWeatherAnswer(\${isCorrect})" style="margin: 10px; padding: 15px; font-size: 1.1rem;">\${activity}</button>\`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkWeatherAnswer(isCorrect) {
    if (isCorrect) {
        alert('🎉 Perfect choice! That\\'s a great activity for this weather!');
        gameState.addScore(10);
        closeMiniGame();
    } else {
        alert('🤔 Hmm, that might not be the best choice for this weather. Try again!');
    }
}
