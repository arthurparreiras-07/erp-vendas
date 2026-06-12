import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  region: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function ClientesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [cnpjSearch, setCnpjSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ['clients', search, cnpjSearch],
    queryFn: () => api.get('/clients', { params: { name: search || undefined, cnpj: cnpjSearch || undefined } }).then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: (body: FormData) => api.post('/clients', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); closeForm(); },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<FormData> }) => api.put(`/clients/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); closeForm(); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setDeleting(null); },
  });

  function openCreate() {
    setEditing(null);
    reset({});
    setOpen(true);
  }

  function openEdit(client: any) {
    setEditing(client);
    reset(client);
    setOpen(true);
  }

  function closeForm() {
    setOpen(false);
    setEditing(null);
    reset({});
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
        <Button onClick={openCreate}>+ Novo Cliente</Button>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Input
          placeholder="Buscar por CNPJ..."
          value={cnpjSearch}
          onChange={(e) => setCnpjSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {['Nome', 'CNPJ', 'E-mail', 'Região', 'Telefone', 'Ações'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.items?.map((c: any) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                <td className="px-4 py-3 text-slate-500">{c.cnpj ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{c.region ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{c.phone ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(c)} className="text-blue-600 hover:underline text-xs font-medium">
                      Editar
                    </button>
                    <button onClick={() => setDeleting(c)} className="text-red-500 hover:underline text-xs font-medium">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!data?.items?.length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhum cliente encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Editar Cliente' : 'Novo Cliente'} onClose={closeForm}>
          <form onSubmit={handleSubmit((d) => editing ? update.mutate({ id: editing.id, body: d }) : create.mutate(d))} className="space-y-3">
            <Input label="Nome *" {...register('name')} error={errors.name?.message} />
            <Input label="CNPJ" {...register('cnpj')} />
            <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
            <Input label="Telefone" {...register('phone')} />
            <Input label="Região" {...register('region')} />
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={create.isPending || update.isPending}>
                {create.isPending || update.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="secondary" type="button" onClick={closeForm}>Cancelar</Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <Modal title="Excluir Cliente" onClose={() => setDeleting(null)}>
          <p className="text-slate-600 mb-4">
            Tem certeza que deseja excluir <strong>{deleting.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => remove.mutate(deleting.id)} disabled={remove.isPending}>
              {remove.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
            <Button variant="secondary" onClick={() => setDeleting(null)}>Cancelar</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
