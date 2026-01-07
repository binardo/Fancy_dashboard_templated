import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashboardEvent, DashboardAggregates, DashboardConfig, AnimatingEvent } from './models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private eventSource: EventSource | null = null;
  private readonly apiBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : '';
  
  readonly config = signal<DashboardConfig | null>(null);
  readonly aggregates = signal<DashboardAggregates | null>(null);
  readonly recentEvents = signal<DashboardEvent[]>([]);
  readonly animatingEvents = signal<AnimatingEvent[]>([]);
  readonly connectionStatus = signal<'connecting' | 'connected' | 'reconnecting' | 'offline' | 'mock'>('connecting');
  
  readonly totalCallsToday = computed(() => this.aggregates()?.totalCallsToday ?? 0);
  readonly topUsers = computed(() => this.aggregates()?.topUsers ?? []);
  readonly appStats = computed(() => this.aggregates()?.appStats ?? []);
  readonly departments = computed(() => this.config()?.departments ?? []);

  constructor(private readonly http: HttpClient) {}

  async initialize(): Promise<void> {
    await this.loadConfig();
    await this.loadAggregates();
    await this.loadRecentEvents();
    this.startEventStream();
  }

  private async loadConfig(): Promise<void> {
    try {
      const config = await this.http.get<DashboardConfig>(`${this.apiBaseUrl}/api/config`).toPromise();
      if (config) {
        this.config.set(config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  private async loadAggregates(): Promise<void> {
    try {
      const aggregates = await this.http.get<DashboardAggregates>(`${this.apiBaseUrl}/api/aggregates`).toPromise();
      if (aggregates) {
        this.aggregates.set(aggregates);
        this.connectionStatus.set(aggregates.dataMode === 'Mock' ? 'mock' : 'connected');
      }
    } catch (error) {
      console.error('Failed to load aggregates:', error);
    }
  }

  private async loadRecentEvents(): Promise<void> {
    try {
      const events = await this.http.get<DashboardEvent[]>(`${this.apiBaseUrl}/api/events/recent`).toPromise();
      if (events) {
        this.recentEvents.set(events);
      }
    } catch (error) {
      console.error('Failed to load recent events:', error);
    }
  }

  private startEventStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const streamUrl = `${this.apiBaseUrl}/api/events/stream`;
    this.eventSource = new EventSource(streamUrl);
    
    this.eventSource.onopen = () => {
      const currentMode = this.aggregates()?.dataMode;
      this.connectionStatus.set(currentMode === 'Mock' ? 'mock' : 'connected');
    };

    this.eventSource.onmessage = (event) => {
      try {
        const dashboardEvent: DashboardEvent = JSON.parse(event.data);
        this.processNewEvent(dashboardEvent);
      } catch (error) {
        console.error('Failed to parse event:', error);
      }
    };

    this.eventSource.onerror = () => {
      this.connectionStatus.set('reconnecting');
      this.eventSource?.close();
      setTimeout(() => this.startEventStream(), 5000);
    };
  }

  private processNewEvent(event: DashboardEvent): void {
    const animatingEvent: AnimatingEvent = {
      ...event,
      animationPhase: 'user-highlight',
      animationProgress: 0
    };

    this.animatingEvents.update(events => [...events, animatingEvent]);
    this.runAnimation(animatingEvent);

    this.aggregates.update(agg => {
      if (!agg) return agg;
      
      const updatedAppStats = agg.appStats.map(app => 
        app.appId === event.application 
          ? { ...app, callsToday: app.callsToday + 1 }
          : app
      );

      const existingUserIndex = agg.topUsers.findIndex(u => u.userDisplayName === event.userDisplayName);
      let updatedTopUsers = [...agg.topUsers];
      
      if (existingUserIndex >= 0) {
        updatedTopUsers[existingUserIndex] = {
          ...updatedTopUsers[existingUserIndex],
          callsToday: updatedTopUsers[existingUserIndex].callsToday + 1,
          tokensInToday: updatedTopUsers[existingUserIndex].tokensInToday + event.tokensIn,
          tokensOutToday: updatedTopUsers[existingUserIndex].tokensOutToday + event.tokensOut
        };
      } else {
        updatedTopUsers.push({
          userDisplayName: event.userDisplayName,
          callsToday: 1,
          tokensInToday: event.tokensIn,
          tokensOutToday: event.tokensOut,
          department: event.department
        });
      }
      
      updatedTopUsers = updatedTopUsers
        .sort((a, b) => b.callsToday - a.callsToday)
        .slice(0, 5);

      return {
        ...agg,
        totalCallsToday: agg.totalCallsToday + 1,
        appStats: updatedAppStats,
        topUsers: updatedTopUsers
      };
    });
  }

  private runAnimation(event: AnimatingEvent): void {
    const phases: AnimatingEvent['animationPhase'][] = [
      'user-highlight',
      'pulse-to-brain', 
      'brain-glow',
      'pulse-to-stream',
      'list-insert',
      'complete'
    ];
    
    const phaseDurations = [600, 1000, 800, 1000, 800];
    let currentPhaseIndex = 0;

    const advancePhase = () => {
      if (currentPhaseIndex >= phases.length - 1) {
        this.animatingEvents.update(events => 
          events.filter(e => e.eventId !== event.eventId)
        );
        
        this.recentEvents.update(events => {
          const newEvents = [event, ...events];
          return newEvents.slice(0, 50);
        });
        return;
      }

      currentPhaseIndex++;
      this.animatingEvents.update(events =>
        events.map(e => 
          e.eventId === event.eventId 
            ? { ...e, animationPhase: phases[currentPhaseIndex] }
            : e
        )
      );

      if (currentPhaseIndex < phaseDurations.length) {
        setTimeout(advancePhase, phaseDurations[currentPhaseIndex]);
      }
    };

    setTimeout(advancePhase, phaseDurations[0]);
  }

  triggerBurst(): void {
    this.http.post(`${this.apiBaseUrl}/api/mock/burst`, {}).subscribe();
  }

  setEventRate(rate: number): void {
    this.http.post(`${this.apiBaseUrl}/api/mock/rate?eventsPerSecond=${rate}`, {}).subscribe();
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = null;
    this.connectionStatus.set('offline');
  }
}
