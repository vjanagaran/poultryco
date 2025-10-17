import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';
import type { ProfileStats } from '../../../contexts/ProfileContext';

interface Props {
  stats: ProfileStats | null;
}

export default function StatsBar({ stats }: Props) {
  if (!stats) return null;

  const statItems = [
    { label: 'Connections', value: stats.connections_count },
    { label: 'Followers', value: stats.followers_count },
    { label: 'Skills', value: stats.skills_count },
    { label: 'Endorsements', value: stats.endorsements_received_count },
  ];

  return (
    <View style={styles.container}>
      {statItems.map((item, index) => (
        <TouchableOpacity key={item.label} style={styles.statItem}>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statValue: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

