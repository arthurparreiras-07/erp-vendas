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
  sku: z.string().min(1, 'SKU obrigatório'),
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().optional(),
  costPrice: z.coerce.number().positive('Valor inválido'),
  salePrice: z.coerce.number().positive('Valor inválido'),
  category: z.string().optional(),
  initialStock: z.coerce.number().int().min(0).optional(),
});
type FormData = z.infer<typeof schema>;

export function ProdutosPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);

  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: (body: FormData) => api.post('/products', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); closeForm(); },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<FormData> }) => api.put(`/products/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); closeForm(); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); setDeleting(null); },
  });

  function openCreate() {
    setEditing(null);
    reset({});
    setOpen(true);
  }

  function openEdit(product: any) {
    setEditing(product);
    reset(product);
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
        <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
        <Button onClick={openCreate}>+ Novo Produto</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {['SKU', 'Nome', 'Categoria', 'Custo', 'Preço Venda', 'Disponível', 'Ações'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.items?.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.sku}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3 text-slate-500">{p.category ?? '—'}</td>
                <td className="px-4 py-3">R$ {Number(p.costPrice).toFixed(2)}</td>
                <td className="px-4 py-3 font-medium text-green-700">R$ {Number(p.salePrice).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={(p.stock?.available ?? 0) < 5 ? 'text-red-500 font-medium' : 'text-slate-700'}>
                    {p.stock?.available ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs font-medium">
                      Editar
                    </button>
                    <button onClick={() => setDeleting(p)} className="text-red-500 hover:underline text-xs font-medium">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!data?.items?.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Nenhum produto cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Editar Produto' : 'Novo Produto'} onClose={closeForm}>
          <form onSubmit={handleSubmit((d) => editing ? update.mutate({ id: editing.id, body: d }) : create.mutate(d))} className="space-y-3">
            <Input label="SKU *" {...register('sku')} error={errors.sku?.message} disabled={!!editing} />
            <Input label="Nome *" {...register('name')} error={errors.name?.message} />
            <Input label="Descrição" {...register('description')} />
            <Input label="Custo (R$) *" type="number" step="0.01" {...register('costPrice')} error={errors.costPrice?.message} />
            <Input label="Preço de Venda (R$) *" type="number" step="0.01" {...register('salePrice')} error={errors.salePrice?.message} />
            <Input label="Categoria" {...register('category')} />
            {!editing && (
              <Input label="Estoque Inicial" type="number" {...register('initialStock')} />
            )}
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
        <Modal title="Excluir Produto" onClose={() => setDeleting(null)}>
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
