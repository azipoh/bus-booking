export type CampayMode = 'live' | 'mock';

export function resolveCampayMode(username?: string | null, password?: string | null): CampayMode {
  const hasCredentials = Boolean(username?.trim() && password?.trim());
  return hasCredentials ? 'live' : 'mock';
}

export function createMockCampayReference(prefix = 'busgo') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMockCampayCollectResponse(reference: string) {
  return {
    reference,
    status: 'SUCCESSFUL',
    simulated: true,
    message: 'Mock Campay payment completed',
  };
}

export function createMockCampayStatusResponse(reference: string, status: 'SUCCESSFUL' | 'FAILED' | 'PENDING' = 'SUCCESSFUL') {
  return {
    reference,
    status,
    simulated: true,
    message: `Mock Campay status: ${status}`,
  };
}
