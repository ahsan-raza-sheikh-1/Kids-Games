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
