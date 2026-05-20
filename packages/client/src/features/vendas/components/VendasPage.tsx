import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { api } from '@/lib/axios';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const statusBadge: Record<string, { label: string; color: 'yellow' | 'green' | 'red' }> = {
  pending: { label: 'Pendente', color: 'yellow' },
  confirmed: { label: 'Confirmado', color: 'green' },
  cancelled: { label: 'Cancelado', color: 'red' },
};

export function VendasPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get('/orders').then((r) => r.data),
  });

  const confirm = useMutation({
    mutationFn: (id: string) => api.patch(`/orders/${id}/confirm`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => api.patch(`/orders/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Pedidos</h1>
        <Link to="/vendas/novo">
          <Button>+ Novo Pedido</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {['#', 'Cliente', 'Vendedor', 'Total', 'Status', 'Data', 'Ações'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data?.items?.map((o: any) => {
              const badge = statusBadge[o.status];
              return (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{o.client?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{o.seller?.name}</td>
                  <td className="px-4 py-3 font-medium">R$ {Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3"><Badge label={badge.label} color={badge.color} /></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {o.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => confirm.mutate(o.id)}>Confirmar</Button>
                          <Button size="sm" variant="danger" onClick={() => cancel.mutate(o.id)}>Cancelar</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!data?.items?.length && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Nenhum pedido encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
