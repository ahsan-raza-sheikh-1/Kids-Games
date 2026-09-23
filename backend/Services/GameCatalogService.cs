using System.Text.Json;
using KidsGame.Api.Models;

namespace KidsGame.Api.Services;

public sealed class GameCatalogService
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

    private readonly string _catalogPath;
    private readonly SemaphoreSlim _loadLock = new(1, 1);
    private GameCatalog? _cachedCatalog;
    private DateTime _lastWriteUtc;

    public GameCatalogService(IWebHostEnvironment environment)
    {
        _catalogPath = Path.Combine(environment.ContentRootPath, "Data", "game-catalog.json");
    }

    public async Task<GameCatalog> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        var lastWriteUtc = File.GetLastWriteTimeUtc(_catalogPath);
        if (_cachedCatalog is not null && lastWriteUtc <= _lastWriteUtc)
        {
            return _cachedCatalog;
        }

        await _loadLock.WaitAsync(cancellationToken);
        try
        {
            lastWriteUtc = File.GetLastWriteTimeUtc(_catalogPath);
            if (_cachedCatalog is not null && lastWriteUtc <= _lastWriteUtc)
            {
                return _cachedCatalog;
            }

            await using var stream = File.OpenRead(_catalogPath);
            var catalog = await JsonSerializer.DeserializeAsync<GameCatalog>(
                stream,
                SerializerOptions,
                cancellationToken);

            if (catalog is null)
            {
                throw new InvalidDataException("The game catalog is empty.");
            }

            ValidateCatalog(catalog);
            _cachedCatalog = catalog;
            _lastWriteUtc = lastWriteUtc;
            return catalog;
        }
        finally
        {
            _loadLock.Release();
        }
    }

    public async Task<GameDefinition?> GetGameAsync(
        string id,
        CancellationToken cancellationToken = default)
    {
        var catalog = await GetCatalogAsync(cancellationToken);
        return catalog.Games.FirstOrDefault(game =>
            string.Equals(game.Id, id, StringComparison.OrdinalIgnoreCase));
    }

    private static void ValidateCatalog(GameCatalog catalog)
    {
        if (catalog.Version < 1 || catalog.Games.Count == 0)
        {
            throw new InvalidDataException("The game catalog must contain a version and at least one game.");
        }

        var ids = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var game in catalog.Games)
        {
            if (string.IsNullOrWhiteSpace(game.Id) || !ids.Add(game.Id))
            {
                throw new InvalidDataException("Every game must have a unique id.");
            }

            var isRetroGame = game.Interaction is "snake" or "mines" or "chess" or "checkers";
            if (game.MinAge < 5 || game.MaxAge < game.MinAge || (!isRetroGame && game.Rounds.Count == 0))
            {
                throw new InvalidDataException($"Game '{game.Id}' has an invalid age range or no rounds.");
            }

            if (isRetroGame && game.Settings is null)
            {
                throw new InvalidDataException($"Retro game '{game.Id}' must define settings.");
            }

            foreach (var round in game.Rounds)
            {
                if (round.Choices.Count < 2 || !round.Choices.Any(choice =>
                        string.Equals(choice.Id, round.Answer, StringComparison.OrdinalIgnoreCase)))
                {
                    throw new InvalidDataException($"Round '{round.Prompt}' in '{game.Id}' has an invalid answer.");
                }
            }
        }
    }
}
