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
        gameHtml += \`<span style="font-size: 2rem; margin: 10px;">\${item}</span>\`;
    });
    
    gameHtml += `
                </div>
                <div class="pattern-choices">
                    <button onclick="checkPatternAnswer('\${currentPattern[0]}', '\${answer}')" style="font-size: 2rem; margin: 10px; padding: 10px;">\${currentPattern[0]}</button>
                    <button onclick="checkPatternAnswer('\${currentPattern[1]}', '\${answer}')" style="font-size: 2rem; margin: 10px; padding: 10px;">\${currentPattern[1]}</button>
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
                <p>Find the \${isUppercase ? 'lowercase' : 'uppercase'} version of: <strong style="font-size: 3rem;">\${showLetter}</strong></p>
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
        gameHtml += \`<button class="letter-btn" onclick="checkLetterAnswer('\${letter}', '\${findLetter}')" style="font-size: 2rem; margin: 10px; padding: 15px; min-width: 60px;">\${letter}</button>\`;
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
        gameHtml += \`<span style="font-size: 2.5rem; margin: 15px; padding: 10px; background: #f0f8ff; border-radius: 10px;">\${num}</span>\`;
    });
    
    gameHtml += `
                </div>
                <div class="number-choices">
    `;
    
    // Create answer choices
    const choices = [answer - 1, answer, answer + 1].sort(() => Math.random() - 0.5);
    choices.forEach(choice => {
        gameHtml += \`<button onclick="checkNumberAnswer(\${choice}, \${answer})" style="font-size: 2rem; margin: 10px; padding: 15px; min-width: 80px;">\${choice}</button>\`;
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
                <p>Which word rhymes with: <strong style="font-size: 2rem; color: #4ECDC4;">\${currentPair.word}</strong>?</p>
                <div class="rhyme-choices">
    `;
    
    allChoices.forEach(choice => {
        gameHtml += \`<button onclick="checkRhymeAnswer('\${choice}', '\${correctRhyme}')" style="font-size: 1.5rem; margin: 10px; padding: 15px; min-width: 100px;">\${choice}</button>\`;
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
