import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class OtpService {
  private readonly otpLength: number;
  private readonly otpExpiryMinutes: number;
  private readonly maxAttempts: number;
  private readonly bcryptRounds = 10;

  constructor(private configService: ConfigService) {
    this.otpLength = parseInt(
      this.configService.get<string>('OTP_LENGTH', '6'),
      10,
    );
    this.otpExpiryMinutes = parseInt(
      this.configService.get<string>('OTP_EXPIRY_MINUTES', '10'),
      10,
    );
    this.maxAttempts = parseInt(
      this.configService.get<string>('OTP_MAX_ATTEMPTS', '5'),
      10,
    );
  }

  /**
   * Generate a cryptographically secure OTP
   */
  generateOtp(): string {
    // Generate random number between 10^(length-1) and 10^length - 1
    const min = Math.pow(10, this.otpLength - 1);
    const max = Math.pow(10, this.otpLength) - 1;
    
    // Use crypto.randomInt for secure random generation
    const otp = crypto.randomInt(min, max + 1).toString();
    
    return otp;
  }

  /**
   * Hash OTP using bcrypt (for storage in database)
   */
  async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, this.bcryptRounds);
  }

  /**
   * Verify OTP against hash
   */
  async verifyOtp(otp: string, hash: string): Promise<boolean> {
    return bcrypt.compare(otp, hash);
  }

  /**
   * Calculate OTP expiry timestamp
   */
  getExpiryTimestamp(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + this.otpExpiryMinutes);
    return expiry;
  }

  /**
   * Check if OTP is expired
   */
  isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Get max attempts allowed
   */
  getMaxAttempts(): number {
    return this.maxAttempts;
  }

  /**
   * Get OTP length
   */
  getOtpLength(): number {
    return this.otpLength;
  }

  /**
   * Get OTP expiry in minutes
   */
  getOtpExpiryMinutes(): number {
    return this.otpExpiryMinutes;
  }
}
