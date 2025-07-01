# Mark as Read - Chrome 扩展插件

一个简单易用的Chrome插件，帮助你标记和追踪已访问的网页。

## 🌟 功能特点

- ✅ **一键标记**: 通过插件弹窗一键标记当前网页为已读
- 🔍 **视觉指示**: 在已读网页右上角显示"已读"标记
- 📊 **统计信息**: 查看总计已读页面数量
- 🔄 **实时同步**: 使用Chrome同步存储，数据在不同设备间同步
- 🎨 **极简扁平**: 全新的极简扁平化设计，零视觉疲劳
- 📱 **响应式**: 适配不同尺寸的屏幕
- 🛠️ **SCSS架构**: 模块化的样式管理，便于维护和扩展

## 🚀 安装方法

### 开发者模式安装

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择这个项目的文件夹
6. 插件安装完成！

## 📖 使用方法

### 标记网页为已读

1. 访问任意网页
2. 点击浏览器工具栏中的 📚 "Mark as Read" 图标
3. 在弹出窗口中点击"标记为已读"按钮
4. 网页右上角会显示"已读"标记

### 取消已读标记

1. 在已标记的网页上点击插件图标
2. 点击"取消标记"按钮
3. 已读标记会被移除

### 查看统计

在插件弹窗底部可以看到已读页面的总数统计。

## 🛠️ 技术实现

- **Manifest V3**: 使用最新的Chrome扩展API
- **存储同步**: 使用`chrome.storage.sync`实现跨设备同步
- **内容脚本**: 在网页中注入已读指示器
- **SCSS架构**: 模块化的样式管理，支持主题变量和mixins
- **极简扁平**: 极简扁平化设计，移除渐变和复杂效果，专注内容
- **响应式设计**: 适配不同尺寸和分辨率的屏幕

## 📁 项目结构

```
Mark as Read/
├── manifest.json          # 插件配置文件
├── package.json           # 依赖管理文件
├── src/
│   ├── popup/
│   │   ├── popup.html     # 弹窗界面
│   │   ├── popup.js       # 弹窗逻辑
│   │   └── popup.css      # 弹窗样式（SCSS编译生成）
│   ├── history/
│   │   ├── history.html   # 历史页面
│   │   ├── history.js     # 历史页面逻辑
│   │   └── history.css    # 历史页面样式（SCSS编译生成）
│   ├── content/
│   │   ├── content.js     # 内容脚本
│   │   └── styles.css     # 内容脚本样式（SCSS编译生成）
│   ├── background/
│   │   └── background.js  # 后台脚本
│   └── styles/            # SCSS源文件
│       ├── themes/
│       │   └── _variables.scss    # 主题变量
│       ├── base/
│       │   └── _mixins.scss       # 通用mixins
│       ├── components/
│       │   ├── _popup.scss        # 弹窗组件样式
│       │   ├── _history.scss      # 历史页面组件样式
│       │   └── _content.scss      # 内容脚本组件样式
│       ├── popup.scss     # 弹窗入口文件
│       ├── history.scss   # 历史页面入口文件
│       ├── content.scss   # 内容脚本入口文件
│       └── main.scss      # 主样式入口
├── assets/
│   └── icons/             # 图标文件夹
├── docs/
│   └── design-system.md  # 设计系统文档
└── README.md              # 说明文档
```

## 🎨 极简扁平化设计

本项目采用极简扁平化设计理念，详细信息请查看 [设计系统文档](docs/design-system.md)

### 设计理念
- **视觉简洁**: 移除所有不必要的装饰效果
- **认知轻松**: 降低视觉复杂度，减少用户认知负担
- **聚焦内容**: 让用户专注于核心功能，而非界面装饰
- **持久舒适**: 适合长时间使用，零视觉疲劳

### 实现特色
- **纯色背景**: 移除所有渐变，使用简洁纯色
- **清晰边框**: 用边框定义元素边界，替代复杂阴影
- **高对比度**: 确保文字清晰易读
- **统一间距**: 标准化的间距和尺寸系统

## 🔧 开发说明

### 安装依赖

```bash
npm install
```

### 开发流程

```bash
# 开发模式（监听SCSS文件变化）
npm run dev

# 构建所有样式文件
npm run build

# 单独构建组件
npm run build:scss:popup
npm run build:scss:history
npm run build:scss:content
```

### 权限说明

- `storage`: 存储已读URL数据
- `activeTab`: 获取当前活动标签页信息
- `host_permissions`: 在所有网站上注入内容脚本

### 数据存储格式

```javascript
{
  "readUrls": {
    "https://example.com": {
      "title": "Example Site",
      "timestamp": 1640995200000,
      "domain": "example.com"
    }
  }
}
```

## 🎯 未来计划

- [ ] 添加已读页面管理界面
- [ ] 支持按域名或日期筛选
- [ ] 导出/导入已读数据
- [ ] 添加阅读时间统计
- [ ] 支持自定义标记样式

## 📝 更新日志

### v1.0.0 (当前版本)
- 初始版本发布
- 基本的标记和显示功能
- 现代化界面设计
- 跨设备数据同步

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

Made with ❤️ by Mark as Read Team 