// Mark as Read - Content Script
(function() {
    'use strict';
    
    let readIndicator = null;
    let isRead = false;
    
    // URL normalization function - remove query parameters and fragments, keep only base URL
    function normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Keep only protocol, hostname, port, pathname, remove search and hash
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        } catch (error) {
            console.error('Failed to normalize URL:', error, url);
            return url; // Return original URL if parsing fails
        }
    }
    
    // Create read indicator
    function createReadIndicator() {
        if (readIndicator) {
            return;
        }
        
        readIndicator = document.createElement('div');
        readIndicator.id = 'mark-as-read-indicator';
        readIndicator.innerHTML = `
            <div class="indicator-content">
                <span class="indicator-icon">✅</span>
                <span class="indicator-text">READ</span>
            </div>
        `;
        
        document.body.appendChild(readIndicator);
    }
    
    // Remove read indicator
    function removeReadIndicator() {
        if (readIndicator) {
            readIndicator.remove();
            readIndicator = null;
        }
    }
    
    // Check if current URL is marked as read
    async function checkReadStatus() {
        try {
            const result = await chrome.storage.sync.get(['readUrls']);
            const readUrls = result.readUrls || {};
            const currentUrl = normalizeUrl(window.location.href);
            
            isRead = !!readUrls[currentUrl];
            updateIndicator();
            
        } catch (error) {
            console.error('Failed to check read status:', error);
        }
    }
    
    // Update indicator display
    function updateIndicator() {
        if (isRead) {
            createReadIndicator();
        } else {
            removeReadIndicator();
        }
    }
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateReadStatus') {
            isRead = request.isRead;
            updateIndicator();
        }
    });
    
    // Listen for URL changes (for SPA applications)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            checkReadStatus();
        }
    }).observe(document, { subtree: true, childList: true });
    
    // Check status after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkReadStatus);
    } else {
        checkReadStatus();
    }
    
})(); 