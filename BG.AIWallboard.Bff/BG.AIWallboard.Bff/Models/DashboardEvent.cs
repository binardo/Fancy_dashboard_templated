namespace BG.AIWallboard.Bff.Models;

public record DashboardEvent
{
    public string EventId { get; init; } = Guid.NewGuid().ToString();
    public DateTime TimestampUtc { get; init; } = DateTime.UtcNow;
    public string UserDisplayName { get; init; } = "Unknown";
    public string Department { get; init; } = "Other";
    public string Application { get; init; } = "Unknown";
    public string Model { get; init; } = "Unknown";
    public int TokensIn { get; init; }
    public int TokensOut { get; init; }
    public int DurationMs { get; init; }
    public string RawMessage { get; init; } = "";
    public string FormattedMessage => $"{UserDisplayName} called {Model} through {Application} in/out tokens {TokensIn}/{TokensOut} taking {DurationMs / 1000.0:F1}s";
}

public record Department
{
    public string DeptId { get; init; } = "";
    public string DisplayName { get; init; } = "";
    public string Color { get; init; } = "#888888";
    public string BrainSegmentId { get; init; } = "";
    public ClusterPosition PeopleClusterPosition { get; init; } = new();
}

public record ClusterPosition
{
    public double X { get; init; }
    public double Y { get; init; }
}

public record MonitoredApp
{
    public string AppId { get; init; } = "";
    public string DisplayName { get; init; } = "";
    public string SeqFilter { get; init; } = "";
    public string Color { get; init; } = "#888888";
}

public record UserStats
{
    public string UserDisplayName { get; init; } = "";
    public int CallsToday { get; init; }
    public long TokensInToday { get; init; }
    public long TokensOutToday { get; init; }
    public string Department { get; init; } = "";
}

public record AppStats
{
    public string AppId { get; init; } = "";
    public string DisplayName { get; init; } = "";
    public string Color { get; init; } = "";
    public int CallsToday { get; init; }
}

public record DashboardAggregates
{
    public int TotalCallsToday { get; init; }
    public List<AppStats> AppStats { get; init; } = new();
    public List<UserStats> TopUsers { get; init; } = new();
    public Dictionary<string, int> DepartmentCounts { get; init; } = new();
    public string ConnectionStatus { get; init; } = "Connected";
    public string DataMode { get; init; } = "Mock";
}
