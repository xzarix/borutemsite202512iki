/**
 * Role-Based Access Control (RBAC) System
 * for B2B Agricultural Irrigation Platform
 */

// Define all available permissions
export const PERMISSIONS = {
  // Product permissions
  PRODUCTS_VIEW: "products:view",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_DELETE: "products:delete",

  // Order permissions
  ORDERS_VIEW_OWN: "orders:view:own",
  ORDERS_VIEW_ALL: "orders:view:all",
  ORDERS_CREATE: "orders:create",
  ORDERS_UPDATE_OWN: "orders:update:own",
  ORDERS_UPDATE_ALL: "orders:update:all",
  ORDERS_CANCEL_OWN: "orders:cancel:own",
  ORDERS_CANCEL_ALL: "orders:cancel:all",

  // Quote request permissions
  QUOTES_VIEW_OWN: "quotes:view:own",
  QUOTES_VIEW_ALL: "quotes:view:all",
  QUOTES_CREATE: "quotes:create",
  QUOTES_UPDATE_OWN: "quotes:update:own",
  QUOTES_UPDATE_ALL: "quotes:update:all",
  QUOTES_APPROVE: "quotes:approve",

  // Dealer permissions
  DEALERS_VIEW_OWN: "dealers:view:own",
  DEALERS_VIEW_ALL: "dealers:view:all",
  DEALERS_CREATE: "dealers:create",
  DEALERS_UPDATE_OWN: "dealers:update:own",
  DEALERS_UPDATE_ALL: "dealers:update:all",
  DEALERS_APPROVE: "dealers:approve",
  DEALERS_DELETE: "dealers:delete",

  // Category permissions
  CATEGORIES_VIEW: "categories:view",
  CATEGORIES_CREATE: "categories:create",
  CATEGORIES_UPDATE: "categories:update",
  CATEGORIES_DELETE: "categories:delete",

  // Current account permissions
  CURRENT_ACCOUNT_VIEW_OWN: "current-account:view:own",
  CURRENT_ACCOUNT_VIEW_ALL: "current-account:view:all",
  CURRENT_ACCOUNT_MANAGE: "current-account:manage",

  // Reporting permissions
  REPORTS_VIEW: "reports:view",
  REPORTS_EXPORT: "reports:export",

  // System permissions
  SYSTEM_SETTINGS: "system:settings",
  SYSTEM_USERS: "system:users",
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Define roles
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  SALES_MANAGER: "SALES_MANAGER",
  SALES_REP: "SALES_REP",
  DEALER: "DEALER",
  DEALER_EMPLOYEE: "DEALER_EMPLOYEE",
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

// Role-to-permissions mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // Super Admin - Full access
  SUPER_ADMIN: Object.values(PERMISSIONS),

  // Admin - All except super admin functions
  ADMIN: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_ALL,
    PERMISSIONS.ORDERS_CANCEL_ALL,
    PERMISSIONS.QUOTES_VIEW_ALL,
    PERMISSIONS.QUOTES_UPDATE_ALL,
    PERMISSIONS.QUOTES_APPROVE,
    PERMISSIONS.DEALERS_VIEW_ALL,
    PERMISSIONS.DEALERS_UPDATE_ALL,
    PERMISSIONS.DEALERS_APPROVE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.CURRENT_ACCOUNT_VIEW_ALL,
    PERMISSIONS.CURRENT_ACCOUNT_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // Sales Manager - Manage sales, dealers, and quotes
  SALES_MANAGER: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.ORDERS_UPDATE_ALL,
    PERMISSIONS.QUOTES_VIEW_ALL,
    PERMISSIONS.QUOTES_UPDATE_ALL,
    PERMISSIONS.QUOTES_APPROVE,
    PERMISSIONS.DEALERS_VIEW_ALL,
    PERMISSIONS.DEALERS_UPDATE_ALL,
    PERMISSIONS.DEALERS_APPROVE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CURRENT_ACCOUNT_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  // Sales Representative - Handle quotes and support dealers
  SALES_REP: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_ALL,
    PERMISSIONS.QUOTES_VIEW_ALL,
    PERMISSIONS.QUOTES_UPDATE_ALL,
    PERMISSIONS.DEALERS_VIEW_ALL,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CURRENT_ACCOUNT_VIEW_ALL,
    PERMISSIONS.REPORTS_VIEW,
  ],

  // Dealer - Primary customer role
  DEALER: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE_OWN,
    PERMISSIONS.ORDERS_CANCEL_OWN,
    PERMISSIONS.QUOTES_VIEW_OWN,
    PERMISSIONS.QUOTES_CREATE,
    PERMISSIONS.QUOTES_UPDATE_OWN,
    PERMISSIONS.DEALERS_VIEW_OWN,
    PERMISSIONS.DEALERS_UPDATE_OWN,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CURRENT_ACCOUNT_VIEW_OWN,
  ],

  // Dealer Employee - Limited dealer access
  DEALER_EMPLOYEE: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.QUOTES_VIEW_OWN,
    PERMISSIONS.QUOTES_CREATE,
    PERMISSIONS.CATEGORIES_VIEW,
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.includes(permission)
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission))
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role]
}

/**
 * Check if user is admin (ADMIN or SUPER_ADMIN)
 */
export function isAdmin(role: Role): boolean {
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
}

/**
 * Check if user is staff (any admin or sales role)
 */
export function isStaff(role: Role): boolean {
  return [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.SALES_MANAGER,
    ROLES.SALES_REP,
  ].includes(role)
}

/**
 * Check if user is dealer (DEALER or DEALER_EMPLOYEE)
 */
export function isDealer(role: Role): boolean {
  return role === ROLES.DEALER || role === ROLES.DEALER_EMPLOYEE
}

/**
 * Authorization error
 */
export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

/**
 * Require permission (throws if not authorized)
 */
export function requirePermission(role: Role, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new UnauthorizedError(
      `Role ${role} does not have permission: ${permission}`
    )
  }
}

/**
 * Require any permission (throws if not authorized)
 */
export function requireAnyPermission(role: Role, permissions: Permission[]): void {
  if (!hasAnyPermission(role, permissions)) {
    throw new UnauthorizedError(
      `Role ${role} does not have any of the required permissions`
    )
  }
}

/**
 * Require all permissions (throws if not authorized)
 */
export function requireAllPermissions(role: Role, permissions: Permission[]): void {
  if (!hasAllPermissions(role, permissions)) {
    throw new UnauthorizedError(
      `Role ${role} does not have all required permissions`
    )
  }
}
