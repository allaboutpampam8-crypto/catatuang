import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || `${now.getMonth() + 1}`, 10);
    const year = parseInt(searchParams.get("year") || `${now.getFullYear()}`, 10);

    // Current month boundaries
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Previous month boundaries
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth() + 1;
    const prevStartDate = new Date(prevYear, prevMonth - 1, 1, 0, 0, 0);
    const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    // 1. Transactions for current month
    const currentTx = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: "asc" },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategoryMap: Record<string, { name: string; amount: number; color: string; icon: string }> = {};
    const incomeByCategoryMap: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

    // Grouping for daily trend
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyTrendMap: Record<number, { day: number; income: number; expense: number }> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      dailyTrendMap[i] = { day: i, income: 0, expense: 0 };
    }

    currentTx.forEach((tx) => {
      const day = new Date(tx.date).getDate();
      if (tx.type === "income") {
        totalIncome += tx.amount;
        if (dailyTrendMap[day]) dailyTrendMap[day].income += tx.amount;
        if (tx.category) {
          if (!incomeByCategoryMap[tx.category.id]) {
            incomeByCategoryMap[tx.category.id] = {
              name: tx.category.name,
              amount: 0,
              color: tx.category.color || "#10b981",
              icon: tx.category.icon || "Tag",
            };
          }
          incomeByCategoryMap[tx.category.id].amount += tx.amount;
        }
      } else {
        totalExpense += tx.amount;
        if (dailyTrendMap[day]) dailyTrendMap[day].expense += tx.amount;
        if (tx.category) {
          if (!expenseByCategoryMap[tx.category.id]) {
            expenseByCategoryMap[tx.category.id] = {
              name: tx.category.name,
              amount: 0,
              color: tx.category.color || "#ef4444",
              icon: tx.category.icon || "Tag",
            };
          }
          expenseByCategoryMap[tx.category.id].amount += tx.amount;
        }
      }
    });

    // 2. Previous month totals for comparison
    const prevTx = await prisma.transaction.findMany({
      where: {
        date: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
    });

    let prevIncome = 0;
    let prevExpense = 0;
    prevTx.forEach((tx) => {
      if (tx.type === "income") prevIncome += tx.amount;
      else prevExpense += tx.amount;
    });

    // 3. Budgets for this month
    const budgets = await prisma.budget.findMany({
      where: { month, year },
      include: { category: true },
    });

    const budgetStatus = budgets.map((b) => {
      const spent = expenseByCategoryMap[b.categoryId]?.amount || 0;
      const percentage = b.amount > 0 ? Math.min(Math.round((spent / b.amount) * 100), 100) : 0;
      const rawPercentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryColor: b.category.color || "#64748b",
        categoryIcon: b.category.icon || "Tag",
        budgetAmount: b.amount,
        spentAmount: spent,
        remainingAmount: b.amount - spent,
        percentage,
        isOverBudget: spent > b.amount,
        overAmount: spent > b.amount ? spent - b.amount : 0,
      };
    });

    // 4. Accounts and current balances (all-time)
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: "asc" },
    });
    const allTx = await prisma.transaction.findMany({
      select: { accountId: true, amount: true, type: true },
    });

    const accountBalanceMap: Record<string, number> = {};
    accounts.forEach((acc) => {
      accountBalanceMap[acc.id] = acc.initialBalance;
    });

    allTx.forEach((tx) => {
      if (tx.accountId && accountBalanceMap[tx.accountId] !== undefined) {
        if (tx.type === "income") {
          accountBalanceMap[tx.accountId] += tx.amount;
        } else {
          accountBalanceMap[tx.accountId] -= tx.amount;
        }
      }
    });

    const accountsWithBalance = accounts.map((acc) => ({
      ...acc,
      currentBalance: accountBalanceMap[acc.id] ?? acc.initialBalance,
    }));

    return NextResponse.json({
      month,
      year,
      summary: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        prevIncome,
        prevExpense,
        incomeChangePercent:
          prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : null,
        expenseChangePercent:
          prevExpense > 0 ? Math.round(((totalExpense - prevExpense) / prevExpense) * 100) : null,
      },
      expenseByCategory: Object.values(expenseByCategoryMap).sort((a, b) => b.amount - a.amount),
      incomeByCategory: Object.values(incomeByCategoryMap).sort((a, b) => b.amount - a.amount),
      dailyTrend: Object.values(dailyTrendMap),
      budgetStatus,
      accounts: accountsWithBalance,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    return NextResponse.json({ error: "Failed to fetch summary" }, { status: 500 });
  }
}
