import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, icon, color } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    if (!type || (type !== "income" && type !== "expense")) {
      return NextResponse.json({ error: "Tipe kategori harus income atau expense" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        type,
        icon: icon || "Tag",
        color: color || (type === "income" ? "#10b981" : "#ef4444"),
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}
