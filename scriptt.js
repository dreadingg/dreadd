// =============================================
// ===== SETTINGS MANAGER (localStorage) =====
// =============================================

function saveSettings() {
    try {
        // Get current theme
        let currentTheme = 'dark';
        document.querySelectorAll('.theme-option').forEach(el => {
            if (el.classList.contains('active')) {
                currentTheme = el.dataset.theme;
            }
        });
        
        // Get current background
        let currentBg = 'pipes';
        document.querySelectorAll('.bg-option').forEach(el => {
            if (el.classList.contains('active')) {
                currentBg = el.dataset.bg;
            }
        });
        
        // Get current cursor
        let currentCursor = 'default';
        document.querySelectorAll('.cursor-option').forEach(el => {
            if (el.classList.contains('active')) {
                currentCursor = el.dataset.cursor;
            }
        });
        
        // Save to localStorage
        localStorage.setItem('mirror_theme', currentTheme);
        localStorage.setItem('mirror_background', currentBg);
        localStorage.setItem('mirror_cursor', currentCursor);
        
        console.log('✅ Settings saved:', { theme: currentTheme, bg: currentBg, cursor: currentCursor });
    } catch (e) {
        console.warn('Could not save settings:', e);
    }
}

function loadSettings() {
    try {
        // Load theme
        const savedTheme = localStorage.getItem('mirror_theme');
        if (savedTheme) {
            document.querySelectorAll('.theme-option').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.theme === savedTheme) {
                    el.classList.add('active');
                }
            });
            document.body.className = 'theme-' + savedTheme;
            // Update pipe colors
            if (typeof getThemeColor === 'function') {
                const color = getThemeColor();
                if (typeof pipes !== 'undefined') {
                    pipes.forEach(pipe => pipe.color = color);
                }
            }
        }
        
        // Load background
        const savedBg = localStorage.getItem('mirror_background');
        if (savedBg && typeof bgRenderers !== 'undefined') {
            document.querySelectorAll('.bg-option').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.bg === savedBg) {
                    el.classList.add('active');
                }
            });
            // Change background
            if (bgRenderers[savedBg]) {
                if (typeof bgAnimationId !== 'undefined' && bgAnimationId) {
                    cancelAnimationFrame(bgAnimationId);
                    bgAnimationId = null;
                }
                if (typeof currentBg !== 'undefined') {
                    currentBg = savedBg;
                }
                const canvas = document.getElementById('bgCanvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                if (bgRenderers[savedBg].init) {
                    bgRenderers[savedBg].init();
                }
                if (typeof renderBackground === 'function') {
                    renderBackground();
                }
            }
        }
        
        // Load cursor
        const savedCursor = localStorage.getItem('mirror_cursor');
        if (savedCursor && typeof setCursor === 'function') {
            document.querySelectorAll('.cursor-option').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.cursor === savedCursor) {
                    el.classList.add('active');
                }
            });
            const cursorEl = document.querySelector(`.cursor-option[data-cursor="${savedCursor}"]`);
            if (cursorEl) {
                setCursor(savedCursor, cursorEl);
            }
        }
        
        console.log('✅ Settings loaded');
    } catch (e) {
        console.warn('Could not load settings:', e);
    }
}

// ===== AUTO-SAVE on settings change =====
function saveAndApplyTheme(theme, el) {
    if (typeof setTheme === 'function') {
        setTheme(theme, el);
    }
    saveSettings();
}

function saveAndApplyBg(bg, el) {
    if (typeof setBackground === 'function') {
        setBackground(bg, el);
    }
    saveSettings();
}

function saveAndApplyCursor(cursor, el) {
    if (typeof setCursor === 'function') {
        setCursor(cursor, el);
    }
    saveSettings();
}

// ===== LOAD SETTINGS ON PAGE START =====
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadSettings, 100);
});

// ===== SAVE SETTINGS BEFORE CLOSING =====
window.addEventListener('beforeunload', saveSettings);

// ===== EXPOSE FUNCTIONS GLOBALLY =====
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
window.saveAndApplyTheme = saveAndApplyTheme;
window.saveAndApplyBg = saveAndApplyBg;
window.saveAndApplyCursor = saveAndApplyCursor;

console.log('📦 Settings Manager loaded');
