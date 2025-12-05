#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Script de configuration automatique Google Cloud API
# ═══════════════════════════════════════════════════════════════

echo "🔧 Configuration automatique Google Cloud API..."
echo ""

# Votre clé API
API_KEY="AIzaSyA21ef6cszYLyn22AiihKOkLa9ss0EIEDQ"

# URL Vercel (sera mise à jour après le déploiement)
VERCEL_URL="https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app"

echo "📋 Informations:"
echo "   Clé API: ${API_KEY:0:20}..."
echo "   URL Vercel: $VERCEL_URL"
echo ""

# Vérifier si gcloud est installé
if command -v gcloud &> /dev/null; then
    echo "✅ gcloud CLI détecté"
    echo ""
    echo "🔐 Configuration automatique avec gcloud..."
    echo ""
    
    # Obtenir le nom du projet
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ]; then
        echo "⚠️  Aucun projet Google Cloud configuré"
        echo "   Exécutez: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    echo "📦 Projet: $PROJECT_ID"
    echo ""
    
    # Créer un fichier temporaire avec les restrictions
    TEMP_FILE=$(mktemp)
    cat > "$TEMP_FILE" << EOF
{
  "name": "projects/$PROJECT_ID/apiKeys/$API_KEY",
  "restrictions": {
    "browserKeyRestrictions": {
      "allowedReferrers": [
        "http://localhost:*",
        "http://127.0.0.1:*",
        "https://*.vercel.app/*",
        "$VERCEL_URL/*"
      ]
    }
  }
}
EOF
    
    echo "📝 Mise à jour des restrictions HTTP referrers..."
    echo ""
    
    # Mettre à jour les restrictions (nécessite les permissions appropriées)
    gcloud services api-keys update "$API_KEY" \
        --restrictions-allowed-referrers="http://localhost:*,http://127.0.0.1:*,https://*.vercel.app/*,$VERCEL_URL/*" \
        2>&1 | tee /tmp/gcloud-api-update.log
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Restrictions configurées avec succès!"
        echo ""
        echo "📋 Restrictions appliquées:"
        echo "   - http://localhost:*"
        echo "   - http://127.0.0.1:*"
        echo "   - https://*.vercel.app/*"
        echo "   - $VERCEL_URL/*"
    else
        echo ""
        echo "⚠️  Erreur lors de la configuration automatique"
        echo "   Vérifiez les logs: /tmp/gcloud-api-update.log"
        echo ""
        echo "💡 Configuration manuelle requise (voir ci-dessous)"
    fi
    
    rm -f "$TEMP_FILE"
    
else
    echo "⚠️  gcloud CLI non installé"
    echo ""
    echo "💡 Installation de gcloud CLI..."
    echo ""
    echo "Pour macOS:"
    echo "   brew install --cask google-cloud-sdk"
    echo ""
    echo "Ou téléchargez depuis: https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "Après installation, exécutez:"
    echo "   gcloud auth login"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    echo "   ./setup-google-api.sh"
    echo ""
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📖 GUIDE DE CONFIGURATION MANUELLE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Si la configuration automatique n'a pas fonctionné, suivez ces étapes:"
echo ""
echo "1. Allez sur: https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Cliquez sur votre clé API: ${API_KEY:0:20}..."
echo ""
echo "3. Dans 'Application restrictions', sélectionnez 'HTTP referrers (web sites)'"
echo ""
echo "4. Cliquez sur '+ Add an item' et ajoutez ces URLs:"
echo "   • http://localhost:*"
echo "   • http://127.0.0.1:*"
echo "   • https://*.vercel.app/*"
echo "   • $VERCEL_URL/*"
echo ""
echo "5. Cliquez sur 'Save'"
echo ""
echo "6. Attendez 5 minutes pour que les changements prennent effet"
echo ""
echo "═══════════════════════════════════════════════════════════════"

