import { useModulePermissions } from "./usePermissions";

/**
 * CMS routes under sidebar "Content Management": view-only vs edit (needs `update`).
 */
export function useContentManagementEdit() {
  const perms = useModulePermissions("Content Management");
  const canEdit = perms.isSuperAdmin || perms.hasUpdate;
  return {
    ...perms,
    canEdit,
    readOnly: !canEdit,
  };
}
