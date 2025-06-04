import { useTranslation } from 'react-i18next';

export const Home = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="bg-background-secondary rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-primary-600 mb-4">{t('home.title')}</h1>

        <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="text-green-700 dark:text-green-300 font-medium">{t('home.successMessage')}</p>
          </div>
        </div>

        <p className="text-text-secondary mb-6">{t('home.description')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-background-primary p-4 rounded border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">
              {t('home.gettingStarted.title')}
            </h3>
            <p className="text-text-secondary text-sm">{t('home.gettingStarted.description')}</p>
          </div>
          <div className="bg-background-primary p-4 rounded border border-primary-200 dark:border-primary-800">
            <h3 className="font-semibold text-primary-600 dark:text-primary-400 mb-2">{t('home.needHelp.title')}</h3>
            <p className="text-text-secondary text-sm">{t('home.needHelp.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
