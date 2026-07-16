import { useState } from 'react'
import { Plus, Trash2, Edit3, Package, BarChart3, X, Save, ShoppingCart, Check, Clock, XCircle, Truck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/helpers'
import type { Product, Order } from '../types'

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: 'Vitamines',
  image: 'https://images.unsplash.com/photo-1587854692152-c1042659ba08?w=400&h=400&fit=crop',
  brand: '',
}

type AdminTab = 'products' | 'orders'

function orderStatusLabel(status: Order['status']) {
  if (status === 'pending') return 'En attente'
  if (status === 'confirmed') return 'Confirmée'
  if (status === 'rejected') return 'Refusée'
  return 'Livrée'
}

function orderStatusClass(status: Order['status']) {
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'confirmed') return 'bg-blue-100 text-blue-700'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-primary-100 text-primary-700'
}

export default function Admin() {
  const { products, categories, orders, addProduct, updateProduct, deleteProduct, updateOrderStatus } = useApp()
  const [tab, setTab] = useState<AdminTab>('products')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [search, setSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState<Order['status'] | 'all'>('all')

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  const sortedOrders = [...orders]
    .filter((o) => orderFilter === 'all' || o.status === orderFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const totalStock = products.reduce((s, p) => s + p.stock, 0)
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0)

  const openAdd = () => {
    setForm(emptyProduct)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image,
      brand: product.brand,
    })
    setEditingId(product.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || form.price <= 0) return

    if (editingId) {
      await updateProduct(editingId, form)
    } else {
      await addProduct(form)
    }
    setShowForm(false)
    setForm(emptyProduct)
    setEditingId(null)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer « ${name} » ?`)) {
      await deleteProduct(id)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="page-subtitle">Gestion des produits et des commandes</p>
        </div>
        {tab === 'products' && (
          <button onClick={openAdd} className="btn-primary">
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </button>
        )}
      </div>

      <div className="mb-6 flex gap-2 border-b border-primary-100">
        <button
          onClick={() => setTab('products')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'products'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-teal-muted hover:text-teal-text'
          }`}
        >
          <Package className="h-4 w-4" />
          Produits
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
            tab === 'orders'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-teal-muted hover:text-teal-text'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Commandes
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {tab === 'products' && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="card flex items-center gap-4 !p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-text">{products.length}</p>
                <p className="text-sm text-teal-muted">Produits</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 !p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint-200 text-primary-700">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-text">{totalStock}</p>
                <p className="text-sm text-teal-muted">Stock total</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 !p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <span className="text-lg font-bold">DT</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-text">{formatPrice(totalValue)}</p>
                <p className="text-sm text-teal-muted">Valeur du stock</p>
              </div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field mb-6 max-w-md"
          />

          <div className="card overflow-hidden !p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-primary-100 bg-primary-50">
                    <th className="px-4 py-3 text-left font-semibold text-teal-text">Produit</th>
                    <th className="px-4 py-3 text-left font-semibold text-teal-text">Catégorie</th>
                    <th className="px-4 py-3 text-left font-semibold text-teal-text">Prix</th>
                    <th className="px-4 py-3 text-left font-semibold text-teal-text">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold text-teal-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-teal-muted">
                        Aucun produit. Cliquez sur « Ajouter un produit » pour commencer.
                      </td>
                    </tr>
                  ) : filtered.map((product) => (
                    <tr key={product.id} className="border-b border-primary-50 hover:bg-primary-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-medium text-teal-text">{product.name}</p>
                            <p className="text-xs text-teal-muted">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-teal-muted">{product.category}</td>
                      <td className="px-4 py-3 font-semibold text-primary-600">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          product.stock === 0 ? 'bg-red-100 text-red-600' :
                          product.stock <= 5 ? 'bg-amber-100 text-amber-700' :
                          'bg-primary-100 text-primary-700'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-teal-muted hover:bg-primary-100 hover:text-primary-600"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {(['all', 'pending', 'confirmed', 'rejected', 'delivered'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setOrderFilter(status)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  orderFilter === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-primary-50 text-teal-muted hover:bg-primary-100'
                }`}
              >
                {status === 'all' ? 'Toutes' : orderStatusLabel(status)}
              </button>
            ))}
          </div>

          {sortedOrders.length === 0 ? (
            <div className="card py-16 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-primary-200" />
              <p className="mt-3 text-teal-muted">Aucune commande pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedOrders.map((order) => (
                <div key={order.id} className="card !p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-bold text-teal-text">Commande #{order.id.slice(0, 8)}</p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${orderStatusClass(order.status)}`}>
                          {orderStatusLabel(order.status)}
                        </span>
                        <p className="text-sm text-teal-muted">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {order.shipping && (
                        <div className="mt-4 grid gap-2 rounded-xl bg-primary-50 p-4 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs font-medium text-teal-muted">Client</p>
                            <p className="font-medium text-teal-text">{order.shipping.fullName}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-teal-muted">Téléphone</p>
                            <p className="font-medium text-teal-text">{order.shipping.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-teal-muted">Gouvernorat</p>
                            <p className="font-medium text-teal-text">{order.shipping.governorate}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-teal-muted">Ville</p>
                            <p className="font-medium text-teal-text">{order.shipping.city}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-teal-muted">Code postal</p>
                            <p className="font-medium text-teal-text">{order.shipping.postalCode}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-xs font-medium text-teal-muted">Adresse</p>
                            <p className="font-medium text-teal-text">{order.shipping.address}</p>
                          </div>
                          {order.shipping.notes && (
                            <div className="sm:col-span-2">
                              <p className="text-xs font-medium text-teal-muted">Notes</p>
                              <p className="text-teal-text">{order.shipping.notes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-4 border-t border-primary-50 pt-3">
                        {order.items.map((item) => {
                          const product = products.find((p) => p.id === item.productId)
                          return (
                            <div key={item.productId} className="flex justify-between py-1 text-sm">
                              <span className="text-teal-muted">{product?.name ?? 'Produit'} × {item.quantity}</span>
                              <span className="font-medium text-teal-text">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 lg:min-w-[200px]">
                      <p className="text-xl font-bold text-primary-600">{formatPrice(order.total)}</p>
                      <div className="flex flex-wrap gap-2">
                        {order.status !== 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Accepter
                          </button>
                        )}
                        {order.status !== 'rejected' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'rejected')}
                            className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Refuser
                          </button>
                        )}
                        {order.status !== 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            En attente
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-600"
                          >
                            <Truck className="h-3.5 w-3.5" />
                            Livrée
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-teal-text">
                {editingId ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-teal-light hover:text-teal-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-teal-text">Nom du produit *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-teal-text">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field !min-h-[80px]" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-teal-text">Prix (DT) *</label>
                  <input type="number" step="0.01" min="0" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="input-field" required />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-teal-text">Stock *</label>
                  <input type="number" min="0" value={form.stock || ''} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-teal-text">Catégorie</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    {categories.filter((c) => c !== 'Tous').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-teal-text">Marque</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-teal-text">URL de l'image</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" />
              </div>
              <button type="submit" className="btn-primary w-full !py-3">
                <Save className="h-4 w-4" />
                {editingId ? 'Enregistrer les modifications' : 'Ajouter le produit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
