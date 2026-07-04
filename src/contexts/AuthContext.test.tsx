import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from './AuthContext';
// Silence the expected console.error from the thrown render error.
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('useAuth', () => {
  it('throws when used outside of an AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow();
  });
});
