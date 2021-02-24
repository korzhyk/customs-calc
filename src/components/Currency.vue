<template>
  <span v-if="hasFormat">{{ formatted }}</span>
  <span v-else>{{ value.toFixed(2) }} <small class="text-muted">{{ currency }}</small></span>
</template>

<script>
  import format, { currencyFormats } from '../lib/utils'

  export default {
    props: {
      value: Number,
      currency: {
        type: String,
        default: 'UAH'
      }
    },
    computed: {
      formatted () { return format(this.value, this.currency) },
      hasFormat () { return this.currency in currencyFormats }
    }
  }
</script>