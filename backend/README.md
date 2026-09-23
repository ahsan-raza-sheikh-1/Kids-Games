# KidsGame.Api

ASP.NET Core 10 API and static host for the BrightTrail Angular frontend.

## Endpoints

- `GET /health` returns the process health status.
- `GET /api/catalog` returns the validated catalog.
- `GET /api/games` returns all games.
- `GET /api/games?ageBand=5-10` filters by age band.
- `GET /api/games?category=Maths` filters by category.
- `GET /api/games/{id}` returns one game or `404`.

The catalog is a checked-in JSON file in `Data/game-catalog.json`. The service caches it and revalidates it when the file changes, which keeps local content editing simple while still rejecting malformed content at runtime.
