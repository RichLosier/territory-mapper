#!/bin/bash
# Script pour démarrer un serveur local simple

echo "🚀 Démarrage du serveur local..."
echo ""
echo "📡 IMPORTANT: Google Maps nécessite un serveur HTTP"
echo "   Ouvrez votre navigateur à: http://localhost:8000"
echo ""
echo "⏹️  Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

# Vérifier si Python 3 est disponible
if command -v python3 &> /dev/null; then
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer 8000
else
    echo "❌ Python n'est pas installé."
    echo ""
    echo "💡 Alternatives:"
    echo "   1. Installez Python depuis python.org"
    echo "   2. Utilisez Node.js: npx http-server"
    echo "   3. Utilisez PHP: php -S localhost:8000"
    exit 1
fi

