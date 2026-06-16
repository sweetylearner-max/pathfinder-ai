/**
 * Next.js instrumentation hook — runs once when the server starts.
 *
 * Node.js 22+ may expose a broken global `localStorage` during SSR where
 * `typeof localStorage !== "undefined"` passes but `getItem` is not a function.
 * Libraries like Clerk and next-themes then crash with:
 *   TypeError: localStorage.getItem is not a function
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  sanitizeBrokenWebStorage("localStorage");
  sanitizeBrokenWebStorage("sessionStorage");
}

function sanitizeBrokenWebStorage(name) {
  const storage = globalThis[name];

  if (storage === undefined || storage === null) {
    return;
  }

  if (typeof storage.getItem !== "function") {
    try {
      delete globalThis[name];
    } catch {
      globalThis[name] = undefined;
    }
  }
}
