import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { toast } from "react-toastify";
import { config } from "../../config";
import { setUser } from "../features/auth/authSlice";
import { performLogout } from "../features/auth/logoutUser";
import type { AppDispatch } from "../features/store";
import { RootState } from "../features/store";

// ======================
// IP Fetch (cached per tab — avoids extra outbound call on every API request)
// ======================
let cachedClientIP: string | null = null;

const getClientIP = async (): Promise<string> => {
  if (cachedClientIP) {
    return cachedClientIP;
  }
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data: { ip: string } = await res.json();
    cachedClientIP = data?.ip || "Unknown";
    return cachedClientIP;
  } catch {
    cachedClientIP = "Unknown";
    return cachedClientIP;
  }
};

// ======================
// Construct Client Metadata
// ======================
interface ClientDetails {
  ipAddress: string;
  userAgent: string;
  browserUrl: string;
  accessedAt: string;
}

const getClientDetails = async (): Promise<ClientDetails> => {
  const ipAddress = await getClientIP();
  const userAgent = navigator.userAgent || "Unknown";
  const browserUrl = window.location.href;

  return {
    ipAddress,
    userAgent,
    browserUrl,
    accessedAt: new Date().toISOString(),
  };
};

// ======================
// Base Query
// ======================
const rawBaseQuery = fetchBaseQuery({
  baseUrl: config.api_url,
  credentials: "include",
  prepareHeaders: async (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.token;

    if (token && !headers.get("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
    }

    const clientDetails = await getClientDetails();
    headers.set("X-Client-Details", JSON.stringify(clientDetails));

    // Optional: send current action name
    headers.set("X-Action", endpoint);

    return headers;
  },
});

// ======================
// Custom Base Query with Token Refresh
// ======================
// Mutex-like promise to handle multiple simultaneous 401s
type RefreshOutcome = string | null | "RATE_LIMITED";
let refreshPromise: Promise<RefreshOutcome> | null = null;

const baseQueryWithRefreshToken: BaseQueryFn<
  string | FetchArgs, // request type
  unknown, // response type
  FetchBaseQueryError // error type
> = async (args, api, extraOptions) => {
  // Wait for any ongoing refresh to complete before proceeding
  if (refreshPromise) {
    await refreshPromise;
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error) {
    console.log("📡 API Error Detected. Status:", result.error.status);
  }

  // Check for 401 errors - can be status 401 or nested in error.data
  const is401Error =
    result?.error?.status === 401 ||
    (result?.error?.data &&
      typeof result.error.data === "object" &&
      "error" in result.error.data &&
      (result.error.data as any).error?.statusCode === 401);

  if (is401Error) {
    console.warn("⚠️ Access Token Expired. Attempting to refresh token...");
    // If not already refreshing, start a refresh
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const state = api.getState() as RootState;
          const refreshToken = state.auth.refreshToken;

          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          // Call refresh token endpoint
          // Note: Backend Controller takes authorization from headers
          const refreshResult = await rawBaseQuery(
            {
              url: "/auth/refresh-token",
              method: "POST",
              headers: {
                // Ensure we send it in a way the backend expects
                // If it fails, try adding "Bearer " prefix or check backend's expectation
                authorization: refreshToken, 
              },
            },
            api,
            extraOptions,
          );

          if (refreshResult.data && (refreshResult.data as any).success) {
            const newToken = (refreshResult.data as any).data.accessToken;
            const user = state.auth.user;
            const currentRefreshToken = state.auth.refreshToken;

            // Update state with new token
            api.dispatch(
              setUser({
                user: user!,
                token: newToken,
                refreshToken: currentRefreshToken!,
              }),
            );

            // Save to localStorage as well
            localStorage.setItem("token", newToken);

            return newToken;
          }

          if (refreshResult.error) {
            console.error("Token refresh API error:", refreshResult.error);
            if (refreshResult.error.status === 429) {
              throw new Error("RATE_LIMITED");
            }
          }

          throw new Error("Token refresh failed");
        } catch (error) {
          console.error("Refresh Promise Error:", error);
          if (error instanceof Error && error.message === "RATE_LIMITED") {
            return "RATE_LIMITED";
          }
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const refreshOutcome = await refreshPromise;
    console.log(
      "🔍 Refresh Promise Resolved with:",
      refreshOutcome === "RATE_LIMITED"
        ? "RATE LIMITED"
        : refreshOutcome
          ? "New Token Found"
          : "NULL",
    );

    if (refreshOutcome === "RATE_LIMITED") {
      toast.error("Too many requests. Please try again shortly.", {
        toastId: "rate-limit",
      });
      return result;
    }

    if (refreshOutcome) {
      console.log("✅ Token Refreshed Successfully. Retrying original request...");
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, perform logout
      let errorMessage = "Unauthorized! Please log in again.";

      // Handle nested error structures from the server
      if (result?.error?.data && typeof result.error.data === "object") {
        const errorData = result.error.data as any;
        errorMessage = errorData.message || errorData.error?.message || errorData.error || errorMessage;
      }

      // If it's a 401 and refresh failed, we must show the message and logout
      toast.error(errorMessage || "Session expired. Please login again.", {
        toastId: "session-expired",
      });

      await performLogout(api.dispatch as AppDispatch);

      try {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      } catch {
        window.location.href = "/login";
      }
    }
  }

  if (result?.error?.status === 404) {
    toast.error(
      result.error.data &&
        typeof result.error.data === "object" &&
        "message" in result.error.data
        ? (result.error.data as { message?: string }).message || "Not found."
        : "Not found.",
    );
  }

  return result;
};

// ======================
// Base API
// ======================
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: [
    "users",
    "user_profile",
    "media",
    "folders",
    "settings",
    "units",
    "categories",
    "products",
    "brands",
    "stock",
    "requisitions-approval",
    "materials",
    "packaging-materials",
    "folders",
    "ProductBOM",
    "purchases",
    "product-purchases",
    "vat",
    "comboProducts",
    "productCategories",
    "warehouses",
    "suppliers",
    "supplierPayments",
    "requisitions",
    "designations",
    "employees",
    "purchase-stats",
    "purchase-payments",
    "purchase-returns",
    "purchase-needs",
    "customers",
    "sales",
    "Production",
    "packagingBOM",
    "blogs",
    "productTypes",
    "homepage-sections",
    "group-wise-content",
    "hot-deals",
    "about-page-sections",
    "blog-page",
    "privacy-policy",
    "terms-conditions",
    "return-policy",
    "reviews",
    "subscribers",
    "product-addons",
    "DeliveryCharge",
    "Coupon",
    "orders",
    "orderSources",
    "shippingNotes",
    "sales-stats",
    "reports",
    "productRecipe",
    "auto-sms",
  ],
  endpoints: () => ({}),
});
