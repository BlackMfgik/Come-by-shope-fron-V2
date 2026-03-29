const BASE = import.meta.env.VITE_API_URL ?? '';

function authHeaders(token?: string | null): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const d = await res.json();
      if (d?.error) msg = d.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// --- Auth ---
export interface AuthPayload { token: string; user: UserInfo }
export interface UserInfo { id: number; email: string; name?: string; phone?: string; address?: string; admin: boolean }

export async function apiLogin(email: string, password: string): Promise<AuthPayload> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthPayload>(res);
}

export async function apiRegister(email: string, password: string): Promise<AuthPayload> {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthPayload>(res);
}

// --- Products ---
export interface Product {
  id: number;
  name: string;
  description?: string;
  weight?: string;
  price: number;
  image?: string;
  imageName?: string;
  category?: string;
}

export async function apiGetProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/api/products`, { headers: { Accept: 'application/json' } });
  return handleResponse<Product[]>(res);
}

export async function apiGetProduct(id: number): Promise<Product> {
  const res = await fetch(`${BASE}/api/products/${id}`);
  return handleResponse<Product>(res);
}

export async function apiCreateProduct(data: Omit<Product, 'id'>, token: string): Promise<Product> {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<Product>(res);
}

export async function apiUpdateProduct(id: number, data: Partial<Product>, token: string): Promise<Product> {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<Product>(res);
}

export async function apiDeleteProduct(id: number, token: string): Promise<void> {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// --- Orders ---
export interface OrderItem { productId: number; quantity: number }

export async function apiCreateOrder(items: OrderItem[], token: string): Promise<unknown> {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ items }),
  });
  return handleResponse(res);
}

// --- User profile ---
export async function apiUpdateProfile(data: Partial<UserInfo>, token: string): Promise<UserInfo> {
  const res = await fetch(`${BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse<UserInfo>(res);
}
