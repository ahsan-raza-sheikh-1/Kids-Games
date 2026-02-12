# 🌐 Web Deployment Guide

## Overview
This guide covers deploying the Interactive Kids Storytelling Game to various web platforms for browser play.

## Supported Browsers
- ✅ **Chrome 80+** (Recommended)
- ✅ **Firefox 75+**
- ✅ **Safari 13+**
- ✅ **Edge 80+**
- ✅ **Mobile browsers** (Chrome Mobile, Safari Mobile)

## Building for Web

### 1. Unity WebGL Build
```bash
# In Unity Editor:
# 1. File → Build Settings
# 2. Select WebGL platform
# 3. Click "Switch Platform"
# 4. Player Settings → WebGL → Configure:
#    - Compression: Gzip
#    - Memory Size: 256 MB
#    - Exception Support: Explicitly Thrown Exceptions Only
# 5. Build Settings → Build
# 6. Choose output folder: "WebGL-Build"
```

### 2. Build Output Structure
```
WebGL-Build/
├── index.html                    # Main HTML file
├── TemplateData/                # Unity template assets
│   ├── style.css
│   └── UnityProgress.js
├── Build/                       # Game build files
│   ├── WebGL-Build.loader.js
│   ├── WebGL-Build.framework.js
│   ├── WebGL-Build.data
│   └── WebGL-Build.wasm
└── StreamingAssets/             # Additional game assets
```

## Deployment Options

### Option 1: GitHub Pages (Free & Easy)

**Steps:**
1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/kids-story-game.git
   git push -u origin main
   ```

2. **Copy WebGL Build**
   ```bash
   # Copy contents of WebGL-Build/ to docs/ folder
   mkdir docs
   cp -r WebGL-Build/* docs/
   git add docs/
   git commit -m "Add WebGL build"
   git push
   ```

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to Pages section
   - Source: Deploy from branch
   - Branch: main, Folder: /docs
   - Save

4. **Access Your Game**
   - URL: `https://yourusername.github.io/kids-story-game/`

### Option 2: Netlify (Drag & Drop)

**Steps:**
1. **Visit [Netlify](https://netlify.com)**
2. **Drag WebGL-Build folder** to deploy area
3. **Get instant URL** (e.g., `random-name-123.netlify.app`)
4. **Optional:** Configure custom domain

### Option 3: Firebase Hosting

**Steps:**
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   firebase login
   firebase init hosting
   # Select WebGL-Build as public directory
   # Configure as single-page app: No
   ```

3. **Deploy**
   ```bash
   firebase deploy
   ```

### Option 4: Custom Web Server

**Requirements:**
- Web server (Apache, Nginx, etc.)
- Proper MIME types configured
- HTTPS recommended

**Server Configuration:**
```nginx
# Nginx configuration example
location ~* \.(wasm)$ {
    add_header Content-Type application/wasm;
}

location ~* \.(data)$ {
    add_header Content-Type application/octet-stream;
}

location ~* \.(js)$ {
    add_header Content-Type application/javascript;
}
```

## Performance Optimization

### 1. Build Optimization
```csharp
// In Unity Build Settings:
- Code Optimization: Size
- Strip Engine Code: Enabled
- Managed Stripping Level: Medium
- Vertex Compression: Everything
```

### 2. Asset Optimization
- **Textures:** Use compressed formats (DXT, ETC2)
- **Audio:** Compress to OGG Vorbis, 22050 Hz
- **Models:** Optimize polygon count
- **Scripts:** Remove debug code

### 3. Loading Optimization
- Enable "Decompression Fallback"
- Use "Gzip" compression
- Implement asset streaming for large content

## Browser-Specific Considerations

### Chrome/Chromium
- Best performance
- Full WebGL 2.0 support
- No additional configuration needed

### Firefox
- Good performance
- May require user interaction before audio
- Enable `dom.webgpu.enabled` for best graphics

### Safari
- iOS support requires user interaction for audio
- Some WebGL features limited
- Test on actual iOS devices

### Mobile Browsers
- Reduced memory limits
- Touch input optimization
- Performance varies by device

## COPPA Compliance for Web

### Browser Storage
```javascript
// The game uses only browser local storage
// No cookies or external tracking
// Data stays on user's device only
localStorage.setItem('kids-story-progress', gameData);
```

### Privacy Features
- No external analytics by default
- No third-party scripts
- Local-only data storage
- Parental control over all data

## Testing Checklist

### Functionality Testing
- [ ] Game loads in all target browsers
- [ ] Touch input works on mobile devices
- [ ] Audio plays after user interaction
- [ ] Local storage saves/loads correctly
- [ ] All game features work as expected

### Performance Testing
- [ ] 30+ FPS on mobile devices
- [ ] < 5 second initial load time
- [ ] Memory usage stays under 512MB
- [ ] No memory leaks during extended play

### Compatibility Testing
- [ ] Works on phones (portrait orientation)
- [ ] Works on tablets (both orientations)
- [ ] Works on desktop browsers
- [ ] Graceful fallback for older browsers

## Troubleshooting

### Common Issues

**"Game won't load"**
- Check browser console for errors
- Ensure proper MIME types configured
- Verify all files uploaded correctly

**"Audio not playing"**
- Browsers require user interaction first
- Check browser audio permissions
- Verify audio files compressed correctly

**"Touch input not working"**
- Ensure mobile platform was selected during build
- Test on actual mobile device
- Check Unity Input System configuration

**"Slow performance"**
- Reduce Unity quality settings
- Enable GPU acceleration in browser
- Close other browser tabs/applications

### Debug Tools
```javascript
// Browser console commands for debugging:
console.log(unityInstance); // Check Unity instance
unityInstance.SendMessage("GameObject", "Method", "param"); // Send debug commands
```

## Monitoring & Analytics

### Built-in Monitoring
```csharp
// Platform-specific analytics (with parental consent)
if (parentalConsent && platformManager.IsWebGL()) {
    // Track only essential metrics:
    // - Story completion rates
    // - Performance metrics
    // - Error reporting
}
```

### Privacy-Safe Analytics
- Only with explicit parental consent
- No personal information collected
- Anonymized usage data only
- Local processing preferred

## Updates & Maintenance

### Versioning Strategy
```
Version format: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes or major content updates
- MINOR: New stories, features, or improvements
- PATCH: Bug fixes and small improvements
```

### Update Process
1. Build new version in Unity
2. Test thoroughly on all platforms
3. Deploy to staging environment
4. User acceptance testing
5. Deploy to production
6. Monitor for issues

### Rollback Plan
- Keep previous working build available
- Quick rollback via hosting platform
- Notify users of any issues promptly

---

## Quick Deploy Commands

**GitHub Pages:**
```bash
# Build in Unity, then:
cp -r WebGL-Build/* docs/
git add docs/
git commit -m "Update game build"
git push
```

**Netlify:**
```bash
# After Unity build:
cd WebGL-Build
zip -r ../game-build.zip *
# Upload zip to Netlify dashboard
```

**Firebase:**
```bash
# After Unity build:
cp -r WebGL-Build/* public/
firebase deploy
```

Your game is now ready for the web! 🌐✨