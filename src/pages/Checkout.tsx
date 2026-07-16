import { useState, useEffect } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { User, Phone, MapPin, ShoppingBag, ArrowRight, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/helpers'
import { TUNISIAN_GOVERNORATES, isValidTunisianPhone } from '../utils/tunisia'
import type { OrderShipping } from '../types'

export default function Checkout() {
  const { cart, products, user, cartSubtotal, deliveryFee, cartTotal, placeOrder } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState<OrderShipping>({
    fullName: user?.name ?? '',
    phone: user?.phone ?? '',
    governorate: 'Tunis',
    city: '',
    postalCode: '',
    address: user?.address ?? '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const cartItems = cart
    .map((c) => {
      const product = products.find((p) => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter(Boolean) as { productId: string; quantity: number; product: (typeof products)[0] }[]

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || user.name,
        phone: f.phone || user.phone,
        address: f.address || user.address,
      }))
    }
  }, [user])

  if (!user) {
    return <Navigate to="/login" state={{ from: '/checkout' }} replace />
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="card mx-auto max-w-md py-16 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-primary-200" />
          <h2 className="mt-4 text-xl font-bold text-teal-text">Votre panier est vide</h2>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Voir les produits
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  const update = (field: keyof OrderShipping, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.fullName.trim()) {
      setError('Veuillez entrer votre nom complet')
      return
    }
    if (!isValidTunisianPhone(form.phone)) {
      setError('Numéro de téléphone tunisien invalide (ex: +216 98 123 456)')
      return
    }
    if (!form.city.trim()) {
      setError('Veuillez entrer votre ville ou délégation')
      return
    }
    if (!form.postalCode.trim() || !/^\d{4}$/.test(form.postalCode.trim())) {
      setError('Code postal invalide (4 chiffres, ex: 1000)')
      return
    }
    if (!form.address.trim()) {
      setError('Veuillez entrer votre adresse complète')
      return
    }

    setSubmitting(true)
    try {
      const order = await placeOrder(form)
      if (order) {
        navigate('/profile', { state: { orderPlaced: true } })
      }
    } catch {
      setError('Erreur lors de la commande. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="page-title mb-2">Finaliser la commande</h1>
      <p className="page-subtitle mb-8">Renseignez vos informations de livraison en Tunisie</p>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-5">
            <h2 className="text-lg font-bold text-teal-text">Informations de livraison</h2>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-teal-text">Nom complet *</label>
              <div className="relative">
                <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
                <input
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  className="input-field !pl-11"
                  placeholder="Mohamed Ben Ali"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-teal-text">Téléphone *</label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="input-field !pl-11"
                  placeholder="+216 98 123 456"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-teal-muted">Format tunisien : +216 suivi de 8 chiffres</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-teal-text">Gouvernorat *</label>
                <select
                  value={form.governorate}
                  onChange={(e) => update('governorate', e.target.value)}
                  className="input-field"
                  required
                >
                  {TUNISIAN_GOVERNORATES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-teal-text">Ville / Délégation *</label>
                <input
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="input-field"
                  placeholder="La Marsa, Sousse Ville..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-teal-text">Code postal *</label>
              <input
                value={form.postalCode}
                onChange={(e) => update('postalCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="input-field max-w-[200px]"
                placeholder="1000"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-teal-text">Adresse complète *</label>
              <div className="relative">
                <MapPin className="absolute top-3.5 left-4 h-4 w-4 text-teal-light" />
                <textarea
                  value={form.address}
                  onChange={(e) => update('address', e.target.value)}
                  className="input-field !pl-11 !min-h-[80px]"
                  placeholder="Rue, numéro, immeuble, étage..."
                  rows={3}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-teal-text">Notes de livraison (optionnel)</label>
              <div className="relative">
                <FileText className="absolute top-3.5 left-4 h-4 w-4 text-teal-light" />
                <textarea
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className="input-field !pl-11 !min-h-[60px]"
                  placeholder="Indications supplémentaires pour le livreur..."
                  rows={2}
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full !py-3">
              {submitting ? 'Envoi en cours...' : 'Confirmer la commande'}
            </button>
          </form>
        </div>

        <div>
          <div className="card sticky top-24">
            <h2 className="text-lg font-bold text-teal-text">Votre commande</h2>
            <div className="mt-4 space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-teal-muted">{product.name} × {quantity}</span>
                  <span className="font-medium text-teal-text">{formatPrice(product.price * quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-primary-100 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-teal-muted">Sous-total</span>
                <span className="font-medium text-teal-text">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-muted">Livraison (Tunisie)</span>
                <span className="font-medium text-teal-text">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="font-bold text-teal-text">Total</span>
                <span className="text-xl font-bold text-primary-600">{formatPrice(cartTotal)}</span>
              </div>
            </div>
            <Link to="/cart" className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700">
              ← Retour au panier
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
