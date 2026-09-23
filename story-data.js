// FULL STORY DATA FOR KIDS GAME
const storyData = {
    'forest-adventure': {
        title: 'The Friendly Forest Adventure',
        pages: [
            { title: 'The Adventure Begins', text: 'Once upon a time, there was a curious little girl named Maya who loved exploring nature. One sunny morning, she decided to visit the magical forest near her home. As she approached the forest entrance, she noticed two different paths.', image: '🌲', choices: [{ text: 'Follow the butterfly path 🦋', nextPage: 1 }, { text: 'Take the flower trail 🌸', nextPage: 2 }] },
            { title: 'The Butterfly Guide', text: 'Maya followed the colorful butterflies deeper into the forest. Soon, she came across a wise old owl. "Hello little one," hooted the owl. "I can help you on your journey!"', image: '🦉', choices: [{ text: 'Ask the owl for advice 🤔', nextPage: 3 }, { text: 'Thank the owl and continue 🚶‍♀️', nextPage: 4 }] },
            { title: 'The Flower Garden', text: 'Maya walked along the flower trail and discovered a beautiful garden where a friendly rabbit was tending to the flowers. "Would you like to help me plant some seeds?" asked the rabbit.', image: '🐰', choices: [{ text: 'Help the rabbit with gardening 🌱', nextPage: 5 }, { text: 'Ask about the magical flowers ✨', nextPage: 6 }] },
            { title: 'Wise Owl\'s Advice', text: 'The wise owl taught Maya about the importance of being kind to all forest creatures. "When we help others," said the owl, "we create magic in the world."', image: '🦉', choices: [{ text: 'Use the secret path 🗝️', nextPage: 7 }, { text: 'Continue on the main trail 🚶‍♀️', nextPage: 8 }] },
            { title: 'Forest Exploration', text: 'Maya continued exploring and met many friendly animals. Each animal taught her something new about friendship, kindness, and the wonders of nature.', image: '🦌', choices: [{ text: 'Visit the magical clearing ✨', nextPage: 9 }, { text: 'Explore the hidden cave 🕳️', nextPage: 10 }] },
            { title: 'Garden Helper', text: 'Maya helped the rabbit plant beautiful flowers. Working together, they created the most colorful garden in the forest! Teamwork makes everything more fun.', image: '🌺', choices: [{ text: 'Make a wish on the rainbow flowers 🌈', nextPage: 11 }, { text: 'Explore more of the forest 🌲', nextPage: 9 }] },
            { title: 'Magical Flowers', text: 'The flowers grant one wish to those with kind hearts. Maya made a wish for all forest animals to be happy and healthy. The flowers glowed brighter!', image: '🌟', choices: [{ text: 'Continue to the magical clearing ✨', nextPage: 9 }, { text: 'Visit the wishing well 🪣', nextPage: 12 }] },
            { title: 'The Secret Path', text: 'Using the owl\'s secret path, Maya discovered a hidden grove where baby animals played together. A mother bear invited Maya to join their picnic.', image: '🐻', choices: [{ text: 'Play games with the baby animals 🎮', nextPage: 13 }, { text: 'Help organize the picnic 🧺', nextPage: 14 }] },
            { title: 'The Main Trail', text: 'Maya found a beautiful stream where fish jumped and played. A wise frog offered to teach Maya about the water cycle.', image: '🐸', choices: [{ text: 'Learn nature secrets 📚', nextPage: 15 }, { text: 'Cross the stream 🌊', nextPage: 9 }] },
            { title: 'The Magical Clearing', text: 'Maya arrived at a clearing where all her new friends were waiting! They had prepared a friendship celebration.', image: '🎉', choices: [{ text: 'Join the celebration dance 💃', nextPage: 16 }, { text: 'Share stories with friends 📖', nextPage: 17 }] },
            { title: 'The Hidden Cave', text: 'Maya discovered ancient drawings on the walls. She learned that she was part of a long tradition of forest guardians.', image: '💎', choices: [{ text: 'Become a forest guardian 🛡️', nextPage: 18 }, { text: 'Return to share the discovery 🗣️', nextPage: 16 }] },
            { title: 'The Rainbow Wish', text: 'Maya\'s wish came true! The entire forest shimmered with magic. Her kind heart had made this possible.', image: '🌈', choices: [{ text: 'Celebrate with animals 🎊', nextPage: 16 }] },
            { title: 'The Wishing Well', text: 'Maya threw in a pebble and made another wish - for all children to find magic in nature.', image: '🪣', choices: [{ text: 'Return to the celebration 🎉', nextPage: 16 }] },
            { title: 'Animal Games', text: 'Maya played games with foxes and rabbits. They taught her about cooperation and having fun together.', image: '🎮', choices: [{ text: 'Organize forest Olympics 🏆', nextPage: 19 }] },
            { title: 'Picnic Helper', text: 'Maya helped arrange flowers and serve juice. Everyone felt included and happy.', image: '🧺', choices: [{ text: 'Lead celebration 🎵', nextPage: 16 }] },
            { title: 'Nature\'s Wisdom', text: 'The frog taught Maya how rain becomes rivers and how trees breathe. Every creature has an important job.', image: '📚', choices: [{ text: 'Share knowledge 🎓', nextPage: 16 }] },
            { title: 'Celebration Dance', text: 'Maya joined the magical dance! All the forest animals danced together in perfect harmony.', image: '💃', choices: [{ text: 'Promise to return 💝', nextPage: 20 }] },
            { title: 'Sharing Stories', text: 'Maya and her friends sat in a circle sharing stories. Friendship makes every story more magical.', image: '📖', choices: [{ text: 'Promise to return 💝', nextPage: 20 }] },
            { title: 'Forest Guardian', text: 'Maya accepted the role of forest guardian! She promised to protect the forest and help other children.', image: '🛡️', choices: [{ text: 'Begin duties 👑', nextPage: 20 }] },
            { title: 'Forest Olympics', text: 'Maya organized the first-ever Forest Olympics! Every animal won a prize for their special talent.', image: '🏆', choices: [{ text: 'Victory ceremony 🥇', nextPage: 20 }] },
            { title: 'A Magical Friendship', text: 'As the sun set, Maya realized kindness creates the greatest magic of all.', image: '🌅', choices: [{ text: 'Return home 🏡', nextPage: 21 }, { text: 'One last star story 🌟', nextPage: 22 }] },
            { title: 'The Journey Home', text: 'Maya walked back home, the path glowing to guide her. The End! 🌟🏡', image: '🏡', choices: [] },
            { title: 'Under the Starlight', text: 'Maya and the animals watched the stars. The End! ✨🦉', image: '✨', choices: [] }
        ]
    },
    'ocean-mystery': {
        title: 'Ocean Mystery Adventure',
        pages: [
            { title: 'The Mysterious Ocean', text: 'Captain Sam found a message in a bottle about an underwater kingdom! The adventure begins.', image: '🌊', choices: [{ text: 'Dive to the coral reef 🪸', nextPage: 1 }, { text: 'Follow the dolphins 🐬', nextPage: 2 }] },
            { title: 'Coral Reef Discovery', text: 'The coral reef was like an underwater rainbow city! A seahorse offered to guide Sam.', image: '🪸', choices: [{ text: 'Accept help 🌟', nextPage: 3 }, { text: 'Explore castle 🏰', nextPage: 4 }] },
            { title: 'Dolphin Friends', text: 'The dolphins led Sam through spinning loops and to a cave filled with glowing pearls.', image: '🐬', choices: [{ text: 'Learn language 🗣️', nextPage: 5 }, { text: 'Explore cave 💎', nextPage: 6 }] },
            { title: 'Seahorse Guide', text: 'The seahorse Sparkle knew every secret. "Only those with pure hearts can find the kingdom."' , image: '🌟', choices: [{ text: 'Follow route 🗺️', nextPage: 7 }, { text: 'Ask history 📚', nextPage: 8 }] },
            { title: 'The Coral Castle', text: 'Inside, Sam met a wise octopus librarian who kept records of all ocean adventures.', image: '🐙', choices: [{ text: 'Read books 📖', nextPage: 9 }, { text: 'Ask for map 🗺️', nextPage: 7 }] },
            { title: 'Dolphin Language', text: 'Sam learned to communicate with all sea creatures. He could understand whale songs now.', image: '🗣️', choices: [{ text: 'Talk to whales 🐋', nextPage: 10 }, { text: 'Gather info 🐠', nextPage: 11 }] },
            { title: 'The Treasure Cave', text: 'The cave contained the memories of the ocean! Each pearl held a story.', image: '💎', choices: [{ text: 'Listen to stories 📿', nextPage: 12 }, { text: 'Collect shells 🐚', nextPage: 13 }] },
            { title: 'The Secret Route', text: 'Sparkle led Sam past underwater volcanoes and through fields of sea grass.', image: '🗺️', choices: [{ text: 'Wake sea monster 🐉', nextPage: 14 }, { text: 'Continue 👑', nextPage: 15 }] },
            { title: 'Ocean Guardian', text: 'Sam promised to protect the ocean. He became an official Ocean Guardian. The End! 🛡️🌊', image: '🛡️', choices: [] },
            { title: 'Kingdom Celebration', text: 'Sam reached the magnificent underwater kingdom and was welcomed with a hero\'s party! The End! 🏰🎉', image: '🏰', choices: [] }
        ]
    },
    'space-adventure': {
        title: 'Cosmic Explorer Mission',
        pages: [
            { title: 'Blast Off!', text: 'Astronaut Luna received an urgent message from space! Her rocket launches into the starry sky.', image: '🚀', choices: [{ text: 'Head to planet 🪐', nextPage: 1 }, { text: 'Visit station 🛰️', nextPage: 2 }] },
            { title: 'Zephyr-7', text: 'The planet was covered in purple clouds. Luna found friendly aliens who needed help.', image: '🪐', choices: [{ text: 'Help fix device 🔧', nextPage: 3 }, { text: 'Explore city 🏙️', nextPage: 4 }] },
            { title: 'Space Station', text: 'Captain Stardust explained the distress call. "The journey through the asteroid field is dangerous."', image: '🛰️', choices: [{ text: 'Navigate asteroids ☄️', nextPage: 5 }, { text: 'Find safe route 🗺️', nextPage: 6 }] },
            { title: 'Fixing the Device', text: 'Luna worked with Zing and Zap to repair the communication array. Families were reunited!', image: '🔧', choices: [{ text: 'Celebrate 🎉', nextPage: 7 }] },
            { title: 'The Crystal City', text: 'The city was made of glowing crystals. Luna learned to communicate through light and music.', image: '🏙️', choices: [{ text: 'Learn light-language 💡', nextPage: 8 }] },
            { title: 'Asteroids!', text: 'Luna skillfully steered through the rocks and found rare space minerals!', image: '☄️', choices: [{ text: 'Mine minerals ⛏️', nextPage: 9 }, { text: 'Continue 🚀', nextPage: 1 }] },
            { title: 'Safe Route', text: 'Luna discovered a cosmic highway used by space traders. She met Captain Nebula.', image: '🗺️', choices: [{ text: 'Learn cultures 👽', nextPage: 10 }] },
            { title: 'Galactic Reunion', text: 'Luna realized that family love is universal across all planets. The End! 🌟🎈', image: '🎉', choices: [] },
            { title: 'Cosmic Ambassador', text: 'Luna became a bridge between Earth and the stars. She returns home a hero. The End! 🚀🌍', image: '🌍', choices: [] }
        ]
    }
};
