# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.5-beta.0] - 2026-03-04

### 新增

- **路径别名文档**: 在 `GEMINI.md` 中新增了关于 `@` 路径别名的使用说明及结构映射。
- **环境配置支持**: `scripts/manage.ts` 新增对 `.env` 文件的加载支持，提升开发环境配置灵活性。
- **关于页面组件**: 新增 `AppAboutContent.tsx` 组件，实现“关于”页面内容的模块化复用。

### 优化

- **项目命名规范**: 将项目 `name` 从 `electron-app-template` 统一更改为 `com.wuchuheng.electron.template`。
- **路径别名配置**: 优化 `tsconfig.json` 中的 `@/*` 路径映射，使其优先匹配 `src/renderer` 目录，简化前端引用。
- **数据目录映射**: 改进 `getBaseDir` 逻辑，采用 package name 作为数据存放目录，确保应用数据隔离的准确性。
- **更新配置增强**: `getUpdateUrl` 和 `getRemoteRoot` 新增对 `process.env` 的降级支持。
- **页面重构**: 重构 `AboutPage.tsx` 以调用新封装的 `AppAboutContent` 组件，保持代码简洁。
- **构建配置标准化**: 统一了 `app-update.yml` 和 `dev-app-update.yml` 中的 `updaterCacheDirName` 命名。

### 移除

- **设置页面**: 移除了原有的 `SettingPage.tsx` 及其路由配置，简化初始模板功能。

## [1.0.15] - 2026-03-03

### 修复

- **系统托盘最小化**: 修复了主窗口点击关闭按钮时直接退出应用而不是最小化到系统托盘的问题。通过将 `close` 事件拦截改为同步执行 `event.preventDefault()`，并在异步获取配置后执行隐藏或关闭逻辑，确保了“后台运行”配置生效。
- **扩展加载异常**: 修复了应用在生产环境中找不到并加载 `chrome-mv3-prod` 扩展目录的问题，通过修改打包配置将扩展目录正确打入应用资源中。
- **更新竞争条件**: 修复了发布脚本在上传文件时可能导致客户端在安装包完全上传前就尝试拉取更新的问题，通过强制将 `.yml` 配置文件置于上传队列末尾解决。

## [1.0.14] - 2026-03-03

### 修复

- **更新服务自动更新**：修复因 CI 构建缺少环境变量导致自动更新定时器（setInterval）未能成功初始化的隐蔽 Bug。现在即使环境变量注入失败，更新机制也能借助测试/生产地址的兜底策略正常工作。
- **环境隔离配置**：新增 `npm run release:test` 脚本，支持向测试环境（TEST_REMOTE_ROOT）安全发布验证版本，隔离生产环境影响。

## [1.0.13] - 2026-03-03

### 优化

- **目录结构重组**：将 Chromium 系统文件（Cache, GPU 等）迁移至 `system` 子目录，并将应用数据（数据库、日志、采集数据等）统一存放于 `storage` 子目录，使应用根目录更简洁专业。
- **日志存储优化**：统一日志存储路径至 `storage/logs`，确保安装目录不被日志文件污染。

### 新增

- **浏览器右键菜单多语言**：完善了浏览器视图右键菜单的所有中英文翻译条目。

### 修复

- **更新服务健壮性**：修复了在未配置更新服务器（如开发环境）时触发检查导致的 404 错误。
- **主进程异常**：修复了主进程中因缺少 `path` 模块导入导致的引用错误。
- **代码规范治理**：清理了重复的 i18n 键值对及未使用的 React 图标导入。

## [1.0.12] - 2026-03-02

### 修复

- **持续优化**：进一步巩固了增量更新机制与 UI 布局的稳定性。

## [1.0.11] - 2026-03-02

### 修复

- **更新弹窗布局**：修复了更新弹窗中因高度计算不当导致“立即重启并安装”按钮被挤出可视区域的问题，现在长篇更新日志也能完美自适应滚动。
- **多语言配置**：修复了更新弹窗多语言键值未正确映射的问题。

## [1.0.10] - 2026-03-02

### 修复

- **增量更新支持**：统一并标准化了应用名称的规范化处理（kebab-case），移除了下划线干扰，确保更新缓存目录与 `electron-updater` 的预期完全一致，从而启用增量更新（Differential Update）功能。
- **模板稳定性**：同步修复了模板项目中的缓存目录命名逻辑。

## [1.0.8] - 2026-03-02

### 优化

- **更新弹窗 UI 改进**：重新设计了更新对话框，为更新日志增加了独立的标题栏和带滚动条的内容区，并优化了底部间距。
- **模板同步**：将更新逻辑优化和 UI 改进同步到了内置的 `electron-app-template` 模板项目中。

### 修复

- **发布脚本健壮性**：彻底修复了发布脚本中 `CHANGELOG.md` 提取失败的问题，确保 `latest.yml` 包含正确的更新说明。
- **i18n 完整性恢复**：修复并恢复了之前因重构误操作导致的 `v2` 项目专有多语言条目丢失的问题。

## [1.0.7] - 2026-03-02

### 新增

- **设置页面完整多语言**：完善了设置页面所有表单字段、按钮、表格列及反馈消息的多语言支持（中英文）。

### 变更

- **界面文本精简**：根据用户反馈，将“关于我们”简化为“关于”，“系统设置”简化为“设置”，“数据审查”简化为“审查”。
- **发布脚本增强**：修复了发布脚本中 `CHANGELOG.md` 提取逻辑，采用更稳健的正则表达式提取发布日志。
- **发布逻辑调整**：移除了发布完成后自动将 `package.json` 版本回退至 1.0.0 的逻辑，保持版本一致性。

### 修复

- **移除开发者信息**：从“关于”页面移除了作者、授权、GitHub 及网站等个人信息，使界面更简洁专业。

## [1.0.3] - 2026-03-02

### 修复

- **构建异常修复**：适配 `react-window` 2.2.7 新版 API，修复了生产环境下的编译错误。
- **更新弹窗优化**：修复了更新日志内容过长导致窗口布局错位的问题，为日志内容增加了固定高度的滚动容器。

### 优化

- **代码规范治理**：清理了全量 Lint 错误，移除了未使用的变量、接口及导入，提升代码质量。
- **工程配置现代化**：优化了 `tsconfig.json` 配置，采用 `esnext` 模块规范及 `bundler` 模块解析策略。

## [1.0.5] - 2026-03-02

### 新增

- **实时更新检查**：更新检查频率从每小时提升至每分钟，实现近乎实时的版本检测。
- **智能更新提醒**：引入版本记录机制，确保同一版本仅在首次发现时弹出提醒，避免重复干扰。
- **主进程多语言支持**：为窗口标题引入轻量级 i18n 辅助工具，实现主进程与渲染进程共用翻译资源。
- **更新窗口优化**：新增 `/update-dialog` 独立路由及加载状态，修复更新弹窗可能出现的黑屏问题。

### 变更

- **i18n 资源共享**：将翻译资源迁移至 `src/shared/locales.ts`，统一多语言管理。
- **自动化脚本优化**：改进 `app:sync` 脚本，支持在包名中使用下划线，增强系统兼容性。

### 修复

- **窗口标题硬编码**：移除了所有窗口标题的硬编码字符串，完全通过 i18n 配置动态生成。
- **更新缓存目录异常**：修复了因包名转换逻辑错误导致的更新缓存路径失效及 ENOENT 错误。

## [1.0.1] - 2026-03-02

### 新增

- 为数据中心汇总添加多语言支持，包括：极淘、今日 URL 和今日数据标签。
- 为浏览器视图未选择状态（标题和描述）添加多语言支持。
- 为数据桶操作添加“打开目录”翻译。

## [1.0.0] - 2025-02-26

### Added

- AI-powered translation with support for multiple providers (OpenAI, DeepSeek, custom endpoints)
- Global hotkey to toggle the floating translation window (default: Ctrl+Alt+T)
- System tray integration with show/hide functionality
- Auto-start on boot option
- Run in background option (hide to tray on close)
- Theme customization with background color and opacity settings
- AI provider configuration with test playground
- System prompt customization for translation behavior
- Thinking/reasoning process visualization for supported models (e.g., DeepSeek R1)
- Auto-update functionality with update dialog
- SQLite database for persistent configuration storage
- Internationalization support (English and Chinese)
- Welcome screen for first-time users

### Changed

- Migrated from webpack to electron-vite for improved build performance
- Refactored IPC communication with type-safe handlers
- Improved path imports using `@/` alias for cleaner codebase
- Enhanced update feedback and UX with progress indicators

### Fixed

- SQLite3 compatibility issues in production builds
- Window positioning and focus behavior
- Hotkey registration and persistence

---

## Release Notes Format

Each release includes the following information:

- **Version**: Semantic version number
- **Release Date**: ISO 8601 date format (YYYY-MM-DD)
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed in future releases
- **Removed**: Features removed in this release
- **Fixed**: Bug fixes
- **Security**: Security-related changes
