# AI Log - Bantuan AI (GitHub Copilot & Gemini)

Dokumen ini mencatat riwayat penggunaan AI Assistant selama proses pengerjaan Technical Assessment Kodeva (PT Digital Solusi Grup).

---

## 📑 Ringkasan Penggunaan AI

AI digunakan sebagai mitra akselerasi pengembangan untuk:

1. Merancang arsitektur folder dan skema data Sanity CMS.
2. Menggenerat komponen UI dasar (_reusable components_) dengan Tailwind CSS & TypeScript.
3. Menyusun logika Zustand store untuk validasi akumulasi kuota lisensi promo dan keranjang.
4. Mengoptimasi skor Lighthouse Mobile (LCP, dynamic import, next/image).
5. Mengimplementasikan fitur bonus (URL Filter, Billing Toggle, Tabel Komparasi, dan Voucher).
6. Menggenerat file pengujian otomatis (_unit tests_) menggunakan Jest/Vitest.

---

## 💬 Prompt Kunci yang Digunakan

### 1. Setup Arsitektur & Sanity CMS

> "Create a modular Next.js App Router project structure integrated with embedded Sanity Studio at `/studio`..."

### 2. Komponen Reusable UI

> "Create a set of reusable, fully accessible TypeScript React components using Tailwind CSS: Product Card with license quota, Lead Capture Form, and Cart Item Row..."

### 3. Logika Kuota Promo (Zustand Store)

> "Implement a Zustand store managing cart state where license quota limits apply cumulatively across all package variants of the same product..."

### 4. Optimasi Lighthouse Mobile

> "Optimize Next.js page component for mobile performance to achieve Lighthouse score >= 80 using next/image priority, dynamic imports, and responsive layouts..."

### 5. Fitur Bonus (SaaS Billing, Filter Catalog, & Voucher System)

> "Enhance the marketplace and checkout experience by implementing:
>
> 1. URL-synchronized catalog filtering, search, and price sorting using `useSearchParams`.
> 2. Product Detail billing toggle (Monthly vs. Annual with dynamic discount) and tier feature comparison table.
> 3. Promo voucher code validation system supporting minimum spend logic and usage quota limits."

### 6. Unit Testing (Pengujian Otomatis)

> "Write Jest unit tests for core business logic: combined promo license quota validation, subtotal calculations, and voucher code validation..."

---

## 🔍 Refleksi & Evaluasi Penggunaan AI

### 1. Minimal 2 Kasus Ketika AI Memberi Jawaban/Implementasi yang Salah atau Less-Optimal

#### Kasus 1: Validasi Kuota Promo Keranjang (Terhitung Per Baris Item, Bukan Akumulatif Produk)

- **Masalah yang Dihasilkan AI:** Saat pertama kali diminta menggenerate Zustand store untuk keranjang, AI membuat logika validasi batas kuota promo secara terpisah untuk setiap varian (`item.variantId`). Hal ini menyebabkan pengguna bisa membeli 10 unit paket _Basic_ dan 10 unit paket _Pro_ dari produk yang sama, meskipun batas sisa kuota promo produk tersebut secara keseluruhan hanya 15.
- **Cara Menemukan:** Masalah ditemukan saat melakukan _manual testing_ pada skenario penambahan beberapa varian paket dari produk yang sama ke dalam keranjang.
- **Cara Memperbaiki:** Menulis ulang fungsi `addToCart` dan `updateQuantity` di Zustand store agar melakukan kalkulasi total akumulasi seluruh lisensi produk yang sama (`item.productId`) di dalam keranjang sebelum membandingkannya dengan `product.promoQuota`.
- **Verifikasi:** Diverifikasi melalui _unit test_ Jest (`useCartStore.test.ts`) dengan kasus penambahan varian _Basic_, _Pro_, dan _Business_ hingga melampaui kuota, serta memastikan sistem memunculkan pesan _error_ sesuai ekspektasi.

#### Kasus 2: Penurunan Skor Lighthouse Mobile Akibat Client-Side Hydration & Image Layout Shift

- **Masalah yang Dihasilkan AI:** AI meng-generate komponen hero landing page dan thumbnail katalog menggunakan tag HTML `<img>` biasa tanpa atribut `width`/`height` eksplisit, serta mengimpor komponen Sanity Studio langsung secara sinkron. Hal ini menyebabkan _Cumulative Layout Shift_ (CLS) tinggi dan skor Lighthouse Mobile berada di bawah 80.
- **Cara Menemukan:** Ditemukan saat menjalankan audit Google Lighthouse pada mode _Emulated Mobile_ (Moto G4 / throttling jaringan).
- **Cara Memperbaiki:** Mengganti seluruh tag `<img>` menjadi `next/image` dengan properti `priority` untuk gambar _above-the-fold_, menambahkan `sizes` responsif, serta memisahkan impor komponen berat menggunakan `next/dynamic` (`ssr: false`).
- **Verifikasi:** Diverifikasi dengan menjalankan ulang audit Lighthouse Mobile hingga mencapai skor LCP dan Performance $\ge 80$.

---

### 2. Implementasi yang Banyak Dibantu AI & Edge Cases yang Diuji

- **Bagian Implementasi:**
  Pembuatan **Unit Test Suite (Jest/Vitest)** dan **Sistem Validasi Kode Voucher Diskon** (termasuk syarat _minimum spend_ dan pembatasan kuota pemakaian).

- **Edge Cases yang Diuji untuk Memastikan Kebenaran Kode:**
  1. **Combined Promo Quota Edge Case:** Menguji penambahan lisensi saat sisa kuota tinggal 1, lalu mencoba menambah 2 unit dari varian berbeda secara bersamaan.
  2. **Voucher Minimum Spend Edge Case:** Menguji aplikasi kode voucher saat subtotal berada pas di batas minimum belanja (misal Rp 500.000 vs Rp 499.999).
  3. **Empty & Boundary Cart Edge Cases:** Mengubah kuantitas item menjadi `0` (harus otomatis menghapus item dari keranjang) atau nilai negatif (harus diabaikan/ditolak oleh store).
  4. **Persistence Refresh Edge Case:** Melakukan _simulated page refresh_ untuk memastikan keranjang dan status voucher tetap tersimpan di `localStorage`.

---

### 3. Bagian yang Sengaja Ditulis Sendiri Tanpa AI & Alasannya

- **Bagian yang Ditulis Sendiri:**
  Penulisan **Logika Akumulasi Kuota Lisensi Promo Multi-Varian** di `store/useCartStore.ts` dan **Pemetaan Skema Data Sanity ke TypeScript Interfaces**.

- **Alasan:**
  1. **Akurasi Aturan Bisnis Spesifik:** AI cenderung memberikan pola keranjang e-commerce standar (per baris item). Karena aturan kuota promo pada brief teknis Kodeva memiliki batasan akumulatif spesifik per produk, menulis logika ini secara manual jauh lebih aman dan efisien daripada melakukan beberapa kali _prompt debugging_.
  2. **Kesesuaian Tipe Data (Type Safety):** Memastikan _type-definition_ antara respon Sanity CMS (GROQ queries) dan state React berjalan dengan _strict TypeScript compliance_ tanpa adanya pengunaan tipe `any`.
