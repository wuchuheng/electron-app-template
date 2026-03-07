import { exposeElectronApi } from '@wuchuheng/electron-template-core';
import manifestRaw from '../shared/ipc-manifest.json';

exposeElectronApi(manifestRaw);
