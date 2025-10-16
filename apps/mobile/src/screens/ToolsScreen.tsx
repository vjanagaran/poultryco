import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@poultryco/design-system';
import { BackIcon } from '../components/icons/HeaderIcons';

const LibraryIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: size - 8, height: size - 4, borderWidth: 2, borderColor: color, borderRadius: 2 }}>
      <View style={{ width: '80%', height: 2, backgroundColor: color, marginTop: 4, marginLeft: 2 }} />
      <View style={{ width: '80%', height: 2, backgroundColor: color, marginTop: 2, marginLeft: 2 }} />
      <View style={{ width: '80%', height: 2, backgroundColor: color, marginTop: 2, marginLeft: 2 }} />
    </View>
  </View>
);

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerLeft}>
          <BackIcon color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tools & Learning</Text>
        <TouchableOpacity style={styles.headerRight}>
          <LibraryIcon color={colors.white} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Calculators */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Calculators</Text>
          <View style={styles.calculatorGrid}>
            <TouchableOpacity style={styles.calculatorCard}>
              <View style={[styles.calculatorIcon, { backgroundColor: colors.primary }]} />
              <Text style={styles.calculatorName}>FCR Calculator</Text>
              <Text style={styles.calculatorDesc}>Calculate feed conversion ratio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.calculatorCard}>
              <View style={[styles.calculatorIcon, { backgroundColor: colors.accent }]} />
              <Text style={styles.calculatorName}>Feed Projection</Text>
              <Text style={styles.calculatorDesc}>Estimate feed requirements</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.calculatorCard}>
              <View style={[styles.calculatorIcon, { backgroundColor: colors.info }]} />
              <Text style={styles.calculatorName}>Mortality Calc</Text>
              <Text style={styles.calculatorDesc}>Track flock mortality %</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.calculatorCard}>
              <View style={[styles.calculatorIcon, { backgroundColor: colors.purple }]} />
              <Text style={styles.calculatorName}>Formula Optimizer</Text>
              <Text style={styles.calculatorDesc}>Optimize feed formula</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Learning Guides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Guides</Text>
          
          <TouchableOpacity style={styles.guideCard}>
            <Text style={styles.guideName}>📖 Broiler Management Guide</Text>
            <Text style={styles.guideDesc}>Complete 6-week program • 45 lessons</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guideCard}>
            <Text style={styles.guideName}>📖 Layer Farm SOPs</Text>
            <Text style={styles.guideDesc}>Standard procedures • 28 topics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guideCard}>
            <Text style={styles.guideName}>📖 Disease Prevention</Text>
            <Text style={styles.guideDesc}>Common diseases & vaccines • 15 modules</Text>
          </TouchableOpacity>
        </View>

        {/* Industry Glossary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Industry Glossary</Text>
          <TouchableOpacity style={styles.glossaryCard}>
            <Text style={styles.glossaryName}>A-Z Poultry Terms</Text>
            <Text style={styles.glossaryDesc}>
              500+ terms with Tamil translations
            </Text>
          </TouchableOpacity>
        </View>

        {/* Best Practices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best Practices</Text>
          <View style={styles.practiceList}>
            <TouchableOpacity style={styles.practiceItem}>
              <Text style={styles.practiceIcon}>✓</Text>
              <Text style={styles.practiceText}>Summer Management Tips</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.practiceItem}>
              <Text style={styles.practiceIcon}>✓</Text>
              <Text style={styles.practiceText}>Biosecurity Protocols</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.practiceItem}>
              <Text style={styles.practiceIcon}>✓</Text>
              <Text style={styles.practiceText}>Feed Storage Guidelines</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.practiceItem}>
              <Text style={styles.practiceIcon}>✓</Text>
              <Text style={styles.practiceText}>Vaccination Calendar 2025</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  calculatorCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  calculatorIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.sm,
  },
  calculatorName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  calculatorDesc: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  guideCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  guideName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  guideDesc: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
  },
  glossaryCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.sm,
  },
  glossaryName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  glossaryDesc: {
    fontSize: typography.fontSize.small,
    color: colors.textSecondary,
  },
  practiceList: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.sm,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  practiceIcon: {
    fontSize: 18,
    color: colors.success,
    marginRight: spacing.sm,
  },
  practiceText: {
    fontSize: typography.fontSize.body,
    color: colors.text,
  },
});

