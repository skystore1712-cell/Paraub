import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/helpers'

export default function Cart() {
  const { cart, products, user, cartSubtotal, deliveryFee, cartTotal, updateCartQuantity, removeFromCart } = useApp()
  const navigate = useNavigate()

  const cartItems = cart
    .map((c) => {
      const product = products.find((p) => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter(Boolean) as { productId: string; quantity: number; product: (typeof products)[0] }[]

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    navigate('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="card mx-auto max-w-md py-16 text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-primary-200" />
          <h2 className="mt-4 text-xl font-bold text-teal-text">Votre panier est vide</h2>
          <p className="mt-2 text-teal-muted">Ajoutez des produits depuis la boutique pour commencer</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Voir les produits
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="page-title mb-8">Panier</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(({ product, quantity }) => (
            <div key={product.id} className="card flex gap-4 !p-4">
              <img
                src={product.image}
                alt={product.name}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-bold text-teal-text">{product.name}</h3>
                  <p className="text-sm text-teal-muted">{product.brand}</p>
                  <p className="mt-1 font-bold text-primary-600">{formatPrice(product.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQuantity(product.id, quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-200 text-teal-muted hover:bg-primary-50"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center font-semibold text-teal-text">{quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(product.id, quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-200 text-teal-muted hover:bg-primary-50 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="font-bold text-teal-text">{formatPrice(product.price * quantity)}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="card sticky top-24">
            <h2 className="text-lg font-bold text-teal-text">Récapitulatif</h2>
            <div className="mt-4 space-y-3 border-b border-primary-100 pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-teal-muted">Nombre d'articles</span>
                <span className="font-medium text-teal-text">{cartItems.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-muted">Sous-total</span>
                <span className="font-medium text-teal-text">{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-teal-muted">Livraison</span>
                <span className="font-medium text-teal-text">{formatPrice(deliveryFee)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              <span className="text-lg font-bold text-teal-text">Total</span>
              <span className="text-xl font-bold text-primary-600">{formatPrice(cartTotal)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary mt-6 w-full !py-3">
              {user ? 'Passer à la commande' : 'Connectez-vous pour commander'}
            </button>
            {!user && (
              <p className="mt-2 text-center text-xs text-teal-muted">
                Vous devez être connecté pour passer commande
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
