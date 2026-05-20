import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RelatoriosPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: report, refetch } = useQuery({
    queryKey: ['sales-report', from, to],
    queryFn: () => api.get('/reports/sales', { params: { from: from || undefined, to: to || undefined } }).then((r) => r.data),
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals').then((r) => r.data),
  });

  const chartData = (report ?? []).map((row: any) => {
    const goal = goals?.find((g: any) => g.seller?.id === row.sellerId);
    return {
      name: row.sellerName,
      realizado: Number(row.totalAmount.toFixed(2)),
      meta: goal ? Number(goal.targetAmount) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Relatórios de Vendas</h1>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <div className="flex flex-wrap gap-4 items-end">
          <Input label="De" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
          <Input label="Até" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
          <Button onClick={() => refetch()}>Filtrar</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-700 mb-4">Realizado vs. Meta</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
            <Legend />
            <Bar dataKey="realizado" fill="#2563eb" name="Realizado" radius={[4, 4, 0, 0]} />
            <Bar dataKey="meta" fill="#e2e8f0" name="Meta" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {['Vendedor', 'Vendas R$', 'Qtd Pedidos', 'Margem Média %'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(report ?? []).map((row: any) => (
              <tr key={row.sellerId} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{row.sellerName}</td>
                <td className="px-4 py-3">R$ {Number(row.totalAmount).toFixed(2)}</td>
                <td className="px-4 py-3">{row.orderCount}</td>
                <td className="px-4 py-3">{Number(row.avgMargin).toFixed(1)}%</td>
              </tr>
            ))}
            {!report?.length && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhum dado encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
