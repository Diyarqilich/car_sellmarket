export function formatPrice(value: string | number, lang = 'en') {
  const n = typeof value === 'string' ? Number(value) : value
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatNumber(value: number, lang = 'en') {
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US'
  return new Intl.NumberFormat(locale).format(value)
}
