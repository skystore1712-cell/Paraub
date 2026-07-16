import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Register() {
  const { register } = useApp()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password) {
      setError('Veuillez remplir les champs obligatoires')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    const ok = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
    })

    if (ok) {
      navigate('/profile')
    } else {
      setError('Cet e-mail est déjà utilisé')
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-teal-text">Créer un compte</h1>
          <p className="mt-1 text-sm text-teal-muted">Rejoignez ParaPublic et commencez vos achats</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">Nom complet *</label>
            <div className="relative">
              <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="input-field !pl-11" placeholder="Jean Dupont" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">E-mail *</label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="input-field !pl-11" placeholder="exemple@email.com" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">Téléphone</label>
            <div className="relative">
              <Phone className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field !pl-11" placeholder="+216 98 123 456" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">Adresse</label>
            <div className="relative">
              <MapPin className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input value={form.address} onChange={(e) => update('address', e.target.value)} className="input-field !pl-11" placeholder="Tunis, Tunisie" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">Mot de passe *</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="input-field !pl-11 !pr-11"
                placeholder="6 caractères minimum"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute top-1/2 right-4 -translate-y-1/2 text-teal-light">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-teal-text">Confirmer le mot de passe *</label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-teal-light" />
              <input
                type={showPass ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                className="input-field !pl-11"
                placeholder="Répétez le mot de passe"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full !py-3">
            Créer le compte
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-teal-muted">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
