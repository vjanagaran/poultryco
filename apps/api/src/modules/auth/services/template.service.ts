import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { authTemplates } from '@/database/schema';

@Injectable()
export class TemplateService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: any,
  ) {}

  /**
   * Get template by channel, type, and language
   */
  async getTemplate(
    channel: 'email' | 'sms' | 'whatsapp',
    templateType: 'otp' | 'invite' | 'welcome' | 'password_reset' | 'resend',
    language: string = 'en',
  ) {
    // Use Drizzle query builder
    const templates = await this.db
      .select()
      .from(authTemplates)
      .where(
        and(
          eq(authTemplates.channel, channel),
          eq(authTemplates.templateType, templateType),
          eq(authTemplates.language, language),
          eq(authTemplates.isActive, true),
        ),
      )
      .orderBy(desc(authTemplates.priority))
      .limit(1);

    const template = templates[0];

    if (!template) {
      throw new NotFoundException(
        `Template not found for channel: ${channel}, type: ${templateType}, language: ${language}`,
      );
    }

    return template;
  }

  /**
   * Render template with variables
   */
  renderTemplate(
    template: {
      subject?: string | null;
      bodyTemplate: string;
      variables?: Record<string, any> | null;
    },
    variables: Record<string, string | number>,
  ): { subject?: string; body: string } {
    let subject = template.subject || undefined;
    let body = template.bodyTemplate;

    // Merge template variables with provided variables
    const allVariables = {
      ...(template.variables || {}),
      ...variables,
    };

    // Replace placeholders: {{variable}}
    const replacePlaceholders = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return allVariables[key]?.toString() || match;
      });
    };

    if (subject) {
      subject = replacePlaceholders(subject);
    }
    body = replacePlaceholders(body);

    return { subject, body };
  }

  /**
   * Get and render template in one call
   */
  async getRenderedTemplate(
    channel: 'email' | 'sms' | 'whatsapp',
    templateType: 'otp' | 'invite' | 'welcome' | 'password_reset' | 'resend',
    variables: Record<string, string | number>,
    language: string = 'en',
  ) {
    const template = await this.getTemplate(channel, templateType, language);
    return this.renderTemplate(template, variables);
  }
}
