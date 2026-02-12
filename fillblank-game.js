// FILL IN THE BLANK GAME
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
                    style="padding: 1.5rem; font-size: 1.2rem; background: #4ECDC4; color: white; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s;" 
                    onmouseover="this.style.transform='scale(1.05)'; this.style.background='#45B7D1'" 
                    onmouseout="this.style.transform='scale(1)'; this.style.background='#4ECDC4'">
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
        // Start a new round
        setTimeout(startFillBlankGame, 500);
    } else {
        alert('🤔 Not quite! Try another word!');
    }
}
