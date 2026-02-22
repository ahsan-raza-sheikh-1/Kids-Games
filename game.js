// Interactive Kids Storytelling Game - JavaScript

// Audio Manager for centralized audio control
class AudioManager {
    constructor() {
        this.isMuted = this.loadMuteState();
        this.isPaused = false;
        this.currentNarration = null;
        this.volume = parseFloat(localStorage.getItem('game_volume')) || 0.7;
        this.applyMuteState();
    }
    
    loadMuteState() {
        const saved = localStorage.getItem('audioMuted');
        return saved === 'true';
    }
    
    saveMuteState() {
        localStorage.setItem('audioMuted', this.isMuted);
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveMuteState();
        this.applyMuteState();
        this.updateMuteButton();
    }
    
    applyMuteState() {
        // This will be used to control actual audio playback
        if (this.currentNarration) {
            this.currentNarration.muted = this.isMuted;
        }
    }
    
    updateMuteButton() {
        const muteBtn = document.getElementById('audio-toggle');
        if (muteBtn) {
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
            muteBtn.title = this.isMuted ? 'Unmute Audio' : 'Mute Audio';
        }
    }
    
    pauseNarration() {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            this.isPaused = true;
        }
    }
    
    resumeNarration() {
        if (window.speechSynthesis && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            this.isPaused = false;
        }
    }

    stopNarration() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            this.isPaused = false;
        }
    }
    
    playSound(soundType) {
        if (this.isMuted) return;
        // Placeholder for sound effects
        console.log(`Playing sound: ${soundType}`);
    }
}

// Initialize audio manager globally
const audioManager = new AudioManager();

// Game State Management
class GameState {
    constructor() {
        this.currentScreen = 'main-menu';
        this.currentStory = null;
        this.currentStoryPage = 0;
        this.playerCharacter = this.loadCharacter() || this.createDefaultCharacter();
        this.settings = this.loadSettings() || this.createDefaultSettings();
        this.darkMode = this.loadDarkMode();
        this.applyDarkMode();
        this.score = this.loadScore();
        this.uid = this.getOrGenerateUID();
        this.playTimeToday = this.getPlayTimeToday();
        this.gameStartTime = Date.now();
        
        // Load cloud data if available
        this.loadFromCloud();
        
        // Story data
        // Story data loaded from story-data.js
        this.stories = storyData;
    }

    createDefaultCharacter() {
        return {
            name: 'My Character',
            skin: '👤',
            hair: '',
            clothes: '',
            accessories: ''
        };
    }

    createDefaultSettings() {
        return {
            audioEnabled: true,
            voiceNarration: true,
            soundEffects: true,
            volume: 70,
            voiceName: 'default',
            timeLimit: 60,
            dataCollection: false
        };
    }

    addScore(points) {
        this.score += points;
        localStorage.setItem('kidsgame_score', this.score);
        this.updateScoreDisplay();
        this.syncWithCloud();
    }

    loadScore() {
        const saved = localStorage.getItem('kidsgame_score');
        return saved ? parseInt(saved) : 0;
    }

    updateScoreDisplay() {
        const scoreElement = document.getElementById('player-score');
        if (scoreElement) {
            scoreElement.textContent = `⭐ Score: ${this.score}`;
        }
    }
    saveCharacter() {
        const nameInput = document.getElementById('character-name');
        if (nameInput) {
            this.playerCharacter.name = nameInput.value;
        }
        localStorage.setItem('kidsgame_character', JSON.stringify(this.playerCharacter));
        this.updateHeaderName();
        this.syncWithCloud();
    }

    updateHeaderName() {
        const title = document.querySelector('.game-title');
        if (title && this.playerCharacter.name) {
            title.textContent = `📚 ${this.playerCharacter.name}'s Stories`;
        }
    }

    loadDarkMode() {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('darkMode', this.darkMode);
        this.applyDarkMode();
    }

    applyDarkMode() {
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
            const toggle = document.getElementById('dark-mode-toggle');
            if (toggle) toggle.textContent = '☀️';
        } else {
            document.body.classList.remove('dark-mode');
            const toggle = document.getElementById('dark-mode-toggle');
            if (toggle) toggle.textContent = '🌙';
        }
    }

    loadCharacter() {
        const saved = localStorage.getItem('kidsgame_character');
        return saved ? JSON.parse(saved) : null;
    }

    saveSettings() {
        localStorage.setItem('kidsgame_settings', JSON.stringify(this.settings));
        this.syncWithCloud();
    }

    getOrGenerateUID() {
        let uid = localStorage.getItem('kidsgame_uid');
        if (!uid) {
            uid = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
            localStorage.setItem('kidsgame_uid', uid);
        }
        return uid;
    }

    async syncWithCloud() {
        if (!this.uid) return;
        try {
            await fetch('/api/save-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: this.uid,
                    name: this.playerCharacter.name,
                    score: this.score,
                    character_data: this.playerCharacter,
                    settings: this.settings,
                    gamestate: {
                        currentStory: this.currentStory,
                        currentStoryPage: this.currentStoryPage,
                        lastPlayed: new Date().toISOString()
                    }
                })
            });
            console.log('✅ Cloud sync complete');
        } catch (error) {
            console.error('❌ Sync error:', error);
        }
    }

    async loadFromCloud() {
        try {
            const response = await fetch(`/api/load-profile?uid=${this.uid}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Loaded data from cloud:', data);
                
                // Merge cloud data with local if cloud is newer or local is empty
                if (data.score > this.score) this.score = data.score;
                if (data.name && data.name !== 'My Character') this.playerCharacter.name = data.name;
                if (data.character_data) this.playerCharacter = data.character_data;
                if (data.settings) this.settings = data.settings;
                if (data.gamestate) {
                    this.currentStory = data.gamestate.currentStory;
                    this.currentStoryPage = data.gamestate.currentStoryPage;
                }
                
                // Update UI
                this.updateScoreDisplay();
                this.updateHeaderName();
                updateCharacterDisplay();
                updateSettingsUI();
            }
        } catch (error) {
            console.error('Load error:', error);
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('kidsgame_settings');
        return saved ? JSON.parse(saved) : null;
    }

    getPlayTimeToday() {
        const today = new Date().toDateString();
        const savedTime = localStorage.getItem('kidsgame_playtime_' + today);
        return savedTime ? parseInt(savedTime) : 0;
    }

    updatePlayTime() {
        const currentTime = Date.now();
        const sessionTime = Math.floor((currentTime - this.gameStartTime) / 1000 / 60); // minutes
        this.playTimeToday += sessionTime;
        
        const today = new Date().toDateString();
        localStorage.setItem('kidsgame_playtime_' + today, this.playTimeToday.toString());
        
        // Check time limits
        if (this.settings.timeLimit !== 'unlimited' && this.playTimeToday >= this.settings.timeLimit) {
            this.showTimeLimitReached();
        }
        
        this.gameStartTime = currentTime;
    }

    showTimeLimitReached() {
        alert('⏰ Play time limit reached for today! Time for a break. Remember to rest your eyes and stretch!');
    }

    clearAllData() {
        if (confirm('⚠️ This will delete ALL game progress, characters, and settings. Are you sure?')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// Initialize game state
const gameState = new GameState();

// DOM Elements
let currentAudio = null;

// Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('game-container').classList.remove('hidden');
        }, 500);
    }, 2000);

    // Update UI with saved data
    updateCharacterDisplay();
    gameState.updateHeaderName();
    updateSettingsUI();
    loadVoices();
    updatePlayTimeDisplay();

    // Dark mode toggle
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => gameState.toggleDarkMode());
    }

    // Audio toggle
    document.getElementById('audio-toggle').addEventListener('click', toggleGlobalAudio);
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', goBack);
});

// Screen Management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
    
    // Update back button visibility
    const backBtn = document.getElementById('back-btn');
    if (screenId === 'main-menu') {
        backBtn.classList.add('hidden');
    } else {
        backBtn.classList.remove('hidden');
    }
}

function goBack() {
    if (gameState.currentScreen === 'story-player' && gameState.currentStory) {
        showStorySelection();
    } else {
        showScreen('main-menu');
    }
}

// Main Menu Functions
function showStorySelection() {
    showScreen('story-selection');
}

function showCharacterCreator() {
    showScreen('character-creator');
    updateCharacterDisplay();
}

function showMiniGames() {
    showScreen('mini-games');
}

function showParentalControls() {
    showScreen('parental-controls');
    updateSettingsUI();
}

// Story Functions
function startStory(storyId) {
    if (!gameState.stories[storyId]) return;
    
    gameState.currentStory = storyId;
    gameState.currentStoryPage = 0;
    showScreen('story-player');
    displayStoryPage();
}

function displayStoryPage() {
    if (!gameState.currentStory) return;
    
    const story = gameState.stories[gameState.currentStory];
    const page = story.pages[gameState.currentStoryPage];
    
    if (!page) return;
    
    // Update display elements
    document.getElementById('story-title').textContent = page.title;
    document.getElementById('story-text').textContent = page.text;
    document.getElementById('story-image').textContent = page.image;
    
    // Create choice buttons
    const choicesContainer = document.getElementById('story-choices');
    choicesContainer.innerHTML = '';
    
    if (page.choices.length > 0) {
        page.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = () => {
                audioManager.stopNarration();
                makeChoice(choice.nextPage);
            };
            choicesContainer.appendChild(button);
        });
        
        document.getElementById('story-continue').classList.add('hidden');
    } else {
        // Story ended
        const endButton = document.createElement('button');
        endButton.className = 'choice-btn';
        endButton.textContent = '🎉 Play Again';
        endButton.onclick = () => showStorySelection();
        choicesContainer.appendChild(endButton);
        
        document.getElementById('story-continue').classList.add('hidden');
    }
    
    // Play narration if enabled
    if (gameState.settings.voiceNarration && gameState.settings.audioEnabled) {
        playNarration(page.text);
    }
}

function makeChoice(nextPageIndex) {
    gameState.currentStoryPage = nextPageIndex;
    displayStoryPage();
}

function continueStory() {
    gameState.currentStoryPage++;
    displayStoryPage();
}

// Audio Functions
function toggleGlobalAudio() {
    gameState.settings.audioEnabled = !gameState.settings.audioEnabled;
    const audioBtn = document.getElementById('audio-toggle');
    audioBtn.textContent = gameState.settings.audioEnabled ? '🔊' : '🔇';
    
    if (!gameState.settings.audioEnabled && currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    gameState.saveSettings();
}

function toggleNarration() {
    if (!gameState.settings.audioEnabled) return;
    
    const story = gameState.stories[gameState.currentStory];
    const page = story.pages[gameState.currentStoryPage];
    
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio = null;
    } else {
        playNarration(page.text);
    }
}

function playNarration(text) {
    if (!gameState.settings.audioEnabled || !gameState.settings.voiceNarration) return;
    
    if (window.speechSynthesis) {
        // Cancel any pending speech
        audioManager.stopNarration();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = gameState.settings.volume / 100;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        utterance.onstart = () => {
            audioManager.isPaused = false;
            updateAudioButtonsUI();
        };

        utterance.onend = () => {
            audioManager.isPaused = false;
            updateAudioButtonsUI();
        };

        const voices = window.speechSynthesis.getVoices();
        if (gameState.settings.voiceName !== 'default') {
            const selectedVoice = voices.find(v => v.name === gameState.settings.voiceName);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        } else {
            const preferredVoice = voices.find(v => 
                v.name.toLowerCase().includes('google') || 
                v.name.toLowerCase().includes('natural') ||
                v.name.toLowerCase().includes('child')
            );
            if (preferredVoice) utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

function updateAudioButtonsUI() {
    const pauseBtn = document.getElementById('story-pause-btn');
    if (pauseBtn) {
        pauseBtn.textContent = audioManager.isPaused ? '▶️ Resume' : '⏸️ Pause';
    }
}

function loadVoices() {
    if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const voiceSelect = document.getElementById('voice-selection');
        if (voiceSelect && voices.length > 0) {
            voiceSelect.innerHTML = '<option value="default">Default Recommended</option>';
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.name === gameState.settings.voiceName) {
                    option.selected = true;
                }
                voiceSelect.appendChild(option);
            });
        }
    }
}

// Ensure voices are loaded
if (window.speechSynthesis) {
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    }
}

// Character Customization Functions
function customizeCharacter(partType, value) {
    gameState.playerCharacter[partType] = value;
    updateCharacterDisplay();
    
    // Visual feedback
    document.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
}

function updateCharacterDisplay() {
    const display = document.getElementById('character-display');
    const character = gameState.playerCharacter;
    
    // Clear display first to avoid stacking
    display.innerHTML = '';
    
    // Create base
    const base = document.createElement('div');
    base.className = 'character-base';
    base.textContent = character.skin || '👶';
    display.appendChild(base);
    
    // Add hair
    if (character.hair) {
        const hair = document.createElement('div');
        hair.className = 'character-part hair';
        hair.textContent = character.hair;
        display.appendChild(hair);
    }
    
    // Add clothes
    if (character.clothes) {
        const clothes = document.createElement('div');
        clothes.className = 'character-part clothes';
        clothes.textContent = character.clothes;
        display.appendChild(clothes);
    }
    
    // Add accessories
    if (character.accessories) {
        const acc = document.createElement('div');
        acc.className = 'character-part accessories';
        acc.textContent = character.accessories;
        display.appendChild(acc);
    }
    
    // Update name input
    const nameInput = document.getElementById('character-name');
    if (nameInput) {
        nameInput.value = character.name || '';
    }
}

function saveCharacter() {
    const nameInput = document.getElementById('character-name');
    if (nameInput.value.trim()) {
        gameState.playerCharacter.name = nameInput.value.trim();
    }
    
    gameState.saveCharacter();
    
    // Show success feedback
    const saveBtn = document.querySelector('.save-character-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✅ Character Saved!';
    saveBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
    }, 2000);
}

// Mini-Game Functions
function startMiniGame(gameType) {
    switch(gameType) {
        case 'counting':
            startCountingGame();
            break;
        case 'matching':
            startMatchingGame();
            break;
        case 'puzzle':
            startPuzzleGame();
            break;
        case 'colors':
            startColorGame();
            break;
        case 'shapes':
            startShapeGame();
            break;
        case 'patterns':
            startPatternGame();
            break;
        case 'letters':
            startLetterGame();
            break;
        case 'numbers':
            startNumberSequenceGame();
            break;
        case 'rhyming':
            startRhymingGame();
            break;
        case 'sorting':
            startSortingGame();
            break;
        case 'music':
            startMusicGame();
            break;
        case 'drawing':
            startDrawingGame();
            break;
        case 'maze':
            startMazeGame();
            break;
        case 'riddles':
            startRiddleGame();
            break;
        case 'weather':
            startWeatherGame();
            break;
        case 'animals':
            startAnimalSoundsGame();
            break;
        case 'cooking':
            startCookingGame();
            break;
        case 'garden':
            startGardeningGame();
            break;
        case 'space':
            startSpaceGame();
            break;
        case 'time':
            startTimeGame();
            break;
        case 'sudoku':
            startSudokuGame();
            break;
        case 'fillblank':
            startFillBlankGame();
            break;
        case 'tictactoe':
            startTicTacToeGame();
            break;
        case 'chess':
            startChessGame();
            break;
        case 'checkers':
            startCheckersGame();
            break;
        case 'snake':
            startSnakeGame();
            break;
        default:
            alert('🎮 This mini-game is coming soon!');
    }
}

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
        gameHtml += `<span class="counting-item" style="position: absolute; left: ${left}%; top: ${top}%; font-size: 2rem;">${selectedAnimal}</span>`;
    }
    
    gameHtml += `
                </div>
                <div class="mini-game-controls">
                    <p>How many ${selectedAnimal} do you see?</p>
                    <div class="number-buttons">
    `;
    
    // Add number buttons
    for (let i = 1; i <= 10; i++) {
        gameHtml += `<button class="number-btn" onclick="checkCountingAnswer(${i}, ${count})">${i}</button>`;
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
            <div class="memory-card" onclick="flipCard(${index}, '${card}')">
                <div class="card-front">❓</div>
                <div class="card-back hidden">${card}</div>
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
                <p>Click on the <strong>${colorNames[targetColor]}</strong> circle!</p>
                <div class="color-grid">
    `;
    
    // Shuffle colors for display
    const shuffledIndexes = [...Array(colors.length).keys()].sort(() => Math.random() - 0.5);
    shuffledIndexes.forEach(index => {
        gameHtml += `<div class="color-circle" onclick="checkColorAnswer(${index}, ${targetColor})" style="background: ${getColorHex(index)}; width: 80px; height: 80px; border-radius: 50%; margin: 10px; cursor: pointer; display: inline-block;"></div>`;
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
                <p>Find the <strong>${shapeNames[targetShape]}</strong>!</p>
                <div class="shape-grid">
    `;
    
    const shuffledIndexes = [...Array(shapes.length).keys()].sort(() => Math.random() - 0.5);
    shuffledIndexes.forEach(index => {
        gameHtml += `<div class="shape-item" onclick="checkShapeAnswer(${index}, ${targetShape})" style="font-size: 3rem; margin: 15px; cursor: pointer; display: inline-block;">${shapes[index]}</div>`;
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

function startPatternGame() {
    const patterns = [
        ['🔴', '🟡', '🔴', '🟡', '🔴', '?'],
        ['⭐', '⭐', '🌙', '⭐', '⭐', '?'],
        ['🐱', '🐶', '🐱', '🐶', '🐱', '?'],
        ['🍎', '🍎', '🍌', '🍎', '🍎', '?']
    ];
    
    const currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
    const answer = currentPattern[currentPattern.length - 2];
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🔄 Pattern Game</h2>
                <p>What comes next in this pattern?</p>
                <div class="pattern-display">
    `;
    
    currentPattern.forEach(item => {
        gameHtml += `<span style="font-size: 2rem; margin: 10px;">${item}</span>`;
    });
    
    gameHtml += `
                </div>
                <div class="pattern-choices">
                    <button onclick="checkPatternAnswer('${currentPattern[0]}', '${answer}')" style="font-size: 2rem; margin: 10px; padding: 10px;">${currentPattern[0]}</button>
                    <button onclick="checkPatternAnswer('${currentPattern[1]}', '${answer}')" style="font-size: 2rem; margin: 10px; padding: 10px;">${currentPattern[1]}</button>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkPatternAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Amazing! You completed the pattern!');
        gameState.addScore(15);
        closeMiniGame();
    } else {
        alert('🤔 Look at the pattern again and try to see what repeats!');
    }
}

function startLetterGame() {
    const letterPairs = [
        ['A', 'a'], ['B', 'b'], ['C', 'c'], ['D', 'd'], ['E', 'e'],
        ['F', 'f'], ['G', 'g'], ['H', 'h'], ['I', 'i'], ['J', 'j']
    ];
    
    const targetPair = letterPairs[Math.floor(Math.random() * letterPairs.length)];
    const isUppercase = Math.random() > 0.5;
    const showLetter = isUppercase ? targetPair[0] : targetPair[1];
    const findLetter = isUppercase ? targetPair[1] : targetPair[0];
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🔤 Letter Matching Game</h2>
                <p>Find the ${isUppercase ? 'lowercase' : 'uppercase'} version of: <strong style="font-size: 3rem;">${showLetter}</strong></p>
                <div class="letter-grid">
    `;
    
    // Create random letters including the correct answer
    const randomLetters = [];
    for (let i = 0; i < 6; i++) {
        if (i === 2) {
            randomLetters.push(findLetter);
        } else {
            const randomPair = letterPairs[Math.floor(Math.random() * letterPairs.length)];
            randomLetters.push(isUppercase ? randomPair[1] : randomPair[0]);
        }
    }
    
    randomLetters.sort(() => Math.random() - 0.5);
    
    randomLetters.forEach(letter => {
        gameHtml += `<button class="letter-btn" onclick="checkLetterAnswer('${letter}', '${findLetter}')" style="font-size: 2rem; margin: 10px; padding: 15px; min-width: 60px;">${letter}</button>`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkLetterAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Perfect! You matched the letters correctly!');
        gameState.addScore(10);
        closeMiniGame();
    } else {
        alert('🤔 Try again! Look for the matching letter.');
    }
}

function startNumberSequenceGame() {
    const start = Math.floor(Math.random() * 5) + 1; // 1-5
    const sequence = [];
    for (let i = 0; i < 5; i++) {
        sequence.push(start + i);
    }
    sequence.push('?');
    const answer = start + 5;
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🔢 Number Sequence Game</h2>
                <p>What number comes next?</p>
                <div class="sequence-display">
    `;
    
    sequence.forEach(num => {
        gameHtml += `<span style="font-size: 2.5rem; margin: 15px; padding: 10px; background: #f0f8ff; border-radius: 10px;">${num}</span>`;
    });
    
    gameHtml += `
                </div>
                <div class="number-choices">
    `;
    
    // Create answer choices
    const choices = [answer - 1, answer, answer + 1].sort(() => Math.random() - 0.5);
    choices.forEach(choice => {
        gameHtml += `<button onclick="checkNumberAnswer(${choice}, ${answer})" style="font-size: 2rem; margin: 10px; padding: 15px; min-width: 80px;">${choice}</button>`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkNumberAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Excellent counting! You found the next number!');
        gameState.addScore(10);
        closeMiniGame();
    } else {
        alert('🤔 Count carefully and try again!');
    }
}

function startRhymingGame() {
    const rhymePairs = [
        { word: 'cat', rhymes: ['hat', 'bat', 'mat'], noRhymes: ['dog', 'fish', 'bird'] },
        { word: 'sun', rhymes: ['run', 'fun', 'bun'], noRhymes: ['moon', 'star', 'cloud'] },
        { word: 'tree', rhymes: ['bee', 'sea', 'key'], noRhymes: ['flower', 'grass', 'rock'] },
        { word: 'car', rhymes: ['star', 'far', 'jar'], noRhymes: ['truck', 'bike', 'boat'] }
    ];
    
    const currentPair = rhymePairs[Math.floor(Math.random() * rhymePairs.length)];
    const correctRhyme = currentPair.rhymes[Math.floor(Math.random() * currentPair.rhymes.length)];
    const wrongWords = currentPair.noRhymes.slice(0, 2);
    
    const allChoices = [correctRhyme, ...wrongWords].sort(() => Math.random() - 0.5);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🎵 Rhyming Game</h2>
                <p>Which word rhymes with: <strong style="font-size: 2rem; color: #4ECDC4;">${currentPair.word}</strong>?</p>
                <div class="rhyme-choices">
    `;
    
    allChoices.forEach(choice => {
        gameHtml += `<button onclick="checkRhymeAnswer('${choice}', '${correctRhyme}')" style="font-size: 1.5rem; margin: 10px; padding: 15px; min-width: 100px;">${choice}</button>`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkRhymeAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Perfect rhyme! You have great listening skills!');
        gameState.addScore(15);
        closeMiniGame();
    } else {
        alert('🤔 Listen to the sounds and try again!');
    }
}

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
                <p>Drag the <strong>${currentCategory.name}</strong> into the box!</p>
                <div class="sorting-area">
                    <div class="sort-box" id="sort-box">
                        <p>Drop ${currentCategory.name} here!</p>
                    </div>
                    <div class="items-to-sort">
    `;
    
    allItems.forEach((item, index) => {
        const isCorrect = currentCategory.items.includes(item);
        gameHtml += `<div class="sortable-item" onclick="sortItem('${item}', ${isCorrect})" style="font-size: 2rem; margin: 10px; padding: 10px; background: #f0f8ff; border-radius: 10px; cursor: pointer; display: inline-block;">${item}</div>`;
    });
    
    gameHtml += `
                    </div>
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
        gameHtml += `<span class="music-note" style="font-size: 3rem; margin: 10px; opacity: 0.3;" id="note-${index}">${note}</span>`;
    });
    
    gameHtml += `
                </div>
                <div class="music-controls">
                    <button onclick="playMusicPattern([${pattern.map(n => `'${n}'`).join(', ')}])" style="margin: 10px; padding: 10px;">▶️ Show Pattern</button>
                    <div class="music-input" id="music-input" style="margin-top: 20px;">
                        <p>Now click to repeat the pattern:</p>
    `;
    
    notes.slice(0, 3).forEach(note => {
        gameHtml += `<button onclick="addMusicNote('${note}')" style="font-size: 2rem; margin: 5px; padding: 10px;">${note}</button>`;
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
            document.getElementById(`note-${index}`).style.opacity = '1';
            setTimeout(() => {
                document.getElementById(`note-${index}`).style.opacity = '0.3';
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
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content" style="max-width: 800px; width: 95%;">
                <h2>🎨 Drawing & Coloring Fun</h2>
                <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; margin-bottom: 15px;">
                    <div style="flex: 1; min-width: 300px;">
                        <canvas id="drawing-canvas" width="400" height="300" style="border: 3px solid #4ECDC4; border-radius: 12px; background: white; width: 100%; height: auto; cursor: crosshair;"></canvas>
                    </div>
                    <div class="drawing-controls" style="display: flex; flex-direction: column; gap: 10px; align-items: flex-start; min-width: 150px;">
                        <div style="width: 100%;">
                            <p style="margin: 0 0 5px 0; font-weight: bold;">Tools:</p>
                            <div style="display: flex; gap: 10px;">
                                <button id="brush-tool" onclick="setDrawingTool('brush')" style="padding: 10px; border-radius: 8px; border: 2px solid #4ECDC4; background: #FFD93D; cursor: pointer;">🖌️ Brush</button>
                                <button id="fill-tool" onclick="setDrawingTool('fill')" style="padding: 10px; border-radius: 8px; border: 2px solid #4ECDC4; background: white; cursor: pointer;">🪣 Fill</button>
                            </div>
                        </div>
                        <div style="width: 100%;">
                            <p style="margin: 10px 0 5px 0; font-weight: bold;">Colors:</p>
                            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px;" id="color-palette">
                            </div>
                        </div>
                        <div style="width: 100%;">
                            <p style="margin: 10px 0 5px 0; font-weight: bold;">Outlines:</p>
                            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                <button onclick="loadOutline('none')" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">None</button>
                                <button onclick="loadOutline('cat')" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">🐱 Cat</button>
                                <button onclick="loadOutline('fish')" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">🐟 Fish</button>
                                <button onclick="loadOutline('star')" style="padding: 5px; border-radius: 5px; border: 1px solid #ccc; background: white; cursor: pointer;">⭐ Star</button>
                            </div>
                        </div>
                        <div style="width: 100%; display: flex; gap: 10px; margin-top: 10px;">
                            <button onclick="clearDrawing()" style="padding: 10px; flex: 1; border-radius: 8px; border: none; background: #FF6B6B; color: white; cursor: pointer; font-weight: bold;">🗑️ Clear</button>
                            <button onclick="closeMiniGame()" style="padding: 10px; flex: 1; border-radius: 8px; border: none; background: #666; color: white; cursor: pointer; font-weight: bold;">❌ Exit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    // Initialize drawing functionality
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentColor = '#000000';
    let currentTool = 'brush'; // 'brush' or 'fill'
    
    // Setup color palette
    const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFFF00', '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#4ECDC4', '#FF6B6B'];
    const palette = document.getElementById('color-palette');
    colors.forEach(color => {
        const btn = document.createElement('button');
        btn.style.background = color;
        btn.style.width = '30px';
        btn.style.height = '30px';
        btn.style.border = '2px solid transparent';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.onclick = () => changeDrawingColor(color, btn);
        if (color === '#000000') btn.style.borderColor = '#4ECDC4';
        palette.appendChild(btn);
    });

    canvas.addEventListener('mousedown', (e) => {
        if (currentTool === 'fill') {
            floodFill(e);
        } else {
            startDrawing(e);
        }
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    function startDrawing(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        ctx.beginPath();
        ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    }
    
    function draw(e) {
        if (!isDrawing || currentTool !== 'brush') return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    
    function stopDrawing() {
        isDrawing = false;
        ctx.closePath();
    }
    
    window.setDrawingTool = function(tool) {
        currentTool = tool;
        document.getElementById('brush-tool').style.background = tool === 'brush' ? '#FFD93D' : 'white';
        document.getElementById('fill-tool').style.background = tool === 'fill' ? '#FFD93D' : 'white';
    };

    window.changeDrawingColor = function(color, btn) {
        currentColor = color;
        document.querySelectorAll('#color-palette button').forEach(b => b.style.borderColor = 'transparent');
        if (btn) btn.style.borderColor = '#4ECDC4';
    };
    
    window.clearDrawing = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    window.loadOutline = function(type) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        if (type === 'cat') {
            // Simple cat outline
            ctx.arc(200, 150, 60, 0, Math.PI * 2); // Head
            ctx.moveTo(160, 110); ctx.lineTo(150, 70); ctx.lineTo(180, 95); // Left ear
            ctx.moveTo(240, 110); ctx.lineTo(250, 70); ctx.lineTo(220, 95); // Right ear
            ctx.moveTo(180, 140); ctx.arc(180, 140, 5, 0, Math.PI * 2); // Left eye
            ctx.moveTo(220, 140); ctx.arc(220, 140, 5, 0, Math.PI * 2); // Right eye
            ctx.moveTo(200, 160); ctx.lineTo(190, 170); ctx.lineTo(210, 170); ctx.closePath(); // Nose
        } else if (type === 'fish') {
            // Simple fish outline
            ctx.ellipse(200, 150, 80, 50, 0, 0, Math.PI * 2); // Body
            ctx.moveTo(125, 150); ctx.lineTo(90, 120); ctx.lineTo(90, 180); ctx.closePath(); // Tail
            ctx.moveTo(240, 140); ctx.arc(240, 140, 5, 0, Math.PI * 2); // Eye
        } else if (type === 'star') {
            // Star outline
            const cx = 200, cy = 150, spikes = 5, outerRadius = 80, innerRadius = 40;
            let rot = Math.PI / 2 * 3, x = cx, y = cy, step = Math.PI / spikes;
            ctx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;
                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerRadius);
            ctx.closePath();
        }
        ctx.stroke();
    };

    function floodFill(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const startX = Math.round((e.clientX - rect.left) * scaleX);
        const startY = Math.round((e.clientY - rect.top) * scaleY);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData = imageData.data;
        const startPos = (startY * canvas.width + startX) * 4;
        
        const startR = pixelData[startPos];
        const startG = pixelData[startPos + 1];
        const startB = pixelData[startPos + 2];
        const startA = pixelData[startPos + 3];

        const fillColor = hexToRgb(currentColor);
        
        // Don't fill if same color
        if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b && startA === 255) return;

        const stack = [[startX, startY]];
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const pos = (y * canvas.width + x) * 4;

            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
            if (pixelData[pos] !== startR || pixelData[pos+1] !== startG || pixelData[pos+2] !== startB || pixelData[pos+3] !== startA) continue;

            pixelData[pos] = fillColor.r;
            pixelData[pos + 1] = fillColor.g;
            pixelData[pos + 2] = fillColor.b;
            pixelData[pos + 3] = 255;

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
        ctx.putImageData(imageData, 0, 0);
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}

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
            
            gameHtml += `<div class="maze-cell" id="cell-${x}-${y}" style="width: 40px; height: 40px; margin: 2px; display: inline-block; font-size: 1.5rem; text-align: center; line-height: 40px;">${cellContent}</div>`;
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
        document.getElementById(`cell-${playerPos.x}-${playerPos.y}`).textContent = '⬜';
        
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
        document.getElementById(`cell-${newX}-${newY}`).textContent = '👤';
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
                <p style="font-size: 1.2rem; margin: 20px 0;"><strong>${currentRiddle.question}</strong></p>
                <div class="riddle-options">
    `;
    
    currentRiddle.options.sort(() => Math.random() - 0.5).forEach(option => {
        gameHtml += `<button onclick="checkRiddleAnswer('${option}', '${currentRiddle.answer}')" style="margin: 10px; padding: 15px; font-size: 1.1rem;">${option}</button>`;
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
                <p>It's <strong>${weatherNames[targetWeather]}</strong> today! ${weatherTypes[targetWeather]}</p>
                <p>What's a good activity for this weather?</p>
                <div class="weather-activities">
    `;
    
    // Mix correct activities with one wrong one
    const correctActivities = weatherActivities[targetWeather];
    const wrongActivity = weatherActivities[(targetWeather + 1) % weatherActivities.length][0];
    const allActivities = [...correctActivities, wrongActivity].sort(() => Math.random() - 0.5);
    
    allActivities.forEach(activity => {
        const isCorrect = correctActivities.includes(activity);
        gameHtml += `<button onclick="checkWeatherAnswer(${isCorrect})" style="margin: 10px; padding: 15px; font-size: 1.1rem;">${activity}</button>`;
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
        alert('🎉 Perfect choice! That\'s a great activity for this weather!');
        gameState.addScore(10);
        closeMiniGame();
    } else {
        alert('🤔 Hmm, that might not be the best choice for this weather. Try again!');
    }
}

function startAnimalSoundsGame() {
    const animals = [
        { name: 'Cow', sound: 'Moo', emoji: '🐄' },
        { name: 'Dog', sound: 'Woof', emoji: '🐶' },
        { name: 'Cat', sound: 'Meow', emoji: '🐱' },
        { name: 'Duck', sound: 'Quack', emoji: '🦆' },
        { name: 'Sheep', sound: 'Baa', emoji: '🐑' },
        { name: 'Pig', sound: 'Oink', emoji: '🐷' }
    ];
    
    const targetAnimal = animals[Math.floor(Math.random() * animals.length)];
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🔊 Animal Sounds Game</h2>
                <p>Which animal makes this sound: <strong>"${targetAnimal.sound}"</strong>?</p>
                <div class="animal-choices">
    `;
    
    // Create choices with the correct animal and 2 random others
    const choices = [targetAnimal];
    while (choices.length < 3) {
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        if (!choices.includes(randomAnimal)) {
            choices.push(randomAnimal);
        }
    }
    
    choices.sort(() => Math.random() - 0.5).forEach(animal => {
        gameHtml += `<button onclick="checkAnimalAnswer('${animal.name}', '${targetAnimal.name}')" style="margin: 10px; padding: 15px; font-size: 1.5rem;">${animal.emoji} ${animal.name}</button>`;
    });
    
    gameHtml += `
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
}

function checkAnimalAnswer(selected, correct) {
    if (selected === correct) {
        alert('🎉 Excellent! You know your animal sounds!');
        gameState.addScore(10);
        closeMiniGame();
    } else {
        alert('🤔 Listen again and think about which animal makes that sound!');
    }
}

function startCookingGame() {
    const recipes = [
        { name: 'Fruit Salad', ingredients: ['🍎', '🍌', '🍇'], wrong: ['🥕', '🧄'] },
        { name: 'Vegetable Soup', ingredients: ['🥕', '🥔', '🧅'], wrong: ['🍎', '🍰'] },
        { name: 'Sandwich', ingredients: ['🍞', '🧀', '🥬'], wrong: ['🍕', '🍦'] }
    ];
    
    const currentRecipe = recipes[Math.floor(Math.random() * recipes.length)];
    const allIngredients = [...currentRecipe.ingredients, ...currentRecipe.wrong].sort(() => Math.random() - 0.5);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>👨‍🍳 Cooking Game</h2>
                <p>Help make a <strong>${currentRecipe.name}</strong>!</p>
                <p>Click on the correct ingredients:</p>
                <div class="cooking-ingredients">
    `;
    
    allIngredients.forEach(ingredient => {
        const isCorrect = currentRecipe.ingredients.includes(ingredient);
        gameHtml += `<button onclick="selectIngredient('${ingredient}', ${isCorrect})" style="font-size: 3rem; margin: 10px; padding: 15px; background: #f0f8ff; border: 2px solid #4ECDC4; border-radius: 10px;">${ingredient}</button>`;
    });
    
    gameHtml += `
                </div>
                <div id="selected-ingredients" style="margin-top: 20px;">
                    <p>Selected ingredients: <span id="ingredient-list"></span></p>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    window.cookingGame = {
        selected: [],
        required: currentRecipe.ingredients,
        recipeName: currentRecipe.name
    };
}

function selectIngredient(ingredient, isCorrect) {
    if (isCorrect) {
        if (!window.cookingGame.selected.includes(ingredient)) {
            window.cookingGame.selected.push(ingredient);
            event.target.style.background = '#4CAF50';
            event.target.style.color = 'white';
            
            document.getElementById('ingredient-list').textContent = window.cookingGame.selected.join(' ');
            
            if (window.cookingGame.selected.length === window.cookingGame.required.length) {
                setTimeout(() => {
                    alert(`🎉 Delicious! You made a perfect ${window.cookingGame.recipeName}!`);
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
        alert('🤔 That ingredient doesn\'t belong in this recipe!');
    }
}

function startGardeningGame() {
    const plants = ['🌱', '🌿', '🌸', '🌻', '🌹'];
    const plantNeeds = {
        '🌱': ['💧', '☀️'],
        '🌿': ['💧', '🌱'],
        '🌸': ['💧', '☀️', '🐝'],
        '🌻': ['💧', '☀️', '🌱'],
        '🌹': ['💧', '☀️', '💗']
    };
    
    const currentPlant = plants[Math.floor(Math.random() * plants.length)];
    const needs = plantNeeds[currentPlant];
    const wrongItems = ['❄️', '🔥', '⚡', '🗑️'];
    const allItems = [...needs, ...wrongItems.slice(0, 2)].sort(() => Math.random() - 0.5);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🌱 Gardening Game</h2>
                <p>Help this plant grow! ${currentPlant}</p>
                <p>What does it need? (Click all correct items)</p>
                <div class="garden-items">
    `;
    
    allItems.forEach(item => {
        const isCorrect = needs.includes(item);
        gameHtml += `<button onclick="selectGardenItem('${item}', ${isCorrect})" style="font-size: 3rem; margin: 10px; padding: 15px; background: #f0f8ff; border: 2px solid #4ECDC4; border-radius: 10px;">${item}</button>`;
    });
    
    gameHtml += `
                </div>
                <div class="plant-status" id="plant-status">
                    <p>Plant health: <span id="plant-health">🌱</span></p>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    window.gardenGame = {
        selected: [],
        required: needs,
        plant: currentPlant
    };
}

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
                <p>Click on the <strong>${planetNames[targetPlanet]}</strong> to learn about it!</p>
                <div class="space-objects">
    `;
    
    planets.forEach((planet, index) => {
        gameHtml += `<button onclick="exploreSpaceObject(${index}, ${targetPlanet}, '${planetFacts[index]}')" style="font-size: 4rem; margin: 15px; padding: 20px; background: black; color: white; border: none; border-radius: 15px;">${planet}</button>`;
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
    document.getElementById('space-fact').innerHTML = `<p style="color: #4ECDC4; font-weight: bold;">${fact}</p>`;
    
    if (selected === target) {
        setTimeout(() => {
            alert('🎉 Great choice! You found the right space object!');
            gameState.addScore(10);
            closeMiniGame();
        }, 2000);
    } else {
        setTimeout(() => {
            alert('🤔 That\'s interesting, but try to find the one I mentioned!');
        }, 2000);
    }
}

function startTimeGame() {
    const times = [
        { time: '🕐', name: '1 o\'clock', hour: 1 },
        { time: '🕕', name: '6 o\'clock', hour: 6 },
        { time: '🕘', name: '9 o\'clock', hour: 9 },
        { time: '🕛', name: '12 o\'clock', hour: 12 }
    ];
    
    const targetTime = times[Math.floor(Math.random() * times.length)];
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>🕐 Time Learning Game</h2>
                <p>Find the clock that shows <strong>${targetTime.name}</strong>!</p>
                <div class="time-clocks">
    `;
    
    // Shuffle the times for display
    const shuffledTimes = [...times].sort(() => Math.random() - 0.5);
    
    shuffledTimes.forEach(timeObj => {
        gameHtml += `<button onclick="checkTimeAnswer('${timeObj.name}', '${targetTime.name}')" style="font-size: 4rem; margin: 15px; padding: 20px; background: #f0f8ff; border: 2px solid #4ECDC4; border-radius: 15px;">${timeObj.time}</button>`;
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

// ====================
// SUDOKU GAME
// ====================
let sudokuState = {
    grid: [],
    solution: [],
    difficulty: '4x4',
    hintsLeft: 3
};

function startSudokuGame(difficulty = null) {
    if (difficulty) sudokuState.difficulty = difficulty;
    sudokuState.hintsLeft = 3;
    generateSudoku();
    
    let size = sudokuState.difficulty === '6x6' ? 6 : (sudokuState.difficulty === '9x9' ? 9 : 4);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content" style="max-width: 600px; width: 95%;">
                <h2>🔢 Sudoku Puzzle</h2>
                <p>Fill each row and column with numbers 1-${size}!</p>
                <div class="sudoku-info" style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <span style="background: #f0f8ff; padding: 5px 10px; border-radius: 20px; font-weight: bold;">💡 Hints: ${sudokuState.hintsLeft}</span>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="setSudokuDifficulty('4x4')" style="padding: 0.4rem 0.8rem; background: ${sudokuState.difficulty === '4x4' ? '#FF6B6B' : '#4ECDC4'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">4x4</button>
                        <button onclick="setSudokuDifficulty('6x6')" style="padding: 0.4rem 0.8rem; background: ${sudokuState.difficulty === '6x6' ? '#FF6B6B' : '#4ECDC4'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">6x6</button>
                        <button onclick="setSudokuDifficulty('9x9')" style="padding: 0.4rem 0.8rem; background: ${sudokuState.difficulty === '9x9' ? '#FF6B6B' : '#4ECDC4'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">9x9</button>
                    </div>
                </div>
                <div id="sudoku-grid" class="sudoku-grid" style="margin-bottom: 1.5rem;">
                </div>
                <div id="sudoku-numpad" style="display: none; margin-bottom: 1rem; justify-content: center; flex-wrap: wrap; gap: 8px; background: #f9f9f9; padding: 15px; border-radius: 12px; border: 2px dashed #4ECDC4;">
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="getSudokuHint()" class="control-btn" style="background: #FFA726; flex: 1; max-width: 150px;">💡 Hint</button>
                    <button onclick="checkSudokuSolution()" class="control-btn primary" style="flex: 1; max-width: 150px;">✅ Check</button>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()" style="margin-top: 1.5rem;">❌ Close Game</button>
            </div>
        </div>
    `;
    
    const existingOverlay = document.querySelector('.mini-game-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    renderSudokuGrid();
}

function generateSudoku() {
    let size = sudokuState.difficulty === '6x6' ? 6 : (sudokuState.difficulty === '9x9' ? 9 : 4);
    let boxRows = size === 4 ? 2 : (size === 6 ? 2 : 3);
    let boxCols = size === 4 ? 2 : (size === 6 ? 3 : 3);
    
    sudokuState.grid = [];
    sudokuState.solution = [];
    
    // Simple but valid pattern generation
    for (let i = 0; i < size; i++) {
        sudokuState.solution[i] = [];
        for (let j = 0; j < size; j++) {
            sudokuState.solution[i][j] = ((i * boxCols + Math.floor(i / boxRows) + j) % size) + 1;
        }
    }
    
    // Randomize rows within blocks
    for (let i = 0; i < size; i += boxRows) {
        let blockRows = Array.from({length: boxRows}, (_, k) => i + k);
        blockRows.sort(() => Math.random() - 0.5);
        let temp = blockRows.map(r => [...sudokuState.solution[r]]);
        blockRows.forEach((r, idx) => sudokuState.solution[r] = temp[idx]);
    }
    
    // Randomize columns within blocks
    for (let j = 0; j < size; j += boxCols) {
        let blockCols = Array.from({length: boxCols}, (_, k) => j + k);
        blockCols.sort(() => Math.random() - 0.5);
        for (let i = 0; i < size; i++) {
            let temp = blockCols.map(c => sudokuState.solution[i][c]);
            blockCols.forEach((c, idx) => sudokuState.solution[i][c] = temp[idx]);
        }
    }

    const fillPercent = sudokuState.difficulty === '9x9' ? 0.3 : (sudokuState.difficulty === '6x6' ? 0.45 : 0.6);
    for (let i = 0; i < size; i++) {
        sudokuState.grid[i] = [];
        for (let j = 0; j < size; j++) {
            sudokuState.grid[i][j] = Math.random() < fillPercent ? sudokuState.solution[i][j] : 0;
        }
    }
}

function renderSudokuGrid() {
    const container = document.getElementById('sudoku-grid');
    if (!container) return;
    
    let size = sudokuState.difficulty === '6x6' ? 6 : (sudokuState.difficulty === '9x9' ? 9 : 4);
    let boxRows = size === 4 ? 2 : (size === 6 ? 2 : 3);
    let boxCols = size === 4 ? 2 : (size === 6 ? 3 : 3);
    
    let cellSize = size === 4 ? '70px' : (size === 6 ? '55px' : '40px');
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${size}, ${cellSize})`;
    container.style.gap = '2px';
    container.style.margin = '0 auto';
    container.style.width = 'fit-content';
    container.style.padding = '5px';
    container.style.background = '#4ECDC4';
    container.style.borderRadius = '10px';
    container.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    
    container.innerHTML = '';
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const cell = document.createElement('div');
            cell.id = `sudoku-cell-${i}-${j}`;
            cell.style.width = cellSize;
            cell.style.height = cellSize;
            cell.style.background = sudokuState.grid[i][j] !== 0 ? '#f0f0f0' : 'white';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = size === 9 ? '1.2rem' : '1.8rem';
            cell.style.fontWeight = 'bold';
            cell.style.cursor = 'pointer';
            cell.style.transition = 'all 0.2s';
            
            // Add block borders
            if (j % boxCols === 0 && j !== 0) cell.style.borderLeft = '3px solid #4ECDC4';
            if (i % boxRows === 0 && i !== 0) cell.style.borderTop = '3px solid #4ECDC4';
            
            if (sudokuState.grid[i][j] !== 0) {
                cell.textContent = sudokuState.grid[i][j];
                cell.style.color = '#555';
            } else {
                cell.onclick = () => selectSudokuCell(i, j, cell);
            }
            
            container.appendChild(cell);
        }
    }
}

function selectSudokuCell(row, col, cellElement) {
    // Reveal numpad
    const numpad = document.getElementById('sudoku-numpad');
    if (!numpad) return;
    
    numpad.style.display = 'flex';
    numpad.innerHTML = '';
    
    let size = sudokuState.difficulty === '6x6' ? 6 : (sudokuState.difficulty === '9x9' ? 9 : 4);
    
    // Highlight selected cell
    document.querySelectorAll('.sudoku-grid div').forEach(c => {
        if (c.textContent === '' || c.style.color === 'rgb(255, 107, 107)') {
            c.style.background = 'white';
        }
    });
    cellElement.style.background = '#FFD93D';
    
    for (let i = 1; i <= size; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.padding = '10px 15px';
        btn.style.fontSize = '1.2rem';
        btn.style.fontWeight = 'bold';
        btn.style.border = 'none';
        btn.style.borderRadius = '8px';
        btn.style.background = '#4ECDC4';
        btn.style.color = 'white';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            sudokuState.grid[row][col] = i;
            cellElement.textContent = i;
            cellElement.style.color = '#FF6B6B';
            cellElement.style.background = '#fff9f0';
            numpad.style.display = 'none';
        };
        numpad.appendChild(btn);
    }
    
    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '✖';
    clearBtn.style.padding = '10px 15px';
    clearBtn.style.fontSize = '1.2rem';
    clearBtn.style.fontWeight = 'bold';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '8px';
    clearBtn.style.background = '#FF6B6B';
    clearBtn.style.color = 'white';
    clearBtn.style.cursor = 'pointer';
    clearBtn.onclick = () => {
        sudokuState.grid[row][col] = 0;
        cellElement.textContent = '';
        cellElement.style.background = 'white';
        numpad.style.display = 'none';
    };
    numpad.appendChild(clearBtn);
}

function getSudokuHint() {
    if (sudokuState.hintsLeft <= 0) {
        alert('❌ No hints left!');
        return;
    }
    
    let size = sudokuState.difficulty === '6x6' ? 6 : (sudokuState.difficulty === '9x9' ? 9 : 4);
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
        renderSudokuGrid();
        
        // Update hint display without re-rendering everything
        const hintDisplay = document.querySelector('.sudoku-info span strong');
        if (hintDisplay) hintDisplay.textContent = sudokuState.hintsLeft;
    }
}

function checkSudokuSolution() {
    const size = sudokuState.difficulty === '4x4' ? 4 : (sudokuState.difficulty === '6x6' ? 6 : 9);
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

function setSudokuDifficulty(diff) {
    sudokuState.difficulty = diff;
    sudokuState.hintsLeft = 3;
    startSudokuGame(diff);
}

// ====================
// TIC-TAC-TOE GAME
// ====================
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
    if (!board) return;
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
        const empty = ticTacToeState.board.map((cell, idx) => cell === '' ? idx : null).filter(x => x !== null);
        move = empty[Math.floor(Math.random() * empty.length)];
    } else if (difficulty === 'medium') {
        move = findWinningMove('O') || findWinningMove('X');
        if (move === null) {
            const empty = ticTacToeState.board.map((cell, idx) => cell === '' ? idx : null).filter(x => x !== null);
            move = empty[Math.floor(Math.random() * empty.length)];
        }
    } else {
        move = findBestMove();
    }
    
    if (move !== undefined && move !== null) {
        ticTacToeState.board[move] = 'O';
        renderTTTBoard();
    }
}

function findWinningMove(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
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
    const center = 4;
    const corners = [0, 2, 6, 8];
    const edges = [1, 3, 5, 7];
    
    let move = findWinningMove('O');
    if (move !== null) return move;
    
    move = findWinningMove('X');
    if (move !== null) return move;
    
    if (ticTacToeState.board[center] === '') return center;
    
    const emptyCorners = corners.filter(idx => ticTacToeState.board[idx] === '');
    if (emptyCorners.length > 0) return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    
    const emptyEdges = edges.filter(idx => ticTacToeState.board[idx] === '');
    if (emptyEdges.length > 0) return emptyEdges[0];
    
    return null;
}

function checkTTTWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
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
    if (!status) return;
    
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

// ====================
// FILL IN THE BLANK GAME
// ====================
const fillBlankSentences = [
    { sentence: 'The ___ is shining bright in the sky.', blank: 'sun', options: ['sun', 'moon', 'star', 'cloud'], image: '☀️' },
    { sentence: 'I love eating juicy red ___.', blank: 'apples', options: ['apples', 'bananas', 'oranges', 'grapes'], image: '🍎' },
    { sentence: 'The little ___ hops through the garden.', blank: 'bunny', options: ['bunny', 'dog', 'cat', 'bird'], image: '🐰' },
    { sentence: 'I drink a glass of ___ every morning.', blank: 'milk', options: ['milk', 'juice', 'water', 'soda'], image: '🥛' },
    { sentence: 'The ___ swims in the ocean.', blank: 'fish', options: ['fish', 'bird', 'dog', 'cat'], image: '🐟' },
    { sentence: 'We live in a cozy ___.', blank: 'house', options: ['house', 'car', 'boat', 'tree'], image: '🏠' },
    { sentence: 'I read my favorite ___ before bed.', blank: 'book', options: ['book', 'toy', 'game', 'song'], image: '📚' },
    { sentence: 'The ___ drives on the road.', blank: 'car', options: ['car', 'plane', 'boat', 'bike'], image: '🚗' },
    { sentence: 'I wear my warm ___ in winter.', blank: 'coat', options: ['coat', 'shorts', 'swimsuit', 'hat'], image: '🧥' },
    { sentence: 'The ___ barks and wags its tail.', blank: 'dog', options: ['dog', 'cat', 'bird', 'fish'], image: '🐶' },
    { sentence: 'The solar system consists of eight ___ orbiting the sun.', blank: 'planets', options: ['planets', 'asteroids', 'comets', 'stars'], image: '🪐' },
    { sentence: 'An ___ is a scientist who studies the stars and space.', blank: 'astronomer', options: ['astronomer', 'astronaut', 'biologist', 'chemist'], image: '🔭' },
    { sentence: 'Photosynthesis is how ___ make their own food using sunlight.', blank: 'plants', options: ['plants', 'animals', 'fungi', 'humans'], image: '🌱' },
    { sentence: 'The Great Wall of ___ is a famous landmark visible from space.', blank: 'China', options: ['China', 'India', 'Egypt', 'Mexico'], image: '🧱' },
    { sentence: 'A group of lions is called a ___.', blank: 'pride', options: ['pride', 'pack', 'herd', 'flock'], image: '🦁' },
    { sentence: '___ is the force that pulls everything toward the center of the Earth.', blank: 'Gravity', options: ['Gravity', 'Magnetism', 'Friction', 'Inertia'], image: '🌍' },
    { sentence: 'The process of a caterpillar turning into a butterfly is called ___.', blank: 'metamorphosis', options: ['metamorphosis', 'hibernation', 'migration', 'evolution'], image: '🦋' },
    { sentence: 'Oxygen is a ___ that all humans need to breathe to survive.', blank: 'gas', options: ['gas', 'liquid', 'solid', 'metal'], image: '🌬️' }
];

function startFillBlankGame() {
    const question = fillBlankSentences[Math.floor(Math.random() * fillBlankSentences.length)];
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content">
                <h2>✏️ Fill in the Blank</h2>
                <div class="fill-blank-hint" style="font-size: 4rem; text-align: center; margin: 1rem 0;">${question.image}</div>
                <p class="fill-blank-sentence" style="font-size: 1.3rem; text-align: center; line-height: 2; padding: 1rem; background: #f8f9fa; border-radius: 10px; margin: 1rem 0;">
                    ${question.sentence.replace('___', '<span style="color: #FF6B6B; font-weight: bold; border-bottom: 3px dashed #FF6B6B; padding: 0 20px;">___</span>')}
                </p>
                <div class="fill-blank-options" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 2rem 0;">
    `;
    
    shuffledOptions.forEach(option => {
        gameHtml += `
            <button onclick="checkFillBlank('${option}', '${question.blank}')" 
                    style="padding: 1.5rem; font-size: 1.2rem; background: #4ECDC4; color: white; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s;">
                ${option}
            </button>
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

function checkFillBlank(selected, correct) {
    if (selected === correct) {
        alert('🎉 Perfect! You got it right!');
        audioManager.playSound('success');
        closeMiniGame();
        setTimeout(startFillBlankGame, 500);
    } else {
        alert('🤔 Not quite! Try another word!');
    }
}

// ====================
// CHESS GAME
// ====================
let chessState = {
    board: [],
    selectedPiece: null,
    currentPlayer: 'white',
    gameOver: false
};

const PIECES = {
    white: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
    black: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
};

function startChessGame() {
    initChessBoard();
    chessState.selectedPiece = null;
    chessState.currentPlayer = 'white';
    chessState.gameOver = false;
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content" style="max-width: 600px; width: 95%;">
                <h2>♟️ Kids Chess</h2>
                <div id="chess-status" style="margin-bottom: 1rem; font-weight: bold; color: #4ECDC4;">Your turn!</div>
                <div id="chess-board-container" style="display: flex; flex-direction: column; align-items: center;">
                    <div id="chess-board" class="chess-board" style="display: grid; grid-template-columns: repeat(8, 1fr); border: 4px solid #333; width: 100%; aspect-ratio: 1/1;">
                    </div>
                </div>
                <div id="chess-info" style="margin-top: 1rem; text-align: left; background: #f9f9f9; padding: 10px; border-radius: 8px; font-size: 0.9rem;">
                    <strong>How to play:</strong> Click a piece to see its moves. Capture the King!
                </div>
                <div style="margin-top: 1rem;">
                    <button onclick="initChessBoard(); renderChessBoard();" class="control-btn" style="background: #FFA726;">🔄 Reset</button>
                    <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    renderChessBoard();
}

function initChessBoard() {
    chessState.board = Array(8).fill(null).map(() => Array(8).fill(null));
    const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
    for (let i = 0; i < 8; i++) {
        chessState.board[0][i] = { type: backRank[i], color: 'black' };
        chessState.board[1][i] = { type: 'p', color: 'black' };
        chessState.board[7][i] = { type: backRank[i], color: 'white' };
        chessState.board[6][i] = { type: 'p', color: 'white' };
    }
}

function renderChessBoard() {
    const boardEl = document.getElementById('chess-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.style.width = '100%';
            square.style.height = '100%';
            square.style.display = 'flex';
            square.style.alignItems = 'center';
            square.style.justifyContent = 'center';
            square.style.fontSize = '2.2rem';
            square.style.cursor = 'pointer';
            
            const isDark = (r + c) % 2 === 1;
            square.style.background = isDark ? '#B7C0D8' : '#FFFFFF';
            
            const piece = chessState.board[r][c];
            if (piece) {
                square.textContent = PIECES[piece.color][piece.type];
                square.style.color = piece.color === 'white' ? '#000' : '#444';
            }
            
            if (chessState.selectedPiece && chessState.selectedPiece.r === r && chessState.selectedPiece.c === c) {
                square.style.background = '#FFE082';
            }
            
            square.onclick = () => handleChessClick(r, c);
            boardEl.appendChild(square);
        }
    }
}

function handleChessClick(r, c) {
    if (chessState.gameOver || chessState.currentPlayer !== 'white') return;
    const piece = chessState.board[r][c];
    
    if (chessState.selectedPiece) {
        const moves = getChessMoves(chessState.selectedPiece.r, chessState.selectedPiece.c);
        const move = moves.find(m => m.r === r && m.c === c);
        
        if (move) {
            makeChessMove(chessState.selectedPiece.r, chessState.selectedPiece.c, r, c);
            if (!chessState.gameOver) setTimeout(makeChessComputerMove, 800);
            return;
        }
    }
    
    if (piece && piece.color === 'white') {
        chessState.selectedPiece = { r, c };
    } else {
        chessState.selectedPiece = null;
    }
    renderChessBoard();
}

function makeChessMove(fromR, fromC, toR, toC) {
    const piece = chessState.board[fromR][fromC];
    const target = chessState.board[toR][toC];
    
    if (target && target.type === 'k') endChessGame(piece.color);
    
    chessState.board[toR][toC] = piece;
    chessState.board[fromR][fromC] = null;
    chessState.selectedPiece = null;
    chessState.currentPlayer = chessState.currentPlayer === 'white' ? 'black' : 'white';
    
    const status = document.getElementById('chess-status');
    if (status) status.textContent = chessState.currentPlayer === 'white' ? 'Your turn!' : 'Computer is thinking...';
    
    renderChessBoard();
}

function getChessMoves(r, c) {
    const piece = chessState.board[r][c];
    if (!piece) return [];
    
    const moves = [];
    const color = piece.color;
    const type = piece.type;
    
    const isEnemy = (tr, tc) => (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && chessState.board[tr][tc] && chessState.board[tr][tc].color !== color);
    const isEmpty = (tr, tc) => (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !chessState.board[tr][tc]);
    
    if (type === 'p') {
        const dir = color === 'white' ? -1 : 1;
        if (isEmpty(r + dir, c)) moves.push({ r: r + dir, c });
        if (isEnemy(r + dir, c - 1)) moves.push({ r: r + dir, c: c - 1 });
        if (isEnemy(r + dir, c + 1)) moves.push({ r: r + dir, c: c + 1 });
    } else if (type === 'r') addChessLinearMoves(moves, r, c, [[0, 1], [0, -1], [1, 0], [-1, 0]], color);
    else if (type === 'b') addChessLinearMoves(moves, r, c, [[1, 1], [1, -1], [-1, 1], [-1, -1]], color);
    else if (type === 'q') addChessLinearMoves(moves, r, c, [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]], color);
    else if (type === 'n') {
        [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(j => {
            const tr = r + j[0], tc = c + j[1];
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && (isEmpty(tr, tc) || isEnemy(tr, tc))) moves.push({ r: tr, c: tc });
        });
    } else if (type === 'k') {
        [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(s => {
            const tr = r + s[0], tc = c + s[1];
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && (isEmpty(tr, tc) || isEnemy(tr, tc))) moves.push({ r: tr, c: tc });
        });
    }
    return moves;
}

function addChessLinearMoves(moves, r, c, dirs, color) {
    dirs.forEach(d => {
        let tr = r + d[0], tc = c + d[1];
        while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            if (!chessState.board[tr][tc]) moves.push({ r: tr, c: tc });
            else {
                if (chessState.board[tr][tc].color !== color) moves.push({ r: tr, c: tc });
                break;
            }
            tr += d[0]; tc += d[1];
        }
    });
}

function makeChessComputerMove() {
    if (chessState.gameOver) return;
    const allMoves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = chessState.board[r][c];
            if (piece && piece.color === 'black') {
                getChessMoves(r, c).forEach(m => allMoves.push({ from: { r, c }, to: m }));
            }
        }
    }
    if (allMoves.length === 0) { endChessGame('white'); return; }
    const captures = allMoves.filter(m => chessState.board[m.to.r][m.to.c]);
    const move = captures.length > 0 ? captures[Math.floor(Math.random() * captures.length)] : allMoves[Math.floor(Math.random() * allMoves.length)];
    makeChessMove(move.from.r, move.from.c, move.to.r, move.to.c);
}

function endChessGame(winner) {
    chessState.gameOver = true;
    const status = document.getElementById('chess-status');
    if (!status) return;
    if (winner === 'white') {
        status.textContent = '🎉 You won! Grandmaster!';
        status.style.color = '#66BB6A';
        audioManager.playSound('success');
    } else {
        status.textContent = '🤖 Computer won! Try again!';
        status.style.color = '#FF6B6B';
    }
}

// ====================
// CHECKERS GAME
// ====================
let checkersState = {
    board: [],
    selectedPiece: null,
    currentPlayer: 'red',
    gameOver: false
};

function startCheckersGame() {
    initCheckersBoard();
    checkersState.selectedPiece = null;
    checkersState.currentPlayer = 'red';
    checkersState.gameOver = false;
    
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content" style="max-width: 600px; width: 95%;">
                <h2>🔴 Kids Checkers</h2>
                <div id="checkers-status" style="margin-bottom: 1rem; font-weight: bold; color: #FF6B6B;">Your turn!</div>
                <div id="checkers-board-container" style="display: flex; flex-direction: column; align-items: center;">
                    <div id="checkers-board" class="checkers-board" style="display: grid; grid-template-columns: repeat(8, 1fr); border: 4px solid #333; width: 100%; aspect-ratio: 1/1;">
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <button onclick="initCheckersBoard(); renderCheckersBoard();" class="control-btn" style="background: #FFA726;">🔄 Reset</button>
                    <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    renderCheckersBoard();
}

function initCheckersBoard() {
    checkersState.board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) checkersState.board[r][c] = { color: 'black', king: false };
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) checkersState.board[r][c] = { color: 'red', king: false };
}

function renderCheckersBoard() {
    const boardEl = document.getElementById('checkers-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.style.width = '100%'; square.style.height = '100%';
            square.style.display = 'flex'; square.style.alignItems = 'center'; square.style.justifyContent = 'center';
            square.style.background = (r + c) % 2 === 1 ? '#555' : '#EEE';
            
            const piece = checkersState.board[r][c];
            if (piece) {
                const pEl = document.createElement('div');
                pEl.style.width = '80%'; pEl.style.height = '80%'; pEl.style.borderRadius = '50%';
                pEl.style.background = piece.color === 'red' ? '#FF6B6B' : '#333';
                pEl.style.border = '3px solid rgba(255,255,255,0.3)';
                pEl.style.display = 'flex'; pEl.style.alignItems = 'center'; pEl.style.justifyContent = 'center';
                if (piece.king) { pEl.textContent = '👑'; pEl.style.color = 'white'; }
                if (checkersState.selectedPiece && checkersState.selectedPiece.r === r && checkersState.selectedPiece.c === c) pEl.style.border = '3px solid #FFEB3B';
                square.appendChild(pEl);
            }
            if ((r + c) % 2 === 1) square.onclick = () => handleCheckersClick(r, c);
            boardEl.appendChild(square);
        }
    }
}

function handleCheckersClick(r, c) {
    if (checkersState.gameOver || checkersState.currentPlayer !== 'red') return;
    const piece = checkersState.board[r][c];
    
    if (checkersState.selectedPiece) {
        const moves = getCheckersMoves(checkersState.selectedPiece.r, checkersState.selectedPiece.c);
        const move = moves.find(m => m.r === r && m.c === c);
        if (move) {
            applyCheckersMove(checkersState.selectedPiece.r, checkersState.selectedPiece.c, r, c);
            if (!checkersState.gameOver) setTimeout(makeCheckersComputerMove, 800);
            return;
        }
    }
    
    if (piece && piece.color === 'red') checkersState.selectedPiece = { r, c };
    else checkersState.selectedPiece = null;
    renderCheckersBoard();
}

function applyCheckersMove(fromR, fromC, toR, toC) {
    const piece = checkersState.board[fromR][fromC];
    const moves = getCheckersMoves(fromR, fromC);
    const move = moves.find(m => m.r === toR && m.c === toC);
    
    checkersState.board[toR][toC] = piece;
    checkersState.board[fromR][fromC] = null;
    if (piece.color === 'red' && toR === 0) piece.king = true;
    if (piece.color === 'black' && toR === 7) piece.king = true;
    if (move.cap) checkersState.board[move.cap.r][move.cap.c] = null;
    
    checkersState.selectedPiece = null;
    checkersState.currentPlayer = checkersState.currentPlayer === 'red' ? 'black' : 'red';
    const status = document.getElementById('checkers-status');
    if (status) status.textContent = checkersState.currentPlayer === 'red' ? 'Your turn!' : 'Thinking...';
    
    checkCheckersWinner();
    renderCheckersBoard();
}

function getCheckersMoves(r, c) {
    const piece = checkersState.board[r][c];
    if (!piece) return [];
    const moves = [], color = piece.color, isKing = piece.king, dirs = [];
    if (color === 'red' || isKing) dirs.push([-1, -1], [-1, 1]);
    if (color === 'black' || isKing) dirs.push([1, -1], [1, 1]);
    
    const jumps = [], simples = [];
    dirs.forEach(d => {
        const tr = r + d[0], tc = c + d[1];
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !checkersState.board[tr][tc]) simples.push({ r: tr, c: tc });
        const jr = r + d[0] * 2, jc = c + d[1] * 2, mr = r + d[0], mc = c + d[1];
        if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8) {
            const mid = checkersState.board[mr][mc];
            if (mid && mid.color !== color && !checkersState.board[jr][jc]) jumps.push({ r: jr, c: jc, cap: { r: mr, c: mc } });
        }
    });
    return jumps.length > 0 ? jumps : simples;
}

function makeCheckersComputerMove() {
    if (checkersState.gameOver) return;
    const jumps = [], simples = [];
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const p = checkersState.board[r][c];
        if (p && p.color === 'black') {
            getCheckersMoves(r, c).forEach(m => {
                const data = { from: { r, c }, to: m };
                if (m.cap) jumps.push(data); else simples.push(data);
            });
        }
    }
    if (jumps.length === 0 && simples.length === 0) { endCheckersGame('red'); return; }
    const m = jumps.length > 0 ? jumps[0] : simples[Math.floor(Math.random() * simples.length)];
    applyCheckersMove(m.from.r, m.from.c, m.to.r, m.to.c);
}

function checkCheckersWinner() {
    let r = 0, b = 0;
    checkersState.board.forEach(row => row.forEach(p => { if (p) { if (p.color === 'red') r++; else b++; } }));
    if (r === 0) endCheckersGame('black');
    if (b === 0) endCheckersGame('red');
}

function endCheckersGame(winner) {
    checkersState.gameOver = true;
    const status = document.getElementById('checkers-status');
    if (!status) return;
    if (winner === 'red') {
        status.textContent = '🎉 Red Wins!';
        status.style.color = '#66BB6A';
        audioManager.playSound('success');
    } else {
        status.textContent = '🤖 Computer Wins!';
        status.style.color = '#FF6B6B';
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

function updatePlayTimeDisplay() {
    const playTimeElement = document.getElementById('today-play-time');
    if (playTimeElement) {
        playTimeElement.textContent = `${gameState.playTimeToday} minutes`;
    }
}

function clearAllData() {
    gameState.clearAllData();
}

// Privacy Policy Functions
function showPrivacyPolicy() {
    document.getElementById('privacy-modal').classList.remove('hidden');
}

function closePrivacyModal() {
    document.getElementById('privacy-modal').classList.add('hidden');
}

// Memory game state
let memoryGameState = {
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 4
};

function flipCard(index, value) {
    const cards = document.querySelectorAll('.memory-card');
    const card = cards[index];
    
    if (memoryGameState.flippedCards.length >= 2 || card.classList.contains('matched')) {
        return;
    }
    
    // Flip the card
    card.querySelector('.card-front').classList.add('hidden');
    card.querySelector('.card-back').classList.remove('hidden');
    card.classList.add('flipped');
    
    memoryGameState.flippedCards.push({ index, value, element: card });
    
    // Check for match after 2 cards are flipped
    if (memoryGameState.flippedCards.length === 2) {
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [card1, card2] = memoryGameState.flippedCards;
    
    if (card1.value === card2.value) {
        // Match found
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        memoryGameState.matchedPairs++;
        
        if (memoryGameState.matchedPairs === memoryGameState.totalPairs) {
            setTimeout(() => {
                alert('🎉 Congratulations! You found all the pairs!');
                gameState.addScore(25);
                closeMiniGame();
            }, 500);
        }
    } else {
        // No match - flip cards back
        card1.element.querySelector('.card-front').classList.remove('hidden');
        card1.element.querySelector('.card-back').classList.add('hidden');
        card2.element.querySelector('.card-front').classList.remove('hidden');
        card2.element.querySelector('.card-back').classList.add('hidden');
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
    }
    
    memoryGameState.flippedCards = [];
}

// Utility Functions

// Additional utility functions
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.querySelector('.mini-game-overlay')) {
            closeMiniGame();
        } else if (document.getElementById('privacy-modal').classList.contains('hidden') === false) {
            closePrivacyModal();
        }
    }
});

// Auto-save game state periodically
setInterval(() => {
    gameState.saveSettings();
    gameState.saveCharacter();
}, 30000); // Every 30 seconds

// Initialize audio controls on page load
setTimeout(() => {
    initializeAudioControls();
}, 100);

console.log('🎮 Interactive Kids Storytelling Game loaded successfully!');
console.log('✅ COPPA Compliant - Privacy Protected');
console.log('🛡️ Local Storage sync enabled');

// ====================
// SNAKE GAME (Classic Nokia Style)
// ====================
function startSnakeGame() {
    let gameHtml = `
        <div class="mini-game-overlay">
            <div class="mini-game-content" style="max-width: 500px; background: #2d3436; color: #fff; border: 8px solid #636e72; border-radius: 20px;">
                <h2 style="color: #55efc4; font-family: 'Courier New', Courier, monospace;">🐍 CLASSIC SNAKE</h2>
                <div style="background: #95afc0; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
                    <span id="snake-score" style="color: #2d3436; font-weight: bold; font-family: 'Courier New', sans-serif;">Score: 0</span>
                </div>
                <canvas id="snake-canvas" width="300" height="300" style="background: #badc58; border: 4px solid #535c68; display: block; margin: 0 auto; image-rendering: pixelated;"></canvas>
                
                <div class="snake-controls" style="margin-top: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 200px; margin-left: auto; margin-right: auto;">
                    <div></div>
                    <button onclick="changeSnakeDirection('up')" style="padding: 15px; background: #636e72; color: white; border: none; border-radius: 10px; font-size: 1.5rem; cursor: pointer;">⬆️</button>
                    <div></div>
                    <button onclick="changeSnakeDirection('left')" style="padding: 15px; background: #636e72; color: white; border: none; border-radius: 10px; font-size: 1.5rem; cursor: pointer;">⬅️</button>
                    <button onclick="changeSnakeDirection('down')" style="padding: 15px; background: #636e72; color: white; border: none; border-radius: 10px; font-size: 1.5rem; cursor: pointer;">⬇️</button>
                    <button onclick="changeSnakeDirection('right')" style="padding: 15px; background: #636e72; color: white; border: none; border-radius: 10px; font-size: 1.5rem; cursor: pointer;">➡️</button>
                </div>
                
                <p style="margin-top: 20px; font-size: 0.9rem; color: #dfe6e9;">Use arrows or buttons to play!</p>
                <button class="close-mini-game" onclick="stopSnakeGame()" style="margin-top: 10px; background: #ff7675; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">❌ Exit Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const grid = 20;
    let count = 0;
    let score = 0;
    
    let snake = {
        x: 160,
        y: 160,
        dx: grid,
        dy: 0,
        cells: [],
        maxCells: 4
    };
    
    let apple = {
        x: 320,
        y: 320
    };

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function resetApple() {
        apple.x = getRandomInt(0, 15) * grid;
        apple.y = getRandomInt(0, 15) * grid;
    }
    
    resetApple();

    function loop() {
        if (window.snakeGamePaused) return;
        requestAnimationFrame(loop);

        // Slow game loop to 15 fps
        if (++count < 6) return;
        count = 0;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Move snake
        snake.x += snake.dx;
        snake.y += snake.dy;

        // Wrap snake position on edge of screen
        if (snake.x < 0) snake.x = canvas.width - grid;
        else if (snake.x >= canvas.width) snake.x = 0;
        
        if (snake.y < 0) snake.y = canvas.height - grid;
        else if (snake.y >= canvas.height) snake.y = 0;

        // Keep track of where snake has been. Front of the array is always the head
        snake.cells.unshift({x: snake.x, y: snake.y});

        // Remove cells as we move away from them
        if (snake.cells.length > snake.maxCells) {
            snake.cells.pop();
        }

        // Draw apple
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(apple.x, apple.y, grid-1, grid-1);

        // Draw snake
        ctx.fillStyle = '#2d3436';
        snake.cells.forEach(function(cell, index) {
            ctx.fillRect(cell.x, cell.y, grid-1, grid-1);

            // Snake ate apple
            if (cell.x === apple.x && cell.y === apple.y) {
                snake.maxCells++;
                score += 10;
                document.getElementById('snake-score').textContent = 'Score: ' + score;
                resetApple();
                audioManager.playSound('click');
            }

            // Check collision with all cells after this one (modified bubble sort)
            for (let i = index + 1; i < snake.cells.length; i++) {
                // Collision!
                if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                    gameOver();
                }
            }
        });
    }

    function gameOver() {
        window.snakeGamePaused = true;
        alert('💥 Game Over! Your score: ' + score);
        gameState.addScore(score / 5);
        stopSnakeGame();
    }

    window.snakeGamePaused = false;
    requestAnimationFrame(loop);

    window.changeSnakeDirection = function(dir) {
        if (dir === 'up' && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
        } else if (dir === 'down' && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
        } else if (dir === 'left' && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
        } else if (dir === 'right' && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
        }
    };

    // Keyboard support
    window.snakeKeyHandler = function(e) {
        if (e.which === 37 && snake.dx === 0) changeSnakeDirection('left');
        else if (e.which === 38 && snake.dy === 0) changeSnakeDirection('up');
        else if (e.which === 39 && snake.dx === 0) changeSnakeDirection('right');
        else if (e.which === 40 && snake.dy === 0) changeSnakeDirection('down');
    };
    document.addEventListener('keydown', window.snakeKeyHandler);

    window.stopSnakeGame = function() {
        window.snakeGamePaused = true;
        document.removeEventListener('keydown', window.snakeKeyHandler);
        closeMiniGame();
    };
}
