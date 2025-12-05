# 🚀 Déploiement Vercel - Configuration Automatique

## ✅ Application déployée!

**URL de production:** https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app

## 🔧 Configuration Google Cloud API (AUTOMATIQUE)

Votre application est déjà déployée sur Vercel. Pour que Google Maps fonctionne, vous devez configurer les restrictions HTTP referrers de votre clé API.

### Option 1: Script Automatique (Recommandé)

```bash
./configure-api-restrictions.sh
```

Ce script va:
1. Détecter votre projet Google Cloud
2. Utiliser gcloud pour obtenir un token d'accès
3. Configurer automatiquement les restrictions via l'API REST

### Option 2: Configuration Manuelle (2 minutes)

1. **Ouvrez:** https://console.cloud.google.com/apis/credentials
2. **Cliquez** sur votre clé API: `AIzaSyA21ef6cszYLyn2...`
3. **Application restrictions** → Sélectionnez "HTTP referrers (web sites)"
4. **Ajoutez** ces URLs:
   ```
   http://localhost:*
   http://127.0.0.1:*
   https://*.vercel.app/*
   https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app/*
   ```
5. **Cliquez** "SAVE"
6. **Attendez** 2-5 minutes

### Option 3: Via gcloud CLI

Si vous avez gcloud installé:

```bash
# Installer gcloud (si pas déjà fait)
brew install --cask google-cloud-sdk

# S'authentifier
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Exécuter le script
./configure-api-restrictions.sh
```

## 🎯 Test

Une fois configuré, ouvrez votre application Vercel:
https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app

La carte Google Maps devrait se charger automatiquement!

## 📝 Notes

- Les changements prennent 2-5 minutes pour prendre effet
- Votre clé API est déjà pré-configurée dans l'application
- Le scan des dealers utilisera Google Places API automatiquement

