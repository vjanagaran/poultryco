import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';

interface Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  loading: boolean;
}

export default function PrivacyStep({ data, onNext, onBack, loading }: Props) {
  const [formData, setFormData] = useState({
    is_public: data.is_public !== false, // Default to true
  });

  const handleNext = () => {
    onNext(formData);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Settings</Text>
          <Text style={styles.subtitle}>
            Control who can see your profile and contact information
          </Text>
        </View>

        <View style={styles.form}>
          {/* Profile Visibility */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingIcon}>👁️</Text>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Public Profile</Text>
                <Text style={styles.settingDescription}>
                  {formData.is_public
                    ? 'Anyone can view your profile'
                    : 'Only connections can view your profile'}
                </Text>
              </View>
              <Switch
                value={formData.is_public}
                onValueChange={(value) => setFormData({ ...formData, is_public: value })}
                trackColor={{ false: colors.gray, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>

          {/* Info Sections */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>What's visible in public profiles?</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>✓</Text>
                <Text style={styles.infoText}>Name, photo, and headline</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>✓</Text>
                <Text style={styles.infoText}>Your roles and location (state)</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>✓</Text>
                <Text style={styles.infoText}>Experience and education</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>✓</Text>
                <Text style={styles.infoText}>Skills and endorsements</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>What's always private?</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🔒</Text>
                <Text style={styles.infoText}>Phone number & email (only connections)</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🔒</Text>
                <Text style={styles.infoText}>Exact address/farm location</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🔒</Text>
                <Text style={styles.infoText}>Private messages</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🔒</Text>
                <Text style={styles.infoText}>Personal notes and documents</Text>
              </View>
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationIcon}>💡</Text>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Recommended for you</Text>
              <Text style={styles.recommendationText}>
                We recommend keeping your profile <Text style={styles.bold}>public</Text> to:
                {'\n'}• Get discovered by potential business partners
                {'\n'}• Build your professional network faster
                {'\n'}• Establish credibility in the industry
                {'\n\n'}
                You can always change these settings later in your profile.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.buttonSecondary}
          onPress={onBack}
          disabled={loading}
        >
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && styles.buttonPrimaryDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonPrimaryText}>Create Profile</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  settingCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoIcon: {
    ...typography.body,
    color: colors.primary,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9', // Light green background for better readability
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  recommendationIcon: {
    fontSize: 24,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  recommendationText: {
    ...typography.caption,
    color: '#1B5E20', // Darker green for better contrast
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonSecondaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  buttonPrimary: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonPrimaryDisabled: {
    backgroundColor: colors.gray,
  },
  buttonPrimaryText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});

