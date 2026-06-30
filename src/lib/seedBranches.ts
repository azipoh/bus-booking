import { supabase } from '@/integrations/supabase/client';

export const seedBranches = async () => {
  const branches = [
    { name: 'Douala Branch', location: 'Douala, Littoral Region' },
    { name: 'Yaounde Branch', location: 'Yaounde, Centre Region' },
    { name: 'Bamenda Branch', location: 'Bamenda, North West Region' },
    { name: 'Limbe Branch', location: 'Limbe, South West Region' },
  ];

  for (const branch of branches) {
    const { data, error } = await supabase
      .from('branches')
      .select('id')
      .eq('name', branch.name)
      .single();

    if (!data) {
      await supabase.from('branches').insert(branch);
    }
  }
};
