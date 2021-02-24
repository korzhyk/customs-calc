const API_ENDPOINT = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'

function propsComparator (prop = 'id') {
  return (a, b) => a[prop] > b[prop] ? 1 : b[prop] > a[prop] ? -1 : 0
}

export function getExchangeRates () {
  return fetch(API_ENDPOINT)
  .then(r => r.json())
  .then(rates => {
    if (rates.length) {
      rates.push({ "r030": 980,"txt":"Українська гривня","rate":1,"cc":"UAH" })
      return rates.sort(propsComparator('cc'))
    }
    throw new Error('No exchange rates were received.')
  })
}