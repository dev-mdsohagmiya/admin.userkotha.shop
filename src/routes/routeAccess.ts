import { config } from "../config";
import { routePermissions } from "./routePermissionsConfig";

export interface Permission {
  module?: string;
  actions?: string[];
}

export interface Designation {
  permissions?: Permission[];
}

export interface RouteAccessUser {
  email?: string;
  role?: string;
  designation?: Designation;
}

export const checkAccess = (
  user: RouteAccessUser,
  roles?: string[],
  employeePermissions?: {
    module: string;
    action: string;
  },
  employeeModuleAnyOfActions?: {
    module: string;
    actions: string[];
  },
): boolean => {
  try {
    if (!user || typeof user !== "object") {
      return false;
    }

    const normalizedEmail = user.email?.trim().toLowerCase();

    const superAdminEmail = config?.supperAdminEmail?.trim()?.toLowerCase();

    const normalizedRole = user.role?.trim().toUpperCase();

    if (
      normalizedEmail &&
      superAdminEmail &&
      normalizedEmail === superAdminEmail
    ) {
      return true;
    }

    if (normalizedRole === "SUPER_ADMIN") {
      return true;
    }

    if (!roles && !employeePermissions && !employeeModuleAnyOfActions) {
      return true;
    }

    if (Array.isArray(roles) && roles.length > 0) {
      const hasRole = roles.some(
        (role) =>
          typeof role === "string" && role.toUpperCase() === normalizedRole,
      );

      if (!hasRole) {
        return false;
      }
    }

    if (!employeePermissions && !employeeModuleAnyOfActions) {
      return true;
    }

    if (normalizedRole !== "ADMIN") {
      return false;
    }

    const permissions = Array.isArray(user.designation?.permissions)
      ? user.designation.permissions
      : [];

    if (employeeModuleAnyOfActions) {
      const { module: moduleName, actions: requiredActions } =
        employeeModuleAnyOfActions;

      const modulePermission = permissions.find(
        (permission) =>
          permission?.module?.toLowerCase() === moduleName.toLowerCase(),
      );

      if (!modulePermission) {
        return false;
      }

      const userActions = Array.isArray(modulePermission.actions)
        ? modulePermission.actions.map((action) => String(action).toLowerCase())
        : [];

      const allowed = new Set(
        requiredActions.map((a) => String(a).toLowerCase()),
      );

      return userActions.some((a) => allowed.has(a));
    }

    if (employeePermissions) {
      const modulePermission = permissions.find(
        (permission) =>
          permission?.module?.toLowerCase() ===
          employeePermissions.module.toLowerCase(),
      );

      if (!modulePermission) {
        return false;
      }

      const actions = Array.isArray(modulePermission.actions)
        ? modulePermission.actions.map((action) => action.toLowerCase())
        : [];

      return actions.includes(employeePermissions.action.toLowerCase());
    }

    return true;
  } catch (error) {
    console.error("checkAccess error:", error);
    return false;
  }
};

export function isSuperAdminUser(user: RouteAccessUser): boolean {
  const normalizedEmail = user.email?.trim().toLowerCase();
  const superAdminEmail = config?.supperAdminEmail?.trim()?.toLowerCase();
  const normalizedRole = user.role?.trim().toUpperCase();
  return (
    (Boolean(normalizedEmail && superAdminEmail) &&
      normalizedEmail === superAdminEmail) ||
    normalizedRole === "SUPER_ADMIN"
  );
}

export function isAdminUser(user: RouteAccessUser): boolean {
  return user.role?.trim().toUpperCase() === "ADMIN";
}

/**
 * First static route (no `:param`) in `routePermissions` definition order
 * the user may open with the same rules as `protectRoute` (ADMIN + module).
 */
export function findFirstAccessibleStaticPath(
  user: RouteAccessUser,
): string | null {
  for (const [path, entry] of Object.entries(routePermissions)) {
    if (path.includes(":")) {
      continue;
    }
    const single =
      "action" in entry
        ? { module: entry.module, action: entry.action }
        : undefined;
    const anyOf =
      "actions" in entry && Array.isArray(entry.actions)
        ? { module: entry.module, actions: entry.actions }
        : undefined;
    if (checkAccess(user, ["ADMIN"], single, anyOf)) {
      return path;
    }
  }
  return null;
}

/**
 * Target for "Back to Dashboard" / post-404 home.
 * - No token or no user: `/`
 * - Super admin or non-ADMIN: `/`
 * - ADMIN with Dashboard `view`: `/`
 * - ADMIN without Dashboard `view`: first permitted static path, else `/login`
 */
export function getBackToHomeDestination(
  user: RouteAccessUser | null | undefined,
  hasToken: boolean,
): string {
  if (!hasToken || !user) {
    return "/";
  }
  if (isSuperAdminUser(user)) {
    return "/";
  }
  if (!isAdminUser(user)) {
    return "/";
  }
  if (
    checkAccess(
      user,
      ["ADMIN"],
      { module: "Dashboard", action: "view" },
      undefined,
    )
  ) {
    return "/";
  }
  return findFirstAccessibleStaticPath(user) ?? "/login";
}

/** Paths that should not be restored as-is after login — use permission-aware home. */
const POST_LOGIN_USE_HOME_PATHS = new Set(["/", "/login", "/404"]);

/**
 * Where to send the user after successful login.
 * - `from` is `/`, login, 404, or empty → same rules as {@link getBackToHomeDestination}.
 * - `from` is a route in `routePermissions` but user lacks access → home (first module / login).
 * - `from` not in map → keep `from` (e.g. future public paths).
 */
export function getPostLoginNavigatePath(
  fromPath: string | undefined,
  user: RouteAccessUser | null | undefined,
): string {
  const normalized = (fromPath ?? "").trim() || "/";
  const home = getBackToHomeDestination(user, Boolean(user));

  if (POST_LOGIN_USE_HOME_PATHS.has(normalized)) {
    return home;
  }

  if (!user) {
    return normalized;
  }

  const entry = routePermissions[normalized];
  if (!entry) {
    return normalized;
  }

  const single =
    "action" in entry
      ? { module: entry.module, action: entry.action }
      : undefined;
  const anyOf =
    "actions" in entry && Array.isArray(entry.actions)
      ? { module: entry.module, actions: entry.actions }
      : undefined;

  if (checkAccess(user, ["ADMIN"], single, anyOf)) {
    return normalized;
  }

  return home;
}
