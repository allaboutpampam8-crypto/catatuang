"use client";

import React, { useState } from "react";
import { X, Lock, Check, AlertCircle } from "lucide-react";

interface ChangePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PIN_STORAGE_KEY = "catatuang_app_pin";
const DEFAULT_FALLBACK_PIN = "1234";

export function ChangePinModal({ isOpen, onClose, onSuccess }: ChangePinModalProps) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const currentPin =
    (typeof window !== "undefined" && localStorage.getItem(PIN_STORAGE_KEY)) ||
    process.env.NEXT_PUBLIC_APP_PIN ||
    DEFAULT_FALLBACK_PIN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (oldPin !== currentPin) {
      setError("PIN lama tidak sesuai.");
      return;
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError("PIN baru harus terdiri dari 4 digit angka.");
      return;
    }

    if (newPin !== confirmPin) {
      setError("Konfirmasi PIN baru tidak cocok.");
      return;
    }

    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    setSuccessMsg("PIN berhasil diperbarui!");
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">Ubah PIN Keamanan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              PIN Saat Ini
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-center font-mono tracking-widest text-lg text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              PIN Baru (4 Digit)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-center font-mono tracking-widest text-lg text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-1">
              Konfirmasi PIN Baru
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-center font-mono tracking-widest text-lg text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
            >
              Simpan PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
