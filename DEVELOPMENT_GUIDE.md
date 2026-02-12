# Development Setup Guide

## Prerequisites

### Software Requirements
- **Unity 2022.3 LTS or newer**
- **Visual Studio Code** with C# extension
- **Git** for version control

### Platform-Specific Requirements

#### iOS Development
- **macOS** (required for iOS builds)
- **Xcode 14+** 
- **Apple Developer Account** (for device testing and App Store deployment)

#### WebGL Development
- **Browser DevTools** for debugging
- **Unity Console** for runtime errors
- **Performance Profiler** for optimization

### 3. Project Settings Configuration

#### Player Settings (Edit → Project Settings → Player)

**Common Settings:**
- Company Name: Your company name
- Product Name: Interactive Kids Storytelling Game
- Version: 1.0.0
- Bundle Version Code: 1

**WebGL Settings:**
- Memory Size: 256 MB (optimized for kids' content)
- Exception Support: Explicitly Thrown Exceptions Only
- Compression Format: Gzip
- Name Files As Hashes: Disabled (for easier debugging)
- Data Caching: Enabled
- Decompression Fallback: Enabled

**iOS Settings:**
- Bundle Identifier: com.yourcompany.kidsstory
- Minimum iOS Version: 12.0
- Target Device Family: Universal
- Camera Usage Description: "Used for character avatar photos"
- Microphone Usage Description: "Used for voice interaction features"

**Android Settings:**
- Package Name: com.yourcompany.kidsstory
- Minimum API Level: Android 7.0 (API level 24)
- Target API Level: Android 14 (API level 34)
- Scripting Backend: IL2CPP
- Target Architectures: ARM64 (recommended for Play Store)

#### XR Plug-in Management (Optional)
- Enable providers if planning AR features

### 3. Build Settings

#### WebGL Build Configuration
1. Switch platform to WebGL (File → Build Settings)
2. Configure Player Settings as above
3. Build Settings:
   - Development Build: ✅ (for testing)
   - Autoconnect Profiler: ❌ (for final builds)
   - Deep Profiling: ❌ (performance impact)
4. Build and test in browser

#### iOS Build Configuration
1. Switch platform to iOS (File → Build Settings)
2. Add all scenes to build
3. Configure signing in Xcode project after build

#### Android Build Configuration
1. Switch platform to Android
2. Add all scenes to build
3. Generate or assign keystore for release builds

#### Desktop Build Configuration
1. Switch to target platform (Windows/Mac/Linux)
2. Configure resolution and fullscreen settings
3. Build executable for distribution

## Development Workflow

### Scene Organization
```
Assets/Scenes/
├── MainMenu.unity         # Main game menu
├── StorySelection.unity   # Story library
├── CharacterCreation.unity # Character customization
├── StoryPlayback.unity    # Main story experience
├── MiniGameScene.unity    # Mini-game container
└── ParentalControls.unity # Settings and controls
```

### Script Organization
All scripts follow the namespace pattern:
```csharp
namespace KidsStoryGame.[SystemName]
{
    // Script content
}
```

### Asset Organization
```
Assets/
├── Art/
│   ├── Characters/
│   ├── Backgrounds/
│   ├── UI/
│   └── Icons/
├── Audio/
│   ├── Narration/
│   ├── Music/
│   └── SFX/
├── Fonts/
│   ├── Standard/
│   └── Dyslexia-Friendly/
├── Stories/
│   ├── StoryData/
│   └── Localization/
└── Scripts/
    ├── StoryEngine/
    ├── Characters/
    ├── MiniGames/
    ├── ParentalControls/
    ├── UI/
    └── Examples/
```

## Content Creation Pipeline

### Creating New Stories

1. **Create Story Asset:**
   ```
   Right-click in Project → Create → Kids Story Game → Story Data
   ```

2. **Configure Basic Info:**
   - Title and description
   - Age range and reading level
   - Educational tags

3. **Add Story Pages:**
   - Page text and narration
   - Background images
   - Interactive elements
   - Choices and branching logic

4. **Test Story Flow:**
   - Use Play Mode to test navigation
   - Verify all choices lead to valid pages
   - Test mini-game integration

### Character Creation Pipeline

1. **Design Assets:**
   - Base character templates
   - Customization parts (hair, clothing, etc.)
   - Ensure cultural diversity

2. **Create Customization Data:**
   ```
   Right-click → Create → Kids Story Game → Character Customization
   ```

3. **Configure Options:**
   - Add character categories
   - Set up customization slots
   - Define color options

### Mini-Game Development

1. **Inherit from MiniGameBase:**
   ```csharp
   public class YourMiniGame : MiniGameBase
   {
       // Implement required methods
   }
   ```

2. **Implement Required Methods:**
   - `InitializeMiniGame()`
   - `UpdateMiniGame()`
   - `CleanupMiniGame()`
   - `ParseConfiguration()`

3. **Register in MiniGameManager:**
   - Add to prefab dictionary
   - Configure in scene

## Testing Guidelines

### Automated Testing
- Unit tests for core logic
- Integration tests for story flow
- Performance tests for mobile devices

### Manual Testing Checklist

**Story System:**
- [ ] All story pages display correctly
- [ ] Choices navigate to correct pages
- [ ] Interactive elements respond properly
- [ ] Progress tracking works

**Character System:**
- [ ] All customization options appear
- [ ] Character preview updates correctly
- [ ] Save/load functionality works
- [ ] Diverse representation is present

**Mini-Games:**
- [ ] Games launch from stories correctly
- [ ] Scoring and completion tracking works
- [ ] Adaptive difficulty functions
- [ ] Age-appropriate challenge level

**Parental Controls:**
- [ ] PIN protection works
- [ ] Settings apply correctly
- [ ] Data deletion functions
- [ ] Play time limits enforce

**Accessibility:**
- [ ] Dyslexia-friendly fonts work
- [ ] High contrast mode functions
- [ ] Text scaling works
- [ ] Voice narration plays

### Device Testing

**iOS Testing:**
- iPhone SE (older hardware)
- iPhone 14 (current generation)
- iPad Air (tablet interface)
- iPad Mini (compact tablet)

**Android Testing:**
- Budget device (Android 7.0, 2GB RAM)
- Mid-range device (Android 10+, 4GB RAM)
- High-end device (Android 13+, 8GB+ RAM)
- Various screen sizes and densities

## Performance Optimization

### Mobile Optimization Guidelines

**Graphics:**
- Use appropriate texture compression
- Optimize sprite atlases
- Implement object pooling for UI elements
- Use LOD for complex 3D assets (if any)

**Audio:**
- Compress audio files appropriately
- Use audio pooling for sound effects
- Stream longer audio files (narration, music)

**Memory Management:**
- Unload unused assets
- Use Resources.UnloadUnusedAssets()
- Monitor memory usage in Profiler

**Battery Optimization:**
- Limit update frequency when possible
- Use efficient UI layouts
- Minimize background processing

## Deployment

### iOS Deployment

1. **Build in Unity:**
   - Ensure proper signing configuration
   - Build for iOS platform

2. **Xcode Configuration:**
   - Open generated Xcode project
   - Configure signing and provisioning
   - Set deployment target
   - Add required frameworks

3. **App Store Submission:**
   - Configure app metadata
   - Upload screenshots
   - Submit for review

### Android Deployment

1. **Build Configuration:**
   - Generate signed APK or AAB
   - Configure proper keystore
   - Set version codes correctly

2. **Google Play Console:**
   - Upload build
   - Configure store listing
   - Set up content ratings
   - Submit for review

### Store Compliance

**App Store Guidelines:**
- Kids category compliance
- No third-party advertising
- Parental gate implementation
- Privacy policy compliance

**Google Play Requirements:**
- Designed for Families program
- COPPA compliance
- Content rating appropriate
- Privacy policy link

## Maintenance

### Regular Updates
- Content security reviews
- Performance optimization
- Bug fixes and stability
- New story content

### Analytics (with parental consent)
- Story completion rates
- Popular customization options
- Mini-game performance
- User engagement metrics

### Support
- Parent feedback channels
- Technical support resources
- Content moderation systems
- Privacy compliance monitoring