# Fix 9 TypeScript Type-Check Errors from `npm run lint`

**Date:** 2026-06-09  
**Status:** draft  
**Scope:** Fix all 9 type errors reported by `vue-tsc --noEmit` without changing runtime behavior.

---

## Error Categories

The 9 errors fall into 5 categories:

| # | Category | Files | Count |
|---|----------|-------|-------|
| 1 | Missing initializer (strictPropertyInitialization) | `config.entity.ts` | 1 |
| 2 | `unknown` catch binding passed to typed param | `save.ipc.ts`, `windowFactory.ts` | 2 |
| 3 | Incompatible `UpdateInfo` type (null in upstream) | `update.service.ts` | 2 |
| 4 | Preload event handler type mismatch | `preload.ts` | 1 |
| 5 | Template/vue-i18n type issues | `AppAboutContent.vue`, `MainLayout.vue`, `UpdateDialog.vue` | 3 |

---

## Fix Details

### Fix 1 — `src/main/database/entities/config.entity.ts:6`

**Error:** `TS2564: Property 'key' has no initializer and is not definitely assigned in the constructor.`

**Root cause:** `strictPropertyInitialization` (from `strict: true`) requires class properties to be initialized or marked with `!`. TypeORM's `@PrimaryColumn()` decorator doesn't satisfy this check.

**Fix:** Add definite assignment assertion:
```diff
-  key: string;
+  key!: string;
```

---

### Fix 2 — `src/main/ipc/config/save.ipc.ts:25` and `src/main/windows/windowFactory.ts:232`

**Error:** `TS2345: Argument of type 'unknown' is not assignable to parameter of type 'SOURCE | undefined'.`

**Root cause:** In strict mode, `catch` bindings are `unknown`. `logger.error()` signature is `(message: string, source?: SOURCE)` where `SOURCE = 'SYSTEM' | 'DEVICE'`. Passing the raw error as a second argument fails because `unknown` doesn't match `SOURCE | undefined`.

**Fix (save.ipc.ts:25):**
```diff
-      logger.error('Failed to set login item settings:', error);
+      logger.error('Failed to set login item settings: ' + String(error));
```

**Fix (windowFactory.ts:232):**
```diff
-          logger.error('Error checking runInBackground config:', error);
+          logger.error('Error checking runInBackground config: ' + String(error));
```

---

### Fix 3 — `src/main/services/update.service.ts:53,83`

**Error:** `TS2322: Type '...electron-updater...UpdateInfo' is not assignable to type '...shared/update-types...UpdateInfo'` — `releaseNotes` has `null` in the upstream type but not in the shared type.

**Root cause:** `electron-updater`'s `UpdateInfo.releaseNotes` is `string | ReleaseNoteInfo[] | null | undefined`. The shared `UpdateInfo.releaseNotes` is `string | Array<{ version: string; note: string }> | undefined` — missing `null`. When `setState()` is called with the upstream `info`, the `null` possibility causes a structural incompatibility.

**Fix (src/shared/update-types.ts:16):**
```diff
-  releaseNotes?: string | Array<{ version: string; note: string }>;
+  releaseNotes?: string | Array<{ version: string; note: string }> | null;
```

---

### Fix 4 — `src/preload/preload.ts:28`

**Error:** `TS2322: Type '(listener: (payload: unknown) => void) => () => void' is not assignable to type '(...args: unknown[]) => unknown'`

**Root cause:** The `api` object is typed as `Record<string, Record<string, (...args: unknown[]) => unknown>>`. Event-type IPC methods return `(listener) => () => void` (the unsubscribe function), but this doesn't match `(...args: unknown[]) => unknown` because a function parameter `listener: (payload: unknown) => void` is not assignable to spread `...args: unknown[]`.

**Fix:** Widen the return type to avoid contravariance issues:
```diff
-  const api: Record<string, Record<string, (...args: unknown[]) => unknown>> = {};
+  const api: Record<string, Record<string, (...args: any[]) => any>> = {};
```

---

### Fix 5 — `src/renderer/components/AppAboutContent.vue:172`

**Error:** `TS2339: Property 'window' does not exist on type '{ loading: boolean; logo: string; ... }'`

**Root cause:** In Vue 3 `<script setup>`, template expressions resolve identifiers on the component instance. The global `window` is not exposed on the component instance, so `@click.prevent="window.open(...)"` fails type-checking.

**Fix:** Define a helper in `<script setup>`:
```diff
+function openWebsite(url: string) {
+  window.open(url, '_blank')
+}
```
And in the template:
```diff
-              @click.prevent="window.open(appInfo.website, '_blank')"
+              @click.prevent="openWebsite(appInfo.website!)"
```

---

### Fix 6 — `src/renderer/layouts/MainLayout.vue:11`

**Error:** `TS2339: Property 'i18n' does not exist on type 'Composer<...>'`

**Root cause:** vue-i18n v10+ `useI18n()` returns a `Composer` instance. The `i18n` property was removed in v10; `locale` is now a direct Ref on the Composer object.

**Fix:**
```diff
-const { i18n } = useI18n()
+const { locale } = useI18n()
```
And update usage at line 19-20:
```diff
-function onToggleLanguage() {
-  const newLang = i18n.locale.value.startsWith('en') ? 'zh' : 'en'
-  i18n.locale.value = newLang
+function onToggleLanguage() {
+  const newLang = locale.value.startsWith('en') ? 'zh' : 'en'
+  locale.value = newLang
```

---

### Fix 7 — `src/renderer/pages/UpdateDialog.vue:105`

**Error:** `TS2345: Argument of type 'string | { version: string; note: string; }[]' is not assignable to parameter of type 'string'.`

**Root cause:** `info.releaseNotes` is `string | Array | undefined`. `|| ''` only guards `undefined`, so the array variant reaches `renderMarkdown()` which accepts only `string`. The `formatReleaseNotes()` helper already exists in `update-types.ts` and handles both formats.

**Fix:** Use the existing `formatReleaseNotes` helper:
```diff
-              v-html="renderMarkdown(info.releaseNotes || '')"
+              v-html="renderMarkdown(formatReleaseNotes(info.releaseNotes))"
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/main/database/entities/config.entity.ts` | Add `!` to `key` property |
| `src/main/ipc/config/save.ipc.ts` | String-interpolate error in `logger.error()` |
| `src/main/windows/windowFactory.ts` | String-interpolate error in `logger.error()` |
| `src/shared/update-types.ts` | Add `\| null` to `releaseNotes` type |
| `src/main/services/update.service.ts` | No change needed (consumes the fixed shared type) |
| `src/preload/preload.ts` | Widen `api` type to `any[]` |
| `src/renderer/components/AppAboutContent.vue` | Add `openWebsite` helper, use in template |
| `src/renderer/layouts/MainLayout.vue` | Replace `i18n` with `locale` from `useI18n()` |
| `src/renderer/pages/UpdateDialog.vue` | Use `formatReleaseNotes()` instead of `\|\| ''` |

## Verification

After all fixes, run:
```bash
npm run typecheck   # vue-tsc --noEmit — should pass with 0 errors
npm run lint        # typecheck + eslint — should pass
```
