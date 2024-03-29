import 'virtual:windi.css'
import './styles.css'
import { createMemo, createEffect, onMount, Show, For, createSelector } from 'solid-js'
import Currency from './Currency'
import { currencyFormats } from './currencies'
import About from './About'
import api, { BASE_CURRENCY, getRates as rates, getRate } from './bank'
import { state, setState, saveState } from './store'
import debounce from 'lodash.debounce'

const popularCurrencies = Object.keys(currencyFormats)

const calcTax = (tax, value, currency) => {
  if (tax.id === 'tax') {
    const duty = state.taxes.find(t => t.id === 'duty')
    if (duty) {
      value += calcTax(duty, value, currency)
    }
  }
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
    if (e.target.value > 0) {
      setState('value', Number(e.target.value))
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
            class="w-full block rounded-l-lg text-right p-4 pr-1 text-right text-4xl font-mono font-extrabold bg-transparent dark:bg-transparent dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 focus:outline outline-blue-500 outline-3"
            placeholder="100"
            required
            value={state.value}
            onChange={valueChanged}
            onKeyUp={valueChanged}
          />
          <div className="custom-select block text-4xl font-mono font-extrabold rounded-r-lg p-4 pl-1 dark:placeholder-gray-400 dark:text-white focus-within:outline outline-blue-500 outline-3 ">
           <select id="currency" value={state.currency} onChange={(e) => setState({ currency: e.target.value })}  class="absolute inset-0 opacity-0 z-index-1 dark:bg-gray-700">
             <optgroup label="Популярні">
                <For each={Object.keys(rates()).filter(c => ~popularCurrencies.indexOf(c)).sort()}>
                  {(item) => (
                    <option value={item} selected={selectedCurrency(item)}>
                      {item} {rates()[item].txt}
                    </option>
                  )}
                </For>
              </optgroup>
              <optgroup label="Інші">
                <For each={Object.keys(rates()).filter(c => !~popularCurrencies.indexOf(c)).sort()}>
                  {(item) => (
                    <option value={item} selected={selectedCurrency(item)}>
                      {item} {rates()[item].txt}
                    </option>
                  )}
                </For>
              </optgroup>
            </select>
            {state.currency}
          </div>
        </div>
      </form>
      <p
        class="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 cursor-pointer"
        title="натисніть для оновлення даних"
        onClick={debounce(fetchRates, 1e3, { leading: true })}
      >
        <Show when={state.ratesUpdatedAt} fallback={<span>Дані курсів валют не завантажено!</span>}>
          {(ts) => (
            <span>
              Дані <abbr title="Національний банк України">НБУ</abbr> на{' '}
              <time datetime={new Date(ts()).toISOString()}>{new Date(ts()).toLocaleString()}</time>
            </span>
          )}
        </Show>
      </p>
      <dl class="table w-full mb-6 font-mono dark:text-gray-300 text-opacity-75">
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
        <dl class="table w-full font-mono font-bold text-lg dark:text-gray-300" tabindex="0">
          <dt class="table-cell px-2 -mb-px">
            Всього<i class="opacity-0">:</i>
          </dt>
          <dd class="table-cell px-2 -mb-px text-right">
            <Currency value={taxesTotal()} toggle={[BASE_CURRENCY, 'EUR', state.currency]} />
          </dd>
        </dl>
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
