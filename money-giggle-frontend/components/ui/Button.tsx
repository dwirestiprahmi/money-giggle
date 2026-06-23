import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Font } from '@/constants/theme';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export default function Button({ title, onPress, loading, disabled, variant = 'primary', size = 'md', style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], styles[`size_${size}`], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? Colors.bg.primary : Colors.accent.primary} />
        : <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderRadius: Radius.md },
  primary: { backgroundColor: Colors.accent.primary },
  secondary: { backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.default },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: Colors.expenseDim, borderWidth: 1, borderColor: Colors.expense },
  disabled: { opacity: 0.4 },
  size_sm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
  size_md: { paddingVertical: 14, paddingHorizontal: 24, minHeight: 50 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 32, minHeight: 58 },
  text: { fontFamily: Font.serif, letterSpacing: 0.2 },
  text_primary: { color: Colors.bg.primary },
  text_secondary: { color: Colors.text.primary },
  text_ghost: { color: Colors.text.secondary },
  text_danger: { color: Colors.expense },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
});
