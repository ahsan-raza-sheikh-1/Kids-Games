# BrightTrail Modernization

The repository now contains a new production-oriented monolith beside the legacy browser and Unity implementations.

## Architecture

```text
Kids Game/
├── frontend/                 # Angular standalone app + Angular Material + SCSS
│   └── src/app/
│       ├── core/             # catalog, progress, sound, and shared models
│       ├── pages/             # home, game shelf, and generic game runner
│       └── shared/            # reusable game card
├── backend/                 # ASP.NET Core API and single-process host
│   ├── Data/game-catalog.json # checked-in game content; no database required
│   ├── Models/                # catalog contract
│   ├── Services/              # cached, validated catalog loader
│   └── Program.cs             # API + health check + Angular static hosting
├── .github/agents/            # backend, frontend, and QA custom agents
└── Dockerfile                 # one-container production deployment
```

The old root-level JavaScript game and Unity assets remain available during migration. New work should target `frontend/` and `backend/`.
Snake offers Starter (5 treats), Explorer (10 treats), and Challenger (20 treats) before play begins. The challenger route also moves faster, so the extra length is a real difficulty increase rather than only a larger counter.



## Local development

Install frontend dependencies once:

```powershell
cd frontend
npm install
```

Run the API and Angular dev server in separate terminals:

```powershell
dotnet run --project backend/KidsGame.Api.csproj --launch-profile KidsGame.Api
cd frontend
npm start
```

Open `http://localhost:4200`. The Angular proxy forwards `/api` and `/health` to `http://localhost:5080`.

## Monolithic production run

Build Angular, then let ASP.NET Core serve its output:

```powershell
cd frontend
npm ci
npm run build
cd ..
dotnet run --project backend/KidsGame.Api.csproj --configuration Release --urls http://localhost:5080
```

Open `http://localhost:5080`. The API and the Angular application are served by the same process.

For a container deployment:

```powershell
docker build -t brighttrail .
docker run --rm -p 8080:8080 brighttrail
```

Open `http://localhost:8080`.

## CI/CD deployment

`.github/workflows/ci-cd.yml` validates the Angular and ASP.NET Core builds on pull requests and pushes to `main`. A push to `main` then builds the monolith image and publishes it to GitHub Container Registry as:

```text
ghcr.io/<repository-owner>/brighttrail:latest
```

The workflow is the deployment step currently configured for this repository. A runtime such as an internal Kubernetes cluster, Azure Container Apps, or another container host can pull that image without changing the application. A host-specific deploy job should only be added after its environment URL and credentials are configured as GitHub Actions secrets.

## Content model

Games are stored in `backend/Data/game-catalog.json` and are loaded, cached, and validated by the backend. A game contains:

- identity and age band (`5-10` or `10-15`)
- category, icon, accent, skills, duration, and difficulty
- an interaction type understood by the generic runner
- rounds with a prompt, visual, choices, answer id, and hint

To add a compatible game, add a unique entry and keep every round with at least two choices whose ids include the answer id. No Angular code change is needed for the existing `choice` and `pattern` interaction types.

## Privacy and sound choices

- Progress is stored in the browser's local storage only.
- The API stores no child profiles, analytics, or identity data.
- Sound effects are optional and synthesized in the browser, so no audio files or external audio service are required.
- The palette uses teal for calm focus, coral for action and retry feedback, mint for success, and yellow for rewards. Feedback is also expressed with text and icons, not color alone.

## Release checks

```powershell
dotnet build backend/KidsGame.Api.csproj
cd frontend
npm ci
npm run build
```

The QA custom agent in `.github/agents/qa-tester.agent.md` owns broader interaction and responsive checks. Unit tests are intentionally not run as part of ordinary development unless requested.
