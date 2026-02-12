using System;
using System.Collections.Generic;
using UnityEngine;

namespace KidsStoryGame.ParentalControls
{
    /// <summary>
    /// Settings for parental controls and privacy management
    /// </summary>
    [System.Serializable]
    public class ParentalSettings
    {
        [Header("Privacy and Data")]
        public bool enableDataCollection = false;
        public bool enableCloudSync = false;
        public bool enableAnalytics = false;
        
        [Header("Audio Controls")]
        public bool enableVoiceNarration = true;
        public bool enableSoundEffects = true;
        public bool enableBackgroundMusic = true;
        public float masterVolume = 1f;
        
        [Header("Content Controls")]
        public float maxDailyPlayTimeMinutes = 60f;
        public bool enableTimeWarnings = true;
        public List<string> blockedStoryCategories = new List<string>();
        
        [Header("Security")]
        public bool requirePinForSettings = true;
        public bool requirePinForDataDeletion = true;
        public int sessionTimeoutMinutes = 30;
        
        [Header("Accessibility")]
        public bool useDyslexiaFriendlyFont = false;
        public bool useColorblindFriendlyMode = false;
        public bool useHighContrastMode = false;
        public float textSize = 1f;
        
        [Header("Educational Preferences")]
        public List<string> focusEducationalTags = new List<string>();
        public bool emphasizeEducationalContent = true;
        public bool showProgressReports = true;
    }
    
    /// <summary>
    /// Tracks play time and enforces daily limits
    /// </summary>
    [System.Serializable]
    public class PlayTimeTracker
    {
        public event System.Action OnDailyLimitExceeded;
        public event System.Action<float> OnPlayTimeWarning; // Warning at 80% of limit
        
        private float dailyLimitMinutes = 60f;
        private float todaysPlayTimeMinutes = 0f;
        private DateTime lastPlayDate = DateTime.Today;
        private bool hasWarningBeenShown = false;
        private bool hasLimitBeenExceeded = false;
        
        private const string PLAY_TIME_KEY = "DailyPlayTime";
        private const string PLAY_DATE_KEY = "LastPlayDate";
        
        public PlayTimeTracker()
        {
            LoadPlayTimeData();
        }
        
        /// <summary>
        /// Sets the daily play time limit
        /// </summary>
        public void SetDailyLimit(float limitMinutes)
        {
            dailyLimitMinutes = limitMinutes;
        }
        
        /// <summary>
        /// Updates play time tracking
        /// </summary>
        public void Update()
        {
            // Check if it's a new day
            if (DateTime.Today != lastPlayDate)
            {
                ResetDailyTracking();
            }
            
            // Add time to today's total
            todaysPlayTimeMinutes += Time.deltaTime / 60f;
            
            // Check for warnings and limits
            CheckPlayTimeLimits();
            
            // Save updated play time
            SavePlayTimeData();
        }
        
        /// <summary>
        /// Checks play time limits and triggers warnings/limits
        /// </summary>
        private void CheckPlayTimeLimits()
        {
            float percentage = todaysPlayTimeMinutes / dailyLimitMinutes;
            
            // Show warning at 80% of limit
            if (percentage >= 0.8f && !hasWarningBeenShown)
            {
                hasWarningBeenShown = true;
                OnPlayTimeWarning?.Invoke(GetRemainingPlayTime());
            }
            
            // Trigger limit exceeded
            if (percentage >= 1f && !hasLimitBeenExceeded)
            {
                hasLimitBeenExceeded = true;
                OnDailyLimitExceeded?.Invoke();
            }
        }
        
        /// <summary>
        /// Resets daily tracking for a new day
        /// </summary>
        private void ResetDailyTracking()
        {
            todaysPlayTimeMinutes = 0f;
            lastPlayDate = DateTime.Today;
            hasWarningBeenShown = false;
            hasLimitBeenExceeded = false;
        }
        
        /// <summary>
        /// Gets today's total play time in minutes
        /// </summary>
        public float GetTodaysPlayTime()
        {
            return todaysPlayTimeMinutes;
        }
        
        /// <summary>
        /// Gets remaining play time for today
        /// </summary>
        public float GetRemainingPlayTime()
        {
            return Mathf.Max(0f, dailyLimitMinutes - todaysPlayTimeMinutes);
        }
        
        /// <summary>
        /// Checks if daily limit has been exceeded
        /// </summary>
        public bool HasExceededDailyLimit()
        {
            return todaysPlayTimeMinutes >= dailyLimitMinutes;
        }
        
        /// <summary>
        /// Gets comprehensive play time data
        /// </summary>
        public PlayTimeData GetPlayTimeData()
        {
            return new PlayTimeData
            {
                todaysPlayTimeMinutes = todaysPlayTimeMinutes,
                dailyLimitMinutes = dailyLimitMinutes,
                remainingTimeMinutes = GetRemainingPlayTime(),
                hasExceededLimit = HasExceededDailyLimit(),
                playDate = lastPlayDate
            };
        }
        
        /// <summary>
        /// Resets all play time data
        /// </summary>
        public void Reset()
        {
            todaysPlayTimeMinutes = 0f;
            lastPlayDate = DateTime.Today;
            hasWarningBeenShown = false;
            hasLimitBeenExceeded = false;
            SavePlayTimeData();
        }
        
        /// <summary>
        /// Loads play time data from storage
        /// </summary>
        private void LoadPlayTimeData()
        {
            todaysPlayTimeMinutes = PlayerPrefs.GetFloat(PLAY_TIME_KEY, 0f);
            
            string dateString = PlayerPrefs.GetString(PLAY_DATE_KEY, DateTime.Today.ToBinary().ToString());
            if (long.TryParse(dateString, out long dateBinary))
            {
                lastPlayDate = DateTime.FromBinary(dateBinary);
            }
            else
            {
                lastPlayDate = DateTime.Today;
            }
            
            // If it's a new day, reset tracking
            if (DateTime.Today != lastPlayDate)
            {
                ResetDailyTracking();
            }
        }
        
        /// <summary>
        /// Saves play time data to storage
        /// </summary>
        private void SavePlayTimeData()
        {
            PlayerPrefs.SetFloat(PLAY_TIME_KEY, todaysPlayTimeMinutes);
            PlayerPrefs.SetString(PLAY_DATE_KEY, lastPlayDate.ToBinary().ToString());
            PlayerPrefs.Save();
        }
    }
    
    /// <summary>
    /// Data structure for play time information
    /// </summary>
    [System.Serializable]
    public class PlayTimeData
    {
        public float todaysPlayTimeMinutes;
        public float dailyLimitMinutes;
        public float remainingTimeMinutes;
        public bool hasExceededLimit;
        public DateTime playDate;
        
        public float PlayTimePercentage => dailyLimitMinutes > 0 ? todaysPlayTimeMinutes / dailyLimitMinutes : 0f;
        public TimeSpan TodaysPlayTimeSpan => TimeSpan.FromMinutes(todaysPlayTimeMinutes);
        public TimeSpan RemainingTimeSpan => TimeSpan.FromMinutes(remainingTimeMinutes);
    }
    
    /// <summary>
    /// Comprehensive report for parents
    /// </summary>
    [System.Serializable]
    public class ParentalReport
    {
        public ParentalSettings currentSettings;
        public PlayTimeData playTimeData;
        public DateTime generatedDate;
        
        // Additional report data can be added here
        public List<string> recentlyPlayedStories = new List<string>();
        public List<string> completedMiniGames = new List<string>();
        public int totalCharactersCreated = 0;
        public float averageDailyPlayTime = 0f;
        public List<string> educationalTopicsExplored = new List<string>();
    }
    
    /// <summary>
    /// Privacy compliance helper for COPPA requirements
    /// </summary>
    public static class PrivacyCompliance
    {
        /// <summary>
        /// Generates a COPPA-compliant privacy notice
        /// </summary>
        public static string GeneratePrivacyNotice()
        {
            return @"PRIVACY NOTICE FOR PARENTS

This app is designed for children and follows COPPA (Children's Online Privacy Protection Act) guidelines.

INFORMATION WE COLLECT:
- We do not collect personal information from children without parental consent
- Only anonymized usage data may be collected if you provide consent
- No advertising or tracking cookies are used

PARENTAL CONTROLS:
- Parents can disable all data collection
- Parents can delete all stored data at any time
- Parents can set daily play time limits
- Parents can control audio and content settings

YOUR RIGHTS:
- You have the right to review any data collected
- You have the right to delete all data
- You have the right to disable data collection
- You can contact us with privacy questions

For questions about privacy, please contact our support team.";
        }
        
        /// <summary>
        /// Checks if app is COPPA compliant based on current settings
        /// </summary>
        public static bool IsCompliant(ParentalSettings settings)
        {
            // Basic compliance checks
            bool hasParentalControls = settings.requirePinForSettings;
            bool allowsDataDeletion = settings.requirePinForDataDeletion;
            bool limitedDataCollection = !settings.enableDataCollection || !settings.enableAnalytics;
            
            return hasParentalControls && allowsDataDeletion && limitedDataCollection;
        }
        
        /// <summary>
        /// Gets compliance recommendations
        /// </summary>
        public static List<string> GetComplianceRecommendations(ParentalSettings settings)
        {
            var recommendations = new List<string>();
            
            if (!settings.requirePinForSettings)
            {
                recommendations.Add("Enable PIN requirement for settings access");
            }
            
            if (!settings.requirePinForDataDeletion)
            {
                recommendations.Add("Enable PIN requirement for data deletion");
            }
            
            if (settings.enableDataCollection && settings.enableAnalytics)
            {
                recommendations.Add("Consider limiting data collection for enhanced privacy");
            }
            
            if (settings.maxDailyPlayTimeMinutes > 120)
            {
                recommendations.Add("Consider setting a lower daily play time limit");
            }
            
            return recommendations;
        }
    }
}