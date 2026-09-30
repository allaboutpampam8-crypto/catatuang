"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  AlertCircle,
  X,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { formatRupiah, formatDateIndo } from "@/lib/formatters";
import { CategoryIcon } from "./CategoryIcon";
import { ConfirmModal } from "./ConfirmModal";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  date: string;
  notes?: string | null;
  accountId?: string | null;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
  } | null;
  account?: {
    id: string;
    name: string;
    type: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Account {
  id: string;
  name: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  selectedMonth: number;
  selectedYear: number;
  onEdit: (tx: Transaction) => void;
  onDeleteSuccess: () => void;
}

type SortOption = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export function TransactionsTable({
  transactions,
  categories,
  accounts,
  selectedMonth,
  selectedYear,
  onEdit,
  onDeleteSuccess,
}: TransactionsTableProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Search
  const filtered = transactions.filter((tx) => {
    if (filterType !== "all" && tx.type !== filterType) return false;
    if (filterCategory !== "all" && tx.categoryId !== filterCategory) return false;
    if (filterAccount !== "all" && tx.accountId !== filterAccount) return false;
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const notesMatch = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      const catMatch = tx.category?.name ? tx.category.name.toLowerCase().includes(q) : false;
      const accMatch = tx.account?.name ? tx.account.name.toLowerCase().includes(q) : false;
      if (!notesMatch && !catMatch && !accMatch) return false;
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date_desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "date_asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === "amount_desc") return b.amount - a.amount;
    if (sortBy === "amount_asc") return a.amount - b.amount;
    return 0;
  });

  // Subtotals
  const totalFilteredIncome = sorted
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalFilteredExpense = sorted
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleteSuccess();
      } else {
        alert("Gagal menghapus transaksi.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/export?month=${selectedMonth}&year=${selectedYear}`, "_blank");
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-6 border-b border-neutral-100 dark:border-neutral-800/80 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Riwayat Transaksi
            </h3>
            <p className="text-xs text-neutral-500">
              Daftar catatan uang masuk dan keluar pada periode terpilih
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* Filter Controls: Optimized for mobile touch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 text-xs font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/90 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/90 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="all">Semua Tipe Transaksi</option>
            <option value="income">Hanya Pemasukan (+)</option>
            <option value="expense">Hanya Pengeluaran (-)</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/90 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-3 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/90 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="date_desc">Tanggal: Terbaru</option>
            <option value="date_asc">Tanggal: Terlama</option>
            <option value="amount_desc">Nominal: Terbesar</option>
            <option value="amount_asc">Nominal: Terkecil</option>
          </select>
        </div>

        {/* Filter Summary Banner */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-xs text-neutral-500">
          <div>
            Menampilkan <strong className="text-neutral-800 dark:text-neutral-200">{sorted.length}</strong> transaksi
          </div>
          <div className="flex items-center gap-2 font-bold text-[11px]">
            {totalFilteredIncome > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400">
                +{formatRupiah(totalFilteredIncome)}
              </span>
            )}
            {totalFilteredExpense > 0 && (
              <span className="text-red-600 dark:text-red-400">
                -{formatRupiah(totalFilteredExpense)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {sorted.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center text-neutral-400 px-4">
          <AlertCircle className="w-12 h-12 mb-3 stroke-1 opacity-40 text-neutral-400" />
          <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Tidak Ada Transaksi Ditemukan
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mt-1">
            Coba sesuaikan kata kunci pencarian atau ganti filter yang dipilih.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Cards View (md:hidden) - Ergonomic for phone screens */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 md:hidden">
            {sorted.map((tx) => {
              const isIncome = tx.type === "income";
              return (
                <div
                  key={tx.id}
                  className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors flex items-center justify-between gap-3"
                  onClick={() => onEdit(tx)}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="p-2.5 rounded-2xl text-white shrink-0 mt-0.5 shadow-2xs"
                      style={{
                        backgroundColor:
                          tx.category?.color || (isIncome ? "#10b981" : "#ef4444"),
                      }}
                    >
                      <CategoryIcon name={tx.category?.icon} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white truncate">
                        {tx.notes || tx.category?.name || "Transaksi"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-neutral-400">
                        <span>{formatDateIndo(tx.date)}</span>
                        <span>•</span>
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          {tx.category?.name || "Tanpa Kategori"}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-neutral-500">
                          <Wallet className="w-3 h-3" />
                          {tx.account?.name || "Tunai"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span
                      className={`font-black text-sm tracking-tight inline-flex items-center ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(tx);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-lg cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(tx);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. Desktop Table View (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Tanggal</th>
                  <th className="py-3.5 px-5">Kategori</th>
                  <th className="py-3.5 px-5">Dompet / Akun</th>
                  <th className="py-3.5 px-5">Catatan</th>
                  <th className="py-3.5 px-5 text-right">Nominal</th>
                  <th className="py-3.5 px-5 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {sorted.map((tx) => {
                  const isIncome = tx.type === "income";
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-neutral-50/90 dark:hover:bg-neutral-800/40 transition-colors group"
                    >
                      {/* Tanggal */}
                      <td className="py-3.5 px-5 text-neutral-600 dark:text-neutral-400 font-medium whitespace-nowrap">
                        {formatDateIndo(tx.date)}
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="p-1.5 rounded-xl text-white shrink-0 shadow-2xs"
                            style={{
                              backgroundColor:
                                tx.category?.color || (isIncome ? "#10b981" : "#ef4444"),
                            }}
                          >
                            <CategoryIcon name={tx.category?.icon} className="w-3.5 h-3.5" />
                          </span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {tx.category?.name || "Tanpa Kategori"}
                          </span>
                        </div>
                      </td>

                      {/* Dompet */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-[11px]">
                          <Wallet className="w-3 h-3 text-neutral-400" />
                          {tx.account?.name || "Tunai"}
                        </span>
                      </td>

                      {/* Catatan */}
                      <td className="py-3.5 px-5 text-neutral-700 dark:text-neutral-300 max-w-xs truncate">
                        {tx.notes ? (
                          <span>{tx.notes}</span>
                        ) : (
                          <span className="text-neutral-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span
                          className={`font-black text-sm tracking-tight inline-flex items-center ${
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-4 h-4 mr-0.5 inline shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-0.5 inline shrink-0" />
                          )}
                          {isIncome ? "+" : "-"}
                          {formatRupiah(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEdit(tx)}
                            className="p-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(tx)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Confirmation Modal to Delete Transaction */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Transaksi"
        message={`Apakah Anda yakin ingin menghapus catatan transaksi ${
          deleteTarget?.type === "income" ? "pemasukan" : "pengeluaran"
        } sebesar ${deleteTarget ? formatRupiah(deleteTarget.amount) : ""}? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Transaksi"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
