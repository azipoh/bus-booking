import { describe, expect, it } from 'vitest';
import { createMockCampayCollectResponse, createMockCampayStatusResponse } from './payment';

describe('payment mock helpers', () => {
  it('creates a mock collect response with a reference and success status', () => {
    const response = createMockCampayCollectResponse('mock-ref');
    expect(response.reference).toBe('mock-ref');
    expect(response.status).toBe('SUCCESSFUL');
    expect(response.simulated).toBe(true);
  });

  it('creates a mock status response for successful checks', () => {
    const response = createMockCampayStatusResponse('mock-ref');
    expect(response.reference).toBe('mock-ref');
    expect(response.status).toBe('SUCCESSFUL');
    expect(response.simulated).toBe(true);
  });
});
