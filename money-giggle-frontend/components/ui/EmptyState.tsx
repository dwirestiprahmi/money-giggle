import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Font } from '@/constants/theme';

interface Props { icon?: React.ComponentProps<typeof Ionicons>['name']; title: string; subtitle?: string; action?: React.ReactNode; }

export default function EmptyState({ icon = 'document-outline', title, subtitle, action }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={Colors.text.tertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.bg.tertiary, alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 1, borderColor: Colors.border.default },
  title: { fontFamily: Font.serif, fontSize: 16, color: Colors.text.secondary, textAlign: 'center' },
  subtitle: { fontFamily: Font.serif, fontSize: 13, color: Colors.text.tertiary, textAlign: 'center', marginTop: 5 },
  action: { marginTop: 18 },
});
