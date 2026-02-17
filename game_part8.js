function selectGardenItem(item, isCorrect) {
    if (isCorrect) {
        if (!window.gardenGame.selected.includes(item)) {
            window.gardenGame.selected.push(item);
            event.target.style.background = '#4CAF50';
            event.target.style.color = 'white';
            
            // Update plant growth
            const growth = ['🌱', '🌿', '🌸', '🌻', '🌹'];
            const currentGrowth = Math.min(window.gardenGame.selected.length, growth.length - 1);
            document.getElementById('plant-health').textContent = growth[currentGrowth];
            
            if (window.gardenGame.selected.length === window.gardenGame.required.length) {
                setTimeout(() => {
                    alert('🎉 Amazing! Your plant is happy and healthy!');
                    gameState.addScore(20);
                    closeMiniGame();
                }, 500);
            }
        }
    } else {
        event.target.style.background = '#ff6b6b';
        setTimeout(() => {
            event.target.style.background = '#f0f8ff';
        }, 1000);
        alert('🤔 That might hurt the plant! Choose something helpful.');
    }
}

function startSpaceGame() {
    const planets = ['☀️', '🌍', '🪐', '🌙', '⭐'];
    const planetNames = ['Sun', 'Earth', 'Saturn', 'Moon', 'Star'];
    const planetFacts = [
        'The Sun is very hot and gives us light!',
        'Earth is our home planet with water and air!',
        'Saturn has beautiful rings around it!',
        'The Moon changes shape throughout the month!',
        'Stars twinkle and make pictures in the sky!'
    ];
    
    const targetPlanet = Math.floor(Math.random() * planets.length);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🚀 Space Explorer Game</h2>
                <p>Click on the <strong>\${planetNames[targetPlanet]}</strong> to learn about it!</p>
                <div class="space-objects">
    `;
    
    planets.forEach((planet, index) => {
        gameHtml += \`<button onclick="exploreSpaceObject(\${index}, \${targetPlanet}, '\${planetFacts[index]}')" style="font-size: 4rem; margin: 15px; padding: 20px; background: black; color: white; border: none; border-radius: 15px;">\${planet}</button>\`;
    });
    
    gameHtml += `
                </div>
                <div id="space-fact" style="margin-top: 20px; font-size: 1.2rem;"></div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function exploreSpaceObject(selected, target, fact) {
    document.getElementById('space-fact').innerHTML = \`<p style="color: #4ECDC4; font-weight: bold;">\${fact}</p>\`;
    
    if (selected === target) {
        setTimeout(() => {
            alert('🎉 Great choice! You found the right space object!');
            gameState.addScore(10);
            closeMiniGame();
        }, 2000);
    } else {
        setTimeout(() => {
            alert('🤔 That\\'s interesting, but try to find the one I mentioned!');
        }, 2000);
    }
}

function startTimeGame() {
    const times = [
        { time: '🕐', name: '1 o\\'clock', hour: 1 },
        { time: '🕕', name: '6 o\\'clock', hour: 6 },
        { time: '🕘', name: '9 o\\'clock', hour: 9 },
        { time: '🕛', name: '12 o\\'clock', hour: 12 }
    ];
    
    const targetTime = times[Math.floor(Math.random() * times.length)];
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🕐 Time Learning Game</h2>
                <p>Find the clock that shows <strong>\${targetTime.name}</strong>!</p>
                <div class="time-clocks">
    `;
    
    // Shuffle the times for display
    const shuffledTimes = [...times].sort(() => Math.random() - 0.5);
    
    shuffledTimes.forEach(timeObj => {
        gameHtml += \`<button onclick="checkTimeAnswer('\${timeObj.name}', '\${targetTime.name}')" style="font-size: 4rem; margin: 15px; padding: 20px; background: #f0f8ff; border: 2px solid #4ECDC4; border-radius: 15px;">\${timeObj.time}</button>\`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkTimeAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Perfect! You can read the clock correctly!');
        gameState.addScore(10);
        closeMiniGame();
    } else {
        alert('🤔 Look at the clock hands and try again!');
    }
}

function closeMiniGame() {
    const overlay = document.querySelector('.mini-game-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Parental Controls Functions
function updateSettingsUI() {
    const settings = gameState.settings;
    
    // Update checkboxes
    document.getElementById('data-collection').checked = settings.dataCollection;
    document.getElementById('voice-narration').checked = settings.voiceNarration;
    document.getElementById('sound-effects').checked = settings.soundEffects;
    
    // Update volume
    document.getElementById('volume-control').value = settings.volume;
    
    // Update time limit
    document.getElementById('time-limit').value = settings.timeLimit;
    
    // Add event listeners
    document.getElementById('data-collection').addEventListener('change', (e) => {
        gameState.settings.dataCollection = e.target.checked;
        gameState.saveSettings();
    });
    
    document.getElementById('voice-narration').addEventListener('change', (e) => {
        gameState.settings.voiceNarration = e.target.checked;
        gameState.saveSettings();
    });
    
    document.getElementById('sound-effects').addEventListener('change', (e) => {
        gameState.settings.soundEffects = e.target.checked;
        gameState.saveSettings();
    });
    
    document.getElementById('volume-control').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        gameState.settings.volume = val;
        audioManager.volume = val / 100;
        gameState.saveSettings();
    });

    const voiceSelect = document.getElementById('voice-selection');
    if (voiceSelect) {
        voiceSelect.addEventListener('change', (e) => {
            gameState.settings.voiceName = e.target.value;
            gameState.saveSettings();
            // Test the voice
            playNarration("This is your new voice! How do I sound?");
        });
    }
    
    document.getElementById('time-limit').addEventListener('change', (e) => {
        gameState.settings.timeLimit = e.target.value === 'unlimited' ? 'unlimited' : parseInt(e.target.value);
        gameState.saveSettings();
    });
}
