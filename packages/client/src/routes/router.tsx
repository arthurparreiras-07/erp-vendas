import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { DashboardPage } from '@/features/dashboard/components/DashboardPage';
import { ClientesPage } from '@/features/clientes/components/ClientesPage';
import { VendasPage } from '@/features/vendas/components/VendasPage';
import { NovaVendaPage } from '@/features/vendas/components/NovaVendaPage';
import { ProdutosPage } from '@/features/produtos/components/ProdutosPage';
import { EstoquePage } from '@/features/estoque/components/EstoquePage';
import { RelatoriosPage } from '@/features/relatorios/components/RelatoriosPage';
import { isAuthenticated } from '@/lib/auth';

const rootRoute = createRootRoute();

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app',
  component: AppLayout,
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' });
  },
});

const dashboardRoute = createRoute({ getParentRoute: () => appRoute, path: '/', component: DashboardPage });
const clientesRoute = createRoute({ getParentRoute: () => appRoute, path: '/clientes', component: ClientesPage });
const vendasRoute = createRoute({ getParentRoute: () => appRoute, path: '/vendas', component: VendasPage });
const novaVendaRoute = createRoute({ getParentRoute: () => appRoute, path: '/vendas/novo', component: NovaVendaPage });
const produtosRoute = createRoute({ getParentRoute: () => appRoute, path: '/produtos', component: ProdutosPage });
const estoqueRoute = createRoute({ getParentRoute: () => appRoute, path: '/estoque', component: EstoquePage });
const relatoriosRoute = createRoute({ getParentRoute: () => appRoute, path: '/relatorios', component: RelatoriosPage });

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    dashboardRoute,
    clientesRoute,
    vendasRoute,
    novaVendaRoute,
    produtosRoute,
    estoqueRoute,
    relatoriosRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}
