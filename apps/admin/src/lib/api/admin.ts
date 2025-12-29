import { apiClient } from './client';

export interface AdminUser {
  id: string;
  email: string;
  role: {
    id: string;
    name: string;
    slug: string;
  };
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface MenuGroup {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  menus: Menu[];
}

export interface Menu {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  path: string;
  parentPath: string | null;
  displayOrder: number;
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
  menus: MenuGroup[];
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// AUTHENTICATION
// =====================================================

/**
 * Admin login
 */
export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/admin/auth/login', { email, password });
  // Store token in localStorage and cookie
  apiClient.setToken(response.token);
  if (typeof document !== 'undefined') {
    document.cookie = `admin_token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
  return response;
}

/**
 * Get current admin user
 */
export async function getCurrentAdmin(): Promise<{ user: AdminUser; menus: MenuGroup[] }> {
  return apiClient.get<{ user: AdminUser; menus: MenuGroup[] }>('/admin/auth/me');
}

/**
 * Logout (clear token)
 */
export function adminLogout() {
  apiClient.setToken(null);
  if (typeof document !== 'undefined') {
    document.cookie = 'admin_token=; path=/; max-age=0';
  }
}

// =====================================================
// ADMIN USER MANAGEMENT
// =====================================================

/**
 * Get all admin users
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiClient.get<AdminUser[]>('/admin/users');
}

/**
 * Get admin user by ID
 */
export async function getAdminUserById(id: string): Promise<AdminUser> {
  return apiClient.get<AdminUser>(`/admin/users/${id}`);
}

/**
 * Create admin user
 */
export async function createAdminUser(data: {
  email: string;
  password: string;
  roleId: string;
}): Promise<AdminUser> {
  return apiClient.post<AdminUser>('/admin/users', data);
}

/**
 * Update admin user
 */
export async function updateAdminUser(
  id: string,
  data: { email?: string; roleId?: string; isActive?: boolean }
): Promise<AdminUser> {
  return apiClient.patch<AdminUser>(`/admin/users/${id}`, data);
}

/**
 * Change admin user password
 */
export async function changeAdminPassword(id: string, password: string): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/password`, { password });
}

/**
 * Delete admin user
 */
export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

// =====================================================
// ROLE MANAGEMENT
// =====================================================

/**
 * Get all roles
 */
export async function getRoles(): Promise<Role[]> {
  return apiClient.get<Role[]>('/admin/roles');
}

/**
 * Get role by ID
 */
export async function getRoleById(id: string): Promise<Role> {
  return apiClient.get<Role>(`/admin/roles/${id}`);
}

/**
 * Create role
 */
export async function createRole(data: {
  name: string;
  slug: string;
  description?: string;
}): Promise<Role> {
  return apiClient.post<Role>('/admin/roles', data);
}

/**
 * Update role
 */
export async function updateRole(
  id: string,
  data: { name?: string; slug?: string; description?: string; isActive?: boolean }
): Promise<Role> {
  return apiClient.patch<Role>(`/admin/roles/${id}`, data);
}

/**
 * Delete role
 */
export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/admin/roles/${id}`);
}

// =====================================================
// MENU MANAGEMENT
// =====================================================

/**
 * Get all menu groups with menus
 */
export async function getMenuGroups(): Promise<MenuGroup[]> {
  return apiClient.get<MenuGroup[]>('/admin/menus');
}

/**
 * Get role permissions (menus)
 */
export async function getRoleMenus(roleId: string): Promise<Menu[]> {
  return apiClient.get<Menu[]>(`/admin/roles/${roleId}/menus`);
}

/**
 * Assign menus to role
 */
export async function assignMenusToRole(roleId: string, menuIds: string[]): Promise<void> {
  await apiClient.post(`/admin/roles/${roleId}/menus`, { menuIds });
}

// =====================================================
// MODERATION QUEUE
// =====================================================

export interface ModerationItem {
  id: string;
  contentType: string;
  contentId: string;
  reportedBy: string | null;
  reportReason: string;
  reportDescription: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_review' | 'resolved' | 'dismissed';
  reviewedBy: string | null;
  reviewedAt: string | null;
  actionTaken: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get moderation queue
 */
export async function getModerationQueue(filters?: {
  status?: string;
  priority?: string;
  contentType?: string;
}): Promise<ModerationItem[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.contentType) params.append('contentType', filters.contentType);
  
  const query = params.toString();
  return apiClient.get<ModerationItem[]>(`/admin/moderation${query ? `?${query}` : ''}`);
}

/**
 * Update moderation item
 */
export async function updateModerationItem(
  id: string,
  data: {
    status?: string;
    reviewedBy?: string;
    actionTaken?: string;
    resolutionNotes?: string;
  }
): Promise<ModerationItem> {
  return apiClient.patch<ModerationItem>(`/admin/moderation/${id}`, data);
}

// =====================================================
// AUDIT LOG
// =====================================================

export interface AuditLog {
  id: string;
  adminUserId: string;
  actionType: string;
  targetType: string | null;
  targetId: string | null;
  description: string;
  metadata: any;
  createdAt: string;
}

/**
 * Get audit logs
 */
export async function getAuditLogs(filters?: {
  adminUserId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<AuditLog[]> {
  const params = new URLSearchParams();
  if (filters?.adminUserId) params.append('adminUserId', filters.adminUserId);
  if (filters?.actionType) params.append('actionType', filters.actionType);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const query = params.toString();
  return apiClient.get<AuditLog[]>(`/admin/audit-log${query ? `?${query}` : ''}`);
}

// =====================================================
// SYSTEM SETTINGS
// =====================================================

export interface SystemSetting {
  key: string;
  value: any;
  description: string | null;
  category: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get system settings
 */
export async function getSystemSettings(category?: string): Promise<SystemSetting[]> {
  const query = category ? `?category=${category}` : '';
  return apiClient.get<SystemSetting[]>(`/admin/settings${query}`);
}

/**
 * Get system setting by key
 */
export async function getSystemSetting(key: string): Promise<SystemSetting> {
  return apiClient.get<SystemSetting>(`/admin/settings/${key}`);
}

/**
 * Update system setting
 */
export async function updateSystemSetting(key: string, value: any): Promise<SystemSetting> {
  return apiClient.put<SystemSetting>(`/admin/settings/${key}`, { value });
}
