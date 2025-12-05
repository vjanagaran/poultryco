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
  async getCurrentUser(@Request() req: any) {
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
  async refreshToken(@Request() req: any) {
    const user = await this.authService.getUserProfile(req.user.userId);
    const token = await this.authService.generateToken({
      id: req.user.userId,
      email: req.user.email,
      profile: user,
    });

    return token;
  }

  @Post('cognito/signup')
  @ApiOperation({ summary: 'Sign up new user via Cognito' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async signUp(@Body() body: { email: string; password: string; fullName: string; phone?: string }) {
    return this.authService.signUp(body);
  }

  @Post('cognito/signin')
  @ApiOperation({ summary: 'Sign in user via Cognito' })
  @ApiResponse({ status: 200, description: 'Sign in successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body);
  }

  @Post('otp/request')
  @ApiOperation({ summary: 'Request OTP via Email or Phone' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async requestOtp(@Body() body: { email?: string; phone?: string; channel?: 'whatsapp' | 'sms' | 'email' }) {
    if (!body.email && !body.phone) {
      throw new Error('Either email or phone is required');
    }
    return this.authService.requestOtp(body.email, body.phone, body.channel);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and login/create profile' })
  @ApiResponse({ status: 200, description: 'OTP verified, user logged in' })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async verifyOtp(@Body() body: { email?: string; phone?: string; code: string; fullName?: string; deviceFingerprint?: string }) {
    if (!body.email && !body.phone) {
      throw new Error('Either email or phone is required');
    }
    return this.authService.verifyOtp(body.code, body.email, body.phone, body.fullName, body.deviceFingerprint);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }
}

