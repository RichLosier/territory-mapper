# 🔍 Guide de Débogage - Carte ne charge pas

## Vérifications à faire

### 1. Ouvrir la Console du Navigateur
- Appuyez sur **F12** ou **Cmd+Option+I** (Mac)
- Allez dans l'onglet **Console**
- Regardez les messages d'erreur en rouge

### 2. Vérifier les Erreurs Communes

#### Erreur: "Google Maps JavaScript API error"
**Cause:** Clé API invalide ou non activée

**Solution:**
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Vérifiez que **Maps JavaScript API** est activée
3. Vérifiez que votre clé API est correcte dans Settings

#### Erreur: "RefererNotAllowedMapError"
**Cause:** Restrictions HTTP referrers trop strictes

**Solution:**
1. Google Cloud Console → Credentials
2. Cliquez sur votre clé API
3. Dans "Application restrictions" → Ajoutez:
   - `http://localhost:*`
   - `http://127.0.0.1:*`
   - Votre domaine de production

#### Erreur: "This API project is not authorized"
**Cause:** API non activée pour ce projet

**Solution:**
1. Google Cloud Console → APIs & Services → Library
2. Recherchez "Maps JavaScript API"
3. Cliquez "ENABLE"

### 3. Vérifier dans le Code

Ouvrez la console et tapez:
```javascript
// Vérifier la clé API
AppState.apiKeys.maps

// Vérifier si Google Maps est chargé
typeof google

// Vérifier si la carte existe
AppState.currentMap

// Vérifier le container
document.getElementById('map')
```

### 4. Test Manuel

Dans la console, essayez:
```javascript
// Charger Google Maps manuellement
const script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=VOTRE_CLE&callback=testMap';
script.async = true;
document.head.appendChild(script);

window.testMap = function() {
    const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.6532, lng: -79.3832},
        zoom: 10
    });
    console.log('Carte créée:', map);
};
```

### 5. Vérifier le Réseau

Dans la console:
- Onglet **Network**
- Rechargez la page
- Cherchez les requêtes vers `maps.googleapis.com`
- Vérifiez le statut (200 = OK, 403 = Forbidden, etc.)

## Messages de Debug dans la Console

L'application affiche maintenant des messages détaillés:
- `🚀 Initialisation TerritoryPro...`
- `🔑 Configuration automatique de la clé API...`
- `📡 Chargement Google Maps API...`
- `📜 Script Google Maps chargé, attente du callback...`
- `✅ Google Maps API chargée avec succès`
- `🗺️ Initialisation de la carte...`
- `✅ Carte Google Maps initialisée avec succès`

Si vous ne voyez pas ces messages, il y a un problème d'initialisation.

## Solution Rapide

1. **Ouvrez la console (F12)**
2. **Copiez-collez les erreurs ici**
3. **Vérifiez votre clé API dans Settings**
4. **Testez la connexion avec "Test Connection"**

