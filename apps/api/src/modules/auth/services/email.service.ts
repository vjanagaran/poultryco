import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private readonly senderEmail: string;
  private readonly senderName: string;
  private readonly minIntervalPerUser: number;
  private readonly lastEmailSent: Map<string, number> = new Map();

  constructor(private configService: ConfigService) {
    // SES SMTP Configuration
    const smtpHost = this.configService.get<string>('SES_SMTP_HOST');
    const smtpPort = parseInt(
      this.configService.get<string>('SES_SMTP_PORT', '587'),
      10,
    );
    const smtpUsername = this.configService.get<string>('SES_SMTP_USERNAME');
    const smtpPassword = this.configService.get<string>('SES_SMTP_PASSWORD');

    this.senderEmail =
      this.configService.get<string>('SES_SENDER_EMAIL') ||
      'account@auth.poultryco.net';
    this.senderName =
      this.configService.get<string>('SES_SENDER_NAME') || 'PoultryCo Account';
    this.minIntervalPerUser = parseInt(
      this.configService.get<string>('SES_MIN_INTERVAL_PER_USER', '60'),
      10,
    );

    if (!smtpHost || !smtpUsername || !smtpPassword) {
      this.logger.warn(
        'SES SMTP configuration incomplete. Email sending may fail.',
      );
    }

    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      // TLS options for port 587
      tls: {
        rejectUnauthorized: false, // For development, set to true in production
      },
    });

    // Verify connection
    this.verifyConnection();
  }

  /**
   * Verify SMTP connection
   */
  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('SES SMTP connection verified successfully');
    } catch (error) {
      this.logger.error('SES SMTP connection failed:', error);
    }
  }

  /**
   * Check rate limit for user (minimum interval between emails)
   */
  private canSendEmail(identifier: string): boolean {
    const lastSent = this.lastEmailSent.get(identifier);
    if (!lastSent) {
      return true;
    }

    const now = Date.now();
    const timeSinceLastEmail = (now - lastSent) / 1000; // Convert to seconds

    return timeSinceLastEmail >= this.minIntervalPerUser;
  }

  /**
   * Update last email sent timestamp
   */
  private updateLastEmailSent(identifier: string) {
    this.lastEmailSent.set(identifier, Date.now());
  }

  /**
   * Send email via SES SMTP
   */
  async sendEmail(
    to: string,
    subject: string,
    htmlBody: string,
    textBody?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check rate limit
      if (!this.canSendEmail(to)) {
        const lastSent = this.lastEmailSent.get(to);
        const waitTime = Math.ceil(
          this.minIntervalPerUser - (Date.now() - lastSent!) / 1000,
        );
        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${waitTime} seconds before requesting another email.`,
        };
      }

      // Prepare email
      const mailOptions = {
        from: `${this.senderName} <${this.senderEmail}>`,
        to,
        subject,
        html: htmlBody,
        text: textBody || this.htmlToText(htmlBody),
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      // Update rate limit tracker
      this.updateLastEmailSent(to);

      this.logger.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Convert HTML to plain text (simple implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Get sender email
   */
  getSenderEmail(): string {
    return this.senderEmail;
  }

  /**
   * Get sender name
   */
  getSenderName(): string {
    return this.senderName;
  }
}
