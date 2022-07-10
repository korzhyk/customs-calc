import currency from 'currency.js'

const cache = new Map()
const currencyFormats = {
  BGN: ['лв.', ' ', ',', '#!'],
  CZK: ['Kč', ' ', ',', '#!'],
  CNY: ['¥', ' ', ',', '#!'],
  EUR: ['€'],
  GBP: ['£'],
  PLN: ['zł', ' ', ',', '# !'],
  TRY: ['₺'],
  UAH: ['грн.', ' ', ',', '#!'],
  USD: ['$']
}

const getFormatOptions = (currency) => {
  if (cache.has(currency)) return cache.get(currency)

  const options = { symbol: currency, pattern: '# !' }
  if (currency in currencyFormats) {
    const [symbol, separator = ',', decimal = '.', pattern = '!#'] = currencyFormats[currency]
    Object.assign(options, { symbol, separator, decimal, pattern })
  }
  cache.set(currency, options)
  return options
}

const format = (value, symbol) => currency(value, getFormatOptions(symbol)).format()

export { format as default, currencyFormats }
