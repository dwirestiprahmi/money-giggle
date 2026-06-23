import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Font } from '@/constants/theme';
import { useScanReceipt } from '@/hooks/useQueries';
import { ReceiptScanResult } from '@/api/types';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/utils/format';

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string|null>(null);
  const [result, setResult] = useState<ReceiptScanResult|null>(null);
  const scanMutation = useScanReceipt();

  const pickImage = async (fromCamera: boolean) => {
    const { status } = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Please grant access in Settings.'); return; }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && res.assets[0]) {
      const uri = res.assets[0].uri;
      setImageUri(uri); setResult(null);
      try { setResult(await scanMutation.mutateAsync(uri)); }
      catch { Alert.alert('Scan failed', 'Could not read the receipt. Try a clearer image.'); }
    }
  };

  const handleUseResult = () => {
    if (!result) return;
    const params = new URLSearchParams();
    if (result.amount) params.set('amount', String(result.amount));
    if (result.currency) params.set('currency', result.currency);
    if (result.date) params.set('date', result.date);
    if (result.merchant) params.set('description', result.merchant);
    router.push(`/transactions/new?${params.toString()}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Scan receipt</Text>
        <Text style={styles.subtitle}>Capture a receipt to auto-fill a transaction</Text>

        {!imageUri ? (
          <>
            <View style={styles.scanFrame}>
              <Ionicons name="receipt-outline" size={44} color={Colors.border.strong} />
              <Text style={styles.scanHint}>Take a photo or upload from gallery</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(true)}>
                <Ionicons name="camera-outline" size={22} color={Colors.text.secondary} />
                <Text style={styles.pickBtnTxt}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickBtn} onPress={() => pickImage(false)}>
                <Ionicons name="image-outline" size={22} color={Colors.text.secondary} />
                <Text style={styles.pickBtnTxt}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.resultArea}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
            {scanMutation.isPending ? (
              <View style={styles.scanning}>
                <Ionicons name="scan-outline" size={24} color={Colors.text.secondary} />
                <Text style={styles.scanningTxt}>Scanning receipt…</Text>
              </View>
            ) : result ? (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Receipt detected</Text>
                {result.merchant && <ResultRow label="Merchant" value={result.merchant} />}
                {result.amount && <ResultRow label="Amount" value={formatCurrency(result.amount, result.currency??'USD')} highlight />}
                {result.date && <ResultRow label="Date" value={result.date} />}
                {result.currency && <ResultRow label="Currency" value={result.currency} />}
                <Button title="Create transaction" onPress={handleUseResult} style={{ marginTop: 12 }} />
                <Button title="Try again" onPress={() => { setImageUri(null); setResult(null); }} variant="ghost" size="sm" style={{ marginTop: 6 }} />
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={rrStyles.row}>
      <Text style={rrStyles.label}>{label}</Text>
      <Text style={[rrStyles.value, highlight && rrStyles.highlight]}>{value}</Text>
    </View>
  );
}
const rrStyles = StyleSheet.create({
  row: { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor:Colors.border.subtle },
  label: { fontFamily:Font.serif, fontSize:13, color:Colors.text.tertiary },
  value: { fontFamily:Font.serif, fontSize:13, color:Colors.text.primary },
  highlight: { color:Colors.income, fontFamily:'monospace' },
});

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor:Colors.bg.primary },
  container: { paddingHorizontal:20, paddingTop:16, paddingBottom:32 },
  title: { fontFamily:Font.serif, fontSize:28, color:Colors.text.primary },
  subtitle: { fontFamily:Font.serif, fontSize:14, color:Colors.text.tertiary, marginTop:4, marginBottom:28 },
  scanFrame: { height:200, backgroundColor:Colors.bg.secondary, borderRadius:Radius.xl, borderWidth:1, borderColor:Colors.border.default, borderStyle:'dashed', alignItems:'center', justifyContent:'center', gap:12, marginBottom:16 },
  scanHint: { fontFamily:Font.serif, fontSize:13, color:Colors.text.tertiary, textAlign:'center' },
  btnRow: { flexDirection:'row', gap:12, marginBottom:16 },
  pickBtn: { flex:1, paddingVertical:16, borderRadius:Radius.lg, backgroundColor:Colors.bg.secondary, borderWidth:1, borderColor:Colors.border.default, alignItems:'center', gap:6 },
  pickBtnTxt: { fontFamily:Font.serif, fontSize:13, color:Colors.text.secondary },
  resultArea: { gap:14 },
  preview: { width:'100%', height:180, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border.default },
  scanning: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:18, backgroundColor:Colors.bg.secondary, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border.default },
  scanningTxt: { fontFamily:Font.serif, fontSize:14, color:Colors.text.secondary },
  resultCard: { backgroundColor:Colors.bg.secondary, borderRadius:Radius.lg, borderWidth:1, borderColor:Colors.border.default, padding:18 },
  resultTitle: { fontFamily:Font.serif, fontSize:16, color:Colors.text.primary, marginBottom:10 },
});
