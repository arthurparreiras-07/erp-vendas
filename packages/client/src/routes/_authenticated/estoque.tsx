import { createFileRoute } from '@tanstack/react-router';
import { EstoquePage } from '@/features/estoque/components/EstoquePage';

export const Route = createFileRoute('/_authenticated/estoque')({
  component: EstoquePage,
});
