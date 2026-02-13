/**
 * Utility functions for working with IPC configurations
 */
import { IpcChannel } from './ipc-channel';
import { SubscriptionChannel } from './ipc-subscription';

// Get the Window["electron"] type
type ElectronApi = Window['electron'];

/**
 * Helper type to extract the parameter type from a function
 */
type FirstParameter<T> = T extends (param: infer P) => unknown ? P : never;

/**
 * Maps a method in Window["electron"] to the appropriate channel type
 */
type MapMethodToChannel<T> =
  // If it's a function that returns a Promise
  T extends (...args: unknown[]) => Promise<infer R>
    ? IpcChannel<FirstParameter<T>, R>
    : // If it's a function that takes a callback
      T extends (callback: (data: infer D) => void) => unknown
      ? SubscriptionChannel<D>
      : // Fallback - should not happen with well-typed Window["electron"]
        never;

/**
 * Automatically maps Window["electron"] interface to IPC channel types
 */
export type StrictConfig = {
  [M in keyof ElectronApi]: {
    [K in keyof ElectronApi[M]]: MapMethodToChannel<ElectronApi[M][K]>;
  };
};

/**
 * Deeply converts a config object to a preload-friendly format
 * by extracting the 'request' property from each leaf node
 *
 * @param config The source configuration object
 * @returns A new object with the same structure but each leaf value replaced with its .request property
 */
export function createPreloadConfig<T extends Record<string, unknown>>(config: T): unknown {
  // Helper function to recursively process each level
  function processValue(value: unknown): unknown {
    // If it's not an object or is null, return it as is
    if (value === null || typeof value !== 'object') {
      return value;
    }

    // If it has a request property, it's a leaf node (IPC channel)
    if ('request' in value) {
      return (value as { request: unknown }).request;
    }

    // Otherwise it's a branch node, process its children
    const result: Record<string, unknown> = {};
    const obj = value as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = processValue(obj[key]);
      }
    }
    return result;
  }

  return processValue(config);
}

/**
 * Type-safe version of createPreloadConfig that preserves the structure
 * of the original config type but replaces leaf values with their request property type
 */
export type PreloadConfig<T> = {
  [K in keyof T]: T[K] extends { request: infer R } ? R : T[K] extends object ? PreloadConfig<T[K]> : T[K];
};
