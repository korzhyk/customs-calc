import { name, version } from '../package.json'
import { createStore } from 'solid-js/store'

const saveStateKey = `${name}:v${version}`
const initialState = {
  value: null,
  currency: 'UAH',
  ratesUpdatedAt: null,
  rates: {},
  taxes: [
    {
      id: 'duty',
      name: 'Мито',
      currency: 'EUR',
      rule: 'over',
      limit: 150,
      tax: 0.1
    },
    {
      id: 'tax',
      name: 'ПДВ',
      currency: 'EUR',
      rule: 'over',
      limit: 100,
      tax: 0.2
    }
  ]
}

try {
  if (localStorage[saveStateKey]) {
    const savedState = JSON.parse(localStorage[saveStateKey])
    Object.assign(initialState, savedState)
    console.info('🚛 App state sucessfully restored')
  } else {
    localStorage.clear()
    console.info('🪹 No saved app state')
  }
} catch (e) {
  console.info('💔 There is problem when trying to recover app state', e.message)
}

const [state, setState] = createStore(initialState)
export { state, setState, saveState }
export default state

function saveState() {
  localStorage[saveStateKey] = JSON.stringify(state)
}

const valueRX = /[\d,.]+/
const currencyRX = /[a-z]{3}/i
function hashParse() {
  const hash = document.location.hash.replace(',', '.')
  if (hash.length > 1) {
    let value = valueRX.exec(hash)
    if (value && value[0]) {
      setState('value', Number(value[0]))
    }
    let currency = currencyRX.exec(hash)
    if (currency) {
      setState('currency', currency[0].toUpperCase())
    }
  }
}
hashParse()
