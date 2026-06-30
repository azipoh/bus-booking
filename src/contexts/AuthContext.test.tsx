import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth, normalizeRole, isStaffRole } from './AuthContext';
// Silence the expected console.error from the thrown render error.
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('role helpers', () => {
  it('normalizes passenger and staff roles consistently', () => {
    expect(normalizeRole('admin')).toBe('admin');
    expect(normalizeRole('Cashier')).toBe('cashier');
    expect(normalizeRole('MANAGER')).toBe('manager');
    expect(normalizeRole('user')).toBe('passenger');
    expect(normalizeRole(undefined)).toBe('passenger');
  });

  it('flags staff roles while keeping passengers out', () => {
    expect(isStaffRole('admin')).toBe(true);
    expect(isStaffRole('cashier')).toBe(true);
    expect(isStaffRole('manager')).toBe(true);
    expect(isStaffRole('passenger')).toBe(false);
  });
});

describe('useAuth', () => {
  it('throws when used outside of an AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow();
  });
});
