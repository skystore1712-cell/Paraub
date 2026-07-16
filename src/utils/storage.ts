import type { User, CartItem } from '../types'

const KEYS = {
  cart: 'pp_cart',
  currentUser: 'pp_current_user',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export const storage = {
  getCart: (): CartItem[] => read(KEYS.cart, []),
  setCart: (cart: CartItem[]) => write(KEYS.cart, cart),

  getCurrentUser: (): Omit<User, 'password'> | null => read(KEYS.currentUser, null),
  setCurrentUser: (user: Omit<User, 'password'> | null) => write(KEYS.currentUser, user),
}
