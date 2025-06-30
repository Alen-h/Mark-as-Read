// Mark as Read - Background Script (Service Worker)

// URL规范化函数 - 去掉query参数和fragment，只保留基础URL
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url);
        // 只保留protocol, hostname, port, pathname，去掉search和hash
        return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (error) {
        console.error('URL规范化失败:', error, url);
        return url; // 如果解析失败，返回原始URL
    }
}

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Mark as Read 插件已安装');
    
    if (details.reason === 'install') {
        // 首次安装时初始化存储
        chrome.storage.sync.set({ readUrls: {} });
    }
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.readUrls) {
        console.log('已读URL列表已更新');
    }
});

// 处理来自content script或popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'getReadStatus':
            // 获取指定URL的已读状态
            chrome.storage.sync.get(['readUrls']).then((result) => {
                const readUrls = result.readUrls || {};
                const normalizedUrl = normalizeUrl(request.url);
                const isRead = !!readUrls[normalizedUrl];
                sendResponse({ isRead });
            });
            return true; // 保持消息通道开放
            
        case 'markAsRead':
            // 标记URL为已读
            chrome.storage.sync.get(['readUrls']).then((result) => {
                const readUrls = result.readUrls || {};
                const normalizedUrl = normalizeUrl(request.url);
                readUrls[normalizedUrl] = {
                    title: request.title || '',
                    timestamp: Date.now(),
                    domain: new URL(request.url).hostname,
                    originalUrl: request.url // 保存原始URL用于参考
                };
                return chrome.storage.sync.set({ readUrls });
            }).then(() => {
                sendResponse({ success: true });
            }).catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
            return true;
            
        case 'markAsUnread':
            // 取消标记
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

// 标签页更新时检查已读状态
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // 可以在这里添加自动检查逻辑
    }
}); 