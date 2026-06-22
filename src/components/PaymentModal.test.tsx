import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentModal from './PaymentModal';

const setup = () => {
  const onSuccess = vi.fn();
  const onClose = vi.fn();
  render(<PaymentModal open onClose={onClose} onSuccess={onSuccess} amount={6000} />);
  return { onSuccess, onClose };
};

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

  it('proceeds to processing for a valid phone number', async () => {
    setup();
    fireEvent.click(screen.getByText('Orange Money'));
    const input = await screen.findByPlaceholderText('6XX XXX XXX');
    fireEvent.change(input, { target: { value: '690112233' } });
    fireEvent.click(screen.getByRole('button', { name: /Pay/i }));
    expect(await screen.findByText(/Processing Payment/i)).toBeInTheDocument();
  });
});
