import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || `${now.getMonth() + 1}`, 10);
    const year = parseInt(searchParams.get("year") || `${now.getFullYear()}`, 10);

    const budgets = await prisma.budget.findMany({
      where: { month, year },
      include: { category: true },
      orderBy: { amount: "desc" },
    });

    // Calculate actual expenses for this month for each category
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await prisma.transaction.findMany({
      where: {
        type: "expense",
        date: { gte: startDate, lte: endDate },
        categoryId: { in: budgets.map((b) => b.categoryId) },
      },
    });

    const expenseMap: Record<string, number> = {};
    expenses.forEach((tx) => {
      if (tx.categoryId) {
        expenseMap[tx.categoryId] = (expenseMap[tx.categoryId] || 0) + tx.amount;
      }
    });

    const result = budgets.map((b) => {
      const spent = expenseMap[b.categoryId] || 0;
      return {
        ...b,
        spent,
        remaining: b.amount - spent,
        percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
      };
    });

    return NextResponse.json({ budgets: result });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json({ error: "Gagal mengambil data anggaran" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, month, year, amount } = body;

    if (!categoryId) {
      return NextResponse.json({ error: "Kategori wajib dipilih" }, { status: 400 });
    }

    if (!amount || amount < 0) {
      return NextResponse.json({ error: "Batas anggaran tidak valid" }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        categoryId_month_year: {
          categoryId,
          month: parseInt(month, 10),
          year: parseInt(year, 10),
        },
      },
      update: {
        amount: parseFloat(amount),
      },
      create: {
        categoryId,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        amount: parseFloat(amount),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ budget }, { status: 200 });
  } catch (error) {
    console.error("Error setting budget:", error);
    return NextResponse.json({ error: "Gagal menyimpan anggaran" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID anggaran wajib disertakan" }, { status: 400 });
    }

    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Anggaran berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json({ error: "Gagal menghapus anggaran" }, { status: 500 });
  }
}
