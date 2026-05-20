import { Link, useRouterState } from '@tanstack/react-router';
import { clearAuth, getUser } from '@/lib/auth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
  { to: '/vendas', label: 'Vendas', icon: '🛒' },
  { to: '/produtos', label: 'Produtos', icon: '📦' },
  { to: '/estoque', label: 'Estoque', icon: '🏭' },
  { to: '/relatorios', label: 'Relatórios', icon: '📈' },
];

export function Sidebar() {
  const user = getUser();
  const { location } = useRouterState();

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col text-white">
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-tight">ERP Vendas</h1>
        <p className="text-xs text-slate-400 mt-0.5">PUC Minas — Grupo 3</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-400 truncate">{user?.name}</p>
        <button
          onClick={() => { clearAuth(); window.location.href = '/login'; }}
          className="mt-1 text-xs text-slate-400 hover:text-white"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
