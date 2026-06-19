# PLAN — Data Per-User (Multi-Tenant) untuk KosRank

Rencana mengubah data SPK (kriteria, alternatif, nilai) dari **bersama/global** menjadi **milik tiap user** (terisolasi per akun). Setiap langkah punya checkbox untuk tracking.

> Status saat ini: data **global** — semua user login melihat & mengedit dataset yang sama (tabel `criteria`, `alternatives`, `alternative_values` tidak punya `user_id`). Rencana ini membuat tiap user punya kriteria/alternatif/nilai sendiri.

---

## 1. Tujuan & Dampak

- Setiap user hanya melihat dan mengelola **data miliknya sendiri**.
- User tidak bisa melihat/mengubah/menghapus data user lain (isolasi penuh).
- Perhitungan SAW, hasil, dan dashboard hanya memakai data user yang sedang login.

Keputusan desain utama:
- Tambah kolom `user_id` di `criteria` dan `alternatives`. Tabel `alternative_values` ikut ter-scope otomatis lewat induknya (`alternative`/`criterion`), tetapi tetap divalidasi agar pasangan alternatif×kriteria milik user yang sama.
- Pakai **Global Scope** + auto-isi `user_id` saat create, sehingga query (termasuk route model binding) otomatis ter-scope dan record milik orang lain menghasilkan **404**.
- `code` (C1, A1, ...) menjadi **unik per user**, bukan unik global.

---

## 2. Skema Perubahan

**`criteria`** — tambah:
- `user_id` — FK → users (cascade on delete), `after('id')`
- ubah unique: dari `unique(code)` → `unique(['user_id','code'])`

**`alternatives`** — tambah:
- `user_id` — FK → users (cascade on delete)
- ubah unique: dari `unique(code)` → `unique(['user_id','code'])`

**`alternative_values`** — tidak menambah `user_id` (terikat ke `alternative` & `criterion` yang sudah ber-`user_id`). Tetap `unique(['alternative_id','criterion_id'])` + cascade.

---

## FASE 1 — Migration & Data Lama ✅ SELESAI

- [x] Buat migration `add_user_id_to_criteria_table`:
  - tambah `foreignId('user_id')->after('id')->constrained()->cascadeOnDelete()` (nullable dulu untuk backfill).
  - drop unique lama `criteria_code_unique`, tambah `unique(['user_id','code'])`. ✅
- [x] Buat migration `add_user_id_to_alternatives_table` (pola sama). ✅
- [x] **Backfill data lama**: isi `user_id` baris lama ke `User::first()` bila ada; baris tanpa kemungkinan owner dihapus; lalu kolom dijadikan NOT NULL. ✅
- [x] `down()` reversible: drop foreign key → drop composite unique → drop kolom → kembalikan `unique('code')`. Diuji rollback + re-migrate sukses. ✅
- [x] Jalankan `php artisan migrate` & verifikasi: kolom `user_id` ada, index `criteria_user_id_code_unique` & `alternatives_user_id_code_unique` terbentuk. ✅

> ⚠️ Setelah Fase 1, `user_id` NOT NULL tetapi model/factory belum mengisinya → **app & test akan merah sampai Fase 2–3 selesai** (model auto-isi `user_id` + factory + controller). Lanjutkan ke Fase 2.

---

## FASE 2 — Model & Scoping Otomatis ✅ SELESAI

- [x] Buat trait `App\Models\Concerns\BelongsToUser`: global scope `where('user_id', Auth::id())` saat ada user login, auto-isi `user_id` saat `creating`, dilewati saat CLI/seeder (no Auth). Relasi `user()`. ✅
- [x] Terapkan ke `Criterion` & `Alternative`: tambah `user_id` ke `$fillable`, `@property int $user_id`, pakai trait. ✅
- [x] Relasi di `User`: `hasMany(Criterion)` & `hasMany(Alternative)`. ✅
- [x] `AlternativeValue` tanpa scope sendiri (akses lewat `alternative` milik user). ✅
- [x] Factory `Criterion`/`Alternative` set `user_id => User::factory()`. ✅
- [x] Seeder (`DatabaseSeeder` buat user dulu; `CriteriaSeeder`/`AlternativeSeeder` set `user_id` eksplisit ke user pertama). Diverifikasi `migrate:fresh --seed`: user demo punya 4 kriteria + 5 alternatif. ✅

## FASE 3 — Controller, Request & Otorisasi ✅ SELESAI

- [x] `index` di semua controller otomatis ter-scope via global scope (hanya data user login). `store` auto-isi `user_id`. `update`/`destroy` via route model binding ter-scope → record milik user lain otomatis **404** (isolasi). ✅
- [x] `Store/UpdateCriterionRequest` & `Store/UpdateAlternativeRequest`: aturan unique `code` jadi **scoped per user** (`->where('user_id', $this->user()->id)` + `ignore` saat update). ✅
- [x] `AlternativeValueController`: matriks & simpan otomatis ter-scope (id alternatif/kriteria yang dipakai sudah hasil query ter-scope). ✅
- [x] PHPStan & Pint bersih (selain warning lama `UserFactory` bawaan starter kit). ✅

> ⚠️ Automated test suite (Fase 6) belum diperbarui untuk per-user, jadi sebagian test merah sampai Fase 6 (factory belum dikaitkan ke acting user, urutan seed/user di beberapa test). App berfungsi (diverifikasi manual via relasi & seeding).

---

## FASE 4 — SAW: Perhitungan, Hasil, Dashboard ✅ SELESAI

- [x] `SawCalculatorService` & `SawDataValidator` tidak berubah — menerima koleksi yang sudah ter-scope dari controller. ✅
- [x] `CalculationController`, `ResultController`, `DashboardController`, `AlternativeValueController` mengambil `Criterion`/`Alternative` lewat query yang **otomatis ter-scope** (global scope). Diverifikasi tidak ada query yang melewati scope (`withoutGlobalScope`) di kode aplikasi. ✅
- [x] Total bobot, kelengkapan nilai, dan ranking dihitung per user. ✅

## FASE 5 — Data Awal untuk User Baru ✅ SELESAI

- [x] Pendekatan **B (auto-seed default)** dipilih: saat registrasi, user baru otomatis mendapat 4 kriteria default (C1–C4, total bobot 100%). Alternatif dibiarkan kosong (user menambah kos sendiri). ✅
- [x] Buat action reusable `App\Actions\CreateDefaultCriteria` (idempotent per user via `firstOrCreate` pada relasi). ✅
- [x] Hook di `app/Actions/Fortify/CreateNewUser.php` (dependency-injected) memanggil action setelah user dibuat. ✅
- [x] `CriteriaSeeder` & `DatabaseSeeder` di-refactor memakai action yang sama (DRY); data demo tetap untuk user `test@example.com`. ✅
- [x] Verifikasi: `migrate:fresh --seed` sukses; user hasil registrasi punya 4 kriteria (total bobot 100). PHPStan & Pint bersih. ✅

---

## FASE 6 — Pengujian (Isolasi) ✅ SELESAI

- [x] Update test yang ada agar data milik acting user: factory pakai `->for($this->user)`; urutan seed/user diperbaiki (`SawCalculatorServiceTest` & `DashboardTest` membuat user sebelum seed). ✅
- [x] Tambah `PerUserIsolationTest` (6 test): ✅
  - index kriteria/alternatif hanya menampilkan milik user login.
  - `update`/`destroy` record milik user lain → **404**.
  - kode sama diizinkan antar user, duplikat dalam user yang sama ditolak.
  - simpan nilai untuk alternatif/kriteria milik user lain diabaikan.
- [x] `php artisan test --compact` → **70 passed / 4 skipped**. PHPStan & Pint bersih (selain warning lama `UserFactory`). ✅

---

## FASE 7 — Verifikasi & Deploy

- [ ] Build frontend `npm run build`, jalankan lint.
- [ ] Uji manual: registrasi 2 akun, pastikan datanya terpisah.
- [ ] Deploy ke Coolify; jalankan migrasi (`migrate --force`). 
  - Jika DB produksi sudah berisi data global, pastikan langkah **backfill** (Fase 1) menetapkan `user_id` agar data lama tidak hilang/terorphan.
- [ ] Verifikasi di produksi: dua user berbeda → data berbeda.

---

## Catatan Risiko & Rollback

- **Data lama:** mengubah ke per-user pada DB yang sudah berisi data global berisiko. Wajib backfill `user_id` (assign ke satu user) atau bersihkan data sebelum menjadikan kolom NOT NULL.
- **Unique code:** setelah jadi per-user, kode bisa bentrok lintas user tanpa masalah; pastikan validasi & UI tidak mengasumsikan kode unik global.
- **Rollback:** migration `down()` mengembalikan unique global + drop `user_id`. Tapi jika sudah ada dua user memakai kode yang sama, rollback ke unique global akan gagal — tangani manual bila perlu.
- **Scope CLI/seeder:** global scope berbasis `Auth::id()` tidak aktif di CLI; seeder harus mengisi `user_id` secara eksplisit.

---

## Checklist Ringkas

- [ ] Migration `user_id` + composite unique (+ backfill data lama)
- [ ] Global scope + auto-isi `user_id` di `Criterion` & `Alternative`
- [ ] Controller & FormRequest ter-scope (unique per user, binding 404 untuk milik orang lain)
- [ ] Nilai alternatif divalidasi milik user
- [ ] Perhitungan/Hasil/Dashboard memakai data user login
- [ ] (Opsional) data default untuk user baru
- [ ] Test isolasi lulus; Pint/PHPStan/ESLint bersih
- [ ] Deploy + migrasi (backfill bila perlu)
