/**
 * Shared zod schemas for client-side input validation.
 */
import { z } from 'zod';
/** Cameroon mobile number: 9 digits, starts with 6 (MTN/Orange). */
export const cameroonPhoneSchema = z
  .string()
  .trim()
  .regex(/^6\d{8}$/, { message: 'Enter a valid 9-digit number starting with 6' });
/** Mobile Money payment input. */
export const paymentSchema = z.object({
  provider: z.enum(['mtn', 'orange'], { message: 'Select a payment provider' }),
  phone: cameroonPhoneSchema,
});
export type PaymentInput = z.infer<typeof paymentSchema>;
/** Bus search input. `date` must be today or later (YYYY-MM-DD). */
export const searchSchema = (today: string) =>
  z
    .object({
      source: z.string().trim().min(1, { message: 'Choose a departure city' }),
      destination: z.string().trim().min(1, { message: 'Choose a destination city' }),
      date: z.string().min(1, { message: 'Pick a travel date' }),
    })
    .refine((d) => d.source.toLowerCase() !== d.destination.toLowerCase(), {
      message: 'Departure and destination must differ',
      path: ['destination'],
    })
    .refine((d) => d.date >= today, {
      message: 'Travel date cannot be in the past',
      path: ['date'],
    });