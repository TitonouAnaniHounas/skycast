import './style.css'
import './custom.css'
import { initSettingsPage } from './js/pages/settings.js'
import { initFavoritesPage } from './js/pages/favorites.js'
import { createIcons, Menu, X, Search, MapPin, Star, Droplet, Wind, Compass, Gauge, Eye, Sunrise, Sunset, CloudRain, Loader2 } from 'lucide'
import { initDashboard } from './js/pages/dashboard.js'
import { initHistoryPage } from './js/pages/history.js'
import { initScrollReveal } from './js/utils/scrollReveal.js'

createIcons({
  icons: { Menu, X, Search, MapPin, Star, Droplet, Wind, Compass, Gauge, Eye, Sunrise, Sunset, CloudRain, Loader2 },
})
initDashboard()
initFavoritesPage()
initHistoryPage()
initScrollReveal()
initSettingsPage()