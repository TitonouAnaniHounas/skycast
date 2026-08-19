import { getUnits } from '../services/storage.js'

export function toDisplayTemp(celsius) {
  const units = getUnits()
  return units.temperature === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius
}

export function tempUnitLabel() {
  return getUnits().temperature === 'fahrenheit' ? '°F' : '°C'
}

export function formatTemp(celsius) {
  return `${Math.round(toDisplayTemp(celsius))}${tempUnitLabel()}`
}

export function toDisplayWind(kmh) {
  const units = getUnits()
  return units.wind === 'mph' ? kmh * 0.621371 : kmh
}

export function windUnitLabel() {
  return getUnits().wind === 'mph' ? 'mph' : 'km/h'
}

export function formatWind(kmh) {
  return `${Math.round(toDisplayWind(kmh))} ${windUnitLabel()}`
}