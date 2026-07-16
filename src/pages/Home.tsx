import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Shield, Truck, HeartPulse, Star } from 'lucide-react'

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-100 via-mint-50 to-white">
        <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-mint-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-primary-700 shadow-soft backdrop-blur-sm">
              <Leaf className="h-4 w-4" />
              Parapharmacie 100% tunisienne
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-teal-text md:text-5xl">
              Votre santé, notre priorité
              <span className="block text-primary-600">Des produits de confiance</span>
            </h1>
            <p className="mt-4 text-lg text-teal-muted leading-relaxed">
              Découvrez les meilleurs produits de parapharmacie à des prix compétitifs en dinars tunisiens.
              Livraison rapide partout en Tunisie.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary !px-8 !py-3">
                Voir les produits
              </Link>
              <Link to="/register" className="btn-secondary !px-8 !py-3">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Shield, title: 'Produits authentiques', desc: 'Tous nos produits sont certifiés et fiables' },
            { icon: Truck, title: 'Livraison rapide', desc: 'Livraison à domicile en 24-48 heures' },
            { icon: HeartPulse, title: 'Conseil gratuit', desc: 'Notre équipe est là pour vous aider' },
            { icon: Star, title: 'Prix compétitifs', desc: 'Les meilleurs prix du marché' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex items-start gap-4 !p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-teal-text">{title}</h3>
                <p className="mt-1 text-sm text-teal-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="card py-16 text-center">
          <Leaf className="mx-auto h-12 w-12 text-primary-300" />
          <h2 className="mt-4 text-xl font-bold text-teal-text">Catalogue en préparation</h2>
          <p className="mt-2 text-teal-muted">
            Notre catalogue de produits sera bientôt disponible. Revenez très prochainement !
          </p>
          <Link to="/products" className="btn-secondary mt-6 inline-flex !text-xs">
            Voir les produits
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
