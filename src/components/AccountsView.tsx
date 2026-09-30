"use client";

import React, { useState } from "react";
import {
  Wallet,
  Landmark,
  Smartphone,
  Plus,
  Trash2,
  X,
  Edit2,
  ArrowRightLeft,
  Check,
  CreditCard,
  Building2,
  Coins,
} from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { ConfirmModal } from "./ConfirmModal";

interface Account {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  color?: string | null;
  _count?: { transactions: number };
}

interface AccountsViewProps {
  accounts: Account[];
  onRefresh: () => void;
}

export function AccountsView({ accounts, onRefresh }: AccountsViewProps) {
  // Add / Edit Account State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [initialBalance, setInitialBalance] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transfer State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  // Net worth breakdown
  const totalBalance = accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const cashBalance = accounts
    .filter((a) => a.type === "cash")
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const bankBalance = accounts
    .filter((a) => a.type === "bank")
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const ewalletBalance = accounts
    .filter((a) => a.type === "ewallet")
    .reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  const openAddModal = () => {
    setEditingAccount(null);
    setName("");
    setType("bank");
    setInitialBalance("");
    setColor("#3b82f6");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(String(acc.initialBalance));
    setColor(acc.color || "#3b82f6");
    setError(null);
    setModalOpen(true);
  };

  const openTransferModal = () => {
    setFromAccountId(accounts[0]?.id || "");
    setToAccountId(accounts[1]?.id || "");
    setTransferAmount("");
    setTransferNotes("");
    setTransferError(null);
    setTransferModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama akun/dompet wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const url = editingAccount ? `/api/accounts/${editingAccount.id}` : `/api/accounts`;
      const method = editingAccount ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          initialBalance: initialBalance ? parseFloat(initialBalance) : 0,
          color,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan akun");
      }

      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);

    const amountNum = parseFloat(transferAmount.replace(/[^0-9]/g, ""));
    if (!amountNum || amountNum <= 0) {
      setTransferError("Nominal transfer harus lebih dari Rp 0");
      return;
    }

    if (fromAccountId === toAccountId) {
      setTransferError("Akun sumber dan tujuan tidak boleh sama");
      return;
    }

    setTransferLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId,
          toAccountId,
          amount: amountNum,
          notes: transferNotes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memproses transfer");
      }

      setTransferModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setTransferError(err.message || "Terjadi kesalahan");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/accounts/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      } else {
        alert("Gagal menghapus akun.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const getAccountIcon = (t: string) => {
    switch (t) {
      case "cash":
        return <Wallet className="w-5 h-5" />;
      case "bank":
        return <Landmark className="w-5 h-5" />;
      case "ewallet":
      default:
        return <Smartphone className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & Actions */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Dompet & Rekening Keuangan
            </h3>
            <p className="text-xs text-neutral-500">
              Kelola seluruh rekening bank, e-wallet, dan uang tunai secara terpusat
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {accounts.length >= 2 && (
              <button
                type="button"
                onClick={openTransferModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                Pindah Dana (Transfer)
              </button>
            )}

            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Dompet Baru
            </button>
          </div>
        </div>

        {/* Breakdown Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Kekayaan Bersih
            </span>
            <p className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
              {formatRupiah(totalBalance)}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Coins className="w-3 h-3 text-emerald-500" /> Tunai
            </span>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
              {formatRupiah(cashBalance)}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-blue-500" /> Bank
            </span>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
              {formatRupiah(bankBalance)}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-cyan-500" /> E-Wallet
            </span>
            <p className="text-sm font-extrabold text-neutral-800 dark:text-neutral-200 mt-1">
              {formatRupiah(ewalletBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Grid of Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs hover:shadow-md transition-all relative group overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-2xl text-white shadow-xs"
                  style={{ backgroundColor: acc.color || "#3b82f6" }}
                >
                  {getAccountIcon(acc.type)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                    {acc.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    {acc.type === "cash"
                      ? "Tunai"
                      : acc.type === "bank"
                      ? "Rekening Bank"
                      : "E-Wallet"}
                  </span>
                </div>
              </div>

              {/* Action Buttons on hover */}
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => openEditModal(acc)}
                  className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-lg cursor-pointer"
                  title="Ubah Akun"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {accounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(acc)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="Hapus Akun"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-semibold text-neutral-400">
                  Saldo Saat Ini:
                </span>
                <div className="text-xl font-black text-neutral-900 dark:text-white tracking-tight mt-0.5">
                  {formatRupiah(acc.currentBalance)}
                </div>
              </div>

              {acc.initialBalance > 0 && (
                <span className="text-[10px] text-neutral-400 pb-1">
                  Awal: {formatRupiah(acc.initialBalance)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Akun */}
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
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {editingAccount ? "Edit Dompet / Akun" : "Tambah Dompet / Akun"}
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

            <form onSubmit={handleSaveAccount} className="pt-5 space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Nama Dompet / Rekening
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bank BCA, Dompet Tunai, GoPay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Jenis Akun
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    <option value="bank">Rekening Bank</option>
                    <option value="ewallet">E-Wallet</option>
                    <option value="cash">Tunai / Dompet Fisik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Warna Label
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-9.5 p-1 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
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
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : editingAccount ? "Perbarui Akun" : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pindah Dana (Transfer Antar Dompet) */}
      {transferModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          onClick={() => setTransferModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Transfer / Pindah Dana
                  </h3>
                  <p className="text-[11px] text-neutral-500">Pindahkan uang antar dompet Anda</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessTransfer} className="pt-5 space-y-4">
              {transferError && (
                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                  {transferError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Dari Akun Sumber
                  </label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Ke Akun Tujuan
                  </label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Nominal Transfer (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    required
                    className="w-full pl-11 pr-3 py-2.5 text-sm font-bold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Keterangan / Catatan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Tarik tunai ATM, Top up e-wallet"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {transferLoading ? "Memproses..." : "Kirim Dana"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Account */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Dompet / Rekening"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Transaksi yang pernah tercatat pada akun ini akan tetap tersimpan namun status akunnya disetel kosong.`}
        confirmText="Hapus Akun"
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
