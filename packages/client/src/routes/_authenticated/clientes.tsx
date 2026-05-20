import { createFileRoute } from '@tanstack/react-router';
import { ClientesPage } from '@/features/clientes/components/ClientesPage';

export const Route = createFileRoute('/_authenticated/clientes')({
  component: ClientesPage,
});
