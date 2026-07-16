import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }
    const ok = await login(email, password)
    if (ok) {
      navigate(from)
    } else {
      setError('E-mail ou mot de passe incorrect')
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <div className="card w-full">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <LogIn className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-teal-text">Connexion</h1>
          <p className="mt-1 text-sm text-teal-muted">Bienvenue sur ParaPublic</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">E-mail</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="input-field !pl-11"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field !pl-11 !pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-teal-light hover:text-teal-muted"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full !py-3">
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-teal-muted">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Créer un compte
          </Link>
        </p>

        <div className="mt-4 rounded-xl bg-primary-50 p-3 text-center text-xs text-teal-muted">
          <p className="font-semibold text-primary-700"> :</p>
          <p className="mt-1"></p>
        </div>
      </div>
    </div>
  )
}
