import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ADMIN_SECTIONS, MONTHS, USERS, YEARS } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export function AppHeader() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentUser, isManager, adminKey, activeSection, setActiveSection,
    year, setYear, month, setMonth, getSectionPaid, getSectionDebt, logout,
  } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.secondary }]}>
      {/* User row */}
      <View style={styles.userRow}>
        <View style={styles.userBadge}>
          <Ionicons
            name={isManager ? "ribbon" : "key"}
            size={14}
            color={colors.primary}
            style={{ marginLeft: 4 }}
          />
          <Text style={[styles.userLabel, { color: colors.primary }]}>
            {USERS[currentUser]?.label || currentUser}
          </Text>
        </View>
        <Pressable onPress={logout} style={[styles.logoutBtn, { borderColor: colors.destructive + "55" }]}>
          <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
        </Pressable>
      </View>

      {/* Section summary (manager sees all) */}
      {isManager ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionScroll} contentContainerStyle={styles.sectionScrollContent}>
          {Object.entries(ADMIN_SECTIONS).map(([ak, sec]) => {
            const paid = getSectionPaid(ak, year, month);
            const debt = getSectionDebt(ak, year, month);
            return (
              <View key={ak} style={[styles.sectionBadge, { backgroundColor: sec.color + "22", borderColor: sec.color + "44" }]}>
                <Text style={[styles.sectionBadgeLabel, { color: sec.color }]}>{sec.label}</Text>
                <Text style={[styles.sectionBadgeValue, { color: "#34d399" }]}>{paid.toLocaleString()}</Text>
                {debt > 0 && <Text style={[styles.sectionBadgeDebt, { color: "#f87171" }]}> قەرز:{debt.toLocaleString()}</Text>}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={[styles.adminSummary, { backgroundColor: colors.card, borderColor: colors.primary + "33" }]}>
          <Text style={[styles.adminSummaryLabel, { color: colors.mutedForeground }]}>وەرگیراوی {MONTHS[month]}:</Text>
          <Text style={[styles.adminSummaryValue, { color: colors.primary }]}>
            {getSectionPaid(adminKey, year, month).toLocaleString()} د.ع
          </Text>
          {getSectionDebt(adminKey, year, month) > 0 && (
            <Text style={[styles.adminSummaryDebt, { color: colors.destructive }]}>
              | قەرز: {getSectionDebt(adminKey, year, month).toLocaleString()}
            </Text>
          )}
        </View>
      )}

      {/* Year/Month pickers */}
      <View style={styles.pickersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearPickerContent}>
          {YEARS.map(y => (
            <Pressable key={y} onPress={() => setYear(y)} style={[styles.pill, year === y && { backgroundColor: colors.primary + "33", borderColor: colors.primary }]}>
              <Text style={[styles.pillText, { color: year === y ? colors.primary : colors.mutedForeground }]}>{y}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthPickerContent}>
        {MONTHS.map((m, i) => (
          <Pressable key={i} onPress={() => setMonth(i)} style={[styles.monthPill, month === i && { backgroundColor: colors.primary + "33", borderColor: colors.primary }]}>
            <Text style={[styles.monthPillText, { color: month === i ? colors.primary : colors.mutedForeground }]}>{m}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Section tabs (manager only) */}
      {isManager && (
        <View style={styles.sectionTabs}>
          {Object.entries(ADMIN_SECTIONS).map(([ak, sec]) => (
            <Pressable key={ak} onPress={() => setActiveSection(ak)} style={[
              styles.sectionTab,
              activeSection === ak && { backgroundColor: sec.color + "33", borderColor: sec.color }
            ]}>
              <Text style={[styles.sectionTabText, { color: activeSection === ak ? "#fff" : colors.mutedForeground }]}>
                {sec.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56,189,248,0.20)",
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  userBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
  },
  sectionScroll: { marginBottom: 6 },
  sectionScrollContent: { paddingHorizontal: 16, gap: 6, flexDirection: "row" },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  sectionBadgeLabel: { fontSize: 11, fontWeight: "700" },
  sectionBadgeValue: { fontSize: 11, fontWeight: "700" },
  sectionBadgeDebt: { fontSize: 10 },
  adminSummary: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    marginBottom: 6,
  },
  adminSummaryLabel: { fontSize: 11 },
  adminSummaryValue: { fontSize: 15, fontWeight: "900" },
  adminSummaryDebt: { fontSize: 11 },
  pickersRow: { marginBottom: 4 },
  yearPickerContent: { paddingHorizontal: 16, gap: 6, flexDirection: "row" },
  monthPickerContent: { paddingHorizontal: 16, gap: 6, flexDirection: "row", paddingBottom: 4 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillText: { fontSize: 12, fontWeight: "600" },
  monthPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  monthPillText: { fontSize: 11, fontWeight: "600" },
  sectionTabs: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
  },
  sectionTabText: { fontSize: 12, fontWeight: "700" },
});
