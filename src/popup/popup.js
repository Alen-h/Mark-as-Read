document.addEventListener('DOMContentLoaded', async function() {
    const statusDiv = document.getElementById('status');
    const statusText = document.getElementById('statusText');
    const titleDisplay = document.getElementById('titleDisplay');
    const urlDisplay = document.getElementById('urlDisplay');
    const actionButton = document.getElementById('actionButton');
    const totalReadSpan = document.getElementById('totalRead');
    
    let currentUrl = '';
    let currentTitle = '';
    let normalizedUrl = '';
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
    
    // Get current active tab URL
    async function getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }
    
    // Get read URLs list
    async function getReadUrls() {
        const result = await chrome.storage.sync.get(['readUrls']);
        return result.readUrls || {};
    }
    
    // Save read URLs
    async function saveReadUrls(readUrls) {
        await chrome.storage.sync.set({ readUrls });
    }
    
    // Initialize interface
    async function init() {
        try {
            const tab = await getCurrentTab();
            currentUrl = tab.url;
            currentTitle = tab.title || 'Untitled'; // Get current tab title
            normalizedUrl = normalizeUrl(currentUrl);
            
            // Debug information
            console.log('Retrieved title:', currentTitle);
            console.log('Retrieved URL:', currentUrl);
            
            // Display current title (truncated)
            const displayTitle = currentTitle.length > 30 ? 
                currentTitle.substring(0, 30) + '...' : currentTitle;
            titleDisplay.textContent = displayTitle;
            
            // Display current URL (truncated)
            const displayUrl = currentUrl.length > 50 ? 
                currentUrl.substring(0, 50) + '...' : currentUrl;
            urlDisplay.textContent = displayUrl;
            
            // Check if already read (using normalized URL)
            const readUrls = await getReadUrls();
            isRead = !!readUrls[normalizedUrl];
            
            updateUI();
            updateStats();
            
        } catch (error) {
            console.error('Initialization failed:', error);
            statusText.textContent = 'Cannot get current page information';
        }
    }
    
    // Update interface status
    function updateUI() {
        if (isRead) {
            statusDiv.className = 'popup-status read';
            statusText.innerHTML = '✅ Marked as Read';
            actionButton.textContent = 'Unmark';
            actionButton.className = 'popup-button primary unread';
        } else {
            statusDiv.className = 'popup-status';
            statusText.innerHTML = '📖 Unread';
            actionButton.textContent = 'Mark as Read';
            actionButton.className = 'popup-button primary';
        }
    }
    
    // Update statistics
    async function updateStats() {
        const readUrls = await getReadUrls();
        const totalCount = Object.keys(readUrls).length;
        totalReadSpan.textContent = totalCount;
    }
    
    // Toggle read status
    async function toggleReadStatus() {
        try {
            const readUrls = await getReadUrls();
            
            if (isRead) {
                // Unmark (using normalized URL)
                delete readUrls[normalizedUrl];
                isRead = false;
            } else {
                // Mark as read (using normalized URL as key)
                readUrls[normalizedUrl] = {
                    title: currentTitle,
                    timestamp: Date.now(),
                    domain: new URL(currentUrl).hostname,
                    originalUrl: currentUrl // Save original URL for reference
                };
                isRead = true;
            }
            
            await saveReadUrls(readUrls);
            updateUI();
            updateStats();
            
            // Notify content script to update display
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(tab.id, { 
                action: 'updateReadStatus', 
                isRead: isRead 
            });
            
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    }
    
    // Bind events
    actionButton.addEventListener('click', toggleReadStatus);
    
    // Bind view history button event
    const viewHistoryButton = document.getElementById('viewHistoryButton');
    viewHistoryButton.addEventListener('click', function() {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/history/history.html') });
    });
    
    // Bind shortcut settings link event
    const shortcutSettingsLink = document.getElementById('shortcutSettingsLink');
    shortcutSettingsLink.addEventListener('click', function(event) {
        event.preventDefault();
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
        // Close popup after clicking
        window.close();
    });
    
    // Initialize
    init();
}); 