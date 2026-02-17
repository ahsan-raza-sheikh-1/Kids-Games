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
        default:
            alert('🎮 This mini-game is coming soon!');
    }
}
