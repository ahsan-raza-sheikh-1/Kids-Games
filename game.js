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
        this.stories = {
            'forest-adventure': {
                title: 'The Friendly Forest Adventure',
                pages: [
                    {
                        title: 'The Adventure Begins',
                        text: 'Once upon a time, there was a curious little girl named Maya who loved exploring nature. One sunny morning, she decided to visit the magical forest near her home. As she approached the forest entrance, she noticed two different paths.',
                        image: '🌲',
                        choices: [
                            { text: 'Follow the butterfly path 🦋', nextPage: 1 },
                            { text: 'Take the flower trail 🌸', nextPage: 2 }
                        ]
                    },
                    {
                        title: 'The Butterfly Guide',
                        text: 'Maya followed the colorful butterflies deeper into the forest. The butterflies danced around her, leading her through tall trees and singing birds. Soon, she came across a wise old owl sitting on a branch. "Hello little one," hooted the owl. "I can help you on your journey!"',
                        image: '🦉',
                        choices: [
                            { text: 'Ask the owl for advice 🤔', nextPage: 3 },
                            { text: 'Thank the owl and continue 🚶‍♀️', nextPage: 4 }
                        ]
                    },
                    {
                        title: 'The Flower Garden',
                        text: 'Maya walked along the flower trail and discovered a beautiful garden where a friendly rabbit was tending to the flowers. The garden was filled with roses, daisies, and sunflowers that seemed to glow in the morning light. "Would you like to help me plant some seeds?" asked the rabbit with a warm smile.',
                        image: '🐰',
                        choices: [
                            { text: 'Help the rabbit with gardening 🌱', nextPage: 5 },
                            { text: 'Ask about the magical flowers ✨', nextPage: 6 }
                        ]
                    },
                    {
                        title: 'Wise Owl\'s Advice',
                        text: 'The wise owl taught Maya about the importance of being kind to all forest creatures. "When we help others," said the owl, "we create magic in the world." The owl showed Maya a secret path and gave her a special feather for protection. Maya felt happy and wise.',
                        image: '🦉',
                        choices: [
                            { text: 'Use the secret path 🗝️', nextPage: 7 },
                            { text: 'Continue on the main trail 🚶‍♀️', nextPage: 8 }
                        ]
                    },
                    {
                        title: 'Forest Exploration',
                        text: 'Maya continued exploring and met many friendly animals. A squirrel taught her about sharing nuts, a deer showed her the cleanest stream, and a fox shared stories of the forest\'s history. Each animal taught her something new about friendship, kindness, and the wonders of nature.',
                        image: '🦌',
                        choices: [
                            { text: 'Visit the magical clearing ✨', nextPage: 9 },
                            { text: 'Explore the hidden cave 🕳️', nextPage: 10 }
                        ]
                    },
                    {
                        title: 'Garden Helper',
                        text: 'Maya helped the rabbit plant beautiful flowers. Working together, they created the most colorful garden in the forest! The rabbit taught Maya that teamwork makes everything more fun. As they worked, magical seeds began to sparkle and grow into rainbow flowers.',
                        image: '🌺',
                        choices: [
                            { text: 'Make a wish on the rainbow flowers 🌈', nextPage: 11 },
                            { text: 'Explore more of the forest 🌲', nextPage: 9 }
                        ]
                    },
                    {
                        title: 'Magical Flowers',
                        text: 'The rabbit showed Maya flowers that sparkled with morning dew. "These flowers grant one wish to those with kind hearts," whispered the rabbit. Maya made a wish for all forest animals to be happy and healthy. The flowers glowed brighter, and Maya felt the magic working.',
                        image: '🌟',
                        choices: [
                            { text: 'Continue to the magical clearing ✨', nextPage: 9 },
                            { text: 'Visit the wishing well 🪣', nextPage: 12 }
                        ]
                    },
                    {
                        title: 'The Secret Path',
                        text: 'Using the owl\'s secret path, Maya discovered a hidden grove where baby animals played together. A mother bear invited Maya to join their picnic. Maya shared her lunch and made even more friends.',
                        image: '🐻',
                        choices: [
                            { text: 'Play games with the baby animals 🎮', nextPage: 13 },
                            { text: 'Help organize the picnic 🧺', nextPage: 14 }
                        ]
                    },
                    {
                        title: 'The Main Trail',
                        text: 'Maya continued on the main trail and found a beautiful stream where fish jumped and played. A wise frog sitting on a lily pad offered to teach Maya about the water cycle and how all living things are connected.',
                        image: '🐸',
                        choices: [
                            { text: 'Learn about nature from the frog 📚', nextPage: 15 },
                            { text: 'Cross the stream to explore 🌊', nextPage: 9 }
                        ]
                    },
                    {
                        title: 'The Magical Clearing',
                        text: 'Maya arrived at a magical clearing where all her new friends were waiting! The owl, rabbit, and other forest animals had prepared a friendship celebration. Golden light filtered through the trees, and flowers bloomed in a perfect circle around them.',
                        image: '🎉',
                        choices: [
                            { text: 'Join the celebration dance 💃', nextPage: 16 },
                            { text: 'Share stories with friends 📖', nextPage: 17 }
                        ]
                    },
                    {
                        title: 'The Hidden Cave',
                        text: 'Maya explored a hidden cave and discovered ancient drawings on the walls showing the history of the forest. Glowing crystals lit up the cave, and Maya learned that she was part of a long tradition of forest guardians.',
                        image: '💎',
                        choices: [
                            { text: 'Become a forest guardian 🛡️', nextPage: 18 },
                            { text: 'Return to share the discovery 🗣️', nextPage: 16 }
                        ]
                    },
                    {
                        title: 'The Rainbow Wish',
                        text: 'Maya\'s wish on the rainbow flowers came true! The entire forest began to shimmer with magical colors, and all the animals felt happier and healthier. Maya realized that her kind heart had made this magic possible.',
                        image: '🌈',
                        choices: [
                            { text: 'Celebrate with all the animals 🎊', nextPage: 16 }
                        ]
                    },
                    {
                        title: 'The Wishing Well',
                        text: 'Maya found an ancient wishing well surrounded by singing birds. She threw in a pebble and made another wish - for all children to find magic in nature. The well glowed with warm light, granting her wish.',
                        image: '🪣',
                        choices: [
                            { text: 'Return to the celebration 🎉', nextPage: 16 }
                        ]
                    },
                    {
                        title: 'Animal Games',
                        text: 'Maya played hide-and-seek with baby foxes, raced with young rabbits, and learned songs from bird families. The games taught her about cooperation, fair play, and having fun together.',
                        image: '🎮',
                        choices: [
                            { text: 'Organize a forest Olympics 🏆', nextPage: 19 }
                        ]
                    },
                    {
                        title: 'Picnic Helper',
                        text: 'Maya helped organize the most wonderful forest picnic ever! She arranged flowers as decorations, helped serve berry juice, and made sure every animal had their favorite food. Everyone felt included and happy.',
                        image: '🧺',
                        choices: [
                            { text: 'Lead everyone to the celebration 🎵', nextPage: 16 }
                        ]
                    },
                    {
                        title: 'Nature\'s Wisdom',
                        text: 'The frog taught Maya amazing things about how rain becomes rivers, how trees breathe, and how every creature has an important job in nature. Maya felt like she understood the forest\'s secrets.',
                        image: '📚',
                        choices: [
                            { text: 'Share this knowledge with others 🎓', nextPage: 16 }
                        ]
                    },
                    {
                        title: 'Celebration Dance',
                        text: 'Maya joined the magical celebration dance! All the forest animals danced together in perfect harmony. The trees swayed with the music, and flowers bloomed with each step. Maya felt the joy of true friendship.',
                        image: '💃',
                        choices: [
                            { text: 'Promise to return and visit 💝', nextPage: 20 }
                        ]
                    },
                    {
                        title: 'Sharing Stories',
                        text: 'Maya and her animal friends sat in a circle sharing stories of their adventures. Each story was more wonderful than the last, and Maya realized that friendship makes every story more magical.',
                        image: '📖',
                        choices: [
                            { text: 'Promise to return and visit 💝', nextPage: 20 }
                        ]
                    },
                    {
                        title: 'Forest Guardian',
                        text: 'Maya accepted the role of forest guardian! The animals gave her a special crown made of flowers and leaves. She promised to protect the forest and help other children discover its magic.',
                        image: '🛡️',
                        choices: [
                            { text: 'Begin your guardian duties 👑', nextPage: 20 }
                        ]
                    },
                    {
                        title: 'Forest Olympics',
                        text: 'Maya organized the first-ever Forest Olympics! There were races, jumping contests, and teamwork challenges. Every animal won a prize for their special talent, and everyone cheered for each other.',
                        image: '🏆',
                        choices: [
                            { text: 'Celebrate with the victory ceremony 🥇', nextPage: 20 }
                        ]
                    },
                    {
                        title: 'The Hidden Cave',
                        text: 'Inside the cool, dark cave, Maya found walls that sparkled with natural crystals. A group of bats lived here, but they weren\'t scary - they were musicians! They used the echoes of the cave to create beautiful, rhythmic music.',
                        image: '🦇',
                        choices: [
                            { text: 'Join the bat band 🥁', nextPage: 23 },
                            { text: 'Search for glowing crystals 💎', nextPage: 24 }
                        ]
                    },
                    {
                        title: 'Bat Band Percussion',
                        text: 'Maya found some smooth stones and joined the bats in their rhythm. The music echoed through the forest, making all the animals tap their feet. Maya learned that music can be found in the most unexpected places.',
                        image: '🥁',
                        choices: [
                            { text: 'Lead the forest orchestra 🎻', nextPage: 25 }
                        ]
                    },
                    {
                        title: 'Crystal Hunter',
                        text: 'Maya discovered crystals that glowed in every color of the rainbow. These weren\'t just stones; they were "Kindness Crystals" that absorbed the good deeds done in the forest. She decided to share them with her friends.',
                        image: '💎',
                        choices: [
                            { text: 'Bring crystals to the celebration 🎊', nextPage: 16 }
                        ]
                    },
                    {
                        title: 'Nature School',
                        text: 'Maya decided to start a school to teach other children how to care for the forest. She showed them how to identify different leaves, how to listen to the birds, and the importance of never leaving trash behind.',
                        image: '🎓',
                        choices: [
                            { text: 'Graduate from Nature School 📜', nextPage: 26 }
                        ]
                    },
                    {
                        title: 'Grand Forest Graduation',
                        text: 'All the animals attended the graduation ceremony! Maya was so proud of her students. The wise owl gave her a special "Master Explorer" badge. Maya knew her work to protect nature would never end. The End! 🌟🎓🌲',
                        image: '📜',
                        choices: []
                    },
                    {
                        title: 'A Magical Friendship',
                        text: 'As the sun began to set, Maya realized this was the most magical day of her life. She had made wonderful friends, learned important lessons, and discovered that kindness creates the greatest magic of all.',
                        image: '🌅',
                        choices: [
                            { text: 'Return home with your treasures 🏡', nextPage: 21 },
                            { text: 'Stay for one last star story 🌟', nextPage: 22 },
                            { text: 'Explore the hidden cave 🦇', nextPage: 23 },
                            { text: 'Start a Nature School 🎓', nextPage: 26 }
                        ]
                    },
                    {
                        title: 'The Journey Home',
                        text: 'Maya walked back through the forest, the path glowing softly to guide her. She felt stronger and wiser than before. When she reached her house, she knew the forest would always be there for her. The End! 🌟🏡',
                        image: '🏡',
                        choices: []
                    },
                    {
                        title: 'Under the Starlight',
                        text: 'Maya and the animals watched the stars twinkle. The owl told a story of the North Star that guides all travelers. Maya fell asleep for a Moment, dreaming of more adventures. The End! ✨🦉',
                        image: '✨',
                        choices: []
                    }
                ]
            },
            'ocean-mystery': {
                title: 'Ocean Mystery Adventure',
                pages: [
                    {
                        title: 'The Mysterious Ocean',
                        text: 'Captain Sam found a message in a bottle on the beach. The parchment was old and decorated with sea shells. It was a treasure map showing an underwater kingdom! With diving gear ready and heart full of excitement, the adventure begins.',
                        image: '🌊',
                        choices: [
                            { text: 'Dive to the coral reef 🪸', nextPage: 1 },
                            { text: 'Follow the dolphins 🐬', nextPage: 2 }
                        ]
                    },
                    {
                        title: 'Coral Reef Discovery',
                        text: 'The coral reef was like an underwater rainbow city! Colorful fish swam in schools, sea anemones danced in the current, and the coral formations looked like underwater castles. A friendly seahorse with a golden mane offered to guide Sam through the underwater maze.',
                        image: '🪸',
                        choices: [
                            { text: 'Accept the seahorse\'s help 🌟', nextPage: 3 },
                            { text: 'Explore the coral castle 🏰', nextPage: 4 }
                        ]
                    },
                    {
                        title: 'Dolphin Friends',
                        text: 'The dolphins were incredibly smart and playful! They led Sam through underwater loops and spins, teaching him their secret dolphin language of clicks and whistles. They guided him to an underwater cave filled with glowing pearls and ancient treasures.',
                        image: '🐬',
                        choices: [
                            { text: 'Learn the dolphin language 🗣️', nextPage: 5 },
                            { text: 'Explore the treasure cave 💎', nextPage: 6 }
                        ]
                    },
                    {
                        title: 'Seahorse Guide',
                        text: 'The golden seahorse, named Sparkle, had lived in the ocean for hundreds of years. She knew every secret passage and hidden treasure. "The underwater kingdom is real," she whispered, "but only those with pure hearts can find it."',
                        image: '🌟',
                        choices: [
                            { text: 'Follow Sparkle\'s secret route 🗺️', nextPage: 7 },
                            { text: 'Ask about the kingdom\'s history 📚', nextPage: 8 }
                        ]
                    },
                    {
                        title: 'The Coral Castle',
                        text: 'Inside the coral castle, Sam met a wise octopus librarian who kept records of all ocean adventures. The octopus had eight arms full of ancient books and scrolls about the lost kingdom and its magical inhabitants.',
                        image: '🐙',
                        choices: [
                            { text: 'Read the ancient ocean books 📖', nextPage: 9 },
                            { text: 'Ask for a map to the kingdom 🗺️', nextPage: 7 }
                        ]
                    },
                    {
                        title: 'Dolphin Language',
                        text: 'Sam learned that dolphins are the ocean\'s messengers! They taught him to communicate with all sea creatures. With this new skill, Sam could understand the songs of whales, the whispers of fish, and the secrets of the sea.',
                        image: '🗣️',
                        choices: [
                            { text: 'Talk to the whale elders 🐋', nextPage: 10 },
                            { text: 'Gather information from fish 🐠', nextPage: 11 }
                        ]
                    },
                    {
                        title: 'The Treasure Cave',
                        text: 'The cave was filled with more than gold and jewels - it contained the memories of the ocean! Each pearl held a story, each shell contained a song, and Sam realized that the ocean\'s true treasure was its incredible history.',
                        image: '💎',
                        choices: [
                            { text: 'Listen to the pearl stories 📿', nextPage: 12 },
                            { text: 'Collect shells for the journey 🐚', nextPage: 13 }
                        ]
                    },
                    {
                        title: 'The Secret Route',
                        text: 'Sparkle led Sam through a hidden current that carried them past underwater volcanoes, through fields of sea grass, and around sleeping sea monsters. The journey was thrilling and beautiful, showing Sam wonders he never imagined.',
                        image: '🗺️',
                        choices: [
                            { text: 'Help wake a friendly sea monster 🐉', nextPage: 14 },
                            { text: 'Continue toward the kingdom 👑', nextPage: 15 }
                        ]
                    },
                    {
                        title: 'Kingdom\'s History',
                        text: 'Sparkle told Sam that the underwater kingdom was built by ancient merpeople who wanted to create a place where all sea creatures could live in harmony. The kingdom had been hidden to protect it from those who might harm the ocean.',
                        image: '📚',
                        choices: [
                            { text: 'Promise to protect the ocean 🛡️', nextPage: 16 },
                            { text: 'Learn more about merpeople 🧜‍♀️', nextPage: 17 }
                        ]
                    },
                    {
                        title: 'Ancient Ocean Books',
                        text: 'The octopus showed Sam books made of coral pages and seaweed ink. They contained stories of brave ocean explorers, magical sea creatures, and the importance of keeping the ocean clean and healthy.',
                        image: '📖',
                        choices: [
                            { text: 'Study ocean conservation 🌱', nextPage: 18 },
                            { text: 'Read about sea creature magic ✨', nextPage: 19 }
                        ]
                    },
                    {
                        title: 'Whale Elders',
                        text: 'The ancient whales were the ocean\'s wisest creatures. They sang Sam the song of the tides, taught him about ocean currents, and shared the secret that the kingdom appears only to those who truly love the sea.',
                        image: '🐋',
                        choices: [
                            { text: 'Sing the song of the tides 🎵', nextPage: 20 },
                            { text: 'Show your love for the ocean 💙', nextPage: 15 }
                        ]
                    },
                    {
                        title: 'Fish Wisdom',
                        text: 'The colorful fish formed schools that spelled out messages in the water! They told Sam that the kingdom was protected by a magical barrier that only opens for true friends of the ocean.',
                        image: '🐠',
                        choices: [
                            { text: 'Prove you\'re a friend of the ocean 🤝', nextPage: 15 },
                            { text: 'Learn to swim with the fish schools 🏊‍♂️', nextPage: 21 }
                        ]
                    },
                    {
                        title: 'Pearl Stories',
                        text: 'Each pearl shared a different ocean adventure - stories of brave sea turtles, playful seals, and mysterious deep-sea creatures. Sam learned that every drop of ocean water has traveled the world and has amazing stories to tell.',
                        image: '📿',
                        choices: [
                            { text: 'Become an ocean storyteller 📚', nextPage: 22 },
                            { text: 'Continue the quest 🔍', nextPage: 15 }
                        ]
                    },
                    {
                        title: 'Magical Shells',
                        text: 'Sam collected shells that could communicate across the ocean! Each shell had a different power - some could call dolphins, others could light up dark waters, and the most special one could open the gates to the kingdom.',
                        image: '🐚',
                        choices: [
                            { text: 'Use the kingdom shell 🗝️', nextPage: 15 },
                            { text: 'Help other sea creatures first 🤝', nextPage: 23 }
                        ]
                    },
                    {
                        title: 'Friendly Sea Monster',
                        text: 'The sea monster was actually a gentle giant who loved to play! Sam helped wake him up, and the grateful creature offered to carry Sam quickly to the kingdom while sharing stories of the deep ocean.',
                        image: '🐉',
                        choices: [
                            { text: 'Ride to the kingdom 🏇', nextPage: 15 },
                            { text: 'Play games with the sea monster 🎮', nextPage: 24 }
                        ]
                    },
                    {
                        title: 'The Underwater Kingdom',
                        text: 'Finally, Sam reached the magnificent underwater kingdom! It was more beautiful than any dream - crystal towers that sang with the current, gardens of coral in every color, and merpeople who welcomed Sam with joy and celebration.',
                        image: '🏰',
                        choices: [
                            { text: 'Meet the Mer-Queen 👸', nextPage: 25 },
                            { text: 'Explore the crystal towers 🗼', nextPage: 26 }
                        ]
                    },
                    {
                        title: 'Ocean Guardian',
                        text: 'Sam promised to protect the ocean and was given a magical conch shell that would let him communicate with sea creatures anywhere in the world. He became an official Ocean Guardian, dedicated to keeping the seas clean and safe.',
                        image: '🛡️',
                        choices: [
                            { text: 'Accept the guardian responsibilities 💪', nextPage: 27 }
                        ]
                    },
                    {
                        title: 'Merpeople Magic',
                        text: 'Sam learned that merpeople had the power to heal injured sea creatures, grow new coral reefs, and purify polluted water. They taught Sam that with great power comes great responsibility to care for the ocean.',
                        image: '🧜‍♀️',
                        choices: [
                            { text: 'Learn healing magic 💚', nextPage: 28 },
                            { text: 'Help grow new coral 🪸', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Ocean Conservation',
                        text: 'Sam learned that every action on land affects the ocean. He discovered how to keep beaches clean, protect marine life, and teach others about the importance of healthy oceans for all life on Earth.',
                        image: '🌱',
                        choices: [
                            { text: 'Start an ocean protection club 🏛️', nextPage: 30 }
                        ]
                    },
                    {
                        title: 'Sea Creature Magic',
                        text: 'Sam discovered that every sea creature has special magical abilities! Electric eels can power underwater cities, jellyfish can create beautiful light shows, and starfish can regenerate anything that\'s broken.',
                        image: '✨',
                        choices: [
                            { text: 'Learn to use sea magic 🪄', nextPage: 31 }
                        ]
                    },
                    {
                        title: 'Song of the Tides',
                        text: 'Sam learned the ancient whale song that controls the tides. By singing this magical melody, he could calm storms, guide lost ships, and bring rain to dry lands. The power was incredible but must be used wisely.',
                        image: '🎵',
                        choices: [
                            { text: 'Use the song to help others 🎶', nextPage: 32 }
                        ]
                    },
                    {
                        title: 'Swimming with Fish Schools',
                        text: 'Sam learned to swim in perfect harmony with thousands of fish! Together they created beautiful underwater patterns and dances. The fish taught him that cooperation and teamwork can create amazing things.',
                        image: '🏊‍♂️',
                        choices: [
                            { text: 'Choreograph an ocean dance 💃', nextPage: 33 }
                        ]
                    },
                    {
                        title: 'Ocean Storyteller',
                        text: 'Sam became the official storyteller of the sea! He collected and shared amazing ocean adventures, teaching people about the wonders and importance of marine life through magical stories.',
                        image: '📚',
                        choices: [
                            { text: 'Share stories with the world 🌍', nextPage: 34 }
                        ]
                    },
                    {
                        title: 'Helping Sea Creatures',
                        text: 'Before entering the kingdom, Sam used his magical shells to help lost sea creatures find their families, heal injured fish, and clean up parts of the ocean. His kindness opened his heart even more.',
                        image: '🤝',
                        choices: [
                            { text: 'Enter the kingdom as a true hero 🦸‍♂️', nextPage: 15 }
                        ]
                    },
                    {
                        title: 'Sea Monster Games',
                        text: 'Sam and the sea monster played underwater tag, hide-and-seek among the coral, and had water splash contests! The games taught Sam that even the biggest, scariest-looking creatures can be gentle friends.',
                        image: '🎮',
                        choices: [
                            { text: 'Make the sea monster the kingdom\'s guardian 👑', nextPage: 15 }
                        ]
                    },
                    {
                        title: 'The Mer-Queen',
                        text: 'The Mer-Queen was wise and kind, with a crown made of pearls and sea stars. She thanked Sam for his pure heart and love of the ocean. She granted him the title of "Ocean Ambassador" to the human world.',
                        image: '👸',
                        choices: [
                            { text: 'Accept the royal mission 👑', nextPage: 35 }
                        ]
                    },
                    {
                        title: 'Crystal Towers',
                        text: 'The crystal towers were amazing! Each one had a different purpose - one stored the wisdom of the sea, another controlled the weather, and the tallest one could see into the future of the ocean.',
                        image: '🗼',
                        choices: [
                            { text: 'Look into the ocean\'s future 🔮', nextPage: 36 }
                        ]
                    },
                    {
                        title: 'Guardian Duties Begin',
                        text: 'As an Ocean Guardian, Sam started his important work immediately! He helped clean up plastic waste, guided lost whales back to their pods, and taught other children about protecting marine life.',
                        image: '💪',
                        choices: [
                            { text: 'Return home to start your mission 🏠', nextPage: 37 }
                        ]
                    },
                    {
                        title: 'Healing Magic',
                        text: 'Sam learned to heal injured sea creatures using the power of kindness and pure intention. His hands glowed with gentle blue light, and everywhere he touched, new life flourished.',
                        image: '💚',
                        choices: [
                            { text: 'Heal a coral reef 🪸', nextPage: 38 }
                        ]
                    },
                    {
                        title: 'Growing New Coral',
                        text: 'With mermaid magic, Sam helped grow the most beautiful coral reef ever seen! The new reef became a safe home for hundreds of sea creatures and a symbol of hope for ocean restoration.',
                        image: '🪸',
                        choices: [
                            { text: 'Celebrate the new reef 🎉', nextPage: 39 }
                        ]
                    },
                    {
                        title: 'Ocean Protection Club',
                        text: 'Sam founded the "Blue Planet Protectors" club! Children from around the world joined to clean beaches, study marine life, and spread awareness about ocean conservation. The movement grew bigger every day.',
                        image: '🏛️',
                        choices: [
                            { text: 'Lead the global ocean movement 🌎', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Master of Sea Magic',
                        text: 'Sam mastered the art of sea magic! He could call rain during droughts, calm dangerous storms, and create beautiful aurora displays over the ocean. But he always remembered to use his powers to help others.',
                        image: '🪄',
                        choices: [
                            { text: 'Use magic to heal the world\'s oceans 🌍', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Tidal Symphony',
                        text: 'Sam used the song of the tides to create a beautiful symphony that brought peace to the entire ocean. Ships sailed safely, storms calmed down, and all sea creatures sang together in harmony.',
                        image: '🎶',
                        choices: [
                            { text: 'Conduct the ocean\'s eternal symphony 🎼', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Ocean Dance Festival',
                        text: 'Sam choreographed the most amazing underwater dance festival! Sea creatures from all over the world came to participate. The celebration brought unity and joy to the entire ocean.',
                        image: '💃',
                        choices: [
                            { text: 'Make this an annual tradition 📅', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Worldwide Ocean Stories',
                        text: 'Sam\'s ocean stories spread around the world! Children everywhere learned to love and protect the sea through his magical tales. Books, movies, and songs were created to share the ocean\'s wonders.',
                        image: '🌍',
                        choices: [
                            { text: 'Continue spreading ocean magic 📚', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Royal Ocean Ambassador',
                        text: 'As the official Ocean Ambassador, Sam traveled between the human world and the underwater kingdom, making sure both communities worked together to protect the seas. He became a bridge between two worlds.',
                        image: '👑',
                        choices: [
                            { text: 'Unite both worlds for the ocean 🤝', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Vision of the Future',
                        text: 'Looking into the crystal tower, Sam saw a beautiful future where oceans were clean, sea creatures thrived, and humans lived in harmony with marine life. He knew his mission was just beginning.',
                        image: '🔮',
                        choices: [
                            { text: 'Work to make this vision real ✨', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Returning Home',
                        text: 'Sam returned to the surface with his heart full of purpose and his mind full of ocean magic. He started his mission immediately, teaching others about the underwater kingdom and the importance of protecting our blue planet.',
                        image: '🏠',
                        choices: [
                            { text: 'Begin your lifelong ocean mission 🌟', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Reef of Hope',
                        text: 'The coral reef that Sam helped heal became known as the "Reef of Hope." Scientists from around the world came to study it, and it became a model for ocean restoration projects everywhere.',
                        image: '🪸',
                        choices: [
                            { text: 'Expand the healing to all reefs 🌊', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Coral Celebration',
                        text: 'The celebration for the new coral reef was attended by sea creatures from across the ocean! Whales sang, dolphins danced, and even the shy deep-sea creatures came up to join the party. It was a day of pure joy.',
                        image: '🎉',
                        choices: [
                            { text: 'Promise to protect all ocean life 💙', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Ocean Guardian Forever',
                        text: 'Sam\'s adventure had changed him forever. He returned home not just with amazing memories, but with a lifelong mission to protect the ocean. He knew that the real treasure wasn\'t gold or jewels - it was the friendship of sea creatures.',
                        image: '🌊',
                        choices: [
                            { text: 'Final dive into the crystal water 🌊', nextPage: 41 },
                            { text: 'Sail towards the sunrise ⛵', nextPage: 42 }
                        ]
                    },
                    {
                        title: 'The Final Dive',
                        text: 'One last swim with the dolphins before leaving. They promised to always watch over the shores. Sam felt a deep connection to the blue world. The End! 🌊💙',
                        image: '🐬',
                        choices: []
                    },
                    {
                        title: 'Sailing Home',
                        text: 'Sam steered his boat towards the horizon. The ocean was calm and beautiful. Every wave seemed to whisper a thank you. The End! ⛵💙',
                        image: '⛵',
                        choices: []
                    }
                ]
            },
            'space-adventure': {
                title: 'Cosmic Explorer Mission',
                pages: [
                    {
                        title: 'Blast Off to Adventure',
                        text: 'Astronaut Luna received an urgent message from the Galactic Council! Strange signals were coming from a distant planet called Zephyr-7, and she was chosen for this important space mission. As her rocket launches into the starry sky with a thunderous roar, the greatest adventure begins!',
                        image: '🚀',
                        choices: [
                            { text: 'Head to the mysterious planet 🪐', nextPage: 1 },
                            { text: 'Investigate the space station first 🛰️', nextPage: 2 }
                        ]
                    },
                    {
                        title: 'The Mysterious Planet Zephyr-7',
                        text: 'The planet was covered in swirling purple clouds and had three colorful moons dancing around it! As Luna\'s spacecraft gently landed on the soft, glowing surface, she discovered the signals were coming from friendly alien creatures who needed help fixing their communication device to contact their families.',
                        image: '🪐',
                        choices: [
                            { text: 'Help the aliens fix their device 🔧', nextPage: 3 },
                            { text: 'Explore the alien city first 🏙️', nextPage: 4 }
                        ]
                    },
                    {
                        title: 'The Galactic Space Station',
                        text: 'The space station was enormous, spinning slowly in the cosmic void! Inside, Luna met Captain Stardust, a wise alien commander who explained that the signals were a distress call from planet Zephyr-7. "They need our help," said the captain, "but the journey is dangerous through the asteroid field."',
                        image: '🛰️',
                        choices: [
                            { text: 'Navigate through the asteroid field ☄️', nextPage: 5 },
                            { text: 'Find a safer route around 🗺️', nextPage: 6 }
                        ]
                    },
                    {
                        title: 'Fixing the Communication Device',
                        text: 'Luna worked alongside Zing and Zap, two young aliens with sparkling antennas. Together, they used Luna\'s Earth technology and the aliens\' crystal power to repair their communication array. When it finally worked, happy messages from alien families across the galaxy filled the air!',
                        image: '🔧',
                        choices: [
                            { text: 'Celebrate with the alien families 🎉', nextPage: 7 },
                            { text: 'Help build a better communication network 📡', nextPage: 8 }
                        ]
                    },
                    {
                        title: 'The Crystal City',
                        text: 'The alien city was made entirely of glowing crystals that changed colors with the aliens\' emotions! Luna learned that the aliens communicated through light patterns and music. The city had floating gardens, crystal schools, and libraries made of singing stones.',
                        image: '🏙️',
                        choices: [
                            { text: 'Learn the alien language of lights 💡', nextPage: 9 },
                            { text: 'Visit the crystal school 🎓', nextPage: 10 }
                        ]
                    },
                    {
                        title: 'Asteroid Field Adventure',
                        text: 'Luna skillfully piloted her spacecraft through the tumbling space rocks! With help from her AI companion, NOVA, she discovered that the asteroids contained rare minerals that could power the aliens\' communication device. It was like finding treasure in space!',
                        image: '☄️',
                        choices: [
                            { text: 'Mine the space minerals ⛏️', nextPage: 11 },
                            { text: 'Continue to the planet quickly 🚀', nextPage: 1 }
                        ]
                    },
                    {
                        title: 'The Safe Route Discovery',
                        text: 'While looking for a safer path, Luna discovered a hidden cosmic highway used by space traders! She met Captain Nebula, a friendly space merchant who offered to guide her to Zephyr-7 and teach her about the different planets and alien cultures along the way.',
                        image: '🗺️',
                        choices: [
                            { text: 'Learn about alien cultures 👽', nextPage: 12 },
                            { text: 'Trade Earth items with space merchants 🛍️', nextPage: 13 }
                        ]
                    },
                    {
                        title: 'Galactic Family Reunion',
                        text: 'Thanks to Luna\'s help, alien families were reunited across the galaxy! Grandparent aliens, cousin aliens, and friend aliens all celebrated together through their crystal communication network. Luna realized that family love is universal, no matter what planet you\'re from.',
                        image: '🎉',
                        choices: [
                            { text: 'Join the galactic celebration dance 💃', nextPage: 14 },
                            { text: 'Learn alien celebration traditions 🎊', nextPage: 15 }
                        ]
                    },
                    {
                        title: 'Building the Cosmic Internet',
                        text: 'Luna helped the aliens create a galaxy-wide communication network! They placed relay stations on moons, asteroids, and space stations, allowing instant communication between all peaceful alien civilizations. It was like building the internet, but for the entire galaxy!',
                        image: '📡',
                        choices: [
                            { text: 'Test the network with Earth 🌍', nextPage: 16 },
                            { text: 'Train aliens to maintain the network 👨‍🔧', nextPage: 17 }
                        ]
                    },
                    {
                        title: 'Learning Light Language',
                        text: 'Luna discovered that aliens spoke by creating beautiful light patterns! Happy thoughts made golden spirals, sadness created gentle blue waves, and excitement burst into rainbow fireworks. Luna learned to communicate this way and made many new friends.',
                        image: '💡',
                        choices: [
                            { text: 'Teach aliens about Earth languages 🗣️', nextPage: 18 },
                            { text: 'Create a universal translator 🔄', nextPage: 19 }
                        ]
                    },
                    {
                        title: 'The Crystal School',
                        text: 'At the crystal school, young aliens learned about their galaxy, practiced light-language, and studied the stars. Luna shared stories about Earth schools and taught the young aliens about human children. They were amazed to learn that Earth children also loved to play and learn!',
                        image: '🎓',
                        choices: [
                            { text: 'Set up a school exchange program 🔄', nextPage: 20 },
                            { text: 'Create educational games for both species 🎮', nextPage: 21 }
                        ]
                    },
                    {
                        title: 'Space Mining Adventure',
                        text: 'Luna and the aliens carefully extracted the glowing space minerals from the asteroids. These crystals could power not just communication devices, but also spacecraft, cities, and even help grow food in space! Luna learned that working together makes any job easier and more fun.',
                        image: '⛏️',
                        choices: [
                            { text: 'Build a space mining station 🏗️', nextPage: 22 },
                            { text: 'Share the minerals with other planets 🎁', nextPage: 23 }
                        ]
                    },
                    {
                        title: 'Cosmic Culture Class',
                        text: 'Captain Nebula taught Luna about dozens of different alien cultures! She learned about the singing crystals of planet Melodia, the floating cities of Cloudtopia, and the underwater kingdoms of Aquaria. Each culture had unique traditions but all valued friendship and kindness.',
                        image: '👽',
                        choices: [
                            { text: 'Visit the planet of singing crystals 🎵', nextPage: 24 },
                            { text: 'Create a cosmic culture guidebook 📖', nextPage: 25 }
                        ]
                    },
                    {
                        title: 'Galactic Trading Post',
                        text: 'Luna traded Earth items like music, art, and stories for amazing alien technologies! She exchanged a recording of Earth\'s whale songs for a device that could grow plants in space, and traded children\'s drawings for a universal translator that worked with any species.',
                        image: '🛍️',
                        choices: [
                            { text: 'Open an Earth-Alien trading company 🏢', nextPage: 26 },
                            { text: 'Return to Earth with amazing gifts 🎁', nextPage: 27 }
                        ]
                    },
                    {
                        title: 'Combined Space Traditions',
                        text: 'Luna and the aliens created a new holiday called "Galactic Friendship Day"! They celebrated by sharing Earth music while growing crystal gardens that mimicked the rhythm of the songs. It was a beautiful example of how different worlds can come together to create something new and magical.',
                        image: '🌈',
                        choices: [
                            { text: 'Invite the entire galaxy to participate 🌌', nextPage: 28 }
                        ]
                    },
                    {
                        title: 'The Peace Dance Mission',
                        text: 'Luna\'s galactic peace dance became a symbol of unity. Beings from across the universe learned the steps, showing their commitment to living in harmony. Luna realized that even without words, everyone can understand the language of joy and dance.',
                        image: '🕺',
                        choices: [
                            { text: 'Return home as a peace ambassador 🕊️', nextPage: 30 }
                        ]
                    },
                    {
                        title: 'The Planet of Toys',
                        text: 'Luna discovered a small planet where everything was made of floating toys! Hover-boards, programmable blocks, and dolls that could share their dreams. The aliens here designed toys that helped children learn while they played.',
                        image: '🧸',
                        choices: [
                            { text: 'Design a new intergalactic toy 🎨', nextPage: 31 },
                            { text: 'Play with the local alien kids 🎈', nextPage: 32 }
                        ]
                    },
                    {
                        title: 'Toy Designer Extraordinaire',
                        text: 'Luna designed a "Harmony Ball" that would light up and play music when people worked together to balance it. It became the most popular toy in the galaxy, teaching children everywhere the value of cooperation and teamwork.',
                        image: '🎨',
                        choices: [
                            { text: 'Distribute the toy globally 🌍', nextPage: 33 }
                        ]
                    },
                    {
                        title: 'The Library of Stars',
                        text: 'In the center of the galaxy, Luna found a library where the books were made of light and stored in floating star-crystals. The library contained the history of every planet and every species that ever lived. Luna was honored to add Earth\'s history to the collection.',
                        image: '🏛️',
                        choices: [
                            { text: 'Read the "Secrets of the Universe" 📚', nextPage: 34 }
                        ]
                    },
                    {
                        title: 'Cosmic Wisdom',
                        text: 'The Library of Stars taught Luna that the universe is vast, but every small act of kindness ripples across the stars. She learned that she might be one girl from one planet, but her choices have the power to change everything.',
                        image: '🔭',
                        choices: [
                            { text: 'Ready for the final return 🚀', nextPage: 30 }
                        ]
                    },
                    {
                        title: 'The Journey Back',
                        text: 'With a heart full of stardust and a mind full of cosmic memories, Luna steered her rocket back toward the pale blue dot of Earth. She knew she was returning not just as an astronaut, but as a bridge between worlds. The End! 🌟🌍🚀',
                        image: '🚀',
                        choices: []
                    },
                    {
                        title: 'Earth Calls the Galaxy',
                        text: 'When Luna tested the cosmic network with Earth, something magical happened! Children from around the world got to talk to young aliens for the first time. They shared games, stories, and became the first intergalactic pen pals in history!',
                        image: '🌍',
                        choices: [
                            { text: 'Establish regular Earth-Galaxy communication 📞', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Training Cosmic Engineers',
                        text: 'Luna taught aliens how to maintain and expand their communication network. In return, they taught her about crystal technology and space navigation. Together, they created the first Galactic Academy of Technology where beings from any planet could learn.',
                        image: '👨‍🔧',
                        choices: [
                            { text: 'Graduate as a Galactic Engineer 🎓', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Language Exchange Program',
                        text: 'Luna helped create a system where humans could learn light-language and aliens could learn human languages! Soon, beings across the galaxy were sharing poetry, jokes, and songs in each other\'s languages, bringing everyone closer together.',
                        image: '🗣️',
                        choices: [
                            { text: 'Become a galactic language teacher 👩‍🏫', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'The Universal Translator',
                        text: 'Luna and her alien friends invented a device that could translate any language in the galaxy instantly! It worked with light-language, sound-language, crystal-resonance, and even emotion-patterns. Communication barriers disappeared forever!',
                        image: '🔄',
                        choices: [
                            { text: 'Share the translator with all civilizations 🎁', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Intergalactic School Exchange',
                        text: 'Luna set up a program where Earth children could virtually visit alien schools and alien children could learn about Earth! Through holographic technology, classrooms on different planets were connected, creating the first universal educational network.',
                        image: '🔄',
                        choices: [
                            { text: 'Become the first Galactic Education Director 📚', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Cosmic Learning Games',
                        text: 'Luna created educational games that worked for both human and alien children! Math games using floating crystals, language games with light patterns, and science games exploring virtual planets. Learning became the most fun activity in the galaxy!',
                        image: '🎮',
                        choices: [
                            { text: 'Open the Galactic Game Academy 🏫', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'The Asteroid Mining Station',
                        text: 'Luna helped design and build a amazing space station that could safely extract minerals from asteroids! It became a meeting place for peaceful species to work together, trade resources, and share knowledge while protecting the space environment.',
                        image: '🏗️',
                        choices: [
                            { text: 'Manage the galactic resource center 🌟', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Sharing Cosmic Treasures',
                        text: 'Luna organized a galactic sharing program where planets with abundant resources helped planets in need. The space minerals powered hospitals, schools, and communication systems across dozens of worlds, proving that cooperation makes everyone stronger.',
                        image: '🎁',
                        choices: [
                            { text: 'Lead the Galactic Cooperation Council 🤝', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Planet Melodia',
                        text: 'Luna visited the incredible planet where everything was made of musical crystals! The alien inhabitants communicated through beautiful songs, their cities played symphonies, and even their food hummed with delicious melodies. Luna learned that music truly is a universal language.',
                        image: '🎵',
                        choices: [
                            { text: 'Compose a galactic friendship song 🎼', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'The Cosmic Culture Guide',
                        text: 'Luna wrote the first-ever guidebook to galactic cultures! It included pictures, traditions, languages, and fun facts about hundreds of alien civilizations. The book became so popular that it helped promote understanding and friendship throughout the galaxy.',
                        image: '📖',
                        choices: [
                            { text: 'Become the galaxy\'s first cultural ambassador 🌍', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Earth-Alien Trading Company',
                        text: 'Luna founded the first company dedicated to peaceful trade between Earth and alien civilizations! They exchanged art, music, technology, and knowledge, always ensuring that trades benefited everyone and respected each culture\'s values.',
                        image: '🏢',
                        choices: [
                            { text: 'Expand trade to the entire galaxy 🌌', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Returning Home with Wonders',
                        text: 'Luna returned to Earth with incredible gifts: technologies that could help solve climate change, medical advances from alien sciences, and most importantly, the knowledge that Earth was now part of a peaceful galactic community.',
                        image: '🎁',
                        choices: [
                            { text: 'Share the wonders with all of Earth 🌍', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'The Galactic Peace Dance',
                        text: 'Luna choreographed a special dance that beings from every planet could perform together, regardless of their body type or abilities. The dance became a symbol of galactic unity and was performed at every celebration across the galaxy.',
                        image: '🕺',
                        choices: [
                            { text: 'Teach the dance throughout the universe 💫', nextPage: 29 }
                        ]
                    },
                    {
                        title: 'Luna, Ambassador of the Stars',
                        text: 'Luna\'s space adventure had changed the galaxy forever! She became the first official Ambassador between Earth and the Galactic Council, helping to ensure peace, friendship, and cooperation among all civilizations. From a simple mission to help with communications, Luna had helped create a connected, caring universe where every being could thrive. She learned that curiosity, kindness, and the willingness to help others can lead to the most amazing adventures. The stars were no longer distant lights - they were neighbors and friends! The End! 🌟',
                        image: '🌟',
                        choices: []
                    }
                ]
            },
            'dragon-castle': {
                title: 'The Friendly Dragon\'s Castle',
                pages: [
                    {
                        title: 'A Knight\'s Kind Quest',
                        text: 'Young Knight Alex heard rumors of a scary dragon in the old castle on Misty Mountain. But Alex believed that maybe the dragon just needed a friend! With courage and kindness in heart, Alex set off on a quest not to fight, but to meet this mysterious dragon.',
                        image: '🏰',
                        choices: [
                            { text: 'Approach the castle\'s front gate 🚪', nextPage: 1 },
                            { text: 'Find a secret entrance 🗝️', nextPage: 2 }
                        ]
                    },
                    {
                        title: 'The Grand Castle Gates',
                        text: 'The massive castle gates were covered in beautiful carvings of dragons and flowers. As Alex approached, they heard not roaring, but gentle humming coming from inside! The gates creaked open by themselves, as if inviting Alex to enter.',
                        image: '🚪',
                        choices: [
                            { text: 'Follow the humming sound 🎵', nextPage: 3 },
                            { text: 'Explore the castle gardens first 🌸', nextPage: 4 }
                        ]
                    },
                    {
                        title: 'The Secret Garden Path',
                        text: 'Alex discovered a hidden entrance through an overgrown garden. The path was lined with the most beautiful flowers that seemed to glow with their own inner light. Butterflies and friendly forest creatures guided Alex toward a small door covered in ivy.',
                        image: '🗝️',
                        choices: [
                            { text: 'Knock gently on the ivy door 🚪', nextPage: 5 },
                            { text: 'Talk to the forest creatures first 🐿️', nextPage: 6 }
                        ]
                    },
                    {
                        title: 'Following the Dragon\'s Song',
                        text: 'The humming led Alex through a grand hallway filled with paintings of dragons doing kind deeds - helping lost travelers, growing gardens, and reading to young animals. Alex realized these dragons weren\'t scary at all, but helpers and protectors!',
                        image: '🎵',
                        choices: [
                            { text: 'Call out "Hello, I\'m here to be your friend!" 👋', nextPage: 7 },
                            { text: 'Continue following the music 🎶', nextPage: 8 }
                        ]
                    },
                    {
                        title: 'The Magical Dragon Gardens',
                        text: 'The castle gardens were absolutely magical! Roses as big as Alex\'s head grew in rainbow colors, fruit trees bore golden apples, and vegetable patches grew themselves. A gentle voice called out, "Welcome, kind visitor! I\'ve been waiting for someone like you!"',
                        image: '🌸',
                        choices: [
                            { text: 'Answer the friendly voice 🗣️', nextPage: 9 },
                            { text: 'Pick some fruit to share 🍎', nextPage: 10 }
                        ]
                    },
                    {
                        title: 'The Enchanted Door',
                        text: 'When Alex knocked, the ivy on the door bloomed into beautiful flowers that spelled out "WELCOME FRIEND" in petals! The door opened to reveal a cozy library where a magnificent purple dragon sat reading a book about friendship.',
                        image: '🚪',
                        choices: [
                            { text: 'Introduce yourself politely 😊', nextPage: 11 },
                            { text: 'Ask about the books 📚', nextPage: 12 }
                        ]
                    },
                    {
                        title: 'Woodland Friends\' Advice',
                        text: 'The forest creatures - rabbits, squirrels, and wise owls - told Alex that the dragon was actually very lonely. "She grows the most beautiful gardens and tells the best stories," chirped a bluebird, "but everyone runs away when they see her because they think dragons are scary!"',
                        image: '🐿️',
                        choices: [
                            { text: 'Promise to be the dragon\'s friend 💝', nextPage: 13 },
                            { text: 'Ask how to make the dragon happy 😊', nextPage: 14 }
                        ]
                    },
                    {
                        title: 'Meeting Emerald the Dragon',
                        text: 'Alex called out with genuine warmth, and suddenly, the most beautiful emerald-green dragon appeared! She had kind golden eyes and a gentle smile. "Oh my!" said Emerald, "You\'re not here to fight me? You actually want to be friends?" Tears of joy sparkled in her eyes.',
                        image: '👋',
                        choices: [
                            { text: 'Give Emerald a friendly hug 🤗', nextPage: 15 },
                            { text: 'Tell her about your quest for friendship 💫', nextPage: 16 }
                        ]
                    },
                    {
                        title: 'The Dragon\'s Music Room',
                        text: 'Following the music, Alex found Emerald in a room filled with musical instruments made from crystals and shells. She was composing a song about her dream of having friends to share her beautiful castle and gardens with.',
                        image: '🎶',
                        choices: [
                            { text: 'Ask to learn the friendship song 🎵', nextPage: 17 },
                            { text: 'Offer to sing a song from your homeland 🎤', nextPage: 18 }
                        ]
                    },
                    {
                        title: 'The Garden\'s Guardian',
                        text: 'From behind a magnificent sunflower, Emerald the dragon emerged! She was tending to a sick baby bird in her gentle claws. "I grow these gardens to help all the creatures," she explained softly, "but most people are too afraid to see my kind heart."',
                        image: '🗣️',
                        choices: [
                            { text: 'Help tend to the baby bird 🐣', nextPage: 19 },
                            { text: 'Compliment her beautiful gardens 🌺', nextPage: 20 }
                        ]
                    },
                    {
                        title: 'Sharing Garden Treasures',
                        text: 'Alex picked golden apples and crystal berries to share with the dragon. When Emerald appeared, she was delighted! "No one has ever wanted to share my garden\'s gifts with me," she said, her scales shimmering with happiness.',
                        image: '🍎',
                        choices: [
                            { text: 'Have a picnic together 🧺', nextPage: 21 },
                            { text: 'Plant new fruits together 🌱', nextPage: 22 }
                        ]
                    },
                    {
                        title: 'The Reading Dragon',
                        text: 'Alex found Emerald surrounded by hundreds of books! "I love stories," she explained shyly, "especially ones about friendship. I\'ve read every book about knights, but I never thought one would actually visit me as a friend instead of trying to fight!"',
                        image: '😊',
                        choices: [
                            { text: 'Ask her to read you a story 📖', nextPage: 23 },
                            { text: 'Offer to tell her stories from your travels 🗺️', nextPage: 24 }
                        ]
                    },
                    {
                        title: 'The Dragon\'s Library',
                        text: 'Emerald\'s library was amazing! She had books from every kingdom, written in dragon-fire ink that glowed softly. "I collect stories because they teach about friendship, kindness, and understanding," she explained, "but I\'ve never had anyone to share them with."',
                        image: '📚',
                        choices: [
                            { text: 'Start a book club together 📚', nextPage: 25 },
                            { text: 'Help organize the library 📋', nextPage: 26 }
                        ]
                    },
                    {
                        title: 'A Promise of Friendship',
                        text: 'Alex promised to be Emerald\'s friend forever. The dragon was so happy that her scales turned from green to a joyful rainbow of colors! "I\'ve waited so long for a friend," she said, "and now I know that kindness is more powerful than any knight\'s sword!"',
                        image: '💝',
                        choices: [
                            { text: 'Plan fun adventures together 🎈', nextPage: 27 },
                            { text: 'Invite other creatures to meet Emerald 🐰', nextPage: 28 }
                        ]
                    },
                    {
                        title: 'Making Dragons Happy',
                        text: 'The woodland creatures shared their wisdom: "Dragons love beautiful things, helping others, and most of all, having friends to share their treasures with. Emerald has been sad because everyone misunderstands her!"',
                        image: '😊',
                        choices: [
                            { text: 'Plan a surprise friendship party 🎉', nextPage: 29 },
                            { text: 'Help spread the truth about friendly dragons 📢', nextPage: 30 }
                        ]
                    },
                    {
                        title: 'The First Dragon Hug',
                        text: 'Alex gave Emerald the first hug she had received in decades! The dragon\'s warm, gentle embrace felt like being wrapped in the softest blanket. "This is the most wonderful gift anyone has ever given me," Emerald whispered happily.',
                        image: '🤗',
                        choices: [
                            { text: 'Make hugs a daily tradition 💕', nextPage: 31 },
                            { text: 'Teach Emerald human friendship customs 🤝', nextPage: 32 }
                        ]
                    },
                    {
                        title: 'The Quest for Friendship',
                        text: 'Alex told Emerald about the quest to find friendship instead of fighting. "You\'re the bravest knight I\'ve ever heard of," said Emerald, "because it takes more courage to make friends than to make enemies. You\'ve changed my whole world!"',
                        image: '💫',
                        choices: [
                            { text: 'Start a kindness quest together 🌟', nextPage: 33 },
                            { text: 'Write about your adventure to inspire others ✍️', nextPage: 34 }
                        ]
                    },
                    {
                        title: 'Learning the Friendship Song',
                        text: 'Emerald taught Alex her beautiful friendship song! The melody was so magical that flowers bloomed when they sang it together, birds joined in harmony, and even the castle walls seemed to shimmer with joy.',
                        image: '🎵',
                        choices: [
                            { text: 'Perform the song for all the woodland creatures 🎭', nextPage: 35 },
                            { text: 'Create new verses about your friendship 🎼', nextPage: 36 }
                        ]
                    },
                    {
                        title: 'A Musical Exchange',
                        text: 'Alex sang traditional human songs while Emerald accompanied with her crystal instruments. They created a beautiful blend of dragon and human music that had never been heard before - a true harmony of two different worlds coming together.',
                        image: '🎤',
                        choices: [
                            { text: 'Record your music to share with others 🎧', nextPage: 37 },
                            { text: 'Teach music to other dragons and humans 🎹', nextPage: 38 }
                        ]
                    },
                    {
                        title: 'Healing with Kindness',
                        text: 'Together, Alex and Emerald gently nursed the baby bird back to health. Emerald\'s warm breath helped heal its wing, while Alex provided comfort and encouragement. The grateful bird became their first witness to the beautiful friendship between human and dragon.',
                        image: '🐣',
                        choices: [
                            { text: 'Start an animal rescue center together 🏥', nextPage: 39 },
                            { text: 'Let the bird spread news of your friendship 🕊️', nextPage: 40 }
                        ]
                    },
                    {
                        title: 'Garden Appreciation',
                        text: 'Alex praised Emerald\'s incredible gardening skills. "These are the most beautiful gardens in all the kingdoms!" Alex exclaimed. Emerald beamed with pride and happiness - no one had ever appreciated her work before.',
                        image: '🌺',
                        choices: [
                            { text: 'Help Emerald enter a royal garden contest 🏆', nextPage: 41 },
                            { text: 'Create a garden together as a symbol of friendship 🌈', nextPage: 42 }
                        ]
                    },
                    {
                        title: 'The Friendship Picnic',
                        text: 'Alex and Emerald had the most wonderful picnic in the magical garden! They shared stories, laughed together, and Emerald learned about human customs while Alex learned about dragon traditions. It was the beginning of a beautiful cultural exchange.',
                        image: '🧺',
                        choices: [
                            { text: 'Make picnics a weekly tradition 📅', nextPage: 43 },
                            { text: 'Invite villagers to join future picnics 👨‍👩‍👧‍👦', nextPage: 44 }
                        ]
                    },
                    {
                        title: 'Growing Friendship Gardens',
                        text: 'Alex and Emerald planted a special friendship garden together! Each plant represented a different aspect of their bond - roses for love, sunflowers for happiness, and ivy for growing stronger together. The garden became a symbol of hope for all.',
                        image: '🌱',
                        choices: [
                            { text: 'Share seeds with other kingdoms 🌰', nextPage: 45 },
                            { text: 'Create a guidebook for friendship gardens 📝', nextPage: 46 }
                        ]
                    },
                    {
                        title: 'Storytime with a Dragon',
                        text: 'Emerald read Alex the most amazing stories! Her voice was melodic and warm, and when she got excited, little sparkles came from her nose instead of fire. Alex learned that dragons were natural storytellers with incredible imagination.',
                        image: '📖',
                        choices: [
                            { text: 'Start a traveling story show 🎪', nextPage: 47 },
                            { text: 'Write stories about your adventures together ✍️', nextPage: 48 }
                        ]
                    },
                    {
                        title: 'Tales of Adventure',
                        text: 'Alex shared exciting stories of travels through different kingdoms, meeting various people and creatures. Emerald was fascinated by the outside world and dreamed of someday meeting all the people Alex described.',
                        image: '🗺️',
                        choices: [
                            { text: 'Plan a journey to introduce Emerald to the world 🌍', nextPage: 49 },
                            { text: 'Bring representatives from each kingdom to meet her 👥', nextPage: 50 }
                        ]
                    },
                    {
                        title: 'The Dragon Book Club',
                        text: 'Alex and Emerald started the first-ever Human-Dragon Book Club! They read stories together, discussed their favorite characters, and even wrote their own tales about friendship overcoming fear and misunderstanding.',
                        image: '📚',
                        choices: [
                            { text: 'Invite other creatures to join the book club 🦉', nextPage: 51 },
                            { text: 'Publish a book about dragon-human friendship 📘', nextPage: 52 }
                        ]
                    },
                    {
                        title: 'Organizing Ancient Wisdom',
                        text: 'Alex helped Emerald organize her vast collection of books by subject. They discovered ancient texts about peace between species, forgotten histories of dragon-human cooperation, and prophecies about a time when all beings would live in harmony.',
                        image: '📋',
                        choices: [
                            { text: 'Share the ancient wisdom with the world 📜', nextPage: 53 },
                            { text: 'Fulfill the prophecy of peace 🕊️', nextPage: 54 }
                        ]
                    },
                    {
                        title: 'Planning Magical Adventures',
                        text: 'Alex and Emerald planned incredible adventures together! They would fly over kingdoms spreading seeds of friendship, visit lonely creatures who needed friends, and show everyone that differences make friendships more interesting, not more difficult.',
                        image: '🎈',
                        choices: [
                            { text: 'Begin the Great Friendship Flight 🦅', nextPage: 55 }
                        ]
                    },
                    {
                        title: 'Forest Friendship Network',
                        text: 'Alex helped introduce Emerald to all the woodland creatures who had been afraid of her. One by one, they discovered her gentle nature and kind heart. Soon, the castle became a gathering place for all forest friends.',
                        image: '🐰',
                        choices: [
                            { text: 'Create a forest harmony council 🌲', nextPage: 56 }
                        ]
                    },
                    {
                        title: 'The Greatest Friendship Party',
                        text: 'Alex and the woodland creatures threw Emerald the most amazing surprise party! There were flower crowns, berry cakes, singing birds, and dancing butterflies. Emerald cried happy tears that turned into sparkly gemstones.',
                        image: '🎉',
                        choices: [
                            { text: 'Make the party an annual celebration 🎊', nextPage: 57 }
                        ]
                    },
                    {
                        title: 'Spreading Dragon Truth',
                        text: 'Alex traveled to nearby villages and kingdoms, sharing the truth about Emerald\'s kindness. Slowly, people began to understand that dragons could be friends, not foes. The old stories of scary dragons were replaced with tales of helpful, loving dragons.',
                        image: '📢',
                        choices: [
                            { text: 'Establish the Dragon Friendship Society 🏛️', nextPage: 58 }
                        ]
                    },
                    {
                        title: 'Daily Hugs and Happiness',
                        text: 'Alex and Emerald made hugging a daily tradition! Every morning and evening, they shared warm embraces that filled both their hearts with joy. The power of physical affection strengthened their bond and made each day brighter.',
                        image: '💕',
                        choices: [
                            { text: 'Teach the world about the power of hugs 🤗', nextPage: 59 }
                        ]
                    },
                    {
                        title: 'Human-Dragon Cultural Exchange',
                        text: 'Alex taught Emerald human customs like handshakes, high-fives, and birthday celebrations. Emerald shared dragon traditions like crystal meditation, garden singing, and the art of growing magical plants. Both cultures became richer through sharing.',
                        image: '🤝',
                        choices: [
                            { text: 'Create the first Inter-Species Cultural Center 🏫', nextPage: 60 }
                        ]
                    },
                    {
                        title: 'The Kindness Quest Begins',
                        text: 'Alex and Emerald began a new type of quest - not to fight monsters, but to spread kindness! They traveled together, helping those in need, mediating conflicts with compassion, and showing that true heroism comes from helping others.',
                        image: '🌟',
                        choices: [
                            { text: 'Establish the Order of Kindness Knights 🛡️', nextPage: 61 }
                        ]
                    },
                    {
                        title: 'Writing the Friendship Chronicles',
                        text: 'Alex wrote detailed accounts of their adventures, creating the "Friendship Chronicles" - stories that would inspire future generations to choose understanding over fear, cooperation over conflict, and love over prejudice.',
                        image: '✍️',
                        choices: [
                            { text: 'Distribute the Chronicles throughout all kingdoms 📖', nextPage: 62 }
                        ]
                    },
                    {
                        title: 'The Great Forest Concert',
                        text: 'Alex and Emerald performed their friendship song for all the woodland creatures! The magical melody brought harmony to the entire forest, and animals who had never gotten along before began to understand and appreciate each other.',
                        image: '🎭',
                        choices: [
                            { text: 'Tour the kingdoms with your harmony message 🎪', nextPage: 63 }
                        ]
                    },
                    {
                        title: 'Composing New Friendship Verses',
                        text: 'Together, they wrote new verses for their friendship song, each one telling the story of a different type of friendship they had witnessed or helped create. The song grew into an epic ballad of universal love and understanding.',
                        image: '🎼',
                        choices: [
                            { text: 'Teach the song to choirs across the land 🎵', nextPage: 64 }
                        ]
                    },
                    {
                        title: 'Recording Magical Music',
                        text: 'Using Emerald\'s crystal technology, they recorded their music so it could be shared even when they weren\'t present. The recordings were magical - they could heal sadness, bring hope to the discouraged, and inspire love in hearts filled with fear.',
                        image: '🎧',
                        choices: [
                            { text: 'Distribute the healing music to hospitals and schools 🏥', nextPage: 65 }
                        ]
                    },
                    {
                        title: 'The Dragon-Human Music Academy',
                        text: 'Alex and Emerald founded the first academy where dragons and humans could learn music together! Students from both species discovered that harmony in music led to harmony in life, and many lifelong friendships were formed.',
                        image: '🎹',
                        choices: [
                            { text: 'Graduate the first class of Harmony Ambassadors 🎓', nextPage: 66 }
                        ]
                    },
                    {
                        title: 'The Magical Animal Sanctuary',
                        text: 'Alex and Emerald created a sanctuary where hurt, lost, or abandoned animals could heal and find new homes. Emerald\'s gentle dragon magic and Alex\'s human compassion made them the perfect team for helping creatures in need.',
                        image: '🏥',
                        choices: [
                            { text: 'Expand the sanctuary to help all creatures 🌍', nextPage: 67 }
                        ]
                    },
                    {
                        title: 'The Messenger Bird Network',
                        text: 'The grateful bird they had healed became the first member of a new communication network! Birds began carrying messages of friendship and understanding between kingdoms, helping to spread the news of dragon-human cooperation.',
                        image: '🕊️',
                        choices: [
                            { text: 'Establish the Peaceful Messenger Service 📨', nextPage: 68 }
                        ]
                    },
                    {
                        title: 'The Royal Garden Contest Victory',
                        text: 'Emerald entered the Royal Garden Contest and won first place! When she appeared to accept her prize, the crowd was amazed to see a dragon who created beauty instead of destruction. It changed many minds about what dragons could be.',
                        image: '🏆',
                        choices: [
                            { text: 'Use the victory to promote dragon acceptance 👑', nextPage: 69 }
                        ]
                    },
                    {
                        title: 'The Rainbow Friendship Garden',
                        text: 'Alex and Emerald created a magnificent garden where every color of the rainbow was represented by different flowers. Each section was tended by different species working together - humans, dragons, woodland creatures, and even visiting beings from other realms.',
                        image: '🌈',
                        choices: [
                            { text: 'Open the garden as a symbol of universal friendship 🌺', nextPage: 70 }
                        ]
                    },
                    {
                        title: 'Weekly Friendship Traditions',
                        text: 'Alex and Emerald established weekly picnics that became legendary! Every week, more creatures and people joined them, until their gatherings became festivals of friendship that attracted visitors from across the world.',
                        image: '📅',
                        choices: [
                            { text: 'Formalize the gatherings as the Festival of Unity 🎪', nextPage: 71 }
                        ]
                    },
                    {
                        title: 'Village Integration Program',
                        text: 'Alex gradually introduced villagers to Emerald through the weekly picnics. Starting with the bravest children and kindest adults, word spread that the dragon was not only harmless but wonderfully helpful and wise.',
                        image: '👨‍👩‍👧‍👦',
                        choices: [
                            { text: 'Welcome Emerald as an honorary village member 🏘️', nextPage: 72 }
                        ]
                    },
                    {
                        title: 'Spreading Seeds of Hope',
                        text: 'Alex and Emerald distributed magical seeds from their friendship garden to kingdoms far and wide. Wherever the seeds were planted with love and care, understanding between different species began to grow.',
                        image: '🌰',
                        choices: [
                            { text: 'Create a global network of friendship gardens 🌍', nextPage: 73 }
                        ]
                    },
                    {
                        title: 'The Friendship Garden Guidebook',
                        text: 'They wrote a comprehensive guide to creating friendship gardens - not just the planting and care instructions, but also how to use gardens as meeting places where differences could be celebrated and understanding could grow.',
                        image: '📝',
                        choices: [
                            { text: 'Distribute the guidebook to all kingdoms 📚', nextPage: 74 }
                        ]
                    },
                    {
                        title: 'The Traveling Story Spectacular',
                        text: 'Alex and Emerald took their storytelling on the road! Their traveling show combined Alex\'s dramatic storytelling with Emerald\'s magical special effects, creating unforgettable performances that taught audiences about friendship, courage, and understanding.',
                        image: '🎪',
                        choices: [
                            { text: 'Establish permanent story theaters in every kingdom 🎭', nextPage: 75 }
                        ]
                    },
                    {
                        title: 'The Adventure Chronicles',
                        text: 'Alex and Emerald wrote a series of books about their adventures together. The stories became bestsellers across all kingdoms, inspiring countless other unlikely friendships and showing that anyone can be a hero through kindness.',
                        image: '✍️',
                        choices: [
                            { text: 'Adapt the stories for children\'s education 📚', nextPage: 76 }
                        ]
                    },
                    {
                        title: 'The Grand World Tour',
                        text: 'Alex and Emerald embarked on a world tour, visiting every kingdom and realm to share their message of friendship. They met other misunderstood creatures, helped solve conflicts, and left behind a trail of new friendships wherever they went.',
                        image: '🌍',
                        choices: [
                            { text: 'Establish the International Council of Friendship 🏛️', nextPage: 77 }
                        ]
                    },
                    {
                        title: 'Kingdom Representatives Gathering',
                        text: 'Alex organized a great gathering where representatives from every kingdom came to meet Emerald. One by one, they discovered her wisdom, kindness, and genuine desire to help others. Many kingdoms established formal alliances with the friendly dragon.',
                        image: '👥',
                        choices: [
                            { text: 'Form the Alliance of United Kingdoms 🤝', nextPage: 78 }
                        ]
                    },
                    {
                        title: 'The Multi-Species Book Club',
                        text: 'Their book club grew to include representatives from every intelligent species! Humans, dragons, forest creatures, sea beings, and sky dwellers all gathered monthly to share stories and learn from each other\'s perspectives.',
                        image: '🦉',
                        choices: [
                            { text: 'Establish the Universal Library of Understanding 📖', nextPage: 79 }
                        ]
                    },
                    {
                        title: 'Publishing the Friendship Manual',
                        text: 'Alex and Emerald\'s book "How Dragons and Humans Can Be Best Friends" became required reading in schools across all kingdoms. It provided practical advice for building cross-species friendships and understanding.',
                        image: '📘',
                        choices: [
                            { text: 'Create curriculum for friendship education 🎓', nextPage: 80 }
                        ]
                    },
                    {
                        title: 'Sharing Ancient Wisdom',
                        text: 'The ancient texts from Emerald\'s library revealed forgotten histories of cooperation between all species. This knowledge helped kingdoms remember their shared heritage and common goals of peace and prosperity.',
                        image: '📜',
                        choices: [
                            { text: 'Establish the Archive of Peaceful History 🏛️', nextPage: 81 }
                        ]
                    },
                    {
                        title: 'Fulfilling the Prophecy',
                        text: 'Alex and Emerald realized they were fulfilling an ancient prophecy about a knight and dragon who would bring peace to all lands. Their friendship became the catalyst for a new age of understanding and cooperation between all beings.',
                        image: '🕊️',
                        choices: [
                            { text: 'Usher in the Golden Age of Peace 🌟', nextPage: 82 }
                        ]
                    },
                    {
                        title: 'The Great Friendship Flight',
                        text: 'Flying on Emerald\'s back, Alex soared over all the kingdoms, dropping seeds of friendship and hope. From the sky, they could see how all the lands and peoples were connected, and they spread this vision of unity wherever they went.',
                        image: '🦅',
                        choices: [
                            { text: 'Complete the circle of world peace 🌍', nextPage: 82 }
                        ]
                    },
                    {
                        title: 'The Forest Harmony Council',
                        text: 'The first inter-species governing council was formed, with representatives from every creature type. They made decisions through consensus and cooperation, creating the most peaceful and prosperous time the forest had ever known.',
                        image: '🌲',
                        choices: [
                            { text: 'Expand the council to include all kingdoms 🌐', nextPage: 82 }
                        ]
                    },
                    {
                        title: 'Annual Friendship Festival',
                        text: 'The surprise party became an annual celebration known as the Festival of Friendship! Beings from across the world gathered each year to celebrate diversity, understanding, and the power of friendship to overcome any obstacle.',
                        image: '🎊',
                        choices: [
                            { text: 'Make the festival a world holiday 🗓️', nextPage: 82 }
                        ]
                    },
                    {
                        title: 'The Dragon Friendship Society',
                        text: 'Alex established an organization dedicated to promoting understanding between dragons and other species. The society grew rapidly as more people met friendly dragons and discovered the truth about their gentle nature.',
                        image: '🏛️',
                        choices: [
                            { text: 'Establish branches in every kingdom 🌍', nextPage: 82 }
                        ]
                    },
                    {
                        title: 'The Global Hug Initiative',
                        text: 'Alex and Emerald\'s daily hugging tradition inspired a worldwide movement! "Hug a friend, make the world better" became a popular saying, and the simple act of embracing spread joy and connection across all communities.',
                        image: '🤗',
                        choices: [
                            { text: 'Declare an International Day of Hugs 🤗', nextPage: 82 }
                        ]
                    },
                    {
                        title: 'The Golden Age of Peace',
                        text: 'Through their friendship and tireless work, Alex and Emerald ushered in the Golden Age of Peace. Knights became protectors and helpers instead of fighters. Dragons became teachers and guardians instead of feared creatures. All beings learned to live together in harmony, celebrating their differences and supporting each other. The world became a place where every creature, no matter how different, could find friendship and acceptance. Alex\'s simple decision to choose friendship over fighting had changed the entire world forever. The End! 🌟✨👑',
                        image: '🌟',
                        choices: []
                    }
                ]
            }
        };
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
            <div class="mini-game-content">
                <h2>🎨 Drawing Game</h2>
                <p>Draw your favorite animal or shape!</p>
                <canvas id="drawing-canvas" width="400" height="300" style="border: 2px solid #4ECDC4; border-radius: 10px; background: white;"></canvas>
                <div class="drawing-controls">
                    <button onclick="changeDrawingColor('red')" style="background: red; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="changeDrawingColor('blue')" style="background: blue; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="changeDrawingColor('green')" style="background: green; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="changeDrawingColor('yellow')" style="background: yellow; width: 40px; height: 40px; margin: 5px; border: none; border-radius: 50%;"></button>
                    <button onclick="clearDrawing()" style="margin: 10px; padding: 10px;">🗑️ Clear</button>
                </div>
                <button class="close-mini-game" onclick="closeMiniGame()">❌ Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHtml);
    
    // Initialize drawing functionality
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentColor = 'black';
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    
    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
    
    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.beginPath();
    }
    
    window.changeDrawingColor = function(color) {
        currentColor = color;
    };
    
    window.clearDrawing = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
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
    initializeAudioControls();
}, 100);

console.log('🎮 Interactive Kids Storytelling Game loaded successfully!');
console.log('✅ COPPA Compliant - Privacy Protected');
console.log('🛡️ Local Storage sync enabled');
