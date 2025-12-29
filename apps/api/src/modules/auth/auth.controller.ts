import { Controller, Post, Body, Get, UseGuards, Request, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { OtpAuthService } from './services/otp-auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpAuthService: OtpAuthService,
  ) {}

  @Post('otp/request')
  @ApiOperation({ summary: 'Request OTP for email/phone verification' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async requestOtp(
    @Body() body: { identifier: string; channel: 'email' | 'sms' | 'whatsapp'; requestType: 'verify_email' | 'verify_phone' },
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.otpAuthService.requestOtp({
      ...body,
      ipAddress,
      userAgent,
    });
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and authenticate user' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or expired' })
  @ApiResponse({ status: 401, description: 'Invalid verification code' })
  async verifyOtp(
    @Body() body: { identifier: string; channel: 'email' | 'sms' | 'whatsapp'; code: string },
  ) {
    return this.otpAuthService.verifyOtp(body);
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

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Logout and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.userId);
  }
}

