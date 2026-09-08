// =============================================
// ===== AD BLOCKER =====
// =============================================
(function() {
    'use strict';

    const adKeywords = [
        'ad', 'advertisement', 'sponsored', 'promotion', 'promo',
        'banner', 'popup', 'pop-up', 'advert', 'advertising',
        'google ads', 'adsense', 'doubleclick', 'amazon-ads',
        'taboola', 'outbrain', 'criteo', 'adnxs', 'adzerk',
        'analytics', 'tracking', 'pixel', 'affiliate',
        'buy now', 'free money', 'click here', 'limited offer',
        'sponsored content', 'promoted', 'recommended for you'
    ];

    let adBlockedCount = 0;

    function blockAds() {
        adBlockedCount = 0;
        document.querySelectorAll('*').forEach(function(el) {
            let isAd = false;
            let reason = '';

            // Check class names
            if (el.className && typeof el.className === 'string') {
                const classLower = el.className.toLowerCase();
                adKeywords.forEach(function(keyword) {
                    if (classLower.includes(keyword)) {
                        isAd = true;
                        reason = 'class contains "' + keyword + '"';
                    }
                });
            }

            // Check id
            if (el.id && typeof el.id === 'string') {
                const idLower = el.id.toLowerCase();
                adKeywords.forEach(function(keyword) {
                    if (idLower.includes(keyword)) {
                        isAd = true;
                        reason = 'id contains "' + keyword + '"';
                    }
                });
            }

            // Check inner text (short elements only)
            if (el.innerText && el.innerText.length < 100) {
                const textLower = el.innerText.toLowerCase();
                adKeywords.forEach(function(keyword) {
                    if (textLower.includes(keyword) && el.innerText.length < 80) {
                        isAd = true;
                        reason = 'text contains "' + keyword + '"';
                    }
                });
            }

            // Check image src for ad domains
            if (el.tagName === 'IMG' && el.src) {
                const srcLower = el.src.toLowerCase();
                const adDomains = ['doubleclick', 'googleads', 'adserver', 'adnxs', 'amazon-ads'];
                adDomains.forEach(function(domain) {
                    if (srcLower.includes(domain)) {
                        isAd = true;
                        reason = 'src contains "' + domain + '"';
                    }
                });
            }

            // Check for ad label elements
            if (el.innerText && el.innerText.toLowerCase().includes('ad') && el.innerText.length < 30) {
                if (el.innerText.trim() === 'ad' || el.innerText.trim() === 'advertisement' || 
                    el.innerText.trim() === 'sponsored' || el.innerText.trim() === 'promotion') {
                    if (el.parentElement) {
                        isAd = true;
                        reason = 'ad label detected';
                    }
                }
            }

            if (isAd && el.parentElement && !el.dataset.adBlocked) {
                el.dataset.adBlocked = 'true';
                el.style.display = 'none';
                adBlockedCount++;
                console.log('🛡️ Ad blocked:', reason);
            }
        });

        console.log('🛡️ Blocked ' + adBlockedCount + ' ad(s)');
        return adBlockedCount;
    }

    function resetAds() {
        document.querySelectorAll('[data-adBlocked]').forEach(function(el) {
            el.dataset.adBlocked = '';
            el.style.display = '';
        });
        adBlockedCount = 0;
        console.log('🔄 Ads reset');
    }

    // Run after page loads
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(blockAds, 800);
    });

    // Also run when new content is added
    const adObserver = new MutationObserver(function() {
        blockAds();
    });
    adObserver.observe(document.body, { childList: true, subtree: true });

    // Expose for manual use
    window.blockAds = blockAds;
    window.resetAds = resetAds;

    console.log('🛡️ Ad blocker active');
})();

// =============================================
// ===== SETTINGS MANAGER (localStorage) =====
// =============================================

function saveSettings() {
    try {
        let currentTheme = 'dark';
        document.querySelectorAll('.theme-option').forEach(el => {
            if (el.classList.contains('active')) {
                currentTheme = el.dataset.theme;
            }
        });
        
        let currentBg = 'pipes';
        document.querySelectorAll('.bg-option').forEach(el => {
            if (el.classList.contains('active')) {
                currentBg = el.dataset.bg;
            }
        });
        
        let currentCursor = 'default';
        document.querySelectorAll('.cursor-option').forEach(el => {
            if (el.classList.contains('active')) {
                currentCursor = el.dataset.cursor;
            }
        });
        
        localStorage.setItem('mirror_theme', currentTheme);
        localStorage.setItem('mirror_background', currentBg);
        localStorage.setItem('mirror_cursor', currentCursor);
        
        console.log('✅ Settings saved');
    } catch (e) {
        console.warn('Could not save settings:', e);
    }
}

function loadSettings() {
    try {
        if (document.readyState === 'loading') {
            setTimeout(loadSettings, 100);
            return;
        }
        
        const savedTheme = localStorage.getItem('mirror_theme');
        if (savedTheme) {
            const themeEl = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
            if (themeEl && typeof setTheme === 'function') {
                setTheme(savedTheme, themeEl);
            }
        }
        
        const savedBg = localStorage.getItem('mirror_background');
        if (savedBg && typeof setBackground === 'function') {
            const bgEl = document.querySelector(`.bg-option[data-bg="${savedBg}"]`);
            if (bgEl) {
                setBackground(savedBg, bgEl);
            }
        }
        
        const savedCursor = localStorage.getItem('mirror_cursor');
        if (savedCursor && typeof setCursor === 'function') {
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

    window.open = function(url) {
        const iframe = document.getElementById('mirror-iframe');
        if (iframe && url) iframe.src = url;
        else if (url) window.location.href = url;
        return null;
    };

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

    document.addEventListener('auxclick', function(e) {
        if (e.button === 1) {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                e.stopPropagation();
                const iframe = document.getElementById('mirror-iframe');
                if (iframe) iframe.src = link.href;
                else window.location.href = link.href;
                return false;
            }
        }
    }, true);

    document.addEventListener('click', function(e) {
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            const link = e.target.closest('a');
            if (link && link.href) {
                e.preventDefault();
                e.stopPropagation();
                const iframe = document.getElementById('mirror-iframe');
                if (iframe) iframe.src = link.href;
                else window.location.href = link.href;
                return false;
            }
        }
    }, true);

    const observer = new MutationObserver(function() {
        fixLinks();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if (name === 'target' && (value === '_blank' || value === '_new')) {
            return originalSetAttribute.call(this, 'target', '_self');
        }
        return originalSetAttribute.call(this, name, value);
    };

    Object.defineProperty(HTMLAnchorElement.prototype, 'target', {
        get: function() { return this.getAttribute('target') || ''; },
        set: function(value) {
            this.setAttribute('target', (value === '_blank' || value === '_new') ? '_self' : value);
        }
    });

    document.addEventListener('DOMContentLoaded', fixLinks);
    console.log('🛡️ Tab blocker active');
})();

// ==========================================================
// ===== oh lalala you are my hero oh lalalala woaaaaah =====
// ==========================================================
