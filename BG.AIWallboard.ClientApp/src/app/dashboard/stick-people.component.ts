import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';
import { Department } from '../core/models';

interface PersonIcon {
  id: string;
  x: number;
  y: number;
}

interface DepartmentCluster {
  department: Department;
  people: PersonIcon[];
  centerX: number;
  centerY: number;
}

@Component({
  selector: 'app-stick-people',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stick-people-container">
      <svg viewBox="0 0 700 180" class="people-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          @for (dept of departments(); track dept.deptId) {
            <filter [id]="'person-glow-' + dept.deptId" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter [id]="'person-active-glow-' + dept.deptId" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          }
        </defs>

        @for (cluster of clustersData; track cluster.department.deptId) {
          <g class="department-cluster" 
             [attr.transform]="'translate(' + cluster.centerX + ',' + cluster.centerY + ')'">
            @for (person of cluster.people; track person.id) {
              <g class="person-icon" 
                 [class.active]="activePersonIds().has(person.id)"
                 [attr.transform]="'translate(' + person.x + ',' + person.y + ') scale(0.8)'">
                <!-- Head -->
                <circle 
                  cx="0" 
                  cy="-6" 
                  r="3" 
                  [attr.fill]="cluster.department.color"
                  [attr.filter]="activePersonIds().has(person.id) ? 'url(#person-active-glow-' + cluster.department.deptId + ')' : 'url(#person-glow-' + cluster.department.deptId + ')'"
                />
                <!-- Body -->
                <line 
                  x1="0" y1="-3" 
                  x2="0" y2="4" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <!-- Arms -->
                <line 
                  x1="-4" y1="0" 
                  x2="4" y2="0" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <!-- Legs -->
                <line 
                  x1="0" y1="4" 
                  x2="-3" y2="10" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
                <line 
                  x1="0" y1="4" 
                  x2="3" y2="10" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </g>
            }
          </g>
        }
      </svg>
    </div>
  `,
  styles: [`
    .stick-people-container {
      width: 100%;
      padding: var(--space-2) 0;
    }

    .people-svg {
      width: 100%;
      height: auto;
      min-height: 150px;
    }

    .person-icon {
      opacity: 0.7;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .person-icon circle,
    .person-icon line {
      filter: drop-shadow(0 0 3px currentColor);
    }

    .person-icon.active {
      opacity: 1;
      animation: person-highlight 0.6s ease-in-out;
    }

    @keyframes person-highlight {
      0% { 
        transform: scale(0.8);
      }
      50% { 
        transform: scale(1.2);
      }
      100% { 
        transform: scale(0.8);
      }
    }
  `]
})
export class StickPeopleComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private userToPersonMap = new Map<string, string>();
  private nextPersonIndex = new Map<string, number>();
  private initialized = false;

  readonly departments = computed(() => this.dashboardService.departments());
  
  clustersData: DepartmentCluster[] = [];

  readonly activePersonIds = computed(() => {
    const activeIds = new Set<string>();
    const events = this.dashboardService.animatingEvents();
    
    for (const event of events) {
      if (event.animationPhase !== 'user-highlight' && event.animationPhase !== 'pulse-to-brain') continue;
      
      const personId = this.userToPersonMap.get(event.userDisplayName);
      if (personId) {
        activeIds.add(personId);
      }
    }
    
    return activeIds;
  });

  private readonly clusterPositions: Record<string, { x: number; y: number }> = {
    investors: { x: 70, y: 90 },
    client: { x: 170, y: 110 },
    legal: { x: 280, y: 90 },
    is: { x: 390, y: 100 },
    hr: { x: 500, y: 110 },
    finance: { x: 590, y: 90 },
    operations: { x: 680, y: 100 }
  };

  ngOnInit(): void {
    this.initializeClusters();
  }

  private initializeClusters(): void {
    if (this.initialized) return;
    
    const depts = this.departments();
    if (depts.length === 0) {
      setTimeout(() => this.initializeClusters(), 100);
      return;
    }

    this.clustersData = depts.map(dept => {
      const pos = this.clusterPositions[dept.deptId] || { x: 350, y: 90 };
      this.nextPersonIndex.set(dept.deptId, 0);
      return {
        department: dept,
        people: this.generatePeopleForDepartment(dept),
        centerX: pos.x,
        centerY: pos.y
      };
    });

    this.initialized = true;
    this.setupUserMapping();
  }

  private setupUserMapping(): void {
    const events = this.dashboardService.animatingEvents();
    for (const event of events) {
      this.assignUserToPerson(event.userDisplayName, event.department);
    }
  }

  private assignUserToPerson(userName: string, deptId: string): string {
    if (this.userToPersonMap.has(userName)) {
      return this.userToPersonMap.get(userName)!;
    }

    const nextIndex = this.nextPersonIndex.get(deptId) || 0;
    const personId = `${deptId}-${nextIndex % 30}`;
    this.userToPersonMap.set(userName, personId);
    this.nextPersonIndex.set(deptId, nextIndex + 1);
    return personId;
  }

  private generatePeopleForDepartment(dept: Department): PersonIcon[] {
    const people: PersonIcon[] = [];
    const totalCount = 30;
    
    const rings = 4;
    const r0 = 8;
    const ringSpacing = 14;
    const startAngle = this.degToRad(200);
    const endAngle = this.degToRad(340);
    const aspectY = 0.85;
    
    let remaining = totalCount;
    let personIndex = 0;
    
    for (let k = 0; k < rings && remaining > 0; k++) {
      const r = r0 + k * ringSpacing;
      const span = Math.abs(endAngle - startAngle);
      const desiredArcSpacing = 12;
      
      let n = Math.max(4, Math.floor((r * span) / desiredArcSpacing));
      n = Math.min(n, remaining);
      
      const step = span / n;
      const stagger = (k % 2) * (step / 2);
      
      for (let j = 0; j < n; j++) {
        const angle = startAngle + (j + 0.5) * step + stagger;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r * aspectY;
        
        people.push({
          id: `${dept.deptId}-${personIndex}`,
          x: x,
          y: y
        });
        
        personIndex++;
      }
      
      remaining -= n;
    }
    
    return people;
  }

  private degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}
