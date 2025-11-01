import React from "react";
import { View } from "react-native";
import CategoryManagement from "@/components/CategoryManagement";
import Colors from "@/constants/colors";

export default function CategoryManagementScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary.bg }}>
      <CategoryManagement />
    </View>
  );
}
