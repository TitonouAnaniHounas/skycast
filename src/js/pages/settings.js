import { getUnits, saveUnits } from '../services/storage.js'

export function initSettingsPage() {
  const buttons = document.querySelectorAll('.unit-btn')
  if (buttons.length === 0) return // pas sur settings.html

  const units = getUnits()

  buttons.forEach((btn) => {
    const group = btn.dataset.group
    const value = btn.dataset.value

    if (units[group] === value) {
      btn.classList.add('active')
    }

    btn.addEventListener('click', () => {
      document
        .querySelectorAll(`.unit-btn[data-group="${group}"]`)
        .forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')

      const updated = getUnits()
      updated[group] = value
      saveUnits(updated)
    })
  })
}