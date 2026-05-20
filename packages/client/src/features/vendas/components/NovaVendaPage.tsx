import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CartItem { productId: string; name: string; quantity: number; unitPrice: number; available: number }

export function NovaVendaPage() {
  const navigate = useNavigate();
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const { data: clients } = useQuery({
    queryKey: ['clients-search', clientSearch],
    queryFn: () => api.get('/clients', { params: { name: clientSearch, limit: 5 } }).then((r) => r.data),
    enabled: clientSearch.length > 1,
  });

  const { data: products } = useQuery({
    queryKey: ['products-catalog'],
    queryFn: () => api.get('/products', { params: { limit: 100 } }).then((r) => r.data),
  });

  const createOrder = useMutation({
    mutationFn: (body: any) => api.post('/orders', body),
    onSuccess: () => navigate({ to: '/vendas' }),
  });

  function addToCart(product: any) {
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === product.id);
      if (exists) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, quantity: 1, unitPrice: product.salePrice, available: product.stock?.available ?? 0 }];
    });
  }

  function removeFromCart(productId: string) { setCart((prev) => prev.filter((i) => i.productId !== productId)); }
  function setQty(productId: string, qty: number) { setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: qty } : i)); }

  const subtotal = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const total = subtotal - discount + tax;

  function handleFinish() {
    if (!selectedClient || !cart.length) return;
    createOrder.mutate({
      clientId: selectedClient.id,
      items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      discount,
      tax,
    });
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Novo Pedido</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-3">Cliente</h2>
            {selectedClient ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-800">{selectedClient.name}</span>
                <button onClick={() => setSelectedClient(null)} className="text-blue-400 hover:text-blue-600 text-sm">Trocar</button>
              </div>
            ) : (
              <div className="relative">
                <Input placeholder="Buscar cliente por nome..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} />
                {clients?.items?.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg">
                    {clients.items.map((c: any) => (
                      <li key={c.id} className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm" onClick={() => { setSelectedClient(c); setClientSearch(''); }}>
                        {c.name} {c.cnpj && <span className="text-slate-400">— {c.cnpj}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 border-b bg-slate-50">
              <h2 className="font-semibold text-slate-700">Catálogo de Produtos</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-slate-500">
                <tr>
                  {['SKU', 'Nome', 'Preço', 'Disponível', ''].map((h) => (
                    <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products?.items?.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-mono text-xs text-slate-400">{p.sku}</td>
                    <td className="px-4 py-2 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-2">R$ {Number(p.salePrice).toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={(p.stock?.available ?? 0) < 5 ? 'text-red-500 font-medium' : 'text-green-600'}>
                        {p.stock?.available ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Button size="sm" variant="secondary" onClick={() => addToCart(p)} disabled={(p.stock?.available ?? 0) === 0}>
                        + Adicionar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 h-fit sticky top-4">
          <h2 className="font-semibold text-slate-700 mb-4">Carrinho</h2>
          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum item adicionado</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {cart.map((item) => (
                <li key={item.productId} className="flex items-center gap-2 text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-700">{item.name}</p>
                    <p className="text-slate-400">R$ {item.unitPrice.toFixed(2)}</p>
                  </div>
                  <input
                    type="number" min={1} max={item.available} value={item.quantity}
                    onChange={(e) => setQty(item.productId, Number(e.target.value))}
                    className="w-14 border rounded px-2 py-1 text-center"
                  />
                  <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-red-500">✕</button>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 border-t pt-3 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Desconto</span>
              <input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-20 border rounded px-2 py-0.5 text-right" />
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Impostos</span>
              <input type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))}
                className="w-20 border rounded px-2 py-0.5 text-right" />
            </div>
            <div className="flex justify-between font-bold text-slate-800 text-base border-t pt-2">
              <span>Total</span><span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            disabled={!selectedClient || !cart.length || createOrder.isPending}
            onClick={handleFinish}
          >
            {createOrder.isPending ? 'Finalizando...' : 'Finalizar Pedido'}
          </Button>
        </div>
      </div>
    </div>
  );
}
