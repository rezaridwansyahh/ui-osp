# osp-react

Multi-brand gym management platform (Anytime Fitness = brandId 1, Bee Active = 2, OSP admin = 3). Frontend saja — POS Backend dikelola tim lain, kami tidak bisa mengubahnya.

## Stack

React 19 + Vite 8, react-router-dom 7, Tailwind 4 (via `@tailwindcss/vite`, CSS-first, **tidak ada** `tailwind.config.js`), axios, apexcharts, lucide-react, xlsx (SheetJS).

Plain JS/JSX. **Jangan** menambahkan TypeScript.

Lingkungan dev: Windows + PowerShell. Jangan berikan perintah khusus bash.

## Struktur

```
src/
├── pages/         # 11 halaman, route di App.jsx
├── components/    # auth, layout, ui
├── contexts/      # AuthContext.jsx (provider) — context object-nya sendiri
│                    ada di AuthContextObject.js biar Fast Refresh gak rusak
├── services/      # SEMUA panggilan API lewat sini
├── hooks/         # useAuth.js — import useAuth DARI SINI, bukan dari contexts/
├── utils/
└── data/          # dummy data, hanya sebagai fallback
```

Route publik: `/login`, `/register`. Sisanya dibungkus `ProtectedRoute` → `AppLayout`. `/admin/theme` tambahan `RequireOSPAdmin` (redirect kalau `user.brandId !== 3`).

**Navbar** (`components/layout/Navbar.jsx`) punya 4 icon kanan atas: Power = logout, Maximize = toggle collapse sidebar (bukan fullscreen browser — sidebar kiri menyempit jadi icon-only, mirror perilaku `dev.osp.id/portal`), User = buka modal Edit Profile, Key = buka modal Reset Password. Dua modal terakhir (`EditProfileModal.jsx`, `ResetPasswordModal.jsx`) UI-only, belum ada endpoint backend buat submit-nya (lihat "Batasan yang sudah diketahui").

## Aturan wajib

**Semua panggilan API lewat service module.** Jangan import `api` langsung di komponen halaman.

**Warna** — ikuti `GOLDEN_RULE_GUIDE.md`:
- primary `#7148FC`, dark `#5A38CC`, light `#9B7FFF`
- success `#10B981`, warning `#F59E0B`, danger `#EF4444`
- dark bg `#0C121C` / `#1E293B`, light `#D6DEE7` / `#B8BFC6`
- font: IBM Plex Sans + IBM Plex Mono
- **Dilarang** memakai class `blue-*` / `indigo-*` atau warna di luar palet.

**localStorage keys**: `osp_token`, `osp_user`, `osp_theme_overrides`, `osp_custom_brands`. Bukan `token` / `user`.

**Base URL**: `api.js` memakai `import.meta.env.VITE_API_BASE_URL || '/pos-backend'`, timeout 60 detik. Vite mem-proxy `/pos-backend/*` → `https://dev.osp.id`. Jangan menulis prefix `/pos-backend` lagi di dalam path service — itu jadi double prefix (pernah terjadi di `gymService.js`).

**Data login**: `franchiseId` di-resolve saat login lewat `fetchFranchiseByGymId`, disimpan sebagai `user.areaId` / `user.franchiseId`. Jangan resolve ulang di service lain.

**Format Rupiah**: selalu pakai `formatCurrency()` dari `utils/helpers.js` (`"Rp 1.234"`, null-safe). Jangan bikin formatter lokal baru di halaman — dulu ada 4 gaya beda-beda (`"IDR X"`, `"Rp X"`, `"Rp. X"`, angka polos) sebelum distandarkan.

## Status koneksi backend per halaman

Terhubung penuh: LoginPage (authService), MembersPage (memberService), OspReportPage dan DailySalesReportPage (orderService), PendingMembershipPage (memberService), ThemeAdminPanel (themeOverrideService / customBrandService, dengan brandThemes.json sebagai default statis), **HomePage** (memberService — semua stat card & chart dihitung dari `fetchAllCustomersCached()`, KECUALI Gender Distribution yang sengaja ditampilkan sebagai placeholder "belum ada data" karena field gender gak ada di `/customers`).

Sebagian:
- **ProductPage** — GET real lewat itemService, tapi Add/Edit/Delete hanya lokal.
- **MonthlyPaymentPage** — data master dan pencarian customer sudah real, tapi `processPayment()` masih dummy.

Masih dummy penuh:
- **CardVerifyPage** — flow upload CSV lokal saja.
- **RegisterPage** — tidak import service sama sekali. Halaman statis "hubungi admin untuk akun baru" dengan link balik ke `/login`, bukan form registrasi ke backend.
- **EditProfileModal** & **ResetPasswordModal** (dibuka dari Navbar) — UI lengkap, tapi submit gak beneran nyimpen ke server, belum ada endpoint.

Kalau menemukan tabel ini tidak cocok dengan kode, percayai kode dan perbarui bagian ini.

## Shape response API yang SUDAH diverifikasi

Dokumentasi API sering tidak cocok dengan kenyataan. Yang di bawah ini sudah dicek langsung terhadap server — **percayai ini, bukan dokumentasi**:

- `GET /items` → `{id, productName, shortName, price, active, responseCode, responseMessage}`. Tidak ada konsep category maupun stock. Response bisa memuat id duplikat — dedup di frontend.
- `GET /customers` → `{id, name, keyFob, email, phoneNumber, additionalInformation, createdDate, gymName, status, membershipType, ...}`. `additionalInformation` adalah **string JSON** berisi `[{amount, description, type}]`; parse sekali saja. `status` bisa `null` secara sah — jangan dipalsukan jadi `'ACTIVE'`.
- `GET /master/paymenttype` → `{id, paymentType, cardType, bank, internalMDR, externalMDR}`. Tidak ada field `description`.

Kalau menemukan shape baru yang berbeda dari dokumentasi, tambahkan ke daftar ini.

## Batasan yang sudah diketahui

- `/items` tidak punya endpoint POST/PUT/DELETE. Perubahan di ProductPage sudah ditandai banner peringatan supaya user tahu tidak tersimpan.
- Backend pembayaran masih sistem Vaadin, belum REST. Menunggu endpoint dari tim backend.
- `CardVerifyPage` belum punya endpoint yang cocok di dokumentasi manapun.
- `/customers` bisa memakan >140 detik dan payload-nya besar. **Jangan** panggil `fetchAllCustomers()` langsung untuk UI pencarian — pakai `searchCustomers()` dengan debounce ~400ms dan minimal 2 karakter. Pola lama pernah membekukan halaman.
- **`fetchAllCustomersCached()`** (di `memberService.js`) — wrapper `fetchAllCustomers()` dengan cache in-memory 5 menit, dipakai HomePage & MembersPage biar gak dobel nembak `/customers` pas pindah halaman. Pass `{ force: true }` buat bypass cache (dipakai tombol Refresh manual di MembersPage). Cache ini cuma nolong load kedua-dst — load pertama tetap kena risiko lambat >140s di atas, karena belum ada endpoint dashboard-summary yang ringan dari backend.
- `EditProfileModal`/`ResetPasswordModal` belum ada endpoint — sama kayak `processPayment()`, submit cuma toast dummy.

## Sisa pekerjaan

- Minta endpoint REST untuk submit pembayaran ke tim backend.
- Minta endpoint dashboard-summary yang ringan buat HomePage (angka agregat langsung dari server), biar gak bergantung ke `fetchAllCustomersCached()` yang bisa lambat di load pertama.
- Minta endpoint update profile & reset password ke tim backend (buat `EditProfileModal`/`ResetPasswordModal`).
- Konsolidasi duplikasi kode antara `DailySalesReportPage.jsx` dan `OspReportPage.jsx` (pagination, export XLSX, filter bar hampir identik, copy-paste).
- `Badge.jsx` — kalau `status` null, sekarang render pill kosong; harusnya `'-'` biar konsisten sama konvensi di bawah.
- `masterService.fetchMasterGyms()` dan `gymService.fetchGyms()` hit endpoint yang sama (`GET /master/gyms`), cuma beda filter — pertimbangkan digabung.

## Konvensi kerja

Branch: `feature/nama-fitur` (huruf kecil, dash). Semua perubahan lewat Pull Request ke `main` — jangan push langsung ke `main`.

Kalau sebuah field yang dibutuhkan UI tidak ada di backend, tampilkan `'-'` atau biarkan `null` lalu sebutkan kekurangannya. Jangan mengarang nilai supaya UI terlihat lengkap.