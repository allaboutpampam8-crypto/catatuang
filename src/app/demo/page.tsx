"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Receipt,
  Target,
  CreditCard,
  Tags,
  Calendar,
  RotateCcw,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Info,
} from "lucide-react";
import { MONTH_NAMES, formatRupiah, formatDateIndo } from "@/lib/formatters";
import { SummaryCards } from "@/components/SummaryCards";
import { ChartsView } from "@/components/ChartsView";
import { BudgetSection } from "@/components/BudgetSection";
import { TransactionsTable } from "@/components/TransactionsTable";
import { AccountsView } from "@/components/AccountsView";
import { CategoriesView } from "@/components/CategoriesView";
import { TransactionModal } from "@/components/TransactionModal";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { setupDemoFetchInterceptor } from "@/lib/demoInterceptor";
import { resetDemoStore } from "@/lib/demoStore";

export default function DemoPage() {
  // Activate interceptor to route all /api/ calls into LocalStorage
  useEffect(() => {
    const cleanup = setupDemoFetchInterceptor();
    return () => cleanup();
  }, []);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "transactions" | "budget" | "accounts" | "categories"
  >("dashboard");

  const [summaryData, setSummaryData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<"income" | "expense">("expense");
  const [editingTransaction, setEditingTransaction] = useState<any | null>(null);

  // Fetch summary & transactions from intercepted mock /api/
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, txRes, catRes, accRes] = await Promise.all([
        fetch(`/api/summary?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`/api/transactions?month=${selectedMonth}&year=${selectedYear}`),
        fetch(`/api/categories`),
        fetch(`/api/accounts`),
      ]);

      if (sumRes.ok) {
        const sum = await sumRes.json();
        setSummaryData(sum);
      }
      if (txRes.ok) {
        const tx = await txRes.json();
        setTransactions(tx.transactions || []);
      }
      if (catRes.ok) {
        const cat = await catRes.json();
        setCategories(cat.categories || []);
      }
      if (accRes.ok) {
        const acc = await accRes.json();
        setAccounts(acc.accounts || []);
      }
    } catch (err) {
      console.error("Gagal memuat data demo:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset Demo handler
  const handleResetDemo = () => {
    if (confirm("Reset seluruh data demo ke kondisi awal (sample data)?")) {
      resetDemoStore();
      fetchData();
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const cur = new Date();
    setSelectedMonth(cur.getMonth() + 1);
    setSelectedYear(cur.getFullYear());
  };

  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const totalAccountBalance = accounts.reduce(
    (acc, cur) => acc + (cur.currentBalance || 0),
    0
  );

  const openAddTransaction = (type: "expense" | "income" = "expense") => {
    setEditingTransaction(null);
    setModalDefaultType(type);
    setIsModalOpen(true);
  };

  // Savings rate
  const savingsRate =
    summaryData?.summary?.totalIncome > 0
      ? Math.max(
          0,
          Math.round(
            (summaryData.summary.netSavings / summaryData.summary.totalIncome) * 100
          )
        )
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8">
      {/* Top Navbar with iPhone Safe Area Inset Support */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 pt-1 sm:pt-0">
          {/* Logo & Brand with Demo Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <img
              src="/icon-192.png"
              alt="CatatUang Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-sm shrink-0 rounded-lg"
            />
            <span className="font-black text-sm sm:text-lg tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              CatatUang
            </span>
            <span className="px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
              Demo
            </span>
          </div>

          {/* Month / Period Picker */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-100 dark:bg-neutral-800/90 p-0.5 sm:p-1 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 sm:p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="px-1 sm:px-2.5 text-center min-w-[70px] sm:min-w-[110px]">
              <span className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-neutral-100 tracking-tight whitespace-nowrap">
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 sm:p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {!isCurrentMonth && (
              <button
                type="button"
                onClick={handleResetToCurrentMonth}
                title="Kembali ke bulan sekarang"
                className="hidden sm:flex items-center p-1 sm:p-1.5 text-neutral-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDemo}
              title="Reset data demo ke kondisi awal"
              className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            <ThemeToggle />

            {/* Desktop Add Transaction Button */}
            <button
              type="button"
              onClick={() => openAddTransaction("expense")}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-purple-500/20 hover:shadow-purple-500/30 transition-all cursor-pointer ml-1"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-100 dark:border-neutral-800/80 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1.5 py-2">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "transactions"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Riwayat Transaksi
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "transactions"
                    ? "bg-purple-800 text-white"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {transactions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("budget")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "budget"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Anggaran Bulanan
              {summaryData?.budgetStatus?.length > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === "budget"
                      ? "bg-purple-800 text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {summaryData.budgetStatus.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "accounts"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Dompet & Rekening ({accounts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "categories"
                  ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Tags className="w-3.5 h-3.5" />
              Kategori ({categories.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10 border-b border-purple-200/50 dark:border-purple-900/40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
            <Info className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
            <span>
              <strong>Mode Sandbox Demo:</strong> Data disimpan di browser lokal (LocalStorage) Anda & 100% terpisah dari database pribadi. Bebas mencoba seluruh fitur.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetDemo}
              className="font-bold underline text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 cursor-pointer"
            >
              Reset Data Contoh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {loading && !summaryData ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-bold text-neutral-500 tracking-wide uppercase">
              Memuat data demo...
            </p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                {/* Financial Health Banner with Quick Action buttons */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-lg shadow-purple-500/15 text-white flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-tight">
                        Status Finansial Demo Bulan Ini
                      </h2>
                      <p className="text-xs text-purple-100 mt-0.5 leading-snug">
                        {summaryData?.summary?.netSavings >= 0
                          ? `Arus kas positif! Menghemat ${savingsRate}% dari total pemasukan.`
                          : "Pengeluaran melebihi pemasukan. Evaluasi kategori terbesar di bawah."}
                      </p>
                    </div>
                  </div>

                  {/* Quick-add buttons on mobile / desktop */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAddTransaction("income")}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                      + Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => openAddTransaction("expense")}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-white text-red-700 hover:bg-red-50 active:scale-95 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                      + Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                {summaryData && (
                  <SummaryCards
                    summary={summaryData.summary}
                    totalAccountBalance={totalAccountBalance}
                  />
                )}

                {/* Charts */}
                {summaryData && (
                  <ChartsView
                    expenseByCategory={summaryData.expenseByCategory || []}
                    incomeByCategory={summaryData.incomeByCategory || []}
                    dailyTrend={summaryData.dailyTrend || []}
                  />
                )}

                {/* Monthly Budget Progress Section */}
                {summaryData && (
                  <BudgetSection
                    budgets={summaryData.budgetStatus || []}
                    categories={categories}
                    currentMonth={selectedMonth}
                    currentYear={selectedYear}
                    onRefresh={fetchData}
                  />
                )}

                {/* Recent Transactions Snippet */}
                <div className="p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                        Transaksi Terbaru
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        {transactions.length} transaksi pada {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("transactions")}
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="py-12 text-center text-neutral-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">Belum ada transaksi di bulan ini.</p>
                      <button
                        type="button"
                        onClick={() => openAddTransaction("expense")}
                        className="mt-3 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        + Tambah Transaksi Pertama
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {transactions.slice(0, 5).map((tx) => {
                        const isIncome = tx.type === "income";
                        return (
                          <div
                            key={tx.id}
                            className="py-3 flex items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 px-2 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                                style={{
                                  backgroundColor:
                                    tx.category?.color || (isIncome ? "#10b981" : "#ef4444"),
                                }}
                              >
                                <CategoryIcon name={tx.category?.icon} className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                                  {tx.notes || tx.category?.name || "Transaksi"}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-neutral-400">
                                  <span>{formatDateIndo(tx.date)}</span>
                                  <span>•</span>
                                  <span>{tx.account?.name || "Tunai"}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0 pl-2">
                              <span
                                className={`text-xs font-black tracking-tight inline-flex items-center ${
                                  isIncome
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {isIncome ? "+" : "-"}
                                {formatRupiah(tx.amount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. TRANSACTIONS VIEW */}
            {activeTab === "transactions" && (
              <div className="animate-in fade-in duration-200">
                <TransactionsTable
                  transactions={transactions}
                  categories={categories}
                  accounts={accounts}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  onEdit={(tx) => {
                    setEditingTransaction(tx);
                    setIsModalOpen(true);
                  }}
                  onDeleteSuccess={fetchData}
                />
              </div>
            )}

            {/* 3. BUDGETING VIEW */}
            {activeTab === "budget" && summaryData && (
              <div className="animate-in fade-in duration-200">
                <BudgetSection
                  budgets={summaryData.budgetStatus || []}
                  categories={categories}
                  currentMonth={selectedMonth}
                  currentYear={selectedYear}
                  onRefresh={fetchData}
                />
              </div>
            )}

            {/* 4. ACCOUNTS VIEW */}
            {activeTab === "accounts" && (
              <div className="animate-in fade-in duration-200">
                <AccountsView accounts={accounts} onRefresh={fetchData} />
              </div>
            )}

            {/* 5. CATEGORIES VIEW */}
            {activeTab === "categories" && (
              <div className="animate-in fade-in duration-200">
                <CategoriesView categories={categories} onRefresh={fetchData} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modern Ergonomic Bottom Navigation Bar for Mobile (< md) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200/90 dark:border-neutral-800 md:hidden pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "text-purple-600 dark:text-purple-400"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </button>

          {/* 2. Transaksi */}
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer relative ${
              activeTab === "transactions"
                ? "text-purple-600 dark:text-purple-400"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span>Transaksi</span>
            {transactions.length > 0 && (
              <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-purple-500" />
            )}
          </button>

          {/* 3. Floating Quick Add Action in Center */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => openAddTransaction("expense")}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/35 active:scale-90 transition-transform cursor-pointer -mt-5"
              aria-label="Tambah Transaksi Cepat"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* 4. Anggaran */}
          <button
            type="button"
            onClick={() => setActiveTab("budget")}
            className={`flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "budget"
                ? "text-purple-600 dark:text-purple-400"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span>Anggaran</span>
          </button>

          {/* 5. Dompet */}
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "accounts" || activeTab === "categories"
                ? "text-purple-600 dark:text-purple-400"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span>Dompet</span>
          </button>
        </div>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={fetchData}
        categories={categories}
        accounts={accounts}
        initialData={editingTransaction}
        defaultType={modalDefaultType}
      />
    </div>
  );
}
