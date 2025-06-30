// Mark as Read - Content Script
(function() {
    'use strict';
    
    let readIndicator = null;
    let isRead = false;
    
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
    
    // 创建已读指示器
    function createReadIndicator() {
        if (readIndicator) {
            return;
        }
        
        readIndicator = document.createElement('div');
        readIndicator.id = 'mark-as-read-indicator';
        readIndicator.innerHTML = `
            <div class="indicator-content">
                <span class="indicator-icon">✅</span>
                <span class="indicator-text">已读</span>
            </div>
        `;
        
        document.body.appendChild(readIndicator);
    }
    
    // 移除已读指示器
    function removeReadIndicator() {
        if (readIndicator) {
            readIndicator.remove();
            readIndicator = null;
        }
    }
    
    // 检查当前URL是否已读
    async function checkReadStatus() {
        try {
            const result = await chrome.storage.sync.get(['readUrls']);
            const readUrls = result.readUrls || {};
            const currentUrl = normalizeUrl(window.location.href);
            
            isRead = !!readUrls[currentUrl];
            updateIndicator();
            
        } catch (error) {
            console.error('检查已读状态失败:', error);
        }
    }
    
    // 更新指示器显示
    function updateIndicator() {
        if (isRead) {
            createReadIndicator();
        } else {
            removeReadIndicator();
        }
    }
    
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateReadStatus') {
            isRead = request.isRead;
            updateIndicator();
        }
    });
    
    // 监听URL变化（用于SPA应用）
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            checkReadStatus();
        }
    }).observe(document, { subtree: true, childList: true });
    
    // 页面加载完成后检查状态
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkReadStatus);
    } else {
        checkReadStatus();
    }
    
})(); 