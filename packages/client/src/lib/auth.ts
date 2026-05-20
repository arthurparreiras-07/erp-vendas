export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendedor';
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function saveAuth(user: AuthUser) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('user');
}

export function isAuthenticated(): boolean {
  return !!getUser();
}
