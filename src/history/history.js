document.addEventListener('DOMContentLoaded', async function() {
    const loadingDiv = document.getElementById('loading');
    const emptyStateDiv = document.getElementById('emptyState');
    const historyList = document.getElementById('historyList');
    const totalCountSpan = document.getElementById('totalCount');
    const sortButtons = document.querySelectorAll('.sort-button');
    
    let readUrls = {};
    let currentSort = 'time-desc';
    
    // 获取已读URL列表
    async function getReadUrls() {
        const result = await chrome.storage.sync.get(['readUrls']);
        return result.readUrls || {};
    }
    
    // 保存已读URL列表
    async function saveReadUrls(urls) {
        await chrome.storage.sync.set({ readUrls: urls });
    }
    
    // 限制文本长度并添加省略号
    function truncateText(text, maxLength = 50) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // 格式化时间
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
    
    // 解析URL获取各个部分
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
    
    // 排序数据
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
    
    // 创建历史记录卡片
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
        
        // 绑定删除按钮事件
        const removeButton = card.querySelector('.remove-button');
        removeButton.addEventListener('click', handleRemoveClick);
        
        return card;
    }
    
    // 渲染历史列表
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
        
        // 清空列表内容
        historyList.innerHTML = '';
        
        // 创建卡片
        sortedEntries.forEach(([normalizedUrl, data]) => {
            const card = createHistoryCard(normalizedUrl, data);
            historyList.appendChild(card);
        });
        
        // 添加入场动画
        setTimeout(() => {
            const cards = historyList.querySelectorAll('.history-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animate-in');
                }, index * 50);
            });
        }, 50);
    }
    
    // 处理删除按钮点击
    async function handleRemoveClick(event) {
        const button = event.currentTarget;
        const normalizedUrl = button.dataset.url;
        
        if (confirm('Are you sure you want to remove this page from your read history?')) {
            // 添加删除动画
            const card = button.closest('.history-card');
            card.classList.add('removing');
            
            // 等待动画完成后删除
            setTimeout(async () => {
                delete readUrls[normalizedUrl];
                await saveReadUrls(readUrls);
                renderHistory();
            }, 300);
        }
    }
    
    // 初始化
    async function init() {
        try {
            readUrls = await getReadUrls();
            renderHistory();
        } catch (error) {
            console.error('Failed to load history:', error);
            loadingDiv.innerHTML = '<div class="error-message">Failed to load history. Please refresh and try again.</div>';
        }
    }
    
    // 绑定排序按钮事件
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 更新按钮状态
            sortButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新排序方式并重新渲染
            currentSort = this.dataset.sort;
            renderHistory();
        });
    });
    
    // 监听存储变化，自动更新页面
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.readUrls) {
            readUrls = changes.readUrls.newValue || {};
            renderHistory();
        }
    });
    
    // 初始化
    init();
}); 