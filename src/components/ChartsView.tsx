"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatRupiah } from "@/lib/formatters";
import { PieChart as PieIcon, BarChart3, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryStat {
  name: string;
  amount: number;
  color: string;
  icon?: string;
}

interface DailyTrendItem {
  day: number;
  income: number;
  expense: number;
}

interface ChartsViewProps {
  expenseByCategory: CategoryStat[];
  incomeByCategory?: CategoryStat[];
  dailyTrend: DailyTrendItem[];
}

const DEFAULT_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#ec4899",
  "#8b5cf6",
  "#3b82f6",
  "#14b8a6",
  "#06b6d4",
  "#64748b",
];

export function ChartsView({
  expenseByCategory,
  incomeByCategory = [],
  dailyTrend,
}: ChartsViewProps) {
  const [pieMode, setPieMode] = useState<"expense" | "income">("expense");

  const currentCategoryData = pieMode === "expense" ? expenseByCategory : incomeByCategory;
  const currentTotal = currentCategoryData.reduce((sum, item) => sum + item.amount, 0);

  const activeDailyTrend = dailyTrend.filter((d) => d.income > 0 || d.expense > 0);

  // Custom stylish tooltip for Recharts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = currentTotal > 0 ? ((data.amount / currentTotal) * 100).toFixed(1) : 0;
      return (
        <div className="bg-neutral-900/95 text-white p-3 rounded-2xl shadow-xl border border-neutral-700/60 backdrop-blur-md text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color || "#3b82f6" }}
            />
            <span className="font-bold">{data.name}</span>
          </div>
          <div className="font-extrabold text-sm">{formatRupiah(data.amount)}</div>
          <div className="text-[11px] text-neutral-400">Porsi: {percent}% dari total</div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-neutral-700/60 backdrop-blur-md text-xs space-y-2">
          <div className="font-bold text-neutral-300 border-b border-neutral-800 pb-1">
            Tanggal {label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-extrabold text-white">
                {formatRupiah(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Pengeluaran / Pemasukan Berdasarkan Kategori (Donut Chart) */}
      <div className="lg:col-span-5 p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${
              pieMode === "expense" ? "bg-red-500 shadow-md shadow-red-500/20" : "bg-emerald-500 shadow-md shadow-emerald-500/20"
            }`}>
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Distribusi Kategori
              </h3>
              <p className="text-[11px] text-neutral-500">
                {pieMode === "expense" ? "Pola pengeluaran bulanan" : "Sumber pemasukan bulanan"}
              </p>
            </div>
          </div>

          {/* Toggle Expense vs Income */}
          <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-[11px]">
            <button
              type="button"
              onClick={() => setPieMode("expense")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                pieMode === "expense"
                  ? "bg-white dark:bg-neutral-900 text-red-600 dark:text-red-400 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setPieMode("income")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                pieMode === "income"
                  ? "bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        {currentCategoryData.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-neutral-400">
            <AlertCircle className="w-10 h-10 mb-2 stroke-1 opacity-50" />
            <p className="text-xs font-medium">
              Belum ada data {pieMode === "expense" ? "pengeluaran" : "pemasukan"} di bulan ini.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="h-60 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {currentCategoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Total Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                  Total
                </span>
                <span className="text-xs font-black text-neutral-800 dark:text-neutral-200">
                  {formatRupiah(currentTotal)}
                </span>
              </div>
            </div>

            {/* List breakdown */}
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
              {currentCategoryData.map((item, idx) => {
                const percent = currentTotal > 0 ? Math.round((item.amount / currentTotal) * 100) : 0;
                return (
                  <div key={idx} className="flex items-center justify-between text-xs p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 rounded-xl transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length] }}
                      />
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate text-[11px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-bold text-neutral-900 dark:text-neutral-100 text-[11px]">
                      <span>{formatRupiah(item.amount)}</span>
                      <span className="text-neutral-400 font-normal">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Tren Harian Pemasukan vs Pengeluaran (Bar Chart) */}
      <div className="lg:col-span-7 p-6 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Aktivitas Harian
              </h3>
              <p className="text-[11px] text-neutral-500">Perbandingan uang masuk & keluar per tanggal</p>
            </div>
          </div>
        </div>

        {activeDailyTrend.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-neutral-400">
            <AlertCircle className="w-10 h-10 mb-2 stroke-1 opacity-50" />
            <p className="text-xs font-medium">Belum ada aktivitas transaksi harian di bulan ini.</p>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyTrend}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  tickFormatter={(val) => `Tgl ${val}`}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  tickFormatter={(val) => `${val >= 1000000 ? `${(val / 1000000).toFixed(1)}jt` : `${(val / 1000).toFixed(0)}rb`}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "12px", fontSize: "11px" }}
                />
                <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="expense" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
