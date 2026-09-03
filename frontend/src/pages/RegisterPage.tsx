import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/auth'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { user, register } = useAuth()
  const nav = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: '', phone: '', city: '', role: 'buyer',
  })

  if (user) return <Navigate to="/profile" replace />

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(form)
      nav('/profile')
    } catch {
      setError(t('error'))
    } finally {
      setLoading(false)
    }
  }

  const field = 'w-full rounded-xl border border-ink-200 bg-transparent px-3 py-2.5 text-sm outline-none dark:border-ink-700'

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold">{t('register')}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('username')}</label>
          <input required className={field} value={form.username} onChange={(e) => set('username', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('email')}</label>
          <input required type="email" className={field} value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
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
          <label className="mb-1 block text-sm text-ink-500">{t('phone')}</label>
          <input className={field} value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('city')}</label>
          <input className={field} value={form.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('role')}</label>
          <select className={field} value={form.role} onChange={(e) => set('role', e.target.value)}>
            <option value="buyer">{t('asBuyer')}</option>
            <option value="seller">{t('asSeller')}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('password')}</label>
          <input required type="password" className={field} value={form.password} onChange={(e) => set('password', e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('confirmPassword')}</label>
          <input required type="password" className={field} value={form.password_confirm} onChange={(e) => set('password_confirm', e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white">
          {loading ? t('loading') : t('register')}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-500">
        {t('haveAccount')} <Link to="/login" className="text-brand-700 dark:text-brand-300">{t('login')}</Link>
      </p>
    </div>
  )
}
