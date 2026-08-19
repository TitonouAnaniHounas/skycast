import { searchCity } from '../api/geocoding.js'
import { fetchWeather } from '../api/weather.js'
import { getWeatherInfo } from '../utils/weatherCodes.js'
import { addToSearchHistory, isFavorite, addFavorite, removeFavorite } from '../services/storage.js'
import { formatTemp, formatWind, toDisplayTemp, toDisplayWind, tempUnitLabel, windUnitLabel } from '../utils/units.js'
import { debounce } from '../utils/debounce.js'
import Chart from 'chart.js/auto'

let chartInstance = null
let currentWeatherData = null
let currentMetric = 'temperature'
let currentCity = null

export function initDashboard() {
  const searchInput = document.getElementById('city-search-input')
  const searchBtn = document.getElementById('search-btn')

  if (!searchInput) return // pas sur index.html

  searchBtn.addEventListener('click', handleSearch)
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch()
  })

  searchInput.addEventListener('input', debounce(handleAutocomplete, 300))

  document.addEventListener('click', (e) => {
    const resultsList = document.getElementById('autocomplete-results')
    if (!e.target.closest('#city-search-input') && !e.target.closest('#autocomplete-results')) {
      resultsList.classList.add('hidden')
    }
  })

  document.getElementById('geolocation-btn').addEventListener('click', handleGeolocation)
  document.getElementById('favorite-toggle-btn').addEventListener('click', toggleFavorite)
  document.getElementById('weather-retry-btn')?.addEventListener('click', handleSearch)

  document.querySelectorAll('.chart-metric-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-metric-btn').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      currentMetric = btn.dataset.metric
      if (currentWeatherData) {
        renderChart(currentWeatherData.hourly, currentWeatherData.utc_offset_seconds)
      }
    })
  })

  document.getElementById('day-detail-close').addEventListener('click', () => {
    document.getElementById('day-detail-modal').classList.add('hidden')
  })

  document.getElementById('day-detail-modal').addEventListener('click', (e) => {
    if (e.target.id === 'day-detail-modal') {
      e.target.classList.add('hidden')
    }
  })

  // Arrivée depuis l'historique (index.html?lat=...&lon=...)
  const params = new URLSearchParams(window.location.search)
  const lat = params.get('lat')
  const lon = params.get('lon')

  if (lat && lon) {
    const city = {
      name: params.get('name') || '',
      country: params.get('country') || '',
      latitude: Number(lat),
      longitude: Number(lon),
    }
    loadWeatherForCity(city)
  }
}

async function handleSearch() {
  const query = document.getElementById('city-search-input').value.trim()
  if (!query) return

  showLoading()

  try {
    const cities = await searchCity(query)

    if (cities.length === 0) {
      showError()
      return
    }

    const city = cities[0]
    await loadWeatherForCity(city)
  } catch (err) {
    showError()
  }
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    showError()
    return
  }

  showLoading()

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords
      const city = { name: 'Ma position', country: '', latitude, longitude }
      await loadWeatherForCity(city)
    },
    () => {
      showError()
    }
  )
}

async function handleAutocomplete() {
  const query = document.getElementById('city-search-input').value.trim()
  const resultsList = document.getElementById('autocomplete-results')

  if (query.length < 2) {
    resultsList.classList.add('hidden')
    resultsList.innerHTML = ''
    return
  }

  try {
    const cities = await searchCity(query)

    if (cities.length === 0) {
      resultsList.classList.add('hidden')
      return
    }

    resultsList.innerHTML = cities
      .map(
        (city, i) => `
      <li data-index="${i}" class="autocomplete-item px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0">
        ${city.name}${city.admin1 ? `, ${city.admin1}` : ''}, ${city.country}
      </li>
    `
      )
      .join('')

    resultsList.classList.remove('hidden')

    resultsList.querySelectorAll('.autocomplete-item').forEach((item, i) => {
      item.addEventListener('click', () => {
        resultsList.classList.add('hidden')
        document.getElementById('city-search-input').value = ''
        loadWeatherForCity(cities[i])
      })
    })
  } catch (err) {
    resultsList.classList.add('hidden')
  }
}

async function loadWeatherForCity(city) {
  showLoading()

  try {
    const weather = await fetchWeather(city.latitude, city.longitude)
    renderCurrentWeather(city, weather)
    addToSearchHistory(city)
    showContent()
  } catch (err) {
    showError()
  }
}

function renderCurrentWeather(city, weather) {
  currentCity = city
  currentWeatherData = weather

  const current = weather.current
  const daily = weather.daily
  const info = getWeatherInfo(current.weather_code)

  document.getElementById('weather-city').textContent = `${city.name}, ${city.country}`
  document.getElementById('weather-date').textContent = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  document.getElementById('weather-icon').textContent = info.emoji
  document.getElementById('weather-temp').textContent = formatTemp(current.temperature_2m)
  document.getElementById('weather-feelslike').textContent = `Ressenti ${formatTemp(current.apparent_temperature)}`
  document.getElementById('weather-condition').textContent = info.label

  document.getElementById('weather-min').textContent = formatTemp(daily.temperature_2m_min[0])
  document.getElementById('weather-max').textContent = formatTemp(daily.temperature_2m_max[0])

  document.getElementById('weather-humidity').textContent = `${current.relative_humidity_2m}%`
  document.getElementById('weather-wind').textContent = formatWind(current.wind_speed_10m)
  document.getElementById('weather-wind-direction').textContent = getWindDirection(current.wind_direction_10m)
  document.getElementById('weather-pressure').textContent = `${Math.round(current.surface_pressure)} hPa`
  document.getElementById('weather-visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`

  document.getElementById('weather-sunrise').textContent = formatTime(daily.sunrise[0])
  document.getElementById('weather-sunset').textContent = formatTime(daily.sunset[0])

  const cityTime = getCityLocalTime(weather.utc_offset_seconds)
  document.getElementById('weather-local-time').textContent = cityTime
  document.getElementById('weather-daynight').textContent = isDaytime(
    weather.utc_offset_seconds,
    daily.sunrise[0],
    daily.sunset[0]
  )
    ? '☀️'
    : '🌙'

  renderHourlyForecast(weather.hourly, weather.utc_offset_seconds)
  renderChart(weather.hourly, weather.utc_offset_seconds)
  renderDailyForecast(weather.daily, weather.hourly)
  updateFavoriteIcon()
}

function getCurrentHourIndex(times, utcOffsetSeconds) {
  const cityNow = new Date(Date.now() + utcOffsetSeconds * 1000)
  const cityNowPrefix = cityNow.toISOString().slice(0, 13)

  const index = times.findIndex((t) => t.slice(0, 13) > cityNowPrefix)
  return index === -1 ? 0 : index
}

function getCityLocalTime(utcOffsetSeconds) {
  const cityNow = new Date(Date.now() + utcOffsetSeconds * 1000)
  return cityNow.toISOString().slice(11, 16)
}

function isDaytime(utcOffsetSeconds, sunrise, sunset) {
  const cityNow = new Date(Date.now() + utcOffsetSeconds * 1000)
  const cityNowStr = cityNow.toISOString().slice(0, 16)
  return cityNowStr > sunrise && cityNowStr < sunset
}

function renderHourlyForecast(hourly, utcOffsetSeconds) {
  const list = document.getElementById('hourly-forecast-list')
  const skeleton = document.getElementById('hourly-skeleton')

  const startIndex = getCurrentHourIndex(hourly.time, utcOffsetSeconds)
  const next12Hours = hourly.time.slice(startIndex, startIndex + 12).map((time, i) => ({
    time,
    temp: hourly.temperature_2m[startIndex + i],
    code: hourly.weather_code[startIndex + i],
  }))

  list.innerHTML = next12Hours
    .map((hour, i) => {
      const info = getWeatherInfo(hour.code)
      const label = new Date(hour.time).toLocaleTimeString('fr-FR', { hour: '2-digit' })
      return `
        <div class="flex-shrink-0 w-20 flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl py-4 animate-fade-in-scale" style="animation-delay: ${i * 0.05}s">
          <span class="text-xs text-gray-400">${label}</span>
          <span class="text-2xl">${info.emoji}</span>
          <span class="font-medium">${formatTemp(hour.temp)}</span>
        </div>
      `
    })
    .join('')

  skeleton.classList.add('hidden')
  list.classList.remove('hidden')
}

function renderChart(hourly, utcOffsetSeconds) {
  const canvas = document.getElementById('weather-chart')
  const startIndex = getCurrentHourIndex(hourly.time, utcOffsetSeconds)
  const labels = hourly.time
    .slice(startIndex, startIndex + 12)
    .map((t) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit' }))

  const datasets = {
    temperature: {
      data: hourly.temperature_2m.slice(startIndex, startIndex + 12).map(toDisplayTemp),
      label: `Température (${tempUnitLabel()})`,
      color: '#a78bfa',
    },
    precipitation: {
      data: hourly.precipitation.slice(startIndex, startIndex + 12),
      label: 'Précipitations (mm)',
      color: '#34d399',
    },
    wind: {
      data: hourly.wind_speed_10m.slice(startIndex, startIndex + 12).map(toDisplayWind),
      label: `Vent (${windUnitLabel()})`,
      color: '#60a5fa',
    },
  }

  const selected = datasets[currentMetric]

  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: selected.label,
          data: selected.data,
          borderColor: selected.color,
          backgroundColor: selected.color + '33',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  })
}

function renderDailyForecast(daily, hourly) {
  const list = document.getElementById('daily-forecast-list')
  const skeleton = document.getElementById('daily-skeleton')

  list.innerHTML = daily.time
    .map((date, i) => {
      const info = getWeatherInfo(daily.weather_code[i])
      const dayLabel = i === 0 ? "Aujourd'hui" : new Date(date).toLocaleDateString('fr-FR', { weekday: 'long' })

      return `
        <button class="daily-forecast-item w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3 hover:bg-white/10 transition text-left animate-fade-in-scale" style="animation-delay: ${i * 0.06}s" data-index="${i}">
          <span class="w-28 font-medium capitalize">${dayLabel}</span>
          <span class="text-2xl">${info.emoji}</span>
          <span class="text-sm text-gray-400 flex-1 text-center">${info.label}</span>
          <span class="text-sm">
            <span class="font-medium">${formatTemp(daily.temperature_2m_max[i])}</span>
            <span class="text-gray-400"> / ${formatTemp(daily.temperature_2m_min[i])}</span>
          </span>
        </button>
      `
    })
    .join('')

  list.querySelectorAll('.daily-forecast-item').forEach((btn) => {
    btn.addEventListener('click', () => openDayDetail(Number(btn.dataset.index), daily, hourly))
  })

  skeleton.classList.add('hidden')
  list.classList.remove('hidden')
}

function openDayDetail(index, daily, hourly) {
  const info = getWeatherInfo(daily.weather_code[index])
  const dateStr = daily.time[index]

  document.getElementById('day-detail-name').textContent =
    index === 0 ? "Aujourd'hui" : new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  document.getElementById('day-detail-condition').textContent = info.label
  document.getElementById('day-detail-icon').textContent = info.emoji
  document.getElementById('day-detail-max').textContent = `${formatTemp(daily.temperature_2m_max[index])} `
  document.getElementById('day-detail-min').textContent = `/ ${formatTemp(daily.temperature_2m_min[index])}`
  document.getElementById('day-detail-rain').textContent = `${daily.precipitation_probability_max[index]}%`

  const { avgHumidity, avgWind } = getDailyAverages(hourly, dateStr)
  document.getElementById('day-detail-humidity').textContent = `${avgHumidity}%`
  document.getElementById('day-detail-wind').textContent = formatWind(avgWind)

  document.getElementById('day-detail-modal').classList.remove('hidden')
}

function getDailyAverages(hourly, dateStr) {
  const indices = hourly.time
    .map((t, i) => (t.startsWith(dateStr) ? i : -1))
    .filter((i) => i !== -1)

  const humidities = indices.map((i) => hourly.relative_humidity_2m[i])
  const winds = indices.map((i) => hourly.wind_speed_10m[i])

  const avgHumidity = Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length)
  const avgWind = winds.reduce((a, b) => a + b, 0) / winds.length

  return { avgHumidity, avgWind }
}

function updateFavoriteIcon() {
  const btn = document.getElementById('favorite-toggle-btn')
  const svg = btn.querySelector('svg')
  const active = currentCity && isFavorite(currentCity)

  svg.classList.toggle('fill-amber-400', active)
  svg.classList.toggle('text-amber-400', active)
}

function toggleFavorite() {
  if (!currentCity) return

  if (isFavorite(currentCity)) {
    removeFavorite(currentCity)
  } else {
    addFavorite(currentCity)
  }

  updateFavoriteIcon()

  const btn = document.getElementById('favorite-toggle-btn')
  btn.classList.remove('animate-pop')
  void btn.offsetWidth
  btn.classList.add('animate-pop')
}

function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function showLoading() {
  document.getElementById('weather-loading').classList.remove('hidden')
  document.getElementById('weather-error').classList.add('hidden')
  document.getElementById('weather-content').classList.add('hidden')
}

function showError() {
  document.getElementById('weather-loading').classList.add('hidden')
  document.getElementById('weather-error').classList.remove('hidden')
  document.getElementById('weather-content').classList.add('hidden')
}

function showContent() {
  document.getElementById('weather-loading').classList.add('hidden')
  document.getElementById('weather-error').classList.add('hidden')

  const content = document.getElementById('weather-content')
  content.classList.remove('hidden')
  content.classList.remove('animate-fade-in-up')
  void content.offsetWidth
  content.classList.add('animate-fade-in-up')
}