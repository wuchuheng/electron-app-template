import { app } from 'electron';
import pkg from '../../../../package.json';

export interface AppInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  website: string;
}

const getAppInfo = async (): Promise<AppInfo> => {
  const authorObj = pkg.author as { name: string } | string | undefined;
  const author = typeof authorObj === 'object' ? authorObj.name : authorObj;

  const website = pkg?.homepage || pkg.repository?.url || '';

  return {
    name: (pkg.productName as string) || app.getName(),
    version: app.getVersion(),
    description: (pkg.description as string) || 'Electron application template',
    author: author || 'Template Author',
    website: website || 'https://github.com/example/template',
  };
};

export default getAppInfo;
