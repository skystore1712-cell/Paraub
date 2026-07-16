import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

export default function Products() {
  const { products, categories, loading } = useApp()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tous')
  const [sort, setSort] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default')

  const filtered = useMemo(() => {
    let result = [...products]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    if (category !== 'Tous') {
      result = result.filter((p) => p.category === category)
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        break
    }

    return result
  }, [products, search, category, sort])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="page-title">Produits</h1>
        <p className="page-subtitle">
          {products.length === 0
            ? 'Catalogue vide — ajoutez vos produits depuis l\'administration'
            : `${products.length} produit${products.length > 1 ? 's' : ''} disponible${products.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {products.length > 0 && (
        <>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input
                type="text"
                placeholder="Rechercher un produit, une marque ou une catégorie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field !pl-11"
              />
            </div>
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-teal-light hidden sm:block" />
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input-field !w-auto !py-2.5">
                <option value="default">Tri par défaut</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
                <option value="name">Nom</option>
              </select>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'bg-white text-teal-muted border border-primary-100 hover:bg-primary-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <Package className="mx-auto h-16 w-16 text-primary-200" />
          <h2 className="mt-4 text-xl font-bold text-teal-text">Aucun produit pour le moment</h2>
          <p className="mt-2 max-w-md mx-auto text-teal-muted">
            {products.length === 0
              ? 'Votre catalogue est vide. Connectez-vous en tant qu\'administrateur pour ajouter vos premiers produits.'
              : 'Aucun produit ne correspond à votre recherche. Essayez d\'autres critères.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
