export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites')) || []
  } catch {
    return []
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites))
}

export function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem('searchHistory')) || []
  } catch {
    return []
  }
}

export function addToSearchHistory(city) {
  let history = getSearchHistory()
  history = history.filter((c) => c.name !== city.name || c.country !== city.country)
  history.unshift(city)
  history = history.slice(0, 10)
  localStorage.setItem('searchHistory', JSON.stringify(history))
}

export function isFavorite(city) {
  return getFavorites().some((f) => f.latitude === city.latitude && f.longitude === city.longitude)
}

export function addFavorite(city) {
  const favorites = getFavorites()
  if (isFavorite(city)) return
  favorites.push({ name: city.name, country: city.country, latitude: city.latitude, longitude: city.longitude })
  saveFavorites(favorites)
}

export function removeFavorite(city) {
  const favorites = getFavorites().filter(
    (f) => !(f.latitude === city.latitude && f.longitude === city.longitude)
  )
  saveFavorites(favorites)
}

export function clearSearchHistory() {
  localStorage.removeItem('searchHistory')
}

const DEFAULT_UNITS = { temperature: 'celsius', wind: 'kmh' }

export function getUnits() {
  try {
    return { ...DEFAULT_UNITS, ...JSON.parse(localStorage.getItem('units')) }
  } catch {
    return DEFAULT_UNITS
  }
}

export function saveUnits(units) {
  localStorage.setItem('units', JSON.stringify(units))
}