#!/bin/bash
# Script de configuration Git et GitHub

echo "🔧 Configuration Git pour TerritoryPro"
echo ""

# Demander les informations à l'utilisateur
read -p "Votre nom (ex: Richard Losier): " GIT_NAME
read -p "Votre email GitHub (ex: votre@email.com): " GIT_EMAIL
read -p "Nom d'utilisateur GitHub (ex: richardlosier): " GITHUB_USERNAME
read -p "Nom du repository GitHub (ex: territory-mapper) [territory-mapper]: " REPO_NAME
REPO_NAME=${REPO_NAME:-territory-mapper}

echo ""
echo "📝 Configuration Git..."

# Configurer Git
git config --global user.name "$GIT_NAME"
git config --global user.email "$GIT_EMAIL"

echo "✅ Git configuré: $GIT_NAME <$GIT_EMAIL>"
echo ""

# Vérifier si remote existe déjà
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Remote 'origin' existe déjà:"
    git remote -v
    read -p "Voulez-vous le remplacer? (o/n): " REPLACE
    if [ "$REPLACE" = "o" ] || [ "$REPLACE" = "O" ]; then
        git remote remove origin
    else
        echo "❌ Annulé. Remote existant conservé."
        exit 0
    fi
fi

# Ajouter remote GitHub
echo ""
echo "🔗 Ajout du remote GitHub..."
GITHUB_URL="https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
git remote add origin "$GITHUB_URL"

echo "✅ Remote ajouté: $GITHUB_URL"
echo ""

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🔄 Renommage de la branche en 'main'..."
    git branch -M main
fi

echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Créez le repository sur GitHub:"
echo "   https://github.com/new"
echo "   Nom: $REPO_NAME"
echo "   Visibilité: Public ou Private"
echo "   ⚠️  NE cochez PAS 'Initialize with README'"
echo ""
echo "2. Puis exécutez:"
echo "   git push -u origin main"
echo ""
echo "✅ Configuration terminée!"

