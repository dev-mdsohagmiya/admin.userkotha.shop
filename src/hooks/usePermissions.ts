import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { config } from "../config";
import {
  selectCurrentUser,
  useCurrentToken,
} from "../redux/features/auth/authSlice";
import { useMyProfileQuery } from "../redux/features/user/userApi";
import {
  getModulePermissions,
  type ModulePermissions,
} from "../utils/permissions";

type PermissionRow = { module?: string; actions?: unknown };

function normalizeDesignationPermissions(
  raw: unknown,
): Array<{ module: string; actions: string[] }> {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((row): row is PermissionRow => row && typeof row === "object")
    .map((row) => {
      const moduleName = String(row.module ?? "").trim();
      let actionsRaw = row.actions;
      if (typeof actionsRaw === "string") {
        try {
          actionsRaw = JSON.parse(actionsRaw);
        } catch {
          actionsRaw = [];
        }
      }
      const actions = Array.isArray(actionsRaw)
        ? actionsRaw.map((a) => String(a).trim().toLowerCase()).filter(Boolean)
        : [];
      return { module: moduleName, actions };
    })
    .filter((row) => row.module.length > 0);
}

export const usePermissions = () => {
  const token = useSelector(useCurrentToken);
  const reduxUser = useSelector(selectCurrentUser);
  const { data: profileRes, isLoading: isProfileLoading } = useMyProfileQuery(
    undefined,
    {
      skip: !token,
    },
  );
  // Keep sidebar / guards aligned with ProtectedRoute (uses GET user/me)
  const profileUser = profileRes?.data;
  const user = profileUser ?? reduxUser;

  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    const normalizedEmail = user.email?.trim().toLowerCase();
    const superAdminEmail = config?.supperAdminEmail?.trim().toLowerCase();
    const normalizedRole = user.role?.trim().toUpperCase();
    return (
      (Boolean(normalizedEmail && superAdminEmail) &&
        normalizedEmail === superAdminEmail) ||
      normalizedRole === "SUPER_ADMIN"
    );
  }, [user]);
  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      if (!user) {
        return false;
      }

      // SUPER ADMIN BYPASS
      if (isSuperAdmin) {
        return true;
      }

      // ADMIN users must have designation with permissions
      if (user.role?.toUpperCase() === "ADMIN") {
        const rows = normalizeDesignationPermissions(
          user.designation?.permissions,
        );
        if (rows.length === 0) {
          return false;
        }

        const modulePermission = rows.find(
          (p) => p.module.toLowerCase() === module.toLowerCase(),
        );

        return (
          modulePermission?.actions.includes(action.toLowerCase()) ?? false
        );
      }

      // CUSTOMER and SUPPLIER roles don't have module-based permissions
      // They only access their own profile/data
      return false;
    },
    [user, isSuperAdmin],
  );

  const hasRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return false;

      // SUPER ADMIN BYPASS
      if (isSuperAdmin) {
        return true;
      }

      // Simple role matching - only checks if user has the role
      // Actual permissions are checked via hasPermission
      return roles.some(
        (role) => role.toUpperCase() === user.role?.toUpperCase(),
      );
    },
    [user, isSuperAdmin],
  );

  const hasAnyPermission = useCallback(
    (permissions: Array<{ module: string; action: string }>): boolean => {
      // SUPER ADMIN BYPASS
      if (isSuperAdmin) {
        return true;
      }
      return permissions.some((permission) =>
        hasPermission(permission.module, permission.action),
      );
    },
    [hasPermission, isSuperAdmin],
  );

  const canAccessModule = useCallback(
    (module: string): boolean => {
      if (!user) return false;

      // SUPER ADMIN BYPASS
      if (isSuperAdmin) {
        return true;
      }

      // ADMIN users must have designation with permissions for the module
      if (user.role?.toUpperCase() === "ADMIN") {
        const rows = normalizeDesignationPermissions(
          user.designation?.permissions,
        );
        return rows.some(
          (p) => p.module.toLowerCase() === module.toLowerCase(),
        );
      }

      return false;
    },
    [user, isSuperAdmin],
  );

  return useMemo(
    () => ({
      user,
      isSuperAdmin,
      isProfileLoading,
      hasPermission,
      hasRole,
      hasAnyPermission,
      canAccessModule,
    }),
    [
      user,
      isSuperAdmin,
      isProfileLoading,
      hasPermission,
      hasRole,
      hasAnyPermission,
      canAccessModule,
    ],
  );
};

export type ModulePermissionsWithLoading = ModulePermissions & {
  isProfileLoading: boolean;
};

/**
 * Same rules as {@link getModulePermissions}, but sources user from
 * `GET user/me` when available (aligned with ProtectedRoute), else Redux.
 */
export const useModulePermissions = (
  moduleName: string | undefined,
): ModulePermissionsWithLoading => {
  const { user, isProfileLoading } = usePermissions();

  return useMemo(
    () => ({
      ...getModulePermissions(
        user?.designation?.permissions,
        user?.role,
        moduleName,
        user?.email,
      ),
      isProfileLoading,
    }),
    [user, moduleName, isProfileLoading],
  );
};
