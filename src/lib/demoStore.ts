// LocalStorage Sandbox Database for CatatUang Demo

export interface DemoAccount {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface DemoCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  createdAt: string;
}

export interface DemoTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  notes?: string | null;
  accountId?: string | null;
  categoryId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DemoBudget {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoStoreData {
  accounts: DemoAccount[];
  categories: DemoCategory[];
  transactions: DemoTransaction[];
  budgets: DemoBudget[];
}

const DEMO_STORAGE_KEY = "catatuang_demo_sandbox_v1";

export function generateInitialDemoData(): DemoStoreData {
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth(); // 0-indexed

  // Accounts
  const accounts: DemoAccount[] = [
    {
      id: "acc_demo_bca",
      name: "Bank BCA (Operasional)",
      type: "bank",
      initialBalance: 7500000,
      color: "#3b82f6",
      createdAt: new Date(curY, curM - 1, 1).toISOString(),
      updatedAt: new Date(curY, curM - 1, 1).toISOString(),
    },
    {
      id: "acc_demo_gopay",
      name: "GoPay / OVO (E-Wallet)",
      type: "ewallet",
      initialBalance: 650000,
      color: "#06b6d4",
      createdAt: new Date(curY, curM - 1, 1).toISOString(),
      updatedAt: new Date(curY, curM - 1, 1).toISOString(),
    },
    {
      id: "acc_demo_cash",
      name: "Dompet Tunai",
      type: "cash",
      initialBalance: 500000,
      color: "#10b981",
      createdAt: new Date(curY, curM - 1, 1).toISOString(),
      updatedAt: new Date(curY, curM - 1, 1).toISOString(),
    },
    {
      id: "acc_demo_bibit",
      name: "Investasi Bibit / Reksadana",
      type: "bank",
      initialBalance: 15000000,
      color: "#8b5cf6",
      createdAt: new Date(curY, curM - 1, 1).toISOString(),
      updatedAt: new Date(curY, curM - 1, 1).toISOString(),
    },
  ];

  // Categories
  const categories: DemoCategory[] = [
    // Income
    { id: "cat_sal", name: "Gaji Pokok", type: "income", icon: "Briefcase", color: "#10b981", createdAt: now.toISOString() },
    { id: "cat_free", name: "Freelance & Project", type: "income", icon: "Laptop", color: "#06b6d4", createdAt: now.toISOString() },
    { id: "cat_div", name: "Dividen & Investasi", type: "income", icon: "TrendingUp", color: "#8b5cf6", createdAt: now.toISOString() },
    { id: "cat_tin", name: "Transfer Masuk", type: "income", icon: "ArrowRightLeft", color: "#64748b", createdAt: now.toISOString() },
    // Expense
    { id: "cat_food", name: "Makanan & Minuman", type: "expense", icon: "Utensils", color: "#f97316", createdAt: now.toISOString() },
    { id: "cat_trans", name: "Transport & Bensin", type: "expense", icon: "Car", color: "#eab308", createdAt: now.toISOString() },
    { id: "cat_bill", name: "Tagihan & WiFi / PLN", type: "expense", icon: "Zap", color: "#ef4444", createdAt: now.toISOString() },
    { id: "cat_shop", name: "Belanja & Kebutuhan", type: "expense", icon: "ShoppingBag", color: "#ec4899", createdAt: now.toISOString() },
    { id: "cat_ent", name: "Hiburan & Rekreasi", type: "expense", icon: "Gamepad2", color: "#a855f7", createdAt: now.toISOString() },
    { id: "cat_med", name: "Kesehatan & Obat", type: "expense", icon: "HeartPulse", color: "#14b8a6", createdAt: now.toISOString() },
    { id: "cat_tout", name: "Transfer Keluar", type: "expense", icon: "ArrowRightLeft", color: "#64748b", createdAt: now.toISOString() },
  ];

  // Budgets for current month (1-12)
  const budgets: DemoBudget[] = [
    { id: "bg_1", categoryId: "cat_food", month: curM + 1, year: curY, amount: 2500000, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: "bg_2", categoryId: "cat_shop", month: curM + 1, year: curY, amount: 1500000, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: "bg_3", categoryId: "cat_trans", month: curM + 1, year: curY, amount: 800000, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: "bg_4", categoryId: "cat_bill", month: curM + 1, year: curY, amount: 650000, createdAt: now.toISOString(), updatedAt: now.toISOString() },
    { id: "bg_5", categoryId: "cat_ent", month: curM + 1, year: curY, amount: 500000, createdAt: now.toISOString(), updatedAt: now.toISOString() },
  ];

  // Helper date creators
  const d = (day: number, hour = 10) => new Date(curY, curM, Math.min(day, 28), hour, 0).toISOString();
  const dPrev = (day: number, hour = 10) => new Date(curY, curM - 1, Math.min(day, 28), hour, 0).toISOString();

  // Transactions
  const transactions: DemoTransaction[] = [
    // Previous month (for comparison percentages)
    { id: "tx_p1", amount: 9500000, type: "income", date: dPrev(1, 9), notes: "Gaji Bulan Lalu", accountId: "acc_demo_bca", categoryId: "cat_sal", createdAt: dPrev(1), updatedAt: dPrev(1) },
    { id: "tx_p2", amount: 1800000, type: "income", date: dPrev(15, 14), notes: "Side Project UI Design", accountId: "acc_demo_bca", categoryId: "cat_free", createdAt: dPrev(15), updatedAt: dPrev(15) },
    { id: "tx_p3", amount: 2200000, type: "expense", date: dPrev(3, 12), notes: "Makan & Groceries", accountId: "acc_demo_bca", categoryId: "cat_food", createdAt: dPrev(3), updatedAt: dPrev(3) },
    { id: "tx_p4", amount: 600000, type: "expense", date: dPrev(5, 10), notes: "Listrik & Internet", accountId: "acc_demo_bca", categoryId: "cat_bill", createdAt: dPrev(5), updatedAt: dPrev(5) },
    { id: "tx_p5", amount: 750000, type: "expense", date: dPrev(10, 17), notes: "Bensin & Tol", accountId: "acc_demo_cash", categoryId: "cat_trans", createdAt: dPrev(10), updatedAt: dPrev(10) },

    // Current month transactions
    { id: "tx_c1", amount: 9500000, type: "income", date: d(1, 8), notes: "Gaji Bulanan PT Maju Bersama", accountId: "acc_demo_bca", categoryId: "cat_sal", createdAt: d(1), updatedAt: d(1) },
    { id: "tx_c2", amount: 2500000, type: "income", date: d(5, 15), notes: "Freelance Desain Website", accountId: "acc_demo_bca", categoryId: "cat_free", createdAt: d(5), updatedAt: d(5) },
    { id: "tx_c3", amount: 450000, type: "income", date: d(12, 10), notes: "Dividen Reksadana Pasar Uang", accountId: "acc_demo_bibit", categoryId: "cat_div", createdAt: d(12), updatedAt: d(12) },

    { id: "tx_c4", amount: 550000, type: "expense", date: d(2, 9), notes: "Tagihan WiFi Indihome & Listrik", accountId: "acc_demo_bca", categoryId: "cat_bill", createdAt: d(2), updatedAt: d(2) },
    { id: "tx_c5", amount: 125000, type: "expense", date: d(3, 12), notes: "Makan Siang Soto Betawi & Es Teh", accountId: "acc_demo_cash", categoryId: "cat_food", createdAt: d(3), updatedAt: d(3) },
    { id: "tx_c6", amount: 350000, type: "expense", date: d(4, 18), notes: "Isi Bensin Pertamax & Servis", accountId: "acc_demo_cash", categoryId: "cat_trans", createdAt: d(4), updatedAt: d(4) },
    { id: "tx_c7", amount: 620000, type: "expense", date: d(6, 16), notes: "Belanja Bulanan Supermarket", accountId: "acc_demo_bca", categoryId: "cat_shop", createdAt: d(6), updatedAt: d(6) },
    { id: "tx_c8", amount: 150000, type: "expense", date: d(7, 19), notes: "Nonton Bioskop & Popcorn", accountId: "acc_demo_gopay", categoryId: "cat_ent", createdAt: d(7), updatedAt: d(7) },
    { id: "tx_c9", amount: 85000, type: "expense", date: d(8, 13), notes: "Kopi Kenangan & Camilan Sore", accountId: "acc_demo_gopay", categoryId: "cat_food", createdAt: d(8), updatedAt: d(8) },
    { id: "tx_c10", amount: 275000, type: "expense", date: d(10, 11), notes: "Vitamin C & Suplemen Kesehatan", accountId: "acc_demo_bca", categoryId: "cat_med", createdAt: d(10), updatedAt: d(10) },
    { id: "tx_c11", amount: 180000, type: "expense", date: d(13, 20), notes: "Makan Malam Bersama Keluarga", accountId: "acc_demo_bca", categoryId: "cat_food", createdAt: d(13), updatedAt: d(13) },
    { id: "tx_c12", amount: 250000, type: "expense", date: d(15, 14), notes: "Beli Kemeja & Kaos Polos", accountId: "acc_demo_gopay", categoryId: "cat_shop", createdAt: d(15), updatedAt: d(15) },
  ];

  return { accounts, categories, transactions, budgets };
}

export function getDemoStore(): DemoStoreData {
  if (typeof window === "undefined") return generateInitialDemoData();

  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialDemoData();
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.accounts || !parsed.categories || !parsed.transactions || !parsed.budgets) {
      const initial = generateInitialDemoData();
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return parsed;
  } catch {
    const initial = generateInitialDemoData();
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

export function setDemoStore(data: DemoStoreData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
}

export function resetDemoStore(): DemoStoreData {
  const fresh = generateInitialDemoData();
  setDemoStore(fresh);
  return fresh;
}

// Calculations and Handlers matching API route contracts
export function calculateDemoSummary(month: number, year: number) {
  const store = getDemoStore();

  const startDate = new Date(year, month - 1, 1, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const prevMonthDate = new Date(year, month - 2, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth() + 1;
  const prevStartDate = new Date(prevYear, prevMonth - 1, 1, 0, 0, 0);
  const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

  // Current month tx
  const currentTx = store.transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= startDate && d <= endDate;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCategoryMap: Record<string, { name: string; amount: number; color: string; icon: string }> = {};
  const incomeByCategoryMap: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyTrendMap: Record<number, { day: number; income: number; expense: number }> = {};
  for (let i = 1; i <= daysInMonth; i++) {
    dailyTrendMap[i] = { day: i, income: 0, expense: 0 };
  }

  const categoryMap = new Map(store.categories.map((c) => [c.id, c]));

  currentTx.forEach((tx) => {
    const day = new Date(tx.date).getDate();
    const cat = tx.categoryId ? categoryMap.get(tx.categoryId) : null;

    if (tx.type === "income") {
      totalIncome += tx.amount;
      if (dailyTrendMap[day]) dailyTrendMap[day].income += tx.amount;
      if (cat) {
        if (!incomeByCategoryMap[cat.id]) {
          incomeByCategoryMap[cat.id] = {
            name: cat.name,
            amount: 0,
            color: cat.color || "#10b981",
            icon: cat.icon || "Tag",
          };
        }
        incomeByCategoryMap[cat.id].amount += tx.amount;
      }
    } else {
      totalExpense += tx.amount;
      if (dailyTrendMap[day]) dailyTrendMap[day].expense += tx.amount;
      if (cat) {
        if (!expenseByCategoryMap[cat.id]) {
          expenseByCategoryMap[cat.id] = {
            name: cat.name,
            amount: 0,
            color: cat.color || "#ef4444",
            icon: cat.icon || "Tag",
          };
        }
        expenseByCategoryMap[cat.id].amount += tx.amount;
      }
    }
  });

  // Previous month totals
  const prevTx = store.transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d >= prevStartDate && d <= prevEndDate;
  });

  let prevIncome = 0;
  let prevExpense = 0;
  prevTx.forEach((tx) => {
    if (tx.type === "income") prevIncome += tx.amount;
    else prevExpense += tx.amount;
  });

  // Budgets
  const budgets = store.budgets.filter((b) => b.month === month && b.year === year);
  const budgetStatus = budgets.map((b) => {
    const cat = categoryMap.get(b.categoryId);
    const spent = expenseByCategoryMap[b.categoryId]?.amount || 0;
    const percentage = b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0;
    return {
      id: b.id,
      categoryId: b.categoryId,
      categoryName: cat?.name || "Kategori",
      categoryColor: cat?.color || "#64748b",
      categoryIcon: cat?.icon || "Tag",
      budgetAmount: b.amount,
      spentAmount: spent,
      remainingAmount: b.amount - spent,
      percentage,
      isOverBudget: spent > b.amount,
      overAmount: spent > b.amount ? spent - b.amount : 0,
    };
  });

  // Accounts with balances (all-time)
  const accountBalanceMap: Record<string, number> = {};
  store.accounts.forEach((acc) => {
    accountBalanceMap[acc.id] = acc.initialBalance;
  });

  store.transactions.forEach((tx) => {
    if (tx.accountId && accountBalanceMap[tx.accountId] !== undefined) {
      if (tx.type === "income") {
        accountBalanceMap[tx.accountId] += tx.amount;
      } else {
        accountBalanceMap[tx.accountId] -= tx.amount;
      }
    }
  });

  const accountsWithBalance = store.accounts.map((acc) => ({
    ...acc,
    currentBalance: accountBalanceMap[acc.id] ?? acc.initialBalance,
  }));

  return {
    month,
    year,
    summary: {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      prevIncome,
      prevExpense,
      incomeChangePercent:
        prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : null,
      expenseChangePercent:
        prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : null,
    },
    expenseByCategory: Object.values(expenseByCategoryMap).sort((a, b) => b.amount - a.amount),
    incomeByCategory: Object.values(incomeByCategoryMap).sort((a, b) => b.amount - a.amount),
    dailyTrend: Object.values(dailyTrendMap),
    budgetStatus,
    accounts: accountsWithBalance,
  };
}
