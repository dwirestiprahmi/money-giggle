import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Font } from '@/constants/theme';

interface Props { label: string; color?: string; size?: 'sm' | 'md'; }

export default function Badge({ label, color, size = 'md' }: Props) {
  const bg = color ? `${color}22` : Colors.bg.tertiary;
  const txt = color ?? Colors.text.tertiary;
  return (
    <View style={[styles.badge, size === 'sm' && styles.sm, { backgroundColor: bg }]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm, { color: txt }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, alignSelf: 'flex-start' },
  sm: { paddingHorizontal: 6, paddingVertical: 2 },
  text: { fontFamily: Font.serif, fontSize: 12 },
  textSm: { fontSize: 11 },
});
