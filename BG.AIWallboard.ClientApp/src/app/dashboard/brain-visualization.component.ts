import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';

@Component({
  selector: 'app-brain-visualization',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="brain-container">
      <svg viewBox="0 0 400 300" class="brain-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          @for (dept of departments(); track dept.deptId) {
            <filter [id]="'glow-' + dept.deptId" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur [attr.stdDeviation]="getGlowIntensity(dept.deptId)" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          }
        </defs>

        <!-- Brain outline base -->
        <g class="brain-base" transform="translate(80, 20)">
          <!-- Investors segment (left front) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('investors')"
            [attr.fill]="getSegmentColor('investors')"
            [attr.filter]="'url(#glow-investors)'"
            d="M60,180 Q20,150 30,100 Q40,60 80,50 Q100,45 110,60 L100,100 Q90,140 60,180 Z"
          />
          <text x="55" y="110" class="segment-label" fill="white">Investors</text>

          <!-- Client segment (left middle) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('client')"
            [attr.fill]="getSegmentColor('client')"
            [attr.filter]="'url(#glow-client)'"
            d="M100,100 L110,60 Q130,40 160,50 L150,90 Q130,110 100,100 Z"
          />
          <text x="115" y="75" class="segment-label" fill="white">Client</text>

          <!-- Legal segment (top) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('legal')"
            [attr.fill]="getSegmentColor('legal')"
            [attr.filter]="'url(#glow-legal)'"
            d="M160,50 Q180,30 210,35 Q240,40 250,60 L230,80 Q200,70 160,50 Z"
          />
          <text x="185" y="55" class="segment-label" fill="white">Legal</text>

          <!-- IS segment (right top) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('is')"
            [attr.fill]="getSegmentColor('is')"
            [attr.filter]="'url(#glow-is)'"
            d="M250,60 Q270,50 290,70 Q310,100 300,140 L270,120 Q260,90 250,60 Z"
          />
          <text x="265" y="90" class="segment-label" fill="white">IS</text>

          <!-- HR segment (bottom center) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('hr')"
            [attr.fill]="getSegmentColor('hr')"
            [attr.filter]="'url(#glow-hr)'"
            d="M100,100 Q130,110 150,90 L180,110 Q160,150 130,170 Q100,160 100,100 Z"
          />
          <text x="130" y="140" class="segment-label" fill="white">HR</text>

          <!-- Finance segment (bottom right) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('finance')"
            [attr.fill]="getSegmentColor('finance')"
            [attr.filter]="'url(#glow-finance)'"
            d="M180,110 L230,80 L270,120 Q260,160 220,180 Q180,170 180,110 Z"
          />
          <text x="210" y="145" class="segment-label" fill="white">Finance</text>

          <!-- Operations segment (right) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('operations')"
            [attr.fill]="getSegmentColor('operations')"
            [attr.filter]="'url(#glow-operations)'"
            d="M270,120 L300,140 Q310,180 280,210 Q250,220 220,180 Q260,160 270,120 Z"
          />
          <text x="255" y="180" class="segment-label" fill="white">Operations</text>
        </g>

        <!-- Animated pulse lines -->
        @for (event of animatingEvents(); track event.eventId) {
          @if (event.animationPhase === 'pulse-to-brain' || event.animationPhase === 'brain-glow') {
            <circle 
              class="pulse-dot"
              [attr.cx]="getPulsePosition(event).x"
              [attr.cy]="getPulsePosition(event).y"
              r="4"
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
      padding: var(--space-4);
    }

    .brain-svg {
      width: 100%;
      max-width: 600px;
      height: auto;
    }

    .brain-segment {
      opacity: 0.7;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .brain-segment:hover {
      opacity: 0.9;
    }

    .brain-segment.active {
      opacity: 1;
      animation: segment-pulse 0.8s ease-in-out;
    }

    .segment-label {
      font-size: 10px;
      font-weight: 500;
      pointer-events: none;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }

    .pulse-dot {
      animation: pulse-glow 0.5s ease-in-out infinite;
    }

    @keyframes segment-pulse {
      0%, 100% { opacity: 0.7; }
      50% { opacity: 1; filter: brightness(1.5); }
    }

    @keyframes pulse-glow {
      0%, 100% { 
        r: 4;
        opacity: 1;
      }
      50% { 
        r: 8;
        opacity: 0.7;
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
    investors: { x: 140, y: 130 },
    client: { x: 210, y: 95 },
    legal: { x: 265, y: 70 },
    is: { x: 350, y: 110 },
    hr: { x: 210, y: 155 },
    finance: { x: 290, y: 155 },
    operations: { x: 340, y: 190 }
  };

  getSegmentColor(deptId: string): string {
    return this.departmentColors[deptId] || '#888888';
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
    return isActive ? 8 : 3;
  }

  getPulsePosition(event: { department: string }): { x: number; y: number } {
    return this.segmentCenters[event.department] || { x: 200, y: 150 };
  }
}
