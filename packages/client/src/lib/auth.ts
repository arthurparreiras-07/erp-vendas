export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendedor';
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
