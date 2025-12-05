# TerritoryPro - Cartographie Territoriale Intelligence

Application web de gestion territoriale pour équipes de vente avec attribution automatique de dealers, analyse de couverture et rapports avancés.

## 🎯 Features Principales

- 🗺️ **Cartographie interactive** avec Google Maps
- 👤 **Système visuel ownership** (avatars reps sur territoires style Snapchat)
- 🏢 **Scan automatique dealers** (Google Places API)
- 🎯 **Attribution intelligente** (suggestion proximité, auto-assign)
- 📊 **Analyse couverture** (white zones, overlaps, workload balance)
- 📈 **Prédictions revenue** par territoire
- 📤 **Export multi-format** (PDF, CSV, Image, CRM-ready)
- 🔗 **Partage liens** avec state preservé
- 📱 **Mobile-first** avec offline support
- 🔄 **Sync Google Sheets** (optionnel)

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/[username]/territory-mapper.git
cd territory-mapper

# Pas de npm install nécessaire (HTML/CSS/JS pur)
```

### 2. Obtenir API Keys Google

#### Google Maps JavaScript API:

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Créer nouveau projet ou sélectionner existant
3. Enable APIs: **Maps JavaScript API** + **Geocoding API**
4. Credentials → Create API Key
5. Restricter key (optionnel):
   - Application restrictions: HTTP referrers
   - Add: `https://[your-domain].vercel.app/*`
   - API restrictions: Maps JavaScript API, Geocoding API

#### Google Places API:

1. Même console, Enable API: **Places API**
2. Créer second API Key OU utiliser même (déconseillé prod)
3. Restricter API: Places API

### 3. Configuration App

1. Ouvrir `index.html` dans navigateur
2. Clic icône ⚙️ Settings
3. Onglet "API Keys": coller vos keys
4. Clic "Test Connection" pour valider
5. Save Keys

### 4. Premier Usage

1. Clic "Select Region" → choisir Ontario/Québec
2. Clic "🔍 Scan All Dealers" (prend 2-5 min)
3. Clic "+ Add Rep" → enter nom, email, draw territoire
4. Upload CSV clients (optionnel) ou add manuellement
5. Assign dealers: clic droit marker rouge → Assign to Rep

## 📋 Format CSV

### Format Simple (Recommandé):

```csv
Rep,RepEmail,RepPhoto,Client,ClientAddress,ClientCity,ClientPostal,ClientPhone,ClientSince
Thierry Larochelle,t.larochelle@wex.com,https://i.imgur.com/avatar.jpg,Honda Capitale,1730 Bank St,Ottawa,K1H 7Z9,(613)555-1234,2023-03-15
Guillaume Verret,g.verret@wex.com,,Toyota Downtown,789 Yonge St,Toronto,M5B 1L7,(416)555-9999,2022-11-20
```

**Colonnes:**
- **Rep** (requis): Nom représentant
- **Client** (requis): Nom client/dealer existant
- **ClientAddress** (requis): Adresse complète
- **ClientCity** (requis): Ville
- **ClientPostal** (requis): Code postal (format: A1A 1A1 ou M5V2T6)
- RepEmail (optionnel): Email pour exports
- RepPhoto (optionnel): URL avatar ou path local
- ClientPhone (optionnel): Format flexible
- ClientSince (optionnel): Date YYYY-MM-DD

## 🛠️ Setup GitHub + Vercel

### GitHub:

```bash
# Dans dossier projet
git init
git add .
git commit -m "Initial commit - Territory mapping tool"

# Créer repo sur github.com, puis:
git remote add origin https://github.com/[username]/[repo-name].git
git branch -M main
git push -u origin main
```

### Vercel Deployment:

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Import Git Repository → select GitHub repo
3. Framework Preset: **Other**
4. Build Command: (leave empty)
5. Output Directory: `.`
6. Environment Variables (optionnel, peut aussi être configuré dans l'app):
   - `GOOGLE_MAPS_KEY`: [your key]
   - `GOOGLE_PLACES_KEY`: [your key]
7. Deploy!

URL production: `https://[project-name].vercel.app`

**Auto-Deploy:** Chaque push sur `main` déclenche déploiement automatique.

## 📖 Guide Utilisation

### Créer Territoire:

1. Clic "+ Add Rep"
2. Enter nom, email, choisir couleur
3. Upload photo (optionnel) ou enter initiales
4. Carte active mode draw: clic points pour tracer polygone
5. Double-clic pour fermer polygone
6. Territoire sauvegardé automatiquement

### Importer Clients:

1. Préparer CSV (voir format ci-dessus)
2. Clic "Upload CSV"
3. Review matches automatiques (green checkmarks)
4. Valider matches ambigus (yellow warnings)
5. Clients apparaissent avec avatar rep sur carte

### Assigner Dealers:

**Méthode 1 - Manuel:**
- Clic droit dealer rouge → Assign to [Rep]

**Méthode 2 - Auto:**
- Clic "🎯 Auto-Assign All Available"
- Confirmer → assigne au rep le plus proche

**Méthode 3 - Sélection multiple:**
- Shift+clic markers → sélection multiple
- Bouton "Assign X selected to [Rep ▼]"

## 🔧 Troubleshooting

### ❌ "Google Maps failed to load"

**Causes:**
- API key invalide ou non configurée
- API Maps JavaScript pas enabled sur Google Cloud
- Restrictions HTTP referrers trop strictes

**Solutions:**
1. Vérifier key dans Settings → Test Connection
2. Console Google Cloud → Enable "Maps JavaScript API"
3. Credentials → Edit key → remove restrictions temporairement

### ⚠️ "API quota exceeded"

**Cause:** Limite gratuite dépassée (28,000 loads/mois Maps, $200/mois Places)

**Solutions:**
- Attendre reset quota (mensuel)
- Upgrade plan Google Cloud
- Réduire scans dealers (cache 30 jours)

## 💰 Coûts Google APIs

### Gratuit:
- **Maps JavaScript API**: 28,000 loads/mois
- **Geocoding API**: $200 crédit/mois (~40,000 requêtes)
- **Places API**: $200 crédit/mois (~6,600 requêtes)

### Usage typique (10 users):
- Maps loads: ~1,000/mois = **Gratuit**
- Geocoding CSV: ~200/mois = **Gratuit**
- Places refresh: ~500/mois = **$5/mois**
- **Total: ~$5/mois**

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show shortcuts |
| `Esc` | Close modals |
| `Ctrl+S` | Save state |
| `Ctrl+F` | Focus search |
| `Ctrl+N` | Add new rep |
| `Space` | Toggle sidebar |
| `[` / `]` | Cycle reps |
| `D` | Draw territory |
| `A` | Auto-assign all |
| `E` | Export view |
| `+` / `-` | Zoom in/out |
| `Arrows` | Pan map |
| `Home` | Reset view |

## 📄 License

MIT License

---

**Built with ❤️ for WholesaleXpress team**

Version 1.0.0 | Last updated: December 2025

