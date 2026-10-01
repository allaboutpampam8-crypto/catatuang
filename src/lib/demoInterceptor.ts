import {
  getDemoStore,
  setDemoStore,
  calculateDemoSummary,
  DemoTransaction,
  DemoCategory,
  DemoAccount,
  DemoBudget,
} from "./demoStore";

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function generateId(prefix = "demo") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function setupDemoFetchInterceptor(): () => void {
  if (typeof window === "undefined") return () => {};

  const originalFetch = window.fetch;

  window.fetch = async function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    // Only intercept local /api/ requests
    if (!urlStr.includes("/api/")) {
      return originalFetch(input, init);
    }

    try {
      const urlObj = new URL(urlStr, window.location.origin);
      const pathname = urlObj.pathname;
      const method = (init?.method || "GET").toUpperCase();
      const body = init?.body ? JSON.parse(init.body as string) : null;

      // 1. /api/summary
      if (pathname === "/api/summary" && method === "GET") {
        const now = new Date();
        const month = parseInt(urlObj.searchParams.get("month") || `${now.getMonth() + 1}`, 10);
        const year = parseInt(urlObj.searchParams.get("year") || `${now.getFullYear()}`, 10);
        const summary = calculateDemoSummary(month, year);
        return jsonResponse(summary);
      }

      // 2. /api/transactions
      if (pathname === "/api/transactions") {
        const store = getDemoStore();
        if (method === "GET") {
          const month = urlObj.searchParams.get("month");
          const year = urlObj.searchParams.get("year");
          const catMap = new Map(store.categories.map((c) => [c.id, c]));
          const accMap = new Map(store.accounts.map((a) => [a.id, a]));

          let list = [...store.transactions];
          if (month && year) {
            const m = parseInt(month, 10);
            const y = parseInt(year, 10);
            const start = new Date(y, m - 1, 1, 0, 0, 0);
            const end = new Date(y, m, 0, 23, 59, 59, 999);
            list = list.filter((t) => {
              const td = new Date(t.date);
              return td >= start && td <= end;
            });
          }

          list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          const populated = list.map((t) => ({
            ...t,
            category: t.categoryId ? catMap.get(t.categoryId) || null : null,
            account: t.accountId ? accMap.get(t.accountId) || null : null,
          }));

          return jsonResponse({ transactions: populated });
        }

        if (method === "POST" && body) {
          const newTx: DemoTransaction = {
            id: generateId("tx"),
            amount: parseFloat(body.amount),
            type: body.type,
            date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
            notes: body.notes || "",
            accountId: body.accountId || null,
            categoryId: body.categoryId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          store.transactions.unshift(newTx);
          setDemoStore(store);

          const catMap = new Map(store.categories.map((c) => [c.id, c]));
          const accMap = new Map(store.accounts.map((a) => [a.id, a]));

          return jsonResponse(
            {
              transaction: {
                ...newTx,
                category: newTx.categoryId ? catMap.get(newTx.categoryId) || null : null,
                account: newTx.accountId ? accMap.get(newTx.accountId) || null : null,
              },
            },
            201
          );
        }
      }

      // 3. /api/transactions/:id
      const txMatch = pathname.match(/^\/api\/transactions\/([^/]+)$/);
      if (txMatch) {
        const id = txMatch[1];
        const store = getDemoStore();

        if (method === "DELETE") {
          store.transactions = store.transactions.filter((t) => t.id !== id);
          setDemoStore(store);
          return jsonResponse({ success: true, message: "Transaksi berhasil dihapus" });
        }

        if (method === "PUT" && body) {
          const idx = store.transactions.findIndex((t) => t.id === id);
          if (idx !== -1) {
            store.transactions[idx] = {
              ...store.transactions[idx],
              amount: body.amount !== undefined ? parseFloat(body.amount) : store.transactions[idx].amount,
              type: body.type !== undefined ? body.type : store.transactions[idx].type,
              date: body.date ? new Date(body.date).toISOString() : store.transactions[idx].date,
              notes: body.notes !== undefined ? body.notes : store.transactions[idx].notes,
              accountId: body.accountId !== undefined ? body.accountId : store.transactions[idx].accountId,
              categoryId: body.categoryId !== undefined ? body.categoryId : store.transactions[idx].categoryId,
              updatedAt: new Date().toISOString(),
            };
            setDemoStore(store);
            return jsonResponse({ transaction: store.transactions[idx] });
          }
          return jsonResponse({ error: "Transaksi tidak ditemukan" }, 404);
        }
      }

      // 4. /api/categories
      if (pathname === "/api/categories") {
        const store = getDemoStore();
        if (method === "GET") {
          return jsonResponse({ categories: store.categories });
        }
        if (method === "POST" && body) {
          const newCat: DemoCategory = {
            id: generateId("cat"),
            name: body.name.trim(),
            type: body.type,
            icon: body.icon || "Tag",
            color: body.color || "#64748b",
            createdAt: new Date().toISOString(),
          };
          store.categories.push(newCat);
          setDemoStore(store);
          return jsonResponse({ category: newCat }, 201);
        }
      }

      // 5. /api/categories/:id
      const catMatch = pathname.match(/^\/api\/categories\/([^/]+)$/);
      if (catMatch) {
        const id = catMatch[1];
        const store = getDemoStore();

        if (method === "DELETE") {
          store.categories = store.categories.filter((c) => c.id !== id);
          // Set null on transactions with this category
          store.transactions.forEach((t) => {
            if (t.categoryId === id) t.categoryId = null;
          });
          store.budgets = store.budgets.filter((b) => b.categoryId !== id);
          setDemoStore(store);
          return jsonResponse({ success: true, message: "Kategori berhasil dihapus" });
        }

        if (method === "PUT" && body) {
          const idx = store.categories.findIndex((c) => c.id === id);
          if (idx !== -1) {
            store.categories[idx] = {
              ...store.categories[idx],
              name: body.name !== undefined ? body.name.trim() : store.categories[idx].name,
              type: body.type !== undefined ? body.type : store.categories[idx].type,
              icon: body.icon !== undefined ? body.icon : store.categories[idx].icon,
              color: body.color !== undefined ? body.color : store.categories[idx].color,
            };
            setDemoStore(store);
            return jsonResponse({ category: store.categories[idx] });
          }
          return jsonResponse({ error: "Kategori tidak ditemukan" }, 404);
        }
      }

      // 6. /api/accounts
      if (pathname === "/api/accounts") {
        const store = getDemoStore();
        if (method === "GET") {
          const accountBalanceMap: Record<string, number> = {};
          store.accounts.forEach((acc) => {
            accountBalanceMap[acc.id] = acc.initialBalance;
          });
          store.transactions.forEach((tx) => {
            if (tx.accountId && accountBalanceMap[tx.accountId] !== undefined) {
              if (tx.type === "income") accountBalanceMap[tx.accountId] += tx.amount;
              else accountBalanceMap[tx.accountId] -= tx.amount;
            }
          });
          const accountsWithBalance = store.accounts.map((acc) => ({
            ...acc,
            currentBalance: accountBalanceMap[acc.id] ?? acc.initialBalance,
          }));
          return jsonResponse({ accounts: accountsWithBalance });
        }

        if (method === "POST" && body) {
          const newAcc: DemoAccount = {
            id: generateId("acc"),
            name: body.name.trim(),
            type: body.type || "bank",
            initialBalance: parseFloat(body.initialBalance) || 0,
            color: body.color || "#3b82f6",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          store.accounts.push(newAcc);
          setDemoStore(store);
          return jsonResponse({ account: { ...newAcc, currentBalance: newAcc.initialBalance } }, 201);
        }
      }

      // 7. /api/accounts/:id
      const accMatch = pathname.match(/^\/api\/accounts\/([^/]+)$/);
      if (accMatch) {
        const id = accMatch[1];
        const store = getDemoStore();

        if (method === "DELETE") {
          store.accounts = store.accounts.filter((a) => a.id !== id);
          store.transactions.forEach((t) => {
            if (t.accountId === id) t.accountId = null;
          });
          setDemoStore(store);
          return jsonResponse({ success: true, message: "Akun berhasil dihapus" });
        }

        if (method === "PUT" && body) {
          const idx = store.accounts.findIndex((a) => a.id === id);
          if (idx !== -1) {
            store.accounts[idx] = {
              ...store.accounts[idx],
              name: body.name !== undefined ? body.name.trim() : store.accounts[idx].name,
              type: body.type !== undefined ? body.type : store.accounts[idx].type,
              initialBalance:
                body.initialBalance !== undefined
                  ? parseFloat(body.initialBalance)
                  : store.accounts[idx].initialBalance,
              color: body.color !== undefined ? body.color : store.accounts[idx].color,
              updatedAt: new Date().toISOString(),
            };
            setDemoStore(store);
            return jsonResponse({ account: store.accounts[idx] });
          }
          return jsonResponse({ error: "Akun tidak ditemukan" }, 404);
        }
      }

      // 8. /api/transfer
      if (pathname === "/api/transfer" && method === "POST" && body) {
        const store = getDemoStore();
        const { fromAccountId, toAccountId, amount, date, notes } = body;
        const fromAccount = store.accounts.find((a) => a.id === fromAccountId);
        const toAccount = store.accounts.find((a) => a.id === toAccountId);

        if (!fromAccount || !toAccount) {
          return jsonResponse({ error: "Akun tidak ditemukan" }, 404);
        }

        let expenseTransferCat = store.categories.find((c) => c.name === "Transfer Keluar" && c.type === "expense");
        if (!expenseTransferCat) {
          expenseTransferCat = {
            id: generateId("cat"),
            name: "Transfer Keluar",
            type: "expense",
            icon: "ArrowRightLeft",
            color: "#64748b",
            createdAt: new Date().toISOString(),
          };
          store.categories.push(expenseTransferCat);
        }

        let incomeTransferCat = store.categories.find((c) => c.name === "Transfer Masuk" && c.type === "income");
        if (!incomeTransferCat) {
          incomeTransferCat = {
            id: generateId("cat"),
            name: "Transfer Masuk",
            type: "income",
            icon: "ArrowRightLeft",
            color: "#64748b",
            createdAt: new Date().toISOString(),
          };
          store.categories.push(incomeTransferCat);
        }

        const txDate = date ? new Date(date).toISOString() : new Date().toISOString();
        const transferNotes = notes?.trim() ? ` (${notes.trim()})` : "";
        const numAmount = parseFloat(amount);

        const outTx: DemoTransaction = {
          id: generateId("tx"),
          amount: numAmount,
          type: "expense",
          date: txDate,
          notes: `Transfer ke ${toAccount.name}${transferNotes}`,
          accountId: fromAccountId,
          categoryId: expenseTransferCat.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const inTx: DemoTransaction = {
          id: generateId("tx"),
          amount: numAmount,
          type: "income",
          date: txDate,
          notes: `Transfer dari ${fromAccount.name}${transferNotes}`,
          accountId: toAccountId,
          categoryId: incomeTransferCat.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        store.transactions.unshift(outTx);
        store.transactions.unshift(inTx);
        setDemoStore(store);

        return jsonResponse({
          success: true,
          message: `Berhasil mentransfer Rp ${numAmount.toLocaleString("id-ID")} dari ${fromAccount.name} ke ${toAccount.name}`,
        });
      }

      // 9. /api/budgets
      if (pathname === "/api/budgets") {
        const store = getDemoStore();
        if (method === "GET") {
          const now = new Date();
          const month = parseInt(urlObj.searchParams.get("month") || `${now.getMonth() + 1}`, 10);
          const year = parseInt(urlObj.searchParams.get("year") || `${now.getFullYear()}`, 10);

          const budgets = store.budgets.filter((b) => b.month === month && b.year === year);
          const catMap = new Map(store.categories.map((c) => [c.id, c]));

          const start = new Date(year, month - 1, 1, 0, 0, 0);
          const end = new Date(year, month, 0, 23, 59, 59, 999);
          const expenseMap: Record<string, number> = {};

          store.transactions
            .filter((t) => t.type === "expense" && new Date(t.date) >= start && new Date(t.date) <= end)
            .forEach((t) => {
              if (t.categoryId) {
                expenseMap[t.categoryId] = (expenseMap[t.categoryId] || 0) + t.amount;
              }
            });

          const result = budgets.map((b) => {
            const spent = expenseMap[b.categoryId] || 0;
            return {
              ...b,
              category: catMap.get(b.categoryId) || null,
              spent,
              remaining: b.amount - spent,
              percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
            };
          });

          return jsonResponse({ budgets: result });
        }

        if (method === "POST" && body) {
          const { categoryId, month, year, amount } = body;
          const m = parseInt(month, 10);
          const y = parseInt(year, 10);
          const numAmount = parseFloat(amount);

          const existingIdx = store.budgets.findIndex(
            (b) => b.categoryId === categoryId && b.month === m && b.year === y
          );

          if (existingIdx !== -1) {
            store.budgets[existingIdx].amount = numAmount;
            store.budgets[existingIdx].updatedAt = new Date().toISOString();
          } else {
            store.budgets.push({
              id: generateId("bg"),
              categoryId,
              month: m,
              year: y,
              amount: numAmount,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
          setDemoStore(store);
          return jsonResponse({ success: true });
        }

        if (method === "DELETE") {
          const id = urlObj.searchParams.get("id");
          if (id) {
            store.budgets = store.budgets.filter((b) => b.id !== id);
            setDemoStore(store);
            return jsonResponse({ success: true });
          }
        }
      }

      // 10. /api/export
      if (pathname === "/api/export" && method === "GET") {
        const store = getDemoStore();
        const month = urlObj.searchParams.get("month");
        const year = urlObj.searchParams.get("year");
        const catMap = new Map(store.categories.map((c) => [c.id, c]));
        const accMap = new Map(store.accounts.map((a) => [a.id, a]));

        let list = [...store.transactions];
        if (month && year) {
          const m = parseInt(month, 10);
          const y = parseInt(year, 10);
          const start = new Date(y, m - 1, 1, 0, 0, 0);
          const end = new Date(y, m, 0, 23, 59, 59, 999);
          list = list.filter((t) => {
            const td = new Date(t.date);
            return td >= start && td <= end;
          });
        }
        list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const header = ["ID", "Tanggal", "Tipe", "Kategori", "Akun / Dompet", "Nominal (IDR)", "Catatan"];
        const rows = list.map((t) => [
          `"${t.id}"`,
          `"${new Date(t.date).toISOString().split("T")[0]}"`,
          `"${t.type === "income" ? "Pemasukan" : "Pengeluaran"}"`,
          `"${catMap.get(t.categoryId || "")?.name || "-"}"`,
          `"${accMap.get(t.accountId || "")?.name || "-"}"`,
          t.amount,
          `"${(t.notes || "").replace(/"/g, '""')}"`,
        ]);

        const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

        return new Response(csvContent, {
          status: 200,
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="demo-transaksi-${year || "semua"}-${month || "semua"}.csv"`,
          },
        });
      }

      // Fallback
      return originalFetch(input, init);
    } catch (err) {
      console.error("[Demo Interceptor Error]:", err);
      return jsonResponse({ error: "Demo error" }, 500);
    }
  };

  return () => {
    window.fetch = originalFetch;
  };
}
