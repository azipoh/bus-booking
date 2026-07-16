import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AuthDialog from './AuthDialog';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn, signUp: mockSignUp }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AuthDialog', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignUp.mockReset();
    mockNavigate.mockReset();
  });

  it('shows a confirm password field and blocks mismatched signup submissions', async () => {
    render(
      <MemoryRouter>
        <AuthDialog open onOpenChange={vi.fn()} initialMode="login" />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    fireEvent.change(screen.getByPlaceholderText(/full name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password \(min 8 chars/i), { target: { value: 'Password1!' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), { target: { value: 'Password2!' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});
