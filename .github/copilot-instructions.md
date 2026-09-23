# BrightTrail Kids Game - Development Instructions

## Project Overview
The current product direction is BrightTrail, a monolithic educational games application for ages 5-15. The production web experience is an Angular frontend hosted by an ASP.NET Core API. The existing Unity assets and root-level browser game are retained as legacy migration surfaces and should not be treated as the current web entrypoint.

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
- Angular standalone components with Angular Material and SCSS
- ASP.NET Core 10 minimal API and C# services
- Checked-in JSON catalog for game content; no database is required for the monolith
- Docker deployment with one ASP.NET Core process serving the built Angular app
- COPPA-compliant data handling and privacy features
- Accessibility features (dyslexia-friendly fonts, colorblind modes)

### Code Standards
- Keep `frontend/` and `backend/` modular and typed.
- Keep game content in `backend/Data/game-catalog.json` and validate it through the backend service.
- Use reusable Angular components and generic JSON-driven game interactions.
- Use C# records and focused minimal API endpoints for the backend contract.
- Keep tests and QA focused on core game logic, catalog validation, endpoint behavior, and child-safe interactions.

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
frontend/
├── src/app/core/             # Models and services
├── src/app/pages/            # Home, shelf, and game runner
└── src/app/shared/           # Reusable UI components
backend/
├── Data/                     # JSON game catalog
├── Models/                   # C# API contract
├── Services/                 # Catalog loading and validation
└── Program.cs                # API and Angular static host
.github/agents/               # Backend, frontend, and QA roles
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
- **Frontend**: Angular standalone routes, services, signals, Angular Material controls, and SCSS design tokens
- **Backend**: Minimal API endpoints, typed records, cached validated catalog, health endpoint, and security headers
- **Content**: `backend/Data/game-catalog.json` is the source of truth for age-banded games
- **Deployment**: ASP.NET Core serves `frontend/dist/kids-game/browser` in production
- **Legacy Unity**: Scripts under `Assets/` keep the `KidsStoryGame.[SystemName]` namespace and existing mini-game lifecycle

## Key Integration Points
- **Game Catalog**: `GameCatalogService` loads and validates JSON; `/api/games` supplies the Angular shelf
- **Game Runner**: `PlayGameComponent` renders generic rounds, feedback, hints, scoring, and local progress
- **Progress**: `ProgressService` stores only local device progress; no child profile is sent to the API
- **Sound**: `SoundService` provides optional synthesized feedback without external audio files
- **Legacy Unity**: `StoryManager`, `MiniGameManager`, and platform scripts remain available during migration

## Critical Workflows
- **Frontend development**: `cd frontend; npm install; npm start`
- **Backend development**: `dotnet run --project backend/KidsGame.Api.csproj --launch-profile KidsGame.Api`
- **Content creation**: Add validated games and rounds to `backend/Data/game-catalog.json`
- **Monolith release**: Build Angular, then `dotnet publish`, or use the root `Dockerfile`
- **QA**: Use `.github/agents/qa-tester.agent.md` for focused build, API, interaction, accessibility, and responsive checks

## Data Flow Patterns
- Games load from checked-in JSON through the ASP.NET Core catalog service
- Angular filters games by age band/category and renders rounds from the shared contract
- Results and stars persist locally in browser storage
- The production host serves the API and Angular static files from one process
- Unity story and character data flows remain isolated to the legacy `Assets/` implementation

This project aims to create an engaging, educational, and safe interactive storytelling experience for young children.