/**
 * SendParcel page - allows authenticated users to send a parcel.
 */
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PaymentModal from '@/components/PaymentModal';
import { buildParcelEmailContent } from '@/lib/parcelEmail';

const cities = ['Douala', 'Yaoundé', 'Bamenda', 'Buea', 'Limbe'];

const calculateFare = (weight: number): number => {
  if (weight <= 0) return 0;
  return Math.round(weight * 1);
};

const SendParcel = () => {
  const { user, branchId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/login" />;

  const fare = calculateFare(parseFloat(weight) || 0);

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderPhone || !senderEmail || !recipientName || !recipientPhone || !recipientEmail || !origin || !destination || !weight) {
      toast.error('Please fill in all required fields, including sender and recipient emails.');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(senderEmail) || !emailRe.test(recipientEmail)) {
      toast.error('Please enter valid email addresses for sender and recipient.');
      return;
    }
    if (origin === destination) {
      toast.error('Origin and destination must be different.');
      return;
    }
    setShowPayment(true);
  };

  const registerParcel = async () => {
    setShowPayment(false);
    setIsSubmitting(true);
    try {
      const trackingCode = `PCL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error } = await supabase.from('parcels').insert({
        sender_id: user.id,
        branch_id: branchId,
        tracking_code: trackingCode,
        sender_name: senderName,
        sender_phone: senderPhone,
        sender_email: senderEmail,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
        origin,
        destination,
        description,
        weight_kg: parseFloat(weight),
        fare,
        status: 'pending',
      });

      if (error) throw error;

      const trackingUrl = `${window.location.origin}/track-parcel?code=${trackingCode}`;
      const parcelEmail = buildParcelEmailContent({
        recipientName: recipientName,
        senderName,
        trackingCode,
        trackingUrl,
        origin,
        destination,
      });

      try {
        await supabase.functions.invoke('send-parcel-email', {
          body: {
            to: recipientEmail,
            subject: parcelEmail.subject,
            text: parcelEmail.text,
            html: parcelEmail.html,
          },
        });
      } catch (emailErr) {
        console.warn('Parcel email notification failed:', emailErr);
      }

      toast.success(`Parcel registered! Tracking code: ${trackingCode}`, { duration: 12000 });
      navigate('/admin/parcels');
    } catch (err: any) {
      toast.error(err.message || 'Failed to register parcel.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Send a Parcel</h1>
              <p className="text-sm text-muted-foreground">Fill in the details to register your parcel for delivery</p>
            </div>
          </div>

          <form onSubmit={handleInitiatePayment} className="space-y-6">
            {/* Sender */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Sender Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Sender Name *" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="bg-background" />
                <Input type="tel" placeholder="Sender Phone *" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="bg-background" />
                <Input type="email" placeholder="Sender Email *" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className="bg-background sm:col-span-2" />
              </div>
            </div>

            {/* Recipient */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Recipient Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Recipient Name *" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="bg-background" />
                <Input type="tel" placeholder="Recipient Phone *" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="bg-background" />
                <Input type="email" placeholder="Recipient Email *" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} className="bg-background sm:col-span-2" />
              </div>
            </div>

            {/* Route & Parcel */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Parcel Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 text-sm text-muted-foreground">Origin *</label>
                  <Select value={origin} onValueChange={setOrigin}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 text-sm text-muted-foreground">Destination *</label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {cities.filter((c) => c !== origin).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input type="number" step="0.1" min="0.1" placeholder="Weight (kg) *" value={weight} onChange={(e) => setWeight(e.target.value)} className="bg-background" />
                <div className="flex items-center rounded-lg bg-muted px-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Pricing</span>
                    <span className="text-sm font-medium text-foreground">1 FCFA per kg</span>
                  </div>
                  <span className="ml-auto font-heading font-bold text-accent">{formatCurrency(fare)}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Fare is calculated as <span className="font-semibold text-foreground">weight (kg) × 1 FCFA</span>.</p>
              <Textarea placeholder="Parcel description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-3 bg-background" />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent py-6 font-heading text-base font-bold text-accent-foreground shadow-accent hover:bg-accent/90"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
              Register Parcel — {formatCurrency(fare)}
            </Button>
          </form>

          <PaymentModal
            open={showPayment}
            onClose={() => setShowPayment(false)}
            onSuccess={registerParcel}
            amount={fare}
            description={`Parcel ${origin} to ${destination}`}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SendParcel;
