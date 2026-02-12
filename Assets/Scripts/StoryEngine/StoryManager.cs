using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace KidsStoryGame.StoryEngine
{
    /// <summary>
    /// Core story manager that handles story progression, choice handling, and state management
    /// </summary>
    public class StoryManager : MonoBehaviour
    {
        [Header("Story Configuration")]
        [SerializeField] private StoryData currentStory;
        [SerializeField] private bool autoAdvanceText = true;
        [SerializeField] private float textAdvanceDelay = 3f;
        
        [Header("Audio Settings")]
        [SerializeField] private AudioSource narrationAudioSource;
        [SerializeField] private AudioSource musicAudioSource;
        [SerializeField] private AudioSource sfxAudioSource;
        
        // Events for UI and other systems to subscribe to
        public UnityEvent<StoryPage> OnPageChanged;
        public UnityEvent<StoryChoice[]> OnChoicesPresented;
        public UnityEvent OnStoryCompleted;
        public UnityEvent<string> OnTextHighlighted;
        
        // Current story state
        private StoryPage currentPage;
        private Dictionary<string, bool> storyFlags = new Dictionary<string, bool>();
        private List<string> visitedPages = new List<string>();
        private bool isNarrationEnabled = true;
        private bool isMusicEnabled = true;
        private bool areSfxEnabled = true;
        
        // Text animation
        private Coroutine textAnimationCoroutine;
        
        /// <summary>
        /// Gets the current story being played
        /// </summary>
        public StoryData CurrentStory => currentStory;
        
        /// <summary>
        /// Gets the current page being displayed
        /// </summary>
        public StoryPage CurrentPage => currentPage;
        
        /// <summary>
        /// Gets whether narration is currently enabled
        /// </summary>
        public bool IsNarrationEnabled => isNarrationEnabled;
        
        private void Awake()
        {
            // Ensure audio sources are available
            if (narrationAudioSource == null)
                narrationAudioSource = gameObject.AddComponent<AudioSource>();
            if (musicAudioSource == null)
                musicAudioSource = gameObject.AddComponent<AudioSource>();
            if (sfxAudioSource == null)
                sfxAudioSource = gameObject.AddComponent<AudioSource>();
                
            // Configure audio sources
            musicAudioSource.loop = true;
            musicAudioSource.volume = 0.3f;
            sfxAudioSource.volume = 0.7f;
            narrationAudioSource.volume = 0.8f;
        }
        
        /// <summary>
        /// Starts a new story from the beginning
        /// </summary>
        public void StartStory(StoryData story)
        {
            if (story == null)
            {
                Debug.LogError("Cannot start story: Story data is null");
                return;
            }
            
            currentStory = story;
            storyFlags.Clear();
            visitedPages.Clear();
            
            // Start background music
            if (story.storyThemeMusic != null && isMusicEnabled)
            {
                musicAudioSource.clip = story.storyThemeMusic;
                musicAudioSource.Play();
            }
            
            // Navigate to first page
            var startingPage = story.GetStartingPage();
            if (startingPage != null)
            {
                NavigateToPage(startingPage);
            }
        }
        
        /// <summary>
        /// Navigates to a specific story page
        /// </summary>
        public void NavigateToPage(StoryPage page)
        {
            if (page == null)
            {
                Debug.LogError("Cannot navigate to page: Page is null");
                return;
            }
            
            currentPage = page;
            
            // Track visited pages
            if (!visitedPages.Contains(page.pageId))
            {
                visitedPages.Add(page.pageId);
            }
            
            // Stop any ongoing text animation
            if (textAnimationCoroutine != null)
            {
                StopCoroutine(textAnimationCoroutine);
            }
            
            // Notify UI about page change
            OnPageChanged?.Invoke(page);
            
            // Handle page narration
            if (page.pageNarration != null && isNarrationEnabled)
            {
                PlayNarration(page.pageNarration);
            }
            
            // Start text highlighting animation
            if (page.pageText != null && page.pageText.Length > 0)
            {
                textAnimationCoroutine = StartCoroutine(AnimateTextHighlighting(page.pageText));
            }
            
            // Play page sound effects
            foreach (var sfx in page.soundEffects)
            {
                if (areSfxEnabled)
                {
                    StartCoroutine(PlaySoundEffectWithDelay(sfx));
                }
            }
            
            // Present choices after a delay
            if (page.choices.Count > 0)
            {
                StartCoroutine(PresentChoicesWithDelay(page.choices, 2f));
            }
            
            // Handle mini-game integration
            if (page.hasMiniGame && page.miniGameType != MiniGameType.None)
            {
                // Trigger mini-game after page content is displayed
                StartCoroutine(TriggerMiniGameWithDelay(page, 3f));
            }
        }
        
        /// <summary>
        /// Handles player choice selection
        /// </summary>
        public void MakeChoice(StoryChoice choice)
        {
            if (choice == null)
            {
                Debug.LogError("Cannot make choice: Choice is null");
                return;
            }
            
            // Check if choice is unlocked
            if (!IsChoiceUnlocked(choice))
            {
                Debug.LogWarning($"Choice '{choice.choiceText}' is locked");
                return;
            }
            
            // Find target page
            var targetPage = currentStory.FindPageById(choice.targetPageId);
            if (targetPage != null)
            {
                NavigateToPage(targetPage);
            }
            else
            {
                Debug.LogError($"Cannot find target page with ID: {choice.targetPageId}");
                // Check if this is the end of the story
                OnStoryCompleted?.Invoke();
            }
        }
        
        /// <summary>
        /// Checks if a choice is unlocked based on story flags and requirements
        /// </summary>
        private bool IsChoiceUnlocked(StoryChoice choice)
        {
            if (!choice.isUnlocked)
                return false;
                
            foreach (var requirement in choice.requirements)
            {
                if (!storyFlags.ContainsKey(requirement) || !storyFlags[requirement])
                {
                    return false;
                }
            }
            
            return true;
        }
        
        /// <summary>
        /// Sets a story flag (used for unlocking choices and tracking progress)
        /// </summary>
        public void SetStoryFlag(string flagName, bool value)
        {
            storyFlags[flagName] = value;
        }
        
        /// <summary>
        /// Gets the value of a story flag
        /// </summary>
        public bool GetStoryFlag(string flagName)
        {
            return storyFlags.ContainsKey(flagName) && storyFlags[flagName];
        }
        
        /// <summary>
        /// Plays narration audio with text highlighting
        /// </summary>
        private void PlayNarration(AudioClip narrationClip)
        {
            if (narrationAudioSource != null && narrationClip != null)
            {
                narrationAudioSource.clip = narrationClip;
                narrationAudioSource.Play();
            }
        }
        
        /// <summary>
        /// Animates text highlighting word by word
        /// </summary>
        private IEnumerator AnimateTextHighlighting(string text)
        {
            string[] words = text.Split(' ');
            string currentText = "";
            
            foreach (string word in words)
            {
                currentText += word + " ";
                OnTextHighlighted?.Invoke(currentText.Trim());
                yield return new WaitForSeconds(0.3f); // Adjust timing as needed
            }
        }
        
        /// <summary>
        /// Plays a sound effect with optional delay
        /// </summary>
        private IEnumerator PlaySoundEffectWithDelay(SoundEffect sfx)
        {
            if (sfx.delay > 0)
            {
                yield return new WaitForSeconds(sfx.delay);
            }
            
            if (sfxAudioSource != null && sfx.audioClip != null)
            {
                sfxAudioSource.PlayOneShot(sfx.audioClip, sfx.volume);
            }
        }
        
        /// <summary>
        /// Presents story choices to the player after a delay
        /// </summary>
        private IEnumerator PresentChoicesWithDelay(List<StoryChoice> choices, float delay)
        {
            yield return new WaitForSeconds(delay);
            
            // Filter unlocked choices
            List<StoryChoice> unlockedChoices = new List<StoryChoice>();
            foreach (var choice in choices)
            {
                if (IsChoiceUnlocked(choice))
                {
                    unlockedChoices.Add(choice);
                }
            }
            
            OnChoicesPresented?.Invoke(unlockedChoices.ToArray());
        }
        
        /// <summary>
        /// Triggers a mini-game after a delay
        /// </summary>
        private IEnumerator TriggerMiniGameWithDelay(StoryPage page, float delay)
        {
            yield return new WaitForSeconds(delay);
            
            // Notify mini-game system (to be implemented)
            var miniGameManager = FindObjectOfType<MiniGameManager>();
            if (miniGameManager != null)
            {
                miniGameManager.StartMiniGame(page.miniGameType, page.miniGameData);
            }
        }
        
        /// <summary>
        /// Toggles narration on/off
        /// </summary>
        public void ToggleNarration()
        {
            isNarrationEnabled = !isNarrationEnabled;
            if (!isNarrationEnabled && narrationAudioSource.isPlaying)
            {
                narrationAudioSource.Stop();
            }
        }
        
        /// <summary>
        /// Toggles background music on/off
        /// </summary>
        public void ToggleMusic()
        {
            isMusicEnabled = !isMusicEnabled;
            if (isMusicEnabled && !musicAudioSource.isPlaying && currentStory?.storyThemeMusic != null)
            {
                musicAudioSource.Play();
            }
            else if (!isMusicEnabled && musicAudioSource.isPlaying)
            {
                musicAudioSource.Stop();
            }
        }
        
        /// <summary>
        /// Toggles sound effects on/off
        /// </summary>
        public void ToggleSoundEffects()
        {
            areSfxEnabled = !areSfxEnabled;
        }
        
        /// <summary>
        /// Gets story progress as a percentage
        /// </summary>
        public float GetStoryProgress()
        {
            if (currentStory == null || currentStory.storyPages.Count == 0)
                return 0f;
                
            return (float)visitedPages.Count / currentStory.storyPages.Count;
        }
        
        /// <summary>
        /// Saves current story progress (implement with PlayerPrefs or save system)
        /// </summary>
        public void SaveProgress()
        {
            // TODO: Implement save system for story progress
            // This would save current page, story flags, visited pages, etc.
        }
        
        /// <summary>
        /// Loads saved story progress
        /// </summary>
        public void LoadProgress()
        {
            // TODO: Implement load system for story progress
        }
    }
}