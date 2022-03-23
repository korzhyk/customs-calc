import { version } from '../package.json'

export default function About () {
  return (
    <footer class='text-center text-gray-600 mt-16 mb-2'>
      <ul class='flex justify-center mb-2'>
        <li class='mx-1'>
          <a href='https://github.com/korzhyk/customs-calc' target='_blank'>
            <svg class='w-6 dark:fill-gray-400' viewBox='0 0 16 16' version='1.1'>
              <path
                fill-rule='evenodd'
                d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'
              />
            </svg>
            <span class='sr-only'>GitHub project repository</span>
          </a>
        </li>
        <li class='mx-1'>
          <a href='https://www.comebackalive.in.ua' target='_blank' title="Повернись живим">
            <div class='p-0.5 text-black border border-black dark:border-yellow-300/50 dark:text-blue-300/50 hover:text-blue-600 hover:border-yellow-300 hover:bg-yellow-300'>
              <svg class='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
              </svg>
            </div>
          </a>
        </li>
      </ul>
      <div class='text-xs'>версія {version}</div>
    </footer>
  )
}
