const http = require('http');

const PORT = 5000;

const departments = [
  { deptId: 'investors', displayName: 'Investors', color: '#22d3ee', brainSegmentId: 'investors', peopleClusterPosition: { x: 10, y: 70 } },
  { deptId: 'client', displayName: 'Client', color: '#f97316', brainSegmentId: 'client', peopleClusterPosition: { x: 25, y: 75 } },
  { deptId: 'legal', displayName: 'Legal', color: '#eab308', brainSegmentId: 'legal', peopleClusterPosition: { x: 40, y: 80 } },
  { deptId: 'is', displayName: 'IS', color: '#a855f7', brainSegmentId: 'is', peopleClusterPosition: { x: 55, y: 75 } },
  { deptId: 'hr', displayName: 'HR', color: '#3b82f6', brainSegmentId: 'hr', peopleClusterPosition: { x: 35, y: 85 } },
  { deptId: 'finance', displayName: 'Finance', color: '#10b981', brainSegmentId: 'finance', peopleClusterPosition: { x: 50, y: 85 } },
  { deptId: 'operations', displayName: 'Operations', color: '#22c55e', brainSegmentId: 'operations', peopleClusterPosition: { x: 70, y: 75 } }
];

const monitoredApps = [
  { appId: 'chatgpt', displayName: 'ChatGPT', seqFilter: "Application = 'chatgpt'", color: '#10b981' },
  { appId: 'sidekick', displayName: 'Sidekick', seqFilter: "Application = 'sidekick'", color: '#22d3ee' },
  { appId: 'cursor', displayName: 'Cursor', seqFilter: "Application = 'cursor'", color: '#3b82f6' },
  { appId: 'vscode', displayName: 'VS Code', seqFilter: "Application = 'vscode'", color: '#8b5cf6' },
  { appId: 'aiplayground', displayName: 'AI Playground', seqFilter: "Application = 'aiplayground'", color: '#f97316' },
  { appId: 'perplexity', displayName: 'Perplexity', seqFilter: "Application = 'perplexity'", color: '#ec4899' }
];

const userNames = [
  'Joe Bloggs', 'Jane Smith', 'John Doe', 'Alice Johnson', 'Bob Wilson',
  'Charlie Brown', 'Diana Ross', 'Edward Norton', 'Fiona Apple', 'George Lucas',
  'Helen Troy', 'Ivan Petrov', 'Julia Roberts', 'Kevin Hart', 'Laura Palmer',
  'Michael Scott', 'Nancy Drew', 'Oscar Wilde', 'Patricia Green', 'Quinn Hughes'
];

const modelNames = [
  'GPT-4', 'GPT-4o', 'GPT-3.5-turbo', 'Claude-3', 'Claude-3.5-Sonnet',
  'Gemini-Pro', 'Llama-3', 'Mistral-7B', 'Codex', 'DALL-E-3'
];

const appCounts = {};
const userStats = {};
const recentEvents = [];
let totalCallsToday = 0;
let eventsPerSecond = 3;
let burstCount = 0;
const subscribers = [];

monitoredApps.forEach(app => appCounts[app.appId] = 0);

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvent() {
  const department = randomChoice(departments);
  const app = randomChoice(monitoredApps);
  const user = randomChoice(userNames);
  const model = randomChoice(modelNames);
  const tokensIn = Math.floor(Math.random() * 1950) + 50;
  const tokensOut = Math.floor(Math.random() * 3900) + 100;
  const durationMs = Math.floor(Math.random() * 14500) + 500;

  return {
    eventId: Math.random().toString(36).substring(2, 15),
    timestampUtc: new Date().toISOString(),
    userDisplayName: user,
    department: department.deptId,
    application: app.appId,
    model: model,
    tokensIn: tokensIn,
    tokensOut: tokensOut,
    durationMs: durationMs,
    rawMessage: `User ${user} from ${department.displayName} used ${app.displayName} with model ${model}`,
    formattedMessage: `${user} called ${model} through ${app.displayName} in/out tokens ${tokensIn}/${tokensOut} taking ${(durationMs / 1000).toFixed(1)}s`
  };
}

function processEvent(event) {
  totalCallsToday++;
  appCounts[event.application] = (appCounts[event.application] || 0) + 1;

  if (userStats[event.userDisplayName]) {
    userStats[event.userDisplayName].callsToday++;
    userStats[event.userDisplayName].tokensInToday += event.tokensIn;
    userStats[event.userDisplayName].tokensOutToday += event.tokensOut;
  } else {
    userStats[event.userDisplayName] = {
      userDisplayName: event.userDisplayName,
      callsToday: 1,
      tokensInToday: event.tokensIn,
      tokensOutToday: event.tokensOut,
      department: event.department
    };
  }

  recentEvents.unshift(event);
  if (recentEvents.length > 50) recentEvents.pop();

  subscribers.forEach(res => {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (e) {}
  });
}

function generateInitialEvents(count) {
  for (let i = 0; i < count; i++) {
    const event = generateEvent();
    event.timestampUtc = new Date(Date.now() - Math.random() * 3600000).toISOString();
    processEvent(event);
  }
  recentEvents.sort((a, b) => new Date(b.timestampUtc) - new Date(a.timestampUtc));
}

generateInitialEvents(100);

setInterval(() => {
  if (burstCount > 0) {
    const event = generateEvent();
    processEvent(event);
    burstCount--;
  } else {
    const event = generateEvent();
    processEvent(event);
  }
}, 1000 / eventsPerSecond);

function getAggregates() {
  const appStats = monitoredApps.map(app => ({
    appId: app.appId,
    displayName: app.displayName,
    color: app.color,
    callsToday: appCounts[app.appId] || 0
  })).sort((a, b) => b.callsToday - a.callsToday);

  const topUsers = Object.values(userStats)
    .sort((a, b) => b.callsToday - a.callsToday)
    .slice(0, 5);

  return {
    totalCallsToday,
    appStats,
    topUsers,
    departmentCounts: {},
    connectionStatus: 'Connected',
    dataMode: 'Mock'
  };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      departments,
      monitoredApps,
      playbackLagSeconds: 5,
      maxEventListSize: 50
    }));
  } else if (url.pathname === '/api/aggregates') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getAggregates()));
  } else if (url.pathname === '/api/events/recent') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(recentEvents));
  } else if (url.pathname === '/api/events/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    subscribers.push(res);
    req.on('close', () => {
      const index = subscribers.indexOf(res);
      if (index > -1) subscribers.splice(index, 1);
    });
  } else if (url.pathname === '/api/mock/burst' && req.method === 'POST') {
    burstCount = 50;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Burst triggered', count: 50 }));
  } else if (url.pathname === '/api/mock/rate' && req.method === 'POST') {
    const rate = parseInt(url.searchParams.get('eventsPerSecond')) || 3;
    eventsPerSecond = Math.max(1, Math.min(20, rate));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Rate updated', eventsPerSecond }));
  } else if (url.pathname === '/healthcheck') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /api/config');
  console.log('  GET  /api/aggregates');
  console.log('  GET  /api/events/recent');
  console.log('  GET  /api/events/stream (SSE)');
  console.log('  POST /api/mock/burst');
  console.log('  POST /api/mock/rate?eventsPerSecond=N');
});
