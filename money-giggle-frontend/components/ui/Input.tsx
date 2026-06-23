import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Font } from '@/constants/theme';

interface Props extends TextInputProps { label?: string; error?: string; hint?: string; }

export default function Input({ label, error, hint, secureTextEntry, style, ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? styles.inputError : null]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.tertiary}
          selectionColor={Colors.accent.primary}
          secureTextEntry={secureTextEntry && !visible}
          {...rest}
        />
        {secureTextEntry ? (
          <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.eye}>
            <Ionicons name={visible ? 'eye-outline' : 'eye-off-outline'} size={18} color={Colors.text.tertiary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 5 },
  label: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bg.input, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border.default,
  },
  inputError: { borderColor: Colors.expense },
  input: { flex: 1, fontFamily: Font.serif, fontSize: 15, color: Colors.text.primary, paddingHorizontal: 14, paddingVertical: 12, height: 48 },
  eye: { paddingRight: 12 },
  error: { fontFamily: Font.serif, fontSize: 12, color: Colors.expense },
  hint: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.tertiary },
});
