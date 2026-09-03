import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import type { Conversation, Message } from '../types'
import { useAuth } from '../store/auth'
import { formatPrice } from '../lib/format'
import { useUi } from '../store/ui'

export default function MessagesPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { lang } = useUi()
  const nav = useNavigate()
  const [list, setList] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottom = useRef<HTMLDivElement>(null)

  const loadList = () => api.get<Conversation[]>('/conversations/').then((r) => setList(r.data)).catch(() => setList([]))

  useEffect(() => { if (user) loadList() }, [user])

  useEffect(() => {
    if (!id || !user) return
    const load = () => api.get<Message[]>(`/conversations/${id}/messages/`).then((r) => setMessages(r.data))
    load()
    const timer = setInterval(load, 4000)
    return () => clearInterval(timer)
  }, [id, user])

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  if (!user) return <Navigate to="/login" replace />

  const active = list.find((c) => String(c.id) === id)

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !id) return
    const { data } = await api.post(`/conversations/${id}/messages/`, { text })
    setMessages((m) => [...m, data])
    setText('')
    loadList()
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink-200/70 dark:bg-ink-900 dark:ring-ink-800">
        <div className="border-b border-ink-100 px-4 py-3 font-semibold dark:border-ink-800">{t('messages')}</div>
        {list.length === 0 ? (
          <p className="p-4 text-sm text-ink-500">{t('noMessages')}</p>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            {list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => nav(`/messages/${c.id}`)}
                className={`block w-full border-b border-ink-100 px-4 py-3 text-left dark:border-ink-800 ${String(c.id) === id ? 'bg-brand-50 dark:bg-brand-950/40' : ''}`}
              >
                <p className="truncate text-sm font-medium">{c.car.title}</p>
                <p className="truncate text-xs text-ink-500">{c.last_message?.text || '—'}</p>
                {c.unread_count > 0 && (
                  <span className="mt-1 inline-block rounded-full bg-brand-600 px-2 text-[10px] text-white">{c.unread_count}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </aside>

      <section className="flex min-h-[60vh] flex-col rounded-2xl bg-white ring-1 ring-ink-200/70 dark:bg-ink-900 dark:ring-ink-800">
        {!id ? (
          <div className="flex flex-1 items-center justify-center text-ink-400">{t('openChat')}</div>
        ) : (
          <>
            <div className="border-b border-ink-100 px-4 py-3 dark:border-ink-800">
              {active ? (
                <div>
                  <Link to={`/cars/${active.car.id}`} className="font-medium text-brand-700 dark:text-brand-300">{active.car.title}</Link>
                  <p className="text-xs text-ink-500">{formatPrice(active.car.price, lang)}</p>
                </div>
              ) : (
                <p className="text-sm text-ink-500">#{id}</p>
              )}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.sender.id === user.id
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800'}`}>
                      <p className="mb-0.5 text-[10px] opacity-70">{mine ? t('you') : m.sender.username}</p>
                      {m.text}
                    </div>
                  </div>
                )
              })}
              <div ref={bottom} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-ink-100 p-3 dark:border-ink-800">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('typeMessage')}
                className="flex-1 rounded-xl border border-ink-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-ink-700"
              />
              <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white">{t('send')}</button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
