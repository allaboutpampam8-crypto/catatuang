import React from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, TrendingUp, TrendingDown, Percent } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";

interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  prevIncome?: number;
  prevExpense?: number;
  incomeChangePercent?: number | null;
  expenseChangePercent?: number | null;
}

interface SummaryCardsProps {
  summary: SummaryData;
  totalAccountBalance: number;
}

export function SummaryCards({ summary, totalAccountBalance }: SummaryCardsProps) {
  const isNetPositive = summary.netSavings >= 0;
  const savingsRate =
    summary.totalIncome > 0
      ? Math.max(0, Math.round((summary.netSavings / summary.totalIncome) * 100))
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pemasukan */}
      <div className="relative p-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        
        <div className="flex items-center justify-between relative">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Total Pemasukan
          </span>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform shadow-xs">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 relative">
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {formatRupiah(summary.totalIncome)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-neutral-500">
            {summary.incomeChangePercent !== null && summary.incomeChangePercent !== undefined ? (
              summary.incomeChangePercent >= 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <TrendingUp className="w-3 h-3 mr-1 inline" />+{summary.incomeChangePercent}%
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  <TrendingDown className="w-3 h-3 mr-1 inline" />{summary.incomeChangePercent}%
                </span>
              )
            ) : (
              <span className="text-neutral-400 text-[11px]">Bulan pertama tercatat</span>
            )}
            <span className="text-[11px]">vs bulan lalu</span>
          </div>
        </div>
      </div>

      {/* 2. Total Pengeluaran */}
      <div className="relative p-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        
        <div className="flex items-center justify-between relative">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Total Pengeluaran
          </span>
          <div className="p-2.5 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-2xl group-hover:scale-110 transition-transform shadow-xs">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 relative">
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {formatRupiah(summary.totalExpense)}
          </h3>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-neutral-500">
            {summary.expenseChangePercent !== null && summary.expenseChangePercent !== undefined ? (
              summary.expenseChangePercent > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  <TrendingUp className="w-3 h-3 mr-1 inline" />+{summary.expenseChangePercent}%
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <TrendingDown className="w-3 h-3 mr-1 inline" />{summary.expenseChangePercent}%
                </span>
              )
            ) : (
              <span className="text-neutral-400 text-[11px]">Bulan pertama tercatat</span>
            )}
            <span className="text-[11px]">vs bulan lalu</span>
          </div>
        </div>
      </div>

      {/* 3. Arus Kas Bersih (Net Savings) */}
      <div className="relative p-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl group-hover:scale-125 transition-transform ${
          isNetPositive ? "bg-blue-500/5 dark:bg-blue-500/10" : "bg-amber-500/5 dark:bg-amber-500/10"
        }`} />
        
        <div className="flex items-center justify-between relative">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Arus Kas Bersih
          </span>
          <div className={`p-2.5 rounded-2xl group-hover:scale-110 transition-transform shadow-xs ${
            isNetPositive
              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
              : "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
          }`}>
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 relative">
          <h3 className={`text-2xl font-black tracking-tight ${
            isNetPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          }`}>
            {formatRupiah(summary.netSavings)}
          </h3>
          <div className="flex items-center gap-2 mt-2.5 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
              isNetPositive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
            }`}>
              {isNetPositive ? "Surplus (Hemat)" : "Defisit"}
            </span>
            {summary.totalIncome > 0 && isNetPositive && (
              <span className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Hemat {savingsRate}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Total Saldo Semua Dompet */}
      <div className="relative p-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs hover:shadow-md transition-all duration-200 group overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        
        <div className="flex items-center justify-between relative">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Total Saldo Dompet
          </span>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3 relative">
          <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {formatRupiah(totalAccountBalance)}
          </h3>
          <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400">
            Akumulasi seluruh akun aktif
          </p>
        </div>
      </div>
    </div>
  );
}
