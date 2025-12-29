import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../admin.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private configService: ConfigService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Check if it's an admin token
    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.adminService.getAdminUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Admin user not found or inactive');
    }

    return {
      adminId: payload.sub,
      email: payload.email,
      role: payload.role,
      type: 'admin',
    };
  }
}
