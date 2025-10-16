import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@poultryco/design-system';

interface IconProps {
  active?: boolean;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ active = false, size = 24 }) => {
  const color = active ? colors.primary : colors.textTertiary;
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.homeRoof, { borderBottomColor: color }]} />
      <View style={[styles.homeBody, { backgroundColor: color }]} />
      <View style={[styles.homeDoor, { backgroundColor: active ? colors.white : colors.background }]} />
    </View>
  );
};

export const SearchIcon: React.FC<IconProps> = ({ active = false, size = 24 }) => {
  const color = active ? colors.primary : colors.textTertiary;
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.searchCircle, { borderColor: color }]} />
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
};

export const MessagesIcon: React.FC<IconProps> = ({ active = false, size = 24 }) => {
  const color = active ? colors.primary : colors.textTertiary;
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.messageBubble, { borderColor: color }]}>
        <View style={[styles.messageDot, { backgroundColor: color }]} />
        <View style={[styles.messageDot, { backgroundColor: color, marginLeft: 3 }]} />
        <View style={[styles.messageDot, { backgroundColor: color, marginLeft: 3 }]} />
      </View>
    </View>
  );
};

export const ToolsIcon: React.FC<IconProps> = ({ active = false, size = 24 }) => {
  const color = active ? colors.primary : colors.textTertiary;
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.toolWrench, { backgroundColor: color }]} />
      <View style={[styles.toolScrewdriver, { backgroundColor: color }]} />
    </View>
  );
};

export const ProfileIcon: React.FC<IconProps> = ({ active = false, size = 24 }) => {
  const color = active ? colors.primary : colors.textTertiary;
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.profileHead, { borderColor: color }]} />
      <View style={[styles.profileBody, { borderColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Home Icon
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    position: 'absolute',
    top: 2,
  },
  homeBody: {
    width: 16,
    height: 12,
    position: 'absolute',
    bottom: 2,
  },
  homeDoor: {
    width: 6,
    height: 7,
    position: 'absolute',
    bottom: 2,
  },
  // Search Icon
  searchCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    position: 'absolute',
    top: 2,
    left: 2,
  },
  searchHandle: {
    width: 2,
    height: 8,
    position: 'absolute',
    bottom: 2,
    right: 4,
    transform: [{ rotate: '45deg' }],
  },
  // Messages Icon
  messageBubble: {
    width: 18,
    height: 14,
    borderWidth: 2,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  messageDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  // Tools Icon
  toolWrench: {
    width: 3,
    height: 16,
    position: 'absolute',
    left: 6,
    top: 4,
    transform: [{ rotate: '-45deg' }],
  },
  toolScrewdriver: {
    width: 3,
    height: 16,
    position: 'absolute',
    right: 6,
    top: 4,
    transform: [{ rotate: '45deg' }],
  },
  // Profile Icon
  profileHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    position: 'absolute',
    top: 2,
  },
  profileBody: {
    width: 16,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderBottomWidth: 0,
    position: 'absolute',
    bottom: 2,
  },
});

