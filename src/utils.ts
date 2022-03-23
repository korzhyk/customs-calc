import mitt from 'mitt'

enum ColorScheme {
  Light = 'light',
  Dark = 'dark'
}

// TODO: We believe that media query matching for dark scheme
const getColorScheme: ColorScheme = q => q.matches ? ColorScheme.Dark : ColorScheme.Light

function factorySubscribe () {
  if (!window.matchMedia) return () => {}
  const emitter = mitt()
  const query = window.matchMedia(`(prefers-color-scheme: ${ColorScheme.Dark})`)

  query.addEventListener('change', e => {
    emitter.emit(getColorScheme(e))
  })

  return (handler, leading = false) => {
    emitter.on('*', handler)

    leading && handler(getColorScheme(query))
    return () => emitter.off('*', handler)
  }
}

export const colorSchemeSubscribe = factorySubscribe()
