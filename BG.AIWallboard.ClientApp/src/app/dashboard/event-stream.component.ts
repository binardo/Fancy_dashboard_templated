import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';

@Component({
  selector: 'app-event-stream',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="event-stream-container">
      <div class="stream-header">
        <h3 class="section-title">AI Data Stream</h3>
        <button class="refresh-btn" (click)="dashboardService.triggerBurst()" title="Trigger burst">
          &#8635;
        </button>
      </div>
      
      <div class="stream-status">
        <span class="status-dot" [class]="dashboardService.connectionStatus()"></span>
        <span class="status-text">{{ getStatusText() }}</span>
        <span class="timestamp">{{ currentTime | date:'HH:mm:ss' }}</span>
      </div>

      <div class="events-list">
        @for (event of dashboardService.recentEvents(); track event.eventId; let i = $index) {
          <div class="event-card" [class.new]="i === 0" [style.animation-delay]="i * 50 + 'ms'">
            <div class="event-header">
              <span class="event-time">{{ event.timestampUtc | date:'HH:mm:ss' }}</span>
              <span class="event-user">User: <strong>{{ event.userDisplayName }}</strong></span>
            </div>
            <div class="event-meta">
              <span class="platform-badge" [style.background]="getAppColor(event.application)">
                {{ getAppDisplayName(event.application) }}
              </span>
              <span class="model-name">{{ event.model }}</span>
            </div>
            <div class="event-details">
              @for (detail of parseEventDetails(event); track detail.label) {
                <div class="detail-item">
                  <span class="detail-label" [style.color]="detail.color">{{ detail.label }}</span>
                  <span class="detail-value">{{ detail.value }}</span>
                </div>
              }
            </div>
          </div>
        }
        @if (dashboardService.recentEvents().length === 0) {
          <div class="no-events">Waiting for events...</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .event-stream-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .stream-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-2);
    }

    .section-title {
      font-size: 14px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }

    .refresh-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      width: 28px;
      height: 28px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s;
    }

    .refresh-btn:hover {
      background: var(--color-bg-panel);
      color: var(--color-cyan);
      border-color: var(--color-cyan);
    }

    .stream-status {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2);
      background: var(--color-bg-panel);
      border-radius: 4px;
      margin-bottom: var(--space-3);
      font-size: 12px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-text-muted);
    }

    .status-dot.connected, .status-dot.mock {
      background: var(--color-green);
      box-shadow: 0 0 8px var(--color-green-glow);
    }

    .status-dot.connecting, .status-dot.reconnecting {
      background: var(--color-yellow);
      animation: pulse-glow 1s infinite;
    }

    .status-dot.offline {
      background: var(--color-orange);
    }

    .status-text {
      color: var(--color-text-secondary);
      flex: 1;
    }

    .timestamp {
      color: var(--color-text-muted);
      font-variant-numeric: tabular-nums;
    }

    .events-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .event-card {
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: var(--space-2);
      animation: slide-in 0.3s ease-out;
    }

    .event-card.new {
      border-color: var(--color-cyan);
      box-shadow: 0 0 10px var(--color-cyan-glow);
    }

    .event-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-1);
    }

    .event-time {
      font-size: 12px;
      color: var(--color-text-muted);
      font-variant-numeric: tabular-nums;
    }

    .event-user {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .event-user strong {
      color: var(--color-cyan);
    }

    .event-meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-2);
    }

    .platform-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      color: white;
      font-weight: 500;
    }

    .model-name {
      font-size: 11px;
      color: var(--color-text-secondary);
    }

    .event-details {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .detail-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .detail-value {
      font-size: 11px;
      color: var(--color-text-primary);
      font-variant-numeric: tabular-nums;
    }

    .no-events {
      text-align: center;
      color: var(--color-text-muted);
      padding: var(--space-4);
    }
  `]
})
export class EventStreamComponent {
  readonly dashboardService = inject(DashboardService);
  
  currentTime = new Date();

  private readonly appColors: Record<string, string> = {
    chatgpt: '#10b981',
    sidekick: '#22d3ee',
    cursor: '#3b82f6',
    vscode: '#8b5cf6',
    aiplayground: '#f97316',
    perplexity: '#ec4899'
  };

  private readonly appNames: Record<string, string> = {
    chatgpt: 'ChatGPT',
    sidekick: 'Sidekick',
    cursor: 'Cursor',
    vscode: 'VS Code',
    aiplayground: 'AI Playground',
    perplexity: 'Perplexity'
  };

  constructor() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  getStatusText(): string {
    const status = this.dashboardService.connectionStatus();
    switch (status) {
      case 'connected': return 'Live';
      case 'mock': return 'Mock Data';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'offline': return 'Offline';
      default: return status;
    }
  }

  getAppColor(appId: string): string {
    return this.appColors[appId] || '#888888';
  }

  getAppDisplayName(appId: string): string {
    return this.appNames[appId] || appId;
  }

  parseEventDetails(event: { tokensIn: number; tokensOut: number; durationMs: number; department: string }): Array<{ label: string; value: string; color: string }> {
    return [
      { label: 'Tokens In', value: event.tokensIn.toLocaleString(), color: '#22d3ee' },
      { label: 'Tokens Out', value: event.tokensOut.toLocaleString(), color: '#a855f7' },
      { label: 'Duration', value: (event.durationMs / 1000).toFixed(1) + 's', color: '#f97316' },
      { label: 'Dept', value: event.department, color: '#10b981' }
    ];
  }
}
