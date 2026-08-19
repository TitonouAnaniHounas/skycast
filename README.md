# SkyCast ☁️

Application météo front-end connectée à des APIs publiques (géocodage + prévisions), avec géolocalisation, graphiques interactifs, favoris et historique. Projet de démonstration réalisé pour mon portfolio.

🔗 **Démo en ligne :** [lien à venir après déploiement]


## ✨ Fonctionnalités

- **Recherche de ville** — avec autocomplétion (debounce) et gestion des erreurs
- **Géolocalisation** — météo de la position actuelle en un clic
- **Météo actuelle** — température, ressenti, humidité, vent, pression, visibilité, lever/coucher du soleil, heure locale et indicateur jour/nuit, tout calculé dans le fuseau horaire réel de la ville recherchée (pas celui de l'utilisateur)
- **Prévisions horaires** — 12 prochaines heures, glissantes selon l'heure actuelle de la ville
- **Graphique interactif** (Chart.js) — température, précipitations ou vent, au choix
- **Prévisions sur 7 jours** — avec détail complet par jour dans une modale (humidité et vent moyens calculés à partir des données horaires)
- **Favoris** — ajout/retrait, page dédiée avec météo actuelle de chaque ville
- **Historique** — 10 dernières recherches, avec retour direct au Dashboard pour une ville donnée
- **Paramètres** — unités de température (°C/°F) et de vent (km/h/mph), appliquées partout dans l'app
- **Design** — identité visuelle "ciel nocturne" (glassmorphism, dégradés, effets de flou), responsive avec menu mobile
- **États UX** — loaders, gestion des erreurs API, états vides

## 🛠️ Stack technique

| Élément | Choix |
|---|---|
| Structure | HTML5 sémantique |
| Style | Tailwind CSS v4 + CSS vanilla (effets custom) |
| Logique | JavaScript vanilla (ES6+, modules) |
| Graphiques | Chart.js |
| Icônes | Lucide |
| Géocodage | Open-Meteo Geocoding API |
| Météo | Open-Meteo Forecast API |
| Build | Vite |
| Persistance | localStorage |

## 📁 Structure du projet

skycast/
├── index.html # Dashboard
├── favorites.html # Favoris
├── history.html # Historique
├── settings.html # Paramètres
├── 404.html # Page introuvable
│
├── src/
│ ├── main.js # Point d'entrée, initialisation globale
│ ├── style.css # Import Tailwind
│ ├── custom.css # CSS vanilla custom (fond, glassmorphism)
│ │
│ └── js/
│ ├── api/
│ │ ├── geocoding.js # Recherche de ville → coordonnées
│ │ └── weather.js # Coordonnées → données météo
│ ├── pages/
│ │ ├── dashboard.js # Logique complète du Dashboard
│ │ ├── favorites.js # Logique de la page Favoris
│ │ ├── history.js # Logique de la page Historique
│ │ └── settings.js # Logique de la page Paramètres
│ ├── services/
│ │ └── storage.js # localStorage (favoris, historique, unités)
│ └── utils/
│ ├── weatherCodes.js # Table de correspondance code météo → emoji/texte
│ ├── units.js # Conversion et formatage des unités
│ └── debounce.js # Anti-rebond pour l'autocomplétion
│
└── vite.config.js


## 🚀 Installation

```bash
git clone https://github.com/<ton-pseudo>/skycast.git
cd skycast
npm install
npm run dev
```

Le site est ensuite accessible sur `http://localhost:5173`.

## 📦 Build de production

```bash
npm run build
```

## 📝 Notes

Ce projet est **entièrement front-end**, sans backend ni clé d'API secrète — Open-Meteo est utilisable directement depuis le navigateur, gratuitement et sans authentification. Les seules données personnelles (favoris, historique, préférences d'unités) restent stockées localement dans le navigateur, jamais envoyées à un serveur.

## 👤 Auteur

**Hounas** — [GitHub](https://github.com/TitonouAnaniHounas) · [LinkedIn](https://www.linkedin.com/in/anani-hounas-titonou-182b88429/)