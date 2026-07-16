import { Link, NavLink, Outlet } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Leaf, FileText, Shield } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { cn } from '../utils/helpers'

export default function Layout() {
  const { user, cartCount, logout } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Accueil', end: true },
    { to: '/products', label: 'Produits', end: false },
    { to: '/cart', label: 'Panier', end: false },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-primary-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-transform group-hover:scale-105">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-teal-text">ParaPublic</span>
              <span className="block text-[10px] font-medium text-primary-600 -mt-0.5">Parapharmacie</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-teal-muted hover:bg-primary-50 hover:text-primary-700'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === 'admin' && (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-100 text-primary-700' : 'text-teal-muted hover:bg-primary-50'
                    )
                  }
                >
                  <Shield className="h-4 w-4" />
                  Administration
                </NavLink>
                <NavLink
                  to="/invoice"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                      isActive ? 'bg-primary-100 text-primary-700' : 'text-teal-muted hover:bg-primary-50'
                    )
                  }
                >
                  <FileText className="h-4 w-4" />
                  Facture
                </NavLink>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-teal-muted transition-colors hover:bg-primary-50 hover:text-primary-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-teal-muted transition-colors hover:bg-primary-50"
                >
                  <User className="h-4 w-4" />
                  {user.name}
                </Link>
                <button onClick={logout} className="btn-secondary !px-3 !py-2 !text-xs">
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden btn-primary !px-4 !py-2 !text-xs md:inline-flex">
                Connexion
              </Link>
            )}

            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl text-teal-muted md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-primary-100 bg-white px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-4 py-3 text-sm font-medium',
                      isActive ? 'bg-primary-100 text-primary-700' : 'text-teal-muted'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {user?.role === 'admin' && (
                <>
                  <NavLink to="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-teal-muted">
                    Administration
                  </NavLink>
                  <NavLink to="/invoice" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-teal-muted">
                    Importer une facture
                  </NavLink>
                </>
              )}
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg px-4 py-3 text-sm font-medium text-teal-muted">
                    Mon profil
                  </NavLink>
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="rounded-lg px-4 py-3 text-left text-sm font-medium text-red-500">
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-2">
                  Connexion
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-primary-100 bg-white mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary-500" />
              <span className="font-bold text-teal-text">ParaPublic</span>
            </div>
            <p className="text-sm text-teal-muted">
              Votre parapharmacie en ligne de confiance — tous les prix en dinars tunisiens (DT)
            </p>
            <p className="text-xs text-teal-light">© 2026 ParaPublic. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
