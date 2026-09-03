import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Search } from 'lucide-react'
import api from '../lib/api'
import type { Car, Paginated } from '../types'
import CarCard from '../components/CarCard'
import { useAuth } from '../store/auth'

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [cars, setCars] = useState<Car[]>([])
  const [q, setQ] = useState('')

  useEffect(() => {
    api.get<Paginated<Car>>('/cars/', { params: { ordering: '-created_at' } })
      .then((r) => setCars(r.data.results.slice(0, 6)))
      .catch(() => setCars([]))
  }, [])

  const sellTo = user?.role === 'seller' || user?.role === 'admin' ? '/cars/create' : user ? '/profile' : '/register'

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(120deg, rgba(2,6,23,.72), rgba(15,118,110,.45)), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28 sm:justify-center sm:pb-0">
          <p className="animate-fade-up font-display text-5xl font-extrabold tracking-tight text-white sm:text-7xl">
            {t('brand')}
          </p>
          <h1 className="animate-fade-up delay-100 mt-4 max-w-xl text-xl text-white/90 sm:text-2xl">
            {t('tagline')}
          </h1>
          <p className="animate-fade-up delay-200 mt-3 max-w-lg text-white/70">{t('heroSub')}</p>
          <div className="animate-fade-up delay-300 mt-8 flex flex-wrap gap-3">
            <Link to="/cars" className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-ink-900">
              {t('browse')}
            </Link>
            <Link to={sellTo} className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
              {t('sell')}
            </Link>
          </div>
          <form
            className="animate-fade-up delay-300 mt-8 flex max-w-xl overflow-hidden rounded-2xl bg-white/95 shadow-lg dark:bg-ink-900/95"
            onSubmit={(e) => {
              e.preventDefault()
              window.location.href = `/cars?search=${encodeURIComponent(q)}`
            }}
          >
            <div className="flex flex-1 items-center gap-2 px-4">
              <Search size={18} className="text-ink-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('search')}
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>
            <button type="submit" className="bg-brand-600 px-5 text-sm font-medium text-white">
              {t('browse')}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold">{t('featured')}</h2>
            <p className="mt-1 text-ink-500">{t('about')}</p>
          </div>
          <Link to="/cars" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 dark:text-brand-300">
            {t('viewAll')} <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>
    </div>
  )
}
