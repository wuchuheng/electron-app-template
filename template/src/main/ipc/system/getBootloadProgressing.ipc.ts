import { getCurrentProcessing } from '../../services/bootload.service';

const getBootloadProgressing = async () => {
  return getCurrentProcessing();
};

export default getBootloadProgressing;
