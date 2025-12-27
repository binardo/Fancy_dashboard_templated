using System.Text.Json;
using System.Threading.Channels;
using BG.AIWallboard.Bff.Models;
using BG.AIWallboard.Bff.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});

builder.Services.Configure<RouteOptions>(options =>
{
    options.LowercaseUrls = true;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

builder.Services.AddSingleton<DashboardConfiguration>();
builder.Services.AddSingleton<MockEventGenerator>();
builder.Services.AddSingleton<EventAggregator>();
builder.Services.AddHostedService<MockEventBackgroundService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(static builder =>
    builder.AllowAnyMethod()
        .AllowAnyHeader()
        .AllowAnyOrigin());

app.UseHealthChecks("/healthcheck");

app.MapGet("/clientconfig", () => new
{
    ClientID = "external-dev",
    IdentityServerUrl = "http://localhost:5000",
    RoleProfileEndpoint = "/mock/roleprofile",
    ConfigCatKey = "",
    InstanaKey = ""
})
    .WithName("GetClientConfig")
    .WithOpenApi();

app.MapGet("/mock/roleprofile", () => new
{
    Roles = new[] { "USER", "ADMIN" },
    UnitStructure = "Dev",
    ParCode = "DEV001",
    Department = "Development",
    Team = "External",
    SecondedDept = (string?)null,
    SecondedTeam = (string?)null
});

app.MapGet("/api/config", (DashboardConfiguration config) =>
{
    return Results.Ok(new
    {
        departments = config.Departments,
        monitoredApps = config.MonitoredApps,
        playbackLagSeconds = config.PlaybackLagSeconds,
        maxEventListSize = config.MaxEventListSize
    });
})
    .WithName("GetDashboardConfig")
    .WithOpenApi();

app.MapGet("/api/aggregates", (EventAggregator aggregator) =>
{
    return Results.Ok(aggregator.GetAggregates());
})
    .WithName("GetAggregates")
    .WithOpenApi();

app.MapGet("/api/events/recent", (EventAggregator aggregator) =>
{
    return Results.Ok(aggregator.GetRecentEvents());
})
    .WithName("GetRecentEvents")
    .WithOpenApi();

app.MapGet("/api/events/stream", async (HttpContext context, EventAggregator aggregator, CancellationToken cancellationToken) =>
{
    context.Response.Headers.Append("Content-Type", "text/event-stream");
    context.Response.Headers.Append("Cache-Control", "no-cache");
    context.Response.Headers.Append("Connection", "keep-alive");

    var channel = aggregator.Subscribe();

    try
    {
        await foreach (var dashboardEvent in channel.Reader.ReadAllAsync(cancellationToken))
        {
            var json = JsonSerializer.Serialize(dashboardEvent);
            await context.Response.WriteAsync($"data: {json}\n\n", cancellationToken);
            await context.Response.Body.FlushAsync(cancellationToken);
        }
    }
    catch (OperationCanceledException)
    {
    }
    finally
    {
        aggregator.Unsubscribe(channel);
    }
})
    .WithName("StreamEvents")
    .WithOpenApi();

app.MapPost("/api/mock/burst", (MockEventGenerator generator) =>
{
    generator.TriggerBurst(50);
    return Results.Ok(new { message = "Burst triggered", count = 50 });
})
    .WithName("TriggerBurst")
    .WithOpenApi();

app.MapPost("/api/mock/rate", (int eventsPerSecond, MockEventGenerator generator) =>
{
    generator.SetEventRate(eventsPerSecond);
    return Results.Ok(new { message = "Rate updated", eventsPerSecond });
})
    .WithName("SetMockRate")
    .WithOpenApi();

await app.RunAsync();

public partial class Program { }
