import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';
import { supabase } from '../../../config/supabase';

interface Education {
  id: string;
  institution_name: string;
  degree: string;
  field_of_study: string | null;
  start_year: number;
  end_year: number | null;
  is_current: boolean;
  grade: string | null;
  description: string | null;
}

interface Props {
  profileId: string;
  editMode?: boolean;
}

export default function EducationList({ profileId, editMode }: Props) {
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducation();
  }, [profileId]);

  const fetchEducation = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_education')
        .select('*')
        .eq('profile_id', profileId)
        .order('is_current', { ascending: false })
        .order('end_year', { ascending: false });

      if (error) throw error;
      setEducation(data || []);
    } catch (error) {
      console.error('Error fetching education:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Education</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (education.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Education</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎓</Text>
          <Text style={styles.emptyText}>No education added yet</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Education</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Education</Text>
        {editMode && (
          <TouchableOpacity>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {education.map((edu, index) => (
        <View key={edu.id} style={[styles.educationItem, index > 0 && styles.borderTop]}>
          <View style={styles.institutionIcon}>
            <Text style={styles.institutionIconText}>🎓</Text>
          </View>

          <View style={styles.educationContent}>
            <Text style={styles.degree}>
              {edu.degree}
              {edu.field_of_study && ` in ${edu.field_of_study}`}
            </Text>
            <Text style={styles.institutionName}>{edu.institution_name}</Text>
            <Text style={styles.duration}>
              {edu.start_year} - {edu.is_current ? 'Present' : edu.end_year || 'N/A'}
            </Text>

            {edu.grade && (
              <Text style={styles.grade}>Grade: {edu.grade}</Text>
            )}

            {edu.description && (
              <Text style={styles.description}>{edu.description}</Text>
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
  educationItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  institutionIcon: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  institutionIconText: {
    fontSize: 20,
  },
  educationContent: {
    flex: 1,
  },
  degree: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  institutionName: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  duration: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  grade: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 20,
    marginTop: spacing.sm,
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

