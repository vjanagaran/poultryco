import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { authUsers, profiles } from '@/database/schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate Cognito JWT token and sync user to database
   * @deprecated Cognito is no longer used. Use OTP authentication instead.
   * @removed This method has been removed as Cognito is no longer supported.
   */

  /**
   * Get or create user from Cognito payload
   */
  private async getOrCreateUser(cognitoPayload: any) {
    const email = cognitoPayload.email;
    const cognitoId = cognitoPayload.sub;

    // Check if user exists
    let user = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.email, email),
      with: {
        profile: true,
      },
    });

    if (!user) {
      // Create new user
      const [newUser] = await this.db
        .insert(authUsers)
        .values({
          email,
          emailConfirmedAt: cognitoPayload.email_verified ? new Date() : null,
        })
        .returning();

      // Create profile
      const [newProfile] = await this.db
        .insert(profiles)
        .values({
          userId: newUser.id,
          email,
          firstName: cognitoPayload.given_name || '',
          lastName: cognitoPayload.family_name || '',
          slug: await this.generateUniqueSlug(email),
        })
        .returning();

      user = {
        ...newUser,
        profile: newProfile,
      };
    }

    return user;
  }

  /**
   * Generate JWT token for authenticated user
   * Access token: 15 minutes (short-lived)
   * Refresh token: 365 days (long-lived, handled by Cognito)
   */
  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      profileId: user.profile?.id,
    };

    // Access token: short-lived (15 minutes)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    // Refresh token will be handled by Cognito (365 days)
    return {
      accessToken,
      expiresIn: 900, // 15 minutes in seconds
      refreshTokenExpiresIn: 31536000, // 365 days in seconds
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      const user = await this.db.query.authUsers.findFirst({
        where: eq(authUsers.id, payload.sub),
        with: {
          profile: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Get user profile by user ID
   */
  async getUserProfile(userId: string) {
    const user = await this.db.query.authUsers.findFirst({
      where: eq(authUsers.id, userId),
      with: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user.profile;
  }

  /**
   * Generate unique slug from email
   */
  private async generateUniqueSlug(email: string): Promise<string> {
    const baseSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.db.query.profiles.findFirst({
        where: eq(profiles.slug, slug),
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Refresh user's last active timestamp
   */
  async updateLastActive(userId: string) {
    await this.db
      .update(profiles)
      .set({ lastActiveAt: new Date() })
      .where(eq(profiles.userId, userId));
  }

  /**
   * Sign up new user via Cognito (proxied to handle SECRET_HASH)
   */
  async signUp(params: { email: string; password: string; fullName: string; phone?: string }) {
    const { CognitoIdentityProviderClient, SignUpCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    const clientId = this.configService.get<string>('AWS_COGNITO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AWS_COGNITO_CLIENT_SECRET');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

    if (!userPoolId || !clientId) {
      throw new UnauthorizedException('Cognito not configured');
    }

    // Get AWS credentials from environment
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    
    const client = new CognitoIdentityProviderClient({ 
      region,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });

    // Compute SECRET_HASH if client secret exists
    let secretHash: string | undefined;
    if (clientSecret) {
      const crypto = await import('crypto');
      secretHash = crypto
        .createHmac('sha256', clientSecret)
        .update(params.email + clientId)
        .digest('base64');
    }

    const command = new SignUpCommand({
      ClientId: clientId,
      Username: params.email,
      Password: params.password,
      SecretHash: secretHash, // Required when client has a secret
      UserAttributes: [
        { Name: 'email', Value: params.email },
        { Name: 'name', Value: params.fullName },
        ...(params.phone ? [{ Name: 'phone_number', Value: params.phone }] : []),
      ],
    });

    try {
      const response = await client.send(command);
      return {
        success: true,
        userSub: response.UserSub,
        codeDeliveryDetails: response.CodeDeliveryDetails,
      };
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Sign up failed');
    }
  }

  /**
   * Sign in user via Cognito (proxied to handle SECRET_HASH)
   */
  async signIn(params: { email: string; password: string }) {
    const { CognitoIdentityProviderClient, AdminInitiateAuthCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    const clientId = this.configService.get<string>('AWS_COGNITO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AWS_COGNITO_CLIENT_SECRET');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

    if (!userPoolId || !clientId) {
      throw new UnauthorizedException('Cognito not configured');
    }

    // Get AWS credentials from environment
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    
    const client = new CognitoIdentityProviderClient({ 
      region,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });

    // Use AdminInitiateAuth - doesn't require USER_PASSWORD_AUTH to be enabled in App Client
    // This uses admin credentials and bypasses the flow restriction
    const crypto = await import('crypto');
    let secretHash: string | undefined;
    
    if (clientSecret) {
      secretHash = crypto
        .createHmac('sha256', clientSecret)
        .update(params.email + clientId)
        .digest('base64');
    }

    const command = new AdminInitiateAuthCommand({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH', // Admin auth flow - doesn't require USER_PASSWORD_AUTH to be enabled
      AuthParameters: {
        USERNAME: params.email,
        PASSWORD: params.password,
        ...(secretHash ? { SECRET_HASH: secretHash } : {}),
      },
    });

    try {
      const response = await client.send(command);
      
      if (!response.AuthenticationResult) {
        throw new UnauthorizedException('Authentication failed');
      }

      // Cognito authentication is deprecated - use OTP authentication instead
      throw new UnauthorizedException('Cognito authentication is no longer supported. Please use OTP authentication.');
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Sign in failed');
    }
  }

  /**
   * Request OTP via Email or Phone using Cognito's built-in verification
   */
  async requestOtp(email?: string, phone?: string, channel: 'whatsapp' | 'sms' | 'email' = 'email') {
    const { CognitoIdentityProviderClient, SignUpCommand, ResendConfirmationCodeCommand, AdminGetUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    const clientId = this.configService.get<string>('AWS_COGNITO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AWS_COGNITO_CLIENT_SECRET');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

    if (!userPoolId || !clientId) {
      throw new UnauthorizedException('Cognito not configured');
    }

    if (!email && !phone) {
      throw new UnauthorizedException('Either email or phone is required');
    }

    // Get AWS credentials from environment
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    
    const client = new CognitoIdentityProviderClient({ 
      region,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });
    const identifier = email || phone!;
    const isEmail = !!email;

    try {
      // Check if user already exists in Cognito
      try {
        const userResponse = await client.send(new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: identifier,
        }));

        const userStatus = userResponse.UserStatus;
        const crypto = await import('crypto');
        let secretHash: string | undefined;
        
        if (clientSecret) {
          secretHash = crypto
            .createHmac('sha256', clientSecret)
            .update(identifier + clientId)
            .digest('base64');
        }

        if (userStatus === 'CONFIRMED') {
          // User is confirmed - use ForgotPassword flow to send OTP
          // This is a workaround since Cognito doesn't have native OTP login for confirmed users
          const { ForgotPasswordCommand } = await import('@aws-sdk/client-cognito-identity-provider');
          
          await client.send(new ForgotPasswordCommand({
            ClientId: clientId,
            Username: identifier,
            SecretHash: secretHash,
          }));

          return {
            success: true,
            message: `Verification code sent to ${identifier}`,
            isNewUser: false,
            requiresPasswordReset: true, // Flag to indicate we'll use ConfirmForgotPassword
          };
        } else {
          // User exists but not confirmed - resend confirmation code
          await client.send(new ResendConfirmationCodeCommand({
            ClientId: clientId,
            Username: identifier,
            SecretHash: secretHash,
          }));

          return {
            success: true,
            message: `Verification code sent to ${identifier}`,
            isNewUser: false,
            requiresPasswordReset: false,
          };
        }
      } catch (error: any) {
        // User doesn't exist - create new user with temporary password
        // Cognito will send verification code via email
        if (error.name === 'UserNotFoundException') {
          const crypto = await import('crypto');
          let secretHash: string | undefined;
          
          if (clientSecret) {
            secretHash = crypto
              .createHmac('sha256', clientSecret)
              .update(identifier + clientId)
              .digest('base64');
          }

          // Generate temporary password (Cognito requires password even for OTP flow)
          const tempPassword = crypto.randomBytes(16).toString('hex') + 'A1!';

          const userAttributes: any[] = [];
          if (email) {
            userAttributes.push({ Name: 'email', Value: email });
          }
          if (phone) {
            userAttributes.push({ Name: 'phone_number', Value: phone });
          }

          await client.send(new SignUpCommand({
            ClientId: clientId,
            Username: identifier,
            Password: tempPassword,
            UserAttributes: userAttributes,
            SecretHash: secretHash,
          }));

          return {
            success: true,
            message: `Verification code sent to ${identifier}`,
            isNewUser: true,
          };
        }
        throw error;
      }
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Failed to send OTP');
    }
  }

  /**
   * Verify OTP and login/create profile
   */
  async verifyOtp(code: string, email?: string, phone?: string, fullName?: string, deviceFingerprint?: string) {
    const { CognitoIdentityProviderClient, ConfirmSignUpCommand, AdminInitiateAuthCommand, AdminRespondToAuthChallengeCommand, AdminGetUserCommand } = await import('@aws-sdk/client-cognito-identity-provider');
    
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    const clientId = this.configService.get<string>('AWS_COGNITO_CLIENT_ID');
    const clientSecret = this.configService.get<string>('AWS_COGNITO_CLIENT_SECRET');
    const region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';

    if (!userPoolId || !clientId) {
      throw new UnauthorizedException('Cognito not configured');
    }

    if (!email && !phone) {
      throw new UnauthorizedException('Either email or phone is required');
    }

    // Get AWS credentials from environment
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    
    const client = new CognitoIdentityProviderClient({ 
      region,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });
    const identifier = email || phone!;
    const crypto = await import('crypto');
    let secretHash: string | undefined;
    
    if (clientSecret) {
      secretHash = crypto
        .createHmac('sha256', clientSecret)
        .update(identifier + clientId)
        .digest('base64');
    }

    try {
      // Check if user exists and is confirmed
      let userExists = false;
      let isConfirmed = false;
      
      try {
        const userResponse = await client.send(new AdminGetUserCommand({
          UserPoolId: userPoolId,
          Username: identifier,
        }));
        userExists = true;
        isConfirmed = userResponse.UserStatus === 'CONFIRMED';
      } catch (error: any) {
        if (error.name !== 'UserNotFoundException') {
          throw error;
        }
        // User doesn't exist - will be handled by ConfirmSignUp
      }

      if (userExists && isConfirmed) {
        // Existing confirmed user - use ConfirmForgotPassword flow
        // This verifies the code sent via ForgotPassword and sets a new password
        const { ConfirmForgotPasswordCommand, AdminSetUserPasswordCommand } = await import('@aws-sdk/client-cognito-identity-provider');
        
        // Generate secure password (user won't need to know it)
        const securePassword = crypto.randomBytes(24).toString('hex') + 'A1a!';
        
        // Confirm forgot password with the code
        await client.send(new ConfirmForgotPasswordCommand({
          ClientId: clientId,
          Username: identifier,
          ConfirmationCode: code,
          Password: securePassword,
          SecretHash: secretHash,
        }));

        // Authenticate with new password
        const authResponse = await client.send(new AdminInitiateAuthCommand({
          UserPoolId: userPoolId,
          ClientId: clientId,
          AuthFlow: 'ADMIN_NO_SRP_AUTH',
          AuthParameters: {
            USERNAME: identifier,
            PASSWORD: securePassword,
            ...(secretHash ? { SECRET_HASH: secretHash } : {}),
          },
        }));

        if (authResponse.AuthenticationResult) {
          const idToken = authResponse.AuthenticationResult.IdToken!;
          return await this.handleSuccessfulAuth(idToken, identifier, email, phone, fullName, deviceFingerprint);
        }
      } else {
        // New user or unconfirmed user - use ConfirmSignUp
        await client.send(new ConfirmSignUpCommand({
          ClientId: clientId,
          Username: identifier,
          ConfirmationCode: code,
          SecretHash: secretHash,
        }));

        // After verification, set a permanent password and authenticate
        const { AdminSetUserPasswordCommand } = await import('@aws-sdk/client-cognito-identity-provider');
        const securePassword = crypto.randomBytes(24).toString('hex') + 'A1a!';
        
        // Set permanent password
        await client.send(new AdminSetUserPasswordCommand({
          UserPoolId: userPoolId,
          Username: identifier,
          Password: securePassword,
          Permanent: true,
        }));

        // Authenticate to get tokens
        const authResponse = await client.send(new AdminInitiateAuthCommand({
          UserPoolId: userPoolId,
          ClientId: clientId,
          AuthFlow: 'ADMIN_NO_SRP_AUTH',
          AuthParameters: {
            USERNAME: identifier,
            PASSWORD: securePassword,
            ...(secretHash ? { SECRET_HASH: secretHash } : {}),
          },
        }));

        // Cognito authentication is deprecated
        throw new UnauthorizedException('Cognito OTP verification is no longer supported. Please use /auth/otp/verify endpoint.');
      }

      throw new UnauthorizedException('Authentication failed');
    } catch (error: any) {
      if (error.name === 'CodeMismatchException' || error.name === 'ExpiredCodeException') {
        throw new UnauthorizedException('Invalid or expired verification code');
      }
      if (error.name === 'NotAuthorizedException' && error.message?.includes('User cannot be confirmed')) {
        // User is already confirmed - try direct authentication
        // This means the code was for a different purpose
        throw new UnauthorizedException('This verification code is not valid. Please request a new code.');
      }
      throw new UnauthorizedException(error.message || 'OTP verification failed');
    }
  }

  /**
   * Handle successful authentication after OTP verification
   * @deprecated This method used Cognito tokens. Use OtpAuthService instead.
   */
  private async handleSuccessfulAuth(
    idToken: string,
    identifier: string,
    email?: string,
    phone?: string,
    fullName?: string,
    deviceFingerprint?: string
  ) {
    // Cognito authentication is deprecated - use OtpAuthService instead
    throw new UnauthorizedException('Cognito authentication is no longer supported. Please use OTP authentication.');
  }

  /**
   * Logout and invalidate tokens
   */
  async logout(userId: string) {
    // Invalidate refresh tokens in database
    // Clear any session data
    
    // Update last active time
    await this.updateLastActive(userId);
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

