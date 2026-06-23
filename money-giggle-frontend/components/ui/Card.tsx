import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface Props { children: React.ReactNode; style?: ViewStyle; elevated?: boolean; }

export default function Card({ children, style, elevated }: Props) {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bg.secondary, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border.default, padding: 16 },
  elevated: { backgroundColor: Colors.bg.primary, borderColor: Colors.border.strong },
});
