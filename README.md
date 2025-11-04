# RH 日本藤本法律咨询网站

## 项目概述

这是一个为RH日本藤本法律咨询事务所开发的多语言响应式网站，提供公司服务介绍、费用信息、联系方式等内容。网站支持中文、日语和英语三种语言切换，并针对桌面和移动设备进行了响应式设计优化。

## 项目结构

```
├── css/              # 样式文件
│   └── style.css     # 主样式表
├── js/               # JavaScript文件
│   └── script.js     # 交互脚本，包含多语言功能
├── lang/             # 多语言数据文件
│   ├── en.json       # 英语翻译
│   ├── ja.json       # 日语翻译
│   └── zh-cn.json    # 中文翻译
├── index.html        # 主页面
├── .gitignore        # Git忽略文件
└── README.md         # 项目说明文档
```

## 特性

- 多语言支持（中文、日语、英语）
- 响应式设计，适配桌面和移动设备
- 现代化UI设计
- 导航菜单和语言切换功能
- 服务展示、费用表、联系方式等完整内容

## GitHub Pages 部署指南

### 准备工作

1. 确保您已经安装了Git
2. 确保您的GitHub账号已设置好

### 部署步骤

1. **创建GitHub仓库**
   - 在GitHub上创建一个新的仓库
   - 可以使用任意名称，如 `rh-japan-legal`

2. **初始化本地Git仓库**

   ```bash
   cd g:/wu
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **关联远程仓库**

   ```bash
   git remote add origin https://github.com/您的用户名/仓库名.git
   ```

4. **推送到GitHub**

   ```bash
   git push -u origin master  # 如果使用main分支，则改为main
   ```

5. **启用GitHub Pages**
   - 进入GitHub仓库页面，点击 Settings → Pages
   - 在 Source 下拉菜单中选择分支（通常是main或master）
   - 选择根目录（/）
   - 点击 Save
   - 等待几分钟，GitHub Pages会自动构建并发布您的网站

6. **访问网站**
   - 部署成功后，可以通过以下地址访问：`https://您的用户名.github.io/仓库名/`

### 注意事项

- 所有资源路径已配置为相对路径，确保在GitHub Pages环境下正常工作
- 多语言功能使用fetch API加载JSON文件，确保跨域访问正常
- 网站已经过移动端适配，在各种设备上都能良好显示

## 本地开发

1. 使用以下命令启动本地服务器（需要Python）：

   ```bash
   python -m http.server 8000
   ```

2. 在浏览器中访问：`http://localhost:8000/index.html`

## 许可证

© 2025 RH日本藤本法律咨询事务所