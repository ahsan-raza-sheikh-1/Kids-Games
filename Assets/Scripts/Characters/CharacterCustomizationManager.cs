using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace KidsStoryGame.Characters
{
    /// <summary>
    /// Manages character creation and customization interface
    /// </summary>
    public class CharacterCustomizationManager : MonoBehaviour
    {
        [Header("Customization Data")]
        [SerializeField] private CharacterCustomizationData customizationData;
        
        [Header("UI References")]
        [SerializeField] private Transform characterPreview;
        [SerializeField] private Transform categoryButtonsParent;
        [SerializeField] private Transform templateButtonsParent;
        [SerializeField] private Transform customizationOptionsParent;
        [SerializeField] private Button saveCharacterButton;
        [SerializeField] private InputField characterNameInput;
        
        [Header("Preview Configuration")]
        [SerializeField] private float previewScale = 1f;
        [SerializeField] private Vector3 previewRotation = Vector3.zero;
        
        [Header("UI Prefabs")]
        [SerializeField] private GameObject categoryButtonPrefab;
        [SerializeField] private GameObject templateButtonPrefab;
        [SerializeField] private GameObject customizationOptionPrefab;
        [SerializeField] private GameObject colorPickerPrefab;
        
        // Events
        public UnityEvent<PlayerCharacter> OnCharacterCreated;
        public UnityEvent OnCharacterCustomizationCanceled;
        
        // Current state
        private PlayerCharacter currentCharacter;
        private BaseCharacterTemplate currentTemplate;
        private CustomizationPartType currentPartType;
        private GameObject currentPreviewObject;
        private List<GameObject> currentPreviewParts = new List<GameObject>();
        
        // UI state
        private List<GameObject> categoryButtons = new List<GameObject>();
        private List<GameObject> templateButtons = new List<GameObject>();
        private List<GameObject> customizationButtons = new List<GameObject>();
        
        private void Start()
        {
            InitializeCustomizationInterface();
            SetupEventListeners();
        }
        
        /// <summary>
        /// Initializes the character customization interface
        /// </summary>
        private void InitializeCustomizationInterface()
        {
            if (customizationData == null)
            {
                Debug.LogError("Character Customization Data is not assigned!");
                return;
            }
            
            // Create character category buttons
            CreateCategoryButtons();
            
            // Create new character
            StartNewCharacter();
        }
        
        /// <summary>
        /// Sets up UI event listeners
        /// </summary>
        private void SetupEventListeners()
        {
            if (saveCharacterButton != null)
            {
                saveCharacterButton.onClick.AddListener(SaveCurrentCharacter);
            }
            
            if (characterNameInput != null)
            {
                characterNameInput.onValueChanged.AddListener(OnCharacterNameChanged);
            }
        }
        
        /// <summary>
        /// Creates category selection buttons
        /// </summary>
        private void CreateCategoryButtons()
        {
            ClearUI(categoryButtons);
            
            foreach (var category in customizationData.characterCategories)
            {
                if (category.isUnlocked)
                {
                    CreateCategoryButton(category);
                }
            }
        }
        
        /// <summary>
        /// Creates a single category button
        /// </summary>
        private void CreateCategoryButton(CharacterCategory category)
        {
            if (categoryButtonPrefab == null || categoryButtonsParent == null)
                return;
                
            GameObject buttonObj = Instantiate(categoryButtonPrefab, categoryButtonsParent);
            categoryButtons.Add(buttonObj);
            
            // Configure button
            Button button = buttonObj.GetComponent<Button>();
            if (button != null)
            {
                button.onClick.AddListener(() => SelectCategory(category));
            }
            
            // Set button text and icon
            Text buttonText = buttonObj.GetComponentInChildren<Text>();
            if (buttonText != null)
            {
                buttonText.text = category.categoryName;
            }
            
            Image buttonIcon = buttonObj.transform.Find("Icon")?.GetComponent<Image>();
            if (buttonIcon != null && category.categoryIcon != null)
            {
                buttonIcon.sprite = category.categoryIcon;
            }
        }
        
        /// <summary>
        /// Handles category selection
        /// </summary>
        private void SelectCategory(CharacterCategory category)
        {
            CreateTemplateButtons(category);
        }
        
        /// <summary>
        /// Creates character template buttons for the selected category
        /// </summary>
        private void CreateTemplateButtons(CharacterCategory category)
        {
            ClearUI(templateButtons);
            
            foreach (var template in category.characterTemplates)
            {
                if (template.isUnlocked)
                {
                    CreateTemplateButton(template);
                }
            }
        }
        
        /// <summary>
        /// Creates a single template button
        /// </summary>
        private void CreateTemplateButton(BaseCharacterTemplate template)
        {
            if (templateButtonPrefab == null || templateButtonsParent == null)
                return;
                
            GameObject buttonObj = Instantiate(templateButtonPrefab, templateButtonsParent);
            templateButtons.Add(buttonObj);
            
            // Configure button
            Button button = buttonObj.GetComponent<Button>();
            if (button != null)
            {
                button.onClick.AddListener(() => SelectTemplate(template));
            }
            
            // Set button image
            Image buttonImage = buttonObj.GetComponent<Image>();
            if (buttonImage != null && template.baseSprite != null)
            {
                buttonImage.sprite = template.baseSprite;
            }
            
            // Set button text
            Text buttonText = buttonObj.GetComponentInChildren<Text>();
            if (buttonText != null)
            {
                buttonText.text = template.templateName;
            }
        }
        
        /// <summary>
        /// Handles template selection
        /// </summary>
        private void SelectTemplate(BaseCharacterTemplate template)
        {
            currentTemplate = template;
            currentCharacter.baseTemplate = template;
            
            // Update character preview
            UpdateCharacterPreview();
            
            // Create customization options
            CreateCustomizationOptions();
        }
        
        /// <summary>
        /// Creates customization option buttons
        /// </summary>
        private void CreateCustomizationOptions()
        {
            ClearUI(customizationButtons);
            
            if (currentTemplate == null)
                return;
            
            // Create buttons for each customization slot
            foreach (var slot in currentTemplate.customizationSlots)
            {
                CreateCustomizationSection(slot.allowedPartType);
            }
        }
        
        /// <summary>
        /// Creates a customization section for a specific part type
        /// </summary>
        private void CreateCustomizationSection(CustomizationPartType partType)
        {
            var parts = customizationData.GetPartsOfType(partType);
            if (parts.Count == 0)
                return;
            
            // Create section header
            GameObject sectionHeader = new GameObject($"{partType} Section");
            sectionHeader.transform.SetParent(customizationOptionsParent);
            
            Text headerText = sectionHeader.AddComponent<Text>();
            headerText.text = partType.ToString();
            headerText.font = Resources.GetBuiltinResource<Font>("Arial.ttf");
            headerText.fontSize = 16;
            
            // Create option buttons
            foreach (var part in parts)
            {
                if (part.isUnlocked)
                {
                    CreateCustomizationOptionButton(part);
                }
            }
        }
        
        /// <summary>
        /// Creates a single customization option button
        /// </summary>
        private void CreateCustomizationOptionButton(CustomizationPart part)
        {
            if (customizationOptionPrefab == null || customizationOptionsParent == null)
                return;
                
            GameObject buttonObj = Instantiate(customizationOptionPrefab, customizationOptionsParent);
            customizationButtons.Add(buttonObj);
            
            // Configure button
            Button button = buttonObj.GetComponent<Button>();
            if (button != null)
            {
                button.onClick.AddListener(() => SelectCustomizationPart(part));
            }
            
            // Set button image
            Image buttonImage = buttonObj.GetComponent<Image>();
            if (buttonImage != null && part.partSprite != null)
            {
                buttonImage.sprite = part.partSprite;
            }
            
            // Add color picker if part can change color
            if (part.canChangeColor)
            {
                // Add color picker button or slider
                // Implementation depends on UI design
            }
        }
        
        /// <summary>
        /// Handles customization part selection
        /// </summary>
        private void SelectCustomizationPart(CustomizationPart part)
        {
            if (currentCharacter == null)
                return;
            
            // Set the part with default color
            currentCharacter.SetPart(part, part.defaultColor);
            
            // Update preview
            UpdateCharacterPreview();
        }
        
        /// <summary>
        /// Updates the character preview based on current selections
        /// </summary>
        private void UpdateCharacterPreview()
        {
            if (characterPreview == null || currentCharacter == null)
                return;
            
            // Clear existing preview
            ClearCharacterPreview();
            
            if (currentTemplate?.baseSprite != null)
            {
                // Create base character
                currentPreviewObject = new GameObject("Character Preview");
                currentPreviewObject.transform.SetParent(characterPreview);
                currentPreviewObject.transform.localPosition = Vector3.zero;
                currentPreviewObject.transform.localScale = Vector3.one * previewScale;
                currentPreviewObject.transform.localRotation = Quaternion.Euler(previewRotation);
                
                SpriteRenderer baseRenderer = currentPreviewObject.AddComponent<SpriteRenderer>();
                baseRenderer.sprite = currentTemplate.baseSprite;
                
                // Add customization parts
                foreach (var selectedPart in currentCharacter.selectedParts)
                {
                    if (selectedPart.part.partSprite != null)
                    {
                        GameObject partObj = new GameObject($"Part_{selectedPart.part.partName}");
                        partObj.transform.SetParent(currentPreviewObject.transform);
                        partObj.transform.localPosition = Vector3.zero;
                        partObj.transform.localScale = Vector3.one;
                        
                        SpriteRenderer partRenderer = partObj.AddComponent<SpriteRenderer>();
                        partRenderer.sprite = selectedPart.part.partSprite;
                        partRenderer.color = selectedPart.selectedColor;
                        partRenderer.sortingOrder = 1;
                        
                        currentPreviewParts.Add(partObj);
                    }
                }
            }
        }
        
        /// <summary>
        /// Clears the current character preview
        /// </summary>
        private void ClearCharacterPreview()
        {
            if (currentPreviewObject != null)
            {
                DestroyImmediate(currentPreviewObject);
            }
            
            foreach (var part in currentPreviewParts)
            {
                if (part != null)
                {
                    DestroyImmediate(part);
                }
            }
            currentPreviewParts.Clear();
        }
        
        /// <summary>
        /// Starts creating a new character
        /// </summary>
        public void StartNewCharacter()
        {
            currentCharacter = new PlayerCharacter
            {
                characterId = Guid.NewGuid().ToString(),
                characterName = "My Character",
                creationDate = DateTime.Now,
                lastUsed = DateTime.Now
            };
            
            if (characterNameInput != null)
            {
                characterNameInput.text = currentCharacter.characterName;
            }
        }
        
        /// <summary>
        /// Saves the current character
        /// </summary>
        private void SaveCurrentCharacter()
        {
            if (currentCharacter == null)
                return;
            
            currentCharacter.lastUsed = DateTime.Now;
            
            // Trigger character created event
            OnCharacterCreated?.Invoke(currentCharacter);
            
            // Save to persistent storage
            SaveCharacterToPersistentStorage(currentCharacter);
        }
        
        /// <summary>
        /// Handles character name changes
        /// </summary>
        private void OnCharacterNameChanged(string newName)
        {
            if (currentCharacter != null)
            {
                currentCharacter.characterName = newName;
            }
        }
        
        /// <summary>
        /// Saves character data to persistent storage
        /// </summary>
        private void SaveCharacterToPersistentStorage(PlayerCharacter character)
        {
            // TODO: Implement save system using PlayerPrefs, JSON, or cloud storage
            string characterJson = JsonUtility.ToJson(character);
            PlayerPrefs.SetString($"Character_{character.characterId}", characterJson);
            PlayerPrefs.Save();
        }
        
        /// <summary>
        /// Loads a character from persistent storage
        /// </summary>
        public PlayerCharacter LoadCharacterFromStorage(string characterId)
        {
            string characterJson = PlayerPrefs.GetString($"Character_{characterId}", "");
            if (!string.IsNullOrEmpty(characterJson))
            {
                return JsonUtility.FromJson<PlayerCharacter>(characterJson);
            }
            return null;
        }
        
        /// <summary>
        /// Clears UI elements
        /// </summary>
        private void ClearUI(List<GameObject> uiElements)
        {
            foreach (var element in uiElements)
            {
                if (element != null)
                {
                    DestroyImmediate(element);
                }
            }
            uiElements.Clear();
        }
        
        /// <summary>
        /// Cancels character customization
        /// </summary>
        public void CancelCustomization()
        {
            OnCharacterCustomizationCanceled?.Invoke();
        }
        
        private void OnDestroy()
        {
            ClearCharacterPreview();
        }
    }
}