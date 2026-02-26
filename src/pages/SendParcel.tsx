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

const cities = ['Douala', 'Yaoundé', 'Bamenda', 'Buea', 'Limbe'];

const calculateFare = (weight: number): number => {
  if (weight <= 1) return 1000;
  if (weight <= 5) return 2500;
  if (weight <= 10) return 4000;
  if (weight <= 20) return 6000;
  return 8000 + (weight - 20) * 300;
};

const SendParcel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');

  if (authLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/login" />;

  const fare = calculateFare(parseFloat(weight) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderPhone || !recipientName || !recipientPhone || !origin || !destination || !weight) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (origin === destination) {
      toast.error('Origin and destination must be different.');
      return;
    }

    setIsSubmitting(true);
    try {
      const trackingCode = `PCL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error } = await supabase.from('parcels').insert({
        sender_id: user.id,
        tracking_code: trackingCode,
        sender_name: senderName,
        sender_phone: senderPhone,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        origin,
        destination,
        description,
        weight_kg: parseFloat(weight),
        fare,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Parcel registered successfully!');
      navigate('/my-parcels');
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Sender Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Sender Name *" value={senderName} onChange={(e) => setSenderName(e.target.value)} className="bg-background" />
                <Input type="tel" placeholder="Sender Phone *" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="bg-background" />
              </div>
            </div>

            {/* Recipient */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
              <h3 className="mb-3 font-heading text-base font-bold text-foreground">Recipient Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Recipient Name *" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="bg-background" />
                <Input type="tel" placeholder="Recipient Phone *" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="bg-background" />
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
                  <span className="text-sm text-muted-foreground">Fare:</span>
                  <span className="ml-auto font-heading font-bold text-accent">{formatCurrency(fare)}</span>
                </div>
              </div>
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
        </motion.div>
      </div>
    </div>
  );
};

export default SendParcel;
