import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Package, CheckCircle, Edit3, Save } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/helpers'

export default function Profile() {
  const { user, orders, products, updateProfile } = useApp()
  const location = useLocation()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  })

  useEffect(() => {
    if ((location.state as { orderPlaced?: boolean })?.orderPlaced) {
      setOrderSuccess(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  if (!user) return null

  const userOrders = orders.filter((o) => o.userId === user.id).reverse()

  const handleSave = async () => {
    await updateProfile(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const statusLabel = (status: string) => {
    if (status === 'pending') return 'En attente'
    if (status === 'confirmed') return 'Confirmée'
    if (status === 'rejected') return 'Refusée'
    return 'Livrée'
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      {orderSuccess && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary-100 px-4 py-3 text-primary-700">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Votre commande a été confirmée ! Nous vous contacterons bientôt.</span>
        </div>
      )}

      <h1 className="page-title mb-8">Mon profil</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
              <User className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-teal-text">{user.name}</h2>
            <p className="text-sm text-teal-muted">{user.email}</p>
            {user.role === 'admin' && (
              <span className="mt-2 rounded-full bg-primary-500 px-3 py-1 text-xs font-bold text-white">
                Administrateur
              </span>
            )}
          </div>

          <div className="mt-6 space-y-3 border-t border-primary-100 pt-6">
            {editing ? (
              <>
                <div>
                  <label className="text-xs font-medium text-teal-muted">Nom</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field mt-1 !py-2" />
                </div>
                <div>
                  <label className="text-xs font-medium text-teal-muted">Téléphone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field mt-1 !py-2" />
                </div>
                <div>
                  <label className="text-xs font-medium text-teal-muted">Adresse</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field mt-1 !py-2" />
                </div>
                <button onClick={handleSave} className="btn-primary w-full !py-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-teal-light" />
                  <span className="text-teal-muted">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-teal-light" />
                  <span className="text-teal-muted">{user.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-teal-light" />
                  <span className="text-teal-muted">{user.address || 'Non renseigné'}</span>
                </div>
                <button onClick={() => setEditing(true)} className="btn-secondary w-full !py-2 mt-2">
                  <Edit3 className="h-4 w-4" />
                  Modifier les informations
                </button>
              </>
            )}
            {saved && (
              <p className="text-center text-sm text-primary-600 font-medium">Enregistré avec succès ✓</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-teal-text flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-500" />
            Mes commandes
          </h2>

          {userOrders.length === 0 ? (
            <div className="card py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-primary-200" />
              <p className="mt-3 text-teal-muted">Aucune commande pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div key={order.id} className="card !p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-teal-text">Commande #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-teal-muted">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{formatPrice(order.total)}</p>
                      <span className={`text-xs font-medium ${
                        order.status === 'delivered' ? 'text-primary-600' :
                        order.status === 'confirmed' ? 'text-blue-600' :
                        order.status === 'rejected' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-primary-50 pt-3">
                    {order.items.map((item) => {
                      const product = products.find((p) => p.id === item.productId)
                      return (
                        <div key={item.productId} className="flex justify-between text-sm py-1">
                          <span className="text-teal-muted">{product?.name ?? 'Produit'} × {item.quantity}</span>
                          <span className="text-teal-text">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
