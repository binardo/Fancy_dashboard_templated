import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './core/dashboard.service';
import { TopBarChartComponent } from './dashboard/top-bar-chart.component';
import { TopUsersComponent } from './dashboard/top-users.component';
import { BrainVisualizationComponent } from './dashboard/brain-visualization.component';
import { StickPeopleComponent } from './dashboard/stick-people.component';
import { EventStreamComponent } from './dashboard/event-stream.component';
import { StatusIndicatorComponent } from './dashboard/status-indicator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TopBarChartComponent,
    TopUsersComponent,
    BrainVisualizationComponent,
    StickPeopleComponent,
    EventStreamComponent,
    StatusIndicatorComponent
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-left">
          <div class="total-calls">
            <span class="label">AI Calls Today</span>
            <span class="value">{{ dashboardService.totalCallsToday() | number }}</span>
            <span class="sublabel">Today So Far</span>
          </div>
        </div>
        <div class="header-center">
          <app-top-bar-chart />
        </div>
        <div class="header-right">
          <app-status-indicator />
        </div>
      </header>

      <main class="dashboard-main">
        <aside class="left-panel">
          <app-top-users />
        </aside>

        <section class="center-panel">
          <app-brain-visualization />
          <app-stick-people />
        </section>

        <aside class="right-panel">
          <app-event-stream />
        </aside>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      background: var(--color-bg-dark);
      overflow: hidden;
    }

    .dashboard-header {
      display: flex;
      align-items: stretch;
      padding: var(--space-4);
      border-bottom: 1px solid var(--color-border);
      gap: var(--space-4);
      min-height: 120px;
    }

    .header-left {
      flex: 0 0 200px;
    }

    .header-center {
      flex: 1;
      min-width: 0;
    }

    .header-right {
      flex: 0 0 280px;
    }

    .total-calls {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .total-calls .label {
      font-size: 14px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .total-calls .value {
      font-size: 48px;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
      text-shadow: 0 0 20px var(--color-cyan-glow);
    }

    .total-calls .sublabel {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .dashboard-main {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .left-panel {
      flex: 0 0 240px;
      padding: var(--space-4);
      border-right: 1px solid var(--color-border);
      overflow-y: auto;
    }

    .center-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      min-width: 0;
      overflow: hidden;
    }

    .right-panel {
      flex: 0 0 320px;
      padding: var(--space-4);
      border-left: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    @media (max-width: 1280px) {
      .left-panel {
        flex: 0 0 200px;
      }
      .right-panel {
        flex: 0 0 280px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  readonly dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.dashboardService.initialize();
  }
}
