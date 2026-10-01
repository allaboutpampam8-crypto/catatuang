"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, ArrowRight, Delete, KeyRound, Check, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface PinLockScreenProps {
  onUnlock: () => void;
}

const PIN_STORAGE_KEY = "catatuang_app_pin";
const DEFAULT_FALLBACK_PIN = "1234";

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"enter" | "create" | "confirm">("enter");

  // Determine current active configured PIN
  const getStoredPin = (): string | null => {
    if (typeof window === "undefined") return null;
    const local = localStorage.getItem(PIN_STORAGE_KEY);
    if (local) return local;
    const envPin = process.env.NEXT_PUBLIC_APP_PIN;
    if (envPin) return envPin;
    return null;
  };

  useEffect(() => {
    const existing = getStoredPin();
    if (!existing) {
      // First time use: invite user to create PIN
      setStep("create");
      setIsSettingNewPin(true);
    } else {
      setStep("enter");
      setIsSettingNewPin(false);
    }
  }, []);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError("");

    if (nextPin.length === 4) {
      handleComplete(nextPin);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleComplete = (inputPin: string) => {
    if (step === "enter") {
      const targetPin = getStoredPin() || DEFAULT_FALLBACK_PIN;
      if (inputPin === targetPin) {
        sessionStorage.setItem("catatuang_auth", "true");
        onUnlock();
      } else {
        triggerError("PIN salah. Silakan coba lagi.");
      }
    } else if (step === "create") {
      setConfirmPin(inputPin);
      setPin("");
      setStep("confirm");
    } else if (step === "confirm") {
      if (inputPin === confirmPin) {
        localStorage.setItem(PIN_STORAGE_KEY, inputPin);
        sessionStorage.setItem("catatuang_auth", "true");
        onUnlock();
      } else {
        triggerError("Konfirmasi PIN tidak cocok. Silakan ulangi.");
        setStep("create");
        setConfirmPin("");
      }
    }
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPin("");
    }, 600);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, step, confirmPin]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 text-white p-4 overflow-y-auto">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm flex flex-col items-center text-center space-y-6 sm:space-y-8 my-auto py-8">
        {/* App Logo & Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800 p-2.5 flex items-center justify-center shadow-2xl">
            <img
              src="/icon-192.png"
              alt="CatatUang Logo"
              className="w-full h-full object-contain drop-shadow"
            />
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-blue-600 border-2 border-neutral-950 flex items-center justify-center text-white shadow">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">CatatUang Pribadi</h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xs">
              {step === "enter" && "Masukkan 4 angka PIN untuk membuka data keuangan pribadi Anda"}
              {step === "create" && "Buat 4 digit PIN baru untuk mengamankan data pribadi Anda"}
              {step === "confirm" && "Masukkan ulang 4 digit PIN untuk konfirmasi"}
            </p>
          </div>
        </div>

        {/* PIN Dots Display */}
        <div className="flex flex-col items-center space-y-3">
          <div
            className={`flex items-center gap-4 h-10 transition-transform ${
              isShaking ? "animate-shake" : ""
            }`}
          >
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? "bg-blue-500 scale-125 shadow-lg shadow-blue-500/50"
                      : "bg-neutral-800 border border-neutral-700"
                  }`}
                />
              );
            })}
          </div>

          {error ? (
            <p className="text-xs font-semibold text-rose-400 animate-fade-in">{error}</p>
          ) : (
            <p className="text-[11px] text-neutral-500">
              {step === "enter" && "Default PIN awal: 1234"}
              {step === "create" && "Ketik 4 angka pada keypad"}
              {step === "confirm" && "Ketik ulang PIN yang sama"}
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-64">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(String(num))}
              className="w-18 h-18 mx-auto rounded-full bg-neutral-900/80 hover:bg-neutral-800 active:bg-blue-600/30 border border-neutral-800 text-xl font-bold text-white transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear / 0 / Backspace */}
          <button
            type="button"
            onClick={() => {
              setPin("");
              setError("");
            }}
            className="w-18 h-18 mx-auto rounded-full hover:bg-neutral-900 text-xs font-semibold text-neutral-500 hover:text-neutral-300 transition-colors flex items-center justify-center cursor-pointer"
          >
            Hapus
          </button>

          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="w-18 h-18 mx-auto rounded-full bg-neutral-900/80 hover:bg-neutral-800 active:bg-blue-600/30 border border-neutral-800 text-xl font-bold text-white transition-all duration-150 flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="w-18 h-18 mx-auto rounded-full hover:bg-neutral-900 active:bg-neutral-800 text-neutral-400 hover:text-white transition-all flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Hapus satu angka"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Link to Demo Mode */}
        <div className="pt-2 w-full border-t border-neutral-900 flex flex-col items-center space-y-2">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-all group shadow-sm"
          >
            <span>🎭 Ingin mencoba? Buka Versi Demo</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <span className="text-[10px] text-neutral-500">
            Versi demo menggunakan database terpisah dan bebas dicoba tanpa PIN
          </span>
        </div>
      </div>
    </div>
  );
}
