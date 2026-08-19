import { getFavorites, removeFavorite } from '../services/storage.js'
import { fetchWeather } from '../api/weather.js'
import { getWeatherInfo } from '../utils/weatherCodes.js'

export async function initFavoritesPage() {
  const list = document.getElementById('favorites-list')
  if (!list) return // pas sur favorites.html

  const empty = document.getElementById('favorites-empty')
  const loading = document.getElementById('favorites-loading')

  const favorites = getFavorites()

  if (favorites.length === 0) {
    loading.classList.add('hidden')
    empty.classList.remove('hidden')
    return
  }

  const results = await Promise.allSettled(
    favorites.map((city) =>
      fetchWeather(city.latitude, city.longitude).then((weather) => ({ city, weather }))
    )
  )

  loading.classList.add('hidden')

  const successful = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)

  list.innerHTML = successful
    .map(
      ({ city, weather }) => {
        const info = getWeatherInfo(weather.current.weather_code)
        return `
          <div class="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
            <span class="font-medium">${city.name}${city.country ? ', ' + city.country : ''}</span>
            <div class="flex items-center gap-6 text-sm">
              <span>${info.emoji} ${Math.round(weather.current.temperature_2m)}°</span>
              <button class="remove-favorite-btn text-gray-400 hover:text-red-400 transition" data-lat="${city.latitude}" data-lon="${city.longitude}" aria-label="Supprimer">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        `
      }
    )
    .join('')

  list.classList.remove('hidden')

  const { createIcons, Trash2 } = await import('lucide')
  createIcons({ icons: { Trash2 }, root: list })

  list.querySelectorAll('.remove-favorite-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      removeFavorite({ latitude: Number(btn.dataset.lat), longitude: Number(btn.dataset.lon) })
      btn.closest('div.flex').remove()

      if (getFavorites().length === 0) {
        empty.classList.remove('hidden')
      }
    })
  })
}