import { createFileRoute, redirect } from '@tanstack/react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { isAuthenticated } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    if (!isAuthenticated()) throw redirect({ to: '/login' });
  },
  component: AppLayout,
});
