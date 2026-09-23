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
                <p>Which animal makes this sound: <strong>"\${targetAnimal.sound}"</strong>?</p>
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
        gameHtml += \`<button onclick="checkAnimalAnswer('\${animal.name}', '\${targetAnimal.name}')" style="margin: 10px; padding: 15px; font-size: 1.5rem;">\${animal.emoji} \${animal.name}</button>\`;
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
                <p>Help make a <strong>\${currentRecipe.name}</strong>!</p>
                <p>Click on the correct ingredients:</p>
                <div class="cooking-ingredients">
    `;
    
    allIngredients.forEach(ingredient => {
        const isCorrect = currentRecipe.ingredients.includes(ingredient);
        gameHtml += \`<button onclick="selectIngredient('\${ingredient}', \${isCorrect})" style="font-size: 3rem; margin: 10px; padding: 15px; background: #f0f8ff; border: 2px solid #4ECDC4; border-radius: 10px;">\${ingredient}</button>\`;
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
                    alert(\`🎉 Delicious! You made a perfect \${window.cookingGame.recipeName}!\`);
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
        alert('🤔 That ingredient doesn\\'t belong in this recipe!');
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
                <p>Help this plant grow! \${currentPlant}</p>
                <p>What does it need? (Click all correct items)</p>
                <div class="garden-items">
    `;
    
    allItems.forEach(item => {
        const isCorrect = needs.includes(item);
        gameHtml += \`<button onclick="selectGardenItem('\${item}', \${isCorrect})" style="font-size: 3rem; margin: 10px; padding: 15px; background: #f0f8ff; border: 2px solid #4ECDC4; border-radius: 10px;">\${item}</button>\`;
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
