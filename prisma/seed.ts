import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial data...");

  // Check if categories already exist
  const existingCategories = await prisma.category.count();
  if (existingCategories > 0) {
    console.log("Categories already exist. Skipping category seeding.");
  } else {
    // 1. Seed Accounts
    const cash = await prisma.account.create({
      data: {
        name: "Dompet Tunai",
        type: "cash",
        initialBalance: 500000,
        color: "#10b981",
      },
    });

    const bca = await prisma.account.create({
      data: {
        name: "Bank BCA",
        type: "bank",
        initialBalance: 5000000,
        color: "#3b82f6",
      },
    });

    const gopay = await prisma.account.create({
      data: {
        name: "E-Wallet (GoPay)",
        type: "ewallet",
        initialBalance: 250000,
        color: "#06b6d4",
      },
    });

    // 2. Seed Income Categories
    const catSalary = await prisma.category.create({
      data: { name: "Gaji Pokok", type: "income", icon: "Briefcase", color: "#10b981" },
    });
    const catFreelance = await prisma.category.create({
      data: { name: "Freelance / Side Project", type: "income", icon: "Laptop", color: "#06b6d4" },
    });
    const catBonus = await prisma.category.create({
      data: { name: "Bonus & Tunjangan", type: "income", icon: "Gift", color: "#8b5cf6" },
    });
    const catOtherIncome = await prisma.category.create({
      data: { name: "Pemasukan Lainnya", type: "income", icon: "PlusCircle", color: "#64748b" },
    });

    // 3. Seed Expense Categories
    const catFood = await prisma.category.create({
      data: { name: "Makanan & Minuman", type: "expense", icon: "Utensils", color: "#f97316" },
    });
    const catTransport = await prisma.category.create({
      data: { name: "Transportasi & Bensin", type: "expense", icon: "Car", color: "#eab308" },
    });
    const catBills = await prisma.category.create({
      data: { name: "Tagihan & Listrik / Wifi", type: "expense", icon: "Zap", color: "#ef4444" },
    });
    const catShopping = await prisma.category.create({
      data: { name: "Belanja & Kebutuhan", type: "expense", icon: "ShoppingBag", color: "#ec4899" },
    });
    const catEntertainment = await prisma.category.create({
      data: { name: "Hiburan & Hobi", type: "expense", icon: "Gamepad2", color: "#a855f7" },
    });
    const catHealth = await prisma.category.create({
      data: { name: "Kesehatan & Obat", type: "expense", icon: "HeartPulse", color: "#14b8a6" },
    });
    const catOtherExpense = await prisma.category.create({
      data: { name: "Pengeluaran Lainnya", type: "expense", icon: "HelpCircle", color: "#94a3b8" },
    });

    // 4. Sample Transactions for Current Month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    await prisma.transaction.createMany({
      data: [
        {
          amount: 8500000,
          type: "income",
          date: new Date(currentYear, currentMonth, 1, 9, 0),
          notes: "Gaji Bulanan",
          accountId: bca.id,
          categoryId: catSalary.id,
        },
        {
          amount: 1500000,
          type: "income",
          date: new Date(currentYear, currentMonth, 5, 14, 0),
          notes: "Proyek Web Landing Page",
          accountId: bca.id,
          categoryId: catFreelance.id,
        },
        {
          amount: 450000,
          type: "expense",
          date: new Date(currentYear, currentMonth, 2, 10, 30),
          notes: "Tagihan Listrik PLN & Internet",
          accountId: bca.id,
          categoryId: catBills.id,
        },
        {
          amount: 85000,
          type: "expense",
          date: new Date(currentYear, currentMonth, 3, 12, 15),
          notes: "Makan Siang Nasi Padang",
          accountId: cash.id,
          categoryId: catFood.id,
        },
        {
          amount: 250000,
          type: "expense",
          date: new Date(currentYear, currentMonth, 4, 18, 0),
          notes: "Isi Bensin Motor & Mobil",
          accountId: cash.id,
          categoryId: catTransport.id,
        },
        {
          amount: 320000,
          type: "expense",
          date: new Date(currentYear, currentMonth, 6, 16, 20),
          notes: "Belanja Mingguan Supermarket",
          accountId: bca.id,
          categoryId: catShopping.id,
        },
        {
          amount: 120000,
          type: "expense",
          date: new Date(currentYear, currentMonth, 8, 19, 45),
          notes: "Nonton Bioskop & Kopi",
          accountId: gopay.id,
          categoryId: catEntertainment.id,
        },
      ],
    });

    // 5. Sample Budget for Current Month
    await prisma.budget.createMany({
      data: [
        {
          categoryId: catFood.id,
          month: currentMonth + 1,
          year: currentYear,
          amount: 2500000,
        },
        {
          categoryId: catTransport.id,
          month: currentMonth + 1,
          year: currentYear,
          amount: 800000,
        },
        {
          categoryId: catBills.id,
          month: currentMonth + 1,
          year: currentYear,
          amount: 600000,
        },
        {
          categoryId: catShopping.id,
          month: currentMonth + 1,
          year: currentYear,
          amount: 1500000,
        },
      ],
    });

    console.log("Database seeded successfully with initial accounts, categories, and sample transactions!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
