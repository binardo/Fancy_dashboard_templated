using BG.AIWallboard.Bff.Models;

namespace BG.AIWallboard.Bff.Services;

public class MockEventBackgroundService : BackgroundService
{
    private readonly MockEventGenerator _generator;
    private readonly EventAggregator _aggregator;
    private readonly ILogger<MockEventBackgroundService> _logger;

    public MockEventBackgroundService(
        MockEventGenerator generator,
        EventAggregator aggregator,
        ILogger<MockEventBackgroundService> logger)
    {
        _generator = generator;
        _aggregator = aggregator;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Mock Event Background Service starting...");

        var initialEvents = _generator.GenerateInitialEvents(100);
        foreach (var evt in initialEvents.OrderBy(e => e.TimestampUtc))
        {
            _aggregator.ProcessEvent(evt);
        }
        _logger.LogInformation("Generated {Count} initial events", initialEvents.Count);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var burstRemaining = _generator.GetAndDecrementBurst();
                if (burstRemaining > 0)
                {
                    var evt = _generator.GenerateEvent();
                    _aggregator.ProcessEvent(evt);
                    await Task.Delay(20, stoppingToken);
                }
                else
                {
                    var rate = _generator.GetEventRate();
                    var delayMs = 1000 / rate;

                    var evt = _generator.GenerateEvent();
                    _aggregator.ProcessEvent(evt);

                    await Task.Delay(delayMs, stoppingToken);
                }
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating mock event");
                await Task.Delay(1000, stoppingToken);
            }
        }

        _logger.LogInformation("Mock Event Background Service stopping...");
    }
}
