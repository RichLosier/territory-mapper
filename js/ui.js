// ═══════════════════════════════════════════════════════════════
// UI.JS - Gestion interface utilisateur (modals, toasts, etc.)
// ═══════════════════════════════════════════════════════════════

/**
 * Gestion de l'interface utilisateur
 * Modals, toasts, loading states, etc.
 */

// Les fonctions principales sont déjà dans utils.js (showToast, openModal, closeModal)
// Ce fichier contiendra les fonctions UI spécifiques dans les phases suivantes

// Pour l'instant, on ajoute juste les styles CSS pour les toasts
const toastStyles = `
<style>
.toast-container {
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    gap: 12px;
    pointer-events: none;
}

.toast {
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 300px;
    max-width: 500px;
    opacity: 0;
    transform: translateX(400px);
    transition: all 0.3s ease;
    pointer-events: auto;
}

.toast.show {
    opacity: 1;
    transform: translateX(0);
}

.toast-success {
    background: var(--success);
    color: white;
}

.toast-error {
    background: var(--danger);
    color: white;
}

.toast-warning {
    background: var(--warning);
    color: white;
}

.toast-info {
    background: var(--accent);
    color: white;
}

.toast-icon {
    font-size: 20px;
    flex-shrink: 0;
}

.toast-message {
    flex: 1;
    font-size: var(--font-size-body);
    font-weight: 500;
}
</style>
`;

// Injecter les styles si pas déjà présents
if (!document.getElementById('toast-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'toast-styles';
    styleEl.innerHTML = toastStyles;
    document.head.appendChild(styleEl);
}

