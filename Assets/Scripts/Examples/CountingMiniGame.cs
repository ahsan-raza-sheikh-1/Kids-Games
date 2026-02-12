using UnityEngine;
using KidsStoryGame.MiniGames;
using KidsStoryGame.StoryEngine;

namespace KidsStoryGame.Examples
{
    /// <summary>
    /// Example counting mini-game implementation
    /// Teaches children basic counting skills within story context
    /// </summary>
    public class CountingMiniGame : MiniGameBase
    {
        [Header("Counting Game Configuration")]
        [SerializeField] private int targetCount = 5;
        [SerializeField] private string itemType = "butterflies";
        [SerializeField] private GameObject itemPrefab;
        [SerializeField] private Transform itemContainer;
        [SerializeField] private UnityEngine.UI.Text instructionText;
        [SerializeField] private UnityEngine.UI.Text countText;
        [SerializeField] private UnityEngine.UI.Button submitButton;
        
        // Game state
        private int currentCount = 0;
        private System.Collections.Generic.List<GameObject> spawnedItems = new System.Collections.Generic.List<GameObject>();
        
        protected override void InitializeMiniGame()
        {
            // Parse configuration from JSON
            // Reset game state
            currentCount = 0;
            ClearItems();
            
            // Set up UI
            if (instructionText != null)
            {
                instructionText.text = $"Count the {itemType}! How many do you see?";
            }
            
            UpdateCountDisplay();
            
            // Spawn items to count
            SpawnItemsToCount();
            
            // Set up submit button
            if (submitButton != null)
            {
                submitButton.onClick.AddListener(CheckAnswer);
                submitButton.interactable = false; // Enable after user makes a choice
            }
        }
        
        protected override void UpdateMiniGame()
        {
            // Check if player has made a count selection
            // Update UI animations if needed
        }
        
        protected override void CleanupMiniGame()
        {
            ClearItems();
            
            if (submitButton != null)
            {
                submitButton.onClick.RemoveAllListeners();
            }
        }
        
        protected override void ParseConfiguration(string configurationData)
        {
            if (string.IsNullOrEmpty(configurationData))
                return;
            
            try
            {
                // Simple JSON parsing for demo - in production, use JsonUtility or Newtonsoft.Json
                if (configurationData.Contains("targetNumber"))
                {
                    // Extract target number from JSON string
                    // This is a simplified parser for demo purposes
                    string[] parts = configurationData.Split(',');
                    foreach (string part in parts)
                    {
                        if (part.Contains("targetNumber"))
                        {
                            string numberPart = part.Split(':')[1].Trim().Replace("\"", "").Replace("}", "");
                            if (int.TryParse(numberPart, out int number))
                            {
                                targetCount = number;
                            }
                        }
                        else if (part.Contains("itemType"))
                        {
                            string typePart = part.Split(':')[1].Trim().Replace("\"", "").Replace("}", "");
                            itemType = typePart;
                        }
                    }
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Failed to parse counting game configuration: {e.Message}");
            }
        }
        
        protected override MiniGameType GetMiniGameType()
        {
            return MiniGameType.Counting;
        }
        
        /// <summary>
        /// Spawns items for the player to count
        /// </summary>
        private void SpawnItemsToCount()
        {
            if (itemPrefab == null || itemContainer == null)
            {
                Debug.LogError("Item prefab or container not assigned for counting game");
                return;
            }
            
            // Adjust difficulty based on settings
            int itemsToSpawn = GetItemCountForDifficulty();
            
            for (int i = 0; i < itemsToSpawn; i++)
            {
                Vector3 randomPosition = GetRandomSpawnPosition();
                GameObject spawnedItem = Instantiate(itemPrefab, randomPosition, Quaternion.identity, itemContainer);
                
                // Add click interaction to item
                var button = spawnedItem.GetComponent<UnityEngine.UI.Button>();
                if (button == null)
                {
                    button = spawnedItem.AddComponent<UnityEngine.UI.Button>();
                }
                
                button.onClick.AddListener(() => OnItemClicked(spawnedItem));
                
                spawnedItems.Add(spawnedItem);
            }
        }
        
        /// <summary>
        /// Gets the number of items to spawn based on difficulty
        /// </summary>
        private int GetItemCountForDifficulty()
        {
            switch (difficulty)
            {
                case DifficultyLevel.Easy:
                    return targetCount; // Exact count for easy mode
                case DifficultyLevel.Medium:
                    return targetCount + Random.Range(1, 3); // 1-2 extra items
                case DifficultyLevel.Hard:
                    return targetCount + Random.Range(2, 5); // 2-4 extra items
                default:
                    return targetCount;
            }
        }
        
        /// <summary>
        /// Gets a random spawn position within the container
        /// </summary>
        private Vector3 GetRandomSpawnPosition()
        {
            if (itemContainer == null)
                return Vector3.zero;
            
            RectTransform containerRect = itemContainer.GetComponent<RectTransform>();
            if (containerRect != null)
            {
                float x = Random.Range(-containerRect.rect.width / 2, containerRect.rect.width / 2);
                float y = Random.Range(-containerRect.rect.height / 2, containerRect.rect.height / 2);
                return new Vector3(x, y, 0);
            }
            
            return Vector3.zero;
        }
        
        /// <summary>
        /// Handles when an item is clicked by the player
        /// </summary>
        private void OnItemClicked(GameObject clickedItem)
        {
            if (!isGameActive || isGamePaused)
                return;
            
            // Visual feedback for clicked item
            var image = clickedItem.GetComponent<UnityEngine.UI.Image>();
            if (image != null)
            {
                // Toggle selection visual
                if (image.color == Color.white)
                {
                    image.color = Color.yellow; // Selected
                    currentCount++;
                }
                else
                {
                    image.color = Color.white; // Deselected
                    currentCount--;
                }
            }
            
            UpdateCountDisplay();
            
            // Enable submit button if player has made a selection
            if (submitButton != null && currentCount > 0)
            {
                submitButton.interactable = true;
            }
            
            IncrementAttempts();
        }
        
        /// <summary>
        /// Updates the count display UI
        /// </summary>
        private void UpdateCountDisplay()
        {
            if (countText != null)
            {
                countText.text = $"Count: {currentCount}";
            }
        }
        
        /// <summary>
        /// Checks if the player's answer is correct
        /// </summary>
        private void CheckAnswer()
        {
            bool isCorrect = currentCount == targetCount;
            
            if (isCorrect)
            {
                AddScore(100, 1f);
                EndMiniGame(true, true);
            }
            else
            {
                // Give feedback and allow retry
                ShowFeedback(false);
                
                if (attempts >= 3)
                {
                    // Show correct answer and end game
                    ShowCorrectAnswer();
                    EndMiniGame(true, false);
                }
                else
                {
                    // Allow another attempt
                    ResetForRetry();
                }
            }
        }
        
        /// <summary>
        /// Shows feedback to the player
        /// </summary>
        private void ShowFeedback(bool isCorrect)
        {
            if (instructionText != null)
            {
                if (isCorrect)
                {
                    instructionText.text = "Great job! You counted correctly!";
                    instructionText.color = Color.green;
                }
                else
                {
                    instructionText.text = $"Not quite right. Try counting again! (Attempt {attempts}/3)";
                    instructionText.color = Color.red;
                }
            }
        }
        
        /// <summary>
        /// Shows the correct answer to help the child learn
        /// </summary>
        private void ShowCorrectAnswer()
        {
            if (instructionText != null)
            {
                instructionText.text = $"The correct answer is {targetCount} {itemType}. Let's count them together: 1, 2, 3...";
                instructionText.color = Color.blue;
            }
            
            // Highlight the correct items one by one
            StartCoroutine(HighlightCorrectItems());
        }
        
        /// <summary>
        /// Highlights the correct items to show the answer
        /// </summary>
        private System.Collections.IEnumerator HighlightCorrectItems()
        {
            // Reset all items to default color
            foreach (var item in spawnedItems)
            {
                var image = item.GetComponent<UnityEngine.UI.Image>();
                if (image != null)
                {
                    image.color = Color.white;
                }
            }
            
            // Highlight correct number of items one by one
            for (int i = 0; i < targetCount && i < spawnedItems.Count; i++)
            {
                var image = spawnedItems[i].GetComponent<UnityEngine.UI.Image>();
                if (image != null)
                {
                    image.color = Color.green;
                }
                
                // Play counting sound or visual effect
                yield return new WaitForSeconds(0.8f);
            }
        }
        
        /// <summary>
        /// Resets the game for another attempt
        /// </summary>
        private void ResetForRetry()
        {
            currentCount = 0;
            
            // Reset item colors
            foreach (var item in spawnedItems)
            {
                var image = item.GetComponent<UnityEngine.UI.Image>();
                if (image != null)
                {
                    image.color = Color.white;
                }
            }
            
            UpdateCountDisplay();
            
            if (submitButton != null)
            {
                submitButton.interactable = false;
            }
            
            // Reset instruction text
            if (instructionText != null)
            {
                instructionText.text = $"Count the {itemType}! How many do you see?";
                instructionText.color = Color.black;
            }
        }
        
        /// <summary>
        /// Clears all spawned items
        /// </summary>
        private void ClearItems()
        {
            foreach (var item in spawnedItems)
            {
                if (item != null)
                {
                    Destroy(item);
                }
            }
            spawnedItems.Clear();
        }
        
        protected override void OnScoreChanged()
        {
            // Update score display if needed
            Debug.Log($"Counting game score: {currentScore}");
        }
    }
}