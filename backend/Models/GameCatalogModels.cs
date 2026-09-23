namespace KidsGame.Api.Models;

public sealed record GameCatalog(
    int Version,
    IReadOnlyList<GameDefinition> Games);

public sealed record GameDefinition(
    string Id,
    string Title,
    string AgeBand,
    int MinAge,
    int MaxAge,
    string Category,
    string Icon,
    string Accent,
    string Description,
    IReadOnlyList<string> Skills,
    int DurationMinutes,
    string Difficulty,
    string Interaction,
    IReadOnlyList<GameRound> Rounds,
    GameSettings? Settings = null);

public sealed record GameSettings(
    int? BoardSize = null,
    int? MineCount = null,
    int? TargetScore = null,
    int? MaxTargetScore = null,
    int? TickMilliseconds = null);

public sealed record GameRound(
    string Prompt,
    string Visual,
    IReadOnlyList<GameChoice> Choices,
    string Answer,
    string Hint);

public sealed record GameChoice(
    string Id,
    string Label);
