import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const accountId = searchParams.get("accountId");
    const search = searchParams.get("search");

    const where: any = {};

    if (month && year) {
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      where.date = {
        gte: new Date(y, m - 1, 1, 0, 0, 0),
        lte: new Date(y, m, 0, 23, 59, 59, 999),
      };
    }

    if (type && (type === "income" || type === "expense")) {
      where.type = type;
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    if (accountId && accountId !== "all") {
      where.accountId = accountId;
    }

    if (search && search.trim() !== "") {
      where.notes = {
        contains: search.trim(),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, type, date, notes, accountId, categoryId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Nominal harus lebih dari 0" }, { status: 400 });
    }

    if (!type || (type !== "income" && type !== "expense")) {
      return NextResponse.json({ error: "Tipe transaksi tidak valid" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
        accountId: accountId || null,
        categoryId: categoryId || null,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Gagal menambahkan transaksi" }, { status: 500 });
  }
}
