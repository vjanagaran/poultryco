import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

@Injectable()
export class CognitoService {
  private verifier: any;

  constructor(private configService: ConfigService) {
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    const clientId = this.configService.get<string>('AWS_COGNITO_CLIENT_ID');

    if (userPoolId && clientId) {
      this.verifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: 'access',
        clientId,
      });
    }
  }

  /**
   * Verify Cognito JWT token
   */
  async verifyToken(token: string) {
    if (!this.verifier) {
      throw new Error('Cognito verifier not initialized. Check AWS_COGNITO_* environment variables.');
    }

    try {
      const payload = await this.verifier.verify(token);
      return payload;
    } catch (error: any) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Verify ID token (contains user attributes)
   */
  async verifyIdToken(token: string) {
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');
    const clientId = this.configService.get<string>('AWS_COGNITO_CLIENT_ID');

    if (!userPoolId || !clientId) {
      throw new Error('Cognito configuration missing. Check AWS_COGNITO_* environment variables.');
    }

    const idTokenVerifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: 'id',
      clientId,
    });

    try {
      const payload = await idTokenVerifier.verify(token);
      return payload;
    } catch (error: any) {
      throw new Error(`ID token verification failed: ${error.message}`);
    }
  }
}

