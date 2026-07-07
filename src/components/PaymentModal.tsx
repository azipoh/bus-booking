/**
 * Mobile Money payment modal (MTN MoMo / Orange Money) powered by Campay.
 * Initiates a real collection, then polls the transaction status until it
 * completes. Calls onSuccess only when Campay confirms the payment.
 */
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/currency';
import { Loader2, CheckCircle2, Smartphone, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { paymentSchema } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  /** Optional label shown to the payer / stored on the Campay transaction */
  description?: string;
}

type PaymentProvider = 'mtn' | 'orange';
type PaymentStep = 'select' | 'enter' | 'processing' | 'success' | 'failed';

// Poll status for up to ~2 minutes (Campay prompts time out around there).
const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 30;

const PaymentModal = ({ open, onClose, onSuccess, amount, description }: PaymentModalProps) => {
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<PaymentStep>('select');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  const clearPoll = () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = null;
  };

  useEffect(() => () => clearPoll(), []);

  const reset = () => {
    clearPoll();
    cancelled.current = false;
    setProvider(null);
    setPhone('');
    setStep('select');
    setPhoneError(null);
    setErrorMsg(null);
  };

  const handleClose = () => {
    cancelled.current = true;
    reset();
    onClose();
  };

  const pollStatus = async (reference: string, attempt: number) => {
    if (cancelled.current) return;
    try {
      const { data, error } = await supabase.functions.invoke('campay-status', {
        body: { reference },
      });
      if (error) throw error;
      const status = String(data?.status ?? '').toUpperCase();

      if (status === 'SUCCESSFUL') {
        setStep('success');
        setTimeout(() => { if (!cancelled.current) { reset(); onSuccess(); } }, 1500);
        return;
      }
      if (status === 'FAILED') {
        setErrorMsg('Payment was declined or cancelled. Please try again.');
        setStep('failed');
        return;
      }
    } catch (_err) {
      // Transient error — keep polling until we hit the cap.
    }

    if (attempt >= MAX_POLLS) {
      setErrorMsg('Payment timed out. If you were charged, contact support.');
      setStep('failed');
      return;
    }
    pollTimer.current = setTimeout(() => pollStatus(reference, attempt + 1), POLL_INTERVAL_MS);
  };

  const handlePay = async () => {
    const result = paymentSchema.safeParse({ provider, phone });
    if (!result.success) {
      setPhoneError(result.error.issues[0]?.message ?? 'Invalid payment details');
      return;
    }
    setPhoneError(null);
    setErrorMsg(null);
    cancelled.current = false;
    setStep('processing');

    try {
      const { data, error } = await supabase.functions.invoke('campay-collect', {
        body: { amount, phone, description: description ?? 'BusGo payment' },
      });
      if (error) throw error;
      if (data?.error || !data?.reference) {
        throw new Error(data?.error ?? 'Could not start the payment');
      }
      pollStatus(data.reference as string, 0);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not start the payment. Please try again.');
      setStep('failed');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Mobile Money Payment</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <div className="mb-4 rounded-lg bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">Amount to Pay</p>
            <p className="font-heading text-2xl font-bold text-accent">{formatCurrency(amount)}</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground text-center mb-3">Select payment method</p>
                <button
                  onClick={() => { setProvider('mtn'); setStep('enter'); }}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-[hsl(48,100%,50%)] hover:bg-[hsl(48,100%,50%)]/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(48,100%,50%)] font-heading text-sm font-bold text-[hsl(0,0%,0%)]">
                    MTN
                  </div>
                  <div className="text-left">
                    <p className="font-heading font-bold text-foreground">MTN Mobile Money</p>
                    <p className="text-xs text-muted-foreground">Pay with MTN MoMo</p>
                  </div>
                </button>
                <button
                  onClick={() => { setProvider('orange'); setStep('enter'); }}
                  className="flex w-full items-center gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-[hsl(25,100%,50%)] hover:bg-[hsl(25,100%,50%)]/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(25,100%,50%)] font-heading text-sm font-bold text-[hsl(0,0%,100%)]">
                    OM
                  </div>
                  <div className="text-left">
                    <p className="font-heading font-bold text-foreground">Orange Money</p>
                    <p className="text-xs text-muted-foreground">Pay with Orange Money</p>
                  </div>
                </button>
              </motion.div>
            )}

            {step === 'enter' && (
              <motion.div
                key="enter"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-heading text-xs font-bold ${
                    provider === 'mtn'
                      ? 'bg-[hsl(48,100%,50%)] text-[hsl(0,0%,0%)]'
                      : 'bg-[hsl(25,100%,50%)] text-[hsl(0,0%,100%)]'
                  }`}>
                    {provider === 'mtn' ? 'MTN' : 'OM'}
                  </div>
                  <p className="font-heading font-bold text-foreground">
                    {provider === 'mtn' ? 'MTN Mobile Money' : 'Orange Money'}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="flex items-center rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground">+237</span>
                    <Input
                      type="tel"
                      placeholder="6XX XXX XXX"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 9)); setPhoneError(null); }}
                      className="bg-background"
                    />
                  </div>
                  {phoneError && <p className="mt-1 text-xs text-destructive">{phoneError}</p>}
                </div>

                <p className="text-xs text-muted-foreground">
                  <Smartphone className="mr-1 inline h-3 w-3" />
                  You will receive a prompt on your phone to confirm the payment of {formatCurrency(amount)}.
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setStep('select'); setProvider(null); }} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handlePay}
                    disabled={phone.length < 9}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Pay {formatCurrency(amount)}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <Loader2 className="h-12 w-12 animate-spin text-accent" />
                <div className="text-center">
                  <p className="font-heading font-bold text-foreground">Waiting for Confirmation...</p>
                  <p className="text-sm text-muted-foreground">
                    Check your phone and enter your PIN to approve the payment of {formatCurrency(amount)}.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <div className="text-center">
                  <p className="font-heading font-bold text-foreground">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(amount)} received via {provider === 'mtn' ? 'MTN MoMo' : 'Orange Money'}
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-8"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="font-heading font-bold text-foreground">Payment Not Completed</p>
                  <p className="text-sm text-muted-foreground">{errorMsg ?? 'Something went wrong. Please try again.'}</p>
                </div>
                <Button
                  onClick={() => { setStep('enter'); setErrorMsg(null); }}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
