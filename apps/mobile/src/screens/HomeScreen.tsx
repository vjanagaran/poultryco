import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors, typography, spacing } from '@poultryco/design-system';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.menuIcon}>☰</Text>
        </View>
        <Text style={styles.headerTitle}>PoultryCo</Text>
        <View style={styles.headerRight}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Market Widget */}
        <View style={styles.marketWidget}>
          <Text style={styles.widgetTitle}>📊 Today's Market</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Broiler (Chennai)</Text>
            <Text style={styles.priceValue}>₹125/kg</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Layer Feed</Text>
            <Text style={styles.priceValue}>₹1,850/bag</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Egg (Namakkal)</Text>
            <Text style={styles.priceValue}>₹4.85/pc</Text>
          </View>
        </View>

        {/* Weather Widget */}
        <View style={styles.weatherWidget}>
          <Text style={styles.widgetTitle}>🌤️ Weather Alert</Text>
          <Text style={styles.weatherText}>Temperature: 32°C</Text>
          <Text style={styles.weatherText}>Humidity: 65%</Text>
          <Text style={styles.weatherAlert}>⚠️ Heat stress warning for broilers</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon} />
              <Text style={styles.actionText}>Ask Expert</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon} />
              <Text style={styles.actionText}>FCR Calc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <View style={styles.actionIcon} />
              <Text style={styles.actionText}>Directory</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Community Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Updates</Text>
          
          <TouchableOpacity style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>DR</Text>
              </View>
              <View style={styles.postInfo}>
                <View style={styles.postNameRow}>
                  <Text style={styles.postName}>Dr. Ravi Kumar</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.badgeText}>Verified Vet</Text>
                  </View>
                </View>
                <Text style={styles.postTime}>2 hours ago</Text>
              </View>
            </View>
            <Text style={styles.postContent}>
              New vaccination schedule for winter season...
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={[styles.avatar, styles.avatarSecondary]}>
                <Text style={styles.avatarText}>KF</Text>
              </View>
              <View style={styles.postInfo}>
                <Text style={styles.postName}>Kumar Farms</Text>
                <Text style={styles.postTime}>5 hours ago</Text>
              </View>
            </View>
            <Text style={styles.postContent}>
              Successfully reduced mortality to 2% using...
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  safeArea: {
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
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  menuIcon: {
    fontSize: 24,
    color: colors.white,
  },
  headerTitle: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  notificationIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  marketWidget: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
  },
  weatherWidget: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.lg,
  },
  widgetTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  priceLabel: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  weatherText: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  weatherAlert: {
    fontSize: typography.fontSize.body,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  actionIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.small,
    color: colors.text,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarSecondary: {
    backgroundColor: colors.secondary,
  },
  avatarText: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  postNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  postName: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.tiny,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  postTime: {
    fontSize: typography.fontSize.small,
    color: colors.textTertiary,
  },
  postContent: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

