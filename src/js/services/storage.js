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