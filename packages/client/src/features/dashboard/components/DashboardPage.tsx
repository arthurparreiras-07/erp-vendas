import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function KpiCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { data: kpis } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => api.get('/dashboard/kpis').then((r) => r.data),
  });

  const { data: chart } = useQuery({
    queryKey: ['chart'],
    queryFn: () => api.get('/dashboard/chart').then((r) => r.data),
  });

  const { data: activities } = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.get('/activities').then((r) => r.data),
  });

  const chartData = chart?.labels?.map((label: string, i: number) => ({ label, value: chart.values[i] })) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Vendas Totais" value={kpis?.totalSales ?? '—'} icon="🛒" />
        <KpiCard label="Novos Clientes" value={kpis?.newClients ?? '—'} icon="👥" />
        <KpiCard label="Itens Baixo Estoque" value={kpis?.lowStockItems ?? '—'} icon="⚠️" />
        <KpiCard
          label="Receita Mensal"
          value={kpis ? `R$ ${Number(kpis.monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
          icon="💰"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">Desempenho de Vendas (7 semanas)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => `R$ ${v.toFixed(2)}`} />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h2 className="font-semibold text-slate-700 mb-4">Atividades Recentes</h2>
          <ul className="space-y-3">
            {(activities ?? []).map((a: any) => (
              <li key={a.id} className="text-sm text-slate-600 border-b border-slate-50 pb-2">
                {a.description}
                <span className="block text-xs text-slate-400 mt-0.5">
                  {new Date(a.createdAt).toLocaleString('pt-BR')}
                </span>
              </li>
            ))}
            {!activities?.length && <li className="text-sm text-slate-400">Nenhuma atividade</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
