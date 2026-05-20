import { createFileRoute } from '@tanstack/react-router';
import { VendasPage } from '@/features/vendas/components/VendasPage';

export const Route = createFileRoute('/_authenticated/vendas/')({
  component: VendasPage,
});
