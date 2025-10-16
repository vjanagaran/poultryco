import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@poultryco/design-system';

interface IconProps {
  color?: string;
  size?: number;
}

export const MenuIcon: React.FC<IconProps> = ({ color = colors.white, size = 24 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.menuLine, { backgroundColor: color, width: size - 4 }]} />
      <View style={[styles.menuLine, { backgroundColor: color, width: size - 4, marginTop: 4 }]} />
      <View style={[styles.menuLine, { backgroundColor: color, width: size - 4, marginTop: 4 }]} />
    </View>
  );
};

export const NotificationIcon: React.FC<IconProps> = ({ color = colors.white, size = 24 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.bellTop, { borderColor: color }]} />
      <View style={[styles.bellBody, { borderColor: color }]} />
      <View style={[styles.bellClapper, { backgroundColor: color }]} />
      <View style={[styles.bellDot, { backgroundColor: '#FF4444', position: 'absolute', top: 2, right: 2 }]} />
    </View>
  );
};

export const EditIcon: React.FC<IconProps> = ({ color = colors.white, size = 24 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.pencilBody, { backgroundColor: color }]} />
      <View style={[styles.pencilTip, { borderRightColor: color }]} />
    </View>
  );
};

export const BackIcon: React.FC<IconProps> = ({ color = colors.white, size = 24 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <View style={[styles.arrowLeft, { borderRightColor: color }]} />
      <View style={[styles.arrowLine, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Menu Icon
  menuLine: {
    height: 2,
    borderRadius: 1,
  },
  // Notification Icon
  bellTop: {
    width: 4,
    height: 3,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    position: 'absolute',
    top: 2,
  },
  bellBody: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    position: 'absolute',
    top: 4,
  },
  bellClapper: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    position: 'absolute',
    bottom: 3,
  },
  bellDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Edit Icon
  pencilBody: {
    width: 3,
    height: 16,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    top: 2,
    right: 4,
  },
  pencilTip: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    bottom: 3,
    left: 3,
  },
  // Back Icon
  arrowLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    position: 'absolute',
    left: 4,
  },
  arrowLine: {
    width: 12,
    height: 2,
    position: 'absolute',
    left: 8,
  },
});

