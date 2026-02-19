/**
 * AdminBuses page for managing the bus fleet.
 * Admin can add, edit, and remove buses.
 */
import { useState } from 'react';
import { buses as initialBuses, type Bus } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Star, Bus as BusIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const AdminBuses = () => {
  const [busList, setBusList] = useState<Bus[]>(initialBuses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formOperator, setFormOperator] = useState('');
  const [formType, setFormType] = useState<Bus['type']>('AC Seater');
  const [formSeats, setFormSeats] = useState('40');

  const openAdd = () => {
    setEditingBus(null);
    setFormName('');
    setFormOperator('');
    setFormType('AC Seater');
    setFormSeats('40');
    setDialogOpen(true);
  };

  const openEdit = (bus: Bus) => {
    setEditingBus(bus);
    setFormName(bus.name);
    setFormOperator(bus.operator);
    setFormType(bus.type);
    setFormSeats(String(bus.totalSeats));
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formName || !formOperator) {
      toast.error('Please fill all fields');
      return;
    }

    if (editingBus) {
      setBusList((prev) =>
        prev.map((b) =>
          b.id === editingBus.id
            ? { ...b, name: formName, operator: formOperator, type: formType, totalSeats: parseInt(formSeats) }
            : b
        )
      );
      toast.success('Bus updated successfully');
    } else {
      const newBus: Bus = {
        id: `b${Date.now()}`,
        name: formName,
        operator: formOperator,
        type: formType,
        totalSeats: parseInt(formSeats),
        amenities: ['Charging Port'],
        rating: 0,
        reviews: 0,
      };
      setBusList((prev) => [...prev, newBus]);
      toast.success('Bus added successfully');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setBusList((prev) => prev.filter((b) => b.id !== id));
    toast.success('Bus removed');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Manage Buses</h1>
            <p className="text-sm text-muted-foreground">{busList.length} buses in fleet</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAdd} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4" /> Add Bus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input placeholder="Bus Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
                <Input placeholder="Operator" value={formOperator} onChange={(e) => setFormOperator(e.target.value)} />
                <Select value={formType} onValueChange={(v) => setFormType(v as Bus['type'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Volvo AC">Volvo AC</SelectItem>
                    <SelectItem value="AC Sleeper">AC Sleeper</SelectItem>
                    <SelectItem value="AC Seater">AC Seater</SelectItem>
                    <SelectItem value="Non-AC Seater">Non-AC Seater</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Total Seats" value={formSeats} onChange={(e) => setFormSeats(e.target.value)} />
                <Button onClick={handleSave} className="w-full bg-primary text-primary-foreground">
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {busList.map((bus, i) => (
            <motion.div
              key={bus.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="shadow-soft">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <BusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-foreground">{bus.name}</h3>
                        <p className="text-xs text-muted-foreground">{bus.operator}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{bus.type}</Badge>
                  </div>
                  <div className="mb-3 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{bus.totalSeats} seats</span>
                    {bus.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" /> {bus.rating}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(bus)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(bus.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminBuses;
