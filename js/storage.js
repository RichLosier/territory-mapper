// ═══════════════════════════════════════════════════════════════
// STORAGE.JS - Gestion localStorage avec compression
// ═══════════════════════════════════════════════════════════════

/**
 * Wrapper pour localStorage avec gestion de la compression
 * et vérification des limites de quota
 */

const Storage = {
    /**
     * Taille maximale recommandée pour localStorage (5MB)
     */
    MAX_SIZE: 5 * 1024 * 1024,
    
    /**
     * Vérifie si localStorage est disponible
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Calcule la taille approximative utilisée dans localStorage
     * @returns {number} Taille en bytes
     */
    getUsedSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    },
    
    /**
     * Vérifie si on approche de la limite
     * @returns {boolean}
     */
    isNearLimit() {
        return this.getUsedSize() > this.MAX_SIZE * 0.9;
    },
    
    /**
     * Sauvegarde une valeur dans localStorage
     * @param {string} key - Clé de stockage
     * @param {*} value - Valeur à sauvegarder (sera JSON.stringify)
     */
    set(key, value) {
        if (!this.isAvailable()) {
            console.warn('localStorage non disponible');
            return false;
        }
        
        try {
            const json = JSON.stringify(value);
            const size = json.length + key.length;
            
            // Vérifier si on dépasse la limite
            if (this.getUsedSize() + size > this.MAX_SIZE) {
                console.warn('⚠️ localStorage presque plein. Exportez une sauvegarde.');
                showToast('⚠️ Stockage presque plein. Exportez une sauvegarde.', 'warning');
                
                // TODO: Implémenter compression avec LZ-String dans phase suivante
                // Pour l'instant, on sauvegarde quand même mais on avertit
            }
            
            localStorage.setItem(key, json);
            return true;
        } catch (e) {
            console.error('Erreur lors de la sauvegarde:', e);
            if (e.name === 'QuotaExceededError') {
                showToast('❌ Stockage plein. Exportez des données ou effacez des données anciennes.', 'error');
            }
            return false;
        }
    },
    
    /**
     * Récupère une valeur depuis localStorage
     * @param {string} key - Clé de stockage
     * @param {*} defaultValue - Valeur par défaut si la clé n'existe pas
     * @returns {*} Valeur désérialisée ou defaultValue
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable()) {
            return defaultValue;
        }
        
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (e) {
            console.error('Erreur lors de la lecture:', e);
            return defaultValue;
        }
    },
    
    /**
     * Supprime une clé de localStorage
     * @param {string} key - Clé à supprimer
     */
    remove(key) {
        if (!this.isAvailable()) return;
        
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Erreur lors de la suppression:', e);
        }
    },
    
    /**
     * Efface tout le localStorage
     */
    clear() {
        if (!this.isAvailable()) return;
        
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Erreur lors du nettoyage:', e);
        }
    },
    
    /**
     * Exporte toutes les données en JSON
     * @returns {string} JSON stringifié
     */
    exportAll() {
        const data = {};
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (e) {
                    // Si ce n'est pas du JSON, garder comme string
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        return JSON.stringify(data, null, 2);
    },
    
    /**
     * Importe des données depuis un JSON
     * @param {string} jsonString - JSON stringifié
     * @param {boolean} merge - Si true, merge avec données existantes (défaut: false = remplace tout)
     */
    importAll(jsonString, merge = false) {
        if (!this.isAvailable()) {
            console.error('localStorage non disponible');
            return false;
        }
        
        try {
            const data = JSON.parse(jsonString);
            
            if (!merge) {
                this.clear();
            }
            
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    this.set(key, data[key]);
                }
            }
            
            return true;
        } catch (e) {
            console.error('Erreur lors de l\'import:', e);
            return false;
        }
    }
};

