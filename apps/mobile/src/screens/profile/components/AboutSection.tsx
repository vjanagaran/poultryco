import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '@poultryco/design-system';

interface Props {
  bio: string;
  editMode?: boolean;
}

export default function AboutSection({ bio, editMode }: Props) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = bio.length > 200;
  const displayText = expanded || !shouldTruncate ? bio : bio.slice(0, 200) + '...';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About</Text>
        {editMode && (
          <TouchableOpacity>
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.bioText}>{displayText}</Text>

      {shouldTruncate && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.toggleText}>
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    fontWeight: '600',
    color: colors.text,
  },
  editLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  bioText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  toggleText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});

