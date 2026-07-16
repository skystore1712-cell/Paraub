import type { User, Product, Order, ParsedInvoice } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  getProducts: () => request<Product[]>('/products'),
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) =>
    request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  addProductsBulk: (items: { name: string; price: number; quantity: number }[]) =>
    request<Product[]>('/products/bulk', { method: 'POST', body: JSON.stringify(items) }),
  updateProduct: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) =>
    request<{ ok: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  login: (email: string, password: string) =>
    request<Omit<User, 'password'>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: Omit<User, 'id' | 'role' | 'createdAt'>) =>
    request<Omit<User, 'password'>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<User>) =>
    request<Omit<User, 'password'>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getOrders: () => request<Order[]>('/orders'),
  createOrder: (data: Omit<Order, 'id' | 'createdAt'>) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrder: (id: string, data: Partial<Order>) =>
    request<Order>(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getCategories: () => request<string[]>('/categories'),

  getInvoiceStatus: () => request<{ aiAvailable: boolean }>('/invoice/status'),
  parseInvoice: (image: string, mimeType: string) =>
    request<ParsedInvoice>('/invoice/parse', {
      method: 'POST',
      body: JSON.stringify({ image, mimeType }),
    }),
}
