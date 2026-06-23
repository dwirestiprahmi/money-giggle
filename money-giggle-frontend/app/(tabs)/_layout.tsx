import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={21} color={focused ? Colors.text.primary : Colors.text.tertiary} />
      {focused && <View style={styles.dot} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarShowLabel: false }}>
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} /> }} />
      <Tabs.Screen name="transactions" options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'swap-vertical' : 'swap-vertical-outline'} focused={focused} /> }} />
      <Tabs.Screen name="budgets" options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} /> }} />
      <Tabs.Screen name="reports" options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} focused={focused} /> }} />
      <Tabs.Screen name="scan" options={{ tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'scan' : 'scan-outline'} focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: Colors.tabBar, borderTopWidth: 1, borderTopColor: Colors.border.default, height: 72, paddingBottom: 10, paddingTop: 8 },
  iconWrap: { alignItems: 'center', gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.text.primary },
});
