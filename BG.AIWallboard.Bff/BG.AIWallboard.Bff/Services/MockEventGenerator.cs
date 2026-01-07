using BG.AIWallboard.Bff.Models;

namespace BG.AIWallboard.Bff.Services;

public class MockEventGenerator
{
    private readonly DashboardConfiguration _config;
    private readonly Random _random;
    private int _eventsPerSecond = 3;
    private int _burstCount = 0;
    private readonly object _lock = new();

    public MockEventGenerator(DashboardConfiguration config)
    {
        _config = config;
        _random = new Random(42);
    }

    public void SetEventRate(int eventsPerSecond)
    {
        lock (_lock)
        {
            _eventsPerSecond = Math.Clamp(eventsPerSecond, 1, 50);
        }
    }

    public int GetEventRate()
    {
        lock (_lock)
        {
            return _eventsPerSecond;
        }
    }

    public void TriggerBurst(int count)
    {
        lock (_lock)
        {
            _burstCount = count;
        }
    }

    public int GetAndDecrementBurst()
    {
        lock (_lock)
        {
            if (_burstCount > 0)
            {
                _burstCount--;
                return _burstCount + 1;
            }
            return 0;
        }
    }

    public DashboardEvent GenerateEvent()
    {
        var department = _config.Departments[_random.Next(_config.Departments.Count)];
        var app = _config.MonitoredApps[_random.Next(_config.MonitoredApps.Count)];
        var user = _config.UserNames[_random.Next(_config.UserNames.Length)];
        var model = _config.ModelNames[_random.Next(_config.ModelNames.Length)];

        var tokensIn = _random.Next(50, 2000);
        var tokensOut = _random.Next(100, 4000);
        var durationMs = _random.Next(500, 15000);

        return new DashboardEvent
        {
            EventId = Guid.NewGuid().ToString(),
            TimestampUtc = DateTime.UtcNow,
            UserDisplayName = user,
            Department = department.DeptId,
            Application = app.AppId,
            Model = model,
            TokensIn = tokensIn,
            TokensOut = tokensOut,
            DurationMs = durationMs,
            RawMessage = $"User {user} from {department.DisplayName} used {app.DisplayName} with model {model}"
        };
    }

    public List<DashboardEvent> GenerateInitialEvents(int count)
    {
        var events = new List<DashboardEvent>();
        var now = DateTime.UtcNow;

        for (int i = 0; i < count; i++)
        {
            var evt = GenerateEvent() with
            {
                TimestampUtc = now.AddSeconds(-_random.Next(0, 3600))
            };
            events.Add(evt);
        }

        return events.OrderByDescending(e => e.TimestampUtc).ToList();
    }
}
