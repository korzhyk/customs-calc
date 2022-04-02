import { registerSW } from 'virtual:pwa-register'
import { render } from 'solid-js/web'
import { colorSchemeSubscribe } from './utils'
import App from './App'

render(() => <App />, document.getElementById('app'))

registerSW({
  onRegistered(r) {
    r && setInterval(() => {
      r.update()
    }, 6e5)
  }
})

colorSchemeSubscribe(scheme => {
  const icon: HTMLLinkElement = document.querySelector('link[rel="icon"]')
  if (icon) {
    icon.parentNode.insertBefore(icon.cloneNode(), icon.nextSibling)
    icon.remove()
  }
})
