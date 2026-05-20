import { createFileRoute } from '@tanstack/react-router';
import { RelatoriosPage } from '@/features/relatorios/components/RelatoriosPage';

export const Route = createFileRoute('/_authenticated/relatorios')({
  component: RelatoriosPage,
});
