export const MONTHS = [
  "کانوونی دووەم","شوبات","ئازار","نیسان","ئایار","حوزەیران",
  "تەممووز","ئاب","ئەیلوول","تشرینی یەکەم","تشرینی دووەم","کانوونی یەکەم"
];

export const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export const USERS: Record<string, { pass: string; role: string; label: string; adminKey?: string }> = {
  Shaxawan: { pass: "6Shaxawan9", role: "manager", label: "شاخەوان (مودیر)" },
  admin1:   { pass: "151671",    role: "admin",   label: "ئادمین ١", adminKey: "admin1" },
  admin2:   { pass: "512311",    role: "admin",   label: "ئادمین ٢", adminKey: "admin2" },
  admin3:   { pass: "981231",    role: "admin",   label: "ئادمین ٣", adminKey: "admin3" },
};

export const ADMIN_SECTIONS: Record<string, { label: string; color: string }> = {
  admin1: { label: "ئادمین ١", color: "#0f766e" },
  admin2: { label: "ئادمین ٢", color: "#1d4ed8" },
  admin3: { label: "ئادمین ٣", color: "#7c3aed" },
};

export type Tenant = { id: number; name: string; phone: string; address: string; ampere: number };
export type TenantMap = Record<string, Tenant[]>;
export type PaymentMap = Record<string, { paid: number }>;
export type PriceMap = Record<string, Record<string, number>>;

export const DEFAULT_TENANTS: TenantMap = {
  admin1: [
    { id: 1, name: "ئەحمەد کەریم",   phone: "0750-111-2233", address: "کۆڵانی ١، خانوو ٥",  ampere: 3 },
    { id: 2, name: "سامی عەلی",       phone: "0770-222-3344", address: "کۆڵانی ١، خانوو ١٢", ampere: 5 },
    { id: 3, name: "فاروق حەسەن",     phone: "0780-333-4455", address: "کۆڵانی ٢، خانوو ٣",  ampere: 2 },
  ],
  admin2: [
    { id: 101, name: "زانا محمد",     phone: "0750-666-7788", address: "کۆڵانی A، خانوو ٢",  ampere: 5 },
    { id: 102, name: "شێرکۆ جەلال",   phone: "0780-777-8899", address: "کۆڵانی A، خانوو ٩",  ampere: 3 },
    { id: 103, name: "هێرۆ ئیبراهیم", phone: "0750-888-9900", address: "کۆڵانی B، خانوو ٤",  ampere: 2 },
  ],
  admin3: [
    { id: 201, name: "لاوەنج ئازاد",  phone: "0750-101-2020", address: "شەقامی ١، ژمارە ٣",  ampere: 4 },
    { id: 202, name: "دلنیا ئەحمەد",  phone: "0770-202-3030", address: "شەقامی ٢، ژمارە ٦",  ampere: 3 },
    { id: 203, name: "ئارام کەریم",    phone: "0780-303-4040", address: "شەقامی ٣، ژمارە ١١", ampere: 5 },
  ],
};
