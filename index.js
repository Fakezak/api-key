// API Key & Secret Generator
class APIKeyGenerator {
    constructor() {
        this.history = [];
        this.maxHistory = 20;
        this.prefix = 'ZAKA';
        this.secretPrefix = 'SEC';
        this.alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        // Load history from localStorage
        this.loadHistory();
        this.renderHistory();
    }

    /**
     * Generate cryptographically secure random string
     */
    generateSecureString(length = 32) {
        let result = '';
        const randomValues = new Uint32Array(length);
        
        try {
            // Use Web Crypto API for secure randomness
            crypto.getRandomValues(randomValues);
            for (let i = 0; i < length; i++) {
                result += this.alphabet[randomValues[i] % this.alphabet.length];
            }
        } catch (error) {
            // Fallback for older browsers
            for (let i = 0; i < length; i++) {
                result += this.alphabet[Math.floor(Math.random() * this.alphabet.length)];
            }
        }
        
        return result;
    }

    /**
     * Generate API key
     */
    generateApiKey(length = 32) {
        const randomPart = this.generateSecureString(length);
        return `${this.prefix}_${randomPart}`;
    }

    /**
     * Generate Secret key
     */
    generateSecretKey(length = 40) {
        const randomPart = this.generateSecureString(length);
        return `${this.secretPrefix}_${randomPart}`;
    }

    /**
     * Generate both keys
     */
    generateKeys() {
        const length = parseInt(document.getElementById('keyLength').value) || 32;
        const secretLength = Math.min(length + 8, 48);
        
        const apiKey = this.generateApiKey(length);
        const secretKey = this.generateSecretKey(secretLength);
        
        // Update UI
        document.getElementById('apiKey').value = apiKey;
        document.getElementById('secretKey').value = secretKey;
        
        // Auto-copy if enabled
        if (document.getElementById('autoCopy').checked) {
            this.copyToClipboard('apiKey');
            setTimeout(() => this.copyToClipboard('secretKey'), 300);
        }
        
        // Add to history
        this.addToHistory(apiKey, secretKey);
        
        // Animation
        this.animateKeys();
        
        // Show toast
        this.showToast('✅ Keys generated successfully!', 'success');
        
        return { apiKey, secretKey };
    }

    /**
     * Copy to clipboard
     */
    copyToClipboard(elementId) {
        const input = document.getElementById(elementId);
        const value = input.value;
        
        if (!value) {
            this.showToast('⚠️ Generate keys first!', 'warning');
            return;
        }
        
        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(() => {
                this.showCopyFeedback(elementId);
                this.showToast('📋 Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopy(input);
            });
        } else {
            this.fallbackCopy(input);
        }
    }

    /**
     * Fallback copy method
     */
    fallbackCopy(input) {
        input.select();
        input.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            this.showCopyFeedback(input.id);
            this.showToast('📋 Copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('❌ Failed to copy', 'error');
        }
    }

    /**
     * Show copy feedback
     */
    showCopyFeedback(elementId) {
        const feedback = document.getElementById(`${elementId}CopyFeedback`);
        if (feedback) {
            feedback.classList.add('show');
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        }
    }

    /**
     * Add to history
     */
    addToHistory(apiKey, secretKey) {
        const entry = {
            apiKey,
            secretKey,
            timestamp: new Date().toLocaleString(),
            id: Date.now()
        };
        
        this.history.unshift(entry);
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }
        
        // Save to localStorage
        this.saveHistory();
        this.renderHistory();
    }

    /**
     * Render history
     */
    renderHistory() {
        const container = document.getElementById('historyList');
        const count = document.getElementById('historyCount');
        
        if (this.history.length === 0) {
            container.innerHTML = '<div class="empty-history">No keys generated yet</div>';
            count.textContent = '0 items';
            return;
        }
        
        container.innerHTML = this.history.map(entry => `
            <div class="history-item">
                <div class="keys">
                    <span class="api">📌 ${entry.apiKey}</span>
                    <span class="secret">🔐 ${entry.secretKey}</span>
                </div>
                <div class="meta">
                    <span>#${this.history.indexOf(entry) + 1}</span>
                    <span class="timestamp">${entry.timestamp}</span>
                </div>
            </div>
        `).join('');
        
        count.textContent = `${this.history.length} items`;
    }

    /**
     * Save history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('apiKeyHistory', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Could not save history:', error);
        }
    }

    /**
     * Load history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('apiKeyHistory');
            if (saved) {
                this.history = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('Could not load history:', error);
            this.history = [];
        }
    }

    /**
     * Clear history
     */
    clearHistory() {
        if (this.history.length === 0) {
            this.showToast('ℹ️ No history to clear', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear all history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.showToast('🗑️ History cleared', 'info');
        }
    }

    /**
     * Clear keys
     */
    clearKeys() {
        document.getElementById('apiKey').value = '';
        document.getElementById('secretKey').value = '';
        this.showToast('🧹 Keys cleared', 'info');
    }

    /**
     * Toggle secret visibility
     */
    toggleSecret() {
        const input = document.getElementById('secretKey');
        const show = document.getElementById('showSecret').checked;
        input.type = show ? 'text' : 'password';
    }

    /**
     * Animate keys
     */
    animateKeys() {
        const inputs = document.querySelectorAll('.key-display input');
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.style.transform = 'scale(0.98)';
                input.style.borderColor = '#667eea';
                setTimeout(() => {
                    input.style.transform = 'scale(1)';
                    setTimeout(() => {
                        input.style.borderColor = '#e0e0e0';
                    }, 300);
                }, 150);
            }, index * 100);
        });
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) {
            existing.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Auto remove after 2.5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    /**
     * Generate a single key (API only)
     */
    generateSingleKey(type = 'api', length = 32) {
        if (type === 'api') {
            return this.generateApiKey(length);
        } else {
            return this.generateSecretKey(length);
        }
    }

    /**
     * Validate key format
     */
    validateKey(key, type = 'api') {
        const prefix = type === 'api' ? this.prefix : this.secretPrefix;
        const pattern = new RegExp(`^${prefix}_[A-Z0-9]{32,48}$`);
        return pattern.test(key);
    }
}

// Initialize the generator
const generator = new APIKeyGenerator();

// Global functions for HTML onclick
function generateKeys() {
    generator.generateKeys();
}

function copyKey(elementId) {
    generator.copyToClipboard(elementId);
}

function clearKeys() {
    generator.clearKeys();
}

function clearHistory() {
    generator.clearHistory();
}

function toggleSecret() {
    generator.toggleSecret();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        generateKeys();
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        clearKeys();
    }
});

// Auto-generate on load (optional)
window.addEventListener('load', () => {
    // Generate initial keys after 500ms
    setTimeout(() => {
        generateKeys();
    }, 500);
});

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIKeyGenerator;
}

console.log('🔑 API Key Generator ready!');
console.log('📋 Press Ctrl+Enter to generate keys');
console.log('❌ Press Escape to clear keys');
