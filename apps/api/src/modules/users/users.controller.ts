import { Controller, Get, Put, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search user profiles' })
  @ApiResponse({ status: 200, description: 'Profiles found' })
  async searchProfiles(
    @Query('q') search?: string,
    @Query('role') role?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.usersService.searchProfiles({
      search,
      role,
      state,
      city,
      limit,
      offset,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get user profile by slug' })
  @ApiResponse({ status: 200, description: 'Profile found' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Param('slug') slug: string) {
    return this.usersService.getProfileBySlug(slug);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update own profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateProfile(@CurrentUser('profileId') profileId: string, @Body() data: any) {
    return this.usersService.updateProfile(profileId, data);
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get own profile stats' })
  @ApiResponse({ status: 200, description: 'Stats retrieved' })
  async getStats(@CurrentUser('profileId') profileId: string) {
    return this.usersService.getProfileStats(profileId);
  }

  // ===== EXPERIENCE =====

  @Post('me/experiences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Add experience' })
  @ApiResponse({ status: 201, description: 'Experience added' })
  async addExperience(@CurrentUser('profileId') profileId: string, @Body() data: any) {
    return this.usersService.addExperience(profileId, data);
  }

  @Put('me/experiences/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update experience' })
  @ApiResponse({ status: 200, description: 'Experience updated' })
  async updateExperience(
    @Param('id') id: string,
    @CurrentUser('profileId') profileId: string,
    @Body() data: any,
  ) {
    return this.usersService.updateExperience(id, profileId, data);
  }

  @Delete('me/experiences/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete experience' })
  @ApiResponse({ status: 200, description: 'Experience deleted' })
  async deleteExperience(@Param('id') id: string, @CurrentUser('profileId') profileId: string) {
    return this.usersService.deleteExperience(id, profileId);
  }

  // ===== EDUCATION =====

  @Post('me/education')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Add education' })
  @ApiResponse({ status: 201, description: 'Education added' })
  async addEducation(@CurrentUser('profileId') profileId: string, @Body() data: any) {
    return this.usersService.addEducation(profileId, data);
  }

  @Put('me/education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update education' })
  @ApiResponse({ status: 200, description: 'Education updated' })
  async updateEducation(
    @Param('id') id: string,
    @CurrentUser('profileId') profileId: string,
    @Body() data: any,
  ) {
    return this.usersService.updateEducation(id, profileId, data);
  }

  @Delete('me/education/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete education' })
  @ApiResponse({ status: 200, description: 'Education deleted' })
  async deleteEducation(@Param('id') id: string, @CurrentUser('profileId') profileId: string) {
    return this.usersService.deleteEducation(id, profileId);
  }

  // ===== SKILLS =====

  @Post('me/skills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Add skill' })
  @ApiResponse({ status: 201, description: 'Skill added' })
  async addSkill(@CurrentUser('profileId') profileId: string, @Body('skillId') skillId: string) {
    return this.usersService.addSkill(profileId, skillId);
  }

  @Delete('me/skills/:skillId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Remove skill' })
  @ApiResponse({ status: 200, description: 'Skill removed' })
  async removeSkill(
    @Param('skillId') skillId: string,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.usersService.removeSkill(profileId, skillId);
  }
}

