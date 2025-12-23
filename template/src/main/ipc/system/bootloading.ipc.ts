import { createEvent } from '@/main/utils/ipc-helper';
import { BootloadingProgressing } from '@/types/electron';

const bootloading = createEvent<BootloadingProgressing>();

export default bootloading;
