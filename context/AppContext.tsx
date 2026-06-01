import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ADMIN_SECTIONS, DEFAULT_TENANTS, MONTHS, PaymentMap, PriceMap, Tenant, TenantMap } from "@/constants/data";

type ToastState = { msg: string; type: "success" | "error" } | null;

type AppContextType = {
  isLoggedIn: boolean;
  currentUser: string;
  userRole: string;
  adminKey: string;
  isManager: boolean;
  activeSection: string;
  year: number;
  month: number;
  tenants: TenantMap;
  payments: PaymentMap;
  prices: PriceMap;
  toast: ToastState;
  setActiveSection: (s: string) => void;
  setYear: (y: number) => void;
  setMonth: (m: number) => void;
  login: (u: string, role: string, ak?: string) => void;
  logout: () => void;
  addTenant: (ak: string, t: Tenant) => void;
  editTenant: (ak: string, id: number, data: Partial<Tenant>) => void;
  deleteTenant: (ak: string, id: number) => void;
  setPayment: (tid: number, yr: number, mo: number, val: number) => void;
  setPrice: (ak: string, yr: number, mo: number, val: number) => void;
  getPrice: (ak: string, yr: number, mo: number) => number;
  getPayment: (tid: number, yr: number, mo: number) => { paid: number };
  getSectionPaid: (ak: string, yr: number, mo: number) => number;
  getSectionDebt: (ak: string, yr: number, mo: number) => number;
  clearToast: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [activeSection, setActiveSection] = useState("admin1");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(0);
  const [tenants, setTenants] = useState<TenantMap>(DEFAULT_TENANTS);
  const [payments, setPayments] = useState<PaymentMap>({});
  const [prices, setPrices] = useState<PriceMap>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [hydrated, setHydrated] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [t, p, pr] = await Promise.all([
          AsyncStorage.getItem("ml2_tenants"),
          AsyncStorage.getItem("ml2_payments"),
          AsyncStorage.getItem("ml2_prices"),
        ]);
        if (t) setTenants(JSON.parse(t));
        if (p) setPayments(JSON.parse(p));
        if (pr) setPrices(JSON.parse(pr));
      } catch {}
      setHydrated(true);
    })();
  }, []);

  useEffect(() => { if (hydrated) AsyncStorage.setItem("ml2_tenants", JSON.stringify(tenants)).catch(() => {}); }, [tenants, hydrated]);
  useEffect(() => { if (hydrated) AsyncStorage.setItem("ml2_payments", JSON.stringify(payments)).catch(() => {}); }, [payments, hydrated]);
  useEffect(() => { if (hydrated) AsyncStorage.setItem("ml2_prices", JSON.stringify(prices)).catch(() => {}); }, [prices, hydrated]);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const login = useCallback((u: string, role: string, ak?: string) => {
    setIsLoggedIn(true);
    setCurrentUser(u);
    setUserRole(role);
    if (role === "admin" && ak) { setAdminKey(ak); setActiveSection(ak); }
    else { setAdminKey(""); setActiveSection("admin1"); }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setCurrentUser("");
    setUserRole("");
    setAdminKey("");
  }, []);

  const addTenant = useCallback((ak: string, t: Tenant) => {
    setTenants(p => ({ ...p, [ak]: [...(p[ak] || []), t] }));
    showToast("بەژداربوو زیادکرا ✓");
  }, [showToast]);

  const editTenant = useCallback((ak: string, id: number, data: Partial<Tenant>) => {
    setTenants(p => ({ ...p, [ak]: p[ak].map(t => t.id === id ? { ...t, ...data } : t) }));
    showToast("نوێکرایەوە ✓");
  }, [showToast]);

  const deleteTenant = useCallback((ak: string, id: number) => {
    setTenants(p => ({ ...p, [ak]: p[ak].filter(t => t.id !== id) }));
    showToast("سڕایەوە", "error");
  }, [showToast]);

  const setPayment = useCallback((tid: number, yr: number, mo: number, val: number) => {
    setPayments(p => ({ ...p, [`${tid}-${yr}-${mo}`]: { paid: val } }));
    showToast("پارەکە تۆمارکرا ✓");
  }, [showToast]);

  const setPrice = useCallback((ak: string, yr: number, mo: number, val: number) => {
    setPrices(p => ({ ...p, [`${yr}-${mo}`]: { ...(p[`${yr}-${mo}`] || {}), [ak]: val } }));
    showToast("نرخەکە نوێکرایەوە ✓");
  }, [showToast]);

  const getPrice = useCallback((ak: string, yr: number, mo: number) =>
    prices[`${yr}-${mo}`]?.[ak] || 5000, [prices]);

  const getPayment = useCallback((tid: number, yr: number, mo: number) =>
    payments[`${tid}-${yr}-${mo}`] || { paid: 0 }, [payments]);

  const getSectionPaid = useCallback((ak: string, yr: number, mo: number) =>
    (tenants[ak] || []).reduce((s, t) => s + (payments[`${t.id}-${yr}-${mo}`]?.paid || 0), 0),
    [tenants, payments]);

  const getSectionDebt = useCallback((ak: string, yr: number, mo: number) =>
    (tenants[ak] || []).reduce((s, t) => {
      const price = prices[`${yr}-${mo}`]?.[ak] || 5000;
      return s + Math.max(0, t.ampere * price - (payments[`${t.id}-${yr}-${mo}`]?.paid || 0));
    }, 0), [tenants, prices, payments]);

  const isManager = userRole === "manager";

  return (
    <AppContext.Provider value={{
      isLoggedIn, currentUser, userRole, adminKey, isManager,
      activeSection, setActiveSection, year, setYear, month, setMonth,
      tenants, payments, prices, toast, clearToast,
      login, logout, addTenant, editTenant, deleteTenant,
      setPayment, setPrice, getPrice, getPayment,
      getSectionPaid, getSectionDebt,
    }}>
      {children}
    </AppContext.Provider>
  );
}
