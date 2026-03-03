import React, { useEffect, useState } from 'react';
import { Typography, Space, Divider, Spin, Button, Progress, message, Badge } from 'antd';
import { CheckCircleOutlined, SyncOutlined, RocketOutlined, GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useUpdateSystem } from '@/renderer/hooks/useUpdateSystem';
import { formatBytes, formatSpeed } from '@/shared/update-types';
import logo from '@/renderer/assets/genLogo/icon.png';

const { Title, Text, Paragraph } = Typography;

interface AppInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  website: string;
}

interface AppAboutContentProps {
  showTitle?: boolean;
  bordered?: boolean;
  className?: string;
}

export const AppAboutContent: React.FC<AppAboutContentProps> = ({
  showTitle = true,
  bordered = true,
  className = '',
}) => {
  const { t } = useTranslation();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheckTime, setLastCheckCheck] = useState<number | null>(null);

  const { status, info: updateInfo, progress, error, checkForUpdates, installAndRestart } = useUpdateSystem();

  useEffect(() => {
    window.electron.system.getAppInfo().then(res => {
      setAppInfo(res as AppInfo);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (error) {
      message.error(t('about.error') + ': ' + error);
    }
  }, [error, t]);

  const handleCheckUpdate = async () => {
    try {
      setLastCheckCheck(Date.now());
      await checkForUpdates();
    } catch {
      message.error(t('about.error'));
    }
  };

  const handleInstall = async () => {
    try {
      await installAndRestart();
    } catch {
      message.error(t('update.error'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Spin size="large" tip={t('common.loading') || 'Loading...'} />
      </div>
    );
  }

  const isLatest = status === 'idle' && lastCheckTime !== null;

  return (
    <div className={`mx-auto max-w-2xl ${className}`}>
      <div
        className={`rounded-2xl p-8 ${
          bordered ? 'border-border border bg-background-secondary shadow-sm' : 'bg-transparent'
        }`}
      >
        {/* App Icon & Name */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block rounded-3xl bg-background-primary p-4 shadow-inner">
            <img src={logo} alt="Logo" className="h-20 w-20 object-contain" />
          </div>
          {showTitle && (
            <Title level={2} className="mb-1 text-text-primary">
              {appInfo?.name || t('appName')}
            </Title>
          )}
          <Space>
            <Text code className="border-border bg-background-primary font-mono">
              v{appInfo?.version}
            </Text>
            {isLatest && (
              <Badge
                status="success"
                text={
                  <Text type="success" className="text-xs">
                    {t('about.latest')}
                  </Text>
                }
              />
            )}
          </Space>
        </div>

        {/* Update Section */}
        <div className="mb-10 flex flex-col items-center">
          <div className="border-border w-full max-w-md rounded-xl border bg-background-primary p-6">
            {status === 'ready' && updateInfo ? (
              <div className="text-center">
                <Text className="mb-4 block font-medium text-text-primary">
                  <RocketOutlined className="mr-2 text-primary-500" />
                  {t('about.ready')} (v{updateInfo.version})
                </Text>
                <Button
                  type="primary"
                  block
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleInstall}
                  className="h-12 text-lg"
                >
                  {t('about.restartBtn')}
                </Button>
              </div>
            ) : status === 'downloading' ? (
              <div className="w-full">
                <div className="mb-2 flex items-end justify-between">
                  <Text strong className="text-primary-500">
                    {t('about.downloading')}
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {progress?.percent}%
                  </Text>
                </div>
                <Progress
                  percent={progress?.percent || 0}
                  status="active"
                  strokeColor={{ '0%': '#14b8a6', '100%': '#2dd4bf' }}
                  showInfo={false}
                />
                <div className="mt-3 flex justify-between px-1">
                  <div className="flex flex-col">
                    <Text type="secondary" className="text-[10px] uppercase tracking-wider">
                      {t('about.speed', { speed: '' }).replace(': ', '')}
                    </Text>
                    <Text className="font-mono text-xs text-text-primary">{formatSpeed(progress?.bytesPerSecond)}</Text>
                  </div>
                  <div className="flex flex-col items-end">
                    <Text type="secondary" className="text-[10px] uppercase tracking-wider">
                      {t('about.description')}
                    </Text>
                    <Text className="font-mono text-xs text-text-primary">
                      {formatBytes(progress?.transferred || 0)} / {formatBytes(progress?.total || 0)}
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  type="primary"
                  ghost
                  size="large"
                  loading={status === 'checking'}
                  icon={status === 'checking' ? null : <SyncOutlined />}
                  onClick={handleCheckUpdate}
                  className="px-8"
                >
                  {status === 'checking' ? t('about.checking') : t('about.checkUpdates')}
                </Button>
                {isLatest && (
                  <div className="mt-3">
                    <Text type="secondary" className="text-xs italic">
                      {t('update.latest')}
                    </Text>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Divider dashed />

        {/* App Info & Links */}
        <div className="space-y-4 px-4">
          {appInfo?.description && (
            <Paragraph className="text-center italic leading-relaxed text-text-secondary">
              {appInfo.description}
            </Paragraph>
          )}

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {appInfo?.author && (
              <Space className="text-text-secondary">
                <UserOutlined />
                <Text type="secondary">{appInfo.author}</Text>
              </Space>
            )}
            {appInfo?.website && (
              <Space className="text-text-secondary">
                <GlobalOutlined />
                <a
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    window.open(appInfo.website, '_blank');
                  }}
                  className="text-primary-500 hover:text-primary-400 hover:underline"
                >
                  {t('about.website') || 'Website'}
                </a>
              </Space>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
