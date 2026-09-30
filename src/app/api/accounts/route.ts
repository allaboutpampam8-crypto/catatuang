import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    const allTx = await prisma.transaction.findMany({
      select: { accountId: true, amount: true, type: true },
    });

    const balanceMap: Record<string, number> = {};
    accounts.forEach((acc) => {
      balanceMap[acc.id] = acc.initialBalance;
    });

    allTx.forEach((tx) => {
      if (tx.accountId && balanceMap[tx.accountId] !== undefined) {
        if (tx.type === "income") {
          balanceMap[tx.accountId] += tx.amount;
        } else {
          balanceMap[tx.accountId] -= tx.amount;
        }
      }
    });

    const result = accounts.map((acc) => ({
      ...acc,
      currentBalance: balanceMap[acc.id] ?? acc.initialBalance,
    }));

    return NextResponse.json({ accounts: result });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar akun/dompet" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, initialBalance, color } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama akun/dompet wajib diisi" }, { status: 400 });
    }

    const account = await prisma.account.create({
      data: {
        name: name.trim(),
        type: type || "bank",
        initialBalance: initialBalance ? parseFloat(initialBalance) : 0,
        color: color || "#3b82f6",
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json({ error: "Gagal menambahkan akun" }, { status: 500 });
  }
}
