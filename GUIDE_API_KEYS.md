# 🔑 Guide: Configuration des Clés API Google

## Étape 1: Obtenir les Clés API sur Google Cloud Console

### 1.1 Créer/Accéder à un Projet Google Cloud

1. **Aller sur Google Cloud Console:**
   - Ouvrez: https://console.cloud.google.com/
   - Connectez-vous avec votre compte Google

2. **Créer un nouveau projet** (ou utiliser un existant):
   - Cliquez sur le sélecteur de projet en haut
   - Cliquez sur "Nouveau projet"
   - Nommez-le: "TerritoryPro" (ou autre nom)
   - Cliquez "Créer"

### 1.2 Activer les APIs Nécessaires

1. **Aller dans "APIs & Services" → "Library":**
   - Menu gauche → "APIs & Services" → "Library"

2. **Activer ces 3 APIs:**
   
   **a) Maps JavaScript API:**
   - Recherchez "Maps JavaScript API"
   - Cliquez dessus → "ACTIVER"
   
   **b) Geocoding API:**
   - Recherchez "Geocoding API"
   - Cliquez dessus → "ACTIVER"
   
   **c) Places API:**
   - Recherchez "Places API"
   - Cliquez dessus → "ACTIVER"

### 1.3 Créer les Clés API

1. **Aller dans "APIs & Services" → "Credentials":**
   - Menu gauche → "APIs & Services" → "Credentials"

2. **Créer une clé API:**
   - Cliquez "+ CREATE CREDENTIALS" → "API key"
   - Une clé sera générée automatiquement

3. **Optionnel - Créer 2 clés séparées:**
   - Vous pouvez utiliser la même clé pour Maps et Places
   - OU créer 2 clés séparées (une pour Maps, une pour Places)
   - Pour créer une deuxième: répétez l'étape ci-dessus

### 1.4 (Recommandé) Restreindre les Clés API

**Pour la sécurité, restreignez vos clés:**

1. **Cliquez sur la clé API créée** pour l'éditer

2. **Application restrictions:**
   - Sélectionnez "HTTP referrers (web sites)"
   - Ajoutez:
     ```
     http://localhost:8000/*
     http://localhost:*
     https://*.vercel.app/*
     ```
   - (Ajoutez votre domaine de production plus tard)

3. **API restrictions:**
   - Sélectionnez "Restrict key"
   - Cochez uniquement:
     - ✅ Maps JavaScript API
     - ✅ Geocoding API
     - ✅ Places API
   - Cliquez "SAVE"

4. **Copiez la clé API** (vous en aurez besoin)

---

## Étape 2: Configurer les Clés dans l'Application

### Méthode 1: Via l'Interface (Recommandé)

1. **Ouvrez l'application:**
   - Double-cliquez sur `index.html` OU
   - Utilisez le serveur local: `./start-server.sh`

2. **Ouvrez les Paramètres:**
   - Cliquez sur l'icône ⚙️ en haut à droite

3. **Onglet "API Keys":**
   - Collez votre clé Google Maps dans le premier champ
   - Collez votre clé Google Places dans le deuxième champ
   - (Si vous utilisez la même clé pour les deux, collez-la dans les deux champs)

4. **Tester les connexions:**
   - Cliquez "Test Connection" sous chaque champ
   - Attendez quelques secondes
   - Vous devriez voir: "✅ Connexion réussie"

5. **Enregistrer:**
   - Cliquez "Enregistrer les clés"
   - Toast de confirmation: "✅ Clés API enregistrées"
   - La carte Google Maps devrait se charger automatiquement!

### Méthode 2: Via la Console (Avancé)

Si vous préférez configurer directement dans le code:

1. **Ouvrez la console du navigateur** (F12)

2. **Sauvegarder les clés:**
```javascript
Storage.set('apiKeys', {
    maps: 'VOTRE_CLE_MAPS_ICI',
    places: 'VOTRE_CLE_PLACES_ICI'
});

// Recharger la page
location.reload();
```

---

## Étape 3: Vérifier que ça Fonctionne

### Vérifications Visuelles:

✅ **La carte Google Maps s'affiche** (pas juste une zone grise)
✅ **Vous pouvez zoomer** avec la molette
✅ **Vous pouvez déplacer la carte** en cliquant-glissant
✅ **Les contrôles de zoom** sont visibles en bas à droite

### Vérifications Console:

Ouvrez la console (F12) et vérifiez:

```javascript
// Vérifier que les clés sont sauvegardées
Storage.get('apiKeys')
// Devrait retourner: {maps: "...", places: "..."}

// Vérifier que l'API est chargée
AppState.mapsApiLoaded
// Devrait retourner: true

// Vérifier que la carte existe
AppState.currentMap
// Devrait retourner: l'objet Google Maps
```

---

## 🐛 Dépannage

### Erreur: "Google Maps failed to load"

**Causes possibles:**
1. Clé API invalide ou mal copiée
2. API "Maps JavaScript API" pas activée
3. Restrictions HTTP referrers trop strictes

**Solutions:**
1. Vérifiez que la clé est correctement collée (pas d'espaces avant/après)
2. Allez dans Google Cloud Console → APIs & Services → Library
   - Vérifiez que "Maps JavaScript API" est activée (bouton "MANAGE")
3. Si vous avez restreint les referrers:
   - Ajoutez `http://localhost:*` dans les restrictions
   - OU temporairement enlevez les restrictions pour tester

### Erreur: "REQUEST_DENIED" lors du test Places API

**Causes possibles:**
1. API "Places API" pas activée
2. Clé API invalide
3. Restrictions API trop strictes

**Solutions:**
1. Vérifiez que "Places API" est activée dans Google Cloud Console
2. Vérifiez que la clé est correcte
3. Dans les restrictions API, assurez-vous que "Places API" est cochée

### Erreur: "RefererNotAllowedMapError"

**Cause:** Restrictions HTTP referrers trop strictes

**Solution:**
1. Allez dans Google Cloud Console → Credentials
2. Cliquez sur votre clé API
3. Dans "Application restrictions" → "HTTP referrers"
4. Ajoutez:
   - `http://localhost:*`
   - `http://127.0.0.1:*`
   - Votre domaine de production (ex: `https://votre-app.vercel.app/*`)
5. Cliquez "SAVE"

### La carte ne se charge pas après avoir enregistré les clés

**Solution:**
1. Rechargez la page (F5)
2. Vérifiez la console pour les erreurs (F12)
3. Vérifiez que les clés sont bien sauvegardées:
   ```javascript
   Storage.get('apiKeys')
   ```

---

## 💰 Coûts et Quotas

### Plan Gratuit (Free Tier):

- **Maps JavaScript API:** 28,000 loads/mois GRATUIT
- **Geocoding API:** $200 crédit/mois (~40,000 requêtes)
- **Places API:** $200 crédit/mois (~6,600 requêtes)

### Usage Typique:

- **Maps loads:** ~1,000/mois = **GRATUIT**
- **Geocoding CSV:** ~200/mois = **GRATUIT**
- **Places scan:** ~500/mois = **~$5/mois**

**Total estimé: ~$5/mois** pour une équipe de 10 utilisateurs

### Important:

- Les $200 de crédit sont renouvelés chaque mois
- Si vous dépassez, Google vous facturera automatiquement
- Vous pouvez définir des alertes de budget dans Google Cloud Console

---

## 🔒 Sécurité

### Bonnes Pratiques:

1. **Restreignez vos clés API** (voir Étape 1.4)
2. **Ne partagez jamais vos clés** publiquement
3. **Utilisez des clés différentes** pour développement et production
4. **Surveillez l'usage** dans Google Cloud Console
5. **Définissez des alertes de budget** pour éviter les surprises

### Pour Production (Vercel):

Quand vous déployez sur Vercel:

1. Ajoutez vos domaines dans les restrictions HTTP referrers:
   ```
   https://votre-app.vercel.app/*
   https://*.vercel.app/*
   ```

2. Optionnel: Utilisez les variables d'environnement Vercel:
   - Dans Vercel Dashboard → Settings → Environment Variables
   - Ajoutez: `GOOGLE_MAPS_KEY` et `GOOGLE_PLACES_KEY`
   - (L'app les utilisera automatiquement si configurées)

---

## ✅ Checklist de Configuration

- [ ] Projet Google Cloud créé
- [ ] Maps JavaScript API activée
- [ ] Geocoding API activée
- [ ] Places API activée
- [ ] Clé(s) API créée(s)
- [ ] Restrictions configurées (recommandé)
- [ ] Clés collées dans l'application
- [ ] Test Connection réussie pour Maps
- [ ] Test Connection réussie pour Places
- [ ] Clés enregistrées
- [ ] Carte Google Maps s'affiche correctement

---

**Besoin d'aide?** Consultez la console du navigateur (F12) pour voir les erreurs détaillées.

