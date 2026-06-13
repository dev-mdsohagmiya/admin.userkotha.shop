import { config } from "../config";
import { DESIGNATION_MODULE_ACTIONS } from "../constants/designationModuleActions";

type Permission = {
  module?: string;
  actions?: string[] | string | unknown;
};

function parseActionsArray(actionsRaw: unknown): string[] {
  let parsed: unknown = actionsRaw;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((a): a is string => typeof a === "string")
    .map((a) => a.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Normalize designation.permissions from API (array or JSON string).
 */
function normalizePermissionsRows(
  raw: Permission[] | string | undefined,
): Permission[] {
  if (raw === undefined) return [];
  let parsed: unknown = raw;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((p): p is Permission => p && typeof p === "object");
}

export type ModulePermissions = {
  hasView: boolean;
  hasCreate: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
  /** Detail / quick view: explicit `view` or `update` on the module. */
  hasProductRead: boolean;
  allActions: string[];
  isSuperAdmin: boolean;
};

const DEFAULT_CRUD_ACTIONS = ["view", "create", "update", "delete"] as const;

/** Super admin: mirror full catalog actions for the module when defined. */
function allActionsForSuperAdminModule(moduleName: string | undefined): string[] {
  if (!moduleName) {
    return [...DEFAULT_CRUD_ACTIONS];
  }
  const entry = Object.entries(DESIGNATION_MODULE_ACTIONS).find(
    ([key]) => key.toLowerCase() === moduleName.toLowerCase(),
  );
  const list = entry?.[1];
  if (!Array.isArray(list) || list.length === 0) {
    return [...DEFAULT_CRUD_ACTIONS];
  }
  return list.map((a) => String(a).trim().toLowerCase()).filter(Boolean);
}

function emptyPermissions(isSuperAdmin: boolean): ModulePermissions {
  return {
    hasView: false,
    hasCreate: false,
    hasUpdate: false,
    hasDelete: false,
    hasProductRead: false,
    allActions: [],
    isSuperAdmin,
  };
}

/**
 * Resolve CRUD + `allActions` for one ERP module from designation data.
 *
 * - **Pure function** — pass `permissions`, `role`, and `email` from the caller.
 * - For **live profile** (`GET user/me` + Redux fallback), use {@link useModulePermissions}
 *   from `hooks/usePermissions.ts` instead of calling this with stale Redux-only data.
 * - Super admin (config email or role SUPER_ADMIN): full catalog actions for that module.
 */
export function getModulePermissions(
  permissions: Permission[] | string | undefined,
  role: string | undefined,
  moduleName: string | undefined,
  email?: string,
): ModulePermissions {
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const superAdminEmail = config?.supperAdminEmail?.trim()?.toLowerCase();
    const normalizedRole = role?.trim().toUpperCase();

    const isSuperAdmin =
      (normalizedEmail &&
        superAdminEmail &&
        normalizedEmail === superAdminEmail) ||
      normalizedRole === "SUPER_ADMIN";

    if (isSuperAdmin) {
      const allActions = allActionsForSuperAdminModule(moduleName);
      return {
        hasView: true,
        hasCreate: true,
        hasUpdate: true,
        hasDelete: true,
        hasProductRead: true,
        allActions,
        isSuperAdmin: true,
      };
    }

    if (!moduleName || typeof moduleName !== "string") {
      return emptyPermissions(false);
    }

    const rows = normalizePermissionsRows(permissions);
    if (rows.length === 0) {
      return emptyPermissions(false);
    }

    const modulePermission = rows.find(
      (p) => p?.module?.toLowerCase() === moduleName.toLowerCase(),
    );
    const actions = parseActionsArray(modulePermission?.actions);
    const hasView = actions.includes("view");
    const hasUpdate = actions.includes("update");

    return {
      hasView,
      hasCreate: actions.includes("create"),
      hasUpdate,
      hasProductRead: hasView || hasUpdate,
      hasDelete: actions.includes("delete"),
      allActions: actions,
      isSuperAdmin: false,
    };
  } catch (error) {
    console.error("getModulePermissions error:", error);
    return emptyPermissions(false);
  }
}

/** Case-insensitive check against `allActions` from `getModulePermissions`. */
export function moduleHasAction(
  allActions: string[],
  action: string,
): boolean {
  return allActions.includes(action.trim().toLowerCase());
}
