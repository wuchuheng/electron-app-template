import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { APP_NAME } from '@/shared/constants';

// English translations
const enTranslations = {
  common: {
    about: 'About',
    openAbout: 'About',
    madeWith: 'Made with Electron + React + TypeScript',
  },
  homepage: {
    title: APP_NAME,
    subtitle: 'Developer-friendly template with zero-config IPC discovery, auto-update, and modern tooling',
    quickStart: {
      title: 'Quick Start',
      installDeps: 'Install dependencies',
      startDev: 'Start development server',
      buildProd: 'Build for production',
      package: 'Package distributable',
    },
    ipc: {
      title: 'Zero-Config IPC',
      step1: '1. Create handler file',
      step2: '2. Implement handler',
      step3: '3. Types auto-generated!',
      step4: '4. Use in renderer',
    },
    features: {
      title: 'Built-in Features',
      zeroConfigIpc: { title: 'Zero-Config IPC Discovery', desc: 'Auto-discovers IPC handlers from file structure' },
      autoUpdate: { title: 'Auto-Update System', desc: 'Built-in update mechanism via electron-updater' },
      themeSystem: { title: 'Theme System', desc: 'Dark/Light/Custom theme support out of the box' },
      localDatabase: { title: 'Local Database', desc: 'SQLite + TypeORM for persistent storage' },
      systemTray: { title: 'System Tray', desc: 'Background running with tray integration' },
      hotReload: { title: 'Hot Reload', desc: 'Fast development with Vite HMR' },
      bootLoading: { title: 'Boot Loading', desc: 'Progressive startup with loading states' },
      framelessWindow: { title: 'Frameless Window', desc: 'Custom title bar with window controls' },
      i18nSupport: { title: 'i18n Support', desc: 'Multi-language support (EN/ZH)' },
    },
    projectStructure: {
      title: 'Project Structure',
      mainProcess: 'Main process',
      ipcHandlers: 'IPC handlers',
      services: 'Services',
      database: 'TypeORM',
      preload: 'Bridge',
      renderer: 'React UI',
      shared: 'Shared types',
    },
    techStack: {
      title: 'Tech Stack',
      description1: 'This template provides a production-ready foundation for building cross-platform desktop applications with modern tooling.',
      description2: 'All core features are pre-configured and documented. Simply clone and start building your app!',
    },
  },
  about: {
    title: `About ${APP_NAME}`,
    subtitle: 'Desktop Application Information',
    version: {
      title: 'Version Information',
      current: 'Current Version',
      author: 'Author',
      license: 'License',
      description: 'Description',
    },
    technology: {
      title: 'Technology Stack',
      frontend: 'Frontend Technologies',
      backend: 'Backend Technologies',
      tools: 'Development Tools',
    },
    features: {
      title: 'Key Features',
      crossPlatform: {
        title: 'Cross Platform',
        description: 'Runs on Windows, macOS, and Linux',
      },
      modernUI: {
        title: 'Modern UI',
        description: 'Built with React and Tailwind CSS for a responsive design',
      },
      database: {
        title: 'Local Database',
        description: 'Embedded SQLite database for offline data storage',
      },
      i18n: {
        title: 'Internationalization',
        description: 'Multi-language support with i18next',
      },
    },
    contact: {
      title: 'Contact Information',
      email: 'Email',
      github: 'GitHub Repository',
      support: 'Support',
    },
    navigation: {
      backToHome: 'Back to Home',
    },
  },
  update: {
    available: {
      title: 'Update Available',
      message: 'A new version is available. It is being downloaded in the background.',
    },
    downloading: {
      title: 'Downloading Update...',
    },
    ready: {
      title: 'Update Ready to Install',
      message: 'Version {{version}} has been downloaded. Restart the application to apply the update.',
    },
    releaseNotes: 'Release Notes:',
    restartNow: 'Restart Now',
    later: 'Later',
    error: {
      title: 'Update Error',
      message: 'An error occurred while updating.',
    },
  },
};

// Chinese translations
const zhTranslations = {
  common: {
    about: '关于',
    openAbout: '关于',
    madeWith: '使用 Electron + React + TypeScript 构建',
  },
  homepage: {
    title: APP_NAME,
    subtitle: '开发者友好的模板，具有零配置 IPC 发现、自动更新和现代化工具链',
    quickStart: {
      title: '快速开始',
      installDeps: '安装依赖',
      startDev: '启动开发服务器',
      buildProd: '构建生产版本',
      package: '打包分发',
    },
    ipc: {
      title: '零配置 IPC',
      step1: '1. 创建处理文件',
      step2: '2. 实现处理函数',
      step3: '3. 类型自动生成！',
      step4: '4. 在渲染进程中使用',
    },
    features: {
      title: '内置功能',
      zeroConfigIpc: { title: '零配置 IPC 发现', desc: '从文件结构自动发现 IPC 处理程序' },
      autoUpdate: { title: '自动更新系统', desc: '通过 electron-updater 内置更新机制' },
      themeSystem: { title: '主题系统', desc: '开箱即用的暗色/亮色/自定义主题支持' },
      localDatabase: { title: '本地数据库', desc: 'SQLite + TypeORM 持久化存储' },
      systemTray: { title: '系统托盘', desc: '后台运行与托盘集成' },
      hotReload: { title: '热重载', desc: 'Vite HMR 快速开发' },
      bootLoading: { title: '启动加载', desc: '渐进式启动与加载状态' },
      framelessWindow: { title: '无边框窗口', desc: '自定义标题栏与窗口控制' },
      i18nSupport: { title: '国际化支持', desc: '多语言支持 (EN/ZH)' },
    },
    projectStructure: {
      title: '项目结构',
      mainProcess: '主进程',
      ipcHandlers: 'IPC 处理程序',
      services: '服务',
      database: 'TypeORM',
      preload: '桥接',
      renderer: 'React UI',
      shared: '共享类型',
    },
    techStack: {
      title: '技术栈',
      description1: '此模板为构建跨平台桌面应用程序提供了生产就绪的基础和现代化工具链。',
      description2: '所有核心功能都经过预配置和文档化。只需克隆即可开始构建您的应用！',
    },
  },
  about: {
    title: `关于 ${APP_NAME}`,
    subtitle: '桌面应用程序信息',
    version: {
      title: '版本信息',
      current: '当前版本',
      author: '作者',
      license: '许可证',
      description: '描述',
    },
    technology: {
      title: '技术栈',
      frontend: '前端技术',
      backend: '后端技术',
      tools: '开发工具',
    },
    features: {
      title: '主要功能',
      crossPlatform: {
        title: '跨平台',
        description: '支持 Windows、macOS 和 Linux',
      },
      modernUI: {
        title: '现代化界面',
        description: '使用 React 和 Tailwind CSS 构建响应式设计',
      },
      database: {
        title: '本地数据库',
        description: '嵌入式 SQLite 数据库用于离线数据存储',
      },
      i18n: {
        title: '国际化',
        description: '使用 i18next 提供多语言支持',
      },
    },
    contact: {
      title: '联系信息',
      email: '邮箱',
      github: 'GitHub 仓库',
      support: '技术支持',
    },
    navigation: {
      backToHome: '返回首页',
    },
  },
  update: {
    available: {
      title: '发现新版本',
      message: '新版本已发布，正在后台为您下载。',
    },
    downloading: {
      title: '正在下载更新...',
    },
    ready: {
      title: '更新已就绪',
      message: '版本 {{version}} 已下载完成。请重启应用以应用更新。',
    },
    releaseNotes: '更新日志：',
    restartNow: '立即重启',
    later: '稍后',
    error: {
      title: '更新出错',
      message: '更新过程中发生错误。',
    },
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
    },
    fallbackLng: 'zh',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
  });

export default i18n;