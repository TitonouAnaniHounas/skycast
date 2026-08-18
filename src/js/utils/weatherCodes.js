export const WEATHER_CODES = {
  0: { emoji: '☀️', label: 'Ciel dégagé' },
  1: { emoji: '🌤️', label: 'Plutôt dégagé' },
  2: { emoji: '⛅', label: 'Partiellement nuageux' },
  3: { emoji: '☁️', label: 'Couvert' },
  45: { emoji: '🌫️', label: 'Brouillard' },
  48: { emoji: '🌫️', label: 'Brouillard givrant' },
  51: { emoji: '🌦️', label: 'Bruine légère' },
  53: { emoji: '🌦️', label: 'Bruine modérée' },
  55: { emoji: '🌧️', label: 'Bruine dense' },
  61: { emoji: '🌧️', label: 'Pluie légère' },
  63: { emoji: '🌧️', label: 'Pluie modérée' },
  65: { emoji: '🌧️', label: 'Pluie forte' },
  71: { emoji: '🌨️', label: 'Neige légère' },
  73: { emoji: '🌨️', label: 'Neige modérée' },
  75: { emoji: '❄️', label: 'Neige forte' },
  80: { emoji: '🌦️', label: 'Averses légères' },
  81: { emoji: '🌧️', label: 'Averses modérées' },
  82: { emoji: '⛈️', label: 'Averses violentes' },
  95: { emoji: '⛈️', label: 'Orage' },
  96: { emoji: '⛈️', label: 'Orage avec grêle' },
  99: { emoji: '⛈️', label: 'Orage violent avec grêle' },
}

export function getWeatherInfo(code) {
  return WEATHER_CODES[code] || { emoji: '❓', label: 'Inconnu' }
}