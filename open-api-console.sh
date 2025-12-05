#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Ouvre directement la page de configuration de la clé API
# ═══════════════════════════════════════════════════════════════

API_KEY="AIzaSyA21ef6cszYLyn22AiihKOkLa9ss0EIEDQ"
PROJECT_ID="ai-bcg"
VERCEL_URL="https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app"

echo "🔧 Ouverture Google Cloud Console..."
echo ""
echo "📋 Clé API: ${API_KEY:0:20}..."
echo "📦 Projet: $PROJECT_ID"
echo ""

# URL directe vers les credentials du projet
CONSOLE_URL="https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"

echo "🌐 Ouverture: $CONSOLE_URL"
echo ""

# Ouvrir dans le navigateur
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$CONSOLE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$CONSOLE_URL" 2>/dev/null || sensible-browser "$CONSOLE_URL" 2>/dev/null
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start "$CONSOLE_URL"
fi

echo "✅ Page ouverte dans le navigateur"
echo ""
echo "📝 Instructions rapides:"
echo "1. Cliquez sur votre clé API: ${API_KEY:0:20}..."
echo "2. Application restrictions → HTTP referrers"
echo "3. Ajoutez ces URLs:"
echo "   • http://localhost:*"
echo "   • http://127.0.0.1:*"
echo "   • https://*.vercel.app/*"
echo "   • $VERCEL_URL/*"
echo "4. Cliquez 'SAVE'"
echo ""

