# 🚀 Guide: Push vers GitHub

## Option 1: Script Automatique (Recommandé)

Exécutez simplement:
```bash
./setup-git.sh
```

Le script vous demandera:
- Votre nom
- Votre email GitHub
- Votre nom d'utilisateur GitHub
- Le nom du repository

Puis suivez les instructions affichées.

---

## Option 2: Configuration Manuelle

### Étape 1: Configurer Git

```bash
# Configurer votre nom
git config --global user.name "Votre Nom"

# Configurer votre email (celui de votre compte GitHub)
git config --global user.email "votre@email.com"
```

### Étape 2: Créer le Repository sur GitHub

1. Allez sur: https://github.com/new
2. Nom du repository: `territory-mapper` (ou autre nom)
3. Visibilité: Public ou Private
4. **⚠️ IMPORTANT:** Ne cochez PAS "Initialize with README"
5. Cliquez "Create repository"

### Étape 3: Connecter le Repository Local

```bash
# Ajouter le remote GitHub
git remote add origin https://github.com/VOTRE_USERNAME/territory-mapper.git

# Vérifier que la branche est 'main'
git branch -M main

# Vérifier le remote
git remote -v
```

### Étape 4: Push vers GitHub

```bash
# Pousser le code
git push -u origin main
```

Si GitHub vous demande vos credentials:
- **Username:** Votre nom d'utilisateur GitHub
- **Password:** Utilisez un **Personal Access Token** (pas votre mot de passe)

---

## 🔑 Créer un Personal Access Token (si nécessaire)

Si GitHub vous demande un token au lieu d'un mot de passe:

1. Allez sur: https://github.com/settings/tokens
2. Cliquez "Generate new token" → "Generate new token (classic)"
3. Nom: "TerritoryPro"
4. Cochez: `repo` (accès complet aux repositories)
5. Cliquez "Generate token"
6. **⚠️ Copiez le token immédiatement** (vous ne le reverrez plus!)
7. Utilisez ce token comme mot de passe lors du push

---

## ✅ Vérification

Après le push, vérifiez sur GitHub:
- https://github.com/VOTRE_USERNAME/territory-mapper

Vous devriez voir tous vos fichiers!

---

## 🔄 Commandes Utiles

```bash
# Voir l'état
git status

# Voir les commits
git log --oneline

# Voir les remotes
git remote -v

# Changer l'URL du remote (si vous vous êtes trompé)
git remote set-url origin https://github.com/NOUVEAU_USERNAME/NOUVEAU_REPO.git
```

---

## 🐛 Dépannage

### Erreur: "remote origin already exists"

```bash
# Supprimer l'ancien remote
git remote remove origin

# Ajouter le nouveau
git remote add origin https://github.com/VOTRE_USERNAME/REPO.git
```

### Erreur: "Authentication failed"

- Vérifiez que vous utilisez un Personal Access Token (pas votre mot de passe)
- Vérifiez que le token a les permissions `repo`

### Erreur: "Repository not found"

- Vérifiez que le repository existe sur GitHub
- Vérifiez que vous avez les bonnes permissions
- Vérifiez l'URL du remote: `git remote -v`

