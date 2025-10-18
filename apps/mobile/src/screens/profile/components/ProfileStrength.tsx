import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';

interface Props {
  strength: number;
}

const getNextSteps = (strength: number) => {
  const steps = [];
  if (strength < 20) steps.push('Add a profile photo');
  if (strength < 30) steps.push('Add your headline');
  if (strength < 40) steps.push('Select your roles');
  if (strength < 50) steps.push('Add work experience');
  if (strength < 60) steps.push('Add education');
  if (strength < 70) steps.push('Add skills');
  if (strength < 80) steps.push('Get skill endorsements');
  if (strength < 90) steps.push('Complete your bio');
  if (strength < 100) steps.push('Verify your phone');
  return steps.slice(0, 3);
};

export default function ProfileStrength({ strength }: Props) {
  const nextSteps = getNextSteps(strength);
  const barColor =
    strength >= 80 ? colors.success : strength >= 50 ? colors.warning : colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Strength</Text>
        <Text style={[styles.percentage, { color: barColor }]}>{strength}%</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${strength}%`, backgroundColor: barColor }]} />
      </View>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Complete your profile:</Text>
          {nextSteps.map((step, index) => (
            <TouchableOpacity key={index} style={styles.stepItem}>
              <Text style={styles.stepBullet}>•</Text>
              <Text style={styles.stepText}>{step}</Text>
              <Text style={styles.stepArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Motivation Message */}
      {strength < 100 && (
        <View style={styles.motivation}>
          <Text style={styles.motivationIcon}>🎯</Text>
          <Text style={styles.motivationText}>
            {strength >= 80
              ? 'Almost there! Complete your profile to unlock all features.'
              : strength >= 50
              ? 'Great start! Keep going to increase your visibility.'
              : 'Complete your profile to connect with more professionals.'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  percentage: {
    ...typography.h3,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepsContainer: {
    marginBottom: spacing.md,
  },
  stepsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  stepBullet: {
    ...typography.body,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  stepArrow: {
    ...typography.h4,
    color: colors.textTertiary,
  },
  motivation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLightest, // Light green background for better readability
    padding: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  motivationIcon: {
    fontSize: 20,
  },
  motivationText: {
    ...typography.caption,
    color: colors.primaryDark, // Dark green text for WCAG AAA contrast
    flex: 1,
    lineHeight: 18,
  },
});

