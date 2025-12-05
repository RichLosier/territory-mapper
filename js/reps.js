// ═══════════════════════════════════════════════════════════════
// REPS.JS - Gestion CRUD des représentants
// ═══════════════════════════════════════════════════════════════

/**
 * Gestion complète des représentants (reps)
 * CRUD: Create, Read, Update, Delete
 */

// État global des reps
const RepsState = {
    reps: [],
    selectedRep: null,
    nextId: 1
};

// Couleurs de territoire disponibles (pastels)
const TERRITORY_COLORS = [
    { name: 'Mint', value: '#d4f4dd' },
    { name: 'Lavender', value: '#e5d4f7' },
    { name: 'Peach', value: '#ffe4d6' },
    { name: 'Sky', value: '#d6eaff' },
    { name: 'Rose', value: '#ffd6e7' },
    { name: 'Lemon', value: '#fff9d6' },
    { name: 'Coral', value: '#ffd4d4' },
    { name: 'Sage', value: '#d6f4e8' },
    { name: 'Lilac', value: '#ead6f4' },
    { name: 'Amber', value: '#fff3d6' },
    { name: 'Teal', value: '#d6f4f4' },
    { name: 'Blush', value: '#f4d6e8' }
];

/**
 * Initialise le module reps
 */
function initReps() {
    console.log('👤 Initialisation module reps...');
    
    // Charger les reps depuis localStorage
    loadReps();
    
    // Initialiser l'interface
    initRepsUI();
    
    // Rendre la sidebar
    renderRepsList();
    
    console.log(`✅ Module reps initialisé (${RepsState.reps.length} reps)`);
}

/**
 * Charge les reps depuis localStorage
 */
function loadReps() {
    const savedReps = Storage.get('reps', []);
    RepsState.reps = savedReps;
    
    // Calculer le prochain ID
    if (RepsState.reps.length > 0) {
        const maxId = Math.max(...RepsState.reps.map(r => r.id || 0));
        RepsState.nextId = maxId + 1;
    }
}

/**
 * Sauvegarde les reps dans localStorage
 */
function saveReps() {
    Storage.set('reps', RepsState.reps);
}

/**
 * Crée un nouveau rep
 * @param {Object} repData - Données du rep {name, email, region, color, photo}
 * @returns {Object} Le rep créé avec ID
 */
function createRep(repData) {
    const rep = {
        id: RepsState.nextId++,
        name: repData.name || '',
        email: repData.email || '',
        region: repData.region || 'Ontario',
        color: repData.color || TERRITORY_COLORS[0].value,
        photo: repData.photo || null,
        initials: repData.initials || getInitials(repData.name),
        territory: null, // Polygone du territoire (sera ajouté dans phase suivante)
        clients: [], // Clients existants
        assignedDealers: [], // Dealers attribués
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    RepsState.reps.push(rep);
    saveReps();
    
    console.log('✅ Rep créé:', rep);
    showToast(`✅ ${rep.name} ajouté`, 'success');
    
    return rep;
}

/**
 * Met à jour un rep existant
 * @param {number} repId - ID du rep
 * @param {Object} updates - Données à mettre à jour
 */
function updateRep(repId, updates) {
    const rep = RepsState.reps.find(r => r.id === repId);
    if (!rep) {
        console.error('Rep introuvable:', repId);
        return null;
    }
    
    // Mettre à jour les champs
    Object.assign(rep, updates);
    rep.updatedAt = new Date().toISOString();
    
    // Mettre à jour les initiales si le nom change
    if (updates.name) {
        rep.initials = getInitials(updates.name);
    }
    
    saveReps();
    renderRepsList();
    
    console.log('✅ Rep mis à jour:', rep);
    showToast(`✅ ${rep.name} mis à jour`, 'success');
    
    return rep;
}

/**
 * Supprime un rep
 * @param {number} repId - ID du rep
 */
function deleteRep(repId) {
    const rep = RepsState.reps.find(r => r.id === repId);
    if (!rep) {
        console.error('Rep introuvable:', repId);
        return false;
    }
    
    const index = RepsState.reps.findIndex(r => r.id === repId);
    RepsState.reps.splice(index, 1);
    
    saveReps();
    renderRepsList();
    
    // Si c'était le rep sélectionné, désélectionner
    if (RepsState.selectedRep === repId) {
        RepsState.selectedRep = null;
    }
    
    console.log('✅ Rep supprimé:', rep.name);
    showToast(`✅ ${rep.name} supprimé`, 'success');
    
    return true;
}

/**
 * Récupère un rep par ID
 * @param {number} repId - ID du rep
 * @returns {Object|null}
 */
function getRep(repId) {
    return RepsState.reps.find(r => r.id === repId) || null;
}

/**
 * Récupère tous les reps
 * @returns {Array}
 */
function getAllReps() {
    return RepsState.reps;
}

/**
 * Génère les initiales à partir d'un nom
 * @param {string} name - Nom complet
 * @returns {string} Initiales (2-3 lettres)
 */
function getInitials(name) {
    if (!name) return '??';
    
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        // Prénom + Nom: "GV"
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0].length >= 2) {
        // Un seul mot: prendre les 2 premières lettres
        return parts[0].substring(0, 2).toUpperCase();
    }
    return '??';
}

/**
 * Génère un avatar SVG avec initiales
 * @param {string} initials - Initiales
 * @param {string} color - Couleur de fond
 * @returns {string} SVG string
 */
function generateAvatarSVG(initials, color) {
    const size = 80;
    return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/>
            <text x="${size/2}" y="${size/2}" font-family="Inter, sans-serif" font-size="${size/3}" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
        </svg>
    `;
}

/**
 * Initialise l'interface utilisateur pour les reps
 */
function initRepsUI() {
    // Bouton "Add Rep"
    const btnAddRep = document.getElementById('btn-add-rep');
    if (btnAddRep) {
        btnAddRep.addEventListener('click', () => {
            openAddRepModal();
        });
    }
    
    // Créer la modal Add Rep si elle n'existe pas
    createAddRepModal();
}

/**
 * Crée la modal pour ajouter/éditer un rep
 */
function createAddRepModal() {
    // Vérifier si la modal existe déjà
    if (document.getElementById('modal-add-rep')) {
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'modal-add-rep';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modal-add-rep-title">+ Ajouter un Représentant</h2>
                <button class="btn-icon btn-close" id="btn-close-add-rep" aria-label="Fermer">
                    ✕
                </button>
            </div>
            <div class="modal-body">
                <form id="form-add-rep">
                    <div class="form-group">
                        <label for="input-rep-name">Nom *</label>
                        <input 
                            type="text" 
                            id="input-rep-name" 
                            class="form-input"
                            placeholder="Ex: Guillaume Verret"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="input-rep-email">Email</label>
                        <input 
                            type="email" 
                            id="input-rep-email" 
                            class="form-input"
                            placeholder="Ex: g.verret@wex.com"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="select-rep-region">Région</label>
                        <select id="select-rep-region" class="form-input">
                            <option value="Ontario">Ontario</option>
                            <option value="Québec">Québec</option>
                            <option value="Alberta">Alberta</option>
                            <option value="Colombie-Britannique">Colombie-Britannique</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Couleur du Territoire</label>
                        <div class="color-picker" id="color-picker">
                            ${TERRITORY_COLORS.map((color, index) => `
                                <button 
                                    type="button" 
                                    class="color-option ${index === 0 ? 'selected' : ''}" 
                                    data-color="${color.value}"
                                    style="background-color: ${color.value};"
                                    title="${color.name}"
                                ></button>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Photo (optionnel)</label>
                        <div class="photo-upload">
                            <input 
                                type="file" 
                                id="input-rep-photo" 
                                accept="image/*"
                                style="display: none;"
                            >
                            <div class="photo-preview" id="photo-preview">
                                <div class="photo-placeholder">
                                    <span>📷</span>
                                    <p>Cliquez pour uploader</p>
                                </div>
                            </div>
                            <button type="button" class="btn-secondary btn-small" id="btn-upload-photo">
                                Choisir une photo
                            </button>
                            <button type="button" class="btn-secondary btn-small" id="btn-use-initials" style="display: none;">
                                Utiliser initiales
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="btn-cancel-add-rep">
                            Annuler
                        </button>
                        <button type="submit" class="btn-primary" id="btn-submit-add-rep">
                            Créer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    const btnClose = document.getElementById('btn-close-add-rep');
    const btnCancel = document.getElementById('btn-cancel-add-rep');
    const form = document.getElementById('form-add-rep');
    const btnUploadPhoto = document.getElementById('btn-upload-photo');
    const inputPhoto = document.getElementById('input-rep-photo');
    const btnUseInitials = document.getElementById('btn-use-initials');
    const colorOptions = modal.querySelectorAll('.color-option');
    
    // Fermer modal
    if (btnClose) btnClose.addEventListener('click', () => closeModal('modal-add-rep'));
    if (btnCancel) btnCancel.addEventListener('click', () => closeModal('modal-add-rep'));
    
    // Sélection couleur
    colorOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            colorOptions.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // Upload photo
    if (btnUploadPhoto && inputPhoto) {
        btnUploadPhoto.addEventListener('click', () => {
            inputPhoto.click();
        });
        
        inputPhoto.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = document.getElementById('photo-preview');
                    preview.innerHTML = `
                        <img src="${event.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                    `;
                    btnUseInitials.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Utiliser initiales
    if (btnUseInitials) {
        btnUseInitials.addEventListener('click', () => {
            const preview = document.getElementById('photo-preview');
            const nameInput = document.getElementById('input-rep-name');
            const initials = getInitials(nameInput.value || '??');
            preview.innerHTML = `
                <div class="photo-placeholder" style="background: var(--accent); color: white;">
                    <span style="font-size: 24px; font-weight: 600;">${initials}</span>
                </div>
            `;
            inputPhoto.value = '';
            btnUseInitials.style.display = 'none';
        });
    }
    
    // Soumettre formulaire
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            submitRepForm();
        });
    }
}

/**
 * Ouvre la modal pour ajouter un rep
 */
function openAddRepModal() {
    const modal = document.getElementById('modal-add-rep');
    if (!modal) {
        createAddRepModal();
    }
    
    // Réinitialiser le formulaire
    const form = document.getElementById('form-add-rep');
    if (form) form.reset();
    
    const title = document.getElementById('modal-add-rep-title');
    if (title) title.textContent = '+ Ajouter un Représentant';
    
    // Réinitialiser la preview photo
    const preview = document.getElementById('photo-preview');
    if (preview) {
        preview.innerHTML = `
            <div class="photo-placeholder">
                <span>📷</span>
                <p>Cliquez pour uploader</p>
            </div>
        `;
    }
    
    // Sélectionner première couleur par défaut
    const firstColor = document.querySelector('.color-option');
    if (firstColor) {
        document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        firstColor.classList.add('selected');
    }
    
    openModal('modal-add-rep');
    
    // Focus sur le premier input
    const nameInput = document.getElementById('input-rep-name');
    if (nameInput) nameInput.focus();
}

/**
 * Soumet le formulaire d'ajout de rep
 */
function submitRepForm() {
    const name = document.getElementById('input-rep-name')?.value.trim();
    const email = document.getElementById('input-rep-email')?.value.trim();
    const region = document.getElementById('select-rep-region')?.value || 'Ontario';
    const selectedColor = document.querySelector('.color-option.selected')?.getAttribute('data-color') || TERRITORY_COLORS[0].value;
    const photoInput = document.getElementById('input-rep-photo');
    
    if (!name) {
        showToast('⚠️ Le nom est requis', 'warning');
        return;
    }
    
    // Récupérer la photo si uploadée
    let photo = null;
    const preview = document.getElementById('photo-preview');
    if (preview && preview.querySelector('img')) {
        photo = preview.querySelector('img').src;
    }
    
    const repData = {
        name,
        email,
        region,
        color: selectedColor,
        photo
    };
    
    const rep = createRep(repData);
    
    // Fermer la modal
    closeModal('modal-add-rep');
    
    // Réinitialiser le formulaire
    const form = document.getElementById('form-add-rep');
    if (form) form.reset();
    
    // Rendre la liste mise à jour
    renderRepsList();
    
    // Activer mode draw territory
    if (AppState.currentMap) {
        setTimeout(() => {
            startDrawingTerritory(rep.id);
        }, 500);
    } else {
        showToast(`✅ ${rep.name} créé. Dessinez son territoire une fois la carte chargée.`, 'success');
    }
}

/**
 * Rend la liste des reps dans la sidebar
 */
function renderRepsList() {
    const container = document.getElementById('reps-list-container');
    if (!container) return;
    
    const sidebarContent = container;
    
    if (RepsState.reps.length === 0) {
        sidebarContent.innerHTML = `
            <div class="empty-state">
                <p>👤 Aucun représentant pour le moment.</p>
                <p class="text-small">Cliquez sur "+ Add Rep" pour commencer.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    RepsState.reps.forEach(rep => {
        const avatarSrc = rep.photo || `data:image/svg+xml,${encodeURIComponent(generateAvatarSVG(rep.initials, rep.color))}`;
        const clientsCount = rep.clients ? rep.clients.length : 0;
        const dealersCount = rep.assignedDealers ? rep.assignedDealers.length : 0;
        
        html += `
            <div class="rep-card" data-rep-id="${rep.id}">
                <div class="rep-card-header">
                    <input type="checkbox" class="rep-visibility-toggle" checked data-rep-id="${rep.id}">
                    <div class="rep-card-color" style="background-color: ${rep.color};"></div>
                    <img src="${avatarSrc}" alt="${rep.name}" class="rep-card-avatar" onerror="this.src='assets/placeholder-avatar.svg'">
                    <div class="rep-card-info">
                        <h3 class="rep-card-name">${escapeHtml(rep.name)}</h3>
                        <p class="rep-card-region">${escapeHtml(rep.region)}</p>
                    </div>
                </div>
                <div class="rep-card-stats">
                    <span>📊 ${clientsCount} clients</span>
                    <span>🚗 ${dealersCount} dealers</span>
                </div>
                <div class="rep-card-actions" style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="btn-secondary btn-small" data-action="edit" data-rep-id="${rep.id}">
                        ✏️ Éditer
                    </button>
                    <button class="btn-secondary btn-small" data-action="focus" data-rep-id="${rep.id}">
                        🎯 Focus
                    </button>
                    <button class="btn-danger btn-small" data-action="delete" data-rep-id="${rep.id}">
                        🗑️ Supprimer
                    </button>
                </div>
            </div>
        `;
    });
    
    sidebarContent.innerHTML = html;
    
    // Event listeners pour les actions
    sidebarContent.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.getAttribute('data-action');
            const repId = parseInt(btn.getAttribute('data-rep-id'));
            
            switch(action) {
                case 'edit':
                    editRep(repId);
                    break;
                case 'focus':
                    focusRepOnMap(repId);
                    break;
                case 'delete':
                    deleteRepWithConfirm(repId);
                    break;
            }
        });
    });
    
    // Event listeners pour visibility toggle
    sidebarContent.querySelectorAll('.rep-visibility-toggle').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const repId = parseInt(checkbox.getAttribute('data-rep-id'));
            toggleRepVisibility(repId, checkbox.checked);
        });
    });
}

/**
 * Édite un rep
 */
function editRep(repId) {
    const rep = getRep(repId);
    if (!rep) return;
    
    // TODO: Ouvrir modal d'édition (similaire à add)
    showToast('Fonctionnalité d\'édition à venir', 'info');
}

/**
 * Focus sur un rep sur la carte
 */
function focusRepOnMap(repId) {
    const rep = getRep(repId);
    if (!rep || !AppState.currentMap) return;
    
    if (rep.territory && rep.territory.length > 0) {
        selectTerritory(repId);
    } else {
        // Si pas de territoire, centrer sur Toronto par défaut
        AppState.currentMap.setCenter({ lat: 43.6532, lng: -79.3832 });
        AppState.currentMap.setZoom(10);
        showToast(`${rep.name} n'a pas encore de territoire défini`, 'info');
    }
}

/**
 * Supprime un rep avec confirmation
 */
function deleteRepWithConfirm(repId) {
    const rep = getRep(repId);
    if (!rep) return;
    
    const clientsCount = rep.clients ? rep.clients.length : 0;
    const dealersCount = rep.assignedDealers ? rep.assignedDealers.length : 0;
    
    const message = `Supprimer ${rep.name}?\n\n` +
                   `Clients: ${clientsCount}\n` +
                   `Dealers attribués: ${dealersCount}`;
    
    if (confirm(message)) {
        deleteRep(repId);
    }
}

/**
 * Toggle la visibilité d'un rep sur la carte
 */
function toggleRepVisibility(repId, visible) {
    // TODO: Afficher/cacher le territoire et markers du rep sur la carte
    console.log(`Toggle visibility rep ${repId}: ${visible}`);
}

