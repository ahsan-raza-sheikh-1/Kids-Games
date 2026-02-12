using System;
using System.Collections.Generic;
using UnityEngine;

namespace KidsStoryGame.Characters
{
    /// <summary>
    /// ScriptableObject that defines customizable character parts and options
    /// </summary>
    [CreateAssetMenu(fileName = "Character Customization Data", menuName = "Kids Story Game/Character Customization")]
    public class CharacterCustomizationData : ScriptableObject
    {
        [Header("Character Categories")]
        public List<CharacterCategory> characterCategories = new List<CharacterCategory>();
        
        [Header("Customization Options")]
        public List<CustomizationPart> skinTones = new List<CustomizationPart>();
        public List<CustomizationPart> hairStyles = new List<CustomizationPart>();
        public List<CustomizationPart> eyeStyles = new List<CustomizationPart>();
        public List<CustomizationPart> clothing = new List<CustomizationPart>();
        public List<CustomizationPart> accessories = new List<CustomizationPart>();
        
        [Header("Diversity and Representation")]
        public bool includeDiverseSkinTones = true;
        public bool includeVariousHairTextures = true;
        public bool includeAccessibilityOptions = true;
        
        /// <summary>
        /// Gets all customization parts of a specific type
        /// </summary>
        public List<CustomizationPart> GetPartsOfType(CustomizationPartType partType)
        {
            switch (partType)
            {
                case CustomizationPartType.SkinTone:
                    return skinTones;
                case CustomizationPartType.Hair:
                    return hairStyles;
                case CustomizationPartType.Eyes:
                    return eyeStyles;
                case CustomizationPartType.Clothing:
                    return clothing;
                case CustomizationPartType.Accessories:
                    return accessories;
                default:
                    return new List<CustomizationPart>();
            }
        }
    }
    
    /// <summary>
    /// Represents a category of characters (animals, humans, fantasy creatures)
    /// </summary>
    [System.Serializable]
    public class CharacterCategory
    {
        public string categoryName;
        public string categoryDescription;
        public Sprite categoryIcon;
        public List<BaseCharacterTemplate> characterTemplates = new List<BaseCharacterTemplate>();
        public bool isUnlocked = true;
    }
    
    /// <summary>
    /// Base template for a character that can be customized
    /// </summary>
    [System.Serializable]
    public class BaseCharacterTemplate
    {
        public string templateName;
        public Sprite baseSprite;
        public List<CustomizationSlot> customizationSlots = new List<CustomizationSlot>();
        public Vector2 characterSize = Vector2.one;
        public bool isUnlocked = true;
    }
    
    /// <summary>
    /// Defines where customization parts can be attached on a character
    /// </summary>
    [System.Serializable]
    public class CustomizationSlot
    {
        public string slotName;
        public CustomizationPartType allowedPartType;
        public Vector2 slotPosition; // Relative position on character
        public float slotScale = 1f;
        public bool isRequired = false;
    }
    
    /// <summary>
    /// Individual customization part (hair, clothing, etc.)
    /// </summary>
    [System.Serializable]
    public class CustomizationPart
    {
        public string partName;
        public string partDescription;
        public Sprite partSprite;
        public CustomizationPartType partType;
        public Color defaultColor = Color.white;
        public bool canChangeColor = false;
        public bool isUnlocked = true;
        public List<string> unlockRequirements = new List<string>();
        
        [Header("Cultural Representation")]
        public CulturalStyle culturalStyle = CulturalStyle.Universal;
        public bool representsNeurodiversity = false;
    }
    
    /// <summary>
    /// Complete character configuration including all selected parts
    /// </summary>
    [System.Serializable]
    public class PlayerCharacter
    {
        public string characterName = "My Character";
        public string characterId;
        public BaseCharacterTemplate baseTemplate;
        public List<SelectedCustomizationPart> selectedParts = new List<SelectedCustomizationPart>();
        public DateTime creationDate;
        public DateTime lastUsed;
        
        /// <summary>
        /// Gets a selected part of a specific type
        /// </summary>
        public SelectedCustomizationPart GetPartOfType(CustomizationPartType partType)
        {
            return selectedParts.Find(part => part.part.partType == partType);
        }
        
        /// <summary>
        /// Sets or updates a customization part
        /// </summary>
        public void SetPart(CustomizationPart part, Color color)
        {
            var existingPart = GetPartOfType(part.partType);
            if (existingPart != null)
            {
                existingPart.part = part;
                existingPart.selectedColor = color;
            }
            else
            {
                selectedParts.Add(new SelectedCustomizationPart
                {
                    part = part,
                    selectedColor = color
                });
            }
        }
    }
    
    /// <summary>
    /// A customization part with its selected color
    /// </summary>
    [System.Serializable]
    public class SelectedCustomizationPart
    {
        public CustomizationPart part;
        public Color selectedColor = Color.white;
    }
    
    // Enums for character customization system
    public enum CustomizationPartType
    {
        SkinTone,
        Hair,
        Eyes,
        Clothing,
        Accessories,
        Background
    }
    
    public enum CulturalStyle
    {
        Universal,
        African,
        Asian,
        European,
        LatinAmerican,
        MiddleEastern,
        NativeAmerican,
        Oceanic
    }
}