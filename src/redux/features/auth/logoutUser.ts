import { clearAllCart } from "../cart/cartSlice";
import { clearCart as clearNewOrderCart } from "../newOrder/newOrderCartSlice";
import type { AppDispatch } from "../store";
import { logout } from "./authSlice";

const USER_LOCAL_STORAGE_KEYS = ["token", "user", "previewProductData"] as const;

const USER_LOCAL_STORAGE_PREFIXES = ["table_columns_", "persist:"] as const;

/** Remove auth tokens, redux-persist slices, and other session-scoped localStorage keys. */
export function clearUserLocalStorage(): void {
  try {
    for (const key of USER_LOCAL_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        USER_LOCAL_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear user localStorage:", error);
  }
}

/** Clear Redux auth/cart state, RTK Query cache, localStorage, and redux-persist. */
export async function performLogout(dispatch: AppDispatch): Promise<void> {
  dispatch(logout());
  dispatch(clearAllCart());
  dispatch(clearNewOrderCart());

  const [{ baseApi }, { persistor }] = await Promise.all([
    import("../../api/baseApi"),
    import("../store"),
  ]);

  dispatch(baseApi.util.resetApiState());
  clearUserLocalStorage();
  await persistor.purge();
}

export const logoutUser = () => (dispatch: AppDispatch) =>
  performLogout(dispatch);
