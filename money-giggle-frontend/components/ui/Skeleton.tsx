import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface Props { style?: ViewStyle; width?: number | string; height?: number; radius?: number; }

export default function Skeleton({ style, width = '100%', height = 16, radius = Radius.sm }: Props) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
    ])).start();
  }, [anim]);
  return <Animated.View style={[styles.bone, { width: width as number, height, borderRadius: radius, opacity: anim }, style]} />;
}

const styles = StyleSheet.create({ bone: { backgroundColor: Colors.bg.tertiary } });
