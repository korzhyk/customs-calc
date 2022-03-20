import { createEffect, createSignal, mergeProps } from 'solid-js'
import { BASE_CURRENCY, getRate } from './bank'
import format from './currencies'

function uniq(array) {
  return array.filter((c, i, a) => c && i === a.indexOf(c))
}

export default function Currency(props) {
  const merged = mergeProps(
    { className: 'cursor-pointer', value: 0, currency: BASE_CURRENCY, toggle: [BASE_CURRENCY] },
    props
  )
  let toggle = uniq(merged.toggle)
  const [getDisplayCurrency, setDisplayCurrency] = createSignal(toggle[0] || merged.currency)
  const onClick = () => {
    let idx = toggle.indexOf(getDisplayCurrency())
    if (++idx === toggle.length) {
      idx = 0
    }
    setDisplayCurrency(toggle[idx])
  }
  createEffect(() => {
    toggle = uniq(merged.toggle)
  })
  return (
    <span class={merged.className} onClick={onClick}>
      {format(merged.value * getRate(merged.currency, getDisplayCurrency()), getDisplayCurrency())}
    </span>
  )
}
