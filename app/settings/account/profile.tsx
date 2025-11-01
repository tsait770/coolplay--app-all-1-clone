import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { User, Mail, Phone, Camera, LogOut } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/providers/AuthProvider";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [username, setUsername] = useState(user?.user_metadata?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const handleSave = () => {
    Alert.alert(t("success"), t("profile_updated"));
  };

  const handleLogout = () => {
    Alert.alert(t("logout"), t("logout_confirm"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("logout"), style: "destructive", onPress: () => {} },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(t("change_password"), t("password_reset_sent"));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/120" }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.cameraButton}>
            <Camera size={20} color={Colors.primary.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.avatarHint}>{t("tap_to_change_avatar")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("basic_info")}</Text>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <User size={20} color={Colors.primary.accent} />
            <Text style={styles.labelText}>{t("username")}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder={t("enter_username")}
            placeholderTextColor={Colors.primary.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Mail size={20} color={Colors.primary.accent} />
            <Text style={styles.labelText}>{t("email")}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t("enter_email")}
            placeholderTextColor={Colors.primary.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Phone size={20} color={Colors.primary.accent} />
            <Text style={styles.labelText}>{t("phone")}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t("enter_phone")}
            placeholderTextColor={Colors.primary.textSecondary}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("security")}</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleChangePassword}
        >
          <Text style={styles.actionButtonText}>{t("change_password")}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t("save_changes")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={Colors.semantic.danger} />
        <Text style={styles.logoutButtonText}>{t("logout")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.bg,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface.secondary,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.primary.bg,
  },
  avatarHint: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.primary.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary.textSecondary,
    marginBottom: 16,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.primary.text,
  },
  input: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.primary.text,
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  actionButton: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.card.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: Colors.primary.accent,
  },
  saveButton: {
    margin: 20,
    backgroundColor: Colors.primary.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.primary.text,
  },
  logoutButton: {
    margin: 20,
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.semantic.danger,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.semantic.danger,
  },
});
