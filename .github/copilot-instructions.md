# Interactive Kids Storytelling Game - Development Instructions

## Project Overview
This Unity-based mobile game provides interactive storytelling experiences for children aged 5-9, featuring branching narratives, character customization, mini-games, and parental controls.

## Development Guidelines

### Core Features to Implement
- Interactive storytelling engine with branching narratives
- Character customization system with diverse representation
- Mini-games and educational puzzles embedded in stories
- Parental dashboard for progress tracking and controls
- Content expansion system for new story packs
- Voice narration with text highlighting
- Offline mode functionality

### Technical Requirements
- Unity 2022.3 LTS or newer for cross-platform development
- iOS and Android deployment targets
- Firebase integration for cloud storage and content updates
- COPPA-compliant data handling and privacy features
- Accessibility features (dyslexia-friendly fonts, colorblind modes)

### Code Standards
- Use Unity's ScriptableObjects for story data management
- Implement modular architecture for story content expansion
- Follow Unity naming conventions and coding standards
- Include comprehensive XML documentation for all public methods
- Write unit tests for core game logic

### Safety and Privacy
- Ensure COPPA compliance in all data collection
- Implement secure parental controls
- Use anonymized analytics only with parental consent
- No direct external links or unmoderated content

### Content Guidelines
- Age-appropriate themes: animals, fantasy, adventure, friendship
- Educational elements integrated naturally into gameplay
- Diverse character representation
- Clear, simple language suitable for reading levels

## File Structure
```
Assets/
├── Scripts/
│   ├── StoryEngine/
│   ├── Characters/
│   ├── MiniGames/
│   ├── ParentalControls/
│   └── UI/
├── Stories/
├── Audio/
├── Art/
└── Scenes/
```

## Architecture Patterns
- **Namespace Convention**: All scripts use `KidsStoryGame.[SystemName]` (e.g., `KidsStoryGame.StoryEngine`)
- **Data Management**: ScriptableObjects for serializable data (StoryData, CharacterCustomizationData, ParentalControlsData)
- **Communication**: Unity Events for decoupled system communication
- **Platform Abstraction**: PlatformManager handles WebGL, mobile, desktop differences
- **Mini-Game Framework**: MiniGameBase abstract class with standardized lifecycle events

## Key Integration Points
- **Story Engine**: StoryManager coordinates narrative flow, integrates with UI and audio
- **Character System**: CharacterCustomizationManager creates PlayerCharacter instances
- **Mini-Games**: MiniGameManager embeds games within story progression
- **Parental Controls**: ParentalControlsManager enforces COPPA compliance and session limits
- **Platform Layer**: PlatformManager adapts input, UI scaling, and capabilities per target

## Critical Workflows
- **WebGL Build**: File → Build Settings → WebGL → Build and Run (opens in browser)
- **Mobile Testing**: Connect device → Build and Run (Unity installs directly)
- **Story Creation**: Create StoryData ScriptableObject → Add StoryPage entries → Configure choices and branches
- **Mini-Game Development**: Extend MiniGameBase → Implement abstract methods → Register with MiniGameManager

## Data Flow Patterns
- Stories load via StoryData ScriptableObjects with branching logic in StoryManager
- Character data persists via PlayerPrefs with parental consent checks
- Mini-game results feed back to story flags and parental progress tracking
- Platform-specific optimizations applied at runtime via PlatformManager

This project aims to create an engaging, educational, and safe interactive storytelling experience for young children.