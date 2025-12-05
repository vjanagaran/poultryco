import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  TooManyRequestsException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, desc, isNull, or } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { authUsers, authRequests } from '@/database/schema';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';

@Injectable()
export class OtpAuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private configService: ConfigService,
    private otpService: OtpService,
    private emailService: EmailService,
    private templateService: TemplateService,
  ) {}

  /**
   * Request OTP for email or phone verification
   */
  async requestOtp(params: {
    identifier: string; // email or phone
    channel: 'email' | 'sms' | 'whatsapp';
    requestType: 'verify_email' | 'verify_phone';
    ipAddress?: string;
    userAgent?: string;
  }) {
    const { identifier, channel, requestType, ipAddress, userAgent } = params;

    // Validate channel matches identifier
    if (channel === 'email' && !this.isEmail(identifier)) {
      throw new BadRequestException('Invalid email address');
    }
    if ((channel === 'sms' || channel === 'whatsapp') && !this.isPhone(identifier)) {
      throw new BadRequestException('Invalid phone number');
    }

    // Check for existing active OTP
    const existingRequests = await this.db
      .select()
      .from(authRequests)
      .where(
        and(
          eq(authRequests.identifier, identifier),
          eq(authRequests.channel, channel),
          isNull(authRequests.verifiedAt),
        ),
      )
      .orderBy(desc(authRequests.createdAt))
      .limit(1);
    
    const existingRequest = existingRequests[0];

    // If exists and not expired, check rate limit
    if (existingRequest && !this.otpService.isExpired(existingRequest.codeExpiresAt)) {
      const timeSinceRequest = Date.now() - existingRequest.createdAt.getTime();
      const minInterval = parseInt(
        this.configService.get<string>('OTP_RATE_LIMIT_SECONDS', '60'),
        10,
      ) * 1000;

      if (timeSinceRequest < minInterval) {
        const waitTime = Math.ceil((minInterval - timeSinceRequest) / 1000);
        throw new TooManyRequestsException(
          `Please wait ${waitTime} seconds before requesting another OTP.`,
        );
      }
    }

    // Generate OTP
    const otp = this.otpService.generateOtp();
    const otpHash = await this.otpService.hashOtp(otp);
    const expiresAt = this.otpService.getExpiryTimestamp();

    // Get or create user (nullable for new signups)
    let user = null;
    if (channel === 'email') {
      const users = await this.db
        .select()
        .from(authUsers)
        .where(eq(authUsers.email, identifier))
        .limit(1);
      user = users[0] || null;
    } else {
      const users = await this.db
        .select()
        .from(authUsers)
        .where(eq(authUsers.phoneNumber, identifier))
        .limit(1);
      user = users[0] || null;
    }

    // Create auth request
    const [authRequest] = await this.db
      .insert(authRequests)
      .values({
        userId: user?.id || null,
        identifier,
        channel,
        codeHash: otpHash,
        codeExpiresAt: expiresAt,
        requestType,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        attempts: 0,
        maxAttempts: this.otpService.getMaxAttempts(),
      })
      .returning();

    // Send OTP via email
    if (channel === 'email') {
      await this.sendOtpEmail(identifier, otp);
    }
    // TODO: Implement SMS and WhatsApp sending

    return {
      success: true,
      message: `Verification code sent to ${identifier}`,
      isNewUser: !user,
      expiresIn: this.otpService.getOtpExpiryMinutes(),
    };
  }

  /**
   * Verify OTP
   */
  async verifyOtp(params: {
    identifier: string;
    channel: 'email' | 'sms' | 'whatsapp';
    code: string;
  }) {
    const { identifier, channel, code } = params;

    // Find active OTP request
    const authRequestResults = await this.db
      .select()
      .from(authRequests)
      .where(
        and(
          eq(authRequests.identifier, identifier),
          eq(authRequests.channel, channel),
          isNull(authRequests.verifiedAt),
        ),
      )
      .orderBy(desc(authRequests.createdAt))
      .limit(1);
    
    const authRequest = authRequestResults[0];

    if (!authRequest) {
      throw new BadRequestException('No active verification code found');
    }

    // Check if expired
    if (this.otpService.isExpired(authRequest.codeExpiresAt)) {
      throw new BadRequestException('Verification code has expired');
    }

    // Check max attempts
    if (authRequest.attempts >= authRequest.maxAttempts) {
      throw new BadRequestException(
        'Maximum verification attempts exceeded. Please request a new code.',
      );
    }

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(code, authRequest.codeHash);

    // Increment attempts
    await this.db
      .update(authRequests)
      .set({ attempts: authRequest.attempts + 1 })
      .where(eq(authRequests.id, authRequest.id));

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Mark as verified
    await this.db
      .update(authRequests)
      .set({ verifiedAt: new Date() })
      .where(eq(authRequests.id, authRequest.id));

    // Get or create user
    let user = null;
    if (authRequest.userId) {
      const users = await this.db
        .select()
        .from(authUsers)
        .where(eq(authUsers.id, authRequest.userId))
        .limit(1);
      user = users[0] || null;
    }

    if (!user) {
      // Create new user
      const userData: any = {
        status: 'pending',
      };

      if (channel === 'email') {
        userData.email = identifier;
        userData.emailVerified = true;
      } else {
        userData.phoneNumber = identifier;
        userData.phoneVerified = true;
      }

      [user] = await this.db.insert(authUsers).values(userData).returning();
    } else {
      // Update verification status
      const updateData: any = {};
      if (channel === 'email') {
        updateData.emailVerified = true;
      } else {
        updateData.phoneVerified = true;
      }

      await this.db
        .update(authUsers)
        .set(updateData)
        .where(eq(authUsers.id, user.id));
    }

    // Generate token for auto-login
    const token = await this.generateAutoLoginToken(user.id);
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 365); // 1 year

    await this.db
      .update(authUsers)
      .set({
        token,
        tokenExpiresAt,
        lastSignInAt: new Date(),
        status: 'active',
      })
      .where(eq(authUsers.id, user.id));

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phoneNumber,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      token,
      isNewUser: !authRequest.userId,
    };
  }

  /**
   * Send OTP email using template
   */
  private async sendOtpEmail(email: string, otp: string) {
    try {
      const rendered = await this.templateService.getRenderedTemplate(
        'email',
        'otp',
        {
          code: otp,
          expiry: this.otpService.getOtpExpiryMinutes(),
        },
      );

      const result = await this.emailService.sendEmail(
        email,
        rendered.subject || 'Your Verification Code',
        rendered.body,
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to send verification email: ${error.message}`,
      );
    }
  }

  /**
   * Generate auto-login token (hashed)
   */
  private async generateAutoLoginToken(userId: string): Promise<string> {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    return this.otpService.hashOtp(token); // Reuse hash function for token
  }

  /**
   * Validate email format
   */
  private isEmail(str: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  /**
   * Validate phone format (basic)
   */
  private isPhone(str: string): boolean {
    return /^\+?[1-9]\d{1,14}$/.test(str.replace(/\s/g, ''));
  }
}
