import { createFileRoute } from '@tanstack/react-router';
import { NovaVendaPage } from '@/features/vendas/components/NovaVendaPage';

export const Route = createFileRoute('/_authenticated/vendas/novo')({
  component: NovaVendaPage,
});
