import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // =====================================================
  // AUTHENTICATION
  // =====================================================

  @Post('auth/login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body.email, body.password);
  }

  @Get('auth/me')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin user' })
  async getMe(@Request() req: any) {
    const user = await this.adminService.getAdminUserById(req.user.adminId);
    if (!user) {
      throw new BadRequestException('Admin user not found');
    }
    const menus = await this.adminService.getUserMenus(user.role.id);
    return { user, menus };
  }

  // =====================================================
  // ADMIN USER MANAGEMENT
  // =====================================================

  @Get('users')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all admin users' })
  async getAdminUsers() {
    return this.adminService.getAdminUsers();
  }

  @Get('users/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get admin user by ID' })
  async getAdminUserById(@Param('id') id: string) {
    const user = await this.adminService.getAdminUserById(id);
    if (!user) {
      throw new BadRequestException('Admin user not found');
    }
    return user;
  }

  @Post('users')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin user (super admin only)' })
  async createAdminUser(@Body() body: { email: string; password: string; roleId: string }) {
    return this.adminService.createAdminUser(body);
  }

  @Patch('users/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update admin user' })
  async updateAdminUser(
    @Param('id') id: string,
    @Body() body: { email?: string; roleId?: string; isActive?: boolean },
  ) {
    return this.adminService.updateAdminUser(id, body);
  }

  @Patch('users/:id/password')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change admin user password' })
  async changePassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    await this.adminService.changePassword(id, body.password);
    return { success: true };
  }

  @Delete('users/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete admin user' })
  async deleteAdminUser(@Param('id') id: string) {
    const success = await this.adminService.deleteAdminUser(id);
    if (!success) {
      throw new BadRequestException('Admin user not found');
    }
    return { success: true };
  }

  // =====================================================
  // ROLE MANAGEMENT
  // =====================================================

  @Get('roles')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all roles' })
  async getRoles() {
    return this.adminService.getRoles();
  }

  @Get('roles/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get role by ID' })
  async getRoleById(@Param('id') id: string) {
    const role = await this.adminService.getRoleById(id);
    if (!role) {
      throw new BadRequestException('Role not found');
    }
    return role;
  }

  @Post('roles')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create role' })
  async createRole(@Body() body: { name: string; slug: string; description?: string }) {
    return this.adminService.createRole(body);
  }

  @Patch('roles/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update role' })
  async updateRole(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; description?: string; isActive?: boolean },
  ) {
    return this.adminService.updateRole(id, body);
  }

  @Delete('roles/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id') id: string) {
    const success = await this.adminService.deleteRole(id);
    if (!success) {
      throw new BadRequestException('Role not found');
    }
    return { success: true };
  }

  // =====================================================
  // MENU MANAGEMENT
  // =====================================================

  @Get('menus')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all menu groups with menus' })
  async getMenuGroups() {
    return this.adminService.getMenuGroups();
  }

  @Get('roles/:id/menus')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get role permissions (menus)' })
  async getRoleMenus(@Param('id') id: string) {
    return this.adminService.getRoleMenus(id);
  }

  @Post('roles/:id/menus')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign menus to role' })
  async assignMenusToRole(
    @Param('id') id: string,
    @Body() body: { menuIds: string[] },
  ) {
    await this.adminService.assignMenusToRole(id, body.menuIds);
    return { success: true };
  }

  // =====================================================
  // MODERATION QUEUE
  // =====================================================

  @Get('moderation')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get moderation queue' })
  async getModerationQueue(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('contentType') contentType?: string,
  ) {
    return this.adminService.getModerationQueue({ status, priority, contentType });
  }

  @Patch('moderation/:id')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update moderation item' })
  async updateModerationItem(
    @Param('id') id: string,
    @Body() body: {
      status?: string;
      reviewedBy?: string;
      actionTaken?: string;
      resolutionNotes?: string;
    },
  ) {
    return this.adminService.updateModerationItem(id, body);
  }

  // =====================================================
  // AUDIT LOG
  // =====================================================

  @Get('audit-log')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('adminUserId') adminUserId?: string,
    @Query('actionType') actionType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAuditLogs({
      adminUserId,
      actionType,
      startDate,
      endDate,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // =====================================================
  // SYSTEM SETTINGS
  // =====================================================

  @Get('settings')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system settings' })
  async getSystemSettings(@Query('category') category?: string) {
    return this.adminService.getSystemSettings(category);
  }

  @Get('settings/:key')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get system setting by key' })
  async getSystemSetting(@Param('key') key: string) {
    const setting = await this.adminService.getSystemSetting(key);
    if (!setting) {
      throw new BadRequestException('Setting not found');
    }
    return setting;
  }

  @Put('settings/:key')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update system setting' })
  async updateSystemSetting(
    @Param('key') key: string,
    @Body() body: { value: any },
    @Request() req: any,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const user = token ? await this.adminService.verifyToken(token) : null;
    return this.adminService.updateSystemSetting(key, body.value, user?.id);
  }
}
