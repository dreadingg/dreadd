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
            // Remove target="_blank" and other external attributes
            if (link.target === '_blank' || link.target === '_new') {
                link.target = '_self';
                link.removeAttribute('rel');
            }
            
            // Add click interceptor
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
