import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User, Product, CartItem, Order, OrderShipping } from '../types'
import { storage } from '../utils/storage'
import { api } from '../services/api'
import { DELIVERY_FEE } from '../utils/helpers'

type SafeUser = Omit<User, 'password'>

interface AppContextType {
  user: SafeUser | null
  products: Product[]
  cart: CartItem[]
  orders: Order[]
  categories: string[]
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (data: Omit<User, 'id' | 'role' | 'createdAt'>) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  addProductsFromInvoice: (items: { name: string; price: number; quantity: number }[]) => Promise<void>
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  placeOrder: (shipping: OrderShipping) => Promise<Order | null>
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>
  cartCount: number
  cartSubtotal: number
  deliveryFee: number
  cartTotal: number
  refreshProducts: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(() => storage.getCurrentUser())
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>(() => storage.getCart())
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const refreshProducts = useCallback(async () => {
    const data = await api.getProducts()
    setProducts(data)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [prods, ords, cats] = await Promise.all([
          api.getProducts(),
          api.getOrders(),
          api.getCategories(),
        ])
        setProducts(prods)
        setOrders(ords)
        setCategories(cats)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => { storage.setCart(cart) }, [cart])
  useEffect(() => { storage.setCurrentUser(user) }, [user])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const loggedIn = await api.login(email, password)
      setUser(loggedIn)
      return true
    } catch {
      return false
    }
  }, [])

  const register = useCallback(async (data: Omit<User, 'id' | 'role' | 'createdAt'>): Promise<boolean> => {
    try {
      const newUser = await api.register(data)
      setUser(newUser)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    storage.setCurrentUser(null)
  }, [])

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) return
    const updated = await api.updateUser(user.id, data)
    setUser(updated)
  }, [user])

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>) => {
    const created = await api.addProduct(product)
    setProducts((prev) => [...prev, created])
  }, [])

  const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const updated = await api.updateProduct(id, data)
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    await api.deleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setCart((prev) => prev.filter((c) => c.productId !== id))
  }, [])

  const addProductsFromInvoice = useCallback(async (items: { name: string; price: number; quantity: number }[]) => {
    const created = await api.addProductsBulk(items)
    setProducts((prev) => [...prev, ...created])
  }, [])

  const addToCart = useCallback((productId: string, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId)
      if (existing) {
        return prev.map((c) =>
          c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c
        )
      }
      return [...prev, { productId, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId))
  }, [])

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.productId !== productId))
    } else {
      setCart((prev) =>
        prev.map((c) => (c.productId === productId ? { ...c, quantity } : c))
      )
    }
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  const cartSubtotal = cart.reduce((sum, c) => {
    const product = products.find((p) => p.id === c.productId)
    return sum + (product ? product.price * c.quantity : 0)
  }, 0)

  const deliveryFee = cart.length > 0 ? DELIVERY_FEE : 0
  const cartTotal = cartSubtotal + deliveryFee

  const placeOrder = useCallback(async (shipping: OrderShipping): Promise<Order | null> => {
    if (!user || cart.length === 0) return null
    const orderItems = cart.map((c) => {
      const product = products.find((p) => p.id === c.productId)!
      return { productId: c.productId, quantity: c.quantity, price: product.price }
    })
    const total = orderItems.reduce((s, i) => s + i.price * i.quantity, 0) + DELIVERY_FEE
    const order = await api.createOrder({
      userId: user.id,
      items: orderItems,
      total,
      status: 'pending',
      shipping,
    })
    setOrders((prev) => [...prev, order])
    await refreshProducts()
    setCart([])
    return order
  }, [user, cart, products, refreshProducts])

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    const updated = await api.updateOrder(id, { status })
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
  }, [])

  return (
    <AppContext.Provider
      value={{
        user, products, cart, orders, categories, loading,
        login, register, logout, updateProfile,
        addProduct, updateProduct, deleteProduct, addProductsFromInvoice,
        addToCart, removeFromCart, updateCartQuantity, clearCart, placeOrder, updateOrderStatus,
        cartCount, cartSubtotal, deliveryFee, cartTotal, refreshProducts,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
