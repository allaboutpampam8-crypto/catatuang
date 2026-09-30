import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromAccountId, toAccountId, amount, date, notes } = body;

    if (!fromAccountId || !toAccountId) {
      return NextResponse.json({ error: "Akun sumber dan akun tujuan wajib dipilih" }, { status: 400 });
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json({ error: "Akun sumber dan akun tujuan tidak boleh sama" }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return NextResponse.json({ error: "Nominal transfer harus lebih dari Rp 0" }, { status: 400 });
    }

    const fromAccount = await prisma.account.findUnique({ where: { id: fromAccountId } });
    const toAccount = await prisma.account.findUnique({ where: { id: toAccountId } });

    if (!fromAccount || !toAccount) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });
    }

    // Find or create transfer categories
    let expenseTransferCat = await prisma.category.findFirst({
      where: { name: "Transfer Keluar", type: "expense" },
    });
    if (!expenseTransferCat) {
      expenseTransferCat = await prisma.category.create({
        data: {
          name: "Transfer Keluar",
          type: "expense",
          icon: "ArrowRightLeft",
          color: "#64748b",
        },
      });
    }

    let incomeTransferCat = await prisma.category.findFirst({
      where: { name: "Transfer Masuk", type: "income" },
    });
    if (!incomeTransferCat) {
      incomeTransferCat = await prisma.category.create({
        data: {
          name: "Transfer Masuk",
          type: "income",
          icon: "ArrowRightLeft",
          color: "#64748b",
        },
      });
    }

    const txDate = date ? new Date(date) : new Date();
    const transferNotes = notes?.trim() ? ` (${notes.trim()})` : "";

    // Create paired transactions in a transaction
    const [outTx, inTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: numAmount,
          type: "expense",
          date: txDate,
          notes: `Transfer ke ${toAccount.name}${transferNotes}`,
          accountId: fromAccountId,
          categoryId: expenseTransferCat.id,
        },
      }),
      prisma.transaction.create({
        data: {
          amount: numAmount,
          type: "income",
          date: txDate,
          notes: `Transfer dari ${fromAccount.name}${transferNotes}`,
          accountId: toAccountId,
          categoryId: incomeTransferCat.id,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Berhasil mentransfer ${numAmount} dari ${fromAccount.name} ke ${toAccount.name}`,
      outTx,
      inTx,
    });
  } catch (error) {
    console.error("Error transferring funds:", error);
    return NextResponse.json({ error: "Gagal memproses transfer dana" }, { status: 500 });
  }
}
