#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# Configuration automatique des restrictions API Google Cloud
# ═══════════════════════════════════════════════════════════════

API_KEY="AIzaSyA21ef6cszYLyn22AiihKOkLa9ss0EIEDQ"
PROJECT_ID="ai-bcg"
VERCEL_URL="https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app"

echo "🔧 Configuration automatique Google Cloud API..."
echo ""
echo "📋 Clé API: ${API_KEY:0:20}..."
echo "📦 Projet: $PROJECT_ID"
echo "🌐 URL Vercel: $VERCEL_URL"
echo ""

# Vérifier si on peut utiliser l'API directement
if command -v curl &> /dev/null && command -v jq &> /dev/null; then
    echo "✅ Outils requis disponibles"
    echo ""
    
    # Utiliser le projet spécifié ou essayer gcloud
    if [ -z "$PROJECT_ID" ] && command -v gcloud &> /dev/null; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    fi
    
    if [ ! -z "$PROJECT_ID" ]; then
            echo "📦 Projet détecté: $PROJECT_ID"
            echo ""
            
            # Obtenir un access token
            echo "🔐 Authentification..."
            ACCESS_TOKEN=$(gcloud auth print-access-token 2>/dev/null)
            
            if [ ! -z "$ACCESS_TOKEN" ]; then
                echo "✅ Token obtenu"
                echo ""
                echo "🔄 Mise à jour des restrictions..."
                
                # Mettre à jour via l'API REST
                RESPONSE=$(curl -s -X PATCH \
                    "https://apikeys.googleapis.com/v2/projects/$PROJECT_ID/locations/global/keys/$API_KEY?updateMask=restrictions.browserKeyRestrictions.allowedReferrers" \
                    -H "Authorization: Bearer $ACCESS_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"restrictions\": {
                            \"browserKeyRestrictions\": {
                                \"allowedReferrers\": [
                                    \"http://localhost:*\",
                                    \"http://127.0.0.1:*\",
                                    \"https://*.vercel.app/*\",
                                    \"$VERCEL_URL/*\"
                                ]
                            }
                        }
                    }" 2>&1)
                
                if echo "$RESPONSE" | jq -e '.name' > /dev/null 2>&1; then
                    echo "✅ Restrictions configurées avec succès!"
                    echo ""
                    echo "📋 Restrictions appliquées:"
                    echo "   ✅ http://localhost:*"
                    echo "   ✅ http://127.0.0.1:*"
                    echo "   ✅ https://*.vercel.app/*"
                    echo "   ✅ $VERCEL_URL/*"
                    echo ""
                    echo "⏳ Attendez 2-5 minutes pour que les changements prennent effet"
                    exit 0
                else
                    echo "⚠️  Erreur API: $RESPONSE"
                    echo ""
                fi
            else
                echo "⚠️  Impossible d'obtenir le token"
                echo "   Exécutez: gcloud auth login"
                echo ""
            fi
        fi
    fi
fi

# Si l'automatisation échoue, ouvrir le navigateur avec les instructions
echo "📖 Ouverture du navigateur pour configuration manuelle..."
echo ""

# Créer une page HTML temporaire avec les instructions
TEMP_HTML=$(mktemp)
cat > "$TEMP_HTML" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Configuration API Google Cloud</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .step { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .code { background: #333; color: #0f0; padding: 10px; border-radius: 5px; font-family: monospace; }
        button { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔧 Configuration Google Cloud API</h1>
    
    <div class="step">
        <h2>Étape 1: Ouvrir Google Cloud Console</h2>
        <p>Cliquez sur le bouton ci-dessous pour ouvrir directement la page des credentials:</p>
        <button onclick="window.open('https://console.cloud.google.com/apis/credentials', '_blank')">
            Ouvrir Google Cloud Console
        </button>
    </div>
    
    <div class="step">
        <h2>Étape 2: Trouver votre clé API</h2>
        <p>Cherchez la clé qui commence par: <strong>AIzaSyA21ef6cszYLyn2...</strong></p>
        <p>Cliquez dessus pour l'éditer.</p>
    </div>
    
    <div class="step">
        <h2>Étape 3: Configurer les restrictions</h2>
        <p>Dans "Application restrictions", sélectionnez "HTTP referrers (web sites)"</p>
        <p>Cliquez sur "+ Add an item" et ajoutez ces URLs une par une:</p>
        <div class="code">
http://localhost:*<br>
http://127.0.0.1:*<br>
https://*.vercel.app/*<br>
https://wx-interactive-reps-mapping-r8ja86k6e-richard-losiers-projects.vercel.app/*
        </div>
    </div>
    
    <div class="step">
        <h2>Étape 4: Sauvegarder</h2>
        <p>Cliquez sur "SAVE" en bas de la page.</p>
        <p>Attendez 2-5 minutes pour que les changements prennent effet.</p>
    </div>
    
    <div class="step">
        <h2>✅ C'est fait!</h2>
        <p>Votre application Vercel devrait maintenant fonctionner correctement.</p>
    </div>
</body>
</html>
EOF

# Ouvrir dans le navigateur
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$TEMP_HTML"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$TEMP_HTML" 2>/dev/null || sensible-browser "$TEMP_HTML" 2>/dev/null
fi

echo "✅ Instructions ouvertes dans le navigateur"
echo ""
echo "📋 Résumé des URLs à ajouter:"
echo "   • http://localhost:*"
echo "   • http://127.0.0.1:*"
echo "   • https://*.vercel.app/*"
echo "   • $VERCEL_URL/*"
echo ""

