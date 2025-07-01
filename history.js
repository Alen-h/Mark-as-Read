document.addEventListener('DOMContentLoaded', async function() {
    const loadingDiv = document.getElementById('loading');
    const emptyStateDiv = document.getElementById('emptyState');
    const historyTable = document.getElementById('historyTable');
    const historyTableBody = document.getElementById('historyTableBody');
    const totalCountSpan = document.getElementById('totalCount');
    const sortButtons = document.querySelectorAll('.sort-button');
    
    let readUrls = {};
    let currentSort = 'time-desc';
    let tooltip = null;
    
    // 获取已读URL列表
    async function getReadUrls() {
        const result = await chrome.storage.sync.get(['readUrls']);
        return result.readUrls || {};
    }
    
    // 保存已读URL列表
    async function saveReadUrls(urls) {
        await chrome.storage.sync.set({ readUrls: urls });
    }
    
    // 创建tooltip元素
    function createTooltip() {
        if (tooltip) return tooltip;
        
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
        return tooltip;
    }
    
    // 显示tooltip
    function showTooltip(element, text, event) {
        const tooltipEl = createTooltip();
        tooltipEl.textContent = text;
        tooltipEl.classList.add('show');
        
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top - tooltipRect.height - 8;
        
        // 确保tooltip不会超出视窗
        if (left < 0) left = 8;
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 8;
        }
        if (top < 0) {
            top = rect.bottom + 8;
        }
        
        tooltipEl.style.left = left + 'px';
        tooltipEl.style.top = top + 'px';
    }
    
    // 隐藏tooltip
    function hideTooltip() {
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    }
    
    // 限制文本长度并添加省略号
    function truncateText(text, maxLength = 10) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    // 格式化时间为 YYYY-MM-DD HH:MM:SS
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    // 解析URL获取各个部分
    function parseUrl(url) {
        try {
            const urlObj = new URL(url);
            return {
                fullUrl: url,
                domain: urlObj.hostname,
                query: urlObj.search,
                fragment: urlObj.hash
            };
        } catch (error) {
            console.error('Failed to parse URL:', error, url);
            return {
                fullUrl: url,
                domain: '',
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
                return entries.sort((a, b) => a[1].domain.localeCompare(b[1].domain));
            case 'url':
                return entries.sort((a, b) => (a[1].originalUrl || a[0]).localeCompare(b[1].originalUrl || b[0]));
            default:
                return entries;
        }
    }
    
    // 渲染表格
    function renderTable() {
        const sortedEntries = sortData(readUrls, currentSort);
        
        if (sortedEntries.length === 0) {
            loadingDiv.classList.add('hidden');
            emptyStateDiv.classList.remove('hidden');
            historyTable.classList.add('hidden');
            totalCountSpan.textContent = '0';
            return;
        }
        
        loadingDiv.classList.add('hidden');
        emptyStateDiv.classList.add('hidden');
        historyTable.classList.remove('hidden');
        totalCountSpan.textContent = sortedEntries.length;
        
        historyTableBody.innerHTML = '';
        
        sortedEntries.forEach(([normalizedUrl, data]) => {
            const row = document.createElement('tr');
            
            // 解析URL信息
            const urlInfo = parseUrl(data.originalUrl || normalizedUrl);
            
            // 标题
            const titleCell = document.createElement('td');
            titleCell.className = 'title-cell';
            const titleText = data.title || 'Untitled';
            titleCell.textContent = truncateText(titleText, 20);
            
            // 添加tooltip事件监听
            titleCell.addEventListener('mouseenter', (e) => {
                if (titleText.length > 20) {
                    showTooltip(titleCell, titleText, e);
                }
            });
            titleCell.addEventListener('mouseleave', hideTooltip);
            
            // URL
            const urlCell = document.createElement('td');
            urlCell.className = 'url-cell';
            const urlLink = document.createElement('a');
            urlLink.href = urlInfo.fullUrl;
            urlLink.target = '_blank';
            urlLink.className = 'url-link';
            urlLink.textContent = truncateText(urlInfo.fullUrl, 20);
            
            // 添加URL tooltip事件监听
            urlLink.addEventListener('mouseenter', (e) => {
                if (urlInfo.fullUrl.length > 20) {
                    showTooltip(urlLink, urlInfo.fullUrl, e);
                }
            });
            urlLink.addEventListener('mouseleave', hideTooltip);
            
            urlCell.appendChild(urlLink);
            
            // 域名
            const domainCell = document.createElement('td');
            domainCell.innerHTML = `<span class="domain-badge">${urlInfo.domain}</span>`;
            
            // Query
            const queryCell = document.createElement('td');
            queryCell.className = 'query-cell';
            if (urlInfo.query) {
                queryCell.textContent = urlInfo.query;
                queryCell.title = urlInfo.query;
            } else {
                queryCell.textContent = '-';
                queryCell.className += ' empty-cell';
            }
            
            // Fragment
            const fragmentCell = document.createElement('td');
            fragmentCell.className = 'fragment-cell';
            if (urlInfo.fragment) {
                fragmentCell.textContent = urlInfo.fragment;
                fragmentCell.title = urlInfo.fragment;
            } else {
                fragmentCell.textContent = '-';
                fragmentCell.className += ' empty-cell';
            }
            
            // 标记时间
            const timeCell = document.createElement('td');
            timeCell.className = 'time-text';
            timeCell.textContent = formatTime(data.timestamp);
            
            // 操作
            const actionCell = document.createElement('td');
            actionCell.className = 'action-cell';
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-button';
            removeButton.title = 'Remove this record';
            removeButton.dataset.url = normalizedUrl;
            
            // 添加SVG图标
            removeButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 10V44H39V10H9Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/>
                    <path d="M20 20V33" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M28 20V33" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4 10H44" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16 10L19.289 4H28.7771L32 10H16Z" fill="none" stroke="white" stroke-width="4" stroke-linejoin="round"/>
                </svg>
            `;
            
            removeButton.addEventListener('click', handleRemoveClick);
            actionCell.appendChild(removeButton);
            
            row.appendChild(titleCell);
            row.appendChild(urlCell);
            row.appendChild(domainCell);
            row.appendChild(queryCell);
            row.appendChild(fragmentCell);
            row.appendChild(timeCell);
            row.appendChild(actionCell);
            
            historyTableBody.appendChild(row);
        });
    }
    
    // 处理删除按钮点击
    async function handleRemoveClick(event) {
        const normalizedUrl = event.target.dataset.url;
        if (confirm('Are you sure you want to delete this record?')) {
            delete readUrls[normalizedUrl];
            await saveReadUrls(readUrls);
            renderTable();
        }
    }
    
    // 初始化
    async function init() {
        try {
            readUrls = await getReadUrls();
            renderTable();
        } catch (error) {
            console.error('Failed to load history:', error);
            loadingDiv.innerHTML = 'Loading failed, please refresh and try again';
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
            renderTable();
        });
    });
    
    // 监听存储变化，自动更新页面
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.readUrls) {
            readUrls = changes.readUrls.newValue || {};
            renderTable();
        }
    });
    
    // 初始化
    init();
}); 