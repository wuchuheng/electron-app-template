import * as welcomeService from '../../services/welcome.service';

const getWelcome = async () => {
  const result = await welcomeService.getWelcome();
  return result;
};

export default getWelcome;
