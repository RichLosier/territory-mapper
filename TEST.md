# Guide de Test - TerritoryPro

## 🚀 Test Rapide (Sans API Keys)

### Étape 1: Ouvrir l'application

**Option A - Double-clic:**
- Double-cliquez sur `index.html` dans Finder
- L'application s'ouvrira dans votre navigateur par défaut

**Option B - Terminal:**
```bash
cd "/Users/richardlosier/Desktop/AI/WX interactive reps mapping"
open index.html
```

**Option C - Serveur local (recommandé pour éviter les erreurs CORS):**
```bash
# Python 3
python3 -m http.server 8000

# Ou Python 2
python -m SimpleHTTPServer 8000

# Puis ouvrir: http://localhost:8000
```

### Étape 2: Vérifier l'interface

Vous devriez voir:
- ✅ **Header** en haut avec "TerritoryPro" et boutons ⚙️ et ?
- ✅ **Sidebar** à gauche avec "Territoires" et bouton "+ Add Rep"
- ✅ **Zone carte** à droite (gris si pas de clé API)
- ✅ **Message toast** en haut à droite: "⚠️ Configurez vos clés API dans les paramètres pour commencer"

### Étape 3: Tester les modals

1. **Cliquez sur ⚙️ (Settings)**
   - Modal devrait s'ouvrir
   - Onglet "API Keys" devrait être actif
   - Vous devriez voir 2 champs pour les clés API

2. **Testez les onglets**
   - Cliquez sur "Affichage", "Données", etc.
   - Chaque onglet devrait changer de contenu

3. **Testez le toggle password**
   - Entrez du texte dans un champ API key
   - Cliquez sur 👁️ → le texte devrait devenir visible
   - Cliquez à nouveau → le texte devrait être masqué

4. **Fermez la modal**
   - Cliquez sur ✕ ou appuyez sur `Esc`
   - La modal devrait se fermer

### Étape 4: Tester les toasts

Ouvrez la console du navigateur (F12 ou Cmd+Option+I) et tapez:
```javascript
showToast('Test de notification', 'success');
showToast('Erreur de test', 'error');
showToast('Avertissement', 'warning');
showToast('Information', 'info');
```

Vous devriez voir des notifications colorées apparaître en haut à droite.

---

## 🗺️ Test Complet (Avec API Keys)

### Prérequis: Obtenir des clés API Google

1. **Aller sur Google Cloud Console:**
   https://console.cloud.google.com/google/maps-apis

2. **Créer un projet** (ou utiliser existant)

3. **Activer les APIs nécessaires:**
   - Maps JavaScript API
   - Geocoding API
   - Places API

4. **Créer des clés API:**
   - Credentials → Create Credentials → API Key
   - Créer 2 clés séparées (une pour Maps, une pour Places) OU utiliser la même

### Test avec clés API

1. **Ouvrir Settings (⚙️)**

2. **Entrer votre clé Google Maps:**
   - Collez la clé dans le premier champ
   - Cliquez "Test Connection"
   - Attendez quelques secondes
   - Vous devriez voir: "✅ Connexion réussie"

3. **Entrer votre clé Google Places:**
   - Collez la clé dans le deuxième champ
   - Cliquez "Test Connection"
   - Attendez quelques secondes
   - Vous devriez voir: "✅ Connexion réussie"

4. **Enregistrer les clés:**
   - Cliquez "Enregistrer les clés"
   - Toast devrait apparaître: "✅ Clés API enregistrées"
   - La carte Google Maps devrait se charger automatiquement

5. **Vérifier la carte:**
   - La carte devrait être centrée sur Toronto
   - Vous pouvez zoomer avec la molette
   - Vous pouvez déplacer la carte en cliquant-glissant

### Test de sauvegarde localStorage

1. **Ouvrir la console (F12)**

2. **Vérifier que les clés sont sauvegardées:**
```javascript
Storage.get('apiKeys')
// Devrait retourner: {maps: "...", places: "..."}
```

3. **Recharger la page (F5)**
   - Les clés devraient être automatiquement rechargées
   - La carte devrait se charger sans avoir à ré-entrer les clés

---

## 🐛 Dépannage

### La carte ne se charge pas

**Problème:** "Google Maps failed to load"
- Vérifiez que la clé API est correcte
- Vérifiez que "Maps JavaScript API" est activée dans Google Cloud Console
- Vérifiez la console du navigateur pour les erreurs (F12)

**Solution:**
1. Ouvrez la console (F12)
2. Regardez les erreurs en rouge
3. Si vous voyez "RefererNotAllowedMapError": ajoutez votre domaine dans les restrictions HTTP referrers

### Les toasts ne s'affichent pas

**Vérification:**
- Ouvrez la console (F12)
- Tapez: `document.getElementById('toast-container')`
- Devrait retourner l'élément, sinon il y a un problème

### La modal ne s'ouvre pas

**Vérification:**
- Ouvrez la console (F12)
- Regardez les erreurs JavaScript
- Vérifiez que tous les fichiers JS sont chargés (onglet Network)

### Erreur CORS

**Si vous ouvrez directement le fichier HTML:**
- Certaines fonctionnalités peuvent ne pas fonctionner
- Utilisez un serveur local (voir Option C ci-dessus)

---

## ✅ Checklist de Test

- [ ] L'application s'ouvre sans erreur
- [ ] Le header s'affiche correctement
- [ ] La sidebar s'affiche à gauche
- [ ] La zone carte s'affiche à droite
- [ ] Le bouton Settings (⚙️) ouvre la modal
- [ ] Le bouton Help (?) ouvre la modal
- [ ] Les onglets dans Settings fonctionnent
- [ ] Le toggle password fonctionne
- [ ] Les toasts s'affichent correctement
- [ ] La modal se ferme avec Esc
- [ ] La modal se ferme en cliquant sur overlay
- [ ] Les clés API peuvent être testées
- [ ] Les clés API sont sauvegardées dans localStorage
- [ ] La carte Google Maps se charge avec une clé valide
- [ ] La carte peut être zoomée et déplacée

---

## 📝 Notes

- **Sans clés API:** L'application fonctionne mais la carte ne se charge pas
- **Avec clés API:** Toutes les fonctionnalités de base sont disponibles
- **Phase 1 complète:** Seulement la structure de base est implémentée
- **Phases suivantes:** Ajouteront les fonctionnalités complètes (reps, dealers, etc.)

