using UnityEngine;
using KidsStoryGame.StoryEngine;

namespace KidsStoryGame.Examples
{
    /// <summary>
    /// Example story creator that demonstrates how to create story content
    /// </summary>
    public class ExampleStoryCreator : MonoBehaviour
    {
        [Header("Example Story Creation")]
        [SerializeField] private bool createExampleStory = false;
        
        private void Start()
        {
            if (createExampleStory)
            {
                CreateSampleStory();
            }
        }
        
        /// <summary>
        /// Creates a sample story to demonstrate the system
        /// </summary>
        private void CreateSampleStory()
        {
            // Create a new story data asset
            StoryData exampleStory = ScriptableObject.CreateInstance<StoryData>();
            
            // Configure story metadata
            exampleStory.storyTitle = "The Friendly Forest Adventure";
            exampleStory.storyDescription = "Join Maya on a magical journey through an enchanted forest where she meets new animal friends and learns about friendship and kindness.";
            exampleStory.recommendedMinAge = 5;
            exampleStory.recommendedMaxAge = 8;
            exampleStory.readingLevel = ReadingLevel.Beginner;
            exampleStory.hasVoiceNarration = true;
            exampleStory.supportsDyslexiaFont = true;
            exampleStory.supportsColorblindMode = true;
            
            // Add educational tags
            exampleStory.educationalTags.Add(EducationalTag.Animals);
            exampleStory.educationalTags.Add(EducationalTag.Friendship);
            exampleStory.educationalTags.Add(EducationalTag.Problem_Solving);
            
            // Create story pages
            CreateStoryPages(exampleStory);
            
            // Create characters
            CreateStoryCharacters(exampleStory);
            
            Debug.Log($"Created example story: {exampleStory.storyTitle} with {exampleStory.storyPages.Count} pages");
        }
        
        /// <summary>
        /// Creates the pages for the example story
        /// </summary>
        private void CreateStoryPages(StoryData story)
        {
            // Page 1: Introduction
            StoryPage page1 = new StoryPage
            {
                pageId = "intro",
                pageTitle = "The Adventure Begins",
                pageText = "Once upon a time, there was a curious little girl named Maya who loved exploring nature. One sunny morning, she decided to visit the magical forest near her home.",
                hasMiniGame = false
            };
            
            // Add choices for page 1
            page1.choices.Add(new StoryChoice
            {
                choiceText = "Follow the butterfly path",
                targetPageId = "butterfly_path"
            });
            page1.choices.Add(new StoryChoice
            {
                choiceText = "Take the flower trail",
                targetPageId = "flower_trail"
            });
            
            // Add interactive elements
            page1.interactiveElements.Add(new InteractiveElement
            {
                elementName = "Forest Birds",
                position = new Vector2(0.7f, 0.8f),
                size = new Vector2(0.2f, 0.2f),
                interactionType = InteractionType.Sound,
                interactionData = "bird_chirping.wav",
                description = "Tap to hear the birds singing"
            });
            
            story.storyPages.Add(page1);
            
            // Page 2: Butterfly Path
            StoryPage page2 = new StoryPage
            {
                pageId = "butterfly_path",
                pageTitle = "The Butterfly Guide",
                pageText = "Maya followed the colorful butterflies deeper into the forest. Soon, she came across a wise old owl sitting on a branch.",
                hasMiniGame = true,
                miniGameType = MiniGameType.Counting,
                miniGameData = "{\"targetNumber\": 5, \"itemType\": \"butterflies\", \"difficulty\": \"easy\"}"
            };
            
            page2.choices.Add(new StoryChoice
            {
                choiceText = "Ask the owl for advice",
                targetPageId = "owl_wisdom"
            });
            page2.choices.Add(new StoryChoice
            {
                choiceText = "Continue following butterflies",
                targetPageId = "butterfly_meadow"
            });
            
            story.storyPages.Add(page2);
            
            // Page 3: Flower Trail
            StoryPage page3 = new StoryPage
            {
                pageId = "flower_trail",
                pageTitle = "The Flower Garden",
                pageText = "Maya walked along the flower trail and discovered a beautiful garden where a friendly rabbit was tending to the flowers.",
                hasMiniGame = true,
                miniGameType = MiniGameType.Matching,
                miniGameData = "{\"itemType\": \"flowers\", \"pairCount\": 4, \"difficulty\": \"easy\"}"
            };
            
            page3.choices.Add(new StoryChoice
            {
                choiceText = "Help the rabbit with gardening",
                targetPageId = "garden_helper"
            });
            page3.choices.Add(new StoryChoice
            {
                choiceText = "Ask about the special flowers",
                targetPageId = "flower_magic"
            });
            
            story.storyPages.Add(page3);
            
            // Page 4: Owl Wisdom
            StoryPage page4 = new StoryPage
            {
                pageId = "owl_wisdom",
                pageTitle = "Learning from the Owl",
                pageText = "The wise owl taught Maya about the importance of being kind to all forest creatures. 'When we help others,' said the owl, 'we create magic in the world.'",
                hasMiniGame = false
            };
            
            page4.choices.Add(new StoryChoice
            {
                choiceText = "Thank the owl and continue exploring",
                targetPageId = "forest_friends"
            });
            
            story.storyPages.Add(page4);
            
            // Page 5: Garden Helper
            StoryPage page5 = new StoryPage
            {
                pageId = "garden_helper",
                pageTitle = "A Helping Hand",
                pageText = "Maya helped the rabbit plant new flowers and learned that working together makes tasks more fun and creates beautiful results.",
                hasMiniGame = true,
                miniGameType = MiniGameType.Puzzle,
                miniGameData = "{\"puzzleType\": \"jigsaw\", \"pieces\": 6, \"image\": \"flower_garden\"}"
            };
            
            page5.choices.Add(new StoryChoice
            {
                choiceText = "Explore more of the forest",
                targetPageId = "forest_friends"
            });
            
            story.storyPages.Add(page5);
            
            // Final Page: Forest Friends
            StoryPage finalPage = new StoryPage
            {
                pageId = "forest_friends",
                pageTitle = "New Friends Forever",
                pageText = "Maya made wonderful friends in the forest that day. She learned that kindness, curiosity, and helping others are the keys to great adventures and lasting friendships. The End.",
                hasMiniGame = false
            };
            
            // No choices - this is the end of the story
            
            story.storyPages.Add(finalPage);
        }
        
        /// <summary>
        /// Creates characters for the example story
        /// </summary>
        private void CreateStoryCharacters(StoryData story)
        {
            // Main character: Maya
            Character maya = new Character
            {
                characterName = "Maya",
                characterDescription = "A curious and kind young girl who loves exploring nature and making new friends.",
                characterColor = new Color(0.8f, 0.6f, 0.4f) // Light brown
            };
            story.storyCharacters.Add(maya);
            
            // Supporting character: Wise Owl
            Character owl = new Character
            {
                characterName = "Oliver the Owl",
                characterDescription = "A wise old owl who shares valuable life lessons with those willing to listen.",
                characterColor = new Color(0.6f, 0.4f, 0.2f) // Brown
            };
            story.storyCharacters.Add(owl);
            
            // Supporting character: Friendly Rabbit
            Character rabbit = new Character
            {
                characterName = "Ruby the Rabbit",
                characterDescription = "A gentle rabbit who loves gardening and teaching others about caring for nature.",
                characterColor = Color.white
            };
            story.storyCharacters.Add(rabbit);
        }
    }
}