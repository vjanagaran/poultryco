import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('cognito/validate')
  @ApiOperation({ summary: 'Validate Cognito token and get app JWT' })
  @ApiResponse({ status: 200, description: 'Token validated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async validateCognitoToken(@Body('token') token: string) {
    const result = await this.authService.validateCognitoToken(token);
    const appToken = await this.authService.generateToken(result.user);

    return {
      ...appToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        profile: result.profile,
      },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req) {
    return {
      user: {
        id: req.user.userId,
        email: req.user.email,
        profile: req.user.profile,
      },
    };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Refresh JWT token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refreshToken(@Request() req) {
    const user = await this.authService.getUserProfile(req.user.userId);
    const token = await this.authService.generateToken({
      id: req.user.userId,
      email: req.user.email,
      profile: user,
    });

    return token;
  }
}

