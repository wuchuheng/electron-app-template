import React from 'react';
import { Typography, Card, Button, Divider } from 'antd';
import { InfoCircleOutlined, RocketOutlined, ThunderboltOutlined, DatabaseOutlined, SkinOutlined, ReloadOutlined, LoadingOutlined, AppstoreOutlined, GlobalOutlined, CodeOutlined, FolderOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/genLogo/icon.png';

const { Title, Text, Paragraph } = Typography;

/**
 * HomePage - Template documentation and feature showcase
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: <ThunderboltOutlined className="text-2xl text-blue-500" />, title: t('homepage.features.zeroConfigIpc.title'), desc: t('homepage.features.zeroConfigIpc.desc') },
    { icon: <RocketOutlined className="text-2xl text-green-500" />, title: t('homepage.features.autoUpdate.title'), desc: t('homepage.features.autoUpdate.desc') },
    { icon: <SkinOutlined className="text-2xl text-purple-500" />, title: t('homepage.features.themeSystem.title'), desc: t('homepage.features.themeSystem.desc') },
    { icon: <DatabaseOutlined className="text-2xl text-orange-500" />, title: t('homepage.features.localDatabase.title'), desc: t('homepage.features.localDatabase.desc') },
    { icon: <AppstoreOutlined className="text-2xl text-cyan-500" />, title: t('homepage.features.systemTray.title'), desc: t('homepage.features.systemTray.desc') },
    { icon: <ReloadOutlined className="text-2xl text-pink-500" />, title: t('homepage.features.hotReload.title'), desc: t('homepage.features.hotReload.desc') },
    { icon: <LoadingOutlined className="text-2xl text-indigo-500" />, title: t('homepage.features.bootLoading.title'), desc: t('homepage.features.bootLoading.desc') },
    { icon: <ToolOutlined className="text-2xl text-teal-500" />, title: t('homepage.features.framelessWindow.title'), desc: t('homepage.features.framelessWindow.desc') },
    { icon: <GlobalOutlined className="text-2xl text-amber-500" />, title: t('homepage.features.i18nSupport.title'), desc: t('homepage.features.i18nSupport.desc') },
  ];

  const techStack = [
    'Electron 36', 'Vite 7', 'React 19', 'TypeScript', 'Tailwind CSS', 'Ant Design', 'TypeORM', 'better-sqlite3', 'electron-updater', 'i18next'
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 p-8 dark:from-[#0f0f1a] dark:to-[#1a1a2e]">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* About Link - Top Right */}
        <div className="flex justify-end">
          <Button
            type="default"
            icon={<InfoCircleOutlined />}
            onClick={() => navigate('/about')}
            className="flex items-center"
          >
            {t('common.about')}
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-16 w-16 object-contain drop-shadow-lg" />
          </div>
          <Title level={1} className="mb-2 !text-4xl dark:!text-white">
            {t('homepage.title')}
          </Title>
          <Paragraph className="!mb-6 text-lg text-gray-600 dark:text-gray-400">
            {t('homepage.subtitle')}
          </Paragraph>
        </div>

        <Divider />

        {/* Quick Start + IPC Communication */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Quick Start */}
          <Card
            title={<span className="flex items-center gap-2"><RocketOutlined /> {t('homepage.quickStart.title')}</span>}
            className="overflow-hidden rounded-xl border-none shadow-lg dark:!bg-[#16162a]"
          >
            <div className="space-y-3 font-mono text-sm">
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Text type="secondary"># {t('homepage.quickStart.installDeps')}</Text>
                <br />
                <Text code>npm install</Text>
              </div>
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Text type="secondary"># {t('homepage.quickStart.startDev')}</Text>
                <br />
                <Text code>npm start</Text>
              </div>
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Text type="secondary"># {t('homepage.quickStart.buildProd')}</Text>
                <br />
                <Text code>npm run build</Text>
              </div>
              <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                <Text type="secondary"># {t('homepage.quickStart.package')}</Text>
                <br />
                <Text code>npm run package</Text>
              </div>
            </div>
          </Card>

          {/* IPC Communication */}
          <Card
            title={<span className="flex items-center gap-2"><CodeOutlined /> {t('homepage.ipc.title')}</span>}
            className="overflow-hidden rounded-xl border-none shadow-lg dark:!bg-[#16162a]"
          >
            <div className="space-y-2 font-mono text-xs">
              <Text type="secondary">{`// ${t('homepage.ipc.step1')}`}</Text>
              <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
                <Text code className="!text-blue-600">src/main/ipc/user/get.ipc.ts</Text>
              </div>
              <Text type="secondary">{`// ${t('homepage.ipc.step2')}`}</Text>
              <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
                <Text code>{`export default async (id: string) => {`}</Text>
                <br />
                <Text code>{`  return await db.findOne(id);`}</Text>
                <br />
                <Text code>{`}`}</Text>
              </div>
              <Text type="secondary">{`// ${t('homepage.ipc.step3')}`}</Text>
              <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
                <Text code>npm run ipc:sync</Text>
              </div>
              <Text type="secondary">{`// ${t('homepage.ipc.step4')}`}</Text>
              <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
                <Text code>{`const user = await window.electron.user.get('123');`}</Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Built-in Features */}
        <Card
          title={<span className="flex items-center gap-2 text-xl"><ThunderboltOutlined className="text-blue-500" /> {t('homepage.features.title')}</span>}
          className="overflow-hidden rounded-xl border-none shadow-lg dark:!bg-[#16162a]"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              >
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <Text strong className="block dark:text-white">{feature.title}</Text>
                  <Text type="secondary" className="text-sm">{feature.desc}</Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Project Structure + Tech Stack */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Project Structure */}
          <Card
            title={<span className="flex items-center gap-2"><FolderOutlined /> {t('homepage.projectStructure.title')}</span>}
            className="overflow-hidden rounded-xl border-none shadow-lg dark:!bg-[#16162a]"
          >
            <div className="font-mono text-sm">
              <div className="space-y-1 text-gray-700 dark:text-gray-300">
                <div><Text code>src/</Text></div>
                <div className="pl-4"><Text code>├── main/</Text> <Text type="secondary"># {t('homepage.projectStructure.mainProcess')}</Text></div>
                <div className="pl-8"><Text code>│   ├── ipc/</Text> <Text type="secondary"># {t('homepage.projectStructure.ipcHandlers')}</Text></div>
                <div className="pl-8"><Text code>│   ├── services/</Text> <Text type="secondary"># {t('homepage.projectStructure.services')}</Text></div>
                <div className="pl-8"><Text code>│   └── database/</Text> <Text type="secondary"># {t('homepage.projectStructure.database')}</Text></div>
                <div className="pl-4"><Text code>├── preload/</Text> <Text type="secondary"># {t('homepage.projectStructure.preload')}</Text></div>
                <div className="pl-4"><Text code>├── renderer/</Text> <Text type="secondary"># {t('homepage.projectStructure.renderer')}</Text></div>
                <div className="pl-4"><Text code>└── shared/</Text> <Text type="secondary"># {t('homepage.projectStructure.shared')}</Text></div>
              </div>
            </div>
          </Card>

          {/* Tech Stack */}
          <Card
            title={<span className="flex items-center gap-2"><ToolOutlined /> {t('homepage.techStack.title')}</span>}
            className="overflow-hidden rounded-xl border-none shadow-lg dark:!bg-[#16162a]"
          >
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                >
                  {tech}
                </span>
              ))}
            </div>
            <Divider className="!my-4" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <Paragraph className="!mb-2">
                {t('homepage.techStack.description1')}
              </Paragraph>
              <Paragraph className="!mb-0">
                {t('homepage.techStack.description2')}
              </Paragraph>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Text type="secondary">
            {t('common.madeWith')}
          </Text>
        </div>
      </div>
    </div>
  );
};