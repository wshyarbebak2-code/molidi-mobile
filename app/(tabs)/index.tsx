import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader } from "@/components/AppHeader";
import { Toast } from "@/components/Toast";
import { ADMIN_SECTIONS, MONTHS, Tenant } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function TableScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { activeSection, year, month, tenants, getPrice, getPayment, setPayment } = useApp();
  const color = ADMIN_SECTIONS[activeSection]?.color || colors.primary;
  const sectionTenants = tenants[activeSection] || [];

  const [viewMonth, setViewMonth] = useState<number | null>(null);
  const [showDebtors, setShowDebtors] = useState(false);
  const [editingPayKey, setEditingPayKey] = useState<string | null>(null);
  const [payValue, setPayValue] = useState("");

  const getDue = (t: Tenant, mo: number) => t.ampere * getPrice(activeSection, year, mo);
  const getPaid = (t: Tenant, mo: number) => getPayment(t.id, year, mo).paid;
  const getDebt = (t: Tenant, mo: number) => Math.max(0, getDue(t, mo) - getPaid(t, mo));

  const debtors = useMemo(() => {
    const result: (Tenant & { totalDebt: number; totalPaid: number })[] = [];
    sectionTenants.forEach(t => {
      let totalDebt = 0, totalPaid = 0;
      MONTHS.forEach((_, mi) => {
        totalPaid += getPaid(t, mi);
        totalDebt += getDebt(t, mi);
      });
      if (totalDebt > 0) result.push({ ...t, totalDebt, totalPaid });
    });
    return result.sort((a, b) => b.totalDebt - a.totalDebt);
  }, [sectionTenants, year, activeSection]);

  const handlePay = (tid: number, mo: number) => {
    const val = parseInt(payValue) || 0;
    setPayment(tid, year, mo, val);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingPayKey(null);
    setPayValue("");
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader />
      <Toast />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: bottomPad + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Debtors panel */}
        <Pressable
          onPress={() => setShowDebtors(d => !d)}
          style={[styles.debtorToggle, { borderColor: "rgba(248,113,113,0.3)" }]}
        >
          <Ionicons name={showDebtors ? "chevron-up" : "chevron-down"} size={14} color="#f87171" style={{ marginLeft: 4 }} />
          <Text style={styles.debtorToggleText}>
            قەرزداران ({debtors.length} کەس) — کۆی قەرز:{" "}
            {debtors.reduce((s, t) => s + t.totalDebt, 0).toLocaleString()} د.ع
          </Text>
        </Pressable>

        {showDebtors && (
          <View style={[styles.debtorList, { borderColor: "rgba(248,113,113,0.2)" }]}>
            {debtors.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>هیچ قەرزدارێک نیە ✓</Text>
            ) : debtors.map(t => (
              <View key={t.id} style={[styles.debtorRow, { borderColor: "rgba(248,113,113,0.2)", backgroundColor: colors.card }]}>
                <View>
                  <Text style={[styles.debtorName, { color: colors.text }]} numberOfLines={1}>{t.name}</Text>
                  <Text style={[styles.debtorPhone, { color: colors.mutedForeground }]}>{t.phone}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.debtorAmount, { color: "#f87171" }]}>{t.totalDebt.toLocaleString()} د.ع</Text>
                  <Text style={[styles.debtorPaid, { color: colors.mutedForeground }]}>وەرگیراو: {t.totalPaid.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 12-month grid */}
        <View style={styles.grid}>
          {MONTHS.map((mname, mi) => {
            const price = getPrice(activeSection, year, mi);
            const totalDue = sectionTenants.reduce((s, t) => s + getDue(t, mi), 0);
            const totalPaid = sectionTenants.reduce((s, t) => s + getPaid(t, mi), 0);
            const totalDebt = sectionTenants.reduce((s, t) => s + getDebt(t, mi), 0);
            const pct = totalDue > 0 ? Math.round(totalPaid / totalDue * 100) : 0;
            const allPaid = totalDebt === 0 && totalPaid > 0;
            return (
              <Pressable
                key={mi}
                onPress={() => { setViewMonth(mi); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={({ pressed }) => [
                  styles.monthCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: allPaid ? "#065f46" : color + "44",
                    opacity: pressed ? 0.85 : 1,
                  }
                ]}
              >
                {/* Progress bar */}
                <View style={[styles.progressBg, { backgroundColor: color + "22" }]}>
                  <View style={[styles.progressFg, { width: `${pct}%` as any, backgroundColor: allPaid ? "#34d399" : color }]} />
                </View>

                {allPaid && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#34d399" />
                  </View>
                )}
                <Text style={[styles.monthName, { color: allPaid ? "#34d399" : colors.text }]} numberOfLines={1}>{mname}</Text>
                <Text style={[styles.monthPrice, { color: colors.mutedForeground }]}>{price.toLocaleString()} د.ع/ئەمپێر</Text>
                <Text style={[styles.monthPaid, { color }]}>{totalPaid.toLocaleString()}</Text>
                <Text style={[styles.monthDue, { color: colors.mutedForeground }]}>لە {totalDue.toLocaleString()}</Text>
                {totalDebt > 0 && <Text style={[styles.monthDebt, { color: "#f87171" }]}>قەرز: {totalDebt.toLocaleString()}</Text>}
                <Text style={[styles.monthPct, { color: color + "99" }]}>{pct}%</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Month detail modal */}
      <Modal
        visible={viewMonth !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewMonth(null)}
      >
        {viewMonth !== null && (
          <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
            {/* Modal header */}
            <View style={[styles.modalHeader, { backgroundColor: colors.secondary, borderBottomColor: color + "44" }]}>
              <Pressable onPress={() => { setViewMonth(null); setEditingPayKey(null); }} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{MONTHS[viewMonth]} {year}</Text>
              <View style={[styles.priceBadge, { backgroundColor: color + "22" }]}>
                <Text style={[styles.priceBadgeText, { color }]}>{getPrice(activeSection, year, viewMonth).toLocaleString()} د.ع/ئەمپێر</Text>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + 20 }}
              showsVerticalScrollIndicator={false}
            >
              {sectionTenants.map((t, idx) => {
                const due = getDue(t, viewMonth);
                const pay = getPayment(t.id, year, viewMonth);
                const debt = getDebt(t, viewMonth);
                const isPaid = debt === 0 && pay.paid > 0;
                const isPartial = pay.paid > 0 && debt > 0;
                const payKey = `${t.id}-${viewMonth}`;
                const isEditing = editingPayKey === payKey;

                return (
                  <View
                    key={t.id}
                    style={[
                      styles.tenantCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isPaid ? "#065f4644" : isPartial ? "#d9770644" : colors.border,
                      }
                    ]}
                  >
                    <View style={styles.tenantCardRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.tenantNameRow}>
                          <Text style={[styles.tenantIdx, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>#{idx + 1}</Text>
                          <Text style={[styles.tenantName, { color: colors.text }]} numberOfLines={1}>{t.name}</Text>
                        </View>
                        <Text style={[styles.tenantCalc, { color: colors.mutedForeground }]}>
                          {t.ampere} ئەمپێر × {getPrice(activeSection, year, viewMonth).toLocaleString()} ={" "}
                          <Text style={{ color: "#fbbf24", fontWeight: "700" }}>{due.toLocaleString()} د.ع</Text>
                        </Text>
                        <Text style={[styles.tenantPhone, { color: colors.mutedForeground }]}>{t.phone}</Text>
                      </View>
                      <View style={{ alignItems: "center", gap: 2 }}>
                        <Text style={[styles.paidAmount, { color: "#34d399" }]}>{pay.paid.toLocaleString()}</Text>
                        {debt > 0 && <Text style={[styles.debtAmount, { color: "#f87171" }]}>قەرز: {debt.toLocaleString()}</Text>}
                        {isPaid && <Text style={[styles.doneText, { color: "#34d399" }]}>تەواو</Text>}
                      </View>
                    </View>

                    {isEditing ? (
                      <View style={styles.payRow}>
                        <TextInput
                          value={payValue}
                          onChangeText={setPayValue}
                          placeholder={`${due.toLocaleString()}`}
                          placeholderTextColor={colors.mutedForeground}
                          keyboardType="numeric"
                          style={[styles.payInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                          textAlign="right"
                          autoFocus
                        />
                        <Pressable onPress={() => handlePay(t.id, viewMonth)} style={[styles.payConfirm, { backgroundColor: color }]}>
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        </Pressable>
                        <Pressable onPress={() => { setEditingPayKey(null); setPayValue(""); }} style={[styles.payCancel, { backgroundColor: colors.muted }]}>
                          <Ionicons name="close" size={18} color={colors.mutedForeground} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => { setEditingPayKey(payKey); setPayValue(String(pay.paid || "")); }}
                        style={[styles.payBtn, { backgroundColor: color + "33", borderColor: color }]}
                      >
                        <Ionicons name="card-outline" size={14} color="#fff" style={{ marginLeft: 4 }} />
                        <Text style={styles.payBtnText}>پارەدان / دەستکاری</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  debtorToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(248,113,113,0.10)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
    justifyContent: "flex-end",
  },
  debtorToggleText: { color: "#f87171", fontSize: 12, fontWeight: "700", textAlign: "right", fontFamily: "Amiri_700Bold" },
  debtorList: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "rgba(248,113,113,0.06)",
  },
  debtorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
  },
  debtorName: { fontSize: 13, fontWeight: "700", textAlign: "right", fontFamily: "Amiri_700Bold" },
  debtorPhone: { fontSize: 11, textAlign: "right" },
  debtorAmount: { fontSize: 14, fontWeight: "900" },
  debtorPaid: { fontSize: 10 },
  emptyText: { textAlign: "center", padding: 12, fontSize: 13, fontFamily: "Amiri_400Regular" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  monthCard: {
    width: "31%",
    borderRadius: 13,
    borderWidth: 2,
    padding: 10,
    overflow: "hidden",
    minHeight: 110,
  },
  progressBg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 3,
  },
  progressFg: {
    height: 3,
    borderRadius: 3,
  },
  checkBadge: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  monthName: { fontSize: 11, fontWeight: "900", textAlign: "right", marginBottom: 3, fontFamily: "Amiri_700Bold" },
  monthPrice: { fontSize: 9, textAlign: "right", marginBottom: 2 },
  monthPaid: { fontSize: 12, fontWeight: "900", textAlign: "right" },
  monthDue: { fontSize: 9, textAlign: "right" },
  monthDebt: { fontSize: 9, textAlign: "right", marginTop: 2 },
  monthPct: { fontSize: 8, textAlign: "right", marginTop: 2 },
  // Modal
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 20,
    borderBottomWidth: 2,
  },
  closeBtn: { padding: 4 },
  modalTitle: { fontSize: 16, fontWeight: "900", fontFamily: "Amiri_700Bold" },
  priceBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  priceBadgeText: { fontSize: 11, fontWeight: "700" },
  tenantCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  tenantCardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  tenantNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3, justifyContent: "flex-end" },
  tenantIdx: { fontSize: 10, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  tenantName: { fontSize: 14, fontWeight: "900", textAlign: "right", fontFamily: "Amiri_700Bold" },
  tenantCalc: { fontSize: 10, textAlign: "right" },
  tenantPhone: { fontSize: 10, textAlign: "right" },
  paidAmount: { fontSize: 14, fontWeight: "900" },
  debtAmount: { fontSize: 12, fontWeight: "700" },
  doneText: { fontSize: 11, fontWeight: "700" },
  payRow: { flexDirection: "row", gap: 6 },
  payInput: { flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  payConfirm: { borderRadius: 8, padding: 10, justifyContent: "center", alignItems: "center" },
  payCancel: { borderRadius: 8, padding: 10, justifyContent: "center", alignItems: "center" },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 8,
    gap: 4,
  },
  payBtnText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Amiri_700Bold" },
});
