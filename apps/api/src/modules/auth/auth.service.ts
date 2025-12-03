import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { authUsers, profiles } from '@/database/schema';
import { CognitoService } from './cognito.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
    private jwtService: JwtService,
    private cognitoService: CognitoService,
    private configService: ConfigService,
  ) {}

  /**
   * Validate Cognito JWT token and sync user to database
   */
  async validateCognitoToken(token: string) {
    try {
      // Verify token with AWS Cognito
      const payload = await this.cognitoService.verifyToken(token);

      // Get or create user in database
      const user = await this.getOrCreateUser(payload);

      return {
        user,
        profile: user.profile,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

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
   */
  async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      profileId: user.profile?.id,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '7d',
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
}

