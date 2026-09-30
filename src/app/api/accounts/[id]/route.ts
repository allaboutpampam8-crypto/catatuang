import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, type, initialBalance, color } = body;

    const account = await prisma.account.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        type: type !== undefined ? type : undefined,
        initialBalance: initialBalance !== undefined ? parseFloat(initialBalance) : undefined,
        color: color !== undefined ? color : undefined,
      },
    });

    return NextResponse.json({ account });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json({ error: "Gagal memperbarui akun" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Akun berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Gagal menghapus akun" }, { status: 500 });
  }
}
