import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Smartphone, Tablet, Monitor, Watch, Wifi, WifiOff, MoreVertical } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { useMembership } from "@/providers/MembershipProvider";

export default function DevicesScreen() {
  const { t } = useTranslation();
  const membership = useMembership();
  const membershipType = membership.tier || "free";

  const [devices] = useState([
    {
      id: "1",
      name: "iPhone 15 Pro",
      type: "phone" as const,
      status: "online" as const,
      lastSync: "現在",
      current: true,
    },
    {
      id: "2",
      name: "iPad Pro",
      type: "tablet" as const,
      status: "online" as const,
      lastSync: "2小時前",
      current: false,
    },
    {
      id: "3",
      name: "MacBook Pro",
      type: "laptop" as const,
      status: "offline" as const,
      lastSync: "昨天",
      current: false,
    },
    {
      id: "4",
      name: "Apple Watch",
      type: "watch" as const,
      status: "offline" as const,
      lastSync: "3天前",
      current: false,
    },
  ]);

  const maxDevices = membershipType === "free" || membershipType === "free_trial" ? 1 : membershipType === "basic" ? 3 : 5;

  const handleRemoveDevice = (deviceId: string) => {
    Alert.alert(
      t("remove_device"),
      t("remove_device_confirm"),
      [
        { text: t("cancel"), style: "cancel" },
        { text: t("remove"), style: "destructive", onPress: () => {} },
      ]
    );
  };



  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "phone":
        return <Smartphone size={24} color={Colors.primary.text} />;
      case "tablet":
        return <Tablet size={24} color={Colors.primary.text} />;
      case "laptop":
        return <Monitor size={24} color={Colors.primary.text} />;
      case "watch":
        return <Watch size={24} color={Colors.primary.text} />;
      default:
        return <Smartphone size={24} color={Colors.primary.text} />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("device_management")}</Text>
            <Text style={styles.headerDescription}>
              {t("device_management_description")}
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("bound_devices")}</Text>
          </View>

          {devices.map((device) => (
            <View key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceIconContainer}>
                {getDeviceIcon(device.type)}
              </View>

              <View style={styles.deviceInfo}>
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  {device.current && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>{t("current_device")}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.deviceStatus}>
                  {device.status === "online" ? (
                    <Wifi size={14} color={Colors.success} />
                  ) : (
                    <WifiOff size={14} color={Colors.primary.textSecondary} />
                  )}
                  <Text style={styles.deviceStatusText}>
                    {device.status === "online" ? t("online") : t("offline")}
                  </Text>
                  <Text style={styles.deviceSyncText}>
                    · {t("sync")}: {device.lastSync}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.moreButton}
                onPress={() => handleRemoveDevice(device.id)}
              >
                <MoreVertical size={20} color={Colors.primary.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.limitSection}>
            <Text style={styles.limitTitle}>{t("device_limit")}</Text>
            <Text style={styles.limitCount}>
              {`${t("used")} ${devices.length} / ${maxDevices} ${t("devices")}`}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(devices.length / maxDevices) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.limitDescription}>
              {t("device_limit_upgrade_description")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.primary.text,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary.text,
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.secondary.bg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  deviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.bg,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary.text,
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  deviceStatusText: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
  },
  deviceSyncText: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
  },
  currentBadge: {
    backgroundColor: Colors.primary.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: Colors.primary.text,
  },
  moreButton: {
    padding: 8,
  },
  limitSection: {
    marginTop: 24,
    backgroundColor: Colors.secondary.bg,
    borderRadius: 16,
    padding: 16,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary.text,
    marginBottom: 8,
  },
  limitCount: {
    fontSize: 14,
    color: Colors.primary.textSecondary,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.primary.bg,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary.accent,
    borderRadius: 4,
  },
  limitDescription: {
    fontSize: 13,
    color: Colors.primary.textSecondary,
    lineHeight: 18,
  },
});
