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
    
    // Initialiser le module CSV upload
    initCsvUpload();
    
    // Initialiser le module clients
    initClients();
    
    // Initialiser le module dealers
    initDealers();
    
    // Initialiser le sélecteur de région
    initRegionSelector();
    
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
        showToast('⚠️ Clé API Google Maps non configurée. Allez dans Settings.', 'warning');
        return;
    }
    
    if (AppState.mapsApiLoaded) {
        console.log('✅ Google Maps API déjà chargée');
        return;
    }
    
    console.log('📡 Chargement Google Maps API...');
    console.log('🔑 Clé API:', AppState.apiKeys.maps.substring(0, 20) + '...');
    
    // Afficher spinner de chargement
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
        spinner.querySelector('p').textContent = 'Chargement de la carte...';
    }
    
    // Vérifier que le callback global existe
    if (typeof window.onGoogleMapsLoaded === 'undefined') {
        window.onGoogleMapsLoaded = function() {
            console.log('✅ Google Maps API chargée avec succès');
            AppState.mapsApiLoaded = true;
            
            // Masquer spinner
            const spinner = document.getElementById('loading-spinner');
            if (spinner) {
                spinner.style.display = 'none';
            }
            
            // Vérifier que google.maps est disponible
            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                console.error('❌ google.maps non disponible après callback');
                showToast('❌ Erreur: Google Maps non disponible', 'error');
                return;
            }
            
            console.log('🗺️ Initialisation de la carte...');
            
            // Initialiser la carte
            initMap();
            
            // Vérifier que la carte a été créée
            if (!AppState.currentMap) {
                console.error('❌ La carte n\'a pas été créée');
                showToast('❌ Erreur lors de la création de la carte', 'error');
                return;
            }
            
            console.log('✅ Carte créée avec succès');
            
            // Initialiser les territoires
            initTerritories();
            
            // Rendre tous les territoires existants
            renderAllTerritories();
            
            // Rendre tous les clients existants
            renderAllClients();
            
            // Rendre tous les dealers existants
            renderAllDealers();
            
            // Sélectionner Ontario par défaut si aucune région
            if (!DealersState.currentRegion) {
                console.log('📍 Sélection automatique d\'Ontario...');
                setTimeout(() => {
                    selectRegion('Ontario');
                }, 500);
            } else {
                // Si région déjà sélectionnée, recharger les dealers
                console.log('📍 Région déjà sélectionnée:', DealersState.currentRegion);
                renderAllDealers();
            }
            
            // Ajouter des clients mockés pour preview (si aucun client)
            setTimeout(() => {
                addMockClients();
            }, 1000);
        };
    } else {
        console.log('⚠️ Callback onGoogleMapsLoaded existe déjà');
    }
    
    // Créer script tag pour charger Google Maps
    const script = document.createElement('script');
    const apiKey = AppState.apiKeys.maps;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry,drawing&callback=onGoogleMapsLoaded`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
        console.error('❌ Erreur lors du chargement de Google Maps API');
        console.error('Vérifiez que:');
        console.error('1. La clé API est valide');
        console.error('2. Maps JavaScript API est activée dans Google Cloud Console');
        console.error('3. Les restrictions HTTP referrers permettent votre domaine');
        showToast('❌ Erreur lors du chargement de Google Maps. Vérifiez la console (F12).', 'error');
        if (spinner) {
            spinner.style.display = 'none';
            spinner.querySelector('p').textContent = 'Erreur de chargement. Vérifiez la console.';
        }
    };
    
    script.onload = () => {
        console.log('📜 Script Google Maps chargé, attente du callback...');
    };
    
    document.head.appendChild(script);
    console.log('📝 Script tag ajouté au DOM');
}

// Le callback est maintenant défini dans loadGoogleMaps() pour éviter les problèmes de timing

/**
 * Initialise la carte Google Maps
 */
function initMap() {
    console.log('🗺️ Initialisation de la carte...');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('❌ Container map introuvable');
        showToast('❌ Erreur: Container map introuvable', 'error');
        return;
    }
    
    // Vérifier que Google Maps est chargé
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.error('❌ Google Maps API non chargée');
        showToast('❌ Google Maps API non chargée. Rechargez la page.', 'error');
        return;
    }
    
    console.log('✅ Google Maps API disponible');
    
    // Centre par défaut: Toronto, Canada
    const defaultCenter = { lat: 43.6532, lng: -79.3832 };
    
    try {
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
        
        console.log('✅ Carte Google Maps initialisée avec succès');
        showToast('✅ Carte chargée', 'success');
        
        // Écouter les événements de la carte
        AppState.currentMap.addListener('bounds_changed', () => {
            // Sera utilisé pour lazy loading des markers dans phases suivantes
        });
        
        // Écouter les erreurs de chargement de tiles
        AppState.currentMap.addListener('tilesloaded', () => {
            console.log('✅ Tiles de la carte chargées');
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de la carte:', error);
        showToast('❌ Erreur lors de la création de la carte. Vérifiez la console.', 'error');
    }
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
                // Tester automatiquement après avoir copié
                setTimeout(() => {
                    testPlacesApiKey();
                }, 300);
            } else {
                showToast('⚠️ Entrez d\'abord une clé Maps', 'warning');
            }
        });
    }
    
    // Auto-copier Maps key to Places si Places est vide quand Maps change
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
    
    let key = input.value.trim();
    
    // Si vide, utiliser la clé Maps
    if (!key) {
        const mapsKey = document.getElementById('input-maps-key')?.value.trim();
        if (mapsKey) {
            key = mapsKey;
            input.value = mapsKey;
            console.log('📋 Utilisation de la clé Maps pour Places');
        } else {
            updateStatus(status, 'error', 'Veuillez entrer une clé API');
            return;
        }
    }
    
    updateStatus(status, 'testing', 'Test en cours...');
    console.log('🧪 Test Places API avec clé:', key.substring(0, 20) + '...');
    
    // Test avec une requête Places API simple (Text Search)
    // Note: Cette API nécessite Places API d'être activée
    const testUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=car+dealership+toronto&key=${key}`;
    
    fetch(testUrl)
        .then(response => {
            console.log('📡 Réponse Places API:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📦 Données Places API:', data);
            
            if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
                updateStatus(status, 'success', '✅ Connexion réussie');
                console.log('✅ Places API fonctionne correctement');
            } else if (data.status === 'REQUEST_DENIED') {
                const errorMsg = data.error_message || '';
                let message = '❌ Places API non activée ou clé invalide';
                
                if (errorMsg.includes('API key not valid')) {
                    message = '❌ Clé API invalide';
                } else if (errorMsg.includes('This API project is not authorized')) {
                    message = '❌ Places API non activée. Activez-la dans Google Cloud Console.';
                } else if (errorMsg.includes('API key not valid. Please pass a valid API key')) {
                    message = '❌ Clé API invalide ou restrictions trop strictes';
                }
                
                updateStatus(status, 'error', message);
                console.error('❌ Places API erreur:', data.status, errorMsg);
                
                // Afficher un message d'aide
                showToast('💡 Activez Places API dans Google Cloud Console → APIs & Services → Library', 'warning');
            } else if (data.status === 'INVALID_REQUEST') {
                updateStatus(status, 'error', '❌ Requête invalide');
                console.error('❌ Requête invalide:', data.error_message);
            } else if (data.status === 'OVER_QUERY_LIMIT') {
                updateStatus(status, 'error', '⚠️ Quota dépassé');
                console.warn('⚠️ Quota Places API dépassé');
            } else {
                const errorMsg = data.error_message || '';
                updateStatus(status, 'error', `❌ Erreur: ${data.status}${errorMsg ? ' - ' + errorMsg : ''}`);
                console.error('❌ Erreur Places API:', data.status, errorMsg);
            }
        })
        .catch(error => {
            console.error('❌ Erreur réseau Places API:', error);
            updateStatus(status, 'error', '❌ Erreur de connexion. Vérifiez votre connexion internet.');
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

/**
 * Initialise le sélecteur de région
 */
function initRegionSelector() {
    const selectRegion = document.getElementById('select-region');
    const btnScanDealers = document.getElementById('btn-scan-dealers');
    const scanStatus = document.getElementById('scan-status');
    
    if (!selectRegion || !btnScanDealers || !scanStatus) return;
    
    // Charger la région sauvegardée
    if (DealersState.currentRegion) {
        selectRegion.value = DealersState.currentRegion;
        updateScanButton();
    }
    
    // Changer de région
    selectRegion.addEventListener('change', (e) => {
        const region = e.target.value;
        if (region) {
            selectRegion(region);
            updateScanButton();
        } else {
            DealersState.currentRegion = null;
            btnScanDealers.disabled = true;
            scanStatus.textContent = 'Aucune région sélectionnée';
        }
    });
    
    // Bouton scan
    btnScanDealers.addEventListener('click', () => {
        const region = selectRegion.value;
        if (region) {
            scanDealersForRegion(region);
        }
    });
    
    function updateScanButton() {
        const region = selectRegion.value;
        if (region) {
            btnScanDealers.disabled = false;
            const count = DealersState.dealers.filter(d => d.region === region).length;
            if (count > 0) {
                scanStatus.textContent = `${count} dealers en ${region}`;
            } else {
                scanStatus.textContent = `Prêt à scanner ${region}`;
            }
        }
    }
}

// Initialiser l'app quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

