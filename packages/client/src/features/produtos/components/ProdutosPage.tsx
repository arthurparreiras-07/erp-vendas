import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export function ProdutosPage() {
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then((r) => r.data),
  });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Produtos</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {['SKU', 'Nome', 'Categoria', 'Custo', 'Preço Venda'].map((h) => (
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
              </tr>
            ))}
            {!data?.items?.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum produto cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
