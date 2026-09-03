import { Link, NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, MessageSquare, Moon, Sun, Car, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../store/auth'
import { useUi } from '../store/ui'
import i18n from '../i18n'

const langs = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
] as const

export default function Layout() {
  const { t } = useTranslation()
  const { user, logout, fetchMe, loading } = useAuth()
  const { theme, toggleTheme, lang, setLang, init } = useUi()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    init()
    fetchMe()
  }, [init, fetchMe])

  useEffect(() => {
    i18n.changeLanguage(lang)
  }, [lang])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition ${isActive ? 'text-brand-600 dark:text-brand-300' : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'}`

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-500">
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/85 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/85">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="font-display text-xl font-800 tracking-tight text-brand-700 dark:text-brand-300">
            {t('brand')}
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/" end className={linkClass}>{t('home')}</NavLink>
            <NavLink to="/cars" className={linkClass}>{t('cars')}</NavLink>
            {user && <NavLink to="/favorites" className={linkClass}>{t('favorites')}</NavLink>}
            {user && <NavLink to="/messages" className={linkClass}>{t('messages')}</NavLink>}
            {(user?.role === 'seller' || user?.role === 'admin') && (
              <NavLink to="/cars/create" className={linkClass}>{t('sell')}</NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-lg border border-ink-200 p-0.5 text-xs dark:border-ink-700 sm:flex">
              {langs.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  className={`rounded-md px-2 py-1 ${lang === l.code ? 'bg-brand-600 text-white' : 'text-ink-500'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Link to="/favorites" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 md:hidden">
                  <Heart size={18} />
                </Link>
                <Link to="/messages" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 md:hidden">
                  <MessageSquare size={18} />
                </Link>
                <Link to="/profile" className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-white dark:bg-brand-600">
                  {user.username}
                </Link>
              </div>
            ) : (
              <Link to="/login" className="hidden rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white sm:inline-flex">
                {t('login')}
              </Link>
            )}
            <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setOpen((v) => !v)}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-ink-200 px-4 py-3 dark:border-ink-800 md:hidden">
            <div className="flex flex-col gap-3">
              <NavLink to="/" end onClick={() => setOpen(false)} className={linkClass}>{t('home')}</NavLink>
              <NavLink to="/cars" onClick={() => setOpen(false)} className={linkClass}>{t('cars')}</NavLink>
              {user && <NavLink to="/favorites" onClick={() => setOpen(false)} className={linkClass}>{t('favorites')}</NavLink>}
              {user && <NavLink to="/messages" onClick={() => setOpen(false)} className={linkClass}>{t('messages')}</NavLink>}
              {user && <NavLink to="/profile" onClick={() => setOpen(false)} className={linkClass}>{t('profile')}</NavLink>}
              {(user?.role === 'seller' || user?.role === 'admin') && (
                <NavLink to="/cars/create" onClick={() => setOpen(false)} className={linkClass}>{t('sell')}</NavLink>
              )}
              <div className="flex gap-2 pt-2">
                {langs.map((l) => (
                  <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-md px-2 py-1 text-xs ${lang === l.code ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
              {user ? (
                <button type="button" onClick={() => { logout(); setOpen(false) }} className="text-left text-sm text-red-500">
                  {t('logout')}
                </button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm text-brand-600">{t('login')}</Link>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-200 bg-gradient-to-b from-transparent to-brand-50/40 py-10 dark:border-ink-800 dark:to-brand-950/20">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-brand-700 dark:text-brand-300">
            <Car size={20} /> {t('brand')}
          </div>
          <p className="text-sm text-ink-500">{t('footerNote')}</p>
        </div>
      </footer>
    </div>
  )
}
