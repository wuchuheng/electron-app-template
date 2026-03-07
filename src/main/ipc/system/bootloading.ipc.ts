import { createEvent } from '@wuchuheng/electron-template-core';
import { BootloadingProgressing } from '@/types/electron';

const bootloading = createEvent<BootloadingProgressing>();

export default bootloading;
