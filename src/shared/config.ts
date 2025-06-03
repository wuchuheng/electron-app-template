import { BootloadingProcessing } from '../types/electron.d';
import { StrictConfig } from './config-utils';
import { createIpcChannel } from './ipc-channel';
import createSubscriptionChannel from './ipc-subscription';

// Use StrictConfig to ensure implementation matches Window["electron"] interface
export const config: StrictConfig = {
  window: {
    minimize: createIpcChannel<void, void>('window/minimize'),
    maximize: createIpcChannel<void, void>('window/maximize'),
    close: createIpcChannel<void, void>('window/close'),
  },

  system: {
    bootloading: createSubscriptionChannel<BootloadingProcessing>('system/bootloading'),
    getBootloadingProcessing: createIpcChannel<void, BootloadingProcessing>('system/getBootloadingProcessing'),
  },
};
