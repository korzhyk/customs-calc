import currency from 'currency.js'

const __cache = new Map()
const currencyFormats = {
  BGN: [ 'лв.', ' ', ',', '#!' ],
  CZK: [ 'Kč' , ' ', ',', '#!' ],
  EUR: [ '€' ],
  GBP: [ '£' ],
  PLN: [ 'zł' , ' ', ',', '# !' ],
  UAH: [ '₺' ],
  UAH: [ '₴',   ' ', ',', '#!' ],
}

const getFormatOptions = currency => {
  if (__cache.has(currency)) return __cache.get(currency)

  const options = { symbol: currency, pattern: '# !' }
  if (currency in currencyFormats) {
    const [ symbol, separator = ',', decimal = '.', pattern = '!#' ] = currencyFormats[currency]
    Object.assign(options, { symbol, separator, decimal, pattern })
  }
  __cache.set(currency, options)
  return options
}

const format = (value, symbol) => currency(value, getFormatOptions(symbol)).format()

export {
  format as default,
  currencyFormats
}
