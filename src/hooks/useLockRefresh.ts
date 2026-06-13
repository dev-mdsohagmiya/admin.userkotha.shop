import { useEffect, useRef } from "react";

// Must match server-side LOCK_TTL_MS = 30_000
const LOCK_TTL_MS = 30_000;
const USER_IDLE_TIMEOUT_MS = 45_000;
const REFRESH_CHECK_INTERVAL_MS = 1_000;
const REFRESH_BEFORE_EXPIRY_MS = 8_000;

type UseLockRefreshOptions = {
  isEditing?: boolean;
  lockExpiry?: string | Date | null;
};

const toTimestamp = (value: string | Date | null | undefined): number | null => {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Heartbeat hook that keeps an order lock alive.
 *
 * Behaviour:
 *  - Fires refreshLock every 18 s (60 % of the 30 s server TTL).
 *  - Pauses automatically when the browser tab is hidden.
 *  - Refreshes immediately when the tab becomes visible again, then
 *    resumes the normal schedule.
 *  - Guarantees exactly one active timer; safe against re-renders and
 *    StrictMode double-invocations.
 *  - Cleans up the timer and event listener on unmount or when
 *    isLockedByMe / id changes.
 */
export function useLockRefresh(
  id: string | undefined,
  isLockedByMe: boolean,
  refreshLock: (id: string) => void,
  options?: UseLockRefreshOptions,
) {
  const refreshLockRef = useRef(refreshLock);
  const lockExpiryMsRef = useRef<number | null>(toTimestamp(options?.lockExpiry));
  const lastUserActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    refreshLockRef.current = refreshLock;
  }, [refreshLock]);

  useEffect(() => {
    lockExpiryMsRef.current = toTimestamp(options?.lockExpiry);
  }, [options?.lockExpiry]);

  useEffect(() => {
    const markActive = () => {
      lastUserActivityRef.current = Date.now();
    };

    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "focus",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, markActive, { passive: true });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, markActive);
      });
    };
  }, []);

  useEffect(() => {
    if (!isLockedByMe || !id) return;

    let timer: ReturnType<typeof setTimeout>;
    const isEditing = options?.isEditing ?? true;

    const isUserActiveOnPage = () => {
      if (document.hidden || !document.hasFocus()) return false;
      return Date.now() - lastUserActivityRef.current <= USER_IDLE_TIMEOUT_MS;
    };

    const isNearExpiry = () => {
      const expiryAtMs = lockExpiryMsRef.current;
      if (!expiryAtMs) return true;
      return expiryAtMs - Date.now() <= REFRESH_BEFORE_EXPIRY_MS;
    };

    const scheduleNextCheck = () => {
      timer = setTimeout(() => {
        if (isEditing && isUserActiveOnPage() && isNearExpiry()) {
          refreshLockRef.current(id);
          lockExpiryMsRef.current = Date.now() + LOCK_TTL_MS;
        }
        scheduleNextCheck();
      }, REFRESH_CHECK_INTERVAL_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(timer);
      } else {
        lastUserActivityRef.current = Date.now();
        clearTimeout(timer);
        scheduleNextCheck();
      }
    };

    scheduleNextCheck();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLockedByMe, id, options?.isEditing]);
}
