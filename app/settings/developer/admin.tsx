import React from "react";
import { View } from "react-native";
import AdminPanel from "@/components/AdminPanel";
import Colors from "@/constants/colors";

export default function AdminScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary.bg }}>
      <AdminPanel />
    </View>
  );
}
