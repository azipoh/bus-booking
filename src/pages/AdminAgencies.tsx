import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { agencies as mockAgencies, Agency } from '@/data/mockData';

const AdminAgencies = () => {
  const [list, setList] = useState<Agency[]>(mockAgencies);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleAdd = () => {
    if (!name || !code) return;
    const newAgency: Agency = {
      id: `a${Date.now()}`,
      name,
      code: code.toUpperCase(),
      contactEmail: undefined,
      contactPhone: undefined,
      active: true,
    };
    setList((s) => [newAgency, ...s]);
    setName('');
    setCode('');
  };

  const toggleActive = (id: string) => {
    setList((s) => s.map((ag) => (ag.id === id ? { ...ag, active: !ag.active } : ag)));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Agencies</h2>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Agency name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-28" />
        <Button onClick={handleAdd}>Add Agency</Button>
      </div>

      <div className="grid gap-2">
        {list.map((ag) => (
          <div key={ag.id} className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="font-medium">{ag.name} <span className="text-sm text-muted-foreground">({ag.code})</span></div>
              <div className="text-sm text-muted-foreground">{ag.contactEmail ?? 'No contact email'}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={ag.active ? 'default' : 'ghost'} onClick={() => toggleActive(ag.id)}>
                {ag.active ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAgencies;
