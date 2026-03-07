import { createEvent } from '@wuchuheng/electron-template-core';
import type { UpdateState } from '@/shared/update-types';

export const onStatusChange = createEvent<UpdateState>();
export default onStatusChange;
