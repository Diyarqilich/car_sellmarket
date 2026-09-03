import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/auth'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user, logout, updateProfile } = useAuth()
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bio: user?.bio || '',
  })

  if (!user) return <Navigate to="/login" replace />

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const field = 'w-full rounded-xl border border-ink-200 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-ink-700'

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{t('profile')}</h1>
          <p className="mt-1 text-ink-500">@{user.username} · {t(user.role)}</p>
        </div>
        <button type="button" onClick={logout} className="rounded-xl bg-ink-100 px-3 py-2 text-sm dark:bg-ink-800">
          {t('logout')}
        </button>
      </div>

      {(user.role === 'seller' || user.role === 'admin') && (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/cars/create" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">{t('createListing')}</Link>
          <Link to="/cars?mine=1" className="rounded-xl bg-ink-100 px-4 py-2 text-sm dark:bg-ink-800">{t('myListings')}</Link>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('firstName')}</label>
            <input className={field} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-500">{t('lastName')}</label>
            <input className={field} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('email')}</label>
          <input type="email" className={field} value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('phone')}</label>
          <input className={field} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('city')}</label>
          <input className={field} value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('bio')}</label>
          <textarea rows={3} className={field} value={form.bio} onChange={(e) => set('bio', e.target.value)} />
        </div>
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white">
          {saved ? '✓' : t('save')}
        </button>
      </form>
    </div>
  )
}
