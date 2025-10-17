import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';
import { supabase } from '../../../config/supabase';

interface Experience {
  id: string;
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  key_achievements: string[] | null;
}

interface Props {
  profileId: string;
  editMode?: boolean;
}

export default function ExperienceList({ profileId, editMode }: Props) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperiences();
  }, [profileId]);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_experience')
        .select('*')
        .eq('profile_id', profileId)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false });

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const months = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years} yr${years > 1 ? 's' : ''} ${
        remainingMonths > 0 ? `${remainingMonths} mo` : ''
      }`.trim();
    }
    return `${months} mo`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Experience</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (experiences.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Experience</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💼</Text>
          <Text style={styles.emptyText}>No experience added yet</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Experience</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Experience</Text>
        {editMode && (
          <TouchableOpacity>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {experiences.map((exp, index) => (
        <View key={exp.id} style={[styles.experienceItem, index > 0 && styles.borderTop]}>
          <View style={styles.companyIcon}>
            <Text style={styles.companyIconText}>🏢</Text>
          </View>

          <View style={styles.experienceContent}>
            <Text style={styles.jobTitle}>{exp.job_title}</Text>
            <Text style={styles.companyName}>{exp.company_name}</Text>
            <Text style={styles.duration}>
              {formatDate(exp.start_date)} -{' '}
              {exp.is_current ? 'Present' : exp.end_date ? formatDate(exp.end_date) : 'N/A'} •{' '}
              {getDuration(exp.start_date, exp.end_date)}
            </Text>

            {exp.description && <Text style={styles.description}>{exp.description}</Text>}

            {exp.key_achievements && exp.key_achievements.length > 0 && (
              <View style={styles.achievements}>
                <Text style={styles.achievementsTitle}>Key Achievements:</Text>
                {exp.key_achievements.map((achievement, i) => (
                  <Text key={i} style={styles.achievementItem}>
                    • {achievement}
                  </Text>
                ))}
              </View>
            )}

            {editMode && (
              <View style={styles.actions}>
                <TouchableOpacity>
                  <Text style={styles.actionLink}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={[styles.actionLink, styles.deleteLink]}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    fontWeight: '600',
    color: colors.text,
  },
  addLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  addButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  experienceItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  companyIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  companyIconText: {
    fontSize: 20,
  },
  experienceContent: {
    flex: 1,
  },
  jobTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  companyName: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  duration: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  achievements: {
    marginTop: spacing.sm,
  },
  achievementsTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  achievementItem: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteLink: {
    color: colors.error,
  },
});

