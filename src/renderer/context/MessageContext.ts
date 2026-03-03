import { createContext } from 'react';
import { MessageInstance } from 'antd/es/message/interface';

/**
 * Shared context for Ant Design message API to avoid circular dependencies
 * and ensure path consistency.
 */
export const messageApiContext = createContext<MessageInstance | null>(null);
