import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import { useAuth } from '../store/auth'

export default function CreateCarPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const nav = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [form, setForm] = useState({
    title: '', brand: '', model: '', year: '2020', price: '', mileage: '0',
    condition: 'used', fuel_type: 'petrol', transmission: 'automatic',
    color: '', city: '', description: '', status: 'active',
  })

  if (!user) return <p className="p-10 text-center">{t('loginRequired')}</p>
  if (user.role !== 'seller' && user.role !== 'admin') {
    return <p className="p-10 text-center">{t('sellerOnly')}</p>
  }

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (files) Array.from(files).forEach((f) => fd.append('images', f))
      const { data } = await api.post('/cars/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      nav(`/cars/${data.id}`)
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full rounded-xl border border-ink-200 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-ink-700'

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{t('createListing')}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {(['title', 'brand', 'model', 'color', 'city'] as const).map((k) => (
          <div key={k}>
            <label className="mb-1 block text-sm text-ink-500">{t(k === 'brand' ? 'brandLabel' : k)}</label>
            <input required className={field} value={form[k]} onChange={(e) => set(k, e.target.value)} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('year')}</label>
            <input required type="number" className={field} value={form.year} onChange={(e) => set('year', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('price')}</label>
            <input required type="number" className={field} value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('mileage')}</label>
            <input required type="number" className={field} value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('condition')}</label>
            <select className={field} value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              {['new', 'used', 'certified'].map((v) => <option key={v} value={v}>{t(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('fuel')}</label>
            <select className={field} value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}>
              {['petrol', 'diesel', 'electric', 'hybrid', 'gas'].map((v) => <option key={v} value={v}>{t(v)}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('transmission')}</label>
            <select className={field} value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
              {['manual', 'automatic', 'cvt', 'robot'].map((v) => <option key={v} value={v}>{t(v)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('description')}</label>
          <textarea rows={4} className={field} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('photos')}</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} className="text-sm" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading} type="submit" className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
          {loading ? t('saving') : t('publish')}
        </button>
      </form>
    </div>
  )
}
