import { state, setState } from './store'

setState('rates', 'UAH', { r030: 980, txt: 'Українська гривня', rate: 1, cc: 'UAH' })

const cache = new Map()
const API_ENDPOINT = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'

export const BASE_CURRENCY = 'UAH'

export function getRates() {
  return state.rates
}

export function getRate(from: string, to: string = BASE_CURRENCY): number {
  if (from === to) return 1
  const symbol = `${from}${to}`
  if (cache.has(symbol)) return cache.get(symbol)
  const state = getRates()
  if (!state[from] || !state[to]) return 0
  const rate = state[from].rate / state[to].rate
  return rate
}

export default {
  loadRates() {
    return fetch(API_ENDPOINT)
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText)
        }
        cache.clear()
        return response.json()
      })
      .then((json) => {
        const rates = { ...getRates() }
        json.reduce((acc, rate) => {
          if (rate.cc === 'RUB') {
            return acc
          }
          return Object.assign(acc, { [rate.cc]: rate })
        }, rates)
        setState({ rates, ratesUpdatedAt: Date.now() })
      })
  }
}
