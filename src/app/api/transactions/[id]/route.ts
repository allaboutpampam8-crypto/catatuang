import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { amount, type, date, notes, accountId, categoryId } = body;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        type: type !== undefined ? type : undefined,
        date: date ? new Date(date) : undefined,
        notes: notes !== undefined ? notes : undefined,
        accountId: accountId !== undefined ? accountId : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json({ error: "Gagal memperbarui transaksi" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Transaksi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}
