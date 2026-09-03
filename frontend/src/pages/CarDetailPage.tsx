import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, MapPin, MessageSquare } from 'lucide-react'
import api from '../lib/api'
import type { Car, User } from '../types'
import { formatNumber, formatPrice } from '../lib/format'
import { useAuth } from '../store/auth'
import { useUi } from '../store/ui'

export default function CarDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { lang } = useUi()
  const { user } = useAuth()
  const nav = useNavigate()
  const [car, setCar] = useState<Car | null>(null)
  const [idx, setIdx] = useState(0)
  const [fav, setFav] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.get<Car>(`/cars/${id}/`)
      .then((r) => { setCar(r.data); setFav(!!r.data.is_favorited) })
      .catch(() => setErr(t('error')))
  }, [id, t])

  if (err) return <p className="p-10 text-center text-red-500">{err}</p>
  if (!car) return <p className="p-10 text-center text-ink-500">{t('loading')}</p>

  const images = car.images?.length
    ? car.images.map((i) => i.image)
    : car.primary_image ? [car.primary_image] : []
  const seller = typeof car.seller === 'object' ? (car.seller as User) : null

  const toggleFav = async () => {
    if (!user) return nav('/login')
    const { data } = await api.post(`/cars/${car.id}/favorite/`)
    setFav(data.favorited)
  }

  const startChat = async () => {
    if (!user) return nav('/login')
    const { data } = await api.post('/conversations/', {
      car_id: car.id,
      text: `Hi! Interested in ${car.title}`,
    })
    nav(`/messages/${data.id}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/cars" className="text-sm text-brand-700 dark:text-brand-300">{t('back')}</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-[16/11] overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800">
            {images[idx] ? (
              <img src={images[idx]} alt={car.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-400">AutoMarket</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button key={src + i} type="button" onClick={() => setIdx(i)} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-2 ${i === idx ? 'ring-brand-500' : 'ring-transparent'}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="font-display text-3xl font-bold">{car.title}</h1>
            <p className="mt-2 text-2xl font-semibold text-brand-700 dark:text-brand-300">{formatPrice(car.price, lang)}</p>
            <p className="mt-2 flex items-center gap-1 text-ink-500"><MapPin size={16} /> {car.city} · {car.views_count} {t('views')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {[
              [t('year'), car.year],
              [t('mileage'), `${formatNumber(car.mileage, lang)} ${t('km')}`],
              [t('fuel'), t(car.fuel_type)],
              [t('transmission'), t(car.transmission)],
              [t('condition'), t(car.condition)],
              [t('color'), car.color || '—'],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-xl bg-white p-3 ring-1 ring-ink-200/70 dark:bg-ink-900 dark:ring-ink-800">
                <p className="text-ink-400">{k}</p>
                <p className="mt-1 font-medium">{v}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={startChat} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
              <MessageSquare size={16} /> {t('contactSeller')}
            </button>
            <button type="button" onClick={toggleFav} className="inline-flex items-center gap-2 rounded-xl bg-ink-100 px-4 py-2.5 text-sm font-medium dark:bg-ink-800">
              <Heart size={16} fill={fav ? 'currentColor' : 'none'} /> {fav ? t('removeFavorite') : t('addFavorite')}
            </button>
          </div>

          {seller && (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-ink-200/70 dark:bg-ink-900 dark:ring-ink-800">
              <p className="text-sm text-ink-400">{t('seller')}</p>
              <p className="font-semibold">{seller.username}</p>
              {seller.phone && <p className="text-sm text-ink-500">{seller.phone}</p>}
              {seller.city && <p className="text-sm text-ink-500">{seller.city}</p>}
            </div>
          )}

          <div>
            <h2 className="font-display text-xl font-semibold">{t('aboutCar')}</h2>
            <p className="mt-2 whitespace-pre-wrap text-ink-600 dark:text-ink-300">{car.description || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
