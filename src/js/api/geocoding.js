const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export async function searchCity(query) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Erreur géocodage : ${response.status}`)
  }

  const data = await response.json()
  return data.results || []
}