import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius, Font } from '@/constants/theme';
import { authApi } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BRL', 'CAD'];

export default function RegisterScreen() {
  const setAuth = useAuthStore(s => s.setAuth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.register({ name: name.trim(), email: email.trim(), password, defaultCurrency: currency });
      await setAuth(res.accessToken, res.refreshToken, res.user);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Registration failed. Email may already be in use.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headline}>Create{'\n'}account.</Text>
        <Text style={styles.sub}>Start tracking your money</Text>

        {error ? <View style={styles.errorBox}><Text style={styles.errorTxt}>{error}</Text></View> : null}

        <View style={styles.form}>
          <Input label="Full name" value={name} onChangeText={setName} placeholder="Jane Smith" />
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="min. 8 characters" secureTextEntry />

          <View>
            <Text style={styles.currLabel}>Default currency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CURRENCIES.map(c => (
                <TouchableOpacity key={c} style={[styles.currChip, currency === c && styles.currChipActive]} onPress={() => setCurrency(c)}>
                  <Text style={[styles.currTxt, currency === c && styles.currTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <Button title="Create account" onPress={handleRegister} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerTxt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg.primary },
  container: { flexGrow: 1, paddingHorizontal: 36, paddingTop: 60, paddingBottom: 32 },
  back: { marginBottom: 40 },
  backTxt: { fontFamily: Font.serif, fontSize: 15, color: Colors.text.tertiary },
  headline: { fontFamily: Font.serif, fontSize: 44, color: Colors.text.primary, lineHeight: 54, marginBottom: 8 },
  sub: { fontFamily: Font.serif, fontSize: 15, color: Colors.text.tertiary, marginBottom: 36 },
  errorBox: { backgroundColor: Colors.expenseDim, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 3, borderLeftColor: Colors.expense, borderRadius: 0 },
  errorTxt: { fontFamily: Font.serif, fontSize: 13, color: Colors.expense },
  form: { gap: Spacing.md, marginBottom: Spacing.xl },
  currLabel: { fontFamily: Font.serif, fontSize: 12, color: Colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  currChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.bg.secondary, borderWidth: 1, borderColor: Colors.border.default, marginRight: 8 },
  currChipActive: { backgroundColor: Colors.text.primary, borderColor: Colors.text.primary },
  currTxt: { fontFamily: Font.serif, fontSize: 13, color: Colors.text.secondary },
  currTxtActive: { color: Colors.bg.primary },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerTxt: { fontFamily: Font.serif, fontSize: 14, color: Colors.text.tertiary },
  footerLink: { fontFamily: Font.serif, fontSize: 14, color: Colors.text.primary, textDecorationLine: 'underline' },
});
