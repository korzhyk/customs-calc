import 'virtual:windi.css'
import './styles.css'
import { createMemo, createEffect, onMount, Show, For, createSelector } from 'solid-js'
import Currency from './Currency'
import About from './About'
import api, { BASE_CURRENCY, getRates as rates, getRate } from './bank'
import { state, setState, saveState } from './store'
import debounce from 'lodash.debounce'

const calcTax = (tax, value, currency) => {
  const calculated = value * getRate(currency, tax.currency)
  if (calculated > tax.limit) {
    return (tax.rule === 'over' ? calculated - tax.limit : calculated) * tax.tax
  }
  return 0
}

export default function App() {
  createEffect(
    () => {
      saveState()
      if (window.history) {
        if (state.value) {
          window.history.replaceState(null, '', `#${state.value}${state.currency}`)
        } else {
          window.history.replaceState(null, '', `#`)
        }
      }
    },
    { defer: true }
  )

  const selectedCurrency = createSelector(() => state.currency)
  const taxes = createMemo(() => {
    return state.taxes.map((tax) => [tax, calcTax(tax, state.value, state.currency)])
  })

  const taxesTotal = createMemo(() => {
    return taxes().reduce((acc: number, pair) => {
      const [tax, value] = pair
      acc += value * getRate(tax.currency, BASE_CURRENCY)
      return acc
    }, 0)
  })
  const fetchRates = () => {
    api.loadRates()
  }
  const valueChanged = (e: InputEvent) => {
    const value = Number(e.target.value) || 0
    if (value >= 0) {
      setState({ value })
    }
  }
  onMount(fetchRates)

  return (
    <>
      <form class="mb-6">
        <label
          for="cost"
          class="block mb-2 text-gray-900 text-center font-medium dark:text-gray-300"
        >
          Вартість посилки
        </label>
        <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
          <input
            min="0"
            type="number"
            id="cost"
            class="w-full block rounded-lg text-right p-4 pr-1 text-right text-4xl font-mono font-extrabold bg-transparent dark:bg-transparent focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="100"
            required
            value={state.value}
            onChange={valueChanged}
            onKeyUp={valueChanged}
          />
          <select
            id="currency"
            class="block text-4xl font-mono font-extrabold rounded-lg py-4 pl-1 bg-transparent dark:bg-transparent focus:ring-blue-500 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500"
            value={state.currency}
            onChange={(e) => setState({ currency: e.target.value })}
          >
            <For each={Object.keys(rates()).sort()}>
              {(item) => (
                <option value={item} selected={selectedCurrency(item)}>
                  {item}
                </option>
              )}
            </For>
          </select>
        </div>
      </form>
      <p
        class="text-sm text-gray-400 text-center mb-6 cursor-pointer"
        title="натисніть для оновлення даних"
        onClick={debounce(fetchRates, 1e3, { leading: true })}
      >
        <Show when={state.ratesUpdatedAt} fallback={<span>Дані курсів валют не завантажено!</span>}>
          {(ts) => (
            <span>
              Дані НБУ на{' '}
              <time datetime={new Date(ts).toISOString()}>{new Date(ts).toLocaleString()}</time>
            </span>
          )}
        </Show>
      </p>
      <dl class="table w-full mb-1 font-mono dark:text-gray-300">
        <dt class="table-cell px-2 -mb-px">
          Вартість<i class="opacity-0">:</i>
        </dt>
        <dd class="table-cell px-2 -mb-px text-right">
          <Currency value={state.value} currency={state.currency} toggle={[BASE_CURRENCY, 'EUR']} />
        </dd>
      </dl>
      <For each={taxes()}>
        {([tax, value]) => (
          <Show when={value}>
            <dl class="table w-full mb-1 font-mono dark:text-gray-300">
              <dt class="table-cell px-2 -mb-px">
                {tax.name}
                <i class="opacity-0">:</i>
              </dt>
              <dd class="table-cell px-2 -mb-px text-right">
                <Currency
                  value={value}
                  currency={tax.currency}
                  toggle={[BASE_CURRENCY, tax.currency, state.currency]}
                />
              </dd>
            </dl>
          </Show>
        )}
      </For>
      <Show when={taxesTotal()}>
        <hr class="mb-2 dark:border-gray-500" />
        <dl class="table w-full font-mono font-bold text-lg dark:text-gray-300">
          <dt class="table-cell px-2 -mb-px">
            Всього<i class="opacity-0">:</i>
          </dt>
          <dd class="table-cell px-2 -mb-px text-right">
            <Currency value={taxesTotal()} toggle={[BASE_CURRENCY, 'EUR', state.currency]} />
          </dd>
        </dl>
      </Show>
      <Show when={state.value * getRate(state.currency, 'EUR') > 1000}>
        <div class="text-center mt-6">
          <svg
            class="w-20 h-20 mb-4 inline stroke-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          <p class="dark:text-gray-400">
            Вартість вашої посилки перевищує {state.currency === 'EUR' ? '' : 'еквівалент'}{' '}
            <Currency value="1000" currency="EUR" toggle={['EUR', state.currency]} />, і чорт його
            знає, як проходить митне оформлення такий вантаж
          </p>
        </div>
      </Show>
      <Show when={state.value && !taxesTotal()}>
        <div class="text-center mt-6">
          <svg
            class="w-20 h-20 mb-4 inline stroke-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            ></path>
          </svg>
          <p class="dark:text-gray-400">
            Вартість вашої посилки не перевищує встановлені ліміти, тому не має підстав для сплати
            будь-яких податків
          </p>
        </div>
      </Show>
      <About />
    </>
  )
}
