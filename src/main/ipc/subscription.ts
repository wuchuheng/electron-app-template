import { config } from '../../shared/config';
import { BootloadingProcessing } from '../../types/electron';

const bootloadingSubscription = config.system.bootloading.server();
export const bootloadingBroadcast = (input: BootloadingProcessing) => {
  bootloadingSubscription.broadcast(input);
};
