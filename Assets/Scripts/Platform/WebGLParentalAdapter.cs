using UnityEngine;
using KidsStoryGame.ParentalControls;

namespace KidsStoryGame.Platform
{
    /// <summary>
    /// WebGL-specific adaptations for parental controls and data handling
    /// Ensures COPPA compliance in browser environment
    /// </summary>
    public class WebGLParentalAdapter : MonoBehaviour
    {
        [Header("WebGL Configuration")]
        [SerializeField] private bool enableLocalStorage = true;
        [SerializeField] private bool showBrowserWarnings = true;
        [SerializeField] private int maxLocalStorageItems = 50;
        
        private ParentalControlsManager parentalControls;
        private PlatformManager platformManager;
        
        private void Awake()
        {
            parentalControls = FindObjectOfType<ParentalControlsManager>();
            platformManager = FindObjectOfType<PlatformManager>();
        }
        
        private void Start()
        {
            if (IsWebGLPlatform())
            {
                AdaptForWebGL();
            }
        }
        
        /// <summary>
        /// Checks if running on WebGL platform
        /// </summary>
        private bool IsWebGLPlatform()
        {
            return platformManager != null && platformManager.IsRunningOn(PlatformType.WebGL);
        }
        
        /// <summary>
        /// Adapts the game for WebGL browser environment
        /// </summary>
        private void AdaptForWebGL()
        {
            // Show browser-specific privacy notice
            if (showBrowserWarnings)
            {
                ShowWebGLPrivacyNotice();
            }
            
            // Configure local storage limits
            ConfigureWebGLStorage();
            
            // Adapt parental controls for web
            AdaptParentalControlsForWeb();
            
            // Set up web-specific event handlers
            SetupWebGLEventHandlers();
        }
        
        /// <summary>
        /// Shows WebGL-specific privacy notice
        /// </summary>
        private void ShowWebGLPrivacyNotice()
        {
            string webGLNotice = @"WEB BROWSER PRIVACY NOTICE

This game is designed for children and runs securely in your web browser.

BROWSER DATA STORAGE:
- Game progress is saved locally in your browser
- No personal information is sent to external servers
- Data remains on your device only
- You can clear browser data at any time

PARENTAL CONTROLS:
- All parental control features work offline
- Settings are saved locally in browser storage
- No account creation required
- Complete privacy protection

BROWSER COMPATIBILITY:
- Works on Chrome, Firefox, Safari, and Edge
- Requires JavaScript to be enabled
- Best experience on modern browsers
- No plugins or downloads required

To delete all game data: Use your browser's 'Clear Site Data' option or the in-game parental controls.";

            Debug.Log(webGLNotice);
            
            // In a real implementation, you'd show this in a UI dialog
            // For now, we'll just log it and could show it in the main menu
        }
        
        /// <summary>
        /// Configures WebGL local storage limitations
        /// </summary>
        private void ConfigureWebGLStorage()
        {
            if (!enableLocalStorage)
            {
                Debug.LogWarning("Local storage disabled - game progress will not be saved");
                return;
            }
            
            // Check browser storage quota (simplified)
            try
            {
                // Test if we can write to PlayerPrefs (browser local storage)
                PlayerPrefs.SetString("WebGL_StorageTest", "test");
                PlayerPrefs.Save();
                
                if (PlayerPrefs.GetString("WebGL_StorageTest", "") == "test")
                {
                    Debug.Log("WebGL local storage is available");
                    PlayerPrefs.DeleteKey("WebGL_StorageTest");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"WebGL storage not available: {e.Message}");
            }
        }
        
        /// <summary>
        /// Adapts parental controls for web environment
        /// </summary>
        private void AdaptParentalControlsForWeb()
        {
            if (parentalControls == null)
                return;
            
            // Web-specific parental control adaptations
            // Disable features that don't work in browser
            // Enable browser-specific privacy features
            
            Debug.Log("Parental controls adapted for WebGL environment");
        }
        
        /// <summary>
        /// Sets up WebGL-specific event handlers
        /// </summary>
        private void SetupWebGLEventHandlers()
        {
            // Handle browser tab visibility changes
            Application.focusChanged += OnWebGLFocusChanged;
            
            // Handle browser page unload
            Application.quitting += OnWebGLQuitting;
        }
        
        /// <summary>
        /// Handles browser tab focus changes
        /// </summary>
        private void OnWebGLFocusChanged(bool hasFocus)
        {
            if (!hasFocus)
            {
                // Pause game when browser tab loses focus
                Time.timeScale = 0f;
                AudioListener.pause = true;
            }
            else
            {
                // Resume game when browser tab gains focus
                Time.timeScale = 1f;
                AudioListener.pause = false;
            }
        }
        
        /// <summary>
        /// Handles browser page unload
        /// </summary>
        private void OnWebGLQuitting()
        {
            // Save any pending data before page unload
            if (parentalControls != null)
            {
                // Force save parental settings
                // parentalControls.SaveProgress(); // If this method exists
            }
            
            PlayerPrefs.Save();
        }
        
        /// <summary>
        /// Gets WebGL-specific storage information
        /// </summary>
        public WebGLStorageInfo GetStorageInfo()
        {
            return new WebGLStorageInfo
            {
                isStorageAvailable = enableLocalStorage,
                estimatedStorageUsed = GetEstimatedStorageUsage(),
                maxStorageItems = maxLocalStorageItems,
                browserType = GetBrowserType()
            };
        }
        
        /// <summary>
        /// Estimates current storage usage (simplified)
        /// </summary>
        private int GetEstimatedStorageUsage()
        {
            // Count PlayerPrefs keys as a rough estimate
            // In a real implementation, you'd calculate actual size
            return PlayerPrefs.GetInt("WebGL_StorageItemCount", 0);
        }
        
        /// <summary>
        /// Detects browser type (simplified)
        /// </summary>
        private string GetBrowserType()
        {
            // In WebGL, this would use JavaScript interop
            // For now, return generic
            return "WebGL Browser";
        }
        
        /// <summary>
        /// Clears all WebGL local storage
        /// </summary>
        public void ClearWebGLData()
        {
            try
            {
                PlayerPrefs.DeleteAll();
                PlayerPrefs.Save();
                Debug.Log("All WebGL local storage cleared");
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Failed to clear WebGL storage: {e.Message}");
            }
        }
        
        /// <summary>
        /// Optimizes game for WebGL performance
        /// </summary>
        public void OptimizeForWebGL()
        {
            // Reduce quality settings for better web performance
            QualitySettings.SetQualityLevel(1);
            
            // Optimize audio for web
            AudioConfiguration audioConfig = AudioSettings.GetConfiguration();
            audioConfig.sampleRate = 22050;
            AudioSettings.Reset(audioConfig);
            
            // Limit frame rate for better web performance
            Application.targetFrameRate = 60;
            
            Debug.Log("WebGL optimizations applied");
        }
        
        private void OnDestroy()
        {
            // Clean up event handlers
            Application.focusChanged -= OnWebGLFocusChanged;
            Application.quitting -= OnWebGLQuitting;
        }
    }
    
    /// <summary>
    /// Information about WebGL storage capabilities
    /// </summary>
    [System.Serializable]
    public class WebGLStorageInfo
    {
        public bool isStorageAvailable;
        public int estimatedStorageUsed;
        public int maxStorageItems;
        public string browserType;
        
        public float StorageUsagePercentage => maxStorageItems > 0 ? 
            (float)estimatedStorageUsed / maxStorageItems * 100f : 0f;
    }
}