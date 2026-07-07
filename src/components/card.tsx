import { useRef, useState } from 'react';
import { Camera, MapPin, PlusCircle } from 'lucide-react';

const defaultCities = [
  { id: 'douala', city: 'Douala', region: 'Coastline', agencies: 5, desc: 'Five strategic branches — Bonabéri, Bépanda, Brazzaville, Mpoppi and Village.' },
  { id: 'yaounde', city: 'Yaoundé', region: 'Center', agencies: 5, desc: 'Five agencies in the political capital, including Mvan, Carrière and Biyem-Assi.' },
  { id: 'bamenda', city: 'Bamenda', region: 'North West', agencies: 3, desc: 'Gateway to the highlands, serving Nkwen, Up Station and commercial avenue.' },
  { id: 'buea', city: 'Buea', region: 'South West', agencies: 2, desc: 'At the foot of Mount Cameroon, serving university and commercial districts.' },
  { id: 'limbe', city: 'Limbe', region: 'South West', agencies: 1, desc: 'Coastal city known for its black-sand beaches and wildlife centre.' },
];

export default function DestinationCards() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (id: string) => {
    setActiveId(id);
    fileRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    const url = URL.createObjectURL(file);
    setImages(prev => ({ ...prev, [activeId]: url }));
    e.target.value = '';
  };

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="mb-8 text-center font-heading text-3xl font-bold text-foreground">
        Our Destinations
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {defaultCities.map(c => (
          <div key={c.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <div
              className="relative h-44 bg-muted cursor-pointer group"
              onClick={() => handleUpload(c.id)}
            >
              {images[c.id] ? (
                <img src={images[c.id]} alt={c.city} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Camera className="h-8 w-8" />
                  <span className="text-xs">Upload photo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm">Change photo</span>
              </div>
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {c.region}
              </span>
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {c.agencies} {c.agencies === 1 ? 'agency' : 'agencies'}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{c.region}</p>
              <h3 className="font-heading text-xl font-semibold mb-2">{c.city}</h3>
              <p className="text-sm text-muted-foreground mb-3">{c.desc}</p>
              <button
                onClick={() => handleUpload(c.id)}
                className="text-xs text-primary underline"
              >
                {images[c.id] ? 'Change image' : 'Upload image'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </section>
  );
}