using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using KidsStoryGame.StoryEngine;

namespace KidsStoryGame.UI
{
    /// <summary>
    /// Main UI controller for the story display and interaction
    /// </summary>
    public class StoryUIController : MonoBehaviour
    {
        [Header("Story Display UI")]
        [SerializeField] private Image backgroundImage;
        [SerializeField] private Text storyTitleText;
        [SerializeField] private Text storyContentText;
        [SerializeField] private ScrollRect storyScrollRect;
        
        [Header("Choice UI")]
        [SerializeField] private GameObject choicesContainer;
        [SerializeField] private GameObject choiceButtonPrefab;
        [SerializeField] private float choiceAnimationDelay = 0.2f;
        
        [Header("Interactive Elements")]
        [SerializeField] private Canvas interactiveElementsCanvas;
        [SerializeField] private GameObject interactiveElementPrefab;
        
        [Header("Progress UI")]
        [SerializeField] private Slider progressSlider;
        [SerializeField] private Text progressText;
        
        [Header("Audio Controls")]
        [SerializeField] private Button narrationToggleButton;
        [SerializeField] private Button musicToggleButton;
        [SerializeField] private Button soundEffectsToggleButton;
        [SerializeField] private Slider volumeSlider;
        
        [Header("Accessibility")]
        [SerializeField] private bool useDyslexiaFriendlyFont = false;
        [SerializeField] private bool useHighContrastMode = false;
        [SerializeField] private float textSizeMultiplier = 1f;
        
        [Header("Animation Settings")]
        [SerializeField] private float textAnimationSpeed = 0.05f;
        [SerializeField] private float pageTransitionDuration = 0.5f;
        
        // Components and references
        private StoryManager storyManager;
        private List<GameObject> currentChoiceButtons = new List<GameObject>();
        private List<GameObject> currentInteractiveElements = new List<GameObject>();
        private Coroutine textAnimationCoroutine;
        
        // UI state
        private bool isDisplayingText = false;
        private bool isShowingChoices = false;
        
        private void Awake()
        {
            FindReferences();
            SetupEventListeners();
            ApplyAccessibilitySettings();
        }
        
        private void Start()
        {
            InitializeUI();
        }
        
        /// <summary>
        /// Finds required component references
        /// </summary>
        private void FindReferences()
        {
            storyManager = FindObjectOfType<StoryManager>();
            if (storyManager == null)
            {
                Debug.LogError("StoryManager not found! StoryUIController requires a StoryManager in the scene.");
            }
        }
        
        /// <summary>
        /// Sets up UI event listeners
        /// </summary>
        private void SetupEventListeners()
        {
            if (storyManager != null)
            {
                storyManager.OnPageChanged.AddListener(DisplayStoryPage);
                storyManager.OnChoicesPresented.AddListener(DisplayChoices);
                storyManager.OnTextHighlighted.AddListener(UpdateTextHighlighting);
                storyManager.OnStoryCompleted.AddListener(HandleStoryCompletion);
            }
            
            // Audio control listeners
            if (narrationToggleButton != null)
                narrationToggleButton.onClick.AddListener(ToggleNarration);
            if (musicToggleButton != null)
                musicToggleButton.onClick.AddListener(ToggleMusic);
            if (soundEffectsToggleButton != null)
                soundEffectsToggleButton.onClick.AddListener(ToggleSoundEffects);
            if (volumeSlider != null)
                volumeSlider.onValueChanged.AddListener(OnVolumeChanged);
        }
        
        /// <summary>
        /// Initializes the UI to default state
        /// </summary>
        private void InitializeUI()
        {
            ClearChoices();
            ClearInteractiveElements();
            
            if (storyContentText != null)
                storyContentText.text = "";
            if (storyTitleText != null)
                storyTitleText.text = "";
            if (progressSlider != null)
                progressSlider.value = 0f;
        }
        
        /// <summary>
        /// Displays a story page with all its elements
        /// </summary>
        public void DisplayStoryPage(StoryPage page)
        {
            if (page == null)
                return;
            
            StartCoroutine(DisplayPageCoroutine(page));
        }
        
        /// <summary>
        /// Coroutine to animate page display
        /// </summary>
        private IEnumerator DisplayPageCoroutine(StoryPage page)
        {
            // Clear previous content
            ClearChoices();
            ClearInteractiveElements();
            
            // Set background
            if (backgroundImage != null && page.pageBackground != null)
            {
                backgroundImage.sprite = page.pageBackground;
                yield return StartCoroutine(FadeInImage(backgroundImage, pageTransitionDuration));
            }
            
            // Set title
            if (storyTitleText != null && !string.IsNullOrEmpty(page.pageTitle))
            {
                storyTitleText.text = page.pageTitle;
            }
            
            // Animate text display
            if (storyContentText != null && !string.IsNullOrEmpty(page.pageText))
            {
                yield return StartCoroutine(AnimateTextDisplay(page.pageText));
            }
            
            // Create interactive elements
            CreateInteractiveElements(page.interactiveElements);
            
            // Update progress
            UpdateProgressDisplay();
        }
        
        /// <summary>
        /// Animates text display character by character
        /// </summary>
        private IEnumerator AnimateTextDisplay(string fullText)
        {
            isDisplayingText = true;
            storyContentText.text = "";
            
            foreach (char character in fullText)
            {
                storyContentText.text += character;
                yield return new WaitForSeconds(textAnimationSpeed);
            }
            
            isDisplayingText = false;
        }
        
        /// <summary>
        /// Updates text highlighting during narration
        /// </summary>
        public void UpdateTextHighlighting(string highlightedText)
        {
            if (storyContentText != null)
            {
                // Simple highlighting - in production, you might use rich text tags
                storyContentText.text = highlightedText;
            }
        }
        
        /// <summary>
        /// Displays story choices to the player
        /// </summary>
        public void DisplayChoices(StoryChoice[] choices)
        {
            if (choices == null || choices.Length == 0)
                return;
            
            StartCoroutine(DisplayChoicesCoroutine(choices));
        }
        
        /// <summary>
        /// Coroutine to animate choice display
        /// </summary>
        private IEnumerator DisplayChoicesCoroutine(StoryChoice[] choices)
        {
            isShowingChoices = true;
            
            // Clear existing choices
            ClearChoices();
            
            // Create choice buttons with staggered animation
            for (int i = 0; i < choices.Length; i++)
            {
                CreateChoiceButton(choices[i], i);
                yield return new WaitForSeconds(choiceAnimationDelay);
            }
        }
        
        /// <summary>
        /// Creates a choice button for the player
        /// </summary>
        private void CreateChoiceButton(StoryChoice choice, int index)
        {
            if (choiceButtonPrefab == null || choicesContainer == null)
                return;
            
            GameObject buttonObj = Instantiate(choiceButtonPrefab, choicesContainer.transform);
            currentChoiceButtons.Add(buttonObj);
            
            // Configure button
            Button button = buttonObj.GetComponent<Button>();
            if (button != null)
            {
                button.onClick.AddListener(() => OnChoiceSelected(choice));
                
                // Add accessibility support
                button.navigation = Navigation.defaultNavigation;
            }
            
            // Set button text
            Text buttonText = buttonObj.GetComponentInChildren<Text>();
            if (buttonText != null)
            {
                buttonText.text = choice.choiceText;
                ApplyTextAccessibility(buttonText);
            }
            
            // Set choice icon if available
            Image buttonIcon = buttonObj.transform.Find("Icon")?.GetComponent<Image>();
            if (buttonIcon != null && choice.choiceIcon != null)
            {
                buttonIcon.sprite = choice.choiceIcon;
            }
            
            // Animate button appearance
            StartCoroutine(AnimateButtonAppearance(buttonObj));
        }
        
        /// <summary>
        /// Handles choice selection
        /// </summary>
        private void OnChoiceSelected(StoryChoice choice)
        {
            if (storyManager != null && !isDisplayingText)
            {
                storyManager.MakeChoice(choice);
                isShowingChoices = false;
            }
        }
        
        /// <summary>
        /// Creates interactive elements on the page
        /// </summary>
        private void CreateInteractiveElements(List<InteractiveElement> elements)
        {
            if (elements == null || interactiveElementsCanvas == null)
                return;
            
            foreach (var element in elements)
            {
                CreateInteractiveElement(element);
            }
        }
        
        /// <summary>
        /// Creates a single interactive element
        /// </summary>
        private void CreateInteractiveElement(InteractiveElement element)
        {
            if (interactiveElementPrefab == null)
                return;
            
            GameObject elementObj = Instantiate(interactiveElementPrefab, interactiveElementsCanvas.transform);
            currentInteractiveElements.Add(elementObj);
            
            // Position element
            RectTransform rectTransform = elementObj.GetComponent<RectTransform>();
            if (rectTransform != null)
            {
                Vector2 canvasSize = interactiveElementsCanvas.GetComponent<RectTransform>().sizeDelta;
                Vector2 position = new Vector2(
                    element.position.x * canvasSize.x,
                    element.position.y * canvasSize.y
                );
                rectTransform.anchoredPosition = position;
                rectTransform.sizeDelta = new Vector2(
                    element.size.x * canvasSize.x,
                    element.size.y * canvasSize.y
                );
            }
            
            // Configure interaction
            Button button = elementObj.GetComponent<Button>();
            if (button != null)
            {
                button.onClick.AddListener(() => OnInteractiveElementClicked(element));
            }
            
            // Add accessibility description
            AccessibilityHelper accessibilityHelper = elementObj.GetComponent<AccessibilityHelper>();
            if (accessibilityHelper != null)
            {
                accessibilityHelper.SetDescription(element.description);
            }
        }
        
        /// <summary>
        /// Handles interactive element clicks
        /// </summary>
        private void OnInteractiveElementClicked(InteractiveElement element)
        {
            switch (element.interactionType)
            {
                case InteractionType.Sound:
                    PlayInteractionSound(element.interactionData);
                    break;
                case InteractionType.Animation:
                    PlayInteractionAnimation(element.interactionData);
                    break;
                case InteractionType.PopupText:
                    ShowPopupText(element.interactionData);
                    break;
                case InteractionType.CharacterDialogue:
                    ShowCharacterDialogue(element.interactionData);
                    break;
            }
        }
        
        /// <summary>
        /// Plays an interaction sound effect
        /// </summary>
        private void PlayInteractionSound(string soundData)
        {
            // TODO: Load and play sound effect
            Debug.Log($"Playing interaction sound: {soundData}");
        }
        
        /// <summary>
        /// Plays an interaction animation
        /// </summary>
        private void PlayInteractionAnimation(string animationData)
        {
            // TODO: Play interaction animation
            Debug.Log($"Playing interaction animation: {animationData}");
        }
        
        /// <summary>
        /// Shows popup text for interaction
        /// </summary>
        private void ShowPopupText(string text)
        {
            // TODO: Show popup text UI
            Debug.Log($"Showing popup text: {text}");
        }
        
        /// <summary>
        /// Shows character dialogue
        /// </summary>
        private void ShowCharacterDialogue(string dialogueData)
        {
            // TODO: Show character dialogue UI
            Debug.Log($"Showing character dialogue: {dialogueData}");
        }
        
        /// <summary>
        /// Updates the story progress display
        /// </summary>
        private void UpdateProgressDisplay()
        {
            if (storyManager == null)
                return;
            
            float progress = storyManager.GetStoryProgress();
            
            if (progressSlider != null)
            {
                progressSlider.value = progress;
            }
            
            if (progressText != null)
            {
                progressText.text = $"Progress: {Mathf.RoundToInt(progress * 100)}%";
            }
        }
        
        /// <summary>
        /// Handles story completion
        /// </summary>
        private void HandleStoryCompletion()
        {
            // TODO: Show story completion UI
            Debug.Log("Story completed!");
        }
        
        /// <summary>
        /// Clears all choice buttons
        /// </summary>
        private void ClearChoices()
        {
            foreach (var button in currentChoiceButtons)
            {
                if (button != null)
                    Destroy(button);
            }
            currentChoiceButtons.Clear();
        }
        
        /// <summary>
        /// Clears all interactive elements
        /// </summary>
        private void ClearInteractiveElements()
        {
            foreach (var element in currentInteractiveElements)
            {
                if (element != null)
                    Destroy(element);
            }
            currentInteractiveElements.Clear();
        }
        
        /// <summary>
        /// Applies accessibility settings to UI elements
        /// </summary>
        private void ApplyAccessibilitySettings()
        {
            // Apply dyslexia-friendly font
            if (useDyslexiaFriendlyFont)
            {
                ApplyDyslexiaFriendlyFont();
            }
            
            // Apply high contrast mode
            if (useHighContrastMode)
            {
                ApplyHighContrastMode();
            }
            
            // Apply text size multiplier
            ApplyTextSizeMultiplier();
        }
        
        /// <summary>
        /// Applies dyslexia-friendly font to text elements
        /// </summary>
        private void ApplyDyslexiaFriendlyFont()
        {
            // TODO: Load and apply dyslexia-friendly font
            Font dyslexiaFont = Resources.Load<Font>("Fonts/OpenDyslexic");
            if (dyslexiaFont != null)
            {
                if (storyContentText != null)
                    storyContentText.font = dyslexiaFont;
                if (storyTitleText != null)
                    storyTitleText.font = dyslexiaFont;
            }
        }
        
        /// <summary>
        /// Applies high contrast mode
        /// </summary>
        private void ApplyHighContrastMode()
        {
            // TODO: Apply high contrast colors
            if (storyContentText != null)
                storyContentText.color = Color.white;
            if (backgroundImage != null)
                backgroundImage.color = Color.black;
        }
        
        /// <summary>
        /// Applies text size multiplier
        /// </summary>
        private void ApplyTextSizeMultiplier()
        {
            if (storyContentText != null)
                storyContentText.fontSize = Mathf.RoundToInt(storyContentText.fontSize * textSizeMultiplier);
            if (storyTitleText != null)
                storyTitleText.fontSize = Mathf.RoundToInt(storyTitleText.fontSize * textSizeMultiplier);
        }
        
        /// <summary>
        /// Applies accessibility settings to a text component
        /// </summary>
        private void ApplyTextAccessibility(Text textComponent)
        {
            if (textComponent == null)
                return;
            
            if (useDyslexiaFriendlyFont)
            {
                Font dyslexiaFont = Resources.Load<Font>("Fonts/OpenDyslexic");
                if (dyslexiaFont != null)
                    textComponent.font = dyslexiaFont;
            }
            
            textComponent.fontSize = Mathf.RoundToInt(textComponent.fontSize * textSizeMultiplier);
            
            if (useHighContrastMode)
            {
                textComponent.color = Color.white;
            }
        }
        
        // Audio control methods
        private void ToggleNarration()
        {
            if (storyManager != null)
                storyManager.ToggleNarration();
        }
        
        private void ToggleMusic()
        {
            if (storyManager != null)
                storyManager.ToggleMusic();
        }
        
        private void ToggleSoundEffects()
        {
            if (storyManager != null)
                storyManager.ToggleSoundEffects();
        }
        
        private void OnVolumeChanged(float volume)
        {
            AudioListener.volume = volume;
        }
        
        // Animation helper methods
        private IEnumerator FadeInImage(Image image, float duration)
        {
            Color color = image.color;
            color.a = 0f;
            image.color = color;
            
            float elapsedTime = 0f;
            while (elapsedTime < duration)
            {
                color.a = Mathf.Lerp(0f, 1f, elapsedTime / duration);
                image.color = color;
                elapsedTime += Time.deltaTime;
                yield return null;
            }
            
            color.a = 1f;
            image.color = color;
        }
        
        private IEnumerator AnimateButtonAppearance(GameObject button)
        {
            button.transform.localScale = Vector3.zero;
            
            float elapsedTime = 0f;
            float duration = 0.3f;
            
            while (elapsedTime < duration)
            {
                float scale = Mathf.Lerp(0f, 1f, elapsedTime / duration);
                button.transform.localScale = Vector3.one * scale;
                elapsedTime += Time.deltaTime;
                yield return null;
            }
            
            button.transform.localScale = Vector3.one;
        }
        
        /// <summary>
        /// Sets accessibility options
        /// </summary>
        public void SetAccessibilityOptions(bool dyslexiaFont, bool highContrast, float textSize)
        {
            useDyslexiaFriendlyFont = dyslexiaFont;
            useHighContrastMode = highContrast;
            textSizeMultiplier = textSize;
            
            ApplyAccessibilitySettings();
        }
    }
    
    /// <summary>
    /// Helper component for accessibility features
    /// </summary>
    public class AccessibilityHelper : MonoBehaviour
    {
        [SerializeField] private string description;
        
        public void SetDescription(string desc)
        {
            description = desc;
        }
        
        public string GetDescription()
        {
            return description;
        }
    }
}