import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { USERS } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (USERS[username] && USERS[username].pass === password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      login(username, USERS[username].role, USERS[username].adminKey);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("یوزەرنەیم یاخود پاسووردەکە هەڵەیە");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
            <Ionicons name="flash" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.primary }]}>سیستەمی مۆلیدە</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>تکایە داخڵ بە</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary + "33" }]}>
          {/* Username */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>یوزەرنەیم</Text>
          <TextInput
            value={username}
            onChangeText={t => { setUsername(t); setError(""); }}
            placeholder="یوزەرنەیم بنووسە"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
            textAlign="right"
            autoCapitalize="none"
            returnKeyType="next"
          />

          {/* Password */}
          <Text style={[styles.label, { color: colors.mutedForeground }]}>پاسووورد</Text>
          <View style={styles.passRow}>
            <TextInput
              value={password}
              onChangeText={t => { setPassword(t); setError(""); }}
              placeholder="پاسووورد بنووسە"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPass}
              style={[styles.input, styles.passInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
              textAlign="right"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPass(x => !x)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? "eye-off" : "eye"} size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Error */}
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "55" }]}>
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          )}

          {/* Login button */}
          <Pressable
            onPress={handleLogin}
            style={({ pressed }) => [styles.loginBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          >
            <Text style={styles.loginBtnText}>داخڵ بوون</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  brand: { alignItems: "center", marginBottom: 32 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    fontFamily: "Amiri_700Bold",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: { fontSize: 13, textAlign: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  label: { fontSize: 12, marginBottom: 6, textAlign: "right" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: 14,
    fontFamily: "Amiri_400Regular",
  },
  passRow: { position: "relative" },
  passInput: { paddingLeft: 44, marginBottom: 0 },
  eyeBtn: {
    position: "absolute",
    left: 12,
    top: 11,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  errorText: { textAlign: "center", fontSize: 13, fontFamily: "Amiri_400Regular" },
  loginBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    fontFamily: "Amiri_700Bold",
  },
});
