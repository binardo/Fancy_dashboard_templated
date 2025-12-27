import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';

@Component({
  selector: 'app-top-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="top-users-container">
      <h3 class="section-title">Top AI Users Today</h3>
      <div class="users-list">
        @for (user of dashboardService.topUsers(); track user.userDisplayName; let i = $index) {
          <div class="user-card" [class.highlight]="i === 0">
            <div class="rank">{{ i + 1 }}</div>
            <div class="user-avatar" [style.background]="getAvatarColor(user.department)">
              {{ getInitials(user.userDisplayName) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ user.userDisplayName }}</span>
              <div class="user-stats">
                <span class="stat">
                  <span class="stat-icon">&#9650;</span>
                  {{ user.tokensInToday | number }}
                </span>
                <span class="stat">
                  <span class="stat-icon">&#9660;</span>
                  {{ user.tokensOutToday | number }}
                </span>
              </div>
            </div>
            <div class="calls-count">{{ user.callsToday }}</div>
          </div>
        }
        @if (dashboardService.topUsers().length === 0) {
          <div class="no-data">No activity yet</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .top-users-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .section-title {
      font-size: 14px;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--space-4);
    }

    .users-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2);
      background: var(--color-bg-panel);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      transition: all 0.3s ease;
    }

    .user-card.highlight {
      border-color: var(--color-cyan);
      box-shadow: 0 0 15px var(--color-cyan-glow);
    }

    .rank {
      width: 20px;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-muted);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }

    .user-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-stats {
      display: flex;
      gap: var(--space-2);
      font-size: 11px;
      color: var(--color-text-muted);
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .stat-icon {
      font-size: 8px;
    }

    .calls-count {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-cyan);
      text-shadow: 0 0 10px var(--color-cyan-glow);
    }

    .no-data {
      text-align: center;
      color: var(--color-text-muted);
      padding: var(--space-4);
    }
  `]
})
export class TopUsersComponent {
  readonly dashboardService = inject(DashboardService);

  private readonly departmentColors: Record<string, string> = {
    investors: '#22d3ee',
    client: '#f97316',
    legal: '#eab308',
    is: '#a855f7',
    hr: '#3b82f6',
    finance: '#10b981',
    operations: '#22c55e'
  };

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAvatarColor(department: string): string {
    return this.departmentColors[department] || '#888888';
  }
}
