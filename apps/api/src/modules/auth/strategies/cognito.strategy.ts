import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CognitoService } from '../cognito.service';
import { AuthService } from '../auth.service';

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {
  constructor(
    private configService: ConfigService,
    private cognitoService: CognitoService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          // Verify with Cognito
          const payload = await cognitoService.verifyToken(rawJwtToken);
          done(null, payload);
        } catch (error) {
          done(error, null);
        }
      },
    });
  }

  async validate(payload: any) {
    try {
      const result = await this.authService.validateCognitoToken(payload);
      return result;
    } catch (error) {
      throw new UnauthorizedException('Invalid Cognito token');
    }
  }
}

