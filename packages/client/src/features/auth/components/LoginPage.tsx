import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from '@tanstack/react-router';
import { api } from '@/lib/axios';
import { saveAuth } from '@/lib/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await api.post('/auth/login', data);
      saveAuth(res.data.user);
      navigate({ to: '/' });
    } catch {
      setError('E-mail ou senha incorretos');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">ERP Vendas</h1>
        <p className="text-sm text-slate-500 mb-6">Faça login para continuar</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="E-mail" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Senha" type="password" {...register('password')} error={errors.password?.message} />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
