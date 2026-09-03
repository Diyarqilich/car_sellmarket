import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, MapPin } from 'lucide-react'
import type { Car } from '../types'
import { formatNumber, formatPrice } from '../lib/format'
import { useUi } from '../store/ui'
import api from '../lib/api'
import { useAuth } from '../store/auth'
import { useState } from 'react'

export default function CarCard({ car, onFavoriteChange }: { car: Car; onFavoriteChange?: () => void }) {
  const { t } = useTranslation()
  const { lang } = useUi()
  const { user } = useAuth()
  const [fav, setFav] = useState(!!car.is_favorited)
  const img = car.primary_image || car.images?.[0]?.image

  const toggleFav = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!user) return
    const { data } = await api.post(`/cars/${car.id}/favorite/`)
    setFav(data.favorited)
    onFavoriteChange?.()
  }

  return (
    <Link
      to={`/cars/${car.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-ink-200/60 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-ink-900 dark:ring-ink-800"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-100 dark:bg-ink-800">
        {img ? (
          <img src={img} alt={car.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-400">AutoMarket</div>
        )}
        {user && (
          <button
            type="button"
            onClick={toggleFav}
            className={`absolute right-3 top-3 rounded-full p-2 backdrop-blur ${fav ? 'bg-brand-600 text-white' : 'bg-white/80 text-ink-700 dark:bg-ink-900/80 dark:text-ink-100'}`}
            aria-label={fav ? t('removeFavorite') : t('addFavorite')}
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{car.title}</h3>
          <p className="shrink-0 font-semibold text-brand-700 dark:text-brand-300">{formatPrice(car.price, lang)}</p>
        </div>
        <p className="text-sm text-ink-500">
          {car.year} · {formatNumber(car.mileage, lang)} {t('km')} · {t(car.fuel_type)}
        </p>
        <p className="flex items-center gap-1 text-sm text-ink-400">
          <MapPin size={14} /> {car.city}
        </p>
      </div>
    </Link>
  )
}
