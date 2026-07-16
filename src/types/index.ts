export interface User {
  id: string
  name: string
  email: string
  password: string
  phone: string
  address: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  image: string
  brand: string
  createdAt: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface OrderShipping {
  fullName: string
  phone: string
  governorate: string
  city: string
  postalCode: string
  address: string
  notes?: string
}

export interface Order {
  id: string
  userId: string
  items: { productId: string; quantity: number; price: number }[]
  total: number
  status: 'pending' | 'confirmed' | 'rejected' | 'delivered'
  shipping?: OrderShipping
  createdAt: string
}

export interface InvoiceItem {
  name: string
  price: number
  quantity: number
  confidence?: 'high' | 'medium' | 'low'
}

export interface ParsedInvoice {
  items: InvoiceItem[]
  total: number
  invoiceTotal?: number
  rawText: string
  warnings?: string[]
  source: 'ai' | 'ocr'
}
