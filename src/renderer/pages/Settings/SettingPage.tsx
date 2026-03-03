import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Select, Divider, Typography, Switch, Button } from 'antd';
import { useAppTheme } from '@/renderer/hooks/useAppTheme';
import { CONFIG_KEYS, ThemeConfig } from '@/shared/constants';

const { Title, Text } = Typography;

/**
 * Simplified SettingPage for the Electron template.
 * Focuses on appearance and localization.
 */
const SettingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, isDarkMode } = useAppTheme();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleThemeModeChange = (mode: ThemeConfig['mode']) => {
    window.electron.config.save({
      key: CONFIG_KEYS.THEME,
      value: { ...theme, mode },
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background-primary p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <Title level={2} className="!mb-1 dark:!text-white">
            {t('settings.title')}
          </Title>
          <Text type="secondary">{t('about.description')}</Text>
        </div>

        {/* Appearance Settings */}
        <Card
          title={<span className="font-bold">{t('settings.appearance')}</span>}
          className="border-none shadow-sm dark:!bg-[#16162a]"
        >
          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong className="block dark:!text-white">
                {t('settings.theme')}
              </Text>
              <Text type="secondary" className="text-xs">
                {t('settings.appearance')}
              </Text>
            </div>
            <Select
              value={theme.mode}
              onChange={handleThemeModeChange}
              style={{ width: 140 }}
              options={[
                { value: 'light', label: t('settings.themeLight') },
                { value: 'dark', label: t('settings.themeDark') },
                { value: 'system', label: t('settings.themeSystem') },
              ]}
            />
          </div>
          <Divider className="my-4" />
          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong className="block dark:!text-white">
                {isDarkMode ? t('settings.themeDark') : t('settings.themeLight')}
              </Text>
              <Text type="secondary" className="text-xs">
                Current mode preview
              </Text>
            </div>
            <Switch checked={isDarkMode} disabled />
          </div>
        </Card>

        {/* Language Settings */}
        <Card
          title={<span className="font-bold">{t('settings.language')}</span>}
          className="border-none shadow-sm dark:!bg-[#16162a]"
        >
          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong className="block dark:!text-white">
                {t('settings.language')}
              </Text>
              <Text type="secondary" className="text-xs">
                Choose your preferred interface language
              </Text>
            </div>
            <Select
              value={i18n.language.startsWith('en') ? 'en' : 'zh'}
              onChange={handleLanguageChange}
              style={{ width: 140 }}
              options={[
                { value: 'zh', label: t('settings.languageZh') },
                { value: 'en', label: t('settings.languageEn') },
              ]}
            />
          </div>
        </Card>

        {/* System Info */}
        <Card
          title={<span className="font-bold">{t('settings.about')}</span>}
          className="border-none shadow-sm dark:!bg-[#16162a]"
        >
          <div className="space-y-4">
            <div className="flex justify-between">
              <Text type="secondary">{t('settings.version')}</Text>
              <Text strong className="dark:!text-white">
                1.0.0
              </Text>
            </div>
            <Button type="default" block onClick={() => window.electron.update.check()}>
              {t('settings.checkUpdates')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingPage;
