import React, { useState, useCallback, useEffect } from 'react';
import { useUpdateSystem } from '../../hooks/useUpdateSystem';
import { Button, Typography, Space, Divider, Tag, message } from 'antd';
import { RocketOutlined, CalendarOutlined, HddOutlined, CheckCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';
import { formatBytes, formatReleaseNotes } from '@/shared/update-types';
import { WindowControlButtons } from '../../components/WindowControlButtons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const DialogHeader: React.FC<{ version: string }> = ({ version }) => {
  const { t } = useTranslation();
  return (
    <div className="no-drag mb-2 text-center">
      <Space direction="vertical" align="center" size={0}>
        <div className="mb-2 rounded-full bg-green-500/10 p-3">
          <RocketOutlined className="text-4xl text-green-500" />
        </div>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {t('update.title')}
          </Title>
          <Tag color="blue" className="mt-1">
            {t('update.newVersion', { version })}
          </Tag>
        </div>
      </Space>
    </div>
  );
};

const VersionMeta: React.FC<{ size: number; date: string }> = ({ size, date }) => (
  <div className="no-drag mb-4 flex items-center justify-around rounded-lg bg-background-secondary p-3">
    <Space>
      <HddOutlined className="text-gray-400" />
      <Text type="secondary">{formatBytes(size)}</Text>
    </Space>
    <Divider type="vertical" />
    <Space>
      <CalendarOutlined className="text-gray-400" />
      <Text type="secondary">{dayjs(date).format('YYYY-MM-DD')}</Text>
    </Space>
  </div>
);

const ReleaseNotes: React.FC<{ notes: string }> = ({ notes }) => {
  const { t } = useTranslation();
  return (
    <div className="no-drag mb-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header / Title Bar */}
      <div className="border-b border-gray-200 bg-background-secondary px-4 py-2 dark:border-gray-700">
        <Text strong className="text-xs uppercase tracking-wider text-text-secondary">
          {t('update.releaseNotes')}
        </Text>
      </div>
      {/* Content Section with Scrollbar */}
      <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex-1 overflow-y-auto bg-white/50 p-4 dark:bg-black/10">
        <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary">
          <ReactMarkdown>{notes || t('update.noDescription')}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export const UpdateDialog: React.FC = () => {
  const { t } = useTranslation();
  const { info, status, error, installAndRestart } = useUpdateSystem();
  const [isRestarting, setIsRestarting] = useState(false);

  useEffect(() => {
    const appName = t('appName');
    document.title = t('update.windowTitle', { appName });
  }, [t]);

  const handleRestart = useCallback(async () => {
    if (isRestarting) return;

    setIsRestarting(true);
    try {
      await installAndRestart();
    } catch {
      setIsRestarting(false);
      message.error(t('update.error'));
    }
  }, [isRestarting, installAndRestart, t]);

  const handleClose = useCallback(() => {
    window.electron.window.hide();
  }, []);

  // Only show when update is ready
  if (status !== 'ready' || !info) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-primary text-text-secondary">
        {t('update.loading')}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden border border-gray-100 bg-background-primary dark:border-gray-800">
      {/* Title bar */}
      <div className="titlebar drag flex h-titlebar select-none items-center justify-end px-2 py-2 text-text-primary">
        <WindowControlButtons showMinimize={false} showMaximize={false} onClose={handleClose} />
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-6 pt-0">
        <DialogHeader version={info.version} />

        <Divider style={{ margin: '12px 0' }} />

        <VersionMeta size={info.files?.[0]?.size || 0} date={info.releaseDate} />

        <ReleaseNotes notes={formatReleaseNotes(info.releaseNotes)} />

        {error && (
          <div className="no-drag mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="no-drag mt-auto pb-6 pt-4">
          <Button
            type="primary"
            block
            size="large"
            icon={<CheckCircleOutlined />}
            loading={isRestarting}
            onClick={handleRestart}
            style={{ height: '48px', fontSize: '16px' }}
          >
            {t('update.restartBtn')}
          </Button>
          <div className="mt-2 text-center text-xs text-gray-400">{t('update.restarting')}</div>
        </div>
      </div>
    </div>
  );
};
