// ═══════════════════════════════════════════════════════════════
// CSV-UPLOAD.JS - Gestion upload CSV (UI seulement pour l'instant)
// ═══════════════════════════════════════════════════════════════

/**
 * Gestion de l'upload CSV
 * Pour l'instant: UI complète avec données mockées pour le design
 * Le parsing réel sera ajouté plus tard
 */

// Données mockées pour preview du design
const MOCK_MATCHED_DATA = [
    { rep: 'Guillaume Verret', client: 'Honda Capitale', address: '1730 Bank St, Ottawa', match: 'Honda Capitale Inc', confidence: 98 },
    { rep: 'Guillaume Verret', client: 'Toyota Downtown', address: '789 Yonge St, Toronto', match: 'Toyota Downtown', confidence: 100 },
    { rep: 'Thierry Larochelle', client: 'Mazda Ottawa', address: '456 Montreal Rd, Ottawa', match: 'Mazda Ottawa', confidence: 95 },
    { rep: 'Vincent Dionne', client: 'Auto Pro Plus', address: '789 boulevard Queen, Ottawa', match: 'Auto Pro Plus', confidence: 92 },
];

const MOCK_REVIEW_REQUIRED_DATA = [
    { rep: 'Guillaume Verret', client: 'ABC Motors', address: '123 rue Main, Toronto', match1: 'ABC Motors Inc', match2: 'ABC Auto', confidence1: 75, confidence2: 68 },
    { rep: 'Marc April', client: 'XYZ Garage', address: '456 avenue King, Markham', match1: 'XYZ Auto Service', match2: 'XYZ Motors', confidence1: 72, confidence2: 65 },
];

const MOCK_NO_MATCH_DATA = [
    { rep: 'Olivier Côté-Guy', client: 'New Dealer Co', address: '999 Unknown St, Mississauga', reason: 'Adresse introuvable' },
    { rep: 'Thierry Larochelle', client: 'Test Client', address: 'Invalid Address', reason: 'Format invalide' },
];

/**
 * Initialise le module CSV upload
 */
function initCsvUpload() {
    console.log('📤 Initialisation module CSV upload...');
    
    // Event listeners
    const btnUploadCsv = document.getElementById('btn-upload-csv');
    const btnUploadCsvSidebar = document.getElementById('btn-upload-csv-sidebar');
    const btnCloseUpload = document.getElementById('btn-close-upload-csv');
    const btnBrowseCsv = document.getElementById('btn-browse-csv');
    const inputCsvFile = document.getElementById('input-csv-file');
    const uploadZone = document.getElementById('upload-zone');
    
    // Ouvrir modal
    if (btnUploadCsv) {
        btnUploadCsv.addEventListener('click', () => openModal('modal-upload-csv'));
    }
    if (btnUploadCsvSidebar) {
        btnUploadCsvSidebar.addEventListener('click', () => openModal('modal-upload-csv'));
    }
    
    // Fermer modal
    if (btnCloseUpload) {
        btnCloseUpload.addEventListener('click', () => closeModal('modal-upload-csv'));
    }
    
    // Browse files
    if (btnBrowseCsv && inputCsvFile) {
        btnBrowseCsv.addEventListener('click', () => inputCsvFile.click());
    }
    
    // File input change
    if (inputCsvFile) {
        inputCsvFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFileSelect(file);
            }
        });
    }
    
    // Drag & drop
    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.name.endsWith('.csv')) {
                handleFileSelect(file);
            } else {
                showToast('⚠️ Veuillez uploader un fichier CSV', 'warning');
            }
        });
    }
    
    // Review matches modal
    initReviewMatchesModal();
    
    console.log('✅ Module CSV upload initialisé');
}

/**
 * Gère la sélection d'un fichier
 * @param {File} file - Fichier CSV sélectionné
 */
function handleFileSelect(file) {
    if (!file.name.endsWith('.csv')) {
        showToast('⚠️ Veuillez sélectionner un fichier CSV', 'warning');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showToast('⚠️ Le fichier est trop volumineux (max 10MB)', 'warning');
        return;
    }
    
    // Simuler le traitement
    simulateCsvProcessing(file);
}

/**
 * Simule le traitement CSV (pour preview du design)
 */
function simulateCsvProcessing(file) {
    const progressBar = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) progressBar.style.display = 'block';
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progressFill) progressFill.style.width = `${progress}%`;
        
        if (progress === 30) {
            if (progressText) progressText.textContent = 'Lecture du fichier...';
        } else if (progress === 60) {
            if (progressText) progressText.textContent = 'Géocodage des adresses...';
        } else if (progress === 90) {
            if (progressText) progressText.textContent = 'Matching avec dealers...';
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            if (progressText) progressText.textContent = 'Terminé!';
            
            setTimeout(() => {
                closeModal('modal-upload-csv');
                openReviewMatchesModal();
            }, 500);
        }
    }, 200);
}

/**
 * Initialise la modal Review Matches
 */
function initReviewMatchesModal() {
    const btnCloseReview = document.getElementById('btn-close-review-matches');
    const btnCancelReview = document.getElementById('btn-cancel-review');
    const btnConfirmReview = document.getElementById('btn-confirm-review');
    
    if (btnCloseReview) {
        btnCloseReview.addEventListener('click', () => closeModal('modal-review-matches'));
    }
    
    if (btnCancelReview) {
        btnCancelReview.addEventListener('click', () => {
            closeModal('modal-review-matches');
            showToast('Import annulé', 'info');
        });
    }
    
    if (btnConfirmReview) {
        btnConfirmReview.addEventListener('click', () => {
            confirmImport();
        });
    }
}

/**
 * Ouvre la modal Review Matches avec données mockées
 */
function openReviewMatchesModal() {
    const modal = document.getElementById('modal-review-matches');
    if (!modal) return;
    
    // Rendre les sections avec données mockées
    renderMatchedSection();
    renderReviewRequiredSection();
    renderNoMatchSection();
    
    openModal('modal-review-matches');
}

/**
 * Rend la section AUTO-MATCHED
 */
function renderMatchedSection() {
    const container = document.getElementById('review-matched-list');
    if (!container) return;
    
    let html = '';
    MOCK_MATCHED_DATA.forEach((item, index) => {
        html += `
            <div class="review-item matched">
                <div class="review-item-header">
                    <div class="review-item-info">
                        <strong>${escapeHtml(item.client)}</strong>
                        <p class="text-small">${escapeHtml(item.address)}</p>
                        <p class="text-small">Rep: ${escapeHtml(item.rep)}</p>
                    </div>
                    <div class="review-item-match">
                        <span class="match-badge success">✅ ${item.confidence}%</span>
                        <p class="text-small">Match: ${escapeHtml(item.match)}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Rend la section REVIEW REQUIRED
 */
function renderReviewRequiredSection() {
    const container = document.getElementById('review-required-list');
    if (!container) return;
    
    let html = '';
    MOCK_REVIEW_REQUIRED_DATA.forEach((item, index) => {
        html += `
            <div class="review-item required">
                <div class="review-item-header">
                    <div class="review-item-info">
                        <strong>${escapeHtml(item.client)}</strong>
                        <p class="text-small">${escapeHtml(item.address)}</p>
                        <p class="text-small">Rep: ${escapeHtml(item.rep)}</p>
                    </div>
                </div>
                <div class="review-item-options">
                    <label class="review-option">
                        <input type="radio" name="match-${index}" value="1" checked>
                        <div>
                            <strong>${escapeHtml(item.match1)}</strong>
                            <span class="match-badge warning">${item.confidence1}%</span>
                        </div>
                    </label>
                    <label class="review-option">
                        <input type="radio" name="match-${index}" value="2">
                        <div>
                            <strong>${escapeHtml(item.match2)}</strong>
                            <span class="match-badge warning">${item.confidence2}%</span>
                        </div>
                    </label>
                    <label class="review-option">
                        <input type="radio" name="match-${index}" value="none">
                        <div>
                            <strong>Aucun match</strong>
                            <span class="text-small">Créer comme nouveau client</span>
                        </div>
                    </label>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Rend la section NO MATCH FOUND
 */
function renderNoMatchSection() {
    const container = document.getElementById('review-no-match-list');
    if (!container) return;
    
    let html = '';
    MOCK_NO_MATCH_DATA.forEach((item, index) => {
        html += `
            <div class="review-item no-match">
                <div class="review-item-header">
                    <div class="review-item-info">
                        <strong>${escapeHtml(item.client)}</strong>
                        <p class="text-small">${escapeHtml(item.address)}</p>
                        <p class="text-small">Rep: ${escapeHtml(item.rep)}</p>
                    </div>
                    <div class="review-item-match">
                        <span class="match-badge error">❌ ${escapeHtml(item.reason)}</span>
                    </div>
                </div>
                <div class="review-item-actions">
                    <button class="btn-secondary btn-small" data-action="create-client">
                        Créer comme client
                    </button>
                    <button class="btn-secondary btn-small" data-action="skip">
                        Ignorer
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Confirme l'import
 */
function confirmImport() {
    closeModal('modal-review-matches');
    
    // Simuler l'import
    showToast('✅ 12 clients importés avec succès', 'success');
    
    // TODO: Ajouter les markers sur la carte (phase suivante)
    // Pour l'instant, juste un message
    setTimeout(() => {
        showToast('📍 Géocodage en cours... Les markers apparaîtront sur la carte', 'info');
    }, 1000);
}

