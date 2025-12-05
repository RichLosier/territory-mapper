#!/bin/bash
# Script pour démarrer un serveur local simple

echo "🚀 Démarrage du serveur local..."
echo "📡 Ouvrez votre navigateur à: http://localhost:8000"
echo "⏹️  Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Vérifier si Python 3 est disponible
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python n'est pas installé. Utilisez la méthode double-clic ou installez Python."
    exit 1
fi

