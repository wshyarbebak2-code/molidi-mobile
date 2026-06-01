import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
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
import { ADMIN_SECTIONS, Tenant } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type NewTenantForm = { name: string; phone: string; address: string; ampere: string };

export default function TenantsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    activeSection, year, month, tenants, isManager,
    getPrice, getPayment, setPayment, setPrice,
    addTenant, editTenant, deleteTenant,
  } = useApp();
  const color = ADMIN_SECTIONS[activeSection]?.color || colors.primary;
  const sectionTenants = tenants[activeSection] || [];

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tenant>>({});
  const [newForm, setNewForm] = useState<NewTenantForm>({ name: "", phone: "", address: "", ampere: "1" });
  const [priceInput, setPriceInput] = useState("");
  const [editingPayId, setEditingPayId] = useState<number | null>(null);
  const [payInput, setPayInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [historyTenantId, setHistoryTenantId] = useState<number | null>(null);
  const [historyYear, setHistoryYear] = useState(year);
  const [historyPayMonth, setHistoryPayMonth] = useState<number | null>(null);
  const [historyPayInput, setHistoryPayInput] = useState("");

  const curPrice = getPrice(activeSection, year, month);
  const getDue = (t: Tenant) => t.ampere * curPrice;
  const getPaid = (t: Tenant) => getPayment(t.id, year, month).paid;
  const getDebt = (t: Tenant) => Math.max(0, getDue(t) - getPaid(t));

  const totalDue = sectionTenants.reduce((s, t) => s + getDue(t), 0);
  const totalPaid = sectionTenants.reduce((s, t) => s + getPaid(t), 0);
  const totalDebt = sectionTenants.reduce((s, t) => s + getDebt(t), 0);

  const q = searchQuery.trim().toLowerCase();
  const filteredTenants = q
    ? sectionTenants.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          t.phone.replace(/[-\s]/g, "").includes(q.replace(/[-\s]/g, "")) ||
          t.address.toLowerCase().includes(q)
      )
    : sectionTenants;

  const handleAdd = () => {
    if (!newForm.name.trim()) return;
    addTenant(activeSection, {
      id: Date.now(),
      name: newForm.name.trim(),
      phone: newForm.phone.trim(),
      address: newForm.address.trim(),
      ampere: parseInt(newForm.ampere) || 1,
    });
    setNewForm({ name: "", phone: "", address: "", ampere: "1" });
    setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveEdit = () => {
    if (editingId === null) return;
    editTenant(activeSection, editingId, {
      ...editForm,
      ampere: parseInt(String(editForm.ampere)) || 1,
    });
    setEditingId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "سڕینەوەی بەژداربوو",
      `ئایا دڵنیایت لە سڕینەوەی ${name}؟`,
      [
        { text: "نەخێر", style: "cancel" },
        { text: "سڕینەوە", style: "destructive", onPress: () => { deleteTenant(activeSection, id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } },
      ]
    );
  };

  const handlePay = (tid: number) => {
    const val = parseInt(payInput) || 0;
    setPayment(tid, year, month, val);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditingPayId(null);
    setPayInput("");
  };

  const handleHistoryPay = (tid: number) => {
    if (historyPayMonth === null) return;
    const val = parseInt(historyPayInput) || 0;
    setPayment(tid, historyYear, historyPayMonth, val);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHistoryPayMonth(null);
    setHistoryPayInput("");
  };

  const historyTenant = historyTenantId !== null
    ? sectionTenants.find(t => t.id === historyTenantId) ?? null
    : null;
  const hPrice = (mo: number) => getPrice(activeSection, historyYear, mo);
  const hDue   = (mo: number) => (historyTenant ? historyTenant.ampere * hPrice(mo) : 0);
  const hPaid  = (mo: number) => (historyTenant ? getPayment(historyTenant.id, historyYear, mo).paid : 0);
  const hDebt  = (mo: number) => Math.max(0, hDue(mo) - hPaid(mo));
  let histYearDue = 0, histYearPaid = 0, histYearDebt = 0;
  for (let mi = 0; mi < 12; mi++) {
    histYearDue  += hDue(mi);
    histYearPaid += hPaid(mi);
    histYearDebt += hDebt(mi);
  }

  const handleSetPrice = () => {
    const v = parseInt(priceInput) || 0;
    if (!v) return;
    setPrice(activeSection, year, month, v);
    setPriceInput("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader />
      <Toast />

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: bottomPad + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Summary stats */}
        <View style={styles.statsRow}>
          {[
            { label: "کۆی بڕی پارە", value: totalDue, color: colors.primary },
            { label: "وەرگیراو", value: totalPaid, color: "#34d399" },
            { label: "قەرز", value: totalDebt, color: "#f87171" },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: s.color + "33" }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value.toLocaleString()}</Text>
              <Text style={[styles.statUnit, { color: colors.mutedForeground }]}>د.ع</Text>
            </View>
          ))}
        </View>

        {/* Search bar */}
        <View style={[styles.searchWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={v => { setSearchQuery(v); setEditingPayId(null); setEditingId(null); }}
            placeholder="گەڕان بەناو، موبایل یان ناونیشان..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.text }]}
            textAlign="right"
            returnKeyType="search"
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} style={styles.searchClear}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Filter result count */}
        {q.length > 0 && (
          <View style={[styles.resultBar, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.resultText, { color: filteredTenants.length > 0 ? colors.primary : colors.destructive }]}>
              {filteredTenants.length > 0
                ? `${filteredTenants.length} کەس دۆزرایەوە`
                : "هیچ ئەنجامێک نەدۆزرایەوە"}
            </Text>
            <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
              بۆ: "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Price setter (manager only) */}
        {isManager && (
          <View style={[styles.priceBox, { backgroundColor: colors.card, borderColor: color + "33" }]}>
            <View style={styles.priceTop}>
              <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>نرخی ئەمپێر:</Text>
              <Text style={[styles.priceValue, { color: "#fbbf24" }]}>{curPrice.toLocaleString()} د.ع</Text>
            </View>
            <View style={styles.priceRow}>
              <TextInput
                value={priceInput}
                onChangeText={setPriceInput}
                placeholder="نرخی نوێ"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                style={[styles.smallInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text, flex: 1 }]}
                textAlign="right"
              />
              <Pressable onPress={handleSetPrice} style={[styles.smallBtn, { backgroundColor: color }]}>
                <Text style={styles.smallBtnText}>نوێکردنەوە</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Add tenant (manager only) */}
        {isManager && (
          <>
            <Pressable
              onPress={() => { setShowAdd(!showAdd); setEditingId(null); }}
              style={[styles.addBtn, { backgroundColor: color + "22", borderColor: color }]}
            >
              <Ionicons name="person-add-outline" size={16} color={color} style={{ marginLeft: 6 }} />
              <Text style={[styles.addBtnText, { color }]}>زیادکردنی بەژداربوو</Text>
            </Pressable>

            {showAdd && (
              <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  value={newForm.name}
                  onChangeText={v => setNewForm(p => ({ ...p, name: v }))}
                  placeholder="ناو"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                  textAlign="right"
                />
                <TextInput
                  value={newForm.phone}
                  onChangeText={v => setNewForm(p => ({ ...p, phone: v }))}
                  placeholder="موبایل"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                  textAlign="right"
                />
                <TextInput
                  value={newForm.address}
                  onChangeText={v => setNewForm(p => ({ ...p, address: v }))}
                  placeholder="ناونیشان"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                  textAlign="right"
                />
                <TextInput
                  value={newForm.ampere}
                  onChangeText={v => setNewForm(p => ({ ...p, ampere: v }))}
                  placeholder="ژمارەی ئەمپێر"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                  textAlign="right"
                />
                <View style={styles.formBtns}>
                  <Pressable onPress={handleAdd} style={[styles.saveBtn, { backgroundColor: color }]}>
                    <Text style={styles.saveBtnText}>پاشەکەوتکردن</Text>
                  </Pressable>
                  <Pressable onPress={() => setShowAdd(false)} style={[styles.cancelBtn, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>هەڵوەشاندن</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}

        {/* Tenant list */}
        {filteredTenants.length === 0 && q.length > 0 && (
          <View style={[styles.emptySearch, { borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptySearchText, { color: colors.mutedForeground }]}>هیچ بەژداربووێک نەدۆزرایەوە</Text>
            <Pressable onPress={() => setSearchQuery("")} style={[styles.clearSearchBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}>
              <Text style={[styles.clearSearchBtnText, { color: colors.primary }]}>سڕینەوەی گەڕان</Text>
            </Pressable>
          </View>
        )}
        {filteredTenants.map((t, idx) => {
          const due = getDue(t), paid = getPaid(t), debt = getDebt(t);
          const isPaid = debt === 0 && paid > 0;
          const isPartial = paid > 0 && debt > 0;
          const isEditing = editingId === t.id;

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
              {isEditing && isManager ? (
                <View>
                  <Text style={[styles.editLabel, { color: colors.mutedForeground }]}>دەستکاریکردن</Text>
                  <TextInput
                    value={String(editForm.name || "")}
                    onChangeText={v => setEditForm(p => ({ ...p, name: v }))}
                    placeholder="ناو"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                    textAlign="right"
                  />
                  <TextInput
                    value={String(editForm.phone || "")}
                    onChangeText={v => setEditForm(p => ({ ...p, phone: v }))}
                    placeholder="موبایل"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="phone-pad"
                    style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                    textAlign="right"
                  />
                  <TextInput
                    value={String(editForm.address || "")}
                    onChangeText={v => setEditForm(p => ({ ...p, address: v }))}
                    placeholder="ناونیشان"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                    textAlign="right"
                  />
                  <TextInput
                    value={String(editForm.ampere || "")}
                    onChangeText={v => setEditForm(p => ({ ...p, ampere: parseInt(v) || 1 }))}
                    placeholder="ئەمپێر"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    style={[styles.input, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                    textAlign="right"
                  />
                  <View style={styles.formBtns}>
                    <Pressable onPress={handleSaveEdit} style={[styles.saveBtn, { backgroundColor: color }]}>
                      <Text style={styles.saveBtnText}>پاشەکەوتکردن</Text>
                    </Pressable>
                    <Pressable onPress={() => setEditingId(null)} style={[styles.cancelBtn, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>هەڵوەشاندن</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  {/* Tenant header */}
                  <View style={styles.tenantHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.tenantIdx, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>#{idx + 1}</Text>
                        <Text style={[styles.tenantName, { color: colors.text }]} numberOfLines={1}>{t.name}</Text>
                      </View>
                      <View style={styles.tenantInfo}>
                        <Ionicons name="call-outline" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.tenantDetail, { color: colors.mutedForeground }]}>{t.phone}</Text>
                      </View>
                      <View style={styles.tenantInfo}>
                        <Ionicons name="location-outline" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.tenantDetail, { color: colors.mutedForeground }]} numberOfLines={1}>{t.address}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "center", gap: 4 }}>
                      <View style={[styles.ampereBadge, { backgroundColor: color + "33", borderColor: color }]}>
                        <Text style={[styles.ampereLabel, { color: colors.mutedForeground }]}>ئەمپێر</Text>
                        <Text style={[styles.ampereValue, { color }]}>{t.ampere}</Text>
                      </View>
                      <View style={styles.actionBtns}>
                        <Pressable
                          onPress={() => { setHistoryTenantId(t.id); setHistoryYear(year); setHistoryPayMonth(null); setHistoryPayInput(""); }}
                          style={[styles.iconBtn, { backgroundColor: "rgba(129,140,248,0.15)", borderColor: "rgba(129,140,248,0.3)" }]}
                        >
                          <Ionicons name="time-outline" size={14} color="#818cf8" />
                        </Pressable>
                        {isManager && (
                          <>
                            <Pressable
                              onPress={() => { setEditingId(t.id); setEditForm({ name: t.name, phone: t.phone, address: t.address, ampere: t.ampere }); setShowAdd(false); }}
                              style={[styles.iconBtn, { backgroundColor: "rgba(56,189,248,0.15)", borderColor: "rgba(56,189,248,0.3)" }]}
                            >
                              <Ionicons name="pencil" size={14} color="#38bdf8" />
                            </Pressable>
                            <Pressable
                              onPress={() => handleDelete(t.id, t.name)}
                              style={[styles.iconBtn, { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }]}
                            >
                              <Ionicons name="trash-outline" size={14} color="#f87171" />
                            </Pressable>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Calculation */}
                  <View style={[styles.calcRow, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.calcText, { color: colors.mutedForeground }]}>
                      {t.ampere} ئەمپێر × {curPrice.toLocaleString()} ={" "}
                      <Text style={{ color: "#fbbf24", fontWeight: "700" }}>{due.toLocaleString()} د.ع</Text>
                    </Text>
                  </View>

                  {/* Payment row */}
                  <View style={styles.paySection}>
                    <View style={[
                      styles.payStatus,
                      {
                        backgroundColor: isPaid ? "#065f4622" : isPartial ? "#d9770622" : "#be185d22",
                        borderColor: (isPaid ? "#065f46" : isPartial ? "#d97706" : "#be185d") + "55",
                      }
                    ]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.payStatusLabel, { color: colors.mutedForeground }]}>وەرگیراو</Text>
                        <Text style={[styles.payStatusValue, { color: "#34d399" }]}>{paid.toLocaleString()} د.ع</Text>
                      </View>
                      {debt > 0 && (
                        <View style={[styles.payStatusDebt, { borderRightColor: colors.border }]}>
                          <Text style={[styles.payStatusLabel, { color: colors.mutedForeground }]}>قەرز</Text>
                          <Text style={[styles.payStatusValue, { color: "#f87171" }]}>{debt.toLocaleString()} د.ع</Text>
                        </View>
                      )}
                      {isPaid && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Ionicons name="checkmark-circle" size={16} color="#34d399" />
                          <Text style={[styles.payStatusValue, { color: "#34d399" }]}>تەواو</Text>
                        </View>
                      )}
                    </View>

                    {editingPayId === t.id ? (
                      <View style={styles.payRow}>
                        <TextInput
                          value={payInput}
                          onChangeText={setPayInput}
                          placeholder={`${due.toLocaleString()}`}
                          placeholderTextColor={colors.mutedForeground}
                          keyboardType="numeric"
                          style={[styles.payInput, { backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                          textAlign="right"
                          autoFocus
                        />
                        <Pressable onPress={() => handlePay(t.id)} style={[styles.payConfirm, { backgroundColor: color }]}>
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        </Pressable>
                        <Pressable onPress={() => { setEditingPayId(null); setPayInput(""); }} style={[styles.payCancel, { backgroundColor: colors.muted }]}>
                          <Ionicons name="close" size={18} color={colors.mutedForeground} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => { setEditingPayId(t.id); setPayInput(String(paid || "")); }}
                        style={[styles.payBtn, { backgroundColor: color + "33", borderColor: color }]}
                      >
                        <Ionicons name="card-outline" size={14} color="#fff" style={{ marginLeft: 4 }} />
                        <Text style={styles.payBtnText}>پارەدان</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ─── Payment History Modal ─── */}
      <Modal
        visible={historyTenantId !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setHistoryTenantId(null); setHistoryPayMonth(null); }}
      >
        {historyTenant && (
          <View style={[styles.histModal, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.histHeader, { backgroundColor: colors.secondary, borderBottomColor: "#818cf844" }]}>
              <Pressable onPress={() => { setHistoryTenantId(null); setHistoryPayMonth(null); }} style={styles.histCloseBtn}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
              <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 8 }}>
                <Text style={[styles.histTitle, { color: colors.text }]} numberOfLines={1}>{historyTenant.name}</Text>
                <Text style={[styles.histSubtitle, { color: colors.mutedForeground }]}>
                  {historyTenant.ampere} ئەمپێر  •  {historyTenant.phone}
                </Text>
              </View>
              <View style={styles.histYearNav}>
                <Pressable onPress={() => setHistoryYear(y => Math.max(y - 1, 2025))} style={styles.yearNavBtn}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                </Pressable>
                <Text style={[styles.yearNavLabel, { color: colors.primary }]}>{historyYear}</Text>
                <Pressable onPress={() => setHistoryYear(y => Math.min(y + 1, 2030))} style={styles.yearNavBtn}>
                  <Ionicons name="chevron-forward" size={18} color={colors.primary} />
                </Pressable>
              </View>
            </View>

            {/* Year summary */}
            <View style={[styles.histSummary, { borderBottomColor: colors.border }]}>
              {[
                { label: "کۆی بڕی پارەی ساڵ", value: histYearDue,  color: colors.primary },
                { label: "کۆی وەرگیراو",       value: histYearPaid, color: "#34d399" },
                { label: "کۆی قەرز",           value: histYearDebt, color: "#f87171" },
              ].map(s => (
                <View key={s.label} style={[styles.histStat, { backgroundColor: colors.card, borderColor: s.color + "33" }]}>
                  <Text style={[styles.histStatLabel, { color: colors.mutedForeground }]} numberOfLines={2}>{s.label}</Text>
                  <Text style={[styles.histStatValue, { color: s.color }]}>{s.value.toLocaleString()}</Text>
                  <Text style={[styles.histStatUnit, { color: colors.mutedForeground }]}>د.ع</Text>
                </View>
              ))}
            </View>

            {/* 12-month breakdown */}
            <ScrollView
              contentContainerStyle={{ padding: 14, paddingBottom: insets.bottom + 20 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {MONTHS.map((mname, mi) => {
                const due = hDue(mi), paid = hPaid(mi), debt = hDebt(mi);
                const isPaid = debt === 0 && paid > 0;
                const isPartial = paid > 0 && debt > 0;
                const isEditing = historyPayMonth === mi;
                return (
                  <View
                    key={mi}
                    style={[
                      styles.histRow,
                      { backgroundColor: colors.card, borderColor: isPaid ? "#065f4633" : isPartial ? "#d9770633" : colors.border }
                    ]}
                  >
                    {/* Top row */}
                    <View style={styles.histRowTop}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: isPaid ? "#34d399" : isPartial ? "#d97706" : "#334155" }
                      ]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.histMonthName, { color: colors.text }]}>{mname}</Text>
                        <Text style={[styles.histCalcText, { color: colors.mutedForeground }]}>
                          {historyTenant.ampere} × {hPrice(mi).toLocaleString()} ={" "}
                          <Text style={{ color: "#fbbf24" }}>{due.toLocaleString()} د.ع</Text>
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 2 }}>
                        <Text style={[styles.histPaidAmt, { color: "#34d399" }]}>{paid.toLocaleString()} د.ع</Text>
                        {debt > 0 && (
                          <View style={[styles.histDebtBadge, { backgroundColor: "#f8717122", borderColor: "#f8717155" }]}>
                            <Text style={styles.histDebtText}>قەرز: {debt.toLocaleString()}</Text>
                          </View>
                        )}
                        {isPaid && <Ionicons name="checkmark-circle" size={15} color="#34d399" />}
                      </View>
                    </View>

                    {/* Pay row */}
                    {isEditing ? (
                      <View style={[styles.histPayRow, { marginTop: 8 }]}>
                        <TextInput
                          value={historyPayInput}
                          onChangeText={setHistoryPayInput}
                          placeholder={`${due.toLocaleString()}`}
                          placeholderTextColor={colors.mutedForeground}
                          keyboardType="numeric"
                          style={[styles.payInput, { flex: 1, backgroundColor: colors.secondary, borderColor: colors.border, color: colors.text }]}
                          textAlign="right"
                          autoFocus
                        />
                        <Pressable onPress={() => handleHistoryPay(historyTenant!.id)} style={[styles.payConfirm, { backgroundColor: color }]}>
                          <Ionicons name="checkmark" size={18} color="#fff" />
                        </Pressable>
                        <Pressable onPress={() => { setHistoryPayMonth(null); setHistoryPayInput(""); }} style={[styles.payCancel, { backgroundColor: colors.muted }]}>
                          <Ionicons name="close" size={18} color={colors.mutedForeground} />
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => { setHistoryPayMonth(mi); setHistoryPayInput(String(paid || "")); }}
                        style={[styles.histPayBtn, { backgroundColor: color + "22", borderColor: color + "55" }]}
                      >
                        <Ionicons name="card-outline" size={12} color={color} />
                        <Text style={[styles.histPayBtnText, { color }]}>پارەدان / دەستکاری</Text>
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
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 11, padding: 10, alignItems: "center", borderWidth: 1 },
  statLabel: { fontSize: 9, marginBottom: 2, textAlign: "center" },
  statValue: { fontSize: 13, fontWeight: "900" },
  statUnit: { fontSize: 9 },
  priceBox: { borderRadius: 11, padding: 10, marginBottom: 10, borderWidth: 1 },
  priceTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  priceLabel: { fontSize: 11 },
  priceValue: { fontSize: 14, fontWeight: "900" },
  priceRow: { flexDirection: "row", gap: 8 },
  smallInput: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 13, fontFamily: "Amiri_400Regular",
  },
  smallBtn: {
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7,
    justifyContent: "center", alignItems: "center",
  },
  smallBtnText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Amiri_700Bold" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    paddingVertical: 10,
    marginBottom: 10,
  },
  addBtnText: { fontSize: 14, fontWeight: "700", fontFamily: "Amiri_700Bold" },
  formCard: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 10 },
  input: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, marginBottom: 8, fontFamily: "Amiri_400Regular",
  },
  formBtns: { flexDirection: "row", gap: 8, marginTop: 4 },
  saveBtn: { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: "Amiri_700Bold" },
  cancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  cancelBtnText: { fontWeight: "700", fontSize: 14, fontFamily: "Amiri_700Bold" },
  editLabel: { fontSize: 11, fontWeight: "700", marginBottom: 8, textAlign: "right" },
  tenantCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  tenantHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3, justifyContent: "flex-end" },
  tenantIdx: { fontSize: 10, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  tenantName: { fontSize: 14, fontWeight: "900", textAlign: "right", fontFamily: "Amiri_700Bold" },
  tenantInfo: { flexDirection: "row", alignItems: "center", gap: 4, justifyContent: "flex-end", marginBottom: 2 },
  tenantDetail: { fontSize: 10, textAlign: "right" },
  ampereBadge: { borderRadius: 8, padding: 6, alignItems: "center", borderWidth: 2, minWidth: 52 },
  ampereLabel: { fontSize: 8 },
  ampereValue: { fontSize: 18, fontWeight: "900" },
  actionBtns: { flexDirection: "row", gap: 4 },
  iconBtn: { borderRadius: 6, borderWidth: 1, padding: 6 },
  calcRow: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 8 },
  calcText: { fontSize: 11, textAlign: "right", fontFamily: "Amiri_400Regular" },
  paySection: { gap: 8 },
  payStatus: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 8,
  },
  payStatusLabel: { fontSize: 8 },
  payStatusValue: { fontSize: 12, fontWeight: "900" },
  payStatusDebt: { flex: 1, borderRightWidth: 1, paddingRight: 8 },
  payRow: { flexDirection: "row", gap: 6 },
  payInput: {
    flex: 1, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 13, fontFamily: "Amiri_400Regular",
  },
  payConfirm: { borderRadius: 8, padding: 10, justifyContent: "center", alignItems: "center" },
  payCancel: { borderRadius: 8, padding: 10, justifyContent: "center", alignItems: "center" },
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 9,
    gap: 4,
  },
  payBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "Amiri_700Bold" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchIcon: { marginRight: 6 },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13,
    fontFamily: "Amiri_400Regular",
  },
  searchClear: { paddingLeft: 6 },
  resultBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  resultText: { fontSize: 12, fontWeight: "700", fontFamily: "Amiri_700Bold" },
  resultSub: { fontSize: 11 },
  emptySearch: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    gap: 12,
    marginBottom: 10,
  },
  emptySearchText: { fontSize: 14, fontFamily: "Amiri_400Regular", textAlign: "center" },
  clearSearchBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearSearchBtnText: { fontSize: 13, fontWeight: "700", fontFamily: "Amiri_700Bold" },
  // History modal
  histModal: { flex: 1 },
  histHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    paddingTop: 20,
    borderBottomWidth: 2,
  },
  histCloseBtn: { padding: 4 },
  histTitle: { fontSize: 15, fontWeight: "900", fontFamily: "Amiri_700Bold", textAlign: "center" },
  histSubtitle: { fontSize: 11, textAlign: "center", marginTop: 2 },
  histYearNav: { flexDirection: "row", alignItems: "center", gap: 2 },
  yearNavBtn: { padding: 4 },
  yearNavLabel: { fontSize: 14, fontWeight: "900", minWidth: 36, textAlign: "center" },
  histSummary: {
    flexDirection: "row",
    gap: 6,
    padding: 12,
    borderBottomWidth: 1,
  },
  histStat: {
    flex: 1,
    borderRadius: 10,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  histStatLabel: { fontSize: 8, textAlign: "center", marginBottom: 2, lineHeight: 11 },
  histStatValue: { fontSize: 12, fontWeight: "900" },
  histStatUnit: { fontSize: 8 },
  histRow: {
    borderRadius: 11,
    borderWidth: 1,
    padding: 11,
    marginBottom: 8,
  },
  histRowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    flexShrink: 0,
  },
  histMonthName: { fontSize: 13, fontWeight: "900", fontFamily: "Amiri_700Bold", textAlign: "right" },
  histCalcText: { fontSize: 10, textAlign: "right" },
  histPaidAmt: { fontSize: 13, fontWeight: "900" },
  histDebtBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  histDebtText: { color: "#f87171", fontSize: 9, fontWeight: "700" },
  histPayRow: { flexDirection: "row", gap: 6 },
  histPayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 7,
    gap: 4,
    marginTop: 8,
  },
  histPayBtnText: { fontSize: 11, fontWeight: "700", fontFamily: "Amiri_700Bold" },
});
