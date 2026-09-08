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

// =============================================
// ===== EXTERNAL TAB BLOCKER =====
// =============================================
(function() {
    'use strict';

    // 1. BLOCK window.open() - stops popups/tabs
    const originalOpen = window.open;
    window.open = function(url, name, specs) {
        console.warn('🛡️ Blocked: window.open() to', url);
        const iframe = document.getElementById('mirror-iframe');
        if (iframe && url) {
            iframe.src = url;
        } else if (url) {
            window.location.href = url;
        }
        return null;
    };

    // 2. FORCE all links to open in the same page
    function fixLinks() {
        document.querySelectorAll('a').forEach(function(link) {
            if (link.target === '_blank' || link.target === '_new') {
                link.target = '_self';
                link.removeAttribute('rel');
            }
            link.addEventListener('click', function(e) {
                const iframe = document.getElementById('mirror-iframe');
                if (iframe && this.href) {
                    e.preventDefault();
                    iframe.src = this.href;
                }
            });
        });
    }

    // 3. BLOCK middle-click (opens new tab)
    document.addEventListener('auxclick', function(e) {
        if (e.button === 1) {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                e.stopPropagation();
                const iframe = document.getElementById('mirror-iframe');
                if (iframe) {
                    iframe.src = link.href;
                } else {
                    window.location.href = link.href;
                }
                return false;
            }
        }
    }, true);

    // 4. BLOCK Ctrl+Click (opens new tab)
    document.addEventListener('click', function(e) {
        if (e.ctrlKey || e.metaKey) {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                e.stopPropagation();
                const iframe = document.getElementById('mirror-iframe');
                if (iframe) {
                    iframe.src = link.href;
                } else {
                    window.location.href = link.href;
                }
                return false;
            }
        }
    }, true);

    // 5. BLOCK Shift+Click (opens new window)
    document.addEventListener('click', function(e) {
        if (e.shiftKey) {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                e.stopPropagation();
                const iframe = document.getElementById('mirror-iframe');
                if (iframe) {
                    iframe.src = link.href;
                } else {
                    window.location.href = link.href;
                }
                return false;
            }
        }
    }, true);

    // 6. WATCH for new links added dynamically
    const observer = new MutationObserver(function() {
        fixLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 7. OVERRIDE any attempt to set target="_blank"
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if (name === 'target' && (value === '_blank' || value === '_new')) {
            console.warn('🛡️ Blocked: setting target="' + value + '"');
            return originalSetAttribute.call(this, 'target', '_self');
        }
        return originalSetAttribute.call(this, name, value);
    };

    // 8. OVERRIDE target property directly
    Object.defineProperty(HTMLAnchorElement.prototype, 'target', {
        get: function() {
            return this.getAttribute('target') || '';
        },
        set: function(value) {
            if (value === '_blank' || value === '_new') {
                console.warn('🛡️ Blocked: setting target="' + value + '"');
                this.setAttribute('target', '_self');
            } else {
                this.setAttribute('target', value);
            }
        }
    });

    // 9. RUN on page load
    document.addEventListener('DOMContentLoaded', fixLinks);

    console.log('🛡️ Mirror: External tab blocker active');
})();

// =============================================
// ===== LOAD SETTINGS ON PAGE START =====
// =============================================
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

console.log('📦 Settings Manager + Tab Blocker loaded');
