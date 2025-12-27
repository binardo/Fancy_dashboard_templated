import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-container">
      <div class="status-row">
        <span class="status-label">Connection</span>
        <div class="status-indicator" [class]="dashboardService.connectionStatus()">
          <span class="status-dot"></span>
          <span class="status-text">{{ getStatusText() }}</span>
        </div>
      </div>
      <div class="controls">
        <label class="rate-control">
          <span>Event Rate:</span>
          <input 
            type="range" 
            min="1" 
            max="20" 
            [value]="eventRate"
            (input)="onRateChange($event)"
          />
          <span class="rate-value">{{ eventRate }}/s</span>
        </label>
        <button class="burst-btn" (click)="triggerBurst()">
          Burst Mode
        </button>
      </div>
    </div>
  `,
  styles: [`
    .status-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-3);
      background: var(--color-bg-panel);
      border-radius: 8px;
      border: 1px solid var(--color-border);
    }

    .status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .status-label {
      font-size: 12px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--color-text-muted);
    }

    .status-indicator.connected .status-dot,
    .status-indicator.mock .status-dot {
      background: var(--color-green);
      box-shadow: 0 0 10px var(--color-green-glow);
    }

    .status-indicator.connecting .status-dot,
    .status-indicator.reconnecting .status-dot {
      background: var(--color-yellow);
      animation: pulse-glow 1s infinite;
    }

    .status-indicator.offline .status-dot {
      background: var(--color-orange);
    }

    .status-text {
      font-size: 13px;
      color: var(--color-text-primary);
      font-weight: 500;
    }

    .controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .rate-control {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    .rate-control input[type="range"] {
      flex: 1;
      height: 4px;
      background: var(--color-border);
      border-radius: 2px;
      appearance: none;
      cursor: pointer;
    }

    .rate-control input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 14px;
      height: 14px;
      background: var(--color-cyan);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 8px var(--color-cyan-glow);
    }

    .rate-value {
      min-width: 40px;
      text-align: right;
      color: var(--color-cyan);
      font-weight: 500;
    }

    .burst-btn {
      background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
      border: none;
      color: white;
      padding: var(--space-2) var(--space-3);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .burst-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px var(--color-purple-glow);
    }

    .burst-btn:active {
      transform: translateY(0);
    }
  `]
})
export class StatusIndicatorComponent {
  readonly dashboardService = inject(DashboardService);
  eventRate = 3;

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

  onRateChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.eventRate = parseInt(target.value, 10);
    this.dashboardService.setEventRate(this.eventRate);
  }

  triggerBurst(): void {
    this.dashboardService.triggerBurst();
  }
}
