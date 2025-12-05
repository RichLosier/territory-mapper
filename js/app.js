// ═══════════════════════════════════════════════════════════════
// APP.JS - Initialisation application principale
// ═══════════════════════════════════════════════════════════════

/**
 * Point d'entrée principal de l'application
 * Initialise tous les modules et gère le cycle de vie de l'app
 */

// État global de l'application
const AppState = {
    initialized: false,
    mapsApiLoaded: false,
    placesApiLoaded: false,
    currentMap: null,
    apiKeys: {
        maps: null,
        places: null
    }
};

/**
 * Initialise l'application au chargement de la page
 */
function initApp() {
    console.log('🚀 Initialisation TerritoryPro...');
    
    // Configuration automatique de la clé API (si fournie)
    const defaultApiKey = 'AIzaSyA21ef6cszYLyn22AiihKOkLa9ss0EIEDQ';
    const savedKeys = Storage.get('apiKeys');
    
    // Si aucune clé n'est sauvegardée, utiliser la clé par défaut
    if (!savedKeys || (!savedKeys.maps && !savedKeys.places)) {
        console.log('🔑 Configuration automatique de la clé API...');
        Storage.set('apiKeys', {
            maps: defaultApiKey,
            places: defaultApiKey
        });
        AppState.apiKeys.maps = defaultApiKey;
        AppState.apiKeys.places = defaultApiKey;
    }
    
    // Charger les clés API depuis localStorage
    loadApiKeys();
    
    // Initialiser l'interface utilisateur
    initUI();
    
    // Initialiser le module reps
    initReps();
    
    // Si les clés API sont déjà configurées, charger Google Maps
    if (AppState.apiKeys.maps) {
        loadGoogleMaps();
    } else {
        // Afficher message pour configurer les clés API
        showToast('⚠️ Configurez vos clés API dans les paramètres pour commencer', 'warning');
    }
    
    AppState.initialized = true;
    console.log('✅ Application initialisée');
}

/**
 * Charge les clés API depuis localStorage
 */
function loadApiKeys() {
    const savedKeys = Storage.get('apiKeys');
    if (savedKeys) {
        AppState.apiKeys.maps = savedKeys.maps || null;
        AppState.apiKeys.places = savedKeys.places || null;
        console.log('📝 Clés API chargées depuis localStorage');
    }
}

/**
 * Charge l'API Google Maps avec la clé configurée
 */
function loadGoogleMaps() {
    if (!AppState.apiKeys.maps) {
        console.error('❌ Clé API Google Maps non configurée');
        return;
    }
    
    if (AppState.mapsApiLoaded) {
        console.log('✅ Google Maps API déjà chargée');
        return;
    }
    
    console.log('📡 Chargement Google Maps API...');
    
    // Afficher spinner de chargement
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
    
    // Créer script tag pour charger Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${AppState.apiKeys.maps}&libraries=places,geometry,drawing&callback=onGoogleMapsLoaded`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
        console.error('❌ Erreur lors du chargement de Google Maps API');
        showToast('❌ Erreur lors du chargement de Google Maps. Vérifiez votre clé API.', 'error');
        if (spinner) spinner.style.display = 'none';
    };
    
    document.head.appendChild(script);
}

/**
 * Callback appelé quand Google Maps API est chargée
 * Cette fonction doit être globale pour être accessible par le callback
 */
window.onGoogleMapsLoaded = function() {
    console.log('✅ Google Maps API chargée avec succès');
    AppState.mapsApiLoaded = true;
    
    // Masquer spinner
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
    
    // Initialiser la carte
    initMap();
};

/**
 * Initialise la carte Google Maps
 */
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('❌ Container map introuvable');
        return;
    }
    
    // Centre par défaut: Toronto, Canada
    const defaultCenter = { lat: 43.6532, lng: -79.3832 };
    
    // Créer la carte
    AppState.currentMap = new google.maps.Map(mapContainer, {
        center: defaultCenter,
        zoom: 10,
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
    });
    
    console.log('🗺️ Carte Google Maps initialisée');
    
    // Écouter les événements de la carte
    AppState.currentMap.addListener('bounds_changed', () => {
        // Sera utilisé pour lazy loading des markers dans phases suivantes
    });
}

/**
 * Initialise l'interface utilisateur (modals, boutons, etc.)
 */
function initUI() {
    // Settings modal
    const btnSettings = document.getElementById('btn-settings');
    const btnCloseSettings = document.getElementById('btn-close-settings');
    const modalSettings = document.getElementById('modal-settings');
    
    if (btnSettings) {
        btnSettings.addEventListener('click', () => {
            openModal('modal-settings');
            // Charger les valeurs actuelles dans les inputs
            const mapsKeyInput = document.getElementById('input-maps-key');
            const placesKeyInput = document.getElementById('input-places-key');
            
            // Charger depuis AppState ou localStorage
            const savedKeys = Storage.get('apiKeys') || AppState.apiKeys;
            
            if (mapsKeyInput && savedKeys.maps) {
                mapsKeyInput.value = savedKeys.maps;
            }
            if (placesKeyInput && savedKeys.places) {
                placesKeyInput.value = savedKeys.places;
            }
        });
    }
    
    if (btnCloseSettings) {
        btnCloseSettings.addEventListener('click', () => {
            closeModal('modal-settings');
        });
    }
    
    // Help modal
    const btnHelp = document.getElementById('btn-help');
    const btnCloseHelp = document.getElementById('btn-close-help');
    
    if (btnHelp) {
        btnHelp.addEventListener('click', () => {
            openModal('modal-help');
        });
    }
    
    if (btnCloseHelp) {
        btnCloseHelp.addEventListener('click', () => {
            closeModal('modal-help');
        });
    }
    
    // Settings tabs
    initSettingsTabs();
    
    // Settings API keys actions
    initSettingsApiKeys();
    
    console.log('✅ Interface utilisateur initialisée');
}

/**
 * Initialise les tabs des paramètres
 */
function initSettingsTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Désactiver tous les tabs
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.style.display = 'none';
            });
            
            // Activer le tab sélectionné
            btn.classList.add('active');
            const targetContent = document.getElementById(`tab-${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
                targetContent.style.display = 'block';
            }
        });
    });
}

/**
 * Initialise les actions des clés API dans les paramètres
 */
function initSettingsApiKeys() {
    // Toggle show/hide password
    const btnToggleMaps = document.getElementById('btn-toggle-maps-key');
    const btnTogglePlaces = document.getElementById('btn-toggle-places-key');
    const inputMaps = document.getElementById('input-maps-key');
    const inputPlaces = document.getElementById('input-places-key');
    
    if (btnToggleMaps && inputMaps) {
        btnToggleMaps.addEventListener('click', () => {
            const type = inputMaps.type === 'password' ? 'text' : 'password';
            inputMaps.type = type;
            btnToggleMaps.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
    
    if (btnTogglePlaces && inputPlaces) {
        btnTogglePlaces.addEventListener('click', () => {
            const type = inputPlaces.type === 'password' ? 'text' : 'password';
            inputPlaces.type = type;
            btnTogglePlaces.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
    
    // Test connections
    const btnTestMaps = document.getElementById('btn-test-maps-key');
    const btnTestPlaces = document.getElementById('btn-test-places-key');
    
    if (btnTestMaps) {
        btnTestMaps.addEventListener('click', () => {
            testMapsApiKey();
        });
    }
    
    if (btnTestPlaces) {
        btnTestPlaces.addEventListener('click', () => {
            testPlacesApiKey();
        });
    }
    
    // Save keys
    const btnSaveKeys = document.getElementById('btn-save-keys');
    if (btnSaveKeys) {
        btnSaveKeys.addEventListener('click', () => {
            saveApiKeys();
        });
    }
    
    // Clear keys
    const btnClearKeys = document.getElementById('btn-clear-keys');
    if (btnClearKeys) {
        btnClearKeys.addEventListener('click', () => {
            clearApiKeys();
        });
    }
    
    // Use same key button
    const btnUseSameKey = document.getElementById('btn-use-same-key');
    if (btnUseSameKey && inputMaps && inputPlaces) {
        btnUseSameKey.addEventListener('click', () => {
            const mapsKey = inputMaps.value.trim();
            if (mapsKey) {
                inputPlaces.value = mapsKey;
                showToast('✅ Même clé appliquée pour Places API', 'success');
            } else {
                showToast('⚠️ Entrez d\'abord une clé Maps', 'warning');
            }
        });
    }
    
    // Auto-fill Places avec Maps si Maps change et Places est vide
    if (inputMaps && inputPlaces) {
        inputMaps.addEventListener('blur', () => {
            const mapsKey = inputMaps.value.trim();
            const placesKey = inputPlaces.value.trim();
            if (mapsKey && !placesKey) {
                // Suggérer d'utiliser la même clé
                const btnUseSame = document.getElementById('btn-use-same-key');
                if (btnUseSame) {
                    btnUseSame.style.display = 'inline-block';
                }
            }
        });
    }
}

/**
 * Teste la clé API Google Maps
 */
function testMapsApiKey() {
    const input = document.getElementById('input-maps-key');
    const status = document.getElementById('status-maps-key');
    
    if (!input || !status) return;
    
    const key = input.value.trim();
    
    if (!key) {
        updateStatus(status, 'error', 'Veuillez entrer une clé API');
        return;
    }
    
    updateStatus(status, 'testing', 'Test en cours...');
    
    // Test simple: essayer de charger une petite portion de l'API
    const testScript = document.createElement('script');
    testScript.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry&callback=onMapsApiTest`;
    testScript.async = true;
    testScript.defer = true;
    
    window.onMapsApiTest = function() {
        updateStatus(status, 'success', '✅ Connexion réussie');
        testScript.remove();
        delete window.onMapsApiTest;
    };
    
    testScript.onerror = () => {
        updateStatus(status, 'error', '❌ Clé API invalide ou erreur de connexion');
        testScript.remove();
    };
    
    document.head.appendChild(testScript);
}

/**
 * Teste la clé API Google Places
 */
function testPlacesApiKey() {
    const input = document.getElementById('input-places-key');
    const status = document.getElementById('status-places-key');
    
    if (!input || !status) return;
    
    const key = input.value.trim();
    
    if (!key) {
        updateStatus(status, 'error', 'Veuillez entrer une clé API');
        return;
    }
    
    updateStatus(status, 'testing', 'Test en cours...');
    
    // Test avec une requête Places API simple
    fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=toronto&key=${key}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
                updateStatus(status, 'success', '✅ Connexion réussie');
            } else if (data.status === 'REQUEST_DENIED') {
                updateStatus(status, 'error', '❌ Clé API invalide ou non autorisée');
            } else {
                updateStatus(status, 'error', `❌ Erreur: ${data.status}`);
            }
        })
        .catch(error => {
            console.error('Erreur test Places API:', error);
            updateStatus(status, 'error', '❌ Erreur de connexion');
        });
}

/**
 * Met à jour l'affichage du status
 */
function updateStatus(statusElement, type, message) {
    if (!statusElement) return;
    
    statusElement.className = `status-indicator ${type}`;
    const statusText = statusElement.querySelector('.status-text');
    if (statusText) {
        statusText.textContent = message;
    }
}

/**
 * Enregistre les clés API
 */
function saveApiKeys() {
    const mapsKey = document.getElementById('input-maps-key')?.value.trim() || null;
    let placesKey = document.getElementById('input-places-key')?.value.trim() || null;
    
    if (!mapsKey) {
        showToast('⚠️ La clé Maps API est requise', 'warning');
        return;
    }
    
    // Si Places est vide, utiliser la même clé que Maps
    if (!placesKey) {
        placesKey = mapsKey;
        const placesInput = document.getElementById('input-places-key');
        if (placesInput) {
            placesInput.value = mapsKey;
        }
    }
    
    // Sauvegarder dans l'état et localStorage
    AppState.apiKeys.maps = mapsKey;
    AppState.apiKeys.places = placesKey;
    
    Storage.set('apiKeys', {
        maps: mapsKey,
        places: placesKey
    });
    
    showToast('✅ Clés API enregistrées', 'success');
    
    // Si Maps API n'était pas chargée et qu'on a maintenant une clé, la charger
    if (mapsKey && !AppState.mapsApiLoaded) {
        loadGoogleMaps();
    }
}

/**
 * Efface les clés API
 */
function clearApiKeys() {
    if (!confirm('Êtes-vous sûr de vouloir effacer les clés API ?')) {
        return;
    }
    
    AppState.apiKeys.maps = null;
    AppState.apiKeys.places = null;
    Storage.remove('apiKeys');
    
    // Réinitialiser les inputs
    const mapsInput = document.getElementById('input-maps-key');
    const placesInput = document.getElementById('input-places-key');
    if (mapsInput) mapsInput.value = '';
    if (placesInput) placesInput.value = '';
    
    // Réinitialiser les status
    const mapsStatus = document.getElementById('status-maps-key');
    const placesStatus = document.getElementById('status-places-key');
    if (mapsStatus) updateStatus(mapsStatus, '', 'Non configuré');
    if (placesStatus) updateStatus(placesStatus, '', 'Non configuré');
    
    showToast('🗑️ Clés API effacées', 'success');
}

// Initialiser l'app quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

