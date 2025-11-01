import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from 'expo-router';
import Colors from "@/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();

  useEffect(() => {
    console.log('[Settings Tab] Redirecting to /settings/index');
    router.replace('/settings/index' as any);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});