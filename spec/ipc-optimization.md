# Blueprint: Ultra-Simple Functional IPC (Zero-Config)

## 1. Objective (The "Purpose")
The goal is to eliminate the 4-step "hassle" of Electron IPC development. 

### Current Situation (The "Hassle")
Currently, adding a new API requires manual synchronization across 4 files. If any step is missed, the program is incomplete.
- **Step 1 (Types)**: Manually edit `src/types/electron.d.ts` to add the method to the global `Window` interface.
- **Step 2 (Config)**: Manually edit `src/shared/config.ts` to map the string channel.
- **Step 3 (Handler)**: Manually call `config.module.method.handle(...)` in an IPC file.
- **Step 4 (Usage)**: Use it in the UI.

#### Reference: The Redundant Bridge (`src/shared/config.ts`)
```typescript
// THIS IS THE REDUNDANCY WE ARE ELIMINATING
export const config: StrictConfig = {
  welcome: {
    getWelcome: createIpcChannel<void, Welcome>('welcome/getWelcome'),
  },
};
```

---

## 2. Phase 1: Core Utilities (`src/main/utils/ipc-helper.ts`)
Implement the functional building blocks for events.

- **`createEvent<T>()`**: Returns a trigger function. 
    - In **Main**: Call `myEvent(data)` to broadcast.
    - Meta: Carries `_isEvent: true` so the loader knows it's a subscription.
- **`registerEvent(channel, eventFn)`**: Internal utility that manages a `Map<Channel, Set<WebContents>>` to handle multi-window broadcasting and automatic cleanup on window destruction.

---

## 3. Phase 2: Runtime Discovery (`src/main/ipc/index.ts`)
Automate the registration using Webpack's `require.context`.

- **Convention**: `src/main/ipc/<module>/<function>.ipc.ts`.
- **Logic**: 
    - Iterates through all `.ipc.ts` files.
    - If `_isEvent` is present: Call `registerEvent`.
    - Otherwise: Bind to `ipcMain.handle("<module>:<function>", handler)`.

---

## 4. Phase 3: Type & Manifest Synchronization (`scripts/sync-ipc-types.js`)
This phase bridges the File-System to the TypeScript compiler.

### Understanding the Type Files
- **`src/types/electron.d.ts`**: This is the container for **Business Logic Types**. It defines data structures like `Pagination<T>`, `Welcome`, or `User`. It should **not** contain manual API definitions anymore.
- **`src/types/generated-electron-api.d.ts`**: This file is created by the script. It uses `typeof import(...)` to extract the exact function signatures from your `.ipc.ts` files.

### The "Active Constraint" Mechanism
The sync script generates a global augmentation:
```typescript
declare global {
  interface Window {
    electron: GeneratedElectronApi;
  }
}
```
**Why this is safe**: Because `window.electron` is now strictly typed against the *actual* code in the Main process, the UI developer is "restrained" (forced) to use only valid modules and functions. If you delete an IPC file, the sync script removes it from the manifest, and the UI code will immediately show a red compiler error.

---

## 5. Phase 4: The Safe Bridge (`src/preload/preload.ts`)
Expose the API to the Renderer process securely.

- **The Manifest**: Uses `src/shared/ipc-manifest.json` (generated in Phase 3) as a roadmap.
- **Object Assembly**: Preload iterates the manifest and builds a standard JS object.
- **Safety**: By assembling a standard object (not a Proxy), we avoid the "Object could not be cloned" error in Electron's `contextBridge`.

---

## 6. Implementation Examples

### A. Request-Response (Invoke)
**File**: `src/main/ipc/user/getProfile.ipc.ts`
```typescript
/** Inferred types for UI: (userId: string) => Promise<User> */
export default async (userId: string) => {
  return await userService.findById(userId);
};
```

### B. Broadcasting (Event)
**File**: `src/main/ipc/user/onPowerStatus.ipc.ts`
```typescript
import { createEvent } from '../../utils/ipc-helper';
/** Inferred types for UI: (cb: (payload: string) => void) => UnsubscribeFn */
export default createEvent<'low' | 'normal' | 'full'>();
```

### C. UI Usage (React Example)
```tsx
useEffect(() => {
  // Types are enforced! window.electron.user is identified automatically.
  return window.electron.user.onPowerStatus((status) => {
    console.log(status); // status is typed as 'low' | 'normal' | 'full'
  });
}, []);
```

---

## 7. Migration Guide (Before vs After)

| Feature | Old "Hassle" Way | New "Zero-Config" Way |
| :--- | :--- | :--- |
| **Setup** | Manually edit `electron.d.ts` AND `config.ts` | **None**. Create the file and go. |
| **Logic** | Add to a monolithic `xxx.ipc.ts` file | Create `ipc/<module>/<function>.ipc.ts` |
| **Types** | Write interfaces manually | **Automatic**. "Stolen" from implementation. |
| **Events** | Manually manage `ipcRenderer.on` | **Functional**. Returns `unsub` automatically. |
| **Total Steps** | 4 Steps | **2 Steps** |