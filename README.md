# KosRank — Sistem Pendukung Keputusan Pemilihan Kos (Metode SAW)

---

## Anggota Kelompok

| No | Nama | NIM |
|---|---|---|
| 1 | Very Irawan Simbolon | 2315091092 |
| 2 | Ben Abednego | 2315091088 |
| 3 | Leotius Aldyano Etho | 2315091037 |

**Mata Kuliah**: Sistem Pendukung Keputusan  
**Tugas**: UAS — Sistem KosRank (Metode SAW)

---

KosRank adalah aplikasi web **Sistem Pendukung Keputusan (SPK)** untuk membantu mahasiswa memilih tempat kos terbaik secara objektif. Aplikasi mengolah beberapa **kriteria** dan **alternatif** (kos) menggunakan metode **Simple Additive Weighting (SAW)**, lalu menampilkan **proses perhitungan secara transparan**, **peringkat**, dan **rekomendasi** kos terbaik.

Dokumen ini menjelaskan aplikasi dari sisi non‑teknis (apa & kenapa) sampai teknis mendalam (routing, controller, model, service, frontend, deployment), sehingga cukup membaca README ini untuk memahami keseluruhan sistem.

---

## Daftar Isi

### Dokumentasi Front-End
- [A. Library & Tech Stack Frontend](#a-library--tech-stack-frontend)
- [B. Hierarki Komponen](#b-hierarki-komponen)
- [C. State Management](#c-state-management)
- [D. Halaman & Komponen UI](#d-halaman--komponen-ui)

### Dokumentasi Back-End
- [E. Struktur Data (Database)](#e-struktur-data-database)
- [F. Rancangan API / Endpoint](#f-rancangan-api--endpoint)
- [G. Source Code Inti: Implementasi SAW](#g-source-code-inti-implementasi-saw)

### Dokumentasi Umum
1. [Ringkasan & Tujuan](#1-ringkasan--tujuan)
2. [Metode SAW (Konsep & Rumus)](#2-metode-saw-konsep--rumus)
3. [Fitur Utama](#3-fitur-utama)
4. [Tech Stack](#4-tech-stack)
5. [Arsitektur & Cara Kerja](#5-arsitektur--cara-kerja)
6. [Struktur Direktori](#6-struktur-direktori)
7. [Skema Database](#7-skema-database)
8. [Model & Relasi](#8-model--relasi)
9. [Data Per-User (Multi-Tenant)](#9-data-per-user-multi-tenant)
10. [Routing](#10-routing)
11. [Controller](#11-controller)
12. [Form Request (Validasi)](#12-form-request-validasi)
13. [Service Layer (Inti Perhitungan SAW)](#13-service-layer-inti-perhitungan-saw)
14. [Autentikasi (Fortify)](#14-autentikasi-fortify)
15. [Frontend (Inertia + React)](#15-frontend-inertia--react)
16. [Alur Pengguna End-to-End](#16-alur-pengguna-end-to-end)
17. [Instalasi & Menjalankan Lokal](#17-instalasi--menjalankan-lokal)
18. [Pengujian](#18-pengujian)
19. [Kualitas Kode](#19-kualitas-kode)
20. [Deployment](#20-deployment)

---

## Dokumentasi Front-End

---

## A. Library & Tech Stack Frontend

| Library / Tool | Versi | Peran |
|---|---|---|
| **React** | 19 | Library UI utama (component-based rendering) |
| **TypeScript** | 5 | Superset JS dengan static typing |
| **Inertia.js** | v3 | Jembatan Laravel ↔ React (SPA tanpa REST API terpisah) |
| **Tailwind CSS** | v4 | Utility-first CSS framework (styling semua komponen) |
| **shadcn/ui** | (preset radix-maia) | Koleksi komponen UI aksesibel berbasis Radix UI |
| **Radix UI** | — | Primitive headless component (dialog, select, dropdown, dll) |
| **Sonner** | — | Notifikasi toast |
| **HugeIcons** | — | Ikon (via `components/ui/icon.tsx`) |
| **Vite** | — | Bundler / dev server frontend |
| **Laravel Wayfinder** | v0 | Generate fungsi TypeScript typed dari route & controller Laravel |
| **ESLint** | v9 | Linter TypeScript/React |
| **Prettier** | v3 | Code formatter frontend |

---

## B. Hierarki Komponen

Berikut adalah hierarki komponen lengkap dari root hingga halaman:

```
app.tsx  (Inertia root — createInertiaApp)
│
├── AppSidebarLayout  (layout/app-sidebar-layout.tsx)
│   ├── AppShell  (app-shell.tsx)
│   │   ├── AppHeader  (app-header.tsx)  — topbar responsif, breadcrumb, nav mobile
│   │   │   ├── Breadcrumbs  (breadcrumbs.tsx)
│   │   │   └── AppSidebarHeader  (app-sidebar-header.tsx)
│   │   └── AppContent  (app-content.tsx)
│   ├── AppSidebar  (app-sidebar.tsx)  — sidebar navigasi utama
│   │   ├── AppLogoIcon  (app-logo-icon.tsx)
│   │   ├── NavMain  (nav-main.tsx)  — menu: Dasbor, Kriteria, Alternatif, Nilai, Perhitungan, Hasil
│   │   └── NavUser  (nav-user.tsx)  — avatar + dropdown profil/logout
│   └── [Halaman Aktif]  — di-render oleh Inertia
│       ├── dashboard.tsx
│       ├── criteria/index.tsx
│       ├── alternatives/index.tsx
│       ├── values/index.tsx
│       ├── calculation/index.tsx
│       └── result/index.tsx
│
├── AuthLayout  (layouts/auth/auth-simple-layout.tsx)
│   └── pages/auth/
│       ├── login.tsx
│       ├── register.tsx
│       ├── forgot-password.tsx
│       ├── reset-password.tsx
│       └── verify-email.tsx
│
└── SettingsLayout  (layouts/settings/layout.tsx)
    └── pages/settings/
        ├── profile.tsx
        ├── security.tsx
        └── appearance.tsx
```

### Komponen Shared (Reusable)

```
components/
├── page-header.tsx          — judul halaman + deskripsi + slot aksi
├── preference-bar-chart.tsx — grafik batang Vi (CSS murni, highlight rank 1)
├── alert-error.tsx          — daftar error blokir pra-perhitungan
├── heading.tsx              — komponen judul heading
├── input-error.tsx          — pesan error form
├── password-input.tsx       — input password dengan toggle show/hide
├── appearance-tabs.tsx      — toggle tema gelap/terang/sistem
├── breadcrumbs.tsx          — navigasi breadcrumb
├── text-link.tsx            — link teks bergaya
├── delete-user.tsx          — dialog konfirmasi hapus akun
└── ui/                      — komponen shadcn (26 komponen):
    alert, avatar, badge, breadcrumb, button, card, checkbox,
    collapsible, dialog, dropdown-menu, icon, input, label,
    navigation-menu, select, separator, sheet, sidebar, skeleton,
    sonner, spinner, table, toggle, toggle-group, tooltip
```

---

## C. State Management

KosRank **tidak menggunakan** state management global (Redux/Zustand/Context API besar) karena setiap halaman menerima data lengkap dari server via **Inertia props**. State dikelola secara lokal dengan pola berikut:

### 1. Inertia Props (Server State)
Data utama (kriteria, alternatif, hasil SAW) dikirim dari Laravel sebagai **Inertia page props** dan bersifat read-only di frontend.

```tsx
// Contoh: criteria/index.tsx
const { criteria, totalWeight } = usePage<{
    criteria: Criterion[];
    totalWeight: number;
}>().props;
```

### 2. `useForm` Inertia (Form State)
Semua operasi CRUD menggunakan hook `useForm` dari Inertia, yang mengelola:
- nilai field form (`data`)
- status pengiriman (`processing`)
- error validasi dari server (`errors`)
- method submit (`post`, `put`, `patch`, `delete`)

```tsx
const form = useForm({
    code: '',
    name: '',
    type: 'benefit' as CriterionType,
    weight: '',
    unit: '',
});

form.post(route('criteria.store'), {
    onSuccess: () => form.reset(),
});
```

### 3. Local State (`useState`) — UI State
Hanya untuk state antarmuka murni (bukan data):
- `isDialogOpen` — buka/tutup dialog tambah/edit/hapus
- `editingItem` — item yang sedang diedit

### 4. Custom Hooks

| Hook | Lokasi | Fungsi |
|---|---|---|
| `useFlashToast` | `hooks/use-flash-toast.ts` | Baca flash `toast` dari Inertia shared data, tampilkan via Sonner |
| `useAppearance` | `hooks/use-appearance.tsx` | Kelola tema gelap/terang (localStorage + cookie) |
| `useMobile` | `hooks/use-mobile.tsx` | Deteksi layar mobile (`window.innerWidth < 768px`) |
| `useMobileNavigation` | `hooks/use-mobile-navigation.ts` | Toggle sidebar pada mobile |
| `useCurrentUrl` | `hooks/use-current-url.ts` | Baca URL aktif untuk highlight nav aktif |
| `useInitials` | `hooks/use-initials.tsx` | Generate inisial nama user untuk avatar |
| `useClipboard` | `hooks/use-clipboard.ts` | Copy-to-clipboard utility |

### 5. Shared Data Inertia (Global State)
Data yang tersedia di semua halaman tanpa prop drilling, di-share lewat `HandleInertiaRequests` middleware:
- `auth.user` — data user login
- `flash.toast` — pesan toast dari operasi CRUD

---

## D. Halaman & Komponen UI

| Halaman | File | Komponen Utama yang Dipakai |
|---|---|---|
| Landing | `welcome.tsx` | Halaman marketing (tanpa layout sidebar) |
| Dashboard | `dashboard.tsx` | `Card`, `Badge`, indikator status kesiapan SAW |
| Kriteria | `criteria/index.tsx` | `Table`, `Dialog`, `Select`, `Input`, `Badge`, `PageHeader` |
| Alternatif | `alternatives/index.tsx` | `Table`, `Dialog`, `Input`, `PageHeader` |
| Nilai Alternatif | `values/index.tsx` | Matriks `Input` editable (alt × kriteria), `Table`, `Spinner` |
| Perhitungan | `calculation/index.tsx` | `AlertError`, tabel matriks normalisasi & terbobot, `Badge` rank |
| Hasil | `result/index.tsx` | `PreferenceBarChart`, tabel ranking, `Badge` rekomendasi |
| Auth | `auth/*` | `Input`, `Button`, `TextLink`, `PasswordInput`, `Checkbox` |
| Pengaturan | `settings/*` | `Input`, `Button`, `AppearanceTabs`, `DeleteUser` |

---

## 🟢 Dokumentasi Back-End

---

## E. Struktur Data (Database)

Lihat detail lengkap di [Seksi 7](#7-skema-database). Ringkasan:

### Diagram Relasi Tabel

```
users
  │
  ├─── criteria (user_id FK)
  │        │
  │        └─── alternative_values (criterion_id FK)
  │
  └─── alternatives (user_id FK)
           │
           └─── alternative_values (alternative_id FK)
```

### Representasi JSON Data (Inertia Props)

Berikut contoh struktur JSON yang dikirim dari backend ke frontend saat halaman **Perhitungan** dibuka:

```json
{
  "result": {
    "criteria": [
      { "id": 1, "code": "C1", "name": "Harga",     "type": "cost",    "weight": 35, "weight_normalized": 0.35 },
      { "id": 2, "code": "C2", "name": "Jarak",     "type": "cost",    "weight": 30, "weight_normalized": 0.30 },
      { "id": 3, "code": "C3", "name": "Fasilitas", "type": "benefit", "weight": 20, "weight_normalized": 0.20 },
      { "id": 4, "code": "C4", "name": "Keamanan",  "type": "benefit", "weight": 15, "weight_normalized": 0.15 }
    ],
    "alternatives": [
      { "id": 1, "code": "A1", "name": "Kos A" },
      { "id": 2, "code": "A2", "name": "Kos B" },
      { "id": 3, "code": "A3", "name": "Kos C" }
    ],
    "decisionMatrix": {
      "1": { "1": 700000, "2": 1.0, "3": 4, "4": 3 },
      "2": { "1": 600000, "2": 1.8, "3": 3, "4": 4 },
      "3": { "1": 850000, "2": 0.5, "3": 5, "4": 4 }
    },
    "minMax": {
      "1": { "min": 600000, "max": 850000 },
      "2": { "min": 0.5,    "max": 1.8   },
      "3": { "min": 3,      "max": 5     },
      "4": { "min": 3,      "max": 4     }
    },
    "normalizedMatrix": {
      "1": { "1": 0.857, "2": 0.500, "3": 0.800, "4": 0.750 },
      "2": { "1": 1.000, "2": 0.278, "3": 0.600, "4": 1.000 },
      "3": { "1": 0.706, "2": 1.000, "3": 1.000, "4": 1.000 }
    },
    "weightedMatrix": {
      "1": { "1": 0.300, "2": 0.150, "3": 0.160, "4": 0.113 },
      "2": { "1": 0.350, "2": 0.083, "3": 0.120, "4": 0.150 },
      "3": { "1": 0.247, "2": 0.300, "3": 0.200, "4": 0.150 }
    },
    "scores": { "1": 0.723, "2": 0.703, "3": 0.897 },
    "ranking": [
      { "rank": 1, "alternative_id": 3, "code": "A3", "name": "Kos C", "score": 0.897 },
      { "rank": 2, "alternative_id": 1, "code": "A1", "name": "Kos A", "score": 0.723 },
      { "rank": 3, "alternative_id": 2, "code": "A2", "name": "Kos B", "score": 0.703 }
    ]
  },
  "validationErrors": []
}
```

---

## F. Rancangan API / Endpoint

KosRank adalah **monolit Inertia** (bukan REST API), sehingga "endpoint" adalah route Laravel yang mengembalikan response Inertia (HTML pertama kali, JSON pada navigasi berikutnya). Tidak ada endpoint JSON murni terpisah.

### Endpoint Fitur SPK

| Method | URI | Response Inertia | Deskripsi |
|---|---|---|---|
| `GET` | `/` | `welcome` | Landing page |
| `GET` | `/dashboard` | `dashboard` | Ringkasan: jumlah kriteria, alternatif, status, kos terbaik |
| `GET` | `/criteria` | `criteria/index` | Daftar kriteria + total bobot |
| `POST` | `/criteria` | Redirect + flash toast | Tambah kriteria baru |
| `PUT` | `/criteria/{id}` | Redirect + flash toast | Edit kriteria |
| `DELETE` | `/criteria/{id}` | Redirect + flash toast | Hapus kriteria |
| `GET` | `/alternatives` | `alternatives/index` | Daftar alternatif kos |
| `POST` | `/alternatives` | Redirect + flash toast | Tambah kos baru |
| `PUT` | `/alternatives/{id}` | Redirect + flash toast | Edit kos |
| `DELETE` | `/alternatives/{id}` | Redirect + flash toast | Hapus kos |
| `GET` | `/values` | `values/index` | Matriks nilai (alt × kriteria) |
| `PUT` | `/values` | Redirect + flash toast | Simpan massal nilai matriks |
| `GET` | `/calculation` | `calculation/index` | Jalankan SAW, tampilkan seluruh tahapan |
| `GET` | `/result` | `result/index` | Ranking + rekomendasi + grafik |

### Endpoint Auth (Laravel Fortify)

| Method | URI | Deskripsi |
|---|---|---|
| `GET/POST` | `/login` | Halaman & proses login |
| `GET/POST` | `/register` | Halaman & proses registrasi |
| `POST` | `/logout` | Logout |
| `GET/POST` | `/forgot-password` | Kirim link reset password |
| `GET/POST` | `/reset-password/{token}` | Reset password |
| `GET/POST` | `/email/verify` | Verifikasi email |
| `GET/POST` | `/user/confirm-password` | Konfirmasi password sebelum aksi sensitif |
| `GET/POST` | `/two-factor-*` | Manajemen autentikasi dua faktor (2FA) |

### Props Inertia Shared (tersedia di semua halaman)

```json
{
  "auth": { "user": { "id": 1, "name": "John", "email": "john@example.com", "email_verified_at": "..." } },
  "flash": { "toast": { "type": "success", "message": "Kriteria berhasil disimpan." } }
}
```

---

## G. Source Code Inti: Implementasi SAW

Berikut adalah **source code lengkap** inti implementasi metode SAW (proses normalisasi hingga preferensi), terdapat di `app/Services/SawCalculatorService.php`:

### Langkah 1 — Membangun Matriks Keputusan

```php
/**
 * Build [alternative_id][criterion_id] => raw value, ensuring completeness.
 * Throws SawCalculationException jika ada nilai yang belum diisi.
 */
private function buildDecisionMatrix(Collection $criteria, Collection $alternatives): array
{
    $matrix = [];

    foreach ($alternatives as $alternative) {
        $values = $alternative->alternativeValues->keyBy('criterion_id');

        foreach ($criteria as $criterion) {
            $value = $values->get($criterion->id);

            if ($value === null) {
                throw new SawCalculationException(
                    "Nilai untuk alternatif \"{$alternative->name}\" pada kriteria \"{$criterion->name}\" belum diisi.",
                );
            }

            $matrix[$alternative->id][$criterion->id] = (float) $value->value;
        }
    }

    return $matrix;
    // Hasil: $matrix[altId][critId] = nilai_mentah (x_ij)
}
```

### Langkah 2 — Menghitung Min & Max Tiap Kriteria

```php
/**
 * Hitung nilai minimum dan maksimum tiap kolom kriteria.
 * Digunakan sebagai acuan normalisasi benefit (max) dan cost (min).
 */
private function computeMinMax(Collection $criteria, array $decisionMatrix): array
{
    $minMax = [];

    foreach ($criteria as $criterion) {
        $column = array_column($decisionMatrix, $criterion->id);

        $minMax[$criterion->id] = [
            'min' => count($column) > 0 ? (float) min($column) : 0.0,
            'max' => count($column) > 0 ? (float) max($column) : 0.0,
        ];
    }

    return $minMax;
}
```

### Langkah 3 — Normalisasi Matriks

```php
/**
 * Normalisasi nilai ke rentang [0, 1]:
 *   - Benefit: r_ij = x_ij / max_j   (makin besar makin baik)
 *   - Cost:    r_ij = min_j / x_ij   (makin kecil makin baik)
 *
 * Guard pembagian nol:
 *   - Benefit dengan max = 0 → lempar exception
 *   - Cost dengan nilai = 0 → lempar exception (juga dicegah di validasi awal)
 */
private function normalize(
    Collection $criteria,
    Collection $alternatives,
    array $decisionMatrix,
    array $minMax
): array {
    $normalized = [];

    foreach ($alternatives as $alternative) {
        foreach ($criteria as $criterion) {
            $value = $decisionMatrix[$alternative->id][$criterion->id];
            $min   = $minMax[$criterion->id]['min'];
            $max   = $minMax[$criterion->id]['max'];

            if ($criterion->type === CriterionType::Benefit) {
                if ($max <= 0.0) {
                    throw new SawCalculationException(
                        "Kriteria benefit \"{$criterion->name}\" memiliki nilai maksimum nol."
                    );
                }
                $normalized[$alternative->id][$criterion->id] = $value / $max;
            } else {
                // Cost
                if ($value <= 0.0) {
                    throw new SawCalculationException(
                        "Kriteria cost \"{$criterion->name}\" memiliki nilai nol pada alternatif \"{$alternative->name}\"."
                    );
                }
                $normalized[$alternative->id][$criterion->id] = $min / $value;
            }
        }
    }

    return $normalized;
    // Hasil: $normalized[altId][critId] = r_ij  (0 ≤ r_ij ≤ 1)
}
```

### Langkah 4 — Bobot Ternormalisasi & Matriks Terbobot

```php
/**
 * Normalisasi bobot: w_j_normalized = w_j / Σw
 * Kemudian hitung matriks terbobot: weighted_ij = w_j_normalized × r_ij
 *
 * Tidak hardcode /100 agar tetap valid walau ada selisih pembulatan.
 */
private function applyWeights(
    Collection $criteria,
    Collection $alternatives,
    array $normalizedMatrix,
    float $weightTotal
): array {
    $weighted = [];

    foreach ($alternatives as $alternative) {
        foreach ($criteria as $criterion) {
            // Normalisasi bobot secara real-time
            $weight = $weightTotal > 0
                ? (float) $criterion->weight / $weightTotal
                : 0.0;

            $weighted[$alternative->id][$criterion->id] =
                $normalizedMatrix[$alternative->id][$criterion->id] * $weight;
        }
    }

    return $weighted;
}

// Helper: total bobot mentah
private function totalWeight(Collection $criteria): float
{
    return (float) $criteria->sum(
        fn (Criterion $criterion): float => (float) $criterion->weight
    );
}
```

### Langkah 5 — Skor Preferensi (Vi)

```php
/**
 * Hitung nilai preferensi tiap alternatif:
 *   V_i = Σ_j ( w_j_normalized × r_ij )
 *       = penjumlahan seluruh sel baris alternatif i pada matriks terbobot
 */
private function scores(Collection $alternatives, array $weightedMatrix): array
{
    $scores = [];

    foreach ($alternatives as $alternative) {
        // array_sum menjumlahkan seluruh nilai pada baris alternatif i
        $scores[$alternative->id] = array_sum($weightedMatrix[$alternative->id]);
    }

    return $scores;
    // Hasil: $scores[altId] = V_i
}
```

### Langkah 6 — Perankingan

```php
/**
 * Urutkan alternatif dari skor Vi tertinggi ke terendah.
 * Alternatif dengan Vi tertinggi = rekomendasi terbaik.
 */
private function rank(Collection $alternatives, array $scores): array
{
    $rows = $alternatives->map(fn (Alternative $alternative): array => [
        'alternative_id' => $alternative->id,
        'code'           => $alternative->code,
        'name'           => $alternative->name,
        'score'          => $scores[$alternative->id],
    ])->values()->all();

    // Descending sort: skor tertinggi di atas
    usort($rows, fn (array $a, array $b): int => $b['score'] <=> $a['score']);

    $ranking = [];
    foreach ($rows as $index => $row) {
        $ranking[] = [
            'rank'           => $index + 1,
            'alternative_id' => $row['alternative_id'],
            'code'           => $row['code'],
            'name'           => $row['name'],
            'score'          => $row['score'],
        ];
    }

    return $ranking;
}
```

### Orkestrator Utama (`calculate`)

```php
/**
 * Titik masuk utama: menjalankan seluruh pipeline SAW.
 * Dipanggil oleh CalculationController dan ResultController.
 */
public function calculate(Collection $criteria, Collection $alternatives): SawResult
{
    if ($criteria->isEmpty()) {
        throw new SawCalculationException('Belum ada kriteria untuk dihitung.');
    }
    if ($alternatives->isEmpty()) {
        throw new SawCalculationException('Belum ada alternatif untuk dihitung.');
    }

    // Pipeline SAW:
    $decisionMatrix   = $this->buildDecisionMatrix($criteria, $alternatives);           // Step 1
    $minMax           = $this->computeMinMax($criteria, $decisionMatrix);               // Step 2
    $weightTotal      = $this->totalWeight($criteria);                                  // Step 4a
    $normalizedMatrix = $this->normalize($criteria, $alternatives, $decisionMatrix, $minMax); // Step 3
    $weightedMatrix   = $this->applyWeights($criteria, $alternatives, $normalizedMatrix, $weightTotal); // Step 4b
    $scores           = $this->scores($alternatives, $weightedMatrix);                  // Step 5
    $ranking          = $this->rank($alternatives, $scores);                            // Step 6

    return new SawResult(
        criteria:         $criteria->map(fn (Criterion $c): array => [
            'id'                => $c->id,
            'code'              => $c->code,
            'name'              => $c->name,
            'type'              => $c->type->value,
            'weight'            => (float) $c->weight,
            'weight_normalized' => $weightTotal > 0 ? (float) $c->weight / $weightTotal : 0.0,
        ])->values()->all(),
        alternatives:     $alternatives->map(fn (Alternative $a): array => [
            'id'   => $a->id,
            'code' => $a->code,
            'name' => $a->name,
        ])->values()->all(),
        decisionMatrix:   $decisionMatrix,
        minMax:           $minMax,
        normalizedMatrix: $normalizedMatrix,
        weightedMatrix:   $weightedMatrix,
        scores:           $scores,
        ranking:          $ranking,
    );
}
```

### Validator Pra-Perhitungan (`SawDataValidator`)

```php
// app/Services/SawDataValidator.php
// Mengembalikan array string error; kosong = siap hitung

public function validate(Collection $criteria, Collection $alternatives): array
{
    $errors = [];

    if ($criteria->isEmpty()) {
        $errors[] = 'Belum ada kriteria. Tambahkan minimal 1 kriteria.';
    }
    if ($alternatives->isEmpty()) {
        $errors[] = 'Belum ada alternatif. Tambahkan minimal 5 alternatif kos.';
    }
    if ($alternatives->count() > 0 && $alternatives->count() < self::MINIMUM_ALTERNATIVES) {
        $errors[] = 'Jumlah alternatif minimal ' . self::MINIMUM_ALTERNATIVES . '.';
    }

    $totalWeight = $criteria->sum(fn ($c) => (float) $c->weight);
    if (abs($totalWeight - 100.0) > 0.01) {
        $errors[] = "Total bobot saat ini {$totalWeight}%. Harus tepat 100%.";
    }

    // Cek kelengkapan nilai matriks
    foreach ($alternatives as $alternative) {
        foreach ($criteria as $criterion) {
            $hasValue = $alternative->alternativeValues
                ->firstWhere('criterion_id', $criterion->id);
            if (! $hasValue) {
                $errors[] = "Nilai belum diisi: {$alternative->name} × {$criterion->name}.";
            }
        }
    }

    // Cek nilai cost > 0 (mencegah pembagian nol pada normalisasi)
    foreach ($alternatives as $alternative) {
        foreach ($criteria->where('type', CriterionType::Cost) as $criterion) {
            $val = $alternative->alternativeValues
                ->firstWhere('criterion_id', $criterion->id)?->value;
            if ($val !== null && (float) $val <= 0) {
                $errors[] = "Kriteria cost \"{$criterion->name}\" tidak boleh nol pada {$alternative->name}.";
            }
        }
    }

    return $errors;
}
```

---

## 1. Ringkasan & Tujuan

Memilih kos melibatkan banyak pertimbangan (harga, jarak, fasilitas, keamanan) yang sering saling bertentangan. KosRank mengubah pertimbangan subjektif itu menjadi perhitungan terstruktur:

- Mengelola **kriteria** beserta **bobot** dan **jenis** (benefit/cost).
- Mengelola **alternatif** (daftar kos) dan **nilai** tiap kos pada tiap kriteria.
- Menjalankan **SAW** dan menampilkan setiap tahapannya (transparan).
- Menyajikan **ranking** dan **rekomendasi** kos terbaik beserta grafik.

Setiap pengguna memiliki **datanya sendiri** (kriteria/alternatif/nilai terisolasi per akun).

---

## 2. Metode SAW (Konsep & Rumus)

**Simple Additive Weighting (SAW)** = penjumlahan terbobot dari nilai yang sudah dinormalisasi. Langkahnya:

1. **Matriks keputusan** `X`: nilai tiap alternatif `i` pada tiap kriteria `j` (`x_ij`).
2. **Normalisasi** menjadi `r_ij`:
   - **Benefit** (makin besar makin baik): `r_ij = x_ij / max_j(x)`
   - **Cost** (makin kecil makin baik): `r_ij = min_j(x) / x_ij`
3. **Bobot ternormalisasi**: `w_j = bobot_j / Σ bobot` (sehingga total bobot = 1).
4. **Nilai preferensi**: `V_i = Σ_j ( w_j × r_ij )`.
5. **Ranking**: urutkan `V_i` dari terbesar; nilai tertinggi = rekomendasi.

### Contoh (data awal aplikasi)

Kriteria: C1 Harga (cost, 35%), C2 Jarak (cost, 30%), C3 Fasilitas (benefit, 20%), C4 Keamanan (benefit, 15%).

| Alt | Harga | Jarak | Fasilitas | Keamanan | **Vi** |
|---|---:|---:|---:|---:|---:|
| Kos A | 700000 | 1.0 | 4 | 3 | 0.6750 |
| Kos B | 600000 | 1.8 | 3 | 4 | 0.6442 |
| **Kos C** | 850000 | 0.5 | 5 | 4 | **0.8465** |
| Kos D | 550000 | 2.5 | 2 | 3 | 0.5800 |
| Kos E | 750000 | 1.2 | 4 | 5 | 0.6917 |

Ranking: **C > E > A > B > D** → rekomendasi **Kos C**. (Nilai ini dipakai sebagai acuan di unit test untuk menjamin ketepatan perhitungan.)

### Aturan ketepatan yang dijaga aplikasi
- Nilai kriteria **cost wajib > 0** (mencegah pembagian nol pada `min/x`).
- Bobot dinormalkan `w/Σw` (bukan hardcode `/100`), valid walau ada selisih pembulatan.
- Perhitungan internal memakai presisi penuh (float); pembulatan hanya untuk tampilan.

---

## 3. Fitur Utama

- **Dashboard**: ringkasan jumlah kriteria, jumlah alternatif, metode, status kesiapan, dan alternatif terbaik.
- **Manajemen Kriteria** (CRUD) + validasi total bobot 100%.
- **Manajemen Alternatif** (CRUD kos).
- **Pengisian Nilai** dalam bentuk matriks editable (alternatif × kriteria).
- **Halaman Perhitungan**: menampilkan seluruh tahapan SAW.
- **Halaman Hasil**: ranking, rekomendasi, dan grafik batang nilai preferensi.
- **Autentikasi** lengkap (login, registrasi, lupa/atur ulang kata sandi, verifikasi, 2FA) via Laravel Fortify.
- **Data per-user**: tiap akun punya data sendiri; user baru otomatis diberi 4 kriteria default.
- **Mode gelap/terang**, responsif desktop & mobile, notifikasi toast, dialog konfirmasi.
- **Bahasa Indonesia** untuk seluruh teks antarmuka & pesan validasi.

---

## 4. Tech Stack

| Lapisan | Teknologi |
|---|---|
| Bahasa | PHP 8.4 |
| Framework | Laravel 13 |
| Auth | Laravel Fortify v1 |
| Frontend | Inertia.js v3 + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + komponen shadcn (preset `radix-maia`, ikon `hugeicons`) |
| Routing typed | Laravel Wayfinder (TS dari route/controller Laravel) |
| Build | Vite |
| Database | MySQL 8 |
| Testing | Pest v4 / PHPUnit v12 |
| Analisis statis | Larastan/PHPStan v3 |
| Formatter/Linter | Laravel Pint, ESLint v9, Prettier v3 |

Session/cache/queue memakai driver **database** (tanpa Redis).

---

## 5. Arsitektur & Cara Kerja

KosRank adalah **monolit Laravel + SPA Inertia** (bukan REST API terpisah). Alur sebuah request:

1. Browser mengakses route Laravel (mis. `GET /criteria`).
2. Middleware (`auth`, `verified`) memastikan pengguna login & terverifikasi.
3. **Controller** mengambil data (otomatis ter-scope ke user login) dan memanggil `Inertia::render('criteria/index', [...props])`.
4. Inertia mengirim props sebagai JSON; **React** me-render komponen halaman di `resources/js/pages`.
5. Mutasi (store/update/destroy) dikirim via Inertia `useForm`/`router` → controller → validasi `FormRequest` → simpan → redirect + **flash toast**.
6. Perhitungan SAW dikerjakan di **service layer** (PHP), hasilnya dikirim sebagai props ke halaman React (tanpa logika perhitungan di frontend).

Tidak ada SSR Node di produksi (Inertia jatuh ke client-side rendering); SSR hanya aktif saat `npm run dev`.

---

## 6. Struktur Direktori

```
app/
├── Actions/
│   ├── CreateDefaultCriteria.php        # buat 4 kriteria default untuk user
│   └── Fortify/CreateNewUser.php        # hook registrasi (panggil default criteria)
├── Enums/CriterionType.php              # enum Benefit | Cost
├── Exceptions/SawCalculationException.php
├── Http/
│   ├── Controllers/                     # Criterion, Alternative, AlternativeValue,
│   │                                    # Calculation, Result, Dashboard, Settings/*
│   ├── Middleware/                      # HandleInertiaRequests, HandleAppearance
│   └── Requests/                        # Store/Update* + UpdateAlternativeValuesRequest
├── Models/
│   ├── Concerns/BelongsToUser.php       # global scope + auto user_id
│   ├── Criterion.php  Alternative.php  AlternativeValue.php  User.php
├── Providers/AppServiceProvider.php     # forceScheme https, guard destructive, dll
└── Services/
    ├── SawCalculatorService.php         # inti perhitungan SAW
    ├── SawDataValidator.php             # validasi pra-perhitungan
    └── SawResult.php                    # DTO hasil (semua tahapan)
database/
├── migrations/                         # tabel criteria, alternatives, alternative_values, + user_id
├── factories/                          # CriterionFactory, AlternativeFactory, AlternativeValueFactory
└── seeders/                            # CriteriaSeeder, AlternativeSeeder, DatabaseSeeder
resources/js/
├── pages/                              # welcome, dashboard, criteria, alternatives, values,
│                                       # calculation, result, auth/*, settings/*
├── components/                         # page-header, preference-bar-chart, alert-error, ui/*
├── layouts/                            # app-*, auth-*, settings/*
├── hooks/                              # use-appearance, use-flash-toast, dll
└── actions/ , routes/                  # hasil generate Wayfinder (typed)
routes/web.php                          # semua route fitur SPK
```

---

## 7. Skema Database

Tiga tabel inti (selain tabel bawaan `users`, `sessions`, `cache`, `jobs`).

### `criteria`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | pemilik (cascade on delete) |
| code | string | kode (C1, C2, …), **unik per user** |
| name | string | nama kriteria |
| type | enum(`benefit`,`cost`) | jenis |
| weight | decimal(5,2) | bobot dalam persen |
| unit | string nullable | satuan (Rp, km, skala 1-5) |
| timestamps | | |

Unique: `(user_id, code)`.

### `alternatives`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | pemilik (cascade) |
| code | string | kode (A1, …), **unik per user** |
| name | string | nama kos |
| location | string | lokasi/alamat singkat |
| timestamps | | |

Unique: `(user_id, code)`.

### `alternative_values` (pivot bernilai)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigint PK | |
| alternative_id | FK → alternatives | cascade |
| criterion_id | FK → criteria | cascade |
| value | decimal(12,2) | nilai mentah |
| timestamps | | |

Unique: `(alternative_id, criterion_id)`. Tidak punya `user_id` sendiri — kepemilikan diturunkan dari `alternative`/`criterion`.

---

## 8. Model & Relasi

- **`Criterion`** — `belongsTo User`, `hasMany AlternativeValue`, `belongsToMany Alternative` (via `alternative_values`, `withPivot('value')`). Cast: `type → CriterionType`, `weight → decimal:2`. Memakai trait `BelongsToUser`.
- **`Alternative`** — `belongsTo User`, `hasMany AlternativeValue`, `belongsToMany Criterion`. Memakai trait `BelongsToUser`.
- **`AlternativeValue`** — `belongsTo Alternative`, `belongsTo Criterion`. Cast `value → decimal:2`.
- **`User`** — `hasMany Criterion`, `hasMany Alternative`.
- **`CriterionType`** (enum string) — `Benefit`, `Cost`, plus `label()`.

---

## 9. Data Per-User (Multi-Tenant)

Isolasi data per akun diimplementasikan lewat trait **`App\Models\Concerns\BelongsToUser`** yang dipasang di `Criterion` & `Alternative`:

- **Global scope**: setiap query otomatis ditambah `where('user_id', Auth::id())` selama ada user login. Akibatnya:
  - `index`/perhitungan hanya melihat data milik user.
  - **Route model binding** (mis. `Criterion $criterion`) ikut ter-scope → mengakses data milik user lain menghasilkan **404** (isolasi otomatis tanpa policy tambahan).
- **Auto-isi `user_id`** saat `creating` (dari `Auth::id()`), jadi controller `store` tidak perlu mengirim `user_id`.
- Saat **CLI/seeder** (tanpa Auth) scope dilewati, sehingga `user_id` harus diisi eksplisit (seeder melakukannya).
- **Unique `code` per user**: kode boleh sama antar pengguna, tetapi unik di dalam satu pengguna.
- **Registrasi**: user baru otomatis menerima 4 kriteria default via `CreateDefaultCriteria` (dipanggil dari `CreateNewUser`).

---

## 10. Routing

Semua route fitur ada di `routes/web.php`, dalam grup `middleware(['auth','verified'])`. Auth routes disediakan otomatis oleh Fortify.

### Route Aplikasi (SPK)
| Method | URI | Name | Aksi |
|---|---|---|---|
| GET | `/` | `home` | Landing page (Inertia `welcome`) |
| GET | `/dashboard` | `dashboard` | `DashboardController@index` |
| GET | `/criteria` | `criteria.index` | `CriterionController@index` |
| POST | `/criteria` | `criteria.store` | `CriterionController@store` |
| PUT/PATCH | `/criteria/{criterion}` | `criteria.update` | `CriterionController@update` |
| DELETE | `/criteria/{criterion}` | `criteria.destroy` | `CriterionController@destroy` |
| GET | `/alternatives` | `alternatives.index` | `AlternativeController@index` |
| POST | `/alternatives` | `alternatives.store` | `AlternativeController@store` |
| PUT/PATCH | `/alternatives/{alternative}` | `alternatives.update` | `AlternativeController@update` |
| DELETE | `/alternatives/{alternative}` | `alternatives.destroy` | `AlternativeController@destroy` |
| GET | `/values` | `values.index` | `AlternativeValueController@index` |
| PUT | `/values` | `values.update` | `AlternativeValueController@update` |
| GET | `/calculation` | `calculation.index` | `CalculationController@index` |
| GET | `/result` | `result.index` | `ResultController@index` |

### Route Auth (Fortify) & Settings
`login`, `register`, `logout`, `forgot-password`, `reset-password/{token}`, `user/confirm-password`, dan (jika diaktifkan) two-factor. Settings: `profile.edit/update/destroy`, `security.edit`, `user-password.update`, `appearance.edit`.

> Frontend memanggil route ini lewat fungsi typed hasil **Wayfinder** (`@/actions/...`, `@/routes/...`) alih-alih URL hardcoded; dijalankan ulang dengan `php artisan wayfinder:generate`.

---

## 11. Controller

Semua controller mengembalikan halaman Inertia (`Inertia::render`) atau `RedirectResponse` dengan **flash toast** (`Inertia::flash('toast', ['type'=>'success','message'=>...])`).

### `CriterionController`
- `index()` → render `criteria/index` dengan daftar kriteria (ter-scope user) + `totalWeight` (jumlah bobot).
- `store(StoreCriterionRequest)` → `Criterion::create(...)` (user_id otomatis) + toast.
- `update(UpdateCriterionRequest, Criterion)` → update (binding ter-scope → 404 bila bukan milik user) + toast.
- `destroy(Criterion)` → hapus + toast.

### `AlternativeController`
Pola sama dengan Criterion untuk entitas kos (`alternatives/index`).

### `AlternativeValueController`
- `index()` → render `values/index`: daftar kriteria + alternatif + matriks nilai saat ini (`values[alternative_id][criterion_id]`, `null` bila belum diisi).
- `update(UpdateAlternativeValuesRequest)` → simpan massal nilai via `updateOrCreate` dalam **transaksi**; hanya menyimpan pasangan yang id alternatif & kriterianya **milik user** (id diambil dari query ter-scope) + toast.

### `CalculationController`
- Inject `SawDataValidator` + `SawCalculatorService`.
- Ambil kriteria & alternatif (ter-scope) → jalankan **validasi pra-perhitungan**.
  - Jika ada error → render `calculation/index` dengan `validationErrors` (array string) dan `result = null`.
  - Jika valid → `calculate()` lalu kirim `result` (seluruh tahapan) ke props. Dibungkus `try/catch SawCalculationException` sebagai pengaman.

### `ResultController`
Mirip Calculation, tetapi mengirim `ranking` (terurut) + `best` untuk halaman `result/index`.

### `DashboardController`
Mengirim `summary`: `criteriaCount`, `alternativesCount`, `totalWeight`, `method`, `isReady`, dan `best` (alternatif terbaik bila data siap).

### `Settings/*` (bawaan starter kit)
`ProfileController` (edit/update/destroy akun), `SecurityController` (ganti kata sandi).

---

## 12. Form Request (Validasi)

| Request | Aturan utama |
|---|---|
| `StoreCriterionRequest` / `UpdateCriterionRequest` | `code` wajib + **unik per user** (`Rule::unique('criteria','code')->where('user_id', ...)`, `ignore` saat update); `name` wajib; `type` enum benefit/cost; `weight` numeric `gt:0` `max:100`; `unit` opsional |
| `StoreAlternativeRequest` / `UpdateAlternativeRequest` | `code` wajib + unik per user; `name` wajib; `location` wajib |
| `UpdateAlternativeValuesRequest` | `values` array; tiap `values.*.*` `required numeric min:0`; **kriteria cost wajib `> 0`** (dicek di `after()` agar tidak terjadi pembagian nol) |

Semua pesan & atribut error berbahasa Indonesia (`lang/id/validation.php` + method `attributes()`/`messages()`).

---

## 13. Service Layer (Inti Perhitungan SAW)

Logika SAW dipisah dari controller agar mudah diuji & transparan.

### `SawDataValidator::validate($criteria, $alternatives): array`
Mengembalikan daftar pesan error (kosong = siap hitung). Menolak bila:
- belum ada kriteria / belum ada alternatif;
- jumlah alternatif `< 5` (konstanta `MINIMUM_ALTERNATIVES`);
- total bobot ≠ 100%;
- ada nilai alternatif belum lengkap;
- ada nilai **cost ≤ 0** (potensi pembagian nol).

### `SawCalculatorService::calculate($criteria, $alternatives): SawResult`
Menghasilkan seluruh tahapan:
1. **Matriks keputusan** (`decisionMatrix[altId][critId]`), sekaligus memastikan kelengkapan data (lempar `SawCalculationException` bila ada yang kosong).
2. **Min/Max** tiap kriteria.
3. **Normalisasi** (benefit `x/max`, cost `min/x`) dengan guard pembagian nol.
4. **Bobot ternormalisasi** `w/Σw` dan **matriks terbobot**.
5. **Skor preferensi** `Vi` (penjumlahan baris terbobot).
6. **Ranking** terurut menurun + penanda peringkat.

### `SawResult` (DTO immutable)
Menyimpan tiap tahapan (criteria, alternatives, decisionMatrix, minMax, normalizedMatrix, weightedMatrix, scores, ranking) + helper `best()` dan `toArray()` untuk dikirim ke Inertia. Ber-PHPDoc `@phpstan-type` agar tipe jelas.

### `SawCalculationException`
Dilempar ketika data tidak bisa dihitung (tidak lengkap / pembagian nol). Ditangkap controller sebagai lapis pengaman terakhir.

---

## 14. Autentikasi (Fortify)

- **Laravel Fortify** menyediakan route & backend auth (login, register, reset/forgot password, verifikasi email, konfirmasi kata sandi, 2FA), dengan halaman React di `resources/js/pages/auth/*`.
- Route fitur SPK berada di grup `auth, verified` — wajib login & email terverifikasi.
- **`CreateNewUser`** (kontrak `CreatesNewUsers`) memvalidasi & membuat user, lalu memanggil **`CreateDefaultCriteria`** sehingga user baru langsung punya 4 kriteria default (total bobot 100%).
- Di produksi (di belakang reverse proxy/Coolify), `AppServiceProvider` memanggil `URL::forceScheme('https')` + middleware `trustProxies` agar URL aset memakai HTTPS (menghindari mixed-content).

---

## 15. Frontend (Inertia + React)

### Halaman (`resources/js/pages`)
`welcome` (landing), `dashboard`, `criteria/index`, `alternatives/index`, `values/index`, `calculation/index`, `result/index`, `auth/*`, `settings/*`.

### Layout
- `app/app-sidebar-layout` — layout utama dengan sidebar (menu: Dasbor, Kriteria, Alternatif, Nilai Alternatif, Perhitungan, Hasil & Rekomendasi). Memuat `useFlashToast()` agar notifikasi tampil di semua halaman.
- `auth/*` — layout halaman autentikasi.
- `settings/layout` — layout pengaturan.

### Komponen penting
- `page-header.tsx` — header halaman konsisten (judul + deskripsi + slot aksi), responsif.
- `preference-bar-chart.tsx` — grafik batang nilai preferensi (CSS murni, menampilkan angka; bar peringkat 1 di-highlight).
- `alert-error.tsx` — menampilkan daftar error blokir pra-perhitungan.
- `components/ui/*` — komponen shadcn (button, dialog, select, table, card, badge, dll) sesuai preset.

### Pola UI
- Form pakai `useForm` Inertia; mutasi mengembalikan flash toast (sonner) lewat hook `use-flash-toast`.
- Hapus data selalu lewat **dialog konfirmasi**.
- **Tema** gelap/terang dikelola `use-appearance` (disimpan di localStorage + cookie untuk SSR).
- **Wayfinder**: pemanggilan route/controller di TS menggunakan fungsi typed (`@/actions`, `@/routes`).
- Judul tab dinamis: `"{judul halaman} - KosRank"` (dari `APP_NAME`).

---

## 16. Alur Pengguna End-to-End

1. **Registrasi/Login** → user baru otomatis mendapat 4 kriteria default.
2. **Dashboard** menampilkan ringkasan & status kesiapan data.
3. **Kriteria** — sesuaikan kriteria/bobot/jenis hingga total bobot 100%.
4. **Alternatif** — tambahkan tempat kos (minimal 5 untuk perhitungan).
5. **Nilai Alternatif** — isi matriks nilai tiap kos × kriteria.
6. **Perhitungan** — sistem memvalidasi kelengkapan & bobot, lalu menampilkan tahapan SAW (matriks → normalisasi → terbobot → Vi → ranking). Jika belum valid, tampil pesan blokir yang jelas.
7. **Hasil & Rekomendasi** — ranking, kos terbaik, dan grafik.

Validasi pra-perhitungan memastikan: ada kriteria & alternatif, alternatif ≥ 5, total bobot = 100%, semua nilai terisi, dan tidak ada nilai cost = 0.

---

## 17. Instalasi & Menjalankan Lokal

Prasyarat: PHP 8.4, Composer, Node 22+, MySQL 8.

```bash
# 1. Dependency
composer install
npm install

# 2. Environment
cp .env.example .env
php artisan key:generate
# set DB_* di .env (DB_CONNECTION=mysql, DB_DATABASE=kosrank, dll), lalu buat database `kosrank`

# 3. Migrasi + data contoh
php artisan migrate --seed   # user demo: test@example.com / password

# 4. Jalankan (server + vite + queue + logs)
composer run dev
# atau terpisah: php artisan serve  &  npm run dev
```

Akun demo hasil seeder: **`test@example.com` / `password`** (terverifikasi, sudah punya 4 kriteria + 5 alternatif).

---

## 18. Pengujian

Memakai **Pest**. Test penting:
- `SawCalculatorServiceTest` — membandingkan skor & ranking dengan **perhitungan manual** (best = Kos C), normalisasi benefit/cost, normalisasi bobot, dan penolakan data tidak lengkap / cost nol.
- `CriterionManagementTest`, `AlternativeManagementTest`, `AlternativeValueTest` — CRUD + validasi.
- `CalculationTest`, `ResultTest`, `DashboardTest` — alur perhitungan, ranking, ringkasan.
- `PerUserIsolationTest` — isolasi data antar user (index ter-scope, akses milik user lain → 404, kode sama antar user diizinkan).

```bash
php artisan test --compact            # seluruh suite
php artisan test --compact --filter=Saw
```

> Testing memakai database MySQL `kosrank_testing` (lihat `phpunit.xml`) dengan `RefreshDatabase`.

---

## 19. Kualitas Kode

```bash
vendor/bin/pint --format agent        # format PHP (Laravel Pint)
vendor/bin/phpstan analyse            # analisis statis (Larastan v3)
npm run lint                          # ESLint (--fix)
npm run lint:check                    # ESLint (cek saja)
npm run format                        # Prettier
```

Konvensi: tipe & return type eksplisit di PHP, PHPDoc array-shape, komponen UI dipakai ulang, dan seluruh teks UI berbahasa Indonesia.

---

## 20. Deployment

Aplikasi dirancang untuk dideploy di **VPS dengan Coolify** menggunakan **Dockerfile** (image `serversideup/php:8.4-fpm-nginx`, port internal `8080`) dengan database **MySQL** sebagai resource terpisah (volume persisten — data bertahan antar-deploy).

Ringkas:
1. Buat resource **MySQL** di Coolify; catat host internal + kredensial.
2. Buat aplikasi dari repo (Build Pack: **Dockerfile**), set **Ports Exposes = 8080**.
3. Isi environment: `APP_KEY`, `APP_URL` (HTTPS, sesuai domain), `APP_NAME=KosRank`, `DB_*` (atau `DB_URL` internal), `APP_ENV=production`.
4. **Post-deployment Command**: `php artisan migrate --force` (data persisten antar-deploy).
5. Seed sekali bila perlu: `php artisan db:seed --force` (idempotent, tanpa Faker).

Catatan teknis penting:
- `require.php = ^8.4` agar Nixpacks/Docker memakai PHP 8.4 (beberapa paket memakai sintaks property hooks 8.4).
- Di belakang proxy, HTTPS dipaksa via `trustProxies` + `URL::forceScheme('https')` untuk mencegah mixed-content.
- Perintah destruktif (`migrate:fresh`, `db:wipe`) **diblokir di production**; dapat dibuka sementara dengan env `ALLOW_DESTRUCTIVE_COMMANDS=true` untuk kebutuhan reset sekali pakai.

---

## Lisensi

Proyek dibuat untuk memenuhi tugas UAS mata kuliah Sistem Pendukung Keputusan. Dibangun di atas Laravel React Starter Kit (MIT).
