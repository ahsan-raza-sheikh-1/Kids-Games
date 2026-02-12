using System;
using System.Collections.Generic;
using UnityEngine;

namespace KidsStoryGame.StoryEngine
{
    /// <summary>
    /// ScriptableObject that defines a complete story with branching narratives
    /// </summary>
    [CreateAssetMenu(fileName = "New Story", menuName = "Kids Story Game/Story Data")]
    public class StoryData : ScriptableObject
    {
        [Header("Story Information")]
        public string storyTitle;
        [TextArea(3, 5)]
        public string storyDescription;
        public Sprite storyCoverImage;
        public AudioClip storyThemeMusic;
        
        [Header("Target Audience")]
        public int recommendedMinAge = 5;
        public int recommendedMaxAge = 9;
        public ReadingLevel readingLevel = ReadingLevel.Beginner;
        
        [Header("Story Structure")]
        public List<StoryPage> storyPages = new List<StoryPage>();
        public List<Character> storyCharacters = new List<Character>();
        
        [Header("Educational Elements")]
        public List<EducationalTag> educationalTags = new List<EducationalTag>();
        
        [Header("Accessibility")]
        public bool supportsDyslexiaFont = true;
        public bool supportsColorblindMode = true;
        public bool hasVoiceNarration = true;
        
        /// <summary>
        /// Gets the starting page of the story
        /// </summary>
        public StoryPage GetStartingPage()
        {
            return storyPages.Count > 0 ? storyPages[0] : null;
        }
        
        /// <summary>
        /// Finds a story page by its unique ID
        /// </summary>
        public StoryPage FindPageById(string pageId)
        {
            return storyPages.Find(page => page.pageId == pageId);
        }
    }
    
    /// <summary>
    /// Represents a single page in the story with choices and interactions
    /// </summary>
    [System.Serializable]
    public class StoryPage
    {
        [Header("Page Information")]
        public string pageId;
        public string pageTitle;
        [TextArea(5, 10)]
        public string pageText;
        public Sprite pageBackground;
        public AudioClip pageNarration;
        
        [Header("Interactive Elements")]
        public List<InteractiveElement> interactiveElements = new List<InteractiveElement>();
        public List<StoryChoice> choices = new List<StoryChoice>();
        
        [Header("Mini-Game Integration")]
        public bool hasMiniGame;
        public MiniGameType miniGameType;
        public string miniGameData; // JSON string for mini-game configuration
        
        [Header("Animation and Effects")]
        public List<PageAnimation> animations = new List<PageAnimation>();
        public List<SoundEffect> soundEffects = new List<SoundEffect>();
    }
    
    /// <summary>
    /// Represents a choice the player can make in the story
    /// </summary>
    [System.Serializable]
    public class StoryChoice
    {
        public string choiceText;
        public string targetPageId;
        public Sprite choiceIcon;
        public bool isUnlocked = true;
        public List<string> requirements = new List<string>(); // Requirements to unlock this choice
    }
    
    /// <summary>
    /// Interactive elements that can be tapped or clicked on a page
    /// </summary>
    [System.Serializable]
    public class InteractiveElement
    {
        public string elementName;
        public Vector2 position; // Screen position as percentage (0-1)
        public Vector2 size; // Size as percentage (0-1)
        public InteractionType interactionType;
        public string interactionData; // Sound file, animation, etc.
        public string description; // For accessibility
    }
    
    /// <summary>
    /// Character definition for the story
    /// </summary>
    [System.Serializable]
    public class Character
    {
        public string characterName;
        [TextArea(2, 4)]
        public string characterDescription;
        public List<Sprite> characterSprites; // Different expressions/poses
        public AudioClip characterVoice;
        public Color characterColor = Color.white;
    }
    
    /// <summary>
    /// Animation definition for page elements
    /// </summary>
    [System.Serializable]
    public class PageAnimation
    {
        public string animationName;
        public AnimationType animationType;
        public float duration = 1f;
        public float delay = 0f;
        public Vector2 targetPosition;
        public bool loop = false;
    }
    
    /// <summary>
    /// Sound effect definition
    /// </summary>
    [System.Serializable]
    public class SoundEffect
    {
        public string effectName;
        public AudioClip audioClip;
        public float volume = 1f;
        public float delay = 0f;
        public bool loop = false;
    }
    
    // Enums for various story system components
    public enum ReadingLevel { Beginner, Intermediate, Advanced }
    public enum InteractionType { Sound, Animation, PopupText, CharacterDialogue }
    public enum MiniGameType { None, Counting, Matching, Memory, Puzzle, Drawing }
    public enum AnimationType { FadeIn, FadeOut, SlideIn, SlideOut, Bounce, Rotate }
    public enum EducationalTag { Animals, Numbers, Letters, Colors, Shapes, Friendship, Problem_Solving, Emotions }
}