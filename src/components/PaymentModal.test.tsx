import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PaymentModal from './PaymentModal';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { reference: 'ref-123' }, error: null }),
    },
  },
}));
const { invokeMock } = vi.hoisted(() => ({ invokeMock: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: invokeMock,
    },
  },
}));

const setup = () => {
  const onSuccess = vi.fn();
  const onClose = vi.fn();
  render(<PaymentModal open onClose={onClose} onSuccess={onSuccess} amount={6000} />);
  return { onSuccess, onClose };
};

beforeEach(() => {
  vi.useRealTimers();
  invokeMock.mockReset();
  invokeMock.mockImplementation(async (name: string) => {
    if (name === 'campay-collect') {
      return { data: { reference: 'ref-123' }, error: null };
    }
    return { data: { status: 'SUCCESSFUL' }, error: null };
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PaymentModal', () => {
  it('shows the provider selection step', () => {
    setup();
    expect(screen.getByText('MTN Mobile Money')).toBeInTheDocument();
    expect(screen.getByText('Orange Money')).toBeInTheDocument();
  });

  it('blocks payment and shows an error for an invalid phone number', async () => {
    const { onSuccess } = setup();
    fireEvent.click(screen.getByText('MTN Mobile Money'));
    const input = await screen.findByPlaceholderText('6XX XXX XXX');
    fireEvent.change(input, { target: { value: '712345678' } });
    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));
    expect(await screen.findByText(/valid 9-digit number/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('confirms the booking when the demo status poll reports a successful payment', async () => {
    vi.useFakeTimers();
    const { onSuccess } = setup();
    invokeMock.mockImplementation(async (name: string) => {
      if (name === 'campay-collect') {
        return {
          data: { reference: 'demo-ref', simulated: true, status: 'PENDING', message: 'Demo mode: no mobile-money prompt was sent.' },
          error: null,
        };
      }

      return {
        data: { reference: 'demo-ref', simulated: true, status: 'SUCCESSFUL', message: 'Demo mode payment approved.' },
        error: null,
      };
    });

    fireEvent.click(screen.getByText('MTN Mobile Money'));
    const input = await screen.findByPlaceholderText('6XX XXX XXX');
    fireEvent.change(input, { target: { value: '690112233' } });
    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

    await waitFor(() => {
      expect(screen.getByText(/Payment Successful!/i)).toBeInTheDocument();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1600);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('calls the Campay edge function for a valid phone number', async () => {
    setup();
    fireEvent.click(screen.getByText('Orange Money'));
    const input = await screen.findByPlaceholderText('6XX XXX XXX');
    fireEvent.change(input, { target: { value: '690112233' } });
    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));

    await waitFor(() => {
      expect(invokeMock).toHaveBeenCalledWith('campay-collect', {
        body: {
          amount: 6000,
          phone: '237690112233',
          description: expect.stringContaining('Moghamo payment'),
        },
      });
    });
    expect(await screen.findByText(/Payment Successful!/i)).toBeInTheDocument();
  });
});
