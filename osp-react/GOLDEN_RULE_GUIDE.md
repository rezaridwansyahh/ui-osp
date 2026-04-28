# 🎨 OSP UI – Golden Rule Style Guide

## Pengenalan

Panduan ini mendokumentasikan **Golden Rule** untuk konsistensi UI/UX di seluruh aplikasi OSP. Tujuannya adalah memastikan semua halaman menggunakan **satu tone, satu palette, dan satu typeface** yang harmonis.

---

## 📋 Golden Rule Components

### 1. **TONE** (Suara/Bahasa)
- **Gaya**: Ramah & Profesional
- **Pendekatan**: Direktif, jelas, tidak berbelit-belit
- **Karakteristik**:
  - Gunakan bahasa yang singkat dan mudah dipahami
  - Hindari jargon teknis yang berlebihan
  - Konsisten dalam formulasi pesan di semua elemen UI
  - Tetap profesional namun approachable

**Contoh yang BENAR:**
- "Download Template"
- "Upload File"
- "Submit"
- "Please choose a file first."

**Contoh yang SALAH (hindari):**
- "Kindly retrieve the template document"
- "Perform file transmission"
- "You must select a file, dude"

---

### 2. **PALETTE** (Warna)
Gunakan **satu palet warna utama** yang terdefinisi dengan jelas. Jangan campur-aduk warna dari berbagai brand.

#### **Primary Color (Aksi Utama)**
- **Nama**: Violet
- **Warna Utama**: `#7148FC`
- **Penggunaan**: Tombol utama, step progress aktif, connector progress, link aktif, icon accent
- **Variasi**:
  - `#7148FC`: Button primary, text accent, border highlight
  - `#5A38CC` (darkened): Button hover state
  - `#9B7FFF` (lightened): Button hover bg, icon hover

#### **Secondary Color (Kesuksesan)**
- **Nama**: Emerald / Success
- **Warna Utama**: `#10B981` (keep existing emerald dari Tailwind)
- **Penggunaan**: Status sukses, completed steps, ready badges, success messages
- **Note**: Tetap gunakan Tailwind emerald-600/emerald-700 untuk consistency

#### **Dark Colors (Dark Mode / Sidebar)**
- **Very Dark** `#0C121C`: Sidebar background, dark header
- **Dark Slate** `#1E293B`: Sidebar border, secondary dark background, card backgrounds
- **Penggunaan**: Sidebar, dark themed sections

#### **Light / Neutral Colors**
- **Light Gray** `#D6DEE7`: Page background, light borders, disabled state
- **Medium Gray** `#B8BFC6`: Secondary text, icon muted, placeholder text
- **White** `#FFFFFF`: Component background, text primary on dark
- **Penggunaan**:
  - `#FFFFFF`: Card backgrounds, primary text on dark
  - `#D6DEE7`: Page/section background, light separator
  - `#B8BFC6`: Secondary text, helper text, disabled button text

#### **Danger/Warning Colors** (Hanya untuk Actions Berbahaya)
- **Red** `#EF4444`: Delete button, void transaction, defaulted status (use Tailwind red-500)
- **Amber** `#F59E0B`: Warning, pending, freeze status (use Tailwind amber-500)
- **Orange** `#F97316`: Warning accent (use Tailwind orange-500)

#### **Chart/Avatar Gradient** (untuk member avatars dan charts)
```
Primary:
- from-violet-500 to-violet-700
  (maps to #7148FC for primary use case)

Secondary Options (from Tailwind):
- from-emerald-500 to-teal-500
- from-orange-500 to-amber-500
- from-purple-500 to-indigo-500
- from-pink-500 to-rose-500
```

**Note**: Tailwind colors ditampilkan untuk development convenience. Replace dengan custom hex jika needed untuk exact branding match.

---

### 3. **TYPEFACE** (Jenis Font)

#### **Font Family**
- **Body/Default**: `IBM Plex Sans` (sans-serif)
- **Monospace/Code**: `IBM Plex Mono` (monospace)
- **Fallback**: system fonts

#### **Font Weights**
- **Regular (400)**: Body text, paragraf
- **Medium (500)**: Label, secondary heading
- **Semibold (600)**: Button text, card title
- **Bold (700)**: Page heading, emphasis

#### **Size & Usage**
| Ukuran | Bobot | Kegunaan | Contoh |
|--------|-------|----------|--------|
| `text-xs` (12px) | 400-600 | Caption, helper text | "Maximum file size: 10MB" |
| `text-sm` (14px) | 500-600 | Label, button, small heading | "Download Template", button text |
| `text-base` (16px) | 600-700 | Heading, subtitle | "Confirm Submission" |
| `text-lg` (18px) | 600 | Section heading | "Upload Card Verify File" |
| `text-2xl` (24px) | 700 | Page title | (jarang digunakan di halaman utama) |

---

## 🎯 Penerapan di Setiap Halaman

### **cardverify.html**
✅ **Status**: Fully compliant
- Avatar: Violet gradient (`#7148FC` base)
- Primary button: `bg-violet-600 hover:bg-violet-700` → `#7148FC` / `#5A38CC`
- Step progress: Violet active (`#7148FC`), Emerald complete (`#10B981`)
- Auth button: `text-violet-400` → primary accent

### **home.html**
✅ **Status**: Fully compliant
- Dashboard hero: Violet gradient header (`#7148FC`)
- Auth button: Violet accent
- Metric cards: Status colors (red for defaulted, amber for freeze, emerald for active)

### **members.html**
✅ **Status**: Fully compliant
- Avatar gradients: Violet-first palette based on `#7148FC`
- Filter button: `bg-violet-600 hover:bg-violet-700` → primary
- Status badges: Emerald (active), Red (defaulted)
- Email icon: Violet accent

### **monthlypayment.html**
✅ **Status**: Fully compliant
- Avatar gradients: Violet-first palette based on `#7148FC`
- Payment button: `bg-emerald-600` → `#10B981` (success action)
- Primary button: `bg-violet-600` → `#7148FC`
- Status colors: Emerald (collected), Amber (waived), Red (late fee)

### **product.html**
✅ **Status**: Fully compliant
- Add product button: `bg-violet-600` → `#7148FC`
- Auth button: Violet accent
- Delete action: Red → `#EF4444` (danger)

### **dailytransaction.html**
✅ **Status**: Fully compliant
- Filter button: `bg-violet-600` → `#7148FC`
- Void button: Red → `#EF4444` (danger action)
- Transaction status: SUCCESS (`#10B981`), VOID (`#EF4444`), PENDING (`#F59E0B`)

---

## 📐 CSS Variables (styles.css)

Variabel warna utama yang didefinisikan:

```css
:root {
  /* Primary - Violet */
  --primary:          #7148FC;
  --primary-dark:     #5A38CC;
  --primary-light:    #9B7FFF;
  
  /* Dark Colors */
  --dark-bg:          #0C121C;
  --dark-secondary:   #1E293B;
  
  /* Light Colors */
  --light-bg:         #D6DEE7;
  --light-text:       #B8BFC6;
  --white:            #FFFFFF;
  
  /* Status Colors (from Tailwind) */
  --success:          #10B981;     /* emerald-600 */
  --warning:          #F59E0B;     /* amber-500 */
  --danger:           #EF4444;     /* red-500 */
  
  /* Typography */
  --font:             'IBM Plex Sans', sans-serif;
  --font-mono:        'IBM Plex Mono', monospace;
}
```

---

## ✅ Checklist untuk Halaman Baru

Saat membuat halaman/komponen baru, pastikan:

- [ ] **Tone**: Gunakan bahasa yang konsisten (ramah + profesional)
- [ ] **Palette**:
  - [ ] Primary action (buttons, links) → Violet (`#7c3aed`)
  - [ ] Success state (badges, checkmarks) → Emerald (`#16a34a`)
  - [ ] Warning state (alerts) → Amber (`#d97706`)
  - [ ] Danger state (delete, void) → Red (`#c0392b`)
  - [ ] Sidebar/Dark areas → Slate (`#1e293b`)
- [ ] **Typography**:
  - [ ] Font family: IBM Plex Sans (body), IBM Plex Mono (code/mono)
  - [ ] Font weights: Regular, Medium, Semibold, Bold saja
  - [ ] Size hierarchy: Consistent dengan guide di atas
- [ ] **Consistency**:
  - [ ] Routing links sesuai dengan struktur existing
  - [ ] Breadcrumb navigation konsisten
  - [ ] Button style seragam
  - [ ] Spacing & padding seragam

---

---

## 🎨 Custom Color Palette Reference

**Official Project Colors** (use these hex values for exact branding):

| Color Name | Hex Value | Usage |
|-----------|-----------|-------|
| Primary (Violet) | `#7148FC` | Buttons, links, accents, progress |
| Primary Dark | `#5A38CC` | Hover states, active states |
| Primary Light | `#9B7FFF` | Hover backgrounds, disabled |
| Dark Background | `#0C121C` | Sidebar, dark sections |
| Dark Secondary | `#1E293B` | Borders, secondary dark bg |
| Light Gray | `#D6DEE7` | Page background, light borders |
| Medium Gray | `#B8BFC6` | Secondary text, disabled state |
| White | `#FFFFFF` | Card bg, primary text on dark |
| Success | `#10B981` | Status success, badges |
| Warning | `#F59E0B` | Status warning, alerts |
| Danger | `#EF4444` | Status danger, delete actions |

---

## 🚀 Tailwind Config & Color Usage

Semua halaman menggunakan Tailwind CSS dengan config:

```javascript
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    }
  }
}
```

**Warna Tailwind yang digunakan di project:**
- `violet-400, violet-50, violet-500, violet-600, violet-700` → ALL maps to primary `#7148FC`
- `emerald-50, emerald-500, emerald-600, emerald-700` → Success state
- `red-50, red-500` → Danger actions
- `amber-500, amber-600` → Warning state
- `orange-500, orange-700` → Warning accent
- `gray-50, gray-100, gray-200, gray-400, gray-600, gray-900` → Neutrals
- `slate-300, slate-400, slate-800` → Dark sections

**Conversion Guide (Tailwind → Custom Hex):**
```
violet-600 → #7148FC (primary)
slate-800 → #0C121C or #1E293B (dark)
gray-50 → #D6DEE7 (light bg)
```

**Hindari:**
- ❌ `blue-*` colors
- ❌ `indigo-*` (except gradients)
- ❌ Random colors not in palette
- ❌ Direct use of default Tailwind grays (use defined palette)

---

## 📝 Contoh Implementasi

### Button Primary (Violet - #7148FC)
```html
<!-- Using Tailwind -->
<button class="px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
  Action
</button>

<!-- Using Custom Hex (if needed) -->
<style>
  .btn-primary {
    background-color: #7148FC;
  }
  .btn-primary:hover {
    background-color: #5A38CC;
  }
</style>
```

### Button Success (Emerald - #10B981)
```html
<button class="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
  Confirm & Pay
</button>
```

### Status Badge
```html
<!-- Success (#10B981) -->
<span class="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-600">
  Active
</span>

<!-- Danger (#EF4444) -->
<span class="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-50 text-red-600">
  Defaulted
</span>

<!-- Warning (#F59E0B) -->
<span class="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-600">
  Pending
</span>
```

### Avatar Gradient (Primary #7148FC)
```html
<!-- Using Tailwind (maps to primary) -->
<div class="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-700 rounded-full flex items-center justify-center">
  <span class="text-white font-bold">JD</span>
</div>

<!-- Using Custom Gradient (if needed) -->
<style>
  .avatar-primary {
    background: linear-gradient(135deg, #7148FC 0%, #5A38CC 100%);
  }
</style>
```

### Dark Sidebar (Background #0C121C)
```html
<!-- Using inline style -->
<aside style="background-color: #0C121C;" class="w-64 h-full">
  <!-- Sidebar content -->
</aside>

<!-- Using Tailwind (approximate) -->
<aside class="bg-slate-900 w-64">
  <!-- Sidebar content with lighter text -->
</aside>
```

### Light Background (#D6DEE7)
```html
<!-- Page background -->
<div style="background-color: #D6DEE7;">
  <!-- Page content -->
</div>

<!-- Using Tailwind equivalent -->
<div class="bg-gray-100 lg:bg-gray-200">
  <!-- Content -->
</div>
```

---

## 🔄 Maintenance & Update

- **Warna**: Jika perlu mengubah warna, update `styles.css` `:root` variables terlebih dahulu
- **Font**: Pastikan font imports di head tag semua halaman (sudah konsisten)
- **Spacing**: Gunakan Tailwind spacing scale (p-2, gap-3, mb-4, etc.)
- **Shadows**: Gunakan `shadow-sm`, `shadow-md`, `shadow-lg` saja

---

## 📞 Questions & Support

Jika ada pertanyaan tentang styling atau tidak yakin apakah sesuai dengan golden rule:
1. Referensikan halaman yang sudah ada (cardverify, home, members)
2. Cross-check dengan guide ini
3. Pastikan tone, palette, dan typeface konsisten dengan yang sudah didefinisikan

---

**Last Updated**: April 24, 2026  
**Version**: 1.0  
**Status**: Active & Enforced
