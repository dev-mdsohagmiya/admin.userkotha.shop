# Permission System Documentation

## Overview

The system now uses **designation-based permissions** for all ADMIN users. No automatic full access is granted.

## How It Works

### 1. **User Roles**

- **ADMIN**: System administrators with designation-based permissions
- **CUSTOMER**: Customers with access to their own profile
- **SUPPLIER**: Suppliers with access to their own profile

### 2. **Permission Structure**

Every ADMIN user MUST have:

- A `designationId` linking to a Designation
- The Designation must have `permissions` array

Example Designation Permission:

```json
{
  "id": "designation-123",
  "name": "Manager",
  "permissions": [
    {
      "module": "Products",
      "actions": ["view", "create", "update", "delete"]
    },
    {
      "module": "Sales",
      "actions": ["view", "create"]
    }
  ]
}
```

### 3. **Permission Enforcement Layers**

#### Layer 1: Route Protection (`ProtectedRoute.tsx`)

Protects routes from unauthorized access:

```tsx
<ProtectedRoute
  roles={["ADMIN"]}
  employeePermissions={{ module: "Products", action: "view" }}
>
  <ProductsList />
</ProtectedRoute>
```

**Logic:**

- Checks if user has ADMIN role
- Checks if user has designation
- Verifies the designation has the required module permission
- Denies access if any check fails

#### Layer 2: Sidebar Filtering (`useFilteredSidebarItems`)

Controls what menu items are visible:

```typescript
const sidebarPermissions = {
  Products: {
    employeePermissions: { module: "Products", action: "view" },
  },
  Sales: {
    employeePermissions: { module: "Sales", action: "view" },
  },
};
```

**Logic:**

- Filters sidebar items based on user's designation permissions
- Parent items are hidden if all children are filtered out
- Only shows items the user has access to

#### Layer 3: UI Component Permissions (`getModulePermissions`)

Controls buttons/actions within pages:

```tsx
const { hasCreate, hasUpdate, hasDelete } = getModulePermissions(
  user?.designation?.permissions,
  user?.role,
  "Products"
);

// Then use in UI:
{
  hasCreate && <Button>Create Product</Button>;
}
{
  hasUpdate && <Button>Edit</Button>;
}
{
  hasDelete && <Button>Delete</Button>;
}
```

**Logic:**

- Returns boolean flags for create/update/delete actions
- Used to show/hide buttons and actions
- All return `false` if user has no designation or permissions

### 4. **Key Functions**

#### `hasPermission(module, action)`

```typescript
// Check if user can perform an action on a module
const canEdit = hasPermission("Products", "update");
// Returns: boolean
```

#### `hasRole(roles)`

```typescript
// Check if user has any of the specified roles
const isAdmin = hasRole(["ADMIN"]);
// Returns: boolean
```

#### `canAccessModule(module)`

```typescript
// Check if user has ANY permissions for a module
const canAccessProducts = canAccessModule("Products");
// Returns: boolean
```

### 5. **Permission Workflow**

1. **User Login**

   - User logs in with email/password
   - Backend returns user data including `designation` with `permissions`
   - Frontend stores this in Redux

2. **Route Access**

   - User navigates to a route
   - `ProtectedRoute` checks:
     - Is user authenticated?
     - Does user have required role?
     - Does user have required permission?
   - If all checks pass → show page
   - If any check fails → redirect to 404

3. **Sidebar Rendering**

   - `useFilteredSidebarItems` hook filters menu items
   - Checks each item against user's permissions
   - Returns filtered list of items user can access

4. **Component Rendering**
   - Page uses `getModulePermissions` to get action flags
   - Conditionally renders buttons based on flags
   - Ensures users only see actions they can perform

### 6. **Examples**

#### Example 1: Manager with Limited Access

```json
{
  "name": "John Doe",
  "role": "ADMIN",
  "designation": {
    "name": "Store Manager",
    "permissions": [
      { "module": "Products", "actions": ["view", "create", "update"] },
      { "module": "Sales", "actions": ["view", "create"] }
    ]
  }
}
```

**Result:**

- ✅ Can view Products page
- ✅ Can create new products
- ✅ Can edit products
- ❌ Cannot delete products (no "delete" action)
- ✅ Can view Sales page
- ✅ Can create sales
- ❌ Cannot edit or delete sales

#### Example 2: Viewer with Read-Only Access

```json
{
  "name": "Jane Smith",
  "role": "ADMIN",
  "designation": {
    "name": "Viewer",
    "permissions": [
      { "module": "Products", "actions": ["view"] },
      { "module": "Sales", "actions": ["view"] },
      { "module": "Reports", "actions": ["view"] }
    ]
  }
}
```

**Result:**

- ✅ Can view Products, Sales, and Reports pages
- ❌ Cannot create, edit, or delete anything
- ❌ No action buttons shown in UI

#### Example 3: ADMIN without Designation

```json
{
  "name": "Bob Johnson",
  "role": "ADMIN",
  "designation": null
}
```

**Result:**

- ❌ Cannot access ANY page (no designation)
- ❌ Sidebar is empty
- ❌ All routes return 404
- **Must be assigned a designation to gain access**

### 7. **Important Rules**

1. **Every ADMIN user MUST have a designation**

   - Without designation → No access to anything
   - This is enforced at all permission layers

2. **Permissions are module + action based**

   - Module: "Products", "Sales", "Employees", etc.
   - Actions: "view", "create", "update", "delete"
   - Must have specific action permission to perform it

3. **Parent menu items follow children**

   - If user has no access to any child → parent is hidden
   - Example: If no access to Products/Categories/Brands → "Product Management" parent is hidden

4. **Backend also enforces permissions**
   - Frontend permissions are for UX only
   - Backend validates every API request
   - Uses same permission structure

### 8. **Adding New Permissions**

#### Step 1: Add to Sidebar Permissions

```typescript
// In useFilteredSidebarItems.ts
const sidebarPermissions = {
  "My New Module": {
    employeePermissions: { module: "My New Module", action: "view" },
  },
};
```

#### Step 2: Protect the Route

```tsx
// In routes.tsx
{
  path: "/my-new-module",
  element: (
    <ProtectedRoute
      roles={["ADMIN"]}
      employeePermissions={{ module: "My New Module", action: "view" }}
    >
      <MyNewModulePage />
    </ProtectedRoute>
  )
}
```

#### Step 3: Add Permission Checks in Component

```tsx
// In MyNewModulePage.tsx
const { hasCreate, hasUpdate, hasDelete } = getModulePermissions(
  user?.designation?.permissions,
  user?.role,
  "My New Module"
);
```

#### Step 4: Update Designation

Create or update designation to include the new module:

```json
{
  "module": "My New Module",
  "actions": ["view", "create", "update", "delete"]
}
```

### 9. **Testing Permissions**

1. **Create Test Designations:**

   - Admin (full access to all modules)
   - Manager (view + create + update most modules)
   - Viewer (view only all modules)
   - Specialist (full access to specific modules only)

2. **Create Test Users:**

   - Assign each designation to a user
   - Login as each user
   - Verify sidebar shows correct items
   - Verify pages are accessible/blocked
   - Verify buttons show/hide correctly

3. **Test Edge Cases:**
   - User with no designation → should have no access
   - User with empty permissions array → should have no access
   - User with module but no actions → should see module but no buttons

## Summary

✅ **All ADMIN users MUST have designation with permissions**
✅ **No automatic full access granted**
✅ **Three layers of enforcement: Routes, Sidebar, UI Components**
✅ **Permissions are explicit: module + action based**
✅ **Backend validates all requests independently**
