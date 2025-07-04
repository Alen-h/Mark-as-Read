document.addEventListener('DOMContentLoaded', async function() {
    const loadingDiv = document.getElementById('loading');
    const emptyStateDiv = document.getElementById('emptyState');
    const historyList = document.getElementById('historyList');
    const totalCountSpan = document.getElementById('totalCount');
    const sortButtons = document.querySelectorAll('.sort-button');
    
    let readUrls = {};
    let currentSort = 'time-desc';
    
    // Get read URLs list
    async function getReadUrls() {
        const result = await chrome.storage.sync.get(['readUrls']);
        return result.readUrls || {};
    }
    
    // Save read URLs list
    async function saveReadUrls(urls) {
        await chrome.storage.sync.set({ readUrls: urls });
    }
    
    // Limit text length and add ellipsis
    function truncateText(text, maxLength = 50) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // Format time
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today ' + date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffDays === 1) {
            return 'Yesterday ' + date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else if (diffDays < 7) {
            return diffDays + ' days ago';
        } else {
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    // Parse URL to get various parts
    function parseUrl(url) {
        try {
            const urlObj = new URL(url);
            return {
                fullUrl: url,
                domain: urlObj.hostname,
                path: urlObj.pathname,
                query: urlObj.search,
                fragment: urlObj.hash
            };
        } catch (error) {
            console.error('Failed to parse URL:', error, url);
            return {
                fullUrl: url,
                domain: '',
                path: '',
                query: '',
                fragment: ''
            };
        }
    }
    
    // Sort data
    function sortData(data, sortType) {
        const entries = Object.entries(data);
        
        switch (sortType) {
            case 'time-desc':
                return entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            case 'time-asc':
                return entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            case 'title':
                return entries.sort((a, b) => (a[1].title || '').localeCompare(b[1].title || ''));
            case 'domain':
                return entries.sort((a, b) => {
                    const domainA = parseUrl(a[1].originalUrl || a[0]).domain;
                    const domainB = parseUrl(b[1].originalUrl || b[0]).domain;
                    return domainA.localeCompare(domainB);
                });
            case 'url':
                return entries.sort((a, b) => (a[1].originalUrl || a[0]).localeCompare(b[1].originalUrl || b[0]));
            default:
                return entries;
        }
    }
    
    // Create history card
    function createHistoryCard(normalizedUrl, data) {
        const urlInfo = parseUrl(data.originalUrl || normalizedUrl);
        const titleText = data.title || 'Untitled';
        
        const card = document.createElement('div');
        card.className = 'history-card';
        
        card.innerHTML = `
            <div class="card-header">
                <div class="card-title">
                    <h3 class="title-text" title="${titleText}">${truncateText(titleText, 60)}</h3>
                    <span class="domain-badge">${urlInfo.domain}</span>
                </div>
                <div class="card-actions">
                    <button class="remove-button" data-url="${normalizedUrl}" title="Remove this record">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="card-content">
                <div class="url-section">
                    <a href="${urlInfo.fullUrl}" target="_blank" class="url-link" title="${urlInfo.fullUrl}">
                        ${truncateText(urlInfo.fullUrl, 80)}
                    </a>
                </div>
                
                ${urlInfo.query || urlInfo.fragment ? `
                    <div class="url-details">
                        ${urlInfo.query ? `<span class="url-param" title="Query: ${urlInfo.query}">Query: ${truncateText(urlInfo.query, 30)}</span>` : ''}
                        ${urlInfo.fragment ? `<span class="url-param" title="Fragment: ${urlInfo.fragment}">Fragment: ${truncateText(urlInfo.fragment, 30)}</span>` : ''}
                    </div>
                ` : ''}
            </div>
            
            <div class="card-footer">
                <span class="time-text">${formatTime(data.timestamp)}</span>
            </div>
        `;
        
        // Bind remove button event
        const removeButton = card.querySelector('.remove-button');
        removeButton.addEventListener('click', handleRemoveClick);
        
        return card;
    }
    
    // Render history list
    function renderHistory() {
        const sortedEntries = sortData(readUrls, currentSort);
        
        if (sortedEntries.length === 0) {
            loadingDiv.classList.add('hidden');
            emptyStateDiv.classList.remove('hidden');
            historyList.classList.add('hidden');
            totalCountSpan.textContent = '0';
            return;
        }
        
        loadingDiv.classList.add('hidden');
        emptyStateDiv.classList.add('hidden');
        historyList.classList.remove('hidden');
        totalCountSpan.textContent = sortedEntries.length;
        
        // Clear list content
        historyList.innerHTML = '';
        
        // Create cards
        sortedEntries.forEach(([normalizedUrl, data]) => {
            const card = createHistoryCard(normalizedUrl, data);
            historyList.appendChild(card);
        });
        
        // Add entrance animation
        setTimeout(() => {
            const cards = historyList.querySelectorAll('.history-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, index * 50);
            });
        }, 50);
    }
    
    // Handle remove button click
    async function handleRemoveClick(event) {
        const button = event.currentTarget;
        const normalizedUrl = button.dataset.url;
        
        if (confirm('Are you sure you want to remove this page from your read history?')) {
            // Add removal animation
            const card = button.closest('.history-card');
            card.classList.add('animate-out');
            
            setTimeout(async () => {
                delete readUrls[normalizedUrl];
                await saveReadUrls(readUrls);
                renderHistory();
            }, 300);
        }
    }
    
    // Handle sort button click
    function handleSortClick(event) {
        const button = event.currentTarget;
        const sortType = button.dataset.sort;
        
        if (sortType === currentSort) return;
        
        // Update button states
        sortButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        currentSort = sortType;
        renderHistory();
    }
    
    // Initialize
    async function init() {
        try {
            readUrls = await getReadUrls();
            renderHistory();
            
            // Bind sort button events
            sortButtons.forEach(button => {
                button.addEventListener('click', handleSortClick);
            });
            
            // Set initial sort button state
            document.querySelector(`[data-sort="${currentSort}"]`).classList.add('active');
            
        } catch (error) {
            console.error('Failed to initialize history page:', error);
            loadingDiv.classList.add('hidden');
            emptyStateDiv.classList.remove('hidden');
            document.querySelector('.empty-message').textContent = 'Failed to load history data';
        }
    }
    
    // Initialize page
    init();
}); 