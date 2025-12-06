import { Injectable, Inject, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { eq, and, desc, asc, sql } from 'drizzle-orm';
import { admUsers, admRoles, admMenus, admMenuGroups, admRolesMenus, admModerationQueue, admActionsLog, admBannedUsers, admSystemSettings } from '@/database/schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

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

@Injectable()
export class AdminService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private jwtService: JwtService,
  ) {}

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  /**
   * Login admin user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const [adminUser] = await this.db
      .select({
        user: admUsers,
        role: {
          id: admRoles.id,
          name: admRoles.name,
          slug: admRoles.slug,
        },
      })
      .from(admUsers)
      .innerJoin(admRoles, eq(admUsers.roleId, admRoles.id))
      .where(and(eq(admUsers.email, email), eq(admUsers.isActive, true)))
      .limit(1);

    if (!adminUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, adminUser.user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.db
      .update(admUsers)
      .set({ lastLoginAt: sql`NOW()` })
      .where(eq(admUsers.id, adminUser.user.id));

    // Get user menus based on role
    const menus = await this.getUserMenus(adminUser.user.roleId);

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: adminUser.user.id,
      email: adminUser.user.email,
      role: adminUser.role.slug,
      type: 'admin',
    });

    return {
      user: {
        id: adminUser.user.id,
        email: adminUser.user.email,
        role: adminUser.role,
        isActive: adminUser.user.isActive,
        lastLoginAt: adminUser.user.lastLoginAt?.toISOString() || null,
        createdAt: adminUser.user.createdAt.toISOString(),
      },
      token,
      menus,
    };
  }

  /**
   * Get user menus based on role
   */
  async getUserMenus(roleId: string): Promise<MenuGroup[]> {
    // Get all menus for this role
    const roleMenus = await this.db
      .select({
        menu: admMenus,
        group: admMenuGroups,
      })
      .from(admRolesMenus)
      .innerJoin(admMenus, eq(admRolesMenus.menuId, admMenus.id))
      .innerJoin(admMenuGroups, eq(admMenus.groupId, admMenuGroups.id))
      .where(and(
        eq(admRolesMenus.roleId, roleId),
        eq(admMenus.isActive, true),
        eq(admMenuGroups.isActive, true),
      ))
      .orderBy(asc(admMenuGroups.displayOrder), asc(admMenus.displayOrder));

    // Group menus by menu group
    const groupsMap = new Map<string, MenuGroup>();
    const menuMap = new Map<string, Menu>();

    // First pass: collect all menus
    for (const row of roleMenus) {
      const groupId = row.group.id;
      
      if (!groupsMap.has(groupId)) {
        groupsMap.set(groupId, {
          id: row.group.id,
          name: row.group.name,
          slug: row.group.slug,
          icon: row.group.icon,
          displayOrder: row.group.displayOrder,
          menus: [],
        });
      }

      const menu: Menu = {
        id: row.menu.id,
        name: row.menu.name,
        slug: row.menu.slug,
        icon: row.menu.icon,
        path: row.menu.path,
        parentPath: row.menu.parentPath,
        displayOrder: row.menu.displayOrder,
      };

      menuMap.set(row.menu.path, menu);
    }

    // Second pass: add menus to groups, including parent menus if sub-menus exist
    for (const [menuPath, menu] of menuMap.entries()) {
      const groupId = roleMenus.find((r: any) => r.menu.path === menuPath)?.group.id;
      if (!groupId) continue;

      const group = groupsMap.get(groupId)!;
      
      // If this is a sub-menu, check if parent should be included
      if (menu.parentPath) {
        // Find parent menu
        const parentMenu = roleMenus.find((r: any) => r.menu.path === menu.parentPath);
        if (parentMenu) {
          // Check if parent is already in the group
          const existingParent = group.menus.find(m => m.path === menu.parentPath);
          if (!existingParent) {
            // Add parent menu
            group.menus.push({
              id: parentMenu.menu.id,
              name: parentMenu.menu.name,
              slug: parentMenu.menu.slug,
              icon: parentMenu.menu.icon,
              path: parentMenu.menu.path,
              parentPath: parentMenu.menu.parentPath,
              displayOrder: parentMenu.menu.displayOrder,
            });
          }
        }
      }

      // Add the menu itself
      if (!group.menus.find(m => m.path === menu.path)) {
        group.menus.push(menu);
      }
    }

    // Sort menus within each group
    for (const group of groupsMap.values()) {
      group.menus.sort((a, b) => {
        // Top-level menus first, then sub-menus
        if (!a.parentPath && b.parentPath) return -1;
        if (a.parentPath && !b.parentPath) return 1;
        // Then by display order
        return a.displayOrder - b.displayOrder;
      });
    }

    // Convert to array and sort by group order
    return Array.from(groupsMap.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Verify JWT token and get user
   */
  async verifyToken(token: string): Promise<AdminUser> {
    try {
      const payload = this.jwtService.verify(token);
      
      const [adminUser] = await this.db
        .select({
          user: admUsers,
          role: {
            id: admRoles.id,
            name: admRoles.name,
            slug: admRoles.slug,
          },
        })
        .from(admUsers)
        .innerJoin(admRoles, eq(admUsers.roleId, admRoles.id))
        .where(and(
          eq(admUsers.id, payload.sub),
          eq(admUsers.isActive, true),
        ))
        .limit(1);

      if (!adminUser) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        id: adminUser.user.id,
        email: adminUser.user.email,
        role: adminUser.role,
        isActive: adminUser.user.isActive,
        lastLoginAt: adminUser.user.lastLoginAt?.toISOString() || null,
        createdAt: adminUser.user.createdAt.toISOString(),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // =====================================================
  // ADMIN USER MANAGEMENT
  // =====================================================

  /**
   * Get all admin users
   */
  async getAdminUsers(): Promise<AdminUser[]> {
    const users = await this.db
      .select({
        user: admUsers,
        role: {
          id: admRoles.id,
          name: admRoles.name,
          slug: admRoles.slug,
        },
      })
      .from(admUsers)
      .innerJoin(admRoles, eq(admUsers.roleId, admRoles.id))
      .orderBy(desc(admUsers.createdAt));

    return users.map((u: any) => ({
      id: u.user.id,
      email: u.user.email,
      role: u.role,
      isActive: u.user.isActive,
      lastLoginAt: u.user.lastLoginAt?.toISOString() || null,
      createdAt: u.user.createdAt.toISOString(),
    }));
  }

  /**
   * Get admin user by ID
   */
  async getAdminUserById(id: string): Promise<AdminUser | null> {
    const [user] = await this.db
      .select({
        user: admUsers,
        role: {
          id: admRoles.id,
          name: admRoles.name,
          slug: admRoles.slug,
        },
      })
      .from(admUsers)
      .innerJoin(admRoles, eq(admUsers.roleId, admRoles.id))
      .where(eq(admUsers.id, id))
      .limit(1);

    if (!user) return null;

    return {
      id: user.user.id,
      email: user.user.email,
      role: user.role,
      isActive: user.user.isActive,
      lastLoginAt: user.user.lastLoginAt?.toISOString() || null,
      createdAt: user.user.createdAt.toISOString(),
    };
  }

  /**
   * Create admin user (super admin only)
   */
  async createAdminUser(data: {
    email: string;
    password: string;
    roleId: string;
  }): Promise<AdminUser> {
    // Check if email exists
    const [existing] = await this.db
      .select()
      .from(admUsers)
      .where(eq(admUsers.email, data.email))
      .limit(1);

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const [user] = await this.db
      .insert(admUsers)
      .values({
        email: data.email,
        passwordHash,
        roleId: data.roleId,
        isActive: true,
      })
      .returning();

    // Get role
    const [role] = await this.db
      .select()
      .from(admRoles)
      .where(eq(admRoles.id, data.roleId))
      .limit(1);

    return {
      id: user.id,
      email: user.email,
      role: {
        id: role.id,
        name: role.name,
        slug: role.slug,
      },
      isActive: user.isActive,
      lastLoginAt: null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /**
   * Update admin user
   */
  async updateAdminUser(id: string, data: {
    email?: string;
    roleId?: string;
    isActive?: boolean;
  }): Promise<AdminUser> {
    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [user] = await this.db
      .update(admUsers)
      .set(updateData)
      .where(eq(admUsers.id, id))
      .returning();

    if (!user) {
      throw new NotFoundException('Admin user not found');
    }

    // Get role
    const [role] = await this.db
      .select()
      .from(admRoles)
      .where(eq(admRoles.id, user.roleId))
      .limit(1);

    return {
      id: user.id,
      email: user.email,
      role: {
        id: role.id,
        name: role.name,
        slug: role.slug,
      },
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  /**
   * Change admin user password
   */
  async changePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await this.db
      .update(admUsers)
      .set({ passwordHash })
      .where(eq(admUsers.id, id));
  }

  /**
   * Delete admin user
   */
  async deleteAdminUser(id: string): Promise<boolean> {
    const result = await this.db
      .delete(admUsers)
      .where(eq(admUsers.id, id))
      .returning();

    return result.length > 0;
  }

  // =====================================================
  // ROLE MANAGEMENT
  // =====================================================

  /**
   * Get all roles
   */
  async getRoles() {
    return this.db
      .select()
      .from(admRoles)
      .where(eq(admRoles.isActive, true))
      .orderBy(asc(admRoles.name));
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string) {
    const [role] = await this.db
      .select()
      .from(admRoles)
      .where(eq(admRoles.id, id))
      .limit(1);

    return role || null;
  }

  /**
   * Create role
   */
  async createRole(data: { name: string; slug: string; description?: string }) {
    const [role] = await this.db
      .insert(admRoles)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        isActive: true,
      })
      .returning();

    return role;
  }

  /**
   * Update role
   */
  async updateRole(id: string, data: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
    const [role] = await this.db
      .update(admRoles)
      .set(data)
      .where(eq(admRoles.id, id))
      .returning();

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<boolean> {
    const result = await this.db
      .delete(admRoles)
      .where(eq(admRoles.id, id))
      .returning();

    return result.length > 0;
  }

  // =====================================================
  // MENU MANAGEMENT
  // =====================================================

  /**
   * Get all menu groups with menus
   */
  async getMenuGroups(): Promise<MenuGroup[]> {
    const groups = await this.db
      .select()
      .from(admMenuGroups)
      .where(eq(admMenuGroups.isActive, true))
      .orderBy(asc(admMenuGroups.displayOrder));

    const menus = await this.db
      .select()
      .from(admMenus)
      .where(eq(admMenus.isActive, true))
      .orderBy(asc(admMenus.displayOrder));

    // Group menus by group
    const groupsMap = new Map<string, MenuGroup>();
    
    for (const group of groups) {
      groupsMap.set(group.id, {
        id: group.id,
        name: group.name,
        slug: group.slug,
        icon: group.icon,
        displayOrder: group.displayOrder,
        menus: [],
      });
    }

    for (const menu of menus) {
      const group = groupsMap.get(menu.groupId);
      if (group) {
        group.menus.push({
          id: menu.id,
          name: menu.name,
          slug: menu.slug,
          icon: menu.icon,
          path: menu.path,
          parentPath: menu.parentPath,
          displayOrder: menu.displayOrder,
        });
      }
    }

    return Array.from(groupsMap.values());
  }

  /**
   * Get role permissions (menus)
   */
  async getRoleMenus(roleId: string) {
    return this.db
      .select({
        menu: admMenus,
      })
      .from(admRolesMenus)
      .innerJoin(admMenus, eq(admRolesMenus.menuId, admMenus.id))
      .where(eq(admRolesMenus.roleId, roleId))
      .orderBy(asc(admMenus.displayOrder));
  }

  /**
   * Assign menus to role
   */
  async assignMenusToRole(roleId: string, menuIds: string[]): Promise<void> {
    // Delete existing assignments
    await this.db
      .delete(admRolesMenus)
      .where(eq(admRolesMenus.roleId, roleId));

    // Insert new assignments
    if (menuIds.length > 0) {
      await this.db
        .insert(admRolesMenus)
        .values(
          menuIds.map(menuId => ({
            roleId,
            menuId,
          }))
        );
    }
  }

  // =====================================================
  // MODERATION QUEUE
  // =====================================================

  /**
   * Get moderation queue items
   */
  async getModerationQueue(filters?: {
    status?: string;
    priority?: string;
    contentType?: string;
  }) {
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(admModerationQueue.status, filters.status));
    }
    if (filters?.priority) {
      conditions.push(eq(admModerationQueue.priority, filters.priority));
    }
    if (filters?.contentType) {
      conditions.push(eq(admModerationQueue.contentType, filters.contentType));
    }

    return this.db
      .select()
      .from(admModerationQueue)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(admModerationQueue.createdAt));
  }

  /**
   * Update moderation item
   */
  async updateModerationItem(id: string, data: {
    status?: string;
    reviewedBy?: string;
    actionTaken?: string;
    resolutionNotes?: string;
  }) {
    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.reviewedBy !== undefined) updateData.reviewedBy = data.reviewedBy;
    if (data.actionTaken !== undefined) updateData.actionTaken = data.actionTaken;
    if (data.resolutionNotes !== undefined) updateData.resolutionNotes = data.resolutionNotes;
    
    if (data.status === 'resolved' || data.status === 'dismissed') {
      updateData.reviewedAt = sql`NOW()`;
    }

    const [item] = await this.db
      .update(admModerationQueue)
      .set(updateData)
      .where(eq(admModerationQueue.id, id))
      .returning();

    return item;
  }

  // =====================================================
  // AUDIT LOG
  // =====================================================

  /**
   * Get audit logs
   */
  async getAuditLogs(filters?: {
    adminUserId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    const conditions = [];
    
    if (filters?.adminUserId) {
      conditions.push(eq(admActionsLog.adminUserId, filters.adminUserId));
    }
    if (filters?.actionType) {
      conditions.push(eq(admActionsLog.actionType, filters.actionType));
    }
    if (filters?.startDate) {
      conditions.push(sql`${admActionsLog.createdAt} >= ${filters.startDate}::timestamptz`);
    }
    if (filters?.endDate) {
      conditions.push(sql`${admActionsLog.createdAt} <= ${filters.endDate}::timestamptz`);
    }

    let query = this.db
      .select()
      .from(admActionsLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(admActionsLog.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    return query;
  }

  /**
   * Log admin action
   */
  async logAction(data: {
    adminUserId: string;
    actionType: string;
    targetType?: string;
    targetId?: string;
    description: string;
    metadata?: any;
  }) {
    const [log] = await this.db
      .insert(admActionsLog)
      .values({
        adminUserId: data.adminUserId,
        actionType: data.actionType,
        targetType: data.targetType,
        targetId: data.targetId,
        description: data.description,
        metadata: data.metadata,
      })
      .returning();

    return log;
  }

  // =====================================================
  // SYSTEM SETTINGS
  // =====================================================

  /**
   * Get system settings
   */
  async getSystemSettings(category?: string) {
    if (category) {
      return this.db
        .select()
        .from(admSystemSettings)
        .where(eq(admSystemSettings.category, category));
    }
    return this.db.select().from(admSystemSettings);
  }

  /**
   * Get system setting by key
   */
  async getSystemSetting(key: string) {
    const [setting] = await this.db
      .select()
      .from(admSystemSettings)
      .where(eq(admSystemSettings.key, key))
      .limit(1);

    return setting || null;
  }

  /**
   * Update system setting
   */
  async updateSystemSetting(key: string, value: any, updatedBy?: string) {
    const [setting] = await this.db
      .update(admSystemSettings)
      .set({
        value,
        updatedBy,
      })
      .where(eq(admSystemSettings.key, key))
      .returning();

    if (!setting) {
      // Create if doesn't exist
      const [newSetting] = await this.db
        .insert(admSystemSettings)
        .values({
          key,
          value,
          updatedBy,
        })
        .returning();
      return newSetting;
    }

    return setting;
  }
}
