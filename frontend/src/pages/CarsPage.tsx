import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import type { Car, Paginated } from '../types'
import CarCard from '../components/CarCard'

const empty = {
  search: '', brand: '', city: '', condition: '', fuel_type: '', transmission: '',
  year_min: '', year_max: '', price_min: '', price_max: '', mileage_max: '', ordering: '-created_at',
}

export default function CarsPage() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [cars, setCars] = useState<Car[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [count, setCount] = useState(0)
  const [filters, setFilters] = useState({ ...empty, search: params.get('search') || '' })
  const [loading, setLoading] = useState(true)

  const load = async (f = filters) => {
    setLoading(true)
    const query: Record<string, string> = {}
    Object.entries(f).forEach(([k, v]) => { if (v) query[k] = String(v) })
    try {
      const { data } = await api.get<Paginated<Car>>('/cars/', { params: query })
      setCars(data.results)
      setCount(data.count)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    api.get<string[]>('/cars/brands/').then((r) => setBrands(r.data)).catch(() => {})
    api.get<string[]>('/cars/cities/').then((r) => setCities(r.data)).catch(() => {})
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = (key: string, value: string) => setFilters((s) => ({ ...s, [key]: value }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{t('cars')}</h1>
      <p className="mt-1 text-ink-500">{count} {t('cars').toLowerCase()}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit space-y-3 rounded-2xl bg-white p-4 ring-1 ring-ink-200/70 dark:bg-ink-900 dark:ring-ink-800">
          <h2 className="font-semibold">{t('filters')}</h2>
          <input className="field" placeholder={t('search')} value={filters.search} onChange={(e) => set('search', e.target.value)} />
          <select className="field" value={filters.brand} onChange={(e) => set('brand', e.target.value)}>
            <option value="">{t('brandLabel')} — {t('all')}</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="field" value={filters.city} onChange={(e) => set('city', e.target.value)}>
            <option value="">{t('city')} — {t('all')}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="field" value={filters.condition} onChange={(e) => set('condition', e.target.value)}>
            <option value="">{t('condition')}</option>
            {['new', 'used', 'certified'].map((v) => <option key={v} value={v}>{t(v)}</option>)}
          </select>
          <select className="field" value={filters.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}>
            <option value="">{t('fuel')}</option>
            {['petrol', 'diesel', 'electric', 'hybrid', 'gas'].map((v) => <option key={v} value={v}>{t(v)}</option>)}
          </select>
          <select className="field" value={filters.transmission} onChange={(e) => set('transmission', e.target.value)}>
            <option value="">{t('transmission')}</option>
            {['manual', 'automatic', 'cvt', 'robot'].map((v) => <option key={v} value={v}>{t(v)}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input className="field" placeholder={`${t('year')} ${t('from')}`} value={filters.year_min} onChange={(e) => set('year_min', e.target.value)} />
            <input className="field" placeholder={`${t('year')} ${t('to')}`} value={filters.year_max} onChange={(e) => set('year_max', e.target.value)} />
            <input className="field" placeholder={`${t('price')} ${t('from')}`} value={filters.price_min} onChange={(e) => set('price_min', e.target.value)} />
            <input className="field" placeholder={`${t('price')} ${t('to')}`} value={filters.price_max} onChange={(e) => set('price_max', e.target.value)} />
          </div>
          <input className="field" placeholder={t('maxMileage')} value={filters.mileage_max} onChange={(e) => set('mileage_max', e.target.value)} />
          <select className="field" value={filters.ordering} onChange={(e) => set('ordering', e.target.value)}>
            <option value="-created_at">{t('newest')}</option>
            <option value="price">{t('priceLow')}</option>
            <option value="-price">{t('priceHigh')}</option>
            <option value="-year">{t('yearNew')}</option>
          </select>
          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-primary flex-1" onClick={() => { setParams(filters.search ? { search: filters.search } : {}); load() }}>{t('apply')}</button>
            <button type="button" className="btn-ghost" onClick={() => { setFilters(empty); load(empty) }}>{t('reset')}</button>
          </div>
        </aside>

        <div>
          {loading ? (
            <p className="text-ink-500">{t('loading')}</p>
          ) : cars.length === 0 ? (
            <p className="text-ink-500">{t('noCars')}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .field { width:100%; border-radius:0.75rem; border:1px solid rgb(226 232 240); background:transparent; padding:0.55rem 0.75rem; font-size:0.875rem; outline:none; }
        .dark .field { border-color: rgb(30 41 59); }
        .btn-primary { border-radius:0.75rem; background:#0d9488; color:white; padding:0.55rem 0.75rem; font-size:0.875rem; font-weight:600; }
        .btn-ghost { border-radius:0.75rem; background:rgb(241 245 249); padding:0.55rem 0.75rem; font-size:0.875rem; }
        .dark .btn-ghost { background:rgb(30 41 59); }
      `}</style>
    </div>
  )
}
