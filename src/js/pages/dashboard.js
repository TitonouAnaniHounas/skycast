import { searchCity } from '../api/geocoding.js'
import { fetchWeather } from '../api/weather.js'
import { getWeatherInfo } from '../utils/weatherCodes.js'
import { addToSearchHistory } from '../services/storage.js'
import Chart from 'chart.js/auto'


let chartInstance = null
let currentWeatherData = null
let currentMetric = 'temperature'

export function initDashboard() {
  const searchInput = document.getElementById('city-search-input')
  const searchBtn = document.getElementById('search-btn')

  if (!searchInput) return

  searchBtn.addEventListener('click', handleSearch)
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch()
  })

  document.querySelectorAll('.chart-metric-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chart-metric-btn').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      currentMetric = btn.dataset.metric
      if (currentWeatherData) {
        renderChart(currentWeatherData.hourly)
      }
    })
  })
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

function renderHourlyForecast(hourly) {
  const list = document.getElementById('hourly-forecast-list')
  const skeleton = document.getElementById('hourly-skeleton')

  const next12Hours = hourly.time.slice(0, 12).map((time, i) => ({
    time,
    temp: hourly.temperature_2m[i],
    code: hourly.weather_code[i],
  }))

  list.innerHTML = next12Hours
    .map((hour) => {
      const info = getWeatherInfo(hour.code)
      const label = new Date(hour.time).toLocaleTimeString('fr-FR', { hour: '2-digit' })
      return `
        <div class="flex-shrink-0 w-20 flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-2xl py-4">
          <span class="text-xs text-gray-400">${label}</span>
          <span class="text-2xl">${info.emoji}</span>
          <span class="font-medium">${Math.round(hour.temp)}°</span>
        </div>
      `
    })
    .join('')

  skeleton.classList.add('hidden')
  list.classList.remove('hidden')
}

function renderChart(hourly) {
  const canvas = document.getElementById('weather-chart')
  const labels = hourly.time.slice(0, 12).map((t) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit' }))

  const datasets = {
    temperature: { data: hourly.temperature_2m.slice(0, 12), label: 'Température (°C)', color: '#a78bfa' },
    precipitation: { data: hourly.precipitation.slice(0, 12), label: 'Précipitations (mm)', color: '#34d399' },
    wind: { data: hourly.wind_speed_10m.slice(0, 12), label: 'Vent (km/h)', color: '#60a5fa' },
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

function renderCurrentWeather(city, weather) {
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
  document.getElementById('weather-temp').textContent = `${Math.round(current.temperature_2m)}°C`
  document.getElementById('weather-feelslike').textContent = `Ressenti ${Math.round(current.apparent_temperature)}°C`
  document.getElementById('weather-condition').textContent = info.label

  document.getElementById('weather-min').textContent = `${Math.round(daily.temperature_2m_min[0])}°C`
  document.getElementById('weather-max').textContent = `${Math.round(daily.temperature_2m_max[0])}°C`

  document.getElementById('weather-humidity').textContent = `${current.relative_humidity_2m}%`
  document.getElementById('weather-wind').textContent = `${Math.round(current.wind_speed_10m)} km/h`
  document.getElementById('weather-wind-direction').textContent = getWindDirection(current.wind_direction_10m)
  document.getElementById('weather-pressure').textContent = `${Math.round(current.surface_pressure)} hPa`
  document.getElementById('weather-visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`

  document.getElementById('weather-sunrise').textContent = formatTime(daily.sunrise[0])
  document.getElementById('weather-sunset').textContent = formatTime(daily.sunset[0])
  document.getElementById('weather-local-time').textContent = formatTime(new Date().toISOString())
  renderHourlyForecast(weather.hourly)
  renderChart(weather.hourly)
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
  document.getElementById('weather-content').classList.remove('hidden')
}