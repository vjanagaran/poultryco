import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, like, or, desc, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { profiles, usrProfileRoles, usrExperiences, usrEducation, usrProfileSkills } from '@/database/schema';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Get user profile by slug
   */
  async getProfileBySlug(slug: string) {
    const profile = await this.db.query.profiles.findFirst({
      where: eq(profiles.slug, slug),
      with: {
        roles: {
          with: {
            role: true,
          },
        },
        experiences: {
          orderBy: [desc(usrExperiences.startDate)],
        },
        education: {
          orderBy: [desc(usrEducation.startYear)],
        },
        skills: {
          with: {
            skill: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  /**
   * Get user profile by ID
   */
  async getProfileById(id: string) {
    const profile = await this.db.query.profiles.findFirst({
      where: eq(profiles.id, id),
      with: {
        roles: true,
        experiences: true,
        education: true,
        skills: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileId: string, data: any) {
    const [updated] = await this.db
      .update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();

    return updated;
  }

  /**
   * Search profiles
   */
  async searchProfiles(query: {
    search?: string;
    role?: string;
    state?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }) {
    const { search, role, state, city, limit = 20, offset = 0 } = query;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(profiles.firstName, `%${search}%`),
          like(profiles.lastName, `%${search}%`),
          like(profiles.headline, `%${search}%`),
        ),
      );
    }

    if (state) {
      whereConditions.push(eq(profiles.state, state));
    }

    if (city) {
      whereConditions.push(eq(profiles.city, city));
    }

    const results = await this.db.query.profiles.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      limit,
      offset,
      orderBy: [desc(profiles.createdAt)],
    });

    return results;
  }

  /**
   * Add experience
   */
  async addExperience(profileId: string, data: any) {
    const [experience] = await this.db
      .insert(usrExperiences)
      .values({
        profileId,
        ...data,
      })
      .returning();

    return experience;
  }

  /**
   * Update experience
   */
  async updateExperience(experienceId: string, profileId: string, data: any) {
    const [updated] = await this.db
      .update(usrExperiences)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(usrExperiences.id, experienceId), eq(usrExperiences.profileId, profileId)))
      .returning();

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return updated;
  }

  /**
   * Delete experience
   */
  async deleteExperience(experienceId: string, profileId: string) {
    await this.db
      .delete(usrExperiences)
      .where(and(eq(usrExperiences.id, experienceId), eq(usrExperiences.profileId, profileId)));

    return { success: true };
  }

  /**
   * Add education
   */
  async addEducation(profileId: string, data: any) {
    const [education] = await this.db
      .insert(usrEducation)
      .values({
        profileId,
        ...data,
      })
      .returning();

    return education;
  }

  /**
   * Update education
   */
  async updateEducation(educationId: string, profileId: string, data: any) {
    const [updated] = await this.db
      .update(usrEducation)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(usrEducation.id, educationId), eq(usrEducation.profileId, profileId)))
      .returning();

    if (!updated) {
      throw new NotFoundException('Education not found');
    }

    return updated;
  }

  /**
   * Delete education
   */
  async deleteEducation(educationId: string, profileId: string) {
    await this.db
      .delete(usrEducation)
      .where(and(eq(usrEducation.id, educationId), eq(usrEducation.profileId, profileId)));

    return { success: true };
  }

  /**
   * Add skill
   */
  async addSkill(profileId: string, skillId: string) {
    const [skill] = await this.db
      .insert(usrProfileSkills)
      .values({
        profileId,
        skillId,
      })
      .returning();

    return skill;
  }

  /**
   * Remove skill
   */
  async removeSkill(profileId: string, skillId: string) {
    await this.db
      .delete(usrProfileSkills)
      .where(and(eq(usrProfileSkills.profileId, profileId), eq(usrProfileSkills.skillId, skillId)));

    return { success: true };
  }

  /**
   * Get profile stats
   */
  async getProfileStats(profileId: string) {
    const profile = await this.db.query.profiles.findFirst({
      where: eq(profiles.id, profileId),
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      connectionsCount: profile.connectionsCount,
      followersCount: profile.followersCount,
      followingCount: profile.followingCount,
      postsCount: profile.postsCount,
      profileStrength: profile.profileStrength,
      verificationLevel: profile.verificationLevel,
    };
  }

  /**
   * Get email preferences
   */
  async getEmailPreferences(profileId: string) {
    const { ntfPreferences, refNotificationTypes } = await import('@/database/schema');
    
    const preferences = await this.db.query.ntfPreferences.findMany({
      where: eq(ntfPreferences.profileId, profileId),
      with: {
        notificationType: true,
      },
    });

    // Transform to simpler format expected by frontend
    const prefsMap: Record<string, any> = {};
    preferences.forEach((pref: any) => {
      const type = pref.notificationType?.name || pref.notificationType?.slug || 'unknown';
      prefsMap[type] = {
        email: pref.enableEmail,
        inApp: pref.enableInApp,
        push: pref.enablePush,
        sms: pref.enableSms,
        frequency: pref.frequency,
      };
    });

    return prefsMap;
  }

  /**
   * Update email preferences
   */
  async updateEmailPreferences(profileId: string, preferences: Record<string, any>) {
    const { ntfPreferences, refNotificationTypes } = await import('@/database/schema');
    
    // Get all notification types
    const notificationTypes = await this.db.query.refNotificationTypes.findMany({
      where: eq(refNotificationTypes.isActive, true),
    });

    // Update or create preferences for each type
    for (const [typeName, prefs] of Object.entries(preferences)) {
      const type = notificationTypes.find((t: any) => t.name === typeName || t.slug === typeName);
      if (!type) continue;

      const existing = await this.db.query.ntfPreferences.findFirst({
        where: and(
          eq(ntfPreferences.profileId, profileId),
          eq(ntfPreferences.notificationTypeId, type.id),
        ),
      });

      const prefData = prefs as any;
      if (existing) {
        await this.db
          .update(ntfPreferences)
          .set({
            enableEmail: prefData.email ?? existing.enableEmail,
            enableInApp: prefData.inApp ?? existing.enableInApp,
            enablePush: prefData.push ?? existing.enablePush,
            enableSms: prefData.sms ?? existing.enableSms,
            frequency: prefData.frequency || existing.frequency,
            updatedAt: new Date(),
          })
          .where(eq(ntfPreferences.id, existing.id));
      } else {
        await this.db.insert(ntfPreferences).values({
          profileId,
          notificationTypeId: type.id,
          enableEmail: prefData.email ?? true,
          enableInApp: prefData.inApp ?? true,
          enablePush: prefData.push ?? true,
          enableSms: prefData.sms ?? false,
          frequency: prefData.frequency || 'instant',
        });
      }
    }

    return this.getEmailPreferences(profileId);
  }
}

