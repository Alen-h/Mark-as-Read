// Mark as Read - Background Script (Service Worker)

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

// Initialize when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Mark as Read extension installed');
    
    if (details.reason === 'install') {
        // Initialize storage on first install
        chrome.storage.sync.set({ readUrls: {} });
    }
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.readUrls) {
        console.log('Read URL list updated');
    }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getReadStatus':
            // Get read status for specified URL
            chrome.storage.sync.get(['readUrls']).then((result) => {
                const readUrls = result.readUrls || {};
                const normalizedUrl = normalizeUrl(request.url);
                const isRead = !!readUrls[normalizedUrl];
                sendResponse({ isRead });
            });
            return true; // Keep message channel open
            
        case 'markAsRead':
            // Mark URL as read
            chrome.storage.sync.get(['readUrls']).then((result) => {
                const readUrls = result.readUrls || {};
                const normalizedUrl = normalizeUrl(request.url);
                
                // If no title provided, try to get from sender tab
                let title = request.title || '';
                if (!title && sender.tab) {
                    title = sender.tab.title || '';
                }
                
                readUrls[normalizedUrl] = {
                    title: title,
                    timestamp: Date.now(),
                    domain: new URL(request.url).hostname,
                    originalUrl: request.url // Save original URL for reference
                };
                return chrome.storage.sync.set({ readUrls });
            }).then(() => {
                sendResponse({ success: true });
            }).catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'markAsUnread':
            // Unmark URL
            chrome.storage.sync.get(['readUrls']).then((result) => {
                const readUrls = result.readUrls || {};
                const normalizedUrl = normalizeUrl(request.url);
                delete readUrls[normalizedUrl];
                return chrome.storage.sync.set({ readUrls });
            }).then(() => {
                sendResponse({ success: true });
            }).catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
    }
});

// Check read status when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Can add automatic checking logic here
    }
}); 