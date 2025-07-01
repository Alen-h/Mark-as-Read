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
    
    // URL规范化函数 - 去掉query参数和fragment，只保留基础URL
    function normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // 只保留protocol, hostname, port, pathname，去掉search和hash
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        } catch (error) {
            console.error('Failed to normalize URL:', error, url);
            return url; // 如果解析失败，返回原始URL
        }
    }
    
    // 获取当前活动标签页的URL
    async function getCurrentTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }
    
    // 获取已读URL列表
    async function getReadUrls() {
        const result = await chrome.storage.sync.get(['readUrls']);
        return result.readUrls || {};
    }
    
    // 保存已读URL
    async function saveReadUrls(readUrls) {
        await chrome.storage.sync.set({ readUrls });
    }
    
    // 初始化界面
    async function init() {
        try {
            const tab = await getCurrentTab();
            currentUrl = tab.url;
            currentTitle = tab.title || 'Untitled'; // 获取当前标签页的标题
            normalizedUrl = normalizeUrl(currentUrl);
            
            // 调试信息
            console.log('Retrieved title:', currentTitle);
            console.log('Retrieved URL:', currentUrl);
            
            // 显示当前标题（截取显示）
            const displayTitle = currentTitle.length > 30 ? 
                currentTitle.substring(0, 30) + '...' : currentTitle;
            titleDisplay.textContent = displayTitle;
            
            // 显示当前URL（截取显示）
            const displayUrl = currentUrl.length > 50 ? 
                currentUrl.substring(0, 50) + '...' : currentUrl;
            urlDisplay.textContent = displayUrl;
            
            // 检查是否已读（使用规范化的URL）
            const readUrls = await getReadUrls();
            isRead = !!readUrls[normalizedUrl];
            
            updateUI();
            updateStats();
            
        } catch (error) {
            console.error('Initialization failed:', error);
            statusText.textContent = 'Cannot get current page information';
        }
    }
    
    // 更新界面状态
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
    
    // 更新统计信息
    async function updateStats() {
        const readUrls = await getReadUrls();
        const totalCount = Object.keys(readUrls).length;
        totalReadSpan.textContent = totalCount;
    }
    
    // 切换已读状态
    async function toggleReadStatus() {
        try {
            const readUrls = await getReadUrls();
            
            if (isRead) {
                // 取消标记（使用规范化的URL）
                delete readUrls[normalizedUrl];
                isRead = false;
            } else {
                // 标记为已读（使用规范化的URL作为key）
                readUrls[normalizedUrl] = {
                    title: currentTitle,
                    timestamp: Date.now(),
                    domain: new URL(currentUrl).hostname,
                    originalUrl: currentUrl // 保存原始URL用于参考
                };
                isRead = true;
            }
            
            await saveReadUrls(readUrls);
            updateUI();
            updateStats();
            
            // 通知content script更新显示
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(tab.id, { 
                action: 'updateReadStatus', 
                isRead: isRead 
            });
            
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    }
    
    // 绑定事件
    actionButton.addEventListener('click', toggleReadStatus);
    
    // 绑定查看历史按钮事件
    const viewHistoryButton = document.getElementById('viewHistoryButton');
    viewHistoryButton.addEventListener('click', function() {
        chrome.tabs.create({ url: chrome.runtime.getURL('src/history/history.html') });
    });
    
    // 初始化
    init();
}); 