import { useContext } from 'react';
import { messageApiContext } from '../context/MessageContext';
import { MessageInstance } from 'antd/es/message/interface';

export const useMessage = (): MessageInstance => {
  const messageApi = useContext(messageApiContext);

  if (!messageApi) {
    throw new Error('useMessage must be used within a messageApiContext.Provider');
  }

  return messageApi;
};
