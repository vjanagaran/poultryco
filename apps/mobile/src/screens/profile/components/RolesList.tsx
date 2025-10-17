import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';
import type { ProfileRole } from '../../../contexts/ProfileContext';
import { useProfile } from '../../../contexts/ProfileContext';

interface Props {
  roles: ProfileRole[];
  editMode?: boolean;
}

const ROLE_INFO: Record<string, { icon: string; label: string }> = {
  farmer: { icon: '🐔', label: 'Farmer' },
  veterinarian: { icon: '⚕️', label: 'Veterinarian' },
  supplier: { icon: '📦', label: 'Supplier/Dealer' },
  consultant: { icon: '💼', label: 'Consultant' },
  feed_miller: { icon: '🌾', label: 'Feed Miller' },
  hatchery_operator: { icon: '🥚', label: 'Hatchery Operator' },
  processor: { icon: '🏭', label: 'Processor' },
  trader: { icon: '💱', label: 'Trader/Broker' },
  transporter: { icon: '🚚', label: 'Transporter' },
  researcher: { icon: '🔬', label: 'Researcher' },
  nutritionist: { icon: '🥗', label: 'Nutritionist' },
  educator: { icon: '👨‍🏫', label: 'Educator/Trainer' },
  student: { icon: '🎓', label: 'Student' },
  other: { icon: '➕', label: 'Other' },
};

export default function RolesList({ roles, editMode }: Props) {
  const { toggleRole } = useProfile();

  if (roles.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Roles</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💼</Text>
          <Text style={styles.emptyText}>No roles added yet</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Role</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const activeRoles = roles.filter((r) => r.is_active);
  const inactiveRoles = roles.filter((r) => !r.is_active);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Roles in Poultry Industry</Text>
        {editMode && (
          <TouchableOpacity>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Active Roles */}
      {activeRoles.map((role) => {
        const info = ROLE_INFO[role.role_type] || { icon: '➕', label: role.role_type };
        return (
          <View key={role.id} style={styles.roleItem}>
            <View style={styles.roleIcon}>
              <Text style={styles.roleIconText}>{info.icon}</Text>
            </View>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>{info.label}</Text>
              {role.is_primary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>Primary</Text>
                </View>
              )}
            </View>
            {editMode && (
              <Switch
                value={role.is_active}
                onValueChange={(value) => toggleRole(role.id, value)}
                trackColor={{ false: colors.gray, true: colors.primary }}
                thumbColor={colors.white}
              />
            )}
            {!editMode && (
              <TouchableOpacity>
                <Text style={styles.viewDetailsText}>Details ›</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {/* Inactive Roles (only in edit mode) */}
      {editMode && inactiveRoles.length > 0 && (
        <>
          <Text style={styles.sectionSubtitle}>Hidden Roles</Text>
          {inactiveRoles.map((role) => {
            const info = ROLE_INFO[role.role_type] || { icon: '➕', label: role.role_type };
            return (
              <View key={role.id} style={[styles.roleItem, styles.roleItemInactive]}>
                <View style={styles.roleIcon}>
                  <Text style={styles.roleIconText}>{info.icon}</Text>
                </View>
                <View style={styles.roleInfo}>
                  <Text style={[styles.roleName, styles.roleNameInactive]}>{info.label}</Text>
                </View>
                <Switch
                  value={role.is_active}
                  onValueChange={(value) => toggleRole(role.id, value)}
                  trackColor={{ false: colors.gray, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            );
          })}
        </>
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
  roleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  roleItemInactive: {
    opacity: 0.5,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roleIconText: {
    fontSize: 20,
  },
  roleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  roleNameInactive: {
    color: colors.textSecondary,
  },
  primaryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  viewDetailsText: {
    ...typography.body,
    color: colors.primary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});

