import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import api from '../lib/api'
import type { Favorite } from '../types'
import CarCard from '../components/CarCard'
import { useAuth } from '../store/auth'

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [items, setItems] = useState<Favorite[]>([])

  const load = () => api.get<Favorite[]>('/favorites/').then((r) => setItems(r.data)).catch(() => setItems([]))

  useEffect(() => { if (user) load() }, [user])

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{t('favorites')}</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-ink-500">{t('noFavorites')}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <CarCard key={f.id} car={{ ...f.car, is_favorited: true }} onFavoriteChange={load} />
          ))}
        </div>
      )}
    </div>
  )
}
