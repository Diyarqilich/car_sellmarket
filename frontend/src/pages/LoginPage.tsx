import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../store/auth'

export default function LoginPage() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/profile" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
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
      <h1 className="font-display text-3xl font-bold">{t('login')}</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('username')}</label>
          <input required className={field} value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-500">{t('password')}</label>
          <input required type="password" className={field} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading} type="submit" className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white">
          {loading ? t('loading') : t('login')}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-500">
        {t('noAccount')} <Link to="/register" className="text-brand-700 dark:text-brand-300">{t('register')}</Link>
      </p>
    </div>
  )
}
