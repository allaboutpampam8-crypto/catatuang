"use client";

import React, { useState, useEffect } from "react";
import { Target, Plus, AlertTriangle, CheckCircle2, X, Trash2, Edit3, ShieldAlert, Sparkles } from "lucide-react";
import { formatRupiah, MONTH_NAMES } from "@/lib/formatters";
import { CategoryIcon } from "./CategoryIcon";
import { ConfirmModal } from "./ConfirmModal";

interface BudgetStatus {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  isOverBudget: boolean;
  overAmount: number;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface BudgetSectionProps {
  budgets: BudgetStatus[];
  categories: Category[];
  currentMonth: number;
  currentYear: number;
  onRefresh: () => void;
}

export function BudgetSection({
  budgets,
  categories,
  currentMonth,
  currentYear,
  onRefresh,
}: BudgetSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BudgetStatus | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Overall totals
  const totalBudgeted = budgets.reduce((acc, b) => acc + b.budgetAmount, 0);
  const totalSpentInBudget = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalRemaining = totalBudgeted - totalSpentInBudget;
  const overallPercentage =
    totalBudgeted > 0 ? Math.min(Math.round((totalSpentInBudget / totalBudgeted) * 100), 100) : 0;

  // Handle ESC in modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalOpen) return;
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(budgetAmount.replace(/[^0-9]/g, ""));
    if (!selectedCategory) {
      setError("Pilih kategori pengeluaran");
      return;
    }
    if (!amountNum || amountNum <= 0) {
      setError("Masukkan batas anggaran yang valid (> Rp 0)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory,
          month: currentMonth,
          year: currentYear,
          amount: amountNum,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan anggaran");
      }

      setModalOpen(false);
      setSelectedCategory("");
      setBudgetAmount("");
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/budgets?id=${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      } else {
        alert("Gagal menghapus anggaran.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditBudget = (item: BudgetStatus) => {
    setSelectedCategory(item.categoryId);
    setBudgetAmount(String(item.budgetAmount));
    setError(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Banner */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Target Anggaran Bulan {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h3>
              <p className="text-xs text-neutral-500">
                Kontrol limit belanja per kategori agar rencana tabungan tercapai
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              setBudgetAmount("");
              setError(null);
              setModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Atur Batas Anggaran
          </button>
        </div>

        {budgets.length > 0 && (
          <div className="p-5 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Total Anggaran
                </span>
                <p className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                  {formatRupiah(totalBudgeted)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Total Terpakai
                </span>
                <p className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
                  {formatRupiah(totalSpentInBudget)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Sisa Total Anggaran
                </span>
                <p
                  className={`text-xl font-black mt-0.5 ${
                    totalRemaining >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatRupiah(totalRemaining)}
                </p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-neutral-500">
                <span>Pemakaian Keseluruhan Anggaran</span>
                <span>{overallPercentage}%</span>
              </div>
              <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallPercentage >= 100
                      ? "bg-red-500"
                      : overallPercentage >= 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Grid of Category Budgets */}
      {budgets.length === 0 ? (
        <div className="p-12 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs text-center text-neutral-400">
          <Target className="w-12 h-12 mx-auto mb-3 stroke-1 opacity-40 text-indigo-500" />
          <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Belum Ada Anggaran untuk Bulan Ini
          </h4>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1 mb-4">
            Tetapkan batas maksimal pengeluaran bulanan (seperti Makanan, Belanja, atau Hiburan) untuk menjaga arus kas tetap sehat.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("");
              setBudgetAmount("");
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Atur Anggaran Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((item) => {
            const isCritical = item.percentage >= 100;
            const isWarning = item.percentage >= 80 && !isCritical;

            let progressColor = "bg-emerald-500";
            if (isWarning) progressColor = "bg-amber-500";
            if (isCritical) progressColor = "bg-red-500";

            return (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-3xl shadow-xs transition-all relative group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-2xl text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: item.categoryColor || "#64748b" }}
                    >
                      <CategoryIcon name={item.categoryIcon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {item.categoryName}
                      </h4>
                      <span className="text-xs text-neutral-500">
                        Limit: <strong className="text-neutral-800 dark:text-neutral-200">{formatRupiah(item.budgetAmount)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full ${
                        isCritical
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                          : isWarning
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {item.percentage}%
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEditBudget(item)}
                        className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-lg cursor-pointer"
                        title="Ubah Anggaran"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Hapus Anggaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden mt-3 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>

                {/* Status caption */}
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-neutral-500">
                    Terpakai: <strong className="text-neutral-800 dark:text-neutral-200">{formatRupiah(item.spentAmount)}</strong>
                  </span>
                  {item.isOverBudget ? (
                    <span className="font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Lewat {formatRupiah(item.overAmount)}
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Sisa: {formatRupiah(item.remainingAmount)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Atur Budget */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Atur Limit Anggaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="pt-5 space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Pilih Kategori Pengeluaran
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                  <option value="">Pilih Kategori...</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Batas Anggaran Bulanan (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 1500000"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    required
                    className="w-full pl-11 pr-3 py-2.5 text-sm font-bold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                </div>

                {/* Quick Chips */}
                <div className="flex gap-1.5 mt-2">
                  {[500000, 1000000, 2000000, 3000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudgetAmount(String(amt))}
                      className="px-2 py-1 text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 rounded-lg cursor-pointer"
                    >
                      {amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Anggaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal to delete budget */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Batas Anggaran"
        message={`Apakah Anda yakin ingin menghapus target anggaran untuk kategori "${deleteTarget?.categoryName}" pada bulan ini?`}
        confirmText="Hapus Anggaran"
        onConfirm={handleDeleteBudget}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
