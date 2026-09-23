# 🚀 Project Setup & Running Guide

## Quick Start (Choose Your Platform)

### 🌐 Option 1: Run in Web Browser (Fastest Setup)

**Requirements:**
- Unity 2022.3 LTS or newer
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Steps:**
1. **Download & Extract**
   ```bash
   # Clone or download the project
   git clone <your-repo-url>
   cd "Kids Game"
   ```

2. **Open in Unity**
   - Launch Unity Hub
   - Click "Open" → Select the "Kids Game" folder
   - Wait for Unity to import assets (3-5 minutes)

3. **Build for Web**
   - In Unity: File → Build Settings
   - Select "WebGL" → Click "Switch Platform"
   - Click "Build and Run"
   - Choose build folder: `WebGL-Build`
   - Unity builds and opens in your browser automatically!

**🎉 That's it! The game is now running in your browser.**

---

### 📱 Option 2: Run on Mobile Device

**Requirements:**
- Unity 2022.3 LTS
- Mobile device (iOS/Android)
- USB cable

**For Android:**
1. **Enable Developer Mode**
   - Settings → About Phone → Tap "Build Number" 7 times
   - Settings → Developer Options → Enable "USB Debugging"

2. **Build & Install**
   ```bash
   # In Unity:
   # File → Build Settings → Android → Switch Platform
   # Player Settings → Configure package name
   # Build and Run → Unity installs directly to device
   ```

**For iOS:**
1. **Requirements:** macOS with Xcode
2. **Build Process:**
   - Unity → iOS platform → Build
   - Open generated Xcode project
   - Connect device → Build and Run in Xcode

---

### 💻 Option 3: Run in Unity Editor (Development)

**Best for:** Testing and development

1. **Open Project**
   - Unity Hub → Open → Select project folder

2. **Install Packages** (Auto-prompted)
   - TextMeshPro
   - Input System
   - (Accept all package installations)

3. **Run Game**
   - Open Scene: `Assets/Scenes/MainMenu.unity`
   - Click ▶️ Play button
   - Use Game view to test mobile interface

---

## 🔧 Detailed Setup Instructions

### Prerequisites Installation

**Unity Hub & Unity Editor:**
1. Download [Unity Hub](https://unity3d.com/get-unity/download)
2. Install Unity 2022.3 LTS through Unity Hub
3. Include these modules during installation:
   - WebGL Build Support
   - Android Build Support (if building for Android)
   - iOS Build Support (if building for iOS, macOS only)

**Git (Optional but recommended):**
- Windows: [Git for Windows](https://gitforwindows.org/)
- macOS: `brew install git` or download from [git-scm.com](https://git-scm.com/)
- Linux: `sudo apt install git` (Ubuntu/Debian)

### Project Structure Overview
```
Kids Game/
├── Assets/
│   ├── Scenes/           # Game scenes
│   ├── Scripts/          # C# code
│   ├── Art/             # Visual assets (placeholder)
│   ├── Audio/           # Sound files (placeholder)
│   └── Stories/         # Story content
├── ProjectSettings/      # Unity configuration
├── WebGL-Build/         # Built web version (after build)
└── README.md           # This file
```

### Platform-Specific Configuration

#### WebGL (Browser) Configuration
**Unity Settings:**
1. Edit → Project Settings → Player → WebGL
2. **Resolution:** 
   - Default Canvas Width: 1920
   - Default Canvas Height: 1080
   - Run In Background: ✅
3. **Publishing:**
   - Compression Format: Gzip
   - Decompression Fallback: ✅
4. **Optimization:**
   - Code Optimization: Speed
   - Strip Engine Code: ✅

**Build Settings:**
- Development Build: ✅ (for testing)
- Autoconnect Profiler: ❌ (for final builds)

#### Mobile Configuration
**Android Settings:**
1. Player Settings → Android
2. **Identification:**
   - Package Name: `com.yourcompany.kidsstory`
   - Version: 1.0
   - Bundle Version Code: 1
3. **Configuration:**
   - Minimum API Level: 24 (Android 7.0)
   - Target API Level: 34 (Android 14)
   - Scripting Backend: IL2CPP
   - Target Architectures: ARM64

**iOS Settings:**
1. Player Settings → iOS
2. **Identification:**
   - Bundle Identifier: `com.yourcompany.kidsstory`
   - Version: 1.0.0
   - Build: 1
3. **Configuration:**
   - Minimum iOS Version: 12.0
   - Target Device Family: Universal
   - Architecture: ARM64

## 🎮 Testing the Game

### Basic Functionality Test
1. **Main Menu**
   - ✅ Menu loads without errors
   - ✅ Buttons respond to clicks/touches
   - ✅ Audio plays correctly

2. **Story System**
   - ✅ Stories load and display text
   - ✅ Choices navigate correctly
   - ✅ Interactive elements work

3. **Character Customization**
   - ✅ Character creator opens
   - ✅ Customization options display
   - ✅ Preview updates correctly

4. **Mini-Games**
   - ✅ Games launch from stories
   - ✅ Scoring works correctly
   - ✅ Completion tracking functions

5. **Parental Controls**
   - ✅ PIN protection works
   - ✅ Settings save correctly
   - ✅ Time limits enforce

### Platform-Specific Testing

**WebGL Testing Checklist:**
- [ ] Loads in Chrome/Firefox/Safari/Edge
- [ ] Touch input works on tablets
- [ ] Local storage saves progress
- [ ] Performance is acceptable (30+ FPS)
- [ ] Audio plays without issues

**Mobile Testing Checklist:**
- [ ] Touch controls responsive
- [ ] Orientation handling correct
- [ ] Battery usage reasonable
- [ ] Works on different screen sizes
- [ ] No crashes during gameplay

## 🐛 Troubleshooting

### Common Issues & Solutions

**"Unity won't open the project"**
- ✅ Check Unity version (need 2022.3 LTS)
- ✅ Ensure sufficient disk space (5GB+)
- ✅ Try: Unity Hub → Projects → Add → Select folder

**"WebGL build fails"**
- ✅ Ensure WebGL module installed in Unity
- ✅ Try: Edit → Project Settings → Player → WebGL → Reset settings
- ✅ Close other applications (WebGL builds use lots of RAM)

**"Game runs slowly in browser"**
- ✅ Try different browser (Chrome often fastest)
- ✅ Close other browser tabs
- ✅ Use development build for better error messages

**"Touch input not working"**
- ✅ Check: Edit → Project Settings → Input System Package
- ✅ Ensure mobile platform selected during build
- ✅ Test on actual device (not just browser)

**"Audio not playing"**
- ✅ Check browser allows autoplay audio
- ✅ Click on game screen first (browser policy)
- ✅ Verify audio files imported correctly

### Performance Optimization

**For Web Builds:**
```csharp
// These optimizations are automatically applied by PlatformManager.cs
- Quality Level: Medium (1)
- Audio Sample Rate: 22050 Hz
- Target Frame Rate: 60 FPS
- V-Sync: Enabled
```

**For Mobile Builds:**
```csharp
// Automatically applied optimizations:
- Quality Level: Good (2) 
- UI Scale: 1.2x for touch targets
- Multi-touch: Enabled
- Target Frame Rate: 60 FPS
```

## 📦 Building for Distribution

### Web Hosting
1. **Build the project** (WebGL platform)
2. **Upload contents** of build folder to web server
3. **Ensure server serves .wasm files** with correct MIME type
4. **Test on different devices and browsers**

**Recommended hosting:**
- GitHub Pages (free, easy setup)
- Netlify (free tier, drag-and-drop)
- Firebase Hosting (free tier, good performance)

### App Store Distribution
**iOS App Store:**
1. Build in Unity → Export Xcode project
2. Open in Xcode → Configure signing
3. Archive → Upload to App Store Connect
4. Configure metadata → Submit for review

**Google Play Store:**
1. Build AAB (Android App Bundle) in Unity
2. Upload to Google Play Console
3. Configure store listing
4. Submit for review

## 🆘 Getting Help

### Documentation
- [Unity Manual](https://docs.unity3d.com/Manual/index.html)
- [Unity Scripting API](https://docs.unity3d.com/ScriptReference/)
- [WebGL Platform Guide](https://docs.unity3d.com/Manual/webgl.html)

### Project-Specific Help
- Check `DEVELOPMENT_GUIDE.md` for detailed development info
- Review code comments in `Assets/Scripts/` folders
- Look at example implementations in `Assets/Scripts/Examples/`

### Community Support
- [Unity Forums](https://forum.unity.com/)
- [Unity Learn](https://learn.unity.com/)
- [Stack Overflow - Unity3D](https://stackoverflow.com/questions/tagged/unity3d)

---

## 🎯 Next Steps After Setup

1. **Explore the Example Story**
   - Play through "The Friendly Forest Adventure"
   - Test all interactive elements
   - Try the counting mini-game

2. **Create Your Own Content**
   - Right-click → Create → Kids Story Game → Story Data
   - Follow patterns in example stories
   - Test with your target age group

3. **Customize for Your Needs**
   - Replace placeholder art assets
   - Record voice narration
   - Add your own stories and characters

4. **Deploy & Share**
   - Build for web and share link
   - Test with parents and children
   - Gather feedback for improvements

**Happy game development! 🎮✨**