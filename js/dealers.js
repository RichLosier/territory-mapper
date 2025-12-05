// ═══════════════════════════════════════════════════════════════
// DEALERS.JS - Gestion des dealers (scan Places API)
// ═══════════════════════════════════════════════════════════════

/**
 * Gestion des dealers automobiles
 * Scan Google Places API par région
 */

// État des dealers
const DealersState = {
    dealers: [],
    markers: new Map(), // Map<placeId, google.maps.Marker>
    currentRegion: null,
    lastScan: null,
    scanning: false
};

// Coordonnées des régions (centres et bounds)
const REGIONS = {
    'Ontario': {
        center: { lat: 43.6532, lng: -79.3832 }, // Toronto
        bounds: {
            north: 56.0,
            south: 41.0,
            east: -74.0,
            west: -95.0
        },
        cities: ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor', 'Kitchener', 'Mississauga', 'Brampton', 'Markham', 'Vaughan']
    },
    'Québec': {
        center: { lat: 45.5017, lng: -73.5673 }, // Montréal
        bounds: {
            north: 51.0,
            south: 45.0,
            east: -64.0,
            west: -80.0
        },
        cities: ['Montréal', 'Québec', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Lévis', 'Trois-Rivières', 'Terrebonne']
    }
};

// Données mockées de dealers pour preview
const MOCK_DEALERS_ONTARIO = [
    { name: 'Honda Downtown Toronto', address: '789 Yonge St, Toronto', lat: 43.6532, lng: -79.3832, rating: 4.5, reviews: 234, phone: '(416) 555-1234', placeId: 'mock_1' },
    { name: 'Toyota Scarborough', address: '1230 Markham Rd, Scarborough', lat: 43.7764, lng: -79.2318, rating: 4.8, reviews: 567, phone: '(416) 555-5678', placeId: 'mock_2' },
    { name: 'Ford Mississauga', address: '456 Hurontario St, Mississauga', lat: 43.5890, lng: -79.6441, rating: 4.3, reviews: 189, phone: '(905) 555-9999', placeId: 'mock_3' },
    { name: 'Mazda Ottawa', address: '789 Bank St, Ottawa', lat: 45.3499, lng: -75.6948, rating: 4.6, reviews: 312, phone: '(613) 555-1111', placeId: 'mock_4' },
    { name: 'Nissan Brampton', address: '123 Main St, Brampton', lat: 43.7315, lng: -79.7624, rating: 4.4, reviews: 278, phone: '(905) 555-2222', placeId: 'mock_5' },
    { name: 'Hyundai Hamilton', address: '456 King St E, Hamilton', lat: 43.2557, lng: -79.8711, rating: 4.7, reviews: 445, phone: '(905) 555-3333', placeId: 'mock_6' },
    { name: 'Kia London', address: '789 Wellington Rd, London', lat: 42.9849, lng: -81.2453, rating: 4.2, reviews: 156, phone: '(519) 555-4444', placeId: 'mock_7' },
    { name: 'Subaru Windsor', address: '123 Tecumseh Rd E, Windsor', lat: 42.3149, lng: -83.0369, rating: 4.9, reviews: 623, phone: '(519) 555-5555', placeId: 'mock_8' },
];

const MOCK_DEALERS_QUEBEC = [
    { name: 'Honda Montréal', address: '1230 rue Sherbrooke O, Montréal', lat: 45.5017, lng: -73.5673, rating: 4.6, reviews: 456, phone: '(514) 555-1234', placeId: 'mock_q1' },
    { name: 'Toyota Québec', address: '789 boulevard Laurier, Québec', lat: 46.8139, lng: -71.2080, rating: 4.7, reviews: 389, phone: '(418) 555-5678', placeId: 'mock_q2' },
    { name: 'Mazda Laval', address: '456 boulevard des Laurentides, Laval', lat: 45.6067, lng: -73.7123, rating: 4.5, reviews: 267, phone: '(450) 555-9999', placeId: 'mock_q3' },
    { name: 'Ford Longueuil', address: '123 rue Saint-Charles, Longueuil', lat: 45.5369, lng: -73.5103, rating: 4.4, reviews: 198, phone: '(450) 555-1111', placeId: 'mock_q4' },
    { name: 'Nissan Gatineau', address: '789 boulevard Maloney O, Gatineau', lat: 45.4765, lng: -75.7013, rating: 4.8, reviews: 534, phone: '(819) 555-2222', placeId: 'mock_q5' },
];

/**
 * Initialise le module dealers
 */
function initDealers() {
    console.log('🏢 Initialisation module dealers...');
    
    // Charger les dealers depuis localStorage
    loadDealers();
    
    // Rendre les markers si la carte est prête
    if (AppState.currentMap) {
        renderAllDealers();
    }
    
    console.log(`✅ Module dealers initialisé (${DealersState.dealers.length} dealers)`);
}

/**
 * Charge les dealers depuis localStorage
 */
function loadDealers() {
    const saved = Storage.get('dealers', {});
    DealersState.dealers = saved.dealers || [];
    DealersState.currentRegion = saved.region || null;
    DealersState.lastScan = saved.lastScan || null;
}

/**
 * Sauvegarde les dealers dans localStorage
 */
function saveDealers() {
    Storage.set('dealers', {
        dealers: DealersState.dealers,
        region: DealersState.currentRegion,
        lastScan: DealersState.lastScan
    });
}

/**
 * Sélectionne une région et charge les dealers
 * @param {string} region - 'Ontario' ou 'Québec'
 */
function selectRegion(region) {
    if (!REGIONS[region]) {
        console.error('❌ Région invalide:', region);
        showToast('⚠️ Région invalide', 'warning');
        return;
    }
    
    console.log('📍 Sélection de la région:', region);
    
    DealersState.currentRegion = region;
    
    // Vérifier que Google Maps API est chargée
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        console.warn('⚠️ Google Maps API non chargée, attente...');
        showToast('⚠️ Google Maps en cours de chargement...', 'info');
        
        // Attendre que Google Maps soit chargé
        const checkGoogleMaps = setInterval(() => {
            if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
                clearInterval(checkGoogleMaps);
                // Réessayer après que Google Maps soit chargé
                setTimeout(() => selectRegion(region), 100);
            }
        }, 100);
        
        // Timeout après 10 secondes
        setTimeout(() => {
            clearInterval(checkGoogleMaps);
            if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
                console.error('❌ Google Maps API toujours non disponible après 10 secondes');
                showToast('❌ Google Maps n\'est pas chargé. Rechargez la page.', 'error');
            }
        }, 10000);
        
        return;
    }
    
    // Centrer la carte sur la région
    if (AppState.currentMap) {
        const regionData = REGIONS[region];
        console.log('🗺️ Centrage de la carte sur:', regionData.center);
        AppState.currentMap.setCenter(regionData.center);
        AppState.currentMap.setZoom(8);
        
        // Attendre que la carte soit centrée AVANT de charger les dealers
        // Bug fix: Ne pas charger les dealers pendant l'animation
        google.maps.event.addListenerOnce(AppState.currentMap, 'idle', () => {
            console.log('✅ Carte centrée sur', region);
            // Maintenant que la carte est centrée, charger les dealers
            loadMockDealers(region);
            saveDealers();
            const dealerCount = DealersState.dealers.filter(d => d.region === region).length;
            showToast(`📍 Région ${region} sélectionnée - ${dealerCount} dealers`, 'success');
        });
    } else {
        console.warn('⚠️ Carte non disponible, attente...');
        // Si la carte n'est pas encore prête, attendre
        const checkMap = setInterval(() => {
            if (AppState.currentMap) {
                clearInterval(checkMap);
                // Réessayer avec la carte disponible
                selectRegion(region);
            }
        }, 100);
        
        // Timeout après 5 secondes
        setTimeout(() => {
            clearInterval(checkMap);
            if (!AppState.currentMap) {
                console.error('❌ Carte toujours non disponible après 5 secondes');
                showToast('⚠️ La carte n\'est pas encore chargée. Rechargez la page.', 'warning');
            }
        }, 5000);
    }
}

/**
 * Charge les dealers mockés pour preview
 * @param {string} region - Région sélectionnée
 */
function loadMockDealers(region) {
    const mockDealers = region === 'Ontario' ? MOCK_DEALERS_ONTARIO : MOCK_DEALERS_QUEBEC;
    
    // Filtrer pour ne garder que ceux de la région actuelle
    DealersState.dealers = DealersState.dealers.filter(d => d.region !== region);
    
    // Ajouter les dealers mockés
    mockDealers.forEach(dealer => {
        DealersState.dealers.push({
            ...dealer,
            region: region,
            status: 'available', // available, assigned
            assignedTo: null
        });
    });
    
    saveDealers();
    renderAllDealers();
}

/**
 * Rend tous les dealers sur la carte
 */
function renderAllDealers() {
    if (!AppState.currentMap) {
        console.warn('⚠️ Carte non disponible pour afficher les dealers');
        return;
    }
    
    console.log('🏢 Rendu des dealers...');
    console.log('📍 Région actuelle:', DealersState.currentRegion);
    console.log('📊 Total dealers:', DealersState.dealers.length);
    
    // Supprimer les anciens markers
    DealersState.markers.forEach(marker => marker.setMap(null));
    DealersState.markers.clear();
    
    // Filtrer par région actuelle
    const dealersToShow = DealersState.dealers.filter(d => 
        !DealersState.currentRegion || d.region === DealersState.currentRegion
    );
    
    console.log(`📍 ${dealersToShow.length} dealers à afficher pour ${DealersState.currentRegion || 'toutes régions'}`);
    
    if (dealersToShow.length === 0) {
        console.log('⚠️ Aucun dealer à afficher');
        return;
    }
    
    dealersToShow.forEach((dealer, index) => {
        try {
            renderDealerMarker(dealer);
        } catch (error) {
            console.error(`❌ Erreur lors du rendu du dealer ${index}:`, error);
        }
    });
    
    console.log(`✅ ${DealersState.markers.size} markers dealers affichés sur la carte`);
}

/**
 * Rend un marker dealer sur la carte
 * @param {Object} dealer - Dealer à afficher
 */
function renderDealerMarker(dealer) {
    if (!AppState.currentMap || !dealer.lat || !dealer.lng) return;
    
    // Couleur selon le statut
    let iconColor = '#9CA3AF'; // Gris par défaut (disponible)
    let iconSize = 24;
    
    if (dealer.status === 'assigned') {
        const rep = getRep(dealer.assignedTo);
        if (rep) {
            iconColor = rep.color;
            iconSize = 32;
        }
    } else if (dealer.status === 'available') {
        iconColor = '#EF4444'; // Rouge pour disponible dans territoire
        iconSize = 28;
    }
    
    // Créer une icône SVG personnalisée
    const iconSvg = `
        <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="${iconColor}" stroke="white" stroke-width="2"/>
            <text x="12" y="16" font-size="12" fill="white" text-anchor="middle" font-weight="bold">🚗</text>
        </svg>
    `;
    
    const icon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(iconSvg),
        scaledSize: new google.maps.Size(iconSize, iconSize),
        anchor: new google.maps.Point(iconSize/2, iconSize/2)
    };
    
    // Créer le marker
    const marker = new google.maps.Marker({
        map: AppState.currentMap,
        position: { lat: dealer.lat, lng: dealer.lng },
        icon: icon,
        title: dealer.name,
        animation: dealer.status === 'available' ? google.maps.Animation.DROP : null
    });
    
    // Info window
    const assignedInfo = dealer.assignedTo ? 
        `<p style="margin: 4px 0; font-size: 12px; color: #10b981;">✅ Attribué à: ${escapeHtml(getRep(dealer.assignedTo)?.name || 'Unknown')}</p>` : 
        `<p style="margin: 4px 0; font-size: 12px; color: #ef4444;">⚠️ Disponible</p>`;
    
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 12px; font-family: Inter, sans-serif; min-width: 250px;">
                <strong style="display: block; margin-bottom: 8px; font-size: 14px;">${escapeHtml(dealer.name)}</strong>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">📍 ${escapeHtml(dealer.address)}</p>
                <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                    <span style="color: #f59e0b;">⭐ ${dealer.rating}</span>
                    <span style="font-size: 11px; color: #999;">(${dealer.reviews} avis)</span>
                </div>
                ${dealer.phone ? `<p style="margin: 4px 0; font-size: 12px;">📞 ${escapeHtml(dealer.phone)}</p>` : ''}
                ${assignedInfo}
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button onclick="assignDealer('${dealer.placeId}')" style="padding: 6px 12px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Assigner
                    </button>
                </div>
            </div>
        `
    });
    
    marker.addListener('click', () => {
        infoWindow.open({
            anchor: marker,
            map: AppState.currentMap
        });
    });
    
    // Stocker le marker
    DealersState.markers.set(dealer.placeId, marker);
}

/**
 * Fonction globale pour assigner un dealer (appelée depuis info window)
 */
window.assignDealer = function(placeId) {
    console.log('Assign dealer:', placeId);
    showToast('Fonctionnalité d\'attribution à venir', 'info');
};

/**
 * Scan les dealers pour une région (mock pour l'instant)
 * @param {string} region - Région à scanner
 */
function scanDealersForRegion(region) {
    if (!REGIONS[region]) {
        showToast('⚠️ Région invalide', 'warning');
        return;
    }
    
    DealersState.scanning = true;
    showToast(`🔍 Scan des dealers ${region} en cours...`, 'info');
    
    // Simuler le scan
    setTimeout(() => {
        loadMockDealers(region);
        DealersState.scanning = false;
        DealersState.lastScan = new Date().toISOString();
        saveDealers();
        showToast(`✅ ${DealersState.dealers.filter(d => d.region === region).length} dealers trouvés en ${region}`, 'success');
    }, 1500);
}

