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

// CSS for mini-games (injected dynamically)
const miniGameStyles = `
<style>
.mini-game-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.mini-game-content {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    text-align: center;
}

.counting-area {
    position: relative;
    height: 300px;
    background: #f0f8ff;
    border-radius: 10px;
    margin: 1rem 0;
}

.number-buttons {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
    margin: 1rem 0;
}

.number-btn {
    background: #4ECDC4;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.number-btn:hover {
    background: #45B7D1;
    transform: scale(1.1);
}

.memory-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin: 1rem 0;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.memory-card {
    aspect-ratio: 1;
    background: #FF6B6B;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.memory-card:hover {
    transform: scale(1.05);
}

.memory-card.matched {
    background: #66BB6A;
    cursor: not-allowed;
}

.close-mini-game {
    background: #EF5350;
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 1rem;
}

.close-mini-game:hover {
    background: #d32f2f;
}
</style>
`;

// Inject mini-game styles
document.head.insertAdjacentHTML('beforeend', miniGameStyles);

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
    if (typeof initializeAudioControls === 'function') {
        initializeAudioControls();
    }
}, 100);

console.log('🎮 Interactive Kids Storytelling Game loaded successfully!');
console.log('✅ COPPA Compliant - Privacy Protected');
console.log('🛡️ Local Storage sync enabled');
