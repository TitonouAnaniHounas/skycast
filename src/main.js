import './style.css'
import './custom.css'
import { createIcons, Menu, X, Search, MapPin, Star, Droplet, Wind, Compass, Gauge, Eye, Sunrise, Sunset, CloudRain } from 'lucide'
import { initDashboard } from './js/pages/dashboard.js'


createIcons({
  icons: { Menu, X, Search, MapPin, Star, Droplet, Wind, Compass, Gauge, Eye, Sunrise, Sunset },
})
initDashboard()