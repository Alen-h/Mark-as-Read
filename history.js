document.addEventListener('DOMContentLoaded', async function() {
    const loadingDiv = document.getElementById('loading');
    const emptyStateDiv = document.getElementById('emptyState');
    const historyTable = document.getElementById('historyTable');
    const historyTableBody = document.getElementById('historyTableBody');
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
            console.error('URL解析失败:', error, url);
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
            titleCell.textContent = data.title || '无标题';
            titleCell.title = data.title || '无标题';
            
            // URL
            const urlCell = document.createElement('td');
            urlCell.className = 'url-cell';
            const urlLink = document.createElement('a');
            urlLink.href = urlInfo.fullUrl;
            urlLink.target = '_blank';
            urlLink.className = 'url-link';
            urlLink.textContent = urlInfo.fullUrl;
            urlLink.title = urlInfo.fullUrl;
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
            removeButton.textContent = '删除';
            removeButton.title = '移除此记录';
            removeButton.dataset.url = normalizedUrl;
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
        if (confirm('确定要删除这条记录吗？')) {
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
            console.error('加载历史记录失败:', error);
            loadingDiv.innerHTML = '加载失败，请刷新页面重试';
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