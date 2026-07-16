import { ShoppingCart, Package } from 'lucide-react'
import type { Product } from '../types'
import { formatPrice } from '../utils/helpers'
import { useApp } from '../context/AppContext'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addToCart } = useApp()

  return (
    <div className="group overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-hover">
      <div className="relative aspect-square overflow-hidden bg-primary-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute top-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary-700 backdrop-blur-sm">
          {product.category}
        </span>
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
            Plus que {product.stock}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-bold text-white">Rupture de stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-primary-600">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-teal-text">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-teal-muted">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <Package className="h-3 w-3 text-teal-light" />
              <span className="text-xs text-teal-light">Stock : {product.stock}</span>
            </div>
          </div>
          <button
            onClick={() => addToCart(product.id)}
            disabled={product.stock === 0}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white transition-all hover:bg-primary-600 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
