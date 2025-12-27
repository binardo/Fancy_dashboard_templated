import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';

@Component({
  selector: 'app-brain-visualization',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="brain-container">
      <svg viewBox="0 0 500 350" class="brain-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <!-- Gradients for 3D effect -->
          <radialGradient id="brain-base-gradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stop-color="#1a1a2e" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#0a0a15" stop-opacity="0.95"/>
          </radialGradient>
          
          @for (dept of departments(); track dept.deptId) {
            <radialGradient [id]="'gradient-' + dept.deptId" cx="40%" cy="30%" r="70%">
              <stop offset="0%" [attr.stop-color]="getSegmentColor(dept.deptId)" stop-opacity="0.9"/>
              <stop offset="70%" [attr.stop-color]="getSegmentColor(dept.deptId)" stop-opacity="0.6"/>
              <stop offset="100%" [attr.stop-color]="getDarkerColor(dept.deptId)" stop-opacity="0.4"/>
            </radialGradient>
            <filter [id]="'glow-' + dept.deptId" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur [attr.stdDeviation]="isSegmentActive(dept.deptId) ? 12 : 4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          }
        </defs>

        <!-- Brain shadow/base layer -->
        <ellipse cx="250" cy="175" rx="180" ry="140" fill="url(#brain-base-gradient)" opacity="0.3"/>

        <!-- Brain outline - realistic side view -->
        <g class="brain-lobes" transform="translate(50, 25)">
          
          <!-- Investors (Frontal lobe - left front, cyan) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('investors')"
            [attr.fill]="'url(#gradient-investors)'"
            [attr.filter]="'url(#glow-investors)'"
            d="M80,200 
               C50,180 30,140 40,100 
               C50,60 80,35 120,30 
               C150,28 170,40 180,60
               L170,80 
               C160,100 150,130 140,160
               C130,180 110,195 80,200 Z"
          />
          <text x="85" y="120" class="segment-label">Investors</text>

          <!-- Client (lower frontal, orange/red) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('client')"
            [attr.fill]="'url(#gradient-client)'"
            [attr.filter]="'url(#glow-client)'"
            d="M170,80 
               C180,60 200,45 230,50
               C250,55 260,70 265,90
               L250,110
               C240,100 220,95 200,100
               C180,105 170,95 170,80 Z"
          />
          <text x="195" y="85" class="segment-label">Client</text>

          <!-- Legal (top/parietal, yellow) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('legal')"
            [attr.fill]="'url(#gradient-legal)'"
            [attr.filter]="'url(#glow-legal)'"
            d="M230,50 
               C260,40 290,35 320,45
               C345,55 355,75 350,100
               L330,95
               C320,80 300,70 280,70
               C260,70 250,60 230,50 Z"
          />
          <text x="275" y="70" class="segment-label">Legal</text>

          <!-- IS (occipital/back top, purple) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('is')"
            [attr.fill]="'url(#gradient-is)'"
            [attr.filter]="'url(#glow-is)'"
            d="M350,100 
               C365,85 385,90 395,115
               C405,145 395,180 375,200
               L355,180
               C365,160 365,135 355,115
               C350,105 350,100 350,100 Z"
          />
          <text x="360" y="145" class="segment-label">IS</text>

          <!-- HR (temporal/bottom center, blue) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('hr')"
            [attr.fill]="'url(#gradient-hr)'"
            [attr.filter]="'url(#glow-hr)'"
            d="M140,160 
               C150,130 160,110 200,100
               C220,95 240,100 250,110
               L260,140
               C250,160 230,180 200,195
               C170,205 150,195 140,160 Z"
          />
          <text x="185" y="160" class="segment-label">HR</text>

          <!-- Finance (lower middle, green) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('finance')"
            [attr.fill]="'url(#gradient-finance)'"
            [attr.filter]="'url(#glow-finance)'"
            d="M260,140 
               C265,120 290,100 330,95
               L355,115
               C365,135 365,160 355,180
               L330,190
               C300,195 270,180 260,140 Z"
          />
          <text x="295" y="155" class="segment-label">Finance</text>

          <!-- Operations (cerebellum/back bottom, bright green) -->
          <path 
            class="brain-segment"
            [class.active]="isSegmentActive('operations')"
            [attr.fill]="'url(#gradient-operations)'"
            [attr.filter]="'url(#glow-operations)'"
            d="M330,190 
               L355,180
               C375,200 385,230 370,260
               C355,280 320,285 290,270
               C270,260 265,240 280,220
               C295,205 315,195 330,190 Z"
          />
          <text x="315" y="245" class="segment-label">Operations</text>

          <!-- Brain stem hint -->
          <path 
            d="M200,195 C190,220 180,250 175,280 C172,295 178,305 190,305 C205,305 215,290 210,270 C205,250 200,220 200,195"
            fill="#1a1a2e"
            opacity="0.5"
          />
        </g>

        <!-- Animated pulse dots -->
        @for (event of animatingEvents(); track event.eventId) {
          @if (event.animationPhase === 'pulse-to-brain' || event.animationPhase === 'brain-glow') {
            <circle 
              class="pulse-dot"
              [attr.cx]="getPulsePosition(event).x"
              [attr.cy]="getPulsePosition(event).y"
              r="6"
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
      max-width: 550px;
      height: auto;
    }

    .brain-segment {
      opacity: 0.75;
      transition: all 0.4s ease;
      cursor: pointer;
      mix-blend-mode: screen;
    }

    .brain-segment:hover {
      opacity: 0.9;
    }

    .brain-segment.active {
      opacity: 1;
      animation: segment-pulse 0.8s ease-in-out;
    }

    .segment-label {
      font-size: 12px;
      font-weight: 600;
      fill: white;
      pointer-events: none;
      text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.5);
    }

    .pulse-dot {
      animation: pulse-glow 0.5s ease-in-out infinite;
      filter: drop-shadow(0 0 8px currentColor);
    }

    @keyframes segment-pulse {
      0%, 100% { opacity: 0.75; }
      50% { opacity: 1; filter: brightness(1.4); }
    }

    @keyframes pulse-glow {
      0%, 100% { 
        r: 6;
        opacity: 1;
      }
      50% { 
        r: 12;
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
    investors: { x: 160, y: 140 },
    client: { x: 260, y: 105 },
    legal: { x: 330, y: 85 },
    is: { x: 420, y: 160 },
    hr: { x: 260, y: 175 },
    finance: { x: 360, y: 170 },
    operations: { x: 380, y: 255 }
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
