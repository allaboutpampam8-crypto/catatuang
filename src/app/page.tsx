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

export default function Home() {
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

  // Fetch summary & transactions for selected month/year
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
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CatatUang
              </span>
            </div>
          </div>

          {/* Month / Period Picker: Compact for mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-neutral-100 dark:bg-neutral-800/90 p-0.5 sm:p-1 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 sm:p-1.5 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl transition-all cursor-pointer"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="flex items-center gap-1 px-1.5 sm:px-2.5 text-[11px] sm:text-xs font-bold text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
              <Calendar className="w-3 h-3 text-blue-500 shrink-0 hidden xs:inline" />
              <span>
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
                title="Kembali ke Bulan Berjalan"
                className="p-1 sm:p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {/* Right Actions: Theme Toggle & Desktop Add Button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

            {/* Hidden on mobile, shown on desktop (mobile uses bottom floating action button) */}
            <button
              type="button"
              onClick={() => openAddTransaction("expense")}
              className="hidden md:flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-xl shadow-md shadow-blue-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation (Hidden on mobile; mobile uses Bottom Navigation Bar) */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-100 dark:border-neutral-800/80 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1.5 py-2">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
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
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Riwayat Transaksi
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === "transactions"
                    ? "bg-blue-800 text-white"
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
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              Anggaran Bulanan
              {summaryData?.budgetStatus?.length > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === "budget"
                      ? "bg-blue-800 text-white"
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
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
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
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
              }`}
            >
              <Tags className="w-3.5 h-3.5" />
              Kategori ({categories.length})
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {loading && !summaryData ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs font-bold text-neutral-500 tracking-wide uppercase">
              Memuat data keuangan...
            </p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
                {/* Financial Health Banner with Quick Action buttons */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl shadow-lg shadow-indigo-500/15 text-white flex flex-col md:flex-row md:items-center justify-between gap-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-tight">
                        Status Finansial Bulan Ini
                      </h2>
                      <p className="text-xs text-blue-100 mt-0.5 leading-snug">
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
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Semua
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400">
                      <p className="text-xs font-medium">Belum ada transaksi di bulan ini.</p>
                      <button
                        type="button"
                        onClick={() => openAddTransaction("expense")}
                        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 rounded-xl cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Catat Sekarang
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      {transactions.slice(0, 5).map((tx) => {
                        const isIncome = tx.type === "income";
                        return (
                          <div
                            key={tx.id}
                            className="py-3 flex items-center justify-between hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 px-1.5 rounded-2xl transition-colors cursor-pointer"
                            onClick={() => {
                              setEditingTransaction(tx);
                              setIsModalOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="p-2 rounded-xl text-white shrink-0 shadow-2xs"
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
                ? "text-blue-600 dark:text-blue-400"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </button>

          {/* 2. Transaksi */}
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className={`flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer relative ${
              activeTab === "transactions"
                ? "text-blue-600 dark:text-blue-400"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span>Transaksi</span>
            {transactions.length > 0 && (
              <span className="absolute top-2 right-4 w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>

          {/* 3. Center Floating Action Button (+ Catat) */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => openAddTransaction("expense")}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 active:scale-90 transition-transform -mt-5 cursor-pointer"
              aria-label="Catat transaksi baru"
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
                ? "text-blue-600 dark:text-blue-400"
                : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span>Anggaran</span>
          </button>

          {/* 5. Dompet / Menu */}
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`flex flex-col items-center justify-center h-full py-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === "accounts" || activeTab === "categories"
                ? "text-blue-600 dark:text-blue-400"
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
