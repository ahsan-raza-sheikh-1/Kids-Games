using UnityEngine;

namespace KidsStoryGame.Platform
{
    /// <summary>
    /// Handles platform-specific functionality and optimizations
    /// Provides unified interface for different deployment targets
    /// </summary>
    public class PlatformManager : MonoBehaviour
    {
        [Header("Platform Detection")]
        [SerializeField] private bool autoDetectPlatform = true;
        [SerializeField] private PlatformType forcePlatformType = PlatformType.Auto;
        
        [Header("WebGL Configuration")]
        [SerializeField] private bool enableWebGLOptimizations = true;
        [SerializeField] private bool useWebGLInput = true;
        [SerializeField] private int webGLMemoryLimit = 512; // MB
        
        [Header("Mobile Configuration")]
        [SerializeField] private bool enableMobileOptimizations = true;
        [SerializeField] private bool enableTouchInput = true;
        [SerializeField] private float mobileUIScale = 1.2f;
        
        [Header("Desktop Configuration")]
        [SerializeField] private bool enableDesktopFeatures = true;
        [SerializeField] private bool enableKeyboardShortcuts = true;
        [SerializeField] private bool enableFullscreenToggle = true;
        
        // Current platform info
        private PlatformType currentPlatform;
        private bool isInitialized = false;
        
        // Platform capabilities
        public bool SupportsTouchInput { get; private set; }
        public bool SupportsFileSystem { get; private set; }
        public bool SupportsNotifications { get; private set; }
        public bool RequiresWebOptimization { get; private set; }
        
        private void Awake()
        {
            InitializePlatform();
        }
        
        private void Start()
        {
            ApplyPlatformSettings();
        }
        
        /// <summary>
        /// Initializes platform detection and capabilities
        /// </summary>
        private void InitializePlatform()
        {
            if (isInitialized)
                return;
            
            // Detect current platform
            currentPlatform = DetectCurrentPlatform();
            
            // Set platform capabilities
            SetPlatformCapabilities();
            
            // Apply platform-specific optimizations
            ApplyPlatformOptimizations();
            
            isInitialized = true;
            
            Debug.Log($"Platform Manager initialized for: {currentPlatform}");
        }
        
        /// <summary>
        /// Detects the current runtime platform
        /// </summary>
        private PlatformType DetectCurrentPlatform()
        {
            if (!autoDetectPlatform && forcePlatformType != PlatformType.Auto)
            {
                return forcePlatformType;
            }
            
#if UNITY_WEBGL && !UNITY_EDITOR
            return PlatformType.WebGL;
#elif (UNITY_IOS || UNITY_ANDROID) && !UNITY_EDITOR
            return PlatformType.Mobile;
#elif (UNITY_STANDALONE_WIN || UNITY_STANDALONE_OSX || UNITY_STANDALONE_LINUX) && !UNITY_EDITOR
            return PlatformType.Desktop;
#else
            // Editor or unknown platform
            return PlatformType.Desktop; // Default to desktop for editor
#endif
        }
        
        /// <summary>
        /// Sets platform-specific capabilities
        /// </summary>
        private void SetPlatformCapabilities()
        {
            switch (currentPlatform)
            {
                case PlatformType.WebGL:
                    SupportsTouchInput = SystemInfo.deviceType == DeviceType.Handheld;
                    SupportsFileSystem = false; // Limited file system access
                    SupportsNotifications = false;
                    RequiresWebOptimization = true;
                    break;
                    
                case PlatformType.Mobile:
                    SupportsTouchInput = true;
                    SupportsFileSystem = true; // Limited to app sandbox
                    SupportsNotifications = true;
                    RequiresWebOptimization = false;
                    break;
                    
                case PlatformType.Desktop:
                    SupportsTouchInput = SystemInfo.deviceType == DeviceType.Handheld;
                    SupportsFileSystem = true;
                    SupportsNotifications = true;
                    RequiresWebOptimization = false;
                    break;
            }
        }
        
        /// <summary>
        /// Applies platform-specific optimizations
        /// </summary>
        private void ApplyPlatformOptimizations()
        {
            switch (currentPlatform)
            {
                case PlatformType.WebGL:
                    ApplyWebGLOptimizations();
                    break;
                    
                case PlatformType.Mobile:
                    ApplyMobileOptimizations();
                    break;
                    
                case PlatformType.Desktop:
                    ApplyDesktopOptimizations();
                    break;
            }
        }
        
        /// <summary>
        /// Applies WebGL-specific optimizations
        /// </summary>
        private void ApplyWebGLOptimizations()
        {
            if (!enableWebGLOptimizations)
                return;
            
            // Reduce quality settings for better web performance
            QualitySettings.SetQualityLevel(1); // Medium quality
            
            // Optimize audio settings
            AudioConfiguration audioConfig = AudioSettings.GetConfiguration();
            audioConfig.sampleRate = 22050; // Lower sample rate for web
            AudioSettings.Reset(audioConfig);
            
            // Set frame rate for better web performance
            Application.targetFrameRate = 60;
            
            // Enable V-Sync for smoother experience
            QualitySettings.vSyncCount = 1;
            
            Debug.Log("WebGL optimizations applied");
        }
        
        /// <summary>
        /// Applies mobile-specific optimizations
        /// </summary>
        private void ApplyMobileOptimizations()
        {
            if (!enableMobileOptimizations)
                return;
            
            // Set quality for mobile devices
            QualitySettings.SetQualityLevel(2); // Good quality
            
            // Optimize for battery life
            Application.targetFrameRate = 60;
            
            // Enable mobile-specific input
            if (enableTouchInput)
            {
                Input.multiTouchEnabled = true;
            }
            
            // Scale UI for mobile
            var canvasScaler = FindObjectOfType<UnityEngine.UI.CanvasScaler>();
            if (canvasScaler != null)
            {
                canvasScaler.scaleFactor = mobileUIScale;
            }
            
            Debug.Log("Mobile optimizations applied");
        }
        
        /// <summary>
        /// Applies desktop-specific optimizations
        /// </summary>
        private void ApplyDesktopOptimizations()
        {
            if (!enableDesktopFeatures)
                return;
            
            // Set high quality for desktop
            QualitySettings.SetQualityLevel(QualitySettings.names.Length - 1);
            
            // Unlock frame rate for desktop
            Application.targetFrameRate = -1;
            
            // Enable fullscreen toggle if requested
            if (enableFullscreenToggle)
            {
                // Listen for Alt+Enter to toggle fullscreen
                StartCoroutine(FullscreenToggleCoroutine());
            }
            
            Debug.Log("Desktop optimizations applied");
        }
        
        /// <summary>
        /// Handles fullscreen toggle for desktop
        /// </summary>
        private System.Collections.IEnumerator FullscreenToggleCoroutine()
        {
            while (true)
            {
                if (Input.GetKey(KeyCode.LeftAlt) && Input.GetKeyDown(KeyCode.Return))
                {
                    Screen.fullScreen = !Screen.fullScreen;
                }
                yield return null;
            }
        }
        
        /// <summary>
        /// Applies platform-specific UI and input settings
        /// </summary>
        private void ApplyPlatformSettings()
        {
            // Configure input system based on platform
            ConfigureInputSystem();
            
            // Configure UI scaling
            ConfigureUIScaling();
            
            // Configure audio system
            ConfigureAudioSystem();
        }
        
        /// <summary>
        /// Configures input system for current platform
        /// </summary>
        private void ConfigureInputSystem()
        {
            // Enable appropriate input methods
            if (SupportsTouchInput && currentPlatform == PlatformType.Mobile)
            {
                // Configure touch input
                Input.multiTouchEnabled = true;
                Input.simulateMouseWithTouches = true;
            }
            
            if (currentPlatform == PlatformType.Desktop && enableKeyboardShortcuts)
            {
                // Enable keyboard shortcuts
                Debug.Log("Keyboard shortcuts enabled");
            }
        }
        
        /// <summary>
        /// Configures UI scaling for current platform
        /// </summary>
        private void ConfigureUIScaling()
        {
            var canvasScaler = FindObjectOfType<UnityEngine.UI.CanvasScaler>();
            if (canvasScaler == null)
                return;
            
            switch (currentPlatform)
            {
                case PlatformType.WebGL:
                    // Responsive scaling for web
                    canvasScaler.uiScaleMode = UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
                    canvasScaler.referenceResolution = new Vector2(1920, 1080);
                    canvasScaler.screenMatchMode = UnityEngine.UI.CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
                    canvasScaler.matchWidthOrHeight = 0.5f;
                    break;
                    
                case PlatformType.Mobile:
                    // Mobile-optimized scaling
                    canvasScaler.uiScaleMode = UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
                    canvasScaler.referenceResolution = new Vector2(1080, 1920);
                    canvasScaler.screenMatchMode = UnityEngine.UI.CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
                    canvasScaler.matchWidthOrHeight = 0.5f;
                    break;
                    
                case PlatformType.Desktop:
                    // Desktop scaling
                    canvasScaler.uiScaleMode = UnityEngine.UI.CanvasScaler.ScaleMode.ScaleWithScreenSize;
                    canvasScaler.referenceResolution = new Vector2(1920, 1080);
                    canvasScaler.screenMatchMode = UnityEngine.UI.CanvasScaler.ScreenMatchMode.MatchWidthOrHeight;
                    canvasScaler.matchWidthOrHeight = 1f; // Match width for desktop
                    break;
            }
        }
        
        /// <summary>
        /// Configures audio system for current platform
        /// </summary>
        private void ConfigureAudioSystem()
        {
            AudioConfiguration config = AudioSettings.GetConfiguration();
            
            switch (currentPlatform)
            {
                case PlatformType.WebGL:
                    // Optimize audio for web
                    config.sampleRate = 22050;
                    config.speakerMode = AudioSpeakerMode.Stereo;
                    break;
                    
                case PlatformType.Mobile:
                    // Mobile audio optimization
                    config.sampleRate = 44100;
                    config.speakerMode = AudioSpeakerMode.Stereo;
                    break;
                    
                case PlatformType.Desktop:
                    // High quality audio for desktop
                    config.sampleRate = 48000;
                    config.speakerMode = AudioSpeakerMode.Stereo;
                    break;
            }
            
            AudioSettings.Reset(config);
        }
        
        /// <summary>
        /// Gets the current platform type
        /// </summary>
        public PlatformType GetCurrentPlatform()
        {
            return currentPlatform;
        }
        
        /// <summary>
        /// Checks if running on a specific platform
        /// </summary>
        public bool IsRunningOn(PlatformType platform)
        {
            return currentPlatform == platform;
        }
        
        /// <summary>
        /// Gets platform-specific save path
        /// </summary>
        public string GetSavePath()
        {
            switch (currentPlatform)
            {
                case PlatformType.WebGL:
                    return ""; // Use PlayerPrefs for web
                    
                case PlatformType.Mobile:
                case PlatformType.Desktop:
                    return Application.persistentDataPath;
                    
                default:
                    return Application.persistentDataPath;
            }
        }
        
        /// <summary>
        /// Optimizes memory usage for current platform
        /// </summary>
        public void OptimizeMemoryUsage()
        {
            if (RequiresWebOptimization)
            {
                // Force garbage collection for web
                System.GC.Collect();
                
                // Unload unused assets
                Resources.UnloadUnusedAssets();
            }
        }
    }
    
    /// <summary>
    /// Platform types supported by the game
    /// </summary>
    public enum PlatformType
    {
        Auto,
        WebGL,
        Mobile,
        Desktop
    }
}