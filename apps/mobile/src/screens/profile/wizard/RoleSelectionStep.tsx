import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';

interface Props {
  data: any;
  selectedRoles: string[];
  onRolesChange: (roles: string[]) => void;
  onNext: (data: any) => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  loading: boolean;
}

const ROLES = [
  {
    id: 'farmer',
    name: 'Farmer',
    icon: '🐔',
    description: 'Raise poultry birds for meat or eggs',
  },
  {
    id: 'veterinarian',
    name: 'Veterinarian',
    icon: '⚕️',
    description: 'Animal health professional',
  },
  {
    id: 'supplier',
    name: 'Supplier/Dealer',
    icon: '📦',
    description: 'Supply feed, medicine, or equipment',
  },
  {
    id: 'consultant',
    name: 'Consultant',
    icon: '💼',
    description: 'Provide expert advice and guidance',
  },
  {
    id: 'feed_miller',
    name: 'Feed Miller',
    icon: '🌾',
    description: 'Manufacture poultry feed',
  },
  {
    id: 'hatchery_operator',
    name: 'Hatchery Operator',
    icon: '🥚',
    description: 'Operate hatchery for chick production',
  },
  {
    id: 'processor',
    name: 'Processor',
    icon: '🏭',
    description: 'Process poultry meat or eggs',
  },
  {
    id: 'trader',
    name: 'Trader/Broker',
    icon: '💱',
    description: 'Trade poultry products',
  },
  {
    id: 'transporter',
    name: 'Transporter',
    icon: '🚚',
    description: 'Transport poultry or products',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    icon: '🔬',
    description: 'Research in poultry science',
  },
  {
    id: 'nutritionist',
    name: 'Nutritionist',
    icon: '🥗',
    description: 'Specialize in poultry nutrition',
  },
  {
    id: 'educator',
    name: 'Educator/Trainer',
    icon: '👨‍🏫',
    description: 'Teach or train in poultry',
  },
  {
    id: 'student',
    name: 'Student',
    icon: '🎓',
    description: 'Studying poultry science',
  },
  {
    id: 'other',
    name: 'Other',
    icon: '➕',
    description: 'Other role in poultry industry',
  },
];

export default function RoleSelectionStep({
  selectedRoles,
  onRolesChange,
  onNext,
  onBack,
}: Props) {
  const toggleRole = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      onRolesChange(selectedRoles.filter((id) => id !== roleId));
    } else {
      onRolesChange([...selectedRoles, roleId]);
    }
  };

  const handleNext = () => {
    if (selectedRoles.length > 0) {
      onNext({});
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>What do you do?</Text>
          <Text style={styles.subtitle}>
            Select all roles that apply to you. You can add more later.
          </Text>
        </View>

        <View style={styles.rolesGrid}>
          {ROLES.map((role) => {
            const isSelected = selectedRoles.includes(role.id);
            return (
              <TouchableOpacity
                key={role.id}
                style={[styles.roleCard, isSelected && styles.roleCardSelected]}
                onPress={() => toggleRole(role.id)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <Text style={[styles.roleName, isSelected && styles.roleNameSelected]}>
                  {role.name}
                </Text>
                <Text style={[styles.roleDescription, isSelected && styles.roleDescriptionSelected]}>
                  {role.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedRoles.length > 0 && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedText}>
              {selectedRoles.length} role{selectedRoles.length > 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.buttonSecondary} onPress={onBack}>
          <Text style={styles.buttonSecondaryText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.buttonPrimary,
            selectedRoles.length === 0 && styles.buttonPrimaryDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedRoles.length === 0}
        >
          <Text
            style={[
              styles.buttonPrimaryText,
              selectedRoles.length === 0 && styles.buttonPrimaryTextDisabled,
            ]}
          >
            Continue
          </Text>
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
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  roleName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  roleNameSelected: {
    color: colors.primary,
  },
  roleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleDescriptionSelected: {
    color: colors.primary,
  },
  selectedInfo: {
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.primary,
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
  buttonPrimaryTextDisabled: {
    color: colors.lightGray,
  },
});

