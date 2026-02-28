import React, { useEffect, useState } from 'react';
import { Typography, Space, Divider, Spin, Button, Progress, message } from 'antd';
import { GithubOutlined, GlobalOutlined, CheckCircleOutlined, SyncOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useUpdateSystem } from '../../hooks/useUpdateSystem';
import logo from '../../assets/genLogo/icon.png';

const { Title, Text, Paragraph } = Typography;

interface AppInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  website: string;
}

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const { status, info: updateInfo, progress, error, checkForUpdates, installAndRestart } = useUpdateSystem();

  useEffect(() => {
    window.electron.system.getAppInfo().then((res) => {
      setInfo(res);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (error) {
      message.error('Update failed: ' + error);
    }
  }, [error]);

  const handleCheckUpdate = async () => {
    try {
      await checkForUpdates();
    } catch {
      message.error('Failed to check for updates');
    }
  };

  const handleInstall = async () => {
    try {
      await installAndRestart();
    } catch {
      message.error('Failed to install update');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50 p-8 dark:from-[#0f0f1a] dark:to-[#1a1a2e]">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          className="mb-6"
        >
          {t('about.navigation.backToHome')}
        </Button>

        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-[#16162a]">
          {/* App Icon & Name */}
          <div className="mb-8 text-center">
            <img src={logo} alt="Logo" className="mb-4 inline-flex h-20 w-20 object-contain drop-shadow-lg" />
            <Title level={2} className="mb-1 dark:text-white">
              {info?.name}
            </Title>
            <Text type="secondary" className="font-mono">
              v{info?.version}
            </Text>
          </div>

          {/* Update Section */}
          <div className="mb-8 flex flex-col items-center gap-3">
            {status === 'ready' && updateInfo ? (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleInstall}
                className="rounded-full bg-green-500 hover:bg-green-600 border-none"
              >
                Restart & Install v{updateInfo.version}
              </Button>
            ) : status === 'downloading' ? (
              <div className="w-48">
                <Progress percent={progress?.percent || 0} size="small" status="active" />
                <Text className="text-xs" type="secondary">
                  Downloading...
                </Text>
              </div>
            ) : status === 'checking' ? (
              <Space>
                <SyncOutlined spin />
                <Text type="secondary" className="text-xs">
                  Checking for updates...
                </Text>
              </Space>
            ) : status === 'error' ? (
              <Button type="primary" ghost size="small" onClick={handleCheckUpdate} className="rounded-full">
                Retry Check
              </Button>
            ) : (
              <Button type="primary" ghost size="small" onClick={handleCheckUpdate} className="rounded-full">
                Check for Updates
              </Button>
            )}
          </div>

          {/* Description */}
          <Paragraph className="mb-8 text-center text-gray-600 dark:text-gray-400">
            {info?.description || t('about.version.description')}
          </Paragraph>

          <Divider />

          {/* Info Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 text-center">
            <div>
              <Text strong className="block dark:text-gray-300">
                {t('about.version.author')}
              </Text>
              <Text type="secondary">{info?.author}</Text>
            </div>
            <div>
              <Text strong className="block dark:text-gray-300">
                {t('about.version.license')}
              </Text>
              <Text type="secondary">MIT</Text>
            </div>
          </div>

          <Divider />

          {/* Links */}
          <div className="flex justify-center gap-4">
            {info?.website && (
              <a
                href={info.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:text-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-blue-500"
              >
                <GithubOutlined /> {t('about.contact.github')}
              </a>
            )}
            <a
              href="https://wuchuheng.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:text-blue-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-blue-500"
            >
              <GlobalOutlined /> {t('about.contact.support')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};