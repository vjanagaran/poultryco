import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';
import { supabase } from '../../../config/supabase';

interface Skill {
  skill_id: string;
  skill_name: string;
  endorsement_count: number;
}

interface Props {
  profileId: string;
  editMode?: boolean;
}

export default function SkillsGrid({ profileId, editMode }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, [profileId]);

  const fetchSkills = async () => {
    try {
      // Fetch profile skills with skill details
      const { data: profileSkills, error: skillsError } = await supabase
        .from('profile_skills')
        .select(`
          id,
          skill_id,
          skills (
            skill_name
          )
        `)
        .eq('profile_id', profileId);

      if (skillsError) throw skillsError;

      // For each skill, count endorsements
      const skillsWithEndorsements = await Promise.all(
        (profileSkills || []).map(async (item: any) => {
          const { count } = await supabase
            .from('skill_endorsements')
            .select('*', { count: 'exact', head: true })
            .eq('profile_skill_id', item.id);

          return {
            skill_id: item.skill_id,
            skill_name: item.skills.skill_name,
            endorsement_count: count || 0,
          };
        })
      );

      // Sort by endorsement count
      skillsWithEndorsements.sort((a, b) => b.endorsement_count - a.endorsement_count);

      setSkills(skillsWithEndorsements);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Skills</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (skills.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Skills</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>No skills added yet</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Skills</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Skills & Endorsements</Text>
        {editMode && (
          <TouchableOpacity>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.skillsGrid}>
        {skills.map((skill) => (
          <View key={skill.skill_id} style={styles.skillChip}>
            <Text style={styles.skillName}>{skill.skill_name}</Text>
            {skill.endorsement_count > 0 && (
              <View style={styles.endorsementBadge}>
                <Text style={styles.endorsementCount}>{skill.endorsement_count}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {!editMode && (
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all endorsements</Text>
        </TouchableOpacity>
      )}
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
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  skillName: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  endorsementBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  endorsementCount: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  viewAllButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  viewAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});

