using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace KidsStoryGame.MiniGames
{
    /// <summary>
    /// Base class for all mini-games in the story system
    /// </summary>
    public abstract class MiniGameBase : MonoBehaviour
    {
        [Header("Mini-Game Configuration")]
        [SerializeField] protected string miniGameTitle;
        [SerializeField] protected string instructions;
        [SerializeField] protected float timeLimit = 60f;
        [SerializeField] protected bool hasTimeLimit = false;
        [SerializeField] protected int targetScore = 100;
        
        [Header("Difficulty Settings")]
        [SerializeField] protected DifficultyLevel difficulty = DifficultyLevel.Easy;
        [SerializeField] protected bool adaptiveDifficulty = true;
        
        [Header("Audio")]
        [SerializeField] protected AudioClip successSound;
        [SerializeField] protected AudioClip failureSound;
        [SerializeField] protected AudioClip backgroundMusic;
        
        // Events
        public UnityEvent OnMiniGameStarted;
        public UnityEvent<MiniGameResult> OnMiniGameCompleted;
        public UnityEvent OnMiniGamePaused;
        public UnityEvent OnMiniGameResumed;
        
        // Game state
        protected bool isGameActive = false;
        protected bool isGamePaused = false;
        protected float elapsedTime = 0f;
        protected int currentScore = 0;
        protected int attempts = 0;
        protected MiniGameResult gameResult;
        
        // Components
        protected AudioSource audioSource;
        
        protected virtual void Awake()
        {
            audioSource = GetComponent<AudioSource>();
            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
        }
        
        /// <summary>
        /// Starts the mini-game with optional configuration data
        /// </summary>
        public virtual void StartMiniGame(string configurationData = null)
        {
            if (isGameActive)
                return;
            
            // Parse configuration if provided
            if (!string.IsNullOrEmpty(configurationData))
            {
                ParseConfiguration(configurationData);
            }
            
            // Initialize game state
            isGameActive = true;
            isGamePaused = false;
            elapsedTime = 0f;
            currentScore = 0;
            attempts = 0;
            
            // Play background music
            if (backgroundMusic != null && audioSource != null)
            {
                audioSource.clip = backgroundMusic;
                audioSource.loop = true;
                audioSource.Play();
            }
            
            // Initialize specific mini-game
            InitializeMiniGame();
            
            // Start game timer if applicable
            if (hasTimeLimit)
            {
                StartCoroutine(GameTimer());
            }
            
            OnMiniGameStarted?.Invoke();
        }
        
        /// <summary>
        /// Ends the mini-game and returns result
        /// </summary>
        public virtual void EndMiniGame(bool completed, bool success = false)
        {
            if (!isGameActive)
                return;
            
            isGameActive = false;
            isGamePaused = false;
            
            // Stop background music
            if (audioSource != null && audioSource.isPlaying)
            {
                audioSource.Stop();
            }
            
            // Create result
            gameResult = new MiniGameResult
            {
                miniGameType = GetMiniGameType(),
                completed = completed,
                success = success,
                score = currentScore,
                timeElapsed = elapsedTime,
                attempts = attempts,
                difficulty = difficulty
            };
            
            // Play result sound
            if (success && successSound != null)
            {
                audioSource.PlayOneShot(successSound);
            }
            else if (!success && failureSound != null)
            {
                audioSource.PlayOneShot(failureSound);
            }
            
            // Cleanup
            CleanupMiniGame();
            
            OnMiniGameCompleted?.Invoke(gameResult);
        }
        
        /// <summary>
        /// Pauses the mini-game
        /// </summary>
        public virtual void PauseMiniGame()
        {
            if (!isGameActive || isGamePaused)
                return;
            
            isGamePaused = true;
            Time.timeScale = 0f;
            
            if (audioSource != null && audioSource.isPlaying)
            {
                audioSource.Pause();
            }
            
            OnMiniGamePaused?.Invoke();
        }
        
        /// <summary>
        /// Resumes the mini-game
        /// </summary>
        public virtual void ResumeMiniGame()
        {
            if (!isGameActive || !isGamePaused)
                return;
            
            isGamePaused = false;
            Time.timeScale = 1f;
            
            if (audioSource != null && backgroundMusic != null)
            {
                audioSource.UnPause();
            }
            
            OnMiniGameResumed?.Invoke();
        }
        
        /// <summary>
        /// Updates game time and checks for time limit
        /// </summary>
        protected virtual void Update()
        {
            if (isGameActive && !isGamePaused)
            {
                elapsedTime += Time.deltaTime;
                UpdateMiniGame();
            }
        }
        
        /// <summary>
        /// Game timer coroutine for time-limited games
        /// </summary>
        protected virtual IEnumerator GameTimer()
        {
            while (isGameActive && elapsedTime < timeLimit)
            {
                yield return null;
            }
            
            if (isGameActive)
            {
                EndMiniGame(false, false); // Time's up!
            }
        }
        
        /// <summary>
        /// Adds to the current score with optional multiplier
        /// </summary>
        protected virtual void AddScore(int points, float multiplier = 1f)
        {
            currentScore += Mathf.RoundToInt(points * multiplier);
            OnScoreChanged();
        }
        
        /// <summary>
        /// Increments attempt counter
        /// </summary>
        protected virtual void IncrementAttempts()
        {
            attempts++;
        }
        
        // Abstract methods to be implemented by specific mini-games
        protected abstract void InitializeMiniGame();
        protected abstract void UpdateMiniGame();
        protected abstract void CleanupMiniGame();
        protected abstract void ParseConfiguration(string configurationData);
        protected abstract StoryEngine.MiniGameType GetMiniGameType();
        
        // Virtual methods that can be overridden
        protected virtual void OnScoreChanged() { }
        
        /// <summary>
        /// Adjusts difficulty based on player performance
        /// </summary>
        protected virtual void AdjustDifficulty()
        {
            if (!adaptiveDifficulty)
                return;
            
            // Simple adaptive difficulty logic
            if (attempts > 3 && currentScore < targetScore * 0.5f)
            {
                // Make it easier
                if (difficulty == DifficultyLevel.Hard)
                    difficulty = DifficultyLevel.Medium;
                else if (difficulty == DifficultyLevel.Medium)
                    difficulty = DifficultyLevel.Easy;
            }
            else if (currentScore >= targetScore && attempts <= 1)
            {
                // Make it harder
                if (difficulty == DifficultyLevel.Easy)
                    difficulty = DifficultyLevel.Medium;
                else if (difficulty == DifficultyLevel.Medium)
                    difficulty = DifficultyLevel.Hard;
            }
        }
        
        /// <summary>
        /// Gets remaining time if time limit is enabled
        /// </summary>
        public float GetRemainingTime()
        {
            if (!hasTimeLimit)
                return float.MaxValue;
            
            return Mathf.Max(0f, timeLimit - elapsedTime);
        }
        
        /// <summary>
        /// Gets current game progress as percentage
        /// </summary>
        public virtual float GetProgress()
        {
            return Mathf.Clamp01((float)currentScore / targetScore);
        }
    }
    
    /// <summary>
    /// Result data for completed mini-games
    /// </summary>
    [System.Serializable]
    public class MiniGameResult
    {
        public StoryEngine.MiniGameType miniGameType;
        public bool completed;
        public bool success;
        public int score;
        public float timeElapsed;
        public int attempts;
        public DifficultyLevel difficulty;
        public DateTime completionTime;
        
        public MiniGameResult()
        {
            completionTime = DateTime.Now;
        }
        
        /// <summary>
        /// Gets a star rating (1-3) based on performance
        /// </summary>
        public int GetStarRating()
        {
            if (!success)
                return 0;
            
            if (attempts == 1 && timeElapsed < 30f)
                return 3; // Perfect performance
            else if (attempts <= 2 && timeElapsed < 60f)
                return 2; // Good performance
            else
                return 1; // Completed but could improve
        }
    }
    
    /// <summary>
    /// Difficulty levels for mini-games
    /// </summary>
    public enum DifficultyLevel
    {
        Easy,
        Medium,
        Hard
    }
}