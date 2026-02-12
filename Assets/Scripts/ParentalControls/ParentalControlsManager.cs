using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace KidsStoryGame.ParentalControls
{
    /// <summary>
    /// Manages parental controls and child safety features
    /// COPPA-compliant data handling and privacy protection
    /// </summary>
    public class ParentalControlsManager : MonoBehaviour
    {
        [Header("Security Configuration")]
        [SerializeField] private bool requireParentalPinForSettings = true;
        [SerializeField] private bool requireParentalPinForDataDeletion = true;
        [SerializeField] private int sessionTimeoutMinutes = 30;
        
        [Header("Privacy Settings")]
        [SerializeField] private bool enableDataCollection = false;
        [SerializeField] private bool enableCloudSync = false;
        [SerializeField] private bool enableAnalytics = false;
        
        [Header("Content Controls")]
        [SerializeField] private bool enableVoiceNarration = true;
        [SerializeField] private bool enableSoundEffects = true;
        [SerializeField] private bool enableBackgroundMusic = true;
        [SerializeField] private float maxDailyPlayTimeMinutes = 60f;
        
        // Events
        public UnityEvent OnParentalControlsAccessed;
        public UnityEvent OnPlayTimeExceeded;
        public UnityEvent OnParentalPinRequired;
        public UnityEvent<bool> OnDataCollectionChanged;
        
        // State management
        private bool isParentalModeActive = false;
        private DateTime lastParentalAccess = DateTime.MinValue;
        private ParentalSettings currentSettings;
        private PlayTimeTracker playTimeTracker;
        
        // Security
        private string encryptedParentalPin;
        private const string SETTINGS_KEY = "ParentalControlSettings";
        private const string PIN_KEY = "ParentalControlPin";
        
        private void Awake()
        {
            InitializeParentalControls();
            LoadSettings();
            InitializePlayTimeTracking();
        }
        
        private void Start()
        {
            ApplyCurrentSettings();
        }
        
        /// <summary>
        /// Initializes the parental controls system
        /// </summary>
        private void InitializeParentalControls()
        {
            // Load or create default settings
            currentSettings = new ParentalSettings
            {
                enableDataCollection = this.enableDataCollection,
                enableCloudSync = this.enableCloudSync,
                enableAnalytics = this.enableAnalytics,
                enableVoiceNarration = this.enableVoiceNarration,
                enableSoundEffects = this.enableSoundEffects,
                enableBackgroundMusic = this.enableBackgroundMusic,
                maxDailyPlayTimeMinutes = this.maxDailyPlayTimeMinutes,
                requirePinForSettings = this.requireParentalPinForSettings,
                requirePinForDataDeletion = this.requireParentalPinForDataDeletion,
                sessionTimeoutMinutes = this.sessionTimeoutMinutes
            };
            
            playTimeTracker = new PlayTimeTracker();
        }
        
        /// <summary>
        /// Attempts to access parental controls with PIN verification
        /// </summary>
        public void RequestParentalAccess(string enteredPin = null)
        {
            if (enteredPin == null)
            {
                // First time setup or PIN request
                OnParentalPinRequired?.Invoke();
                return;
            }
            
            if (ValidateParentalPin(enteredPin))
            {
                GrantParentalAccess();
            }
            else
            {
                Debug.LogWarning("Invalid parental PIN entered");
                // Could implement attempt limiting here
            }
        }
        
        /// <summary>
        /// Grants access to parental controls
        /// </summary>
        private void GrantParentalAccess()
        {
            isParentalModeActive = true;
            lastParentalAccess = DateTime.Now;
            OnParentalControlsAccessed?.Invoke();
        }
        
        /// <summary>
        /// Validates the entered parental PIN
        /// </summary>
        private bool ValidateParentalPin(string enteredPin)
        {
            if (string.IsNullOrEmpty(encryptedParentalPin))
            {
                // First time setup - set the PIN
                SetParentalPin(enteredPin);
                return true;
            }
            
            string encryptedEntry = EncryptPin(enteredPin);
            return encryptedEntry == encryptedParentalPin;
        }
        
        /// <summary>
        /// Sets a new parental PIN
        /// </summary>
        public void SetParentalPin(string newPin)
        {
            if (string.IsNullOrEmpty(newPin) || newPin.Length < 4)
            {
                Debug.LogError("Parental PIN must be at least 4 characters");
                return;
            }
            
            encryptedParentalPin = EncryptPin(newPin);
            PlayerPrefs.SetString(PIN_KEY, encryptedParentalPin);
            PlayerPrefs.Save();
        }
        
        /// <summary>
        /// Simple PIN encryption (in production, use proper encryption)
        /// </summary>
        private string EncryptPin(string pin)
        {
            // Simple XOR encryption for demo purposes
            // In production, use proper encryption libraries
            char[] encrypted = new char[pin.Length];
            int key = 123; // Simple key for demo
            
            for (int i = 0; i < pin.Length; i++)
            {
                encrypted[i] = (char)(pin[i] ^ key);
            }
            
            return System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(encrypted));
        }
        
        /// <summary>
        /// Checks if parental access session is still valid
        /// </summary>
        private bool IsParentalSessionValid()
        {
            if (!isParentalModeActive)
                return false;
            
            TimeSpan timeSinceAccess = DateTime.Now - lastParentalAccess;
            return timeSinceAccess.TotalMinutes < currentSettings.sessionTimeoutMinutes;
        }
        
        /// <summary>
        /// Updates parental control settings
        /// </summary>
        public void UpdateSettings(ParentalSettings newSettings)
        {
            if (!IsParentalSessionValid())
            {
                RequestParentalAccess();
                return;
            }
            
            // Store previous data collection setting to check for changes
            bool previousDataCollection = currentSettings.enableDataCollection;
            
            currentSettings = newSettings;
            ApplyCurrentSettings();
            SaveSettings();
            
            // Notify about data collection changes
            if (previousDataCollection != newSettings.enableDataCollection)
            {
                OnDataCollectionChanged?.Invoke(newSettings.enableDataCollection);
                
                if (!newSettings.enableDataCollection)
                {
                    // Clear any existing collected data if data collection is disabled
                    ClearCollectedData();
                }
            }
        }
        
        /// <summary>
        /// Applies current settings to the game systems
        /// </summary>
        private void ApplyCurrentSettings()
        {
            // Apply audio settings
            ApplyAudioSettings();
            
            // Apply privacy settings
            ApplyPrivacySettings();
            
            // Apply content settings
            ApplyContentSettings();
        }
        
        /// <summary>
        /// Applies audio-related settings
        /// </summary>
        private void ApplyAudioSettings()
        {
            // Update story manager audio settings
            var storyManager = FindObjectOfType<StoryEngine.StoryManager>();
            if (storyManager != null)
            {
                if (!currentSettings.enableVoiceNarration)
                    storyManager.ToggleNarration();
                if (!currentSettings.enableBackgroundMusic)
                    storyManager.ToggleMusic();
                if (!currentSettings.enableSoundEffects)
                    storyManager.ToggleSoundEffects();
            }
        }
        
        /// <summary>
        /// Applies privacy and data collection settings
        /// </summary>
        private void ApplyPrivacySettings()
        {
            // Configure analytics
            if (currentSettings.enableAnalytics && currentSettings.enableDataCollection)
            {
                // Enable anonymized analytics
                EnableAnonymizedAnalytics();
            }
            else
            {
                DisableAnalytics();
            }
            
            // Configure cloud sync
            if (currentSettings.enableCloudSync && currentSettings.enableDataCollection)
            {
                // Enable cloud synchronization
                EnableCloudSync();
            }
            else
            {
                DisableCloudSync();
            }
        }
        
        /// <summary>
        /// Applies content control settings
        /// </summary>
        private void ApplyContentSettings()
        {
            // Set daily play time limits
            playTimeTracker.SetDailyLimit(currentSettings.maxDailyPlayTimeMinutes);
        }
        
        /// <summary>
        /// Enables anonymized analytics with parental consent
        /// </summary>
        private void EnableAnonymizedAnalytics()
        {
            // TODO: Implement COPPA-compliant analytics
            Debug.Log("Anonymized analytics enabled with parental consent");
        }
        
        /// <summary>
        /// Disables all analytics
        /// </summary>
        private void DisableAnalytics()
        {
            // TODO: Disable analytics collection
            Debug.Log("Analytics disabled");
        }
        
        /// <summary>
        /// Enables cloud synchronization
        /// </summary>
        private void EnableCloudSync()
        {
            // TODO: Implement secure cloud sync
            Debug.Log("Cloud sync enabled");
        }
        
        /// <summary>
        /// Disables cloud synchronization
        /// </summary>
        private void DisableCloudSync()
        {
            // TODO: Disable cloud sync
            Debug.Log("Cloud sync disabled");
        }
        
        /// <summary>
        /// Clears all collected user data
        /// </summary>
        private void ClearCollectedData()
        {
            if (!IsParentalSessionValid() && currentSettings.requirePinForDataDeletion)
            {
                RequestParentalAccess();
                return;
            }
            
            // Clear all stored user data
            PlayerPrefs.DeleteAll();
            
            // Reset play time tracking
            playTimeTracker.Reset();
            
            // Clear character data
            // Clear story progress
            // Clear mini-game statistics
            
            Debug.Log("All user data cleared as requested");
        }
        
        /// <summary>
        /// Gets current play time for today
        /// </summary>
        public float GetTodaysPlayTime()
        {
            return playTimeTracker.GetTodaysPlayTime();
        }
        
        /// <summary>
        /// Gets remaining play time for today
        /// </summary>
        public float GetRemainingPlayTime()
        {
            return playTimeTracker.GetRemainingPlayTime();
        }
        
        /// <summary>
        /// Checks if daily play time limit has been exceeded
        /// </summary>
        public bool HasExceededDailyLimit()
        {
            return playTimeTracker.HasExceededDailyLimit();
        }
        
        /// <summary>
        /// Gets comprehensive usage report for parents
        /// </summary>
        public ParentalReport GetParentalReport()
        {
            if (!IsParentalSessionValid())
            {
                RequestParentalAccess();
                return null;
            }
            
            return new ParentalReport
            {
                currentSettings = currentSettings,
                playTimeData = playTimeTracker.GetPlayTimeData(),
                // Add more report data as needed
                generatedDate = DateTime.Now
            };
        }
        
        /// <summary>
        /// Loads settings from persistent storage
        /// </summary>
        private void LoadSettings()
        {
            string settingsJson = PlayerPrefs.GetString(SETTINGS_KEY, "");
            if (!string.IsNullOrEmpty(settingsJson))
            {
                currentSettings = JsonUtility.FromJson<ParentalSettings>(settingsJson);
            }
            
            encryptedParentalPin = PlayerPrefs.GetString(PIN_KEY, "");
        }
        
        /// <summary>
        /// Saves settings to persistent storage
        /// </summary>
        private void SaveSettings()
        {
            string settingsJson = JsonUtility.ToJson(currentSettings);
            PlayerPrefs.SetString(SETTINGS_KEY, settingsJson);
            PlayerPrefs.Save();
        }
        
        /// <summary>
        /// Initializes play time tracking
        /// </summary>
        private void InitializePlayTimeTracking()
        {
            playTimeTracker.OnDailyLimitExceeded += HandlePlayTimeLimitExceeded;
            playTimeTracker.SetDailyLimit(currentSettings.maxDailyPlayTimeMinutes);
        }
        
        /// <summary>
        /// Handles when daily play time limit is exceeded
        /// </summary>
        private void HandlePlayTimeLimitExceeded()
        {
            OnPlayTimeExceeded?.Invoke();
            
            // Pause or limit game functionality
            Time.timeScale = 0f;
            
            // Show appropriate UI message
            Debug.Log("Daily play time limit exceeded. Please take a break!");
        }
        
        /// <summary>
        /// Updates play time tracking
        /// </summary>
        private void Update()
        {
            if (currentSettings != null)
            {
                playTimeTracker.Update();
            }
            
            // Check session timeout
            if (isParentalModeActive && !IsParentalSessionValid())
            {
                isParentalModeActive = false;
            }
        }
        
        /// <summary>
        /// Gets current parental control settings (read-only)
        /// </summary>
        public ParentalSettings GetCurrentSettings()
        {
            return currentSettings;
        }
        
        /// <summary>
        /// Exits parental control mode
        /// </summary>
        public void ExitParentalMode()
        {
            isParentalModeActive = false;
        }
        
        private void OnDestroy()
        {
            SaveSettings();
        }
    }
}