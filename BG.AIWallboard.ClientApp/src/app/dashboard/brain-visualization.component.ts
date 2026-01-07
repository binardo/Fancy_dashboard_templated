import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';

@Component({
  selector: 'app-brain-visualization',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="brain-container">
      <svg viewBox="0 0 600 450" class="brain-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <!-- Glow filters for each department -->
          @for (dept of departments(); track dept.deptId) {
            <filter [id]="'glow-overlay-' + dept.deptId" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur [attr.stdDeviation]="isSegmentActive(dept.deptId) ? 20 : 0" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          }
          
          <!-- Global glow filter for active state -->
          <filter id="active-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Brain PNG image as base -->
        <image 
          href="brain.png" 
          x="50" 
          y="25" 
          width="500" 
          height="400"
          preserveAspectRatio="xMidYMid meet"
        />

        <!-- Invisible overlay regions for glow effects -->
        <g class="glow-overlays">
          <!-- Investors (Orange frontal lobe area - top left) -->
          <ellipse 
            class="glow-region"
            [class.active]="isSegmentActive('investors')"
            cx="200" cy="130" rx="70" ry="55"
            [attr.fill]="getSegmentColor('investors')"
            [attr.filter]="isSegmentActive('investors') ? 'url(#active-glow)' : 'none'"
          />

          <!-- Client (Orange/red lower frontal - middle left) -->
          <ellipse 
            class="glow-region"
            [class.active]="isSegmentActive('client')"
            cx="175" cy="220" rx="50" ry="40"
            [attr.fill]="getSegmentColor('client')"
            [attr.filter]="isSegmentActive('client') ? 'url(#active-glow)' : 'none'"
          />

          <!-- Legal (Purple/pink parietal - top center) -->
          <ellipse 
            class="glow-region"
            [class.active]="isSegmentActive('legal')"
            cx="320" cy="110" rx="65" ry="50"
            [attr.fill]="getSegmentColor('legal')"
            [attr.filter]="isSegmentActive('legal') ? 'url(#active-glow)' : 'none'"
          />

          <!-- IS (Purple area - top right) -->
          <ellipse 
            class="glow-region"
            [class.active]="isSegmentActive('is')"
            cx="420" cy="140" rx="55" ry="50"
            [attr.fill]="getSegmentColor('is')"
            [attr.filter]="isSegmentActive('is') ? 'url(#active-glow)' : 'none'"
          />

          <!-- HR (Cyan/blue temporal - center) -->
          <ellipse 
            class="glow-region"
            [class.active]="isSegmentActive('hr')"
            cx="280" cy="230" rx="60" ry="45"
            [attr.fill]="getSegmentColor('hr')"
            [attr.filter]="isSegmentActive('hr') ? 'url(#active-glow)' : 'none'"
          />

          <!-- Finance (Green occipital - right side) -->
          <ellipse 
            class="glow-region"
            [class.active]="isSegmentActive('finance')"
            cx="470" cy="220" rx="55" ry="50"
            [attr.fill]="getSegmentColor('finance')"
            [attr.filter]="isSegmentActive('finance') ? 'url(#active-glow)' : 'none'"
          />

          <!-- Operations (Pink cerebellum - bottom right) -->
          <ellipse 
            class="glow-region"
            [class.active]="isSegmentActive('operations')"
            cx="430" cy="330" rx="50" ry="40"
            [attr.fill]="getSegmentColor('operations')"
            [attr.filter]="isSegmentActive('operations') ? 'url(#active-glow)' : 'none'"
          />
        </g>

        <!-- Department labels -->
        <g class="labels">
          <text x="200" y="130" class="segment-label">Investors</text>
          <text x="175" y="220" class="segment-label">Client</text>
          <text x="320" y="110" class="segment-label">Legal</text>
          <text x="420" y="140" class="segment-label">IS</text>
          <text x="280" y="230" class="segment-label">HR</text>
          <text x="470" y="220" class="segment-label">Finance</text>
          <text x="430" y="330" class="segment-label">Operations</text>
        </g>

        <!-- Animated pulse dots -->
        @for (event of animatingEvents(); track event.eventId) {
          @if (event.animationPhase === 'pulse-to-brain' || event.animationPhase === 'brain-glow') {
            <circle 
              class="pulse-dot"
              [attr.cx]="getPulsePosition(event).x"
              [attr.cy]="getPulsePosition(event).y"
              r="8"
              [attr.fill]="getDepartmentColor(event.department)"
            />
          }
        }
      </svg>
    </div>
  `,
  styles: [`
    .brain-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2);
    }

    .brain-svg {
      width: 100%;
      max-width: 600px;
      height: auto;
    }

    .glow-region {
      opacity: 0;
      transition: opacity 0.3s ease;
      mix-blend-mode: screen;
      pointer-events: none;
    }

    .glow-region.active {
      opacity: 0.5;
      animation: region-pulse 0.8s ease-in-out;
    }

    .segment-label {
      font-size: 14px;
      font-weight: 700;
      fill: white;
      text-anchor: middle;
      dominant-baseline: middle;
      pointer-events: none;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.9)) drop-shadow(0 0 8px rgba(0,0,0,0.7));
    }

    .pulse-dot {
      animation: pulse-glow 0.5s ease-in-out infinite;
      filter: drop-shadow(0 0 12px currentColor);
    }

    @keyframes region-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.7; }
    }

    @keyframes pulse-glow {
      0%, 100% { 
        r: 8;
        opacity: 1;
      }
      50% { 
        r: 16;
        opacity: 0.6;
      }
    }
  `]
})
export class BrainVisualizationComponent {
  private readonly dashboardService = inject(DashboardService);

  readonly departments = computed(() => this.dashboardService.departments());
  readonly animatingEvents = computed(() => this.dashboardService.animatingEvents());

  private readonly departmentColors: Record<string, string> = {
    investors: '#22d3ee',
    client: '#f97316',
    legal: '#eab308',
    is: '#a855f7',
    hr: '#3b82f6',
    finance: '#10b981',
    operations: '#22c55e'
  };

  private readonly segmentCenters: Record<string, { x: number; y: number }> = {
    investors: { x: 200, y: 130 },
    client: { x: 175, y: 220 },
    legal: { x: 320, y: 110 },
    is: { x: 420, y: 140 },
    hr: { x: 280, y: 230 },
    finance: { x: 470, y: 220 },
    operations: { x: 430, y: 330 }
  };

  getSegmentColor(deptId: string): string {
    return this.departmentColors[deptId] || '#888888';
  }

  getDarkerColor(deptId: string): string {
    const color = this.departmentColors[deptId] || '#888888';
    return color.replace(/^#/, '#0');
  }

  getDepartmentColor(deptId: string): string {
    return this.departmentColors[deptId] || '#888888';
  }

  isSegmentActive(deptId: string): boolean {
    return this.animatingEvents().some(
      e => e.department === deptId && 
           (e.animationPhase === 'brain-glow' || e.animationPhase === 'pulse-to-brain')
    );
  }

  getGlowIntensity(deptId: string): number {
    const isActive = this.isSegmentActive(deptId);
    return isActive ? 12 : 4;
  }

  getPulsePosition(event: { department: string }): { x: number; y: number } {
    return this.segmentCenters[event.department] || { x: 250, y: 175 };
  }
}
