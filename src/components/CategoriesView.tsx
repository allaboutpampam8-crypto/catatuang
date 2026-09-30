"use client";

import React, { useState } from "react";
import { Tag, Plus, Trash2, X, Edit2, Search } from "lucide-react";
import { CategoryIcon, AVAILABLE_ICONS } from "./CategoryIcon";
import { ConfirmModal } from "./ConfirmModal";

interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string | null;
  color?: string | null;
  _count?: { transactions: number };
}

interface CategoriesViewProps {
  categories: Category[];
  onRefresh: () => void;
}

export function CategoriesView({ categories, onRefresh }: CategoriesViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [icon, setIcon] = useState("Tag");
  const [color, setColor] = useState("#ef4444");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const filteredCategories = categories
    .filter((c) => c.type === activeTab)
    .filter((c) => (search.trim() ? c.name.toLowerCase().includes(search.toLowerCase()) : true));

  const openAddModal = () => {
    setEditingCategory(null);
    setName("");
    setType(activeTab);
    setIcon("Tag");
    setColor(activeTab === "income" ? "#10b981" : "#ef4444");
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type as "expense" | "income");
    setIcon(cat.icon || "Tag");
    setColor(cat.color || "#64748b");
    setError(null);
    setModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : `/api/categories`;
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          icon,
          color,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan kategori");
      }

      setModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      } else {
        alert("Gagal menghapus kategori.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              Kelola Kategori Transaksi
            </h3>
            <p className="text-xs text-neutral-500">
              Kustomisasi label kategori pemasukan dan pengeluaran sesuai kebutuhan
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Kategori Baru
          </button>
        </div>

        {/* Filters & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Toggle Tab */}
          <div className="flex gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 w-fit rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("expense")}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "expense"
                  ? "bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              Pengeluaran ({categories.filter((c) => c.type === "expense").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("income")}
              className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === "income"
                  ? "bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              Pemasukan ({categories.filter((c) => c.type === "income").length})
            </button>
          </div>

          {/* Search Category */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/90 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs hover:shadow-xs group hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
          >
            <div className="flex items-center gap-3 truncate">
              <span
                className="p-2.5 rounded-xl text-white shrink-0 shadow-xs"
                style={{ backgroundColor: cat.color || "#64748b" }}
              >
                <CategoryIcon name={cat.icon} className="w-4 h-4" />
              </span>
              <div className="truncate">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                  {cat.name}
                </h4>
                <span className="text-[11px] font-medium text-neutral-400">
                  {cat._count?.transactions || 0} transaksi
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => openEditModal(cat)}
                className="p-1.5 text-neutral-400 hover:text-blue-600 rounded-lg cursor-pointer"
                title="Edit Kategori"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(cat)}
                className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg cursor-pointer"
                title="Hapus Kategori"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Kategori */}
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
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="pt-5 space-y-4">
              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Tipe Kategori
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const t = e.target.value as "expense" | "income";
                    setType(t);
                    if (!editingCategory) setColor(t === "income" ? "#10b981" : "#ef4444");
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Belanja Online, Donasi, dll."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Pilih Ikon
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic.name} value={ic.name}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Warna Kategori
                  </label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-9.5 p-1 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-300 dark:border-neutral-700 rounded-xl cursor-pointer"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl flex items-center gap-3 border border-neutral-200/60 dark:border-neutral-800/60">
                <span className="text-[11px] font-semibold text-neutral-400">Preview:</span>
                <div className="flex items-center gap-2">
                  <span
                    className="p-1.5 rounded-lg text-white shadow-2xs"
                    style={{ backgroundColor: color }}
                  >
                    <CategoryIcon name={icon} className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {name || "Nama Kategori"}
                  </span>
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
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : editingCategory ? "Perbarui Kategori" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Delete Category */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"? Transaksi yang menggunakan kategori ini akan tetap tersimpan namun status kategorinya disetel kosong.`}
        confirmText="Hapus Kategori"
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
