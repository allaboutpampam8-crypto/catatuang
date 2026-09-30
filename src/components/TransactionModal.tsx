"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowDownRight, ArrowUpRight, Check, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";

interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
  color?: string | null;
}

interface Account {
  id: string;
  name: string;
  type: string;
  currentBalance?: number;
}

interface TransactionData {
  id?: string;
  amount: number | string;
  type: "income" | "expense";
  date: string;
  notes?: string;
  accountId?: string;
  categoryId?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  accounts: Account[];
  initialData?: TransactionData | null;
  defaultType?: "income" | "expense";
}

const QUICK_AMOUNTS = [
  { label: "+10rb", value: 10000 },
  { label: "+20rb", value: 20000 },
  { label: "+50rb", value: 50000 },
  { label: "+100rb", value: 100000 },
  { label: "+500rb", value: 500000 },
  { label: "+1jt", value: 1000000 },
];

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  categories,
  accounts,
  initialData,
  defaultType = "expense",
}: TransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [accountId, setAccountId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setNotes(initialData.notes || "");
      setCategoryId(initialData.categoryId || "");
      setAccountId(initialData.accountId || "");
    } else {
      setType(defaultType);
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setCategoryId("");
      if (accounts.length > 0) {
        setAccountId(accounts[0].id);
      }
    }
    setError(null);
  }, [initialData, isOpen, accounts, defaultType]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === type);
  const numAmount = parseFloat(amount.replace(/[^0-9]/g, "")) || 0;

  const handleQuickAmount = (val: number) => {
    setAmount((prev) => {
      const current = parseFloat(prev.replace(/[^0-9]/g, "")) || 0;
      return String(current + val);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount <= 0) {
      setError("Nominal harus lebih besar dari Rp 0");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        amount: numAmount,
        type,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        notes: notes.trim(),
        accountId: accountId || null,
        categoryId: categoryId || null,
      };

      const url = initialData?.id
        ? `/api/transactions/${initialData.id}`
        : `/api/transactions`;
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan transaksi");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg bg-white dark:bg-neutral-900 border-t sm:border border-neutral-200/90 dark:border-neutral-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl text-white ${
                type === "expense" ? "bg-red-500 shadow-xs" : "bg-emerald-500 shadow-xs"
              }`}
            >
              {type === "expense" ? (
                <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                {initialData?.id ? "Edit Transaksi" : "Catat Transaksi"}
              </h2>
              <p className="text-[11px] text-neutral-500">
                {type === "expense" ? "Uang keluar" : "Uang masuk"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable on small screens) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle: Pengeluaran vs Pemasukan */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategoryId("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === "expense"
                  ? "bg-red-500 text-white shadow-md shadow-red-500/25"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategoryId("");
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === "income"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Pemasukan
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="tx-amount" className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Nominal (Rp) <span className="text-red-500">*</span>
              </label>
              {numAmount > 0 && (
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                  {formatRupiah(numAmount)}
                </span>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-black text-xl select-none">
                Rp
              </span>
              <input
                id="tx-amount"
                type="number"
                inputMode="numeric"
                min="1"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                required
                className="w-full pl-14 pr-4 py-3.5 text-2xl font-black tracking-tight bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => handleQuickAmount(q.value)}
                  className="px-2.5 py-1 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 active:bg-blue-100 dark:active:bg-blue-900/40 text-neutral-700 dark:text-neutral-300 rounded-lg cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount("")}
                  className="px-2 py-1 text-xs text-neutral-400 hover:text-red-500 cursor-pointer ml-auto font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Date & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="tx-date" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-3 text-sm font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white min-h-[46px]"
              />
            </div>

            <div>
              <label htmlFor="tx-account" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Dompet / Rekening
              </label>
              <select
                id="tx-account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-3 text-sm font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white min-h-[46px]"
              >
                <option value="">Pilih Dompet...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label htmlFor="tx-category" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Kategori Transaksi
            </label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-3 text-sm font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white min-h-[46px]"
            >
              <option value="">Pilih Kategori...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="tx-notes" className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              id="tx-notes"
              type="text"
              placeholder="Contoh: Makan siang, Beli bensin, dll."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-3 text-sm font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white min-h-[46px]"
            />
          </div>

          {/* Bottom Action Button (Full width on mobile) */}
          <div className="pt-2 sm:pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-block px-4 py-3 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-extrabold text-white rounded-2xl shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                type === "expense"
                  ? "bg-red-600 hover:bg-red-700 shadow-red-600/25 active:scale-98"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 active:scale-98"
              }`}
            >
              <Check className="w-5 h-5" />
              {loading ? "Menyimpan..." : initialData?.id ? "Perbarui Transaksi" : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
