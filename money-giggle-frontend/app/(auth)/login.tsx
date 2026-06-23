import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius, Font } from '@/constants/theme';
import { authApi } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginScreen() {
  const setAuth = useAuthStore(s => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.login({ email: email.trim(), password });
      await setAuth(res.accessToken, res.refreshToken, res.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Invalid email or password';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoRow}>
          <View style={styles.logoSquare} />
          <View style={[styles.logoSquare, styles.logoSquare2]} />
        </View>
        <Text style={styles.headline}>Welcome{'\n'}back.</Text>
        <Text style={styles.sub}>Sign in to your account</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorTxt}>{error}</Text></View> : null}

        <View style={styles.form}>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        </View>

        <Button title="Sign in" onPress={handleLogin} loading={loading} style={styles.btn} />

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flexGrow: 1, paddingHorizontal: 36, paddingTop: 80, paddingBottom: 32 },
  logoRow: { flexDirection: 'row', gap: 6, marginBottom: 48 },
  logoSquare: { width: 14, height: 14, borderRadius: 3, backgroundColor: Colors.text.primary },
  logoSquare2: { backgroundColor: Colors.text.tertiary, opacity: 0.5 },
  headline: { fontFamily: Font.serif, fontSize: 44, color: Colors.text.primary, lineHeight: 54, marginBottom: 8 },
  sub: { fontFamily: Font.serif, fontSize: 15, color: Colors.text.tertiary, marginBottom: 40 },
  errorBox: { backgroundColor: Colors.expenseDim, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.expense, borderRadius: 0 },
  errorTxt: { fontFamily: Font.serif, fontSize: 13, color: Colors.expense },
  form: { gap: Spacing.md, marginBottom: Spacing.xl },
  btn: { marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerTxt: { fontFamily: Font.serif, fontSize: 14, color: Colors.text.tertiary },
  footerLink: { fontFamily: Font.serif, fontSize: 14, color: Colors.text.primary, textDecorationLine: 'underline' },
});
