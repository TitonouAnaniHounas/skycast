import { getSearchHistory, clearSearchHistory } from '../services/storage.js'

export function initHistoryPage() {
  const list = document.getElementById('history-list')
  if (!list) return // pas sur history.html

  renderHistory()

  document.getElementById('clear-history-btn').addEventListener('click', () => {
    clearSearchHistory()
    renderHistory()
  })
}

function renderHistory() {
  const list = document.getElementById('history-list')
  const empty = document.getElementById('history-empty')
  const clearBtn = document.getElementById('clear-history-btn')
  const history = getSearchHistory()

  if (history.length === 0) {
    list.innerHTML = ''
    empty.classList.remove('hidden')
    clearBtn.classList.add('hidden')
    return
  }

  empty.classList.add('hidden')
  clearBtn.classList.remove('hidden')

  list.innerHTML = history
    .map(
      (city) => `
    <a
      href="index.html?lat=${city.latitude}&lon=${city.longitude}&name=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}"
      class="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition"
    >
      <i data-lucide="clock" class="w-4 h-4 text-gray-400"></i>
      <span>${city.name}${city.country ? ', ' + city.country : ''}</span>
    </a>
  `
    )
    .join('')

  import('lucide').then(({ createIcons, Clock }) => {
    createIcons({ icons: { Clock }, root: list })
  })
}