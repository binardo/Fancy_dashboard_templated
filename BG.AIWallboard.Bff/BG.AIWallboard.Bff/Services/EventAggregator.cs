using System.Collections.Concurrent;
using System.Threading.Channels;
using BG.AIWallboard.Bff.Models;

namespace BG.AIWallboard.Bff.Services;

public class EventAggregator
{
    private readonly DashboardConfiguration _config;
    private readonly ConcurrentDictionary<string, UserStats> _userStats = new();
    private readonly ConcurrentDictionary<string, int> _appCounts = new();
    private readonly ConcurrentDictionary<string, int> _departmentCounts = new();
    private readonly ConcurrentQueue<DashboardEvent> _recentEvents = new();
    private readonly List<Channel<DashboardEvent>> _subscribers = new();
    private readonly object _subscriberLock = new();
    private int _totalCallsToday = 0;
    private DateTime _lastResetDate = DateTime.UtcNow.Date;

    public EventAggregator(DashboardConfiguration config)
    {
        _config = config;
        foreach (var app in config.MonitoredApps)
        {
            _appCounts[app.AppId] = 0;
        }
        foreach (var dept in config.Departments)
        {
            _departmentCounts[dept.DeptId] = 0;
        }
    }

    public void ProcessEvent(DashboardEvent evt)
    {
        CheckDayReset();

        Interlocked.Increment(ref _totalCallsToday);

        _appCounts.AddOrUpdate(evt.Application, 1, (_, count) => count + 1);
        _departmentCounts.AddOrUpdate(evt.Department, 1, (_, count) => count + 1);

        _userStats.AddOrUpdate(
            evt.UserDisplayName,
            new UserStats
            {
                UserDisplayName = evt.UserDisplayName,
                CallsToday = 1,
                TokensInToday = evt.TokensIn,
                TokensOutToday = evt.TokensOut,
                Department = evt.Department
            },
            (_, existing) => existing with
            {
                CallsToday = existing.CallsToday + 1,
                TokensInToday = existing.TokensInToday + evt.TokensIn,
                TokensOutToday = existing.TokensOutToday + evt.TokensOut
            }
        );

        _recentEvents.Enqueue(evt);
        while (_recentEvents.Count > _config.MaxEventListSize)
        {
            _recentEvents.TryDequeue(out _);
        }

        BroadcastEvent(evt);
    }

    private void CheckDayReset()
    {
        var today = DateTime.UtcNow.Date;
        if (today > _lastResetDate)
        {
            _lastResetDate = today;
            _totalCallsToday = 0;
            _userStats.Clear();
            foreach (var key in _appCounts.Keys)
            {
                _appCounts[key] = 0;
            }
            foreach (var key in _departmentCounts.Keys)
            {
                _departmentCounts[key] = 0;
            }
            while (_recentEvents.TryDequeue(out _)) { }
        }
    }

    public DashboardAggregates GetAggregates()
    {
        CheckDayReset();

        var appStats = _config.MonitoredApps
            .Select(app => new AppStats
            {
                AppId = app.AppId,
                DisplayName = app.DisplayName,
                Color = app.Color,
                CallsToday = _appCounts.GetValueOrDefault(app.AppId, 0)
            })
            .OrderByDescending(a => a.CallsToday)
            .ToList();

        var topUsers = _userStats.Values
            .OrderByDescending(u => u.CallsToday)
            .Take(5)
            .ToList();

        return new DashboardAggregates
        {
            TotalCallsToday = _totalCallsToday,
            AppStats = appStats,
            TopUsers = topUsers,
            DepartmentCounts = _departmentCounts.ToDictionary(kvp => kvp.Key, kvp => kvp.Value),
            ConnectionStatus = "Connected",
            DataMode = "Mock"
        };
    }

    public List<DashboardEvent> GetRecentEvents()
    {
        return _recentEvents.ToList().OrderByDescending(e => e.TimestampUtc).ToList();
    }

    public Channel<DashboardEvent> Subscribe()
    {
        var channel = Channel.CreateUnbounded<DashboardEvent>();
        lock (_subscriberLock)
        {
            _subscribers.Add(channel);
        }
        return channel;
    }

    public void Unsubscribe(Channel<DashboardEvent> channel)
    {
        lock (_subscriberLock)
        {
            _subscribers.Remove(channel);
        }
        channel.Writer.Complete();
    }

    private void BroadcastEvent(DashboardEvent evt)
    {
        lock (_subscriberLock)
        {
            foreach (var subscriber in _subscribers.ToList())
            {
                if (!subscriber.Writer.TryWrite(evt))
                {
                    _subscribers.Remove(subscriber);
                    subscriber.Writer.Complete();
                }
            }
        }
    }
}
