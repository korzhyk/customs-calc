<template>
  <div class="card m-2">
    <div class="card-header">
      <div class="d-flex align-items-center">
        <BIconCalculator width="2rem" height="2rem" />
        <h4 class="card-title m-0 ps-2">
          Калькулятор митних платежів
        </h4>
      </div></div>
    <div class="card-body">
      <form class="mb-4">
        <div class="row g-2">
          <div class="col">
            <div class="form-floating">
              <input type="number" class="form-control" id="goodsValue" placeholder="128.00" v-model.number="value" v-focus />
              <label for="goodsValue">Вартість</label>
            </div>
          </div>
          <div class="col col-currency">
            <div class="form-floating">
              <select class="form-select" id="goodsCurrency" aria-label="Валюта" v-model="currency" :disabled="!rates.length">
                <option v-for="rate in rates" :value="rate.cc">
                  {{ rate.cc }} – {{ rate.txt }}
                </option>
              </select>
              <label for="goodsCurrency">Валюта</label>
            </div>
          </div>
        </div>
        <div v-if="currency !== base" class="row">
          <div class="col text-center text-muted">
            <small>
              <Currency :value="convert(value, currency)" />
            </small>
          </div>
          <div class="col text-center text-muted">
            <small>
              <Currency :value="1" :currency="currency" /> = <Currency :value="exchangeRate" />
            </small>
          </div>
        </div>
      </form>
      <table class="table">
        <tbody>
          <tr :class="{ 'text-black-50': payVAT <= 0 }">
            <td>
              <abbr title="Податок на додану вартість">ПДВ</abbr>&nbsp;
              <small class="text-muted" :title="`від ${format(overVAT, base)} (${format(convert(overVAT, base, currency), currency)})`">
                ({{toPercent(vat)}}%)
              </small>
            </td>
            <td class="calculated-value">
              <Currency :value="payVAT" :title="format(convert(payVAT, base, currency), currency)" />
            </td>
          </tr>
          <tr :class="{ 'text-black-50': payDuty <= 0 }">
            <td>Мито&nbsp;
              <small class="text-muted" :title="`від ${format(overDuty, base)} (${format(convert(overDuty, base, currency), currency)})`">
                ({{toPercent(duty)}}%)
              </small>
            </td>
            <td class="calculated-value">
              <Currency :value="payDuty" :title="format(convert(payDuty, base, currency), currency)"  />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th class="w-100">
              Всього
              <transition name="fade" mode="out-in" appear v-if="value">
                <a v-if="!shared" href="#share" class="share" @click="share" title="Поділитись"><BIconShare width="1rem" height="1rem" /></a>
                <span v-else class="share"><BIconCheckCircle width="1em" height="1em" class="text-success" /> скопійовано</span>
              </transition>
            </th>
            <th class="calculated-value">
              <Currency :value="payVAT + payDuty" :title="format(convert(payVAT + payDuty, base, currency), currency)" :convert="currency" />
            </th>
          </tr>
        </tfoot>
      </table>
      <div v-if="overDuty || overVAT" class="row tip-container">
        <div class="tip-icon"><BIconExclamationCircle width="2rem" height="2rem" class="text-warning" /></div>
        <div class="tip-message">
          <span v-if="overVAT">
            Вартість вашої посилки перевищує безподатковий ліміт у {{ format(vat_limit, limits_currency) }}.
          </span>
          <span v-if="overDuty">
            А також вам доведеться сплатити мито від суми, що перевищує {{ format(duty_limit, limits_currency) }}.
          </span>
        </div>
      </div>
      <div v-else-if="value" class="row tip-container">
        <div class="tip-icon"><BIconCheckCircle width="2rem" height="2rem" class="text-success" /></div>
        <div class="tip-message">
          <span>Вам пощастило! Нічого платити не потрібно, оскільки ви не перевищили ліміт у {{ format(vat_limit, limits_currency) }}.</span>
        </div>
      </div>
    </div>
    <div class="card-footer text-muted text-center">
      <small v-if="rates_updating">
        Оновлення курсів валют
        <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">зачекайте...</span>
        </div>
      </small>
      <small v-else-if="rates_updated_at">
        Курси валют оновлено: <a href="#update-rates" title="Натисніть для оновлення" @click="updateRates">
          <time :datetime="rates_updated_at">{{ updated }}</time>
        </a>
      </small>
      <small v-else>
        Не вдалось оновити курси валют – <a href="#update-rates" title="Натисніть для оновлення" @click="updateRates">
          спробувати ще раз
        </a>
      </small>
    </div>
  </div>
  <ul class="nav justify-content-center m-2">
    <li class="nav-item">
      <a class="nav-link" href="#settings" @click="showSettings = true"><BIconSliders /></a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="https://github.com/korzhyk/customs-calc" target="_blank">
        <BIconGithub />
      </a>
    </li>
  </ul>
  <div class="version">версія {{ version }}</div>
  <transition name="settings">
    <div class="modal modal-backdrop d-block" tabindex="-1" v-if="showSettings" @click="showSettings = false">
      <div id="settings" class="settings-dialog modal-dialog-centered" v-show="showSettings" @click.stop>
        <div class="modal-content">
          <div class="modal-header justify-content-center">
            <h5 class="modal-title fw-light">Налаштування</h5>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <label for="limits_currency" class="col-8 col-form-label">Валюта розрахунку</label>
              <div class="col">
                <select class="form-select" id="limits_currency" v-model="limits_currency" :disabled="!rates.length">
                  <option v-for="rate in rates" :value="rate.cc">
                    {{ rate.cc }} – {{ rate.txt }}
                  </option>
                </select>
              </div>
            </div>
            <div class="row mb-3">
              <label for="vat_limit" class="col-8 col-form-label">Ліміт до сплати ПДВ</label>
              <div class="col">
                <input type="number" class="form-control" id="vat_limit" v-model="vat_limit">
              </div>
            </div>
            <div class="mb-3">
              <span class="float-end">{{toPercent(vat)}}%</span>
              <label for="vat" class="form-label">Ставка ПДВ</label>
              <input type="range" class="form-range" min="0" max="1" step="0.01" id="vat" v-model.number="vat">
            </div>
            <div class="row mb-3">
              <label for="duty_limit" class="col-8 col-form-label">Сплата мита від</label>
              <div class="col">
                <input type="number" class="form-control" id="duty_limit" v-model="duty_limit">
              </div>
            </div>
            <div class="mb-3">
              <span class="float-end">{{toPercent(duty)}}%</span>
              <label for="duty" class="form-label">Ставка мита</label>
              <input type="range" class="form-range" min="0" max="1" step="0.01" id="duty" v-model.number="duty">
            </div>
            <div class="text-center">
              <a href="#default" class="p-2" @click="defaultSettings">
                <BIconArrowCounterclockwise class="me-2" />Скинути до початкових
            </a>
            </div>
          </div>
          <div class="modal-footer">
            <a href="#close" @click="showSettings = false">
              <BIconXCircle width="2em" height="2em" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
  import saveState from 'vue-save-state'
  import { differenceInHours, formatRelative } from 'date-fns/esm'
  import { uk } from 'date-fns/esm/locale'
  import {
    BIconArrowCounterclockwise,
    BIconCalculator,
    BIconCheckCircle,
    BIconExclamationCircle,
    BIconGithub,
    BIconSliders,
    BIconXCircle,
    BIconShare
  } from 'bootstrap-icons-vue'

  import { version } from '../../package'
  import Currency from './Currency'
  import format from '../lib/utils'
  import { getExchangeRates } from '../lib/api'

  const BASE = 'UAH'
  const settings = {
    vat: .2,
    duty: .1,
    vat_limit: 100,
    duty_limit: 150,
    limits_currency: 'EUR'
  }
  let ratesUpdateInterval

  export default {
    mixins: [ saveState ],
    components: {
      BIconArrowCounterclockwise,
      BIconCalculator,
      BIconCheckCircle,
      BIconExclamationCircle,
      BIconGithub,
      BIconSliders,
      BIconXCircle,
      BIconShare,
      Currency
    },
    directives: {
      focus: {
        mounted(el) {
          el.select()
          el.focus()
        }
      }
    },
    data() {
      const [value] = /[\d.,]+/.exec(location.hash) || ['']
      const [currency] = /[A-Z]{3}/.exec(location.hash) || ['']
      return {
        ...settings,
        version,
        base: BASE,
        value: Number(value.replace(',','.')) || 0,
        currency,
        rates: [],
        rates_updated_at: null,
        rates_updating: false,
        showSettings: false,
        shared: false
      }
    },
    mounted () {
      // Setup rate update interval
      if (!this.rates_updated_at || differenceInHours(this.rates_updated_at, new Date)) {
        this.updateRates()
      }
      ratesUpdateInterval = setInterval(() => this.updateRates(), 36e5)
    },
    unmounted () {
      clearInterval(ratesUpdateInterval)
    },
    methods: {
      format,
      getSaveStateConfig () {
        return {
          cacheKey: 'calculator',
          ignoreProperties: ['shared'],
          onLoad: (key, value) => {
            switch (key) {
              case 'showSettings':
                return false
              case 'rates_updated_at':
                return new Date(value)
              case 'value':
              case 'currency':
                return this[key] || value
              default:
               return value
            }
          }
        }
      },
      async share () {
        this.shared = true
        setTimeout(() => (this.shared = false), 3e3)
        try {
          const overFormatted = this.format(this.payVAT + this.payDuty, this.base)
          const text = this.payVAT
            ? (this.payDuty
            ? `Повний попандос: ${overFormatted}`
            : `Тільки мито заплатити: ${overFormatted}`) + ` https://customs-calc.pp.ua/#${this.value}${this.currency}`
            : `Порахувати митні платежі для посилки https://customs-calc.pp.ua`
          await navigator.clipboard.writeText(text)
        } catch (err) {
          console.error('Failed to copy: ', err)
        }
      },
      async updateRates () {
        try {
          this.rates_updating = true
          this.rates = await getExchangeRates()
          this.rates_updated_at = new Date
        } catch (e) {
          console.warn('Exchange rates update failed:', e.message)
        } finally {
          this.rates_updating = false
        }
      },
      defaultSettings () {
        Object.assign(this, settings)
      },
      findRate (symbol) {
        const rate = this.rates.find(r => r.cc === symbol)
        return rate ? rate.rate : 0
      },
      convert (value, from, to = BASE) {
        return value * this.findRate(from) / this.findRate(to) || 0
      },
      calculateOver (limit) {
        const costsOfGoods = this.value * this.findRate(this.currency)
        const limitValue = limit * this.findRate(this.limits_currency)
        return costsOfGoods - limitValue
      },
      toPercent: val => Math.ceil(100 * val)
    },
    computed: {
      exchangeRate () { return this.findRate(this.currency) },
      overDuty () {
        const overLimit = this.calculateOver(this.duty_limit)
        return overLimit <= 0 ? 0 : overLimit 
      },
      overVAT () {
        let overLimit = this.calculateOver(this.vat_limit)
        overLimit += this.payDuty
        return overLimit <= 0 ? 0 : overLimit
      },
      payDuty () {
        return this.overDuty * this.duty
      },
      payVAT () {
        return this.overVAT * this.vat
      },
      updated () {
       return formatRelative(this.rates_updated_at, new Date(), { locale: uk })
     }
    }
  }
</script>