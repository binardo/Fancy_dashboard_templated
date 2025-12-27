import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../core/dashboard.service';
import { Department } from '../core/models';

interface PersonIcon {
  id: string;
  x: number;
  y: number;
  userId?: string;
  isActive: boolean;
}

interface DepartmentCluster {
  department: Department;
  people: PersonIcon[];
}

@Component({
  selector: 'app-stick-people',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stick-people-container">
      <svg viewBox="0 0 100 40" class="people-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          @for (dept of departments(); track dept.deptId) {
            <filter [id]="'person-glow-' + dept.deptId" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          }
        </defs>

        @for (cluster of clusters(); track cluster.department.deptId) {
          <g class="department-cluster" 
             [attr.transform]="'translate(' + cluster.department.peopleClusterPosition.x + ',' + cluster.department.peopleClusterPosition.y + ')'">
            @for (person of cluster.people; track person.id) {
              <g class="person-icon" 
                 [class.active]="isPersonActive(cluster.department.deptId, person.id)"
                 [attr.transform]="'translate(' + person.x + ',' + person.y + ')'">
                <!-- Head -->
                <circle 
                  cx="0" 
                  cy="-1.2" 
                  r="0.5" 
                  [attr.fill]="cluster.department.color"
                  [attr.filter]="isPersonActive(cluster.department.deptId, person.id) ? 'url(#person-glow-' + cluster.department.deptId + ')' : ''"
                />
                <!-- Body -->
                <line 
                  x1="0" y1="-0.7" 
                  x2="0" y2="0.5" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="0.15"
                />
                <!-- Arms -->
                <line 
                  x1="-0.5" y1="0" 
                  x2="0.5" y2="0" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="0.15"
                />
                <!-- Legs -->
                <line 
                  x1="0" y1="0.5" 
                  x2="-0.4" y2="1.2" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="0.15"
                />
                <line 
                  x1="0" y1="0.5" 
                  x2="0.4" y2="1.2" 
                  [attr.stroke]="cluster.department.color" 
                  stroke-width="0.15"
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
      flex: 0 0 auto;
      padding: var(--space-2);
    }

    .people-svg {
      width: 100%;
      height: auto;
      max-height: 200px;
    }

    .person-icon {
      opacity: 0.6;
      transition: all 0.3s ease;
    }

    .person-icon.active {
      opacity: 1;
      animation: person-highlight 0.6s ease-in-out;
    }

    .person-icon.active circle,
    .person-icon.active line {
      filter: drop-shadow(0 0 2px currentColor);
    }

    @keyframes person-highlight {
      0% { 
        transform: scale(1);
        opacity: 0.6;
      }
      50% { 
        transform: scale(1.3);
        opacity: 1;
      }
      100% { 
        transform: scale(1);
        opacity: 1;
      }
    }
  `]
})
export class StickPeopleComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private userToPersonMap = new Map<string, { deptId: string; personId: string }>();
  private nextPersonIndex = new Map<string, number>();

  readonly departments = computed(() => this.dashboardService.departments());
  readonly animatingEvents = computed(() => this.dashboardService.animatingEvents());

  readonly clusters = computed(() => {
    const depts = this.departments();
    return depts.map(dept => ({
      department: dept,
      people: this.generatePeopleForDepartment(dept)
    }));
  });

  ngOnInit(): void {
    this.departments().forEach(dept => {
      this.nextPersonIndex.set(dept.deptId, 0);
    });
  }

  private generatePeopleForDepartment(dept: Department): PersonIcon[] {
    const people: PersonIcon[] = [];
    const count = 40;
    const cols = 8;
    const rows = Math.ceil(count / cols);
    
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const offsetX = (row % 2) * 0.5;
      
      people.push({
        id: `${dept.deptId}-${i}`,
        x: col * 1.5 + offsetX,
        y: row * 2.5,
        isActive: false
      });
    }
    
    return people;
  }

  isPersonActive(deptId: string, personId: string): boolean {
    const events = this.animatingEvents();
    
    for (const event of events) {
      if (event.department !== deptId) continue;
      if (event.animationPhase !== 'user-highlight' && event.animationPhase !== 'pulse-to-brain') continue;
      
      let mapping = this.userToPersonMap.get(event.userDisplayName);
      
      if (!mapping || mapping.deptId !== deptId) {
        const nextIndex = this.nextPersonIndex.get(deptId) || 0;
        mapping = { deptId, personId: `${deptId}-${nextIndex % 40}` };
        this.userToPersonMap.set(event.userDisplayName, mapping);
        this.nextPersonIndex.set(deptId, nextIndex + 1);
      }
      
      if (mapping.personId === personId) {
        return true;
      }
    }
    
    return false;
  }
}
