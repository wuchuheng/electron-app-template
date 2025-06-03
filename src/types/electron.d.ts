export type Pagination<T> = {
  page: number;
  total: number;
  limit: number;
  items: T[];
};

export type BootloadingProcessing = {
  progress: number;
  title: string;
};

declare global {
  interface Window {
    electron: {
      /**
       * Group of window methods
       */
      window: {
        /**
         * Minimize the window
         */
        minimize: () => Promise<void>;
        /**
         * Maximize the window
         */
        maximize: () => Promise<void>;

        /**
         * Close the window
         */
        close: () => Promise<void>;
      };

      /**
       * Group of system methods
       */
      system: {
        /**
         * Bootloading method
         * @param callback - Callback function to be called with the bootloading data
         * @returns - Function to stop the bootloading
         */
        bootloading: (callback: (data: BootloadingProcessing) => void) => () => void;

        /**
         * Get the bootloading processing
         * @returns - Bootloading processing data
         */
        getBootloadingProcessing: () => Promise<BootloadingProcessing>;
      };
    };
  }
}
