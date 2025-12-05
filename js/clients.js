// ═══════════════════════════════════════════════════════════════
// CLIENTS.JS - Gestion des clients (markers sur carte)
// ═══════════════════════════════════════════════════════════════

/**
 * Gestion des clients existants
 * Markers bleus sur la carte avec avatars reps
 */

// État des clients
const ClientsState = {
    clients: [],
    markers: new Map() // Map<clientId, google.maps.Marker>
};

/**
 * Initialise le module clients
 */
function initClients() {
    console.log('👥 Initialisation module clients...');
    
    // Charger les clients depuis localStorage
    loadClients();
    
    // Rendre les markers si la carte est prête
    if (AppState.currentMap) {
        renderAllClients();
    }
    
    console.log(`✅ Module clients initialisé (${ClientsState.clients.length} clients)`);
}

/**
 * Charge les clients depuis localStorage
 */
function loadClients() {
    const savedClients = Storage.get('clients', []);
    ClientsState.clients = savedClients;
}

/**
 * Sauvegarde les clients dans localStorage
 */
function saveClients() {
    Storage.set('clients', ClientsState.clients);
}

/**
 * Ajoute un client
 * @param {Object} clientData - {repId, name, address, city, postal, phone, location}
 */
function addClient(clientData) {
    const client = {
        id: Date.now(),
        repId: clientData.repId,
        name: clientData.name || '',
        address: clientData.address || '',
        city: clientData.city || '',
        postal: clientData.postal || '',
        phone: clientData.phone || '',
        location: clientData.location || null, // {lat, lng}
        createdAt: new Date().toISOString()
    };
    
    ClientsState.clients.push(client);
    saveClients();
    
    // Rendre le marker sur la carte
    if (AppState.currentMap && client.location) {
        renderClientMarker(client);
    }
    
    return client;
}

/**
 * Rend tous les clients sur la carte
 */
function renderAllClients() {
    if (!AppState.currentMap) return;
    
    ClientsState.clients.forEach(client => {
        if (client.location) {
            renderClientMarker(client);
        }
    });
}

/**
 * Rend un marker client sur la carte
 * @param {Object} client - Client à afficher
 */
function renderClientMarker(client) {
    if (!AppState.currentMap || !client.location) return;
    
    const rep = getRep(client.repId);
    if (!rep) return;
    
    // Avatar du rep (mini)
    const avatarSrc = rep.photo || `data:image/svg+xml,${encodeURIComponent(generateAvatarSVG(rep.initials, rep.color))}`;
    
    // Créer une icône personnalisée
    const icon = {
        url: avatarSrc,
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
        origin: new google.maps.Point(0, 0)
    };
    
    // Créer le marker Google Maps (classique)
    const marker = new google.maps.Marker({
        map: AppState.currentMap,
        position: { lat: client.location.lat, lng: client.location.lng },
        icon: icon,
        title: `${client.name} - ${rep.name}`,
        animation: google.maps.Animation.DROP
    });
    
    // Info window
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 8px; font-family: Inter, sans-serif;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <img src="${avatarSrc}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" onerror="this.style.display='none'">
                    <strong>${escapeHtml(rep.name)}</strong>
                </div>
                <strong style="display: block; margin-bottom: 4px;">${escapeHtml(client.name)}</strong>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">${escapeHtml(client.address)}</p>
                <p style="margin: 4px 0; font-size: 12px; color: #666;">${escapeHtml(client.city)}, ${escapeHtml(client.postal)}</p>
                ${client.phone ? `<p style="margin: 4px 0; font-size: 12px;">📞 ${escapeHtml(client.phone)}</p>` : ''}
            </div>
        `
    });
    
    markerDiv.addEventListener('click', () => {
        infoWindow.open({
            anchor: marker,
            map: AppState.currentMap
        });
    });
    
    // Stocker le marker
    ClientsState.markers.set(client.id, marker);
}

/**
 * Ajoute des clients mockés pour preview (temporaire)
 */
function addMockClients() {
    if (ClientsState.clients.length > 0) return; // Ne pas ajouter si déjà des clients
    
    const mockClients = [
        {
            repId: RepsState.reps.length > 0 ? RepsState.reps[0].id : null,
            name: 'Honda Capitale',
            address: '1730 Bank St',
            city: 'Ottawa',
            postal: 'K1H 7Z9',
            phone: '(613) 555-1234',
            location: { lat: 45.3499, lng: -75.6948 }
        },
        {
            repId: RepsState.reps.length > 0 ? RepsState.reps[0].id : null,
            name: 'Toyota Downtown',
            address: '789 Yonge St',
            city: 'Toronto',
            postal: 'M5B 1L7',
            phone: '(416) 555-9999',
            location: { lat: 43.6532, lng: -79.3832 }
        }
    ];
    
    mockClients.forEach(clientData => {
        if (clientData.repId) {
            addClient(clientData);
        }
    });
}

