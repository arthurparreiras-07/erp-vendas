import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableSkeleton } from '@/components/ui/TableSkeleton';

export function EstoquePage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<{ productId: string; name: string; current: number } | null>(null);
  const [newQty, setNewQty] = useState(0);

  const { data: stocks, isLoading } = useQuery({
    queryKey: ['stock'],
    queryFn: () => api.get('/stock').then((r) => r.data),
  });

  const update = useMutation({
    mutationFn: ({ productId, physical }: { productId: string; physical: number }) =>
      api.put(`/stock/${productId}`, { physical }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Estoque atualizado!');
      setEditing(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.error ?? 'Erro ao atualizar estoque'),
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Estoque</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {['SKU', 'Produto', 'Físico', 'Reservado', 'Disponível', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <TableSkeleton rows={6} cols={7} />
            ) : (
              <>
                {stocks?.map((s: any) => {
                  const available = s.physical - s.reserved;
                  const isLow = available < 5;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.product?.sku}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{s.product?.name}</td>
                      <td className="px-4 py-3">{s.physical}</td>
                      <td className="px-4 py-3 text-slate-500">{s.reserved}</td>
                      <td className="px-4 py-3 font-medium">{available}</td>
                      <td className="px-4 py-3">
                        <Badge label={isLow ? 'Crítico' : 'OK'} color={isLow ? 'red' : 'green'} />
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="secondary" onClick={() => {
                          setEditing({ productId: s.product.id, name: s.product.name, current: s.physical });
                          setNewQty(s.physical);
                        }}>
                          Atualizar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!stocks?.length && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Nenhum item em estoque</td></tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={`Atualizar Estoque — ${editing.name}`} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Estoque físico atual: <strong>{editing.current}</strong></p>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Novo valor (físico)</label>
              <input type="number" min={0} value={newQty} onChange={(e) => setNewQty(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => update.mutate({ productId: editing.productId, physical: newQty })} disabled={update.isPending}>
                {update.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
