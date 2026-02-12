using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace KidsStoryGame.MiniGames
{
    /// <summary>
    /// Manages all mini-games within the story system
    /// </summary>
    public class MiniGameManager : MonoBehaviour
    {
        [Header("Mini-Game Prefabs")]
        [SerializeField] private GameObject countingGamePrefab;
        [SerializeField] private GameObject matchingGamePrefab;
        [SerializeField] private GameObject memoryGamePrefab;
        [SerializeField] private GameObject puzzleGamePrefab;
        [SerializeField] private GameObject drawingGamePrefab;
        
        [Header("UI Configuration")]
        [SerializeField] private Transform miniGameContainer;
        [SerializeField] private GameObject miniGameUIOverlay;
        
        [Header("Progression Settings")]
        [SerializeField] private bool trackProgress = true;
        [SerializeField] private bool unlockContentOnSuccess = true;
        
        // Events
        public UnityEvent<StoryEngine.MiniGameType> OnMiniGameStarted;
        public UnityEvent<MiniGameResult> OnMiniGameCompleted;
        public UnityEvent OnAllMiniGamesCompleted;
        
        // Current state
        private MiniGameBase currentMiniGame;
        private Dictionary<StoryEngine.MiniGameType, GameObject> miniGamePrefabs;
        private List<MiniGameResult> completedGames = new List<MiniGameResult>();
        private MiniGameProgressData progressData;
        
        // Achievement tracking
        private int totalGamesCompleted = 0;
        private int perfectGamesCount = 0;
        private Dictionary<StoryEngine.MiniGameType, int> gameTypeCompletions = new Dictionary<StoryEngine.MiniGameType, int>();
        
        private void Awake()
        {
            InitializeMiniGameManager();
            LoadProgressData();
        }
        
        /// <summary>
        /// Initializes the mini-game manager and prefab dictionary
        /// </summary>
        private void InitializeMiniGameManager()
        {
            miniGamePrefabs = new Dictionary<StoryEngine.MiniGameType, GameObject>
            {
                { StoryEngine.MiniGameType.Counting, countingGamePrefab },
                { StoryEngine.MiniGameType.Matching, matchingGamePrefab },
                { StoryEngine.MiniGameType.Memory, memoryGamePrefab },
                { StoryEngine.MiniGameType.Puzzle, puzzleGamePrefab },
                { StoryEngine.MiniGameType.Drawing, drawingGamePrefab }
            };
            
            // Initialize game type completion tracking
            foreach (StoryEngine.MiniGameType gameType in Enum.GetValues(typeof(StoryEngine.MiniGameType)))
            {
                if (gameType != StoryEngine.MiniGameType.None)
                {
                    gameTypeCompletions[gameType] = 0;
                }
            }
        }
        
        /// <summary>
        /// Starts a specific mini-game with configuration data
        /// </summary>
        public void StartMiniGame(StoryEngine.MiniGameType gameType, string configurationData = null)
        {
            if (gameType == StoryEngine.MiniGameType.None)
            {
                Debug.LogWarning("Cannot start mini-game: Invalid game type");
                return;
            }
            
            // End current mini-game if active
            if (currentMiniGame != null)
            {
                EndCurrentMiniGame(false);
            }
            
            // Get prefab for game type
            if (!miniGamePrefabs.ContainsKey(gameType) || miniGamePrefabs[gameType] == null)
            {
                Debug.LogError($"No prefab found for mini-game type: {gameType}");
                return;
            }
            
            // Instantiate mini-game
            GameObject gameInstance = Instantiate(miniGamePrefabs[gameType], miniGameContainer);
            currentMiniGame = gameInstance.GetComponent<MiniGameBase>();
            
            if (currentMiniGame == null)
            {
                Debug.LogError($"Mini-game prefab for {gameType} does not have MiniGameBase component");
                Destroy(gameInstance);
                return;
            }
            
            // Subscribe to mini-game events
            currentMiniGame.OnMiniGameCompleted.AddListener(OnMiniGameFinished);
            
            // Show mini-game UI
            if (miniGameUIOverlay != null)
            {
                miniGameUIOverlay.SetActive(true);
            }
            
            // Start the mini-game
            currentMiniGame.StartMiniGame(configurationData);
            
            OnMiniGameStarted?.Invoke(gameType);
        }
        
        /// <summary>
        /// Handles mini-game completion
        /// </summary>
        private void OnMiniGameFinished(MiniGameResult result)
        {
            if (result == null)
                return;
            
            // Track completion
            if (trackProgress)
            {
                TrackMiniGameCompletion(result);
            }
            
            // Update progress data
            UpdateProgressData(result);
            
            // Check for achievements
            CheckAchievements(result);
            
            // Unlock content if successful
            if (result.success && unlockContentOnSuccess)
            {
                UnlockContent(result.miniGameType);
            }
            
            // Clean up current mini-game
            StartCoroutine(CleanupMiniGameWithDelay(result));
            
            OnMiniGameCompleted?.Invoke(result);
        }
        
        /// <summary>
        /// Cleans up mini-game with a delay to show results
        /// </summary>
        private IEnumerator CleanupMiniGameWithDelay(MiniGameResult result)
        {
            // Wait to show results
            yield return new WaitForSeconds(2f);
            
            EndCurrentMiniGame(true);
        }
        
        /// <summary>
        /// Ends the current mini-game
        /// </summary>
        private void EndCurrentMiniGame(bool completed)
        {
            if (currentMiniGame != null)
            {
                if (!completed)
                {
                    currentMiniGame.EndMiniGame(false);
                }
                
                Destroy(currentMiniGame.gameObject);
                currentMiniGame = null;
            }
            
            // Hide mini-game UI
            if (miniGameUIOverlay != null)
            {
                miniGameUIOverlay.SetActive(false);
            }
        }
        
        /// <summary>
        /// Tracks mini-game completion statistics
        /// </summary>
        private void TrackMiniGameCompletion(MiniGameResult result)
        {
            completedGames.Add(result);
            
            if (result.completed)
            {
                totalGamesCompleted++;
                
                if (gameTypeCompletions.ContainsKey(result.miniGameType))
                {
                    gameTypeCompletions[result.miniGameType]++;
                }
                
                if (result.GetStarRating() == 3)
                {
                    perfectGamesCount++;
                }
            }
        }
        
        /// <summary>
        /// Updates persistent progress data
        /// </summary>
        private void UpdateProgressData(MiniGameResult result)
        {
            if (progressData == null)
            {
                progressData = new MiniGameProgressData();
            }
            
            progressData.totalGamesPlayed++;
            if (result.completed)
            {
                progressData.totalGamesCompleted++;
                progressData.totalScore += result.score;
                progressData.totalTimeSpent += result.timeElapsed;
            }
            
            // Update best scores
            if (!progressData.bestScores.ContainsKey(result.miniGameType) ||
                result.score > progressData.bestScores[result.miniGameType])
            {
                progressData.bestScores[result.miniGameType] = result.score;
            }
            
            SaveProgressData();
        }
        
        /// <summary>
        /// Checks for and awards achievements
        /// </summary>
        private void CheckAchievements(MiniGameResult result)
        {
            // First completion achievement
            if (totalGamesCompleted == 1)
            {
                AwardAchievement("First Success", "Complete your first mini-game!");
            }
            
            // Perfect performance achievement
            if (result.GetStarRating() == 3)
            {
                AwardAchievement("Perfect!", "Complete a mini-game with perfect score!");
            }
            
            // Multiple perfect games
            if (perfectGamesCount >= 5)
            {
                AwardAchievement("Master Player", "Achieve perfect score in 5 mini-games!");
            }
            
            // Type-specific achievements
            if (gameTypeCompletions[result.miniGameType] >= 3)
            {
                AwardAchievement($"{result.miniGameType} Expert", $"Complete 3 {result.miniGameType} games!");
            }
            
            // Marathon achievement
            if (totalGamesCompleted >= 20)
            {
                AwardAchievement("Marathon Player", "Complete 20 mini-games!");
            }
        }
        
        /// <summary>
        /// Awards an achievement to the player
        /// </summary>
        private void AwardAchievement(string title, string description)
        {
            Debug.Log($"Achievement Unlocked: {title} - {description}");
            // TODO: Implement achievement UI notification
        }
        
        /// <summary>
        /// Unlocks content based on mini-game completion
        /// </summary>
        private void UnlockContent(StoryEngine.MiniGameType gameType)
        {
            // Unlock related story content, characters, or customization options
            string contentFlag = $"mini_game_{gameType}_completed";
            
            // Set story flag for unlocking content
            var storyManager = FindObjectOfType<StoryEngine.StoryManager>();
            if (storyManager != null)
            {
                storyManager.SetStoryFlag(contentFlag, true);
            }
            
            Debug.Log($"Unlocked content for completing {gameType} mini-game");
        }
        
        /// <summary>
        /// Gets mini-game statistics
        /// </summary>
        public MiniGameStats GetMiniGameStats()
        {
            return new MiniGameStats
            {
                totalGamesPlayed = progressData?.totalGamesPlayed ?? 0,
                totalGamesCompleted = totalGamesCompleted,
                perfectGamesCount = perfectGamesCount,
                averageScore = completedGames.Count > 0 ? 
                    completedGames.FindAll(r => r.completed).ConvertAll(r => r.score).ToArray().Average() : 0,
                favoriteGameType = GetFavoriteGameType(),
                gameTypeCompletions = new Dictionary<StoryEngine.MiniGameType, int>(gameTypeCompletions)
            };
        }
        
        /// <summary>
        /// Gets the player's favorite mini-game type
        /// </summary>
        private StoryEngine.MiniGameType GetFavoriteGameType()
        {
            StoryEngine.MiniGameType favorite = StoryEngine.MiniGameType.None;
            int maxCompletions = 0;
            
            foreach (var kvp in gameTypeCompletions)
            {
                if (kvp.Value > maxCompletions)
                {
                    maxCompletions = kvp.Value;
                    favorite = kvp.Key;
                }
            }
            
            return favorite;
        }
        
        /// <summary>
        /// Pauses the current mini-game
        /// </summary>
        public void PauseCurrentMiniGame()
        {
            if (currentMiniGame != null)
            {
                currentMiniGame.PauseMiniGame();
            }
        }
        
        /// <summary>
        /// Resumes the current mini-game
        /// </summary>
        public void ResumeCurrentMiniGame()
        {
            if (currentMiniGame != null)
            {
                currentMiniGame.ResumeMiniGame();
            }
        }
        
        /// <summary>
        /// Loads progress data from persistent storage
        /// </summary>
        private void LoadProgressData()
        {
            string progressJson = PlayerPrefs.GetString("MiniGameProgress", "");
            if (!string.IsNullOrEmpty(progressJson))
            {
                progressData = JsonUtility.FromJson<MiniGameProgressData>(progressJson);
            }
            else
            {
                progressData = new MiniGameProgressData();
            }
        }
        
        /// <summary>
        /// Saves progress data to persistent storage
        /// </summary>
        private void SaveProgressData()
        {
            if (progressData != null)
            {
                string progressJson = JsonUtility.ToJson(progressData);
                PlayerPrefs.SetString("MiniGameProgress", progressJson);
                PlayerPrefs.Save();
            }
        }
        
        private void OnDestroy()
        {
            SaveProgressData();
        }
    }
    
    /// <summary>
    /// Persistent data for mini-game progress
    /// </summary>
    [System.Serializable]
    public class MiniGameProgressData
    {
        public int totalGamesPlayed = 0;
        public int totalGamesCompleted = 0;
        public int totalScore = 0;
        public float totalTimeSpent = 0f;
        public Dictionary<StoryEngine.MiniGameType, int> bestScores = new Dictionary<StoryEngine.MiniGameType, int>();
    }
    
    /// <summary>
    /// Mini-game statistics for display
    /// </summary>
    public class MiniGameStats
    {
        public int totalGamesPlayed;
        public int totalGamesCompleted;
        public int perfectGamesCount;
        public double averageScore;
        public StoryEngine.MiniGameType favoriteGameType;
        public Dictionary<StoryEngine.MiniGameType, int> gameTypeCompletions;
        
        public float CompletionRate => totalGamesPlayed > 0 ? (float)totalGamesCompleted / totalGamesPlayed : 0f;
        public float PerfectRate => totalGamesCompleted > 0 ? (float)perfectGamesCount / totalGamesCompleted : 0f;
    }
}