import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';

@Component({
  selector: 'app-top-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart-container">
      <h3 class="chart-title">AI Platform</h3>
      <div class="bars">
        @for (app of sortedAppStats(); track app.appId) {
          <div class="bar-row">
            <span class="bar-label">{{ app.displayName }}</span>
            <div class="bar-track">
              <div 
                class="bar-fill" 
                [style.width.%]="getBarWidth(app.callsToday)"
                [style.background]="app.color"
                [style.box-shadow]="'0 0 10px ' + app.color + '80'">
              </div>
            </div>
            <span class="bar-value">{{ app.callsToday | number }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bar-chart-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .chart-title {
      font-size: 14px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--space-3);
    }

    .bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      flex: 1;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .bar-label {
      flex: 0 0 100px;
      font-size: 13px;
      color: var(--color-text-primary);
      text-align: right;
    }

    .bar-track {
      flex: 1;
      height: 20px;
      background: var(--color-bg-panel);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease-out;
      min-width: 2px;
    }

    .bar-value {
      flex: 0 0 80px;
      font-size: 13px;
      color: var(--color-text-secondary);
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
  `]
})
export class TopBarChartComponent {
  private readonly dashboardService = inject(DashboardService);
  
  readonly sortedAppStats = computed(() => {
    const stats = this.dashboardService.appStats();
    return [...stats].sort((a, b) => b.callsToday - a.callsToday);
  });

  readonly maxCalls = computed(() => {
    const stats = this.sortedAppStats();
    return stats.length > 0 ? Math.max(...stats.map(s => s.callsToday), 1) : 1;
  });

  getBarWidth(calls: number): number {
    return (calls / this.maxCalls()) * 100;
  }
}
