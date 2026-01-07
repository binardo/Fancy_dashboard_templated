export interface DashboardEvent {
  eventId: string;
  timestampUtc: string;
  userDisplayName: string;
  department: string;
  application: string;
  model: string;
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
  rawMessage: string;
  formattedMessage: string;
}

export interface Department {
  deptId: string;
  displayName: string;
  color: string;
  brainSegmentId: string;
  peopleClusterPosition: ClusterPosition;
}

export interface ClusterPosition {
  x: number;
  y: number;
}

export interface MonitoredApp {
  appId: string;
  displayName: string;
  seqFilter: string;
  color: string;
}

export interface UserStats {
  userDisplayName: string;
  callsToday: number;
  tokensInToday: number;
  tokensOutToday: number;
  department: string;
}

export interface AppStats {
  appId: string;
  displayName: string;
  color: string;
  callsToday: number;
}

export interface DashboardAggregates {
  totalCallsToday: number;
  appStats: AppStats[];
  topUsers: UserStats[];
  departmentCounts: Record<string, number>;
  connectionStatus: string;
  dataMode: string;
}

export interface DashboardConfig {
  departments: Department[];
  monitoredApps: MonitoredApp[];
  playbackLagSeconds: number;
  maxEventListSize: number;
}

export interface AnimatingEvent extends DashboardEvent {
  animationPhase: 'user-highlight' | 'pulse-to-brain' | 'brain-glow' | 'pulse-to-stream' | 'list-insert' | 'complete';
  animationProgress: number;
}
