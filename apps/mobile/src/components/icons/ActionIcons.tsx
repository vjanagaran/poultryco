import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@poultryco/design-system';

interface IconProps {
  color?: string;
  size?: number;
}

export const AskExpertIcon: React.FC<IconProps> = ({ color = colors.white, size = 40 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Person head */}
      <View style={[styles.expertHead, { borderColor: color }]} />
      {/* Person body */}
      <View style={[styles.expertBody, { borderColor: color }]} />
      {/* Question mark */}
      <View style={[styles.questionMark, { backgroundColor: color }]} />
      <View style={[styles.questionDot, { backgroundColor: color }]} />
    </View>
  );
};

export const FCRCalcIcon: React.FC<IconProps> = ({ color = colors.white, size = 40 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Calculator body */}
      <View style={[styles.calcBody, { borderColor: color }]}>
        {/* Display */}
        <View style={[styles.calcDisplay, { backgroundColor: color }]} />
        {/* Buttons grid */}
        <View style={styles.calcButtons}>
          <View style={[styles.calcButton, { backgroundColor: color }]} />
          <View style={[styles.calcButton, { backgroundColor: color }]} />
          <View style={[styles.calcButton, { backgroundColor: color }]} />
          <View style={[styles.calcButton, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

export const DirectoryIcon: React.FC<IconProps> = ({ color = colors.white, size = 40 }) => {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      {/* Book/Directory */}
      <View style={[styles.bookCover, { borderColor: color }]}>
        {/* Pages */}
        <View style={[styles.bookLine, { backgroundColor: color }]} />
        <View style={[styles.bookLine, { backgroundColor: color, marginTop: 3 }]} />
        <View style={[styles.bookLine, { backgroundColor: color, marginTop: 3 }]} />
      </View>
      {/* Bookmark */}
      <View style={[styles.bookmark, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Ask Expert Icon
  expertHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    position: 'absolute',
    top: 4,
    left: 6,
  },
  expertBody: {
    width: 20,
    height: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    borderBottomWidth: 0,
    position: 'absolute',
    bottom: 6,
    left: 3,
  },
  questionMark: {
    width: 2,
    height: 8,
    borderRadius: 1,
    position: 'absolute',
    top: 6,
    right: 8,
  },
  questionDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    position: 'absolute',
    top: 16,
    right: 8,
  },
  // FCR Calculator Icon
  calcBody: {
    width: 24,
    height: 30,
    borderWidth: 2,
    borderRadius: 4,
    padding: 4,
  },
  calcDisplay: {
    width: '100%',
    height: 6,
    borderRadius: 2,
    marginBottom: 4,
  },
  calcButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  calcButton: {
    width: 4,
    height: 4,
    borderRadius: 1,
  },
  // Directory Icon
  bookCover: {
    width: 24,
    height: 28,
    borderWidth: 2,
    borderRadius: 2,
    padding: 4,
    justifyContent: 'center',
  },
  bookLine: {
    width: '100%',
    height: 2,
    borderRadius: 1,
  },
  bookmark: {
    width: 4,
    height: 12,
    position: 'absolute',
    top: 2,
    right: 6,
  },
});

