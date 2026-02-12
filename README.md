# Interactive Kids Storytelling Game 📱📚

An engaging, educational, and safe interactive storytelling mobile game designed for children ages 5-9. Built with Unity for iOS and Android platforms.

## 🎯 Project Overview

This Unity-based cross-platform game provides immersive storytelling experiences featuring:
- **Branching Narratives**: Stories that change based on player choices
- **Character Customization**: Diverse and inclusive character creation
- **Educational Mini-Games**: Embedded learning activities (counting, matching, memory, puzzles)
- **Parental Dashboard**: Progress tracking and comprehensive parental controls
- **Voice Narration**: Professional voice acting with text highlighting
- **Multi-Platform Support**: Mobile (iOS/Android), Desktop (Windows/Mac/Linux), and Web Browser
- **Offline Mode**: Core functionality available without internet connection

## 🏗️ Architecture

### Core Systems

#### 📖 Story Engine (`Assets/Scripts/StoryEngine/`)
- **StoryData.cs**: ScriptableObject-based story definition system
- **StoryManager.cs**: Core story progression and state management
- Supports branching narratives, voice narration, and interactive elements

#### 👤 Character System (`Assets/Scripts/Characters/`)
- **CharacterCustomizationData.cs**: Comprehensive character customization data structures
- **CharacterCustomizationManager.cs**: Character creation and management interface
- Includes diverse representation and cultural sensitivity

#### 🎮 Mini-Games (`Assets/Scripts/MiniGames/`)
- **MiniGameBase.cs**: Abstract base class for all mini-games
- **MiniGameManager.cs**: Orchestrates mini-game integration within stories
- Adaptive difficulty and progress tracking

#### 🔒 Parental Controls (`Assets/Scripts/ParentalControls/`)
- **ParentalControlsManager.cs**: COPPA-compliant safety and privacy management
- **ParentalControlsData.cs**: Data structures for settings and play time tracking
- PIN-protected settings and comprehensive usage reports

#### 🎨 UI System (`Assets/Scripts/UI/`)
- **StoryUIController.cs**: Main story display and interaction interface
- Accessibility features (dyslexia-friendly fonts, high contrast mode)
- Responsive design for tablets and smartphones

## 🚀 Getting Started

### Prerequisites
- Unity 2022.3 LTS or newer
- Visual Studio Code with C# extension
- Git for version control
- Web browser (Chrome, Firefox, Safari, Edge) for WebGL builds
- iOS development: Xcode and Apple Developer account
- Android development: Android SDK and NDK

### Quick Start Guide

#### Option 1: Run in Browser (Recommended for Testing)
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Kids Game"
   ```

2. **Open in Unity:**
   - Launch Unity Hub
   - Click "Open" and select the project folder
   - Wait for Unity to import all assets

3. **Build for WebGL:**
   - Go to File → Build Settings
   - Select "WebGL" platform
   - Click "Switch Platform" 
   - Click "Build and Run"
   - Choose a build folder (e.g., "WebGL-Build")
   - Unity will build and automatically open in your browser

#### Option 2: Run in Unity Editor (For Development)
1. **Open the project in Unity Hub**
2. **Install required packages** (Unity will prompt automatically)
3. **Open the main scene:** `Assets/Scenes/MainMenu.unity`
4. **Click the Play button** in Unity Editor
5. **Use Game view** to test mobile interface scaling

#### Option 3: Mobile Device Testing
1. **Connect your mobile device** via USB
2. **Enable Developer Mode** (Android) or add device to Xcode (iOS)
3. **Switch platform** to iOS or Android in Build Settings
4. **Build and Run** - Unity will install directly to your device

📋 **For detailed setup instructions, see [PROJECT_SETUP.md](PROJECT_SETUP.md)**

### Platform-Specific Setup

#### WebGL Browser Build
1. Switch platform to WebGL in Build Settings
2. Configure Player Settings:
   - WebGL Template: Choose "Default" or "Minimal"
   - Compression Format: Gzip (recommended)
   - Code Optimization: Speed (for better performance)
   - Strip Engine Code: Enabled
3. Build and test in browser
4. Deploy to web hosting service

#### iOS Build
1. Switch platform to iOS in Build Settings
2. Configure Player Settings:
   - Bundle Identifier
   - Signing Team ID
   - Camera/Microphone usage descriptions
3. Build and deploy to Xcode

#### Android Build
1. Switch platform to Android in Build Settings
2. Configure Player Settings:
   - Package Name
   - Target API Level (minimum 24)
   - Keystore for release builds
3. Build APK or AAB

#### Desktop Build (Windows/Mac/Linux)
1. Switch to target desktop platform
2. Configure Player Settings:
   - Company Name and Product Name
   - Icon and splash screen
3. Build executable for distribution

## 📚 Content Creation

### Creating Stories
1. Create new `StoryData` asset: Right-click → Create → Kids Story Game → Story Data
2. Configure story metadata (title, description, age range)
3. Add story pages with text, backgrounds, and choices
4. Set up interactive elements and mini-game triggers
5. Test story flow in play mode

### Adding Characters
1. Create `CharacterCustomizationData` asset
2. Define character categories and templates
3. Add customization parts (hair, clothing, accessories)
4. Ensure diverse representation across all options

### Implementing Mini-Games
1. Inherit from `MiniGameBase` class
2. Implement required abstract methods:
   - `InitializeMiniGame()`
   - `UpdateMiniGame()`
   - `CleanupMiniGame()`
3. Configure in `MiniGameManager` prefab dictionary

## 🔐 Privacy & Safety

### COPPA Compliance
- No personal information collection without parental consent
- Anonymized analytics only with explicit permission
- Comprehensive data deletion capabilities
- Age-appropriate content guidelines

### Parental Controls
- PIN-protected settings access
- Daily play time limits with warnings
- Audio and content control toggles
- Detailed progress reports

### Data Handling
- Local storage by default
- Optional cloud sync with parental permission
- Encryption for sensitive data
- Regular privacy compliance audits

## 🎨 Art & Audio Guidelines

### Visual Assets
- Bright, friendly, and inclusive art style
- Cultural diversity in characters and settings
- Colorblind-friendly color palettes
- High contrast options for accessibility

### Audio Assets
- Professional voice narration for all text
- Age-appropriate background music
- Clear sound effects for interactions
- Adjustable volume controls

## 🧪 Testing

### Automated Testing
- Unit tests for core game logic
- Integration tests for story progression
- Performance tests for mobile devices

### Manual Testing
- Age-appropriate content review
- Accessibility feature validation
- Cross-platform compatibility
- Parental control functionality

## 📈 Analytics & Progress

### Player Progress Tracking
- Story completion rates
- Mini-game performance metrics
- Character creation statistics
- Time spent in different activities

### Educational Metrics
- Learning objective completion
- Skill development tracking
- Adaptive difficulty adjustments
- Parent-viewable progress reports

## 🌐 Localization

### Supported Features
- Multi-language text support
- Region-appropriate content
- Cultural customization options
- Voice narration in multiple languages (planned)

## 🔧 Development Tools

### Unity Packages Used
- TextMeshPro for advanced text rendering
- Unity Analytics (optional)
- Unity Mobile Notifications
- DOTween for animations (recommended)

### External Dependencies
- Firebase (optional, for cloud features)
- Platform-specific notification services

## 📱 Platform-Specific Features

### Web Browser (WebGL)
- Cross-platform compatibility (Chrome, Firefox, Safari, Edge)
- No installation required - play instantly
- Automatic scaling for different screen sizes
- Local storage for progress (COPPA-compliant)
- Optimized asset streaming for web performance

### Mobile (iOS/Android)
- App Store and Google Play compliance
- Touch-optimized interface
- Device notifications for play reminders
- Offline mode with local content caching
- Platform-specific parental controls integration

### Desktop (Windows/Mac/Linux)
- Full-screen and windowed modes
- Keyboard and mouse support
- High-resolution display support
- Local file system access for enhanced features

## 🚀 Future Enhancements

### Planned Features
- Story creation mode for kids
- Augmented Reality (AR) storytelling
- Community story sharing (moderated)
- Advanced AI-generated content
- More mini-game types
- Enhanced accessibility features

### Expansion Ideas
- Licensed content partnerships
- Seasonal story packs
- Educational curriculum alignment
- Teacher dashboard for classrooms
- Multiplayer story experiences

## 🤝 Contributing

### Content Guidelines
- Age-appropriate themes only
- Educational value integration
- Cultural sensitivity review
- Safety-first approach

### Code Standards
- Follow Unity C# conventions
- Comprehensive XML documentation
- Unit test coverage for new features
- Performance optimization for mobile

## 📞 Support

### For Parents
- Privacy questions: Contact our support team
- Technical issues: Check troubleshooting guide
- Content concerns: Report through parental dashboard

### For Developers
- Technical documentation: See `/Docs` folder
- API reference: Auto-generated from code comments
- Best practices: Follow established patterns

## 📄 License & Legal

### Privacy Policy
- COPPA-compliant privacy practices
- Transparent data handling
- Parental rights protection
- Regular policy updates

### Terms of Service
- Age-appropriate usage terms
- Parental supervision requirements
- Content usage guidelines
- Platform store compliance

---

**Building safe, educational, and engaging digital experiences for children** 🌟

*For questions about this project, please refer to the documentation or contact the development team.*