using BG.AIWallboard.Bff.Models;

namespace BG.AIWallboard.Bff.Services;

public class DashboardConfiguration
{
    public List<Department> Departments { get; } = new()
    {
        new Department
        {
            DeptId = "investors",
            DisplayName = "Investors",
            Color = "#22d3ee",
            BrainSegmentId = "investors",
            PeopleClusterPosition = new ClusterPosition { X = 10, Y = 70 }
        },
        new Department
        {
            DeptId = "client",
            DisplayName = "Client",
            Color = "#f97316",
            BrainSegmentId = "client",
            PeopleClusterPosition = new ClusterPosition { X = 25, Y = 75 }
        },
        new Department
        {
            DeptId = "legal",
            DisplayName = "Legal",
            Color = "#eab308",
            BrainSegmentId = "legal",
            PeopleClusterPosition = new ClusterPosition { X = 40, Y = 80 }
        },
        new Department
        {
            DeptId = "is",
            DisplayName = "IS",
            Color = "#a855f7",
            BrainSegmentId = "is",
            PeopleClusterPosition = new ClusterPosition { X = 55, Y = 75 }
        },
        new Department
        {
            DeptId = "hr",
            DisplayName = "HR",
            Color = "#3b82f6",
            BrainSegmentId = "hr",
            PeopleClusterPosition = new ClusterPosition { X = 35, Y = 85 }
        },
        new Department
        {
            DeptId = "finance",
            DisplayName = "Finance",
            Color = "#10b981",
            BrainSegmentId = "finance",
            PeopleClusterPosition = new ClusterPosition { X = 50, Y = 85 }
        },
        new Department
        {
            DeptId = "operations",
            DisplayName = "Operations",
            Color = "#22c55e",
            BrainSegmentId = "operations",
            PeopleClusterPosition = new ClusterPosition { X = 70, Y = 75 }
        }
    };

    public List<MonitoredApp> MonitoredApps { get; } = new()
    {
        new MonitoredApp
        {
            AppId = "chatgpt",
            DisplayName = "ChatGPT",
            SeqFilter = "Application = 'chatgpt'",
            Color = "#10b981"
        },
        new MonitoredApp
        {
            AppId = "sidekick",
            DisplayName = "Sidekick",
            SeqFilter = "Application = 'sidekick'",
            Color = "#22d3ee"
        },
        new MonitoredApp
        {
            AppId = "cursor",
            DisplayName = "Cursor",
            SeqFilter = "Application = 'cursor'",
            Color = "#3b82f6"
        },
        new MonitoredApp
        {
            AppId = "vscode",
            DisplayName = "VS Code",
            SeqFilter = "Application = 'vscode'",
            Color = "#8b5cf6"
        },
        new MonitoredApp
        {
            AppId = "aiplayground",
            DisplayName = "AI Playground",
            SeqFilter = "Application = 'aiplayground'",
            Color = "#f97316"
        },
        new MonitoredApp
        {
            AppId = "perplexity",
            DisplayName = "Perplexity",
            SeqFilter = "Application = 'perplexity'",
            Color = "#ec4899"
        }
    };

    public int PlaybackLagSeconds { get; } = 5;
    public int MaxEventListSize { get; } = 50;
    public int ReorderingWindowSeconds { get; } = 2;

    public string[] UserNames { get; } = new[]
    {
        "Joe Bloggs", "Jane Smith", "John Doe", "Alice Johnson", "Bob Wilson",
        "Charlie Brown", "Diana Ross", "Edward Norton", "Fiona Apple", "George Lucas",
        "Helen Troy", "Ivan Petrov", "Julia Roberts", "Kevin Hart", "Laura Palmer",
        "Michael Scott", "Nancy Drew", "Oscar Wilde", "Patricia Green", "Quinn Hughes",
        "Rachel Green", "Steve Rogers", "Tina Turner", "Uma Thurman", "Victor Hugo"
    };

    public string[] ModelNames { get; } = new[]
    {
        "GPT-4", "GPT-4o", "GPT-3.5-turbo", "Claude-3", "Claude-3.5-Sonnet",
        "Gemini-Pro", "Llama-3", "Mistral-7B", "Codex", "DALL-E-3"
    };
}
