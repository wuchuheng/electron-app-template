export type BootloadingProgressing = {
  progress: number;
  title: string;
};

export type VerifyAuthorizationResult = {
  isValid: boolean;
  error?: string;
  expiredAt?: number;
};

// Add common pagination types if needed for future features
export type Pagination<T> = {
  page: number;
  total: number;
  limit: number;
  items: T[];
};

export type PaginationInput = {
  page: number;
  limit: number;
};
