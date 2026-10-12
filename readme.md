# Kodeva — Platform SaaS & Mini Marketplace

> Dokumen Pengajuan Technical Assessment untuk **PT Digital Solusi Grup**
>
> Dibangun menggunakan Next.js 14 App Router, TypeScript, Tailwind CSS, Sanity CMS, Zustand, dan Jest.

## 📌 Ringkasan Project

**Kodeva** adalah platform terintegrasi yang menggabungkan halaman **Landing Page** marketing berkinerja tinggi, **Blog** dinamis, serta **Mini Marketplace** interaktif untuk produk lisensi perangkat lunak bisnis (seperti aplikasi kasir POS, HR & Payroll, Akuntansi, dll.).

Platform ini dirancang dengan pendekatan **mobile-first** yang dioptimalkan untuk kampanye iklan digital (iklan Instagram/TikTok), menghadirkan waktu muat cepat, tag SEO/OpenGraph otomatis, validasi kuota lisensi promo yang ketat, pelacakan atribusi UTM, serta dasbor CMS tersemat untuk tim internal.

---

## ⏱️ 1. Waktu Pengerjaan Sebenarnya

Total estimasi waktu pengerjaan aktual: **± 7 Jam** (Terdistribusi dalam siklus pengembangan berikut):

| Fase | Tugas / Hasil Kerja | Waktu yang Dihabiskan |
| :--- | :--- | :--- |
| **Fase 1: Arsitektur & Setup** | Inisialisasi project, struktur folder, konfigurasi TypeScript, dan Tailwind CSS | ± 0.5 Jam |
| **Fase 2: Headless CMS (Sanity)** | Konfigurasi Sanity Studio, pemodelan skema (Landing Page, Blog, FAQ, Testimonial) | ± 1.0 Jam |
| **Fase 3: Komponen Reusable UI** | Desain responsif mobile-first yang aksesibel (Product Card, Lead Form, Variant Selectors) | ± 1.5 Jam |
| **Fase 4: State Cart & Business Logic** | Zustand store, validasi kuota promo kumulatif produk, kalkulasi diskon/subtotal | ± 1.5 Jam |
| **Fase 5: Marketing & Analytics** | Ekstraksi parameter UTM, persistensi session storage, integrasi GA4 DataLayer | ± 0.5 Jam |
| **Fase 6: Testing & Optimasi** | Unit test Jest untuk logika kuota & harga, optimasi Lighthouse Mobile | ± 1.0 Jam |
| **Fase 7: Dokumentasi** | Penyusunan README komprehensif, catatan arsitektur, dan blueprint integrasi backend | ± 1.0 Jam |

---

## 🚀 2. Cara Menjalankan Project di Lokal

### Prasyarat Sistem
* **Node.js**: Versi `18.x` atau lebih tinggi
* **npm**: Versi `9.x` atau lebih tinggi (atau menggunakan `pnpm` / `yarn`)

### Langkah-langkah Instalasi:

1. **Clone Repository & Masuk ke Direktori:**
   ```bash
   git clone https://github.com/bangkitwira16/kodeva
   cd kodeva
   npm install
   ```

2. **Konfigurasi Environment Variables:**
   Buat file `.env.local` pada direktori root project, lalu tambahkan konfigurasi berikut:
   ```env
   # Konfigurasi Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=project_id_sanity_anda
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_READ_TOKEN=token_akses_read_sanity_anda

   # Webhook untuk store data lead form
   LEAD_CAPTURE_WEBHOOK_URL=
   WEBHOOK_SECRET=

   # Domain Aplikasi
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # GA4 Tracking (Opsional)
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi yang berjalan.

4. **Akses Sanity Studio Tersemat:**
   CMS backend dapat diakses langsung tanpa keluar dari aplikasi pada rute:
   [http://localhost:3000/studio](http://localhost:3000/studio)

5. **Menjalankan Unit Testing Otomatis:**
   ```bash
   # Menjalankan suite unit test
   npm run test

   # Menjalankan test dalam mode watch
   npm run test:watch
   ```

6. **Mengakses lead form data yang tersimpan di google spreadsheet
https://docs.google.com/spreadsheets/d/1Bnh8be2Zg0WmSZunc9DN-yF0CZl5tDowdj_NRUX0O3o/edit?usp=sharing

---

## 📐 3. Arsitektur Singkat & Alasan Memilih Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                            │
│                                                                        │
│  ┌────────────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │     Landing / Blog     │  │ Mini Marketplace │  │ Sanity Studio  │ │
│  │ (ISR / Server Comps)   │  │ (Client + Zustand│  │   (/studio)    │ │
│  └───────────┬────────────┘  └────────┬─────────┘  └────────────────┘ │
└──────────────┼────────────────────────┼────────────────────────────────┘
               │                        │
       fetch / revalidate           Local State & Storage Persistence
               ▼                        ▼
     ┌───────────────────┐    ┌───────────────────┐
     │  Sanity CDN / CMS │    │ Zustand Cart Store│
     └───────────────────┘    └───────────────────┘
```

### Pemilihan Stack Teknologi & Rasionalnya:

1. **Next.js App Router (React Server Components):**
   * **SEO & Performa Mobile:** Merender konten statis dan server-side secara instan, sangat vital untuk memangkas *First Contentful Paint* (FCP) dan *Largest Contentful Paint* (LCP) pada jaringan seluler.
   * **ISR (Incremental Static Revalidation):** Perubahan konten di Sanity CMS akan memperbarui halaman publik secara otomatis tanpa perlu melakukan *full deployment* ulang aplikasi.
2. **TypeScript:**
   * Menghilangkan potensi *runtime error* pada alur transaksi yang kompleks dan struktur payload data dari Sanity.
3. **Tailwind CSS:**
   * Menghasilkan ukuran file CSS yang sangat ringan dengan membuang kelas utility yang tidak terpakai. Menjamin tata letak responsif *mobile-first* dengan standar ukuran sentuh (*touch target* minimal 44px).
4. **Sanity CMS:**
   * Memisahkan manajemen konten dari lapisan presentasi kode (*headless*). Menyediakan Studio yang tertanam langsung di rute `/studio` bagi admin marketing.
5. **Zustand (Manajemen State dengan Middleware Persist):**
   * Alternatif yang ringan untuk manajemen state sisi klien. Menyimpan data keranjang belanja ke dalam `localStorage` agar data tetap aman saat halaman disegarkan (*refresh*).
6. **Jest & React Testing Library:**
   * Memungkinkan pengujian unit yang cepat untuk logika bisnis krusial (validasi kuota lisensi promo, perhitungan subtotal, dan kalkulasi voucher).

---

## ❓ 4. Asumsi yang Dibuat Atas Hal yang Ambigu

1. **Aturan Gabungan Kuota Lisensi Promo (Combined Quota):**
   * *Ambiguitas:* Bagaimana batasan kuota promo berlaku di antara berbagai varian paket (Basic, Pro, Business) dari produk yang sama?
   * *Asumsi:* Batasan kuota didefinisikan secara ketat **per produk**, bukan per baris varian. Jika *Produk A* memiliki sisa kuota promo sebanyak **45 lisensi**, maka akumulasi total jumlah `Basic + Pro + Business` untuk *Produk A* di dalam keranjang tidak boleh melebihi **45**.
2. **Simulasi Pembayaran / Checkout:**
   * *Ambiguitas:* Sejauh apa integrasi yang dibutuhkan untuk tahap pembayaran?
   * *Asumsi:* Disimulasikan sepenuhnya pada sisi *frontend* menggunakan transisi state (Idle $\rightarrow$ Processing $\rightarrow$ Success/Failed) tanpa memanggil API *payment gateway* eksternal, dengan tetap mempertahankan data keranjang sampai proses pembayaran berhasil diselesaikan.
3. **Persistensi Atribusi UTM:**
   * *Ambiguitas:* Berapa lama parameter kampanye iklan harus bertahan?
   * *Asumsi:* Parameter ditangkap dari query URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) saat pertama kali kunjungan dan disimpan ke dalam `sessionStorage`, memastikan atribusi terbawa hingga formulir *lead capture* dan payload pesanan.
4. **Revalidasi Cache Konten:**
   * *Ambiguitas:* Frekuensi pembaruan postingan blog dan bagian landing page.
   * *Asumsi:* Menggunakan fitur revalidasi berbasis waktu bawaan Next.js (`revalidate: 60` detik) atau mengandalkan Sanity Webhooks untuk pembersihan cache secara instan.

---

## 📊 5. Status Pengerjaan (Completion Matrix)

### ✅ Fitur Wajib (Selesai)
* [x] **Bagian A: Landing Page & Blog (Dikelola CMS)**
  * Bagian Hero, fitur, testimoni, dan FAQ yang dinamis digerakkan oleh Sanity.
  * Halaman daftar Blog yang responsif dengan navigasi pagination dan rute dinamis berbasis *slug*.
  * Formulir *lead capture* (Nama, Email/WhatsApp) lengkap dengan validasi input dan state loading.
* [x] **Bagian B: Mini Marketplace & Logika Keranjang**
  * Katalog produk (minimal 6 produk software) dengan filter kategori.
  * Halaman detail produk yang menampilkan pilihan paket (Basic, Pro, Business) yang mengubah harga secara dinamis.
  * State keranjang persisten menggunakan Zustand (tersinkronisasi dengan `localStorage`).
  * **Validasi Kuota Promo Kumulatif Ketat:** Memblokir penambahan jumlah item jika total akumulasi produk dalam keranjang melampaui sisa kuota promo.
* [x] **Bagian C: Tracking Analytics & Performa Mobile**
  * Penguraian parameter query URL otomatis untuk atribut UTM.
  * Pemanggilan *event tracking* Google Analytics 4 via `dataLayer.push()` untuk `view_item`, `add_to_cart`, dan `begin_checkout`.
  * Optimasi performa *mobile-first* yang memenuhi ambang batas skor Lighthouse.

### 🌟 Fitur Bonus (Selesai)
* [x] **Katalog:** Filter, pencarian, dan pengurutan harga (rendah ke tinggi) yang tercermin secara dinamis di URL (`useSearchParams`) sehingga tautan pencarian mudah dibagikan.
* [x] **Detail Produk:** Tombol pilihan durasi langganan (Bulanan vs Tahunan dengan kalkulasi diskon 20%) + tabel perbandingan fitur produk yang responsif.
* [x] **Logika Diskon Voucher:** Sistem kode promo sederhana yang memeriksa batas minimum subtotal belanja dan kuota penggunaan.
* [x] **Automated Testing:** Unit test menggunakan Jest yang mencakup pengujian penegakan kuota, logika harga, dan kalkulasi voucher.

### 🔮 Rencana Pengembangan (Jika Diberikan Waktu 1 Minggu Lagi)
1. **Dynamic CMS Page Builder:** Memberikan fleksibilitas bagi tim marketing untuk mengubah urutan bagian landing page, menyembunyikan/menampilkan section, atau memilih variasi layout langsung dari Sanity Studio.
2. **Penjadwalan Konten Otomatis (Scheduled Publishing):** Mengimplementasikan timer publikasi otomatis untuk banner promo musiman dari CMS.
3. **Draft & Live Preview Mode:** Mengonfigurasi *Sanity Presentation Tool / Visual Editing* agar editor konten dapat melihat pratinjau langsung sebelum dipublikasikan.
4. **End-to-End Testing:** Menambahkan suite pengujian E2E menggunakan Playwright atau Cypress untuk mengotomatisasi skenario alur checkout secara menyeluruh.

---

## 📱 6. Bagian C: Tracking Analytics & Performa Mobile

### Pelacakan Interaksi & Analytics (GA4 DataLayer)
Aplikasi ini dilengkapi dengan pelacakan event terstruktur yang memetakan perilaku pengguna ke dalam objek data standar Google Analytics 4. Setiap kali interaksi penting terjadi (seperti melihat produk, memasambahkan item ke keranjang, atau memulai proses checkout), sistem akan mengirimkan data ke global `window.dataLayer`.

**Cara Melakukan Validasi Event Tracking secara Langsung:**
Tim penilai dapat membuka **Browser Developer Tools (Console)** kapan saja selama pengujian aplikasi berlangsung, lalu menjalankan baris perintah berikut untuk melihat rekam jejak event yang telah terkirim:

```javascript
window.dataLayer?.filter((entry) => entry.event)
```
Perintah tersebut akan menampilkan array berisi seluruh event interaksi yang berhasil dicatat oleh sistem secara real-time di peramban.

### Optimasi Performa Mobile
Landing page dirancang untuk kondisi jaringan seluler yang menantang dan berhasil memenuhi standar metrik Core Web Vitals:
* Menggunakan komponen `next/image` untuk konversi format otomatis ke WebP, atribut dimensi eksplisi (mencegah *Cumulative Layout Shift* / CLS), serta atribut `priority` pada gambar utama di area *Above-the-Fold*.
* Optimasi pemuatan font menggunakan `next/font` dengan properti `display: swap`.
* Pemisahan kode (*code splitting*) untuk komponen berukuran besar menggunakan `next/dynamic`.
* Penambahan *Resource Hints* (`preconnect` dan `dns-prefetch`) ke domain CDN Sanity untuk mempercepat *Largest Contentful Paint* (LCP).

---

## 🔗 7. Rencana Integrasi Marketplace ke Backend (Production Blueprint)

Untuk meningkatkan skala aplikasi frontend ini menjadi sistem produksi yang utuh dengan layanan backend transaksional, gerbang pembayaran (*payment gateway*), dan mesin lisensi, arsitektur berikut diusulkan:

```
┌──────────────┐     1. POST /api/orders      ┌──────────────────┐     2. Reserve Quota    ┌──────────────┐
│ Next.js App  │ ───────────────────────────► │ API Gateway /    │ ──────────────────────► │ Redis Cache  │
│ (Frontend)   │                              │ Node.js Backend  │                       │ (Atomic Decr)│
└──────────────┘                              └────────┬─────────┘                       └──────────────┘
       ▲                                               │                                         │
       │                                       3. Create Payment                                 │ Rollback
       │                                               ▼                                         │ if expired
       │                                      ┌──────────────────┐                               │
       │                                      │ Payment Gateway  │                               │
       │                                      │ (Midtrans/Stripe)│                               │
       │                                      └────────┬─────────┘                               │
       │                                               │                                         │
       │ 6. Status via Webhook                         │ 4. HTTP Webhook                         │
       └───────────────────────────────────────────────┴─────────────────────────────────────────┘
                                                       │
                                               5. Payment Verified
                                                       ▼
                                              ┌──────────────────┐     7. Kirim Email     ┌──────────────┐
                                              │ Database Pesanan │ ──────────────────────► │ Layanan Email│
                                              │ & Mesin Lisensi  │                        │  (SendGrid)  │
                                              └──────────────────┘                        └──────────────┘
```

### 1. Endpoint API REST / GraphQL yang Dibutuhkan
* `GET /api/v1/products` — Mengambil katalog produk terkini beserta data sisa kuota inventaris secara akurat.
* `POST /api/v1/orders/create` — Memulai reservasi pesanan dan menghasilkan token/URL redirect pembayaran dari *payment gateway*.
* `GET /api/v1/orders/:orderId/status` — Endpoint *polling* bagi klien untuk memverifikasi status pembayaran pesanan.
* `POST /api/v1/vouchers/validate` — Validasi kode voucher secara aman di sisi server.

### 2. Alur Payment Gateway yang Aman (Midtrans / Stripe)
1. **Pembuatan Pesanan & Sesi Pembayaran:** Klien mengirim payload keranjang dan parameter UTM ke `POST /api/v1/orders/create`. Server memvalidasi harga di sisi backend, mencatat pesanan dengan status `PENDING`, meminta token transaksi ke Midtrans/Stripe, lalu mengembalikan URL pembayaran.
2. **Penanganan Notifikasi Webhook:** *Payment gateway* mengirimkan pemberitahuan asinkronus ke rute `/api/v1/payments/webhook`.
3. **Verifikasi Tanda Tangan Keamanan (HMAC Signature):** Endpoint webhook memvalidasi keaslian permintaan masuk dengan menghitung tanda tangan HMAC-SHA256 menggunakan kunci server payment gateway (`X-Signature-Key`). Permintaan yang tidak valid akan langsung ditolak (`401 Unauthorized`).
4. **State Machine Pesanan:** Transisi status pesanan mengikuti aturan ketat: `PENDING` $\rightarrow$ `PAID` / `EXPIRED` / `CANCELLED` dengan penerapan *idempotency keys* untuk mencegah pemrosesan ganda.

### 3. Menjaga Keakuratan Kuota Lisensi Promo (Control Concurrency)
Untuk mencegah masalah *race condition* saat terjadi lonjakan trafik atau flash sale:
* **Operasi Atomik Redis:** Melakukan reservasi inventaris secara atomik menggunakan perintah Redis (`DECRBY promo_quota:product_id qty`).
* **Row Locking Database:** Memanfaatkan penguncian baris transaksional pada PostgreSQL (`SELECT ... FOR UPDATE`) selama pemrosesan transaksi.
* **Worker Kedaluwarsa Reservasi:** Mengatur timer hitung mundur 15 menit untuk item yang direservasi. Jika pembayaran kedaluwarsa atau gagal, background worker (misal: BullMQ) secara otomatis mengembalikan kuota ke stok tersedia.

### 4. Pengiriman Lisensi Otomatis Setelah Pembayaran Berhasil
Ketika status pembayaran berubah menjadi `PAID`:
* **Generasi Kunci Lisensi:** Mesin lisensi menghasilkan kunci kriptografi unik atau memprovisikan akses tenant ke dalam database SaaS.
* **Pengiriman Email:** Layanan seperti SendGrid atau Postmark mengirimkan email transaksional berisi detail tanda terima, kunci lisensi, serta panduan onboarding.
* **Webhook Analytics:** Meneruskan event penyelesaian pesanan (`conversion`) beserta atribut UTM ke platform periklanan (Meta Conversions API / GA4 Measurement Protocol).

---

## 📱 8. Hasil Tangkapan Layar (Screenshot) Lighthouse Mobile

Pengujian performa pada simulasi perangkat seluler menunjukkan hasil yang melampaui target minimum:

```
======================================================
  HASIL AUDIT LIGHTHOUSE MOBILE (Target: >= 80)
======================================================
  [✓] Performance (Performa):  100 / 100
  [✓] Accessibility (Akses):   100 / 100
  [✓] Best Practices:          96 / 100
  [✓] SEO:                     100 / 100
======================================================
```

*(Catatan: Tautan gambar tangkapan layar hasil audit Google Chrome DevTools terlampir pada direktori aset project)*

`![Lighthouse Mobile Score](./public/screenshots/lighthouse-mobile.png)`

---
*Disusun untuk Penilaian Technical Test PT Digital Solusi Grup.*