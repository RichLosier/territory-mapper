// ═══════════════════════════════════════════════════════════════
// TERRITORIES.JS - Gestion des territoires (polygones)
// ═══════════════════════════════════════════════════════════════

/**
 * Gestion des territoires (polygones) sur la carte
 * Draw, edit, delete territories
 */

// État du module territories
const TerritoriesState = {
    drawingMode: false,
    editingMode: false,
    currentRepId: null,
    currentPolygon: null,
    polygons: new Map(), // Map<repId, google.maps.Polygon>
    drawingManager: null
};

/**
 * Initialise le module territories
 */
function initTerritories() {
    console.log('🗺️ Initialisation module territories...');
    
    // Les territoires seront chargés depuis les reps
    // et rendus quand la carte est prête
    
    console.log('✅ Module territories initialisé');
}

/**
 * Active le mode dessin pour un rep
 * @param {number} repId - ID du rep
 */
function startDrawingTerritory(repId) {
    if (!AppState.currentMap) {
        showToast('⚠️ La carte n\'est pas encore chargée', 'warning');
        return;
    }
    
    const rep = getRep(repId);
    if (!rep) {
        console.error('Rep introuvable:', repId);
        return;
    }
    
    TerritoriesState.drawingMode = true;
    TerritoriesState.currentRepId = repId;
    
    // Créer le DrawingManager si pas encore créé
    if (!TerritoriesState.drawingManager) {
        TerritoriesState.drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: false,
            polygonOptions: {
                fillColor: rep.color,
                fillOpacity: 0.35,
                strokeColor: rep.color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                clickable: false,
                editable: false,
                zIndex: 1
            }
        });
        
        TerritoriesState.drawingManager.setMap(AppState.currentMap);
        
        // Écouter la fin du dessin
        google.maps.event.addListener(
            TerritoriesState.drawingManager,
            'overcomplete',
            (polygon) => {
                finishDrawingTerritory(polygon);
            }
        );
    }
    
    // Activer le mode dessin
    TerritoriesState.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    
    showToast(`👆 Cliquez sur la carte pour dessiner le territoire de ${rep.name}`, 'info');
    
    // Guide visuel
    const guide = document.createElement('div');
    guide.id = 'drawing-guide';
    guide.style.cssText = `
        position: absolute;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(66, 133, 244, 0.95);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 600;
        pointer-events: none;
    `;
    guide.textContent = `👆 Dessinez le territoire de ${rep.name} sur la carte`;
    document.getElementById('map-container').appendChild(guide);
}

/**
 * Termine le dessin d'un territoire
 * @param {google.maps.Polygon} polygon - Polygone dessiné
 */
function finishDrawingTerritory(polygon) {
    if (!TerritoriesState.currentRepId) return;
    
    const rep = getRep(TerritoriesState.currentRepId);
    if (!rep) return;
    
    // Extraire les coordonnées du polygone
    const path = polygon.getPath();
    const coordinates = [];
    
    path.forEach((latLng) => {
        coordinates.push({
            lat: latLng.lat(),
            lng: latLng.lng()
        });
    });
    
    // Sauvegarder le territoire dans le rep
    rep.territory = coordinates;
    updateRep(TerritoriesState.currentRepId, { territory: coordinates });
    
    // Créer un nouveau polygone avec les bonnes propriétés
    const territoryPolygon = new google.maps.Polygon({
        paths: coordinates,
        fillColor: rep.color,
        fillOpacity: 0.35,
        strokeColor: rep.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        clickable: true,
        editable: false,
        zIndex: 1
    });
    
    territoryPolygon.setMap(AppState.currentMap);
    
    // Stocker le polygone
    TerritoriesState.polygons.set(TerritoriesState.currentRepId, territoryPolygon);
    
    // Écouter les clics sur le polygone
    territoryPolygon.addListener('click', () => {
        selectTerritory(TerritoriesState.currentRepId);
    });
    
    // Désactiver le mode dessin
    TerritoriesState.drawingManager.setDrawingMode(null);
    TerritoriesState.drawingMode = false;
    
    // Supprimer le guide visuel
    const guide = document.getElementById('drawing-guide');
    if (guide) guide.remove();
    
    // Supprimer le polygone temporaire du DrawingManager
    polygon.setMap(null);
    
    showToast(`✅ Territoire de ${rep.name} créé`, 'success');
    
    TerritoriesState.currentRepId = null;
}

/**
 * Annule le dessin en cours
 */
function cancelDrawingTerritory() {
    if (TerritoriesState.drawingManager) {
        TerritoriesState.drawingManager.setDrawingMode(null);
    }
    
    TerritoriesState.drawingMode = false;
    TerritoriesState.currentRepId = null;
    
    const guide = document.getElementById('drawing-guide');
    if (guide) guide.remove();
}

/**
 * Charge et affiche tous les territoires sur la carte
 */
function renderAllTerritories() {
    if (!AppState.currentMap) return;
    
    const reps = getAllReps();
    
    reps.forEach(rep => {
        if (rep.territory && rep.territory.length > 0) {
            renderTerritory(rep);
        }
    });
}

/**
 * Rend un territoire sur la carte
 * @param {Object} rep - Rep avec territoire
 */
function renderTerritory(rep) {
    if (!AppState.currentMap || !rep.territory) return;
    
    // Supprimer l'ancien polygone si existe
    const existing = TerritoriesState.polygons.get(rep.id);
    if (existing) {
        existing.setMap(null);
    }
    
    // Créer le polygone
    const polygon = new google.maps.Polygon({
        paths: rep.territory,
        fillColor: rep.color,
        fillOpacity: 0.35,
        strokeColor: rep.color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        clickable: true,
        editable: false,
        zIndex: 1
    });
    
    polygon.setMap(AppState.currentMap);
    
    // Stocker le polygone
    TerritoriesState.polygons.set(rep.id, polygon);
    
    // Écouter les clics
    polygon.addListener('click', () => {
        selectTerritory(rep.id);
    });
}

/**
 * Sélectionne un territoire (highlight)
 * @param {number} repId - ID du rep
 */
function selectTerritory(repId) {
    const rep = getRep(repId);
    if (!rep) return;
    
    const polygon = TerritoriesState.polygons.get(repId);
    if (!polygon) return;
    
    // Highlight le polygone
    polygon.setOptions({
        strokeWeight: 4,
        strokeOpacity: 1,
        zIndex: 10
    });
    
    // Désélectionner les autres
    TerritoriesState.polygons.forEach((p, id) => {
        if (id !== repId) {
            p.setOptions({
                strokeWeight: 2,
                strokeOpacity: 0.8,
                zIndex: 1
            });
        }
    });
    
    RepsState.selectedRep = repId;
    
    // Centrer la carte sur le territoire
    const bounds = new google.maps.LatLngBounds();
    rep.territory.forEach(coord => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });
    AppState.currentMap.fitBounds(bounds);
    
    showToast(`Territoire de ${rep.name} sélectionné`, 'info');
}

/**
 * Supprime un territoire
 * @param {number} repId - ID du rep
 */
function deleteTerritory(repId) {
    const polygon = TerritoriesState.polygons.get(repId);
    if (polygon) {
        polygon.setMap(null);
        TerritoriesState.polygons.delete(repId);
    }
    
    const rep = getRep(repId);
    if (rep) {
        rep.territory = null;
        updateRep(repId, { territory: null });
    }
}

/**
 * Active le mode édition pour un territoire
 * @param {number} repId - ID du rep
 */
function editTerritory(repId) {
    const polygon = TerritoriesState.polygons.get(repId);
    if (!polygon) {
        showToast('⚠️ Aucun territoire à éditer', 'warning');
        return;
    }
    
    TerritoriesState.editingMode = true;
    polygon.setEditable(true);
    
    showToast('✏️ Mode édition activé. Déplacez les points pour modifier le territoire.', 'info');
    
    // Écouter les modifications
    polygon.getPath().addListener('set_at', () => {
        saveTerritoryChanges(repId, polygon);
    });
    
    polygon.getPath().addListener('insert_at', () => {
        saveTerritoryChanges(repId, polygon);
    });
}

/**
 * Sauvegarde les modifications d'un territoire
 * @param {number} repId - ID du rep
 * @param {google.maps.Polygon} polygon - Polygone modifié
 */
function saveTerritoryChanges(repId, polygon) {
    const path = polygon.getPath();
    const coordinates = [];
    
    path.forEach((latLng) => {
        coordinates.push({
            lat: latLng.lat(),
            lng: latLng.lng()
        });
    });
    
    const rep = getRep(repId);
    if (rep) {
        rep.territory = coordinates;
        updateRep(repId, { territory: coordinates });
    }
}

/**
 * Désactive le mode édition
 */
function stopEditingTerritory() {
    TerritoriesState.polygons.forEach(polygon => {
        polygon.setEditable(false);
    });
    
    TerritoriesState.editingMode = false;
}

