using KidsGame.Api.Services;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddSingleton<GameCatalogService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend-development", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseCors("frontend-development");
}
else if (app.Configuration.GetValue<bool>("EnableHttpsRedirection"))
{
    app.UseHttpsRedirection();
}

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

app.MapHealthChecks("/health");

app.MapGet("/api/games", async (
    string? ageBand,
    string? category,
    GameCatalogService catalogService,
    CancellationToken cancellationToken) =>
{
    var catalog = await catalogService.GetCatalogAsync(cancellationToken);
    var games = catalog.Games.AsEnumerable();

    if (!string.IsNullOrWhiteSpace(ageBand))
    {
        games = games.Where(game => string.Equals(
            game.AgeBand,
            ageBand,
            StringComparison.OrdinalIgnoreCase));
    }

    if (!string.IsNullOrWhiteSpace(category))
    {
        games = games.Where(game => string.Equals(
            game.Category,
            category,
            StringComparison.OrdinalIgnoreCase));
    }

    return Results.Ok(new
    {
        catalog.Version,
        Games = games.ToArray()
    });
});

app.MapGet("/api/games/{id}", async (
    string id,
    GameCatalogService catalogService,
    CancellationToken cancellationToken) =>
{
    var game = await catalogService.GetGameAsync(id, cancellationToken);
    return game is null
        ? Results.NotFound(new { message = "Game not found." })
        : Results.Ok(game);
});

app.MapGet("/api/catalog", async (
    GameCatalogService catalogService,
    CancellationToken cancellationToken) => Results.Ok(
        await catalogService.GetCatalogAsync(cancellationToken)));

var frontendPath = Path.GetFullPath(Path.Combine(
    app.Environment.ContentRootPath,
    "..",
    "frontend",
    "dist",
    "kids-game",
    "browser"));

if (Directory.Exists(frontendPath))
{
    var frontendProvider = new PhysicalFileProvider(frontendPath);
    var faviconPath = Path.Combine(frontendPath, "assets", "favicon.svg");

    app.MapGet("/favicon.ico", async context =>
    {
        context.Response.ContentType = "image/svg+xml";
        await context.Response.SendFileAsync(faviconPath);
    });

    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = frontendProvider });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = frontendProvider });

    app.MapFallback(async context =>
    {
        if (context.Request.Path.StartsWithSegments("/api"))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(Path.Combine(frontendPath, "index.html"));
    });
}

app.Run();
