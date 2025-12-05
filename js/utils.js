// ═══════════════════════════════════════════════════════════════
// UTILS.JS - Fonctions utilitaires générales
// ═══════════════════════════════════════════════════════════════

/**
 * Fonctions utilitaires réutilisables dans toute l'application
 */

/**
 * Affiche une notification toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type de toast: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Durée d'affichage en ms (défaut: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) {
        console.warn('Toast container introuvable');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Suppression après durée
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * Ouvre une modal
 * @param {string} modalId - ID de la modal à ouvrir
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal ${modalId} introuvable`);
        return;
    }
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Empêcher scroll du body
    document.body.style.overflow = 'hidden';
    
    // Focus sur premier élément focusable
    const firstInput = modal.querySelector('input, button, textarea, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

/**
 * Ferme une modal
 * @param {string} modalId - ID de la modal à fermer
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    
    // Restaurer scroll du body
    document.body.style.overflow = '';
}

/**
 * Ferme toutes les modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
}

/**
 * Calcule la distance entre deux points (formule Haversine)
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance en kilomètres
 */
function calculateDistance(point1, point2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Convertit degrés en radians
 * @param {number} degrees
 * @returns {number}
 */
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Formate un nombre avec séparateurs de milliers
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    return num.toLocaleString('fr-CA');
}

/**
 * Formate une date en format lisible
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Formate une date avec heure
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateTime(date) {
    const d = new Date(date);
    return d.toLocaleString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Temps d'attente en ms
 * @returns {Function}
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle une fonction
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Limite en ms
 * @returns {Function}
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Génère un ID unique
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Valide une adresse email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valide un code postal canadien
 * @param {string} postal
 * @returns {boolean}
 */
function isValidPostalCode(postal) {
    const re = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return re.test(postal);
}

/**
 * Normalise un code postal (enlève espaces, met en majuscules)
 * @param {string} postal
 * @returns {string}
 */
function normalizePostalCode(postal) {
    return postal.replace(/\s+/g, '').toUpperCase();
}

/**
 * Échappe les caractères HTML pour éviter XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Fermer modals avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Fermer modals en cliquant sur overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            closeModal(modal.id);
        }
    }
});

