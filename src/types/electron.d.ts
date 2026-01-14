export type Pagination<T> = {
  page: number;
  total: number;
  limit: number;
  items: T[];
};

export type BootloadingProgressing = {
  progress: number;
  title: string;
};

// Generated window.electron API lives in generated-electron-api.d.ts
/// <reference path="./generated-electron-api.d.ts" />
