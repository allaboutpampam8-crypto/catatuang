import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = {};
    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      where.date = {
        gte: new Date(y, m - 1, 1, 0, 0, 0),
        lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "asc" },
    });

    const header = ["ID", "Tanggal", "Tipe", "Kategori", "Akun / Dompet", "Nominal (IDR)", "Catatan"];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${new Date(t.date).toISOString().split("T")[0]}"`,
      `"${t.type === "income" ? "Pemasukan" : "Pengeluaran"}"`,
      `"${t.category?.name || "-"}"`,
      `"${t.account?.name || "-"}"`,
      t.amount,
      `"${(t.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const filename = `transaksi-${year || "semua"}-${month || "semua"}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting CSV:", error);
    return NextResponse.json({ error: "Gagal mengekspor data" }, { status: 500 });
  }
}
