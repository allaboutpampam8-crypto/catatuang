# CatatUang - Aplikasi Pencatat Keuangan Pribadi Bulanan

Aplikasi website modern, cepat, dan responsif untuk mencatat pemasukan dan pengeluaran setiap bulan, memantau batas anggaran (*budgeting*), visualisasi grafik arus kas, serta mengelola saldo dompet/rekening secara pribadi.

---

## 🚀 Fitur Utama

1. **Dashboard Rekap Bulanan**:
   - Total Pemasukan & Pengeluaran bulan berjalan.
   - Arus Kas Bersih (*Net Savings* / Surplus / Defisit).
   - Persentase perbandingan dengan bulan sebelumnya.
   - Total saldo akumulasi seluruh dompet & rekening bank aktif.
2. **Visualisasi Interaktif**:
   - *Donut Chart*: Distribusi persentase pengeluaran berdasarkan kategori.
   - *Bar Chart*: Tren perbandingan pemasukan vs pengeluaran harian sepanjang bulan.
3. **Pencatatan Transaksi Cepat**:
   - Catat pemasukan (*income*) atau pengeluaran (*expense*).
   - Dukungan nominal Rupiah otomatis, tanggal transaksi, dompet/rekening, kategori, dan catatan.
4. **Riwayat & Filter Transaksi**:
   - Pencarian real-time berdasarkan kata kunci catatan/kategori.
   - Filter berdasarkan tipe transaksi, kategori, dan dompet.
   - Aksi Edit dan Hapus transaksi.
   - **Ekspor CSV**: Unduh data transaksi per bulan dengan 1 klik.
5. **Target Anggaran Bulanan (*Budgeting*)**:
   - Tetapkan batas belanja per kategori untuk bulan berjalan.
   - *Progress bar* status pemakaian:
     - 🟢 Hijau (< 80%)
     - 🟡 Kuning (80% - 99%)
     - 🔴 Merah (Melebihi budget / *Over budget*)
6. **Manajemen Dompet & Rekening**:
   - Pisahkan dana di Tunai/Dompet Fisik, Rekening Bank (BCA, Mandiri, dll.), dan E-Wallet (GoPay, OVO, ShopeePay).
   - Saldo terkalkulasi otomatis secara real-time.
7. **Kustomisasi Kategori**:
   - Tambah kategori baru dengan beragam pilihan ikon (*Lucide Icons*) dan warna label kustom.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Visualisasi Grafik**: [Recharts](https://recharts.org/)
- **Database**: SQLite (disimpan lokal di `prisma/dev.db`)
- **ORM**: [Prisma ORM](https://www.prisma.io/)

---

## 📦 Cara Menjalankan Aplikasi

### 1. Menjalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

### 2. Menjalankan Mode Production
```bash
npm run build
npm run start
```

### 3. Mengelola Database (Opsional)
Jika ingin melihat dan mengedit data langsung lewat UI Prisma Studio:
```bash
npx prisma studio
```
Jika ingin mereset atau mengisi ulang data awal (seed):
```bash
npx tsx prisma/seed.ts
```

---

## 📄 Dokumentasi PRD
Spesifikasi lengkap kebutuhan produk dapat dilihat pada file [PRD.md](PRD.md).
