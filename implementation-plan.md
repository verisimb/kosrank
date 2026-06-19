# IMPLEMENTATION PLAN — KosRank (SPK Pemilihan Kos Metode SAW)

Dokumen ini adalah rencana implementasi teknis turunan dari `plan.md`. Setiap langkah memiliki checkbox untuk tracking progres. Centang `[x]` ketika sebuah item selesai dikerjakan dan diverifikasi (lulus test / berfungsi di UI).

## Konteks Teknis (Stack Terpasang)

Proyek ini sudah berupa Laravel starter kit yang berjalan. Implementasi fitur SPK dibangun di atas fondasi berikut, **tanpa mengubah dependency tanpa persetujuan**:

- Backend: PHP 8.4, Laravel 13, Laravel Fortify v1 (auth sudah jadi: login/register/verify/2FA).
- Frontend: Inertia.js v3 + React 19, TypeScript, Tailwind CSS v4, komponen UI shadcn di `resources/js/components/ui`.
- **UI Theme/Preset (WAJIB):** gunakan preset shadcn kustom melalui `npx shadcn@latest init --preset bbVKEbY --template laravel`. Seluruh komponen & tema mengikuti preset ini.
- Routing typed: Laravel Wayfinder v0 (`@/actions`, `@/routes`) — jalankan `php artisan wayfinder:generate` setelah ubah route/controller.
- Database: MySQL (`kosrank` untuk development, `kosrank_testing` untuk testing).
- Testing: Pest v4, PHPUnit v12.
- Formatter/Linter: Pint, ESLint v9, Prettier v3, Larastan v3.

### Konvensi yang Harus Diikuti

- **Bahasa (WAJIB):** Aplikasi ini hanya untuk pengguna Indonesia. SEMUA teks yang tampil ke pengguna harus **Bahasa Indonesia** — label, judul halaman, menu/navigasi, tombol, placeholder, pesan validasi, notifikasi/toast, dialog konfirmasi, header tabel, empty state, dan pesan error. Tidak boleh ada teks UI berbahasa Inggris.
  - Identifier kode (nama variabel, fungsi, kelas, route, kolom DB) tetap Bahasa Inggris sesuai konvensi teknis; hanya teks yang dilihat pengguna yang Bahasa Indonesia.
  - Set `APP_LOCALE=id` dan sediakan file terjemahan `lang/id/` untuk pesan validasi Laravel agar error validasi tampil dalam Bahasa Indonesia.
  - Gunakan format angka/mata uang Indonesia bila relevan (mis. `Rp 700.000`, pemisah ribuan titik).
- Halaman Inertia di `resources/js/pages`, render via `Inertia::render()` di controller.
- Auth sudah aktif: semua route fitur SPK diletakkan dalam grup `middleware(['auth', 'verified'])` mengikuti pola `dashboard` di `routes/web.php`.
- Navigasi sidebar dikonfigurasi di `resources/js/components/app-sidebar.tsx`.
- Gunakan `php artisan make:*` untuk membuat file backend, FormRequest untuk validasi, dan factory + seeder untuk setiap model.
- Setelah ubah PHP: jalankan `vendor/bin/pint --dirty --format agent`.
- Setiap perubahan harus punya test (Pest) dan dijalankan dengan `php artisan test --compact`.

---

## Model Data (Desain Skema)

Tiga tabel inti:

**`criteria`** (kriteria penilaian)
- `id` — PK
- `code` — string unik (C1, C2, ...)
- `name` — string (nama kriteria)
- `type` — enum: `benefit` | `cost`
- `weight` — decimal(5,2) (bobot dalam persen, mis. 35.00)
- `unit` — string nullable (satuan, mis. "Rp", "km", "skala 1-5")
- `timestamps`

**`alternatives`** (alternatif kos)
- `id` — PK
- `code` — string unik (A1, A2, ...)
- `name` — string (nama kos)
- `location` — string (alamat / lokasi singkat)
- `timestamps`

**`alternative_values`** (nilai tiap alternatif per kriteria — pivot bernilai)
- `id` — PK
- `alternative_id` — FK → alternatives (cascade on delete)
- `criterion_id` — FK → criteria (cascade on delete)
- `value` — decimal(12,2) (nilai mentah)
- `timestamps`
- unique(`alternative_id`, `criterion_id`)

---

## Catatan Ketepatan SAW (WAJIB diikuti)

Hasil verifikasi metode terhadap data awal sudah benar (rekomendasi: Kos C). Tiga aturan berikut wajib dipatuhi agar perhitungan tetap akurat:

1. **Nilai kriteria cost harus > 0 (bukan hanya ≥ 0).** Normalisasi cost = `min / nilai`, sehingga nilai 0 menyebabkan pembagian nol. Validasi input untuk kriteria bertipe `cost` menggunakan `gt:0`; kriteria `benefit` boleh `≥ 0`. Service tetap punya guard pembagian nol sebagai lapis kedua.
2. **Normalisasi bobot pakai `wj / Σwj`.** Walau total bobot divalidasi 100%, service membagi tiap bobot dengan total bobot aktual (bukan hardcode /100) agar tetap valid jika ada selisih pembulatan.
3. **Presisi desimal:** perhitungan internal memakai presisi penuh (float), pembulatan (mis. 4 angka) HANYA untuk tampilan, agar hasil sistem identik dengan perhitungan manual/spreadsheet.

---

## FASE 0 — Persiapan & Verifikasi Lingkungan

- [x] Pastikan dependency terpasang: `composer install` dan `npm install` sudah jalan. ✅ DONE
- [x] **Inisialisasi preset UI shadcn kustom:** jalankan `npx shadcn@latest init --preset bbVKEbY --template laravel`. ✅ DONE
  - Diterapkan: style `radix-maia`, base `neutral`, icon library `hugeicons`; dependency baru (`radix-ui`, `next-themes`, `@hugeicons/*`, `@fontsource-variable/inter`) terpasang; 23 komponen `ui` di-overwrite; `resources/css/app.css` ter-update.
  - Catatan: shadcn salah deteksi `pnpm` karena `pnpm-workspace.yaml` (pnpm tidak terpasang). Solusi: file sementara di-rename agar init pakai npm, lalu dikembalikan.
  - Catatan: hapus duplikat hook `use-mobile.ts` (shadcn) demi mempertahankan `use-mobile.tsx` yang SSR-safe; bersihkan import `tw-animate-css` ganda di `app.css`.
  - Verifikasi: `npm run build` sukses.
- [ ] Tambahkan komponen shadcn yang dibutuhkan fitur SPK bila belum ada (mis. `table`) via `npx shadcn@latest add table` mengikuti preset yang sama.
- [x] Pastikan `.env` punya `APP_KEY`, `DB_CONNECTION=mysql`, dan koneksi MySQL benar; database `kosrank` dibuat dan `php artisan migrate` baseline sukses. ✅ DONE
  - `phpunit.xml` diupdate ke `DB_CONNECTION=mysql`, `DB_DATABASE=kosrank_testing`; database `kosrank_testing` dibuat.
  - `tests/Pest.php` — `RefreshDatabase` diaktifkan (sebelumnya dikomentari).
  - `.env.example` diupdate ke MySQL defaults.
- [x] **Lokalisasi Bahasa Indonesia:** set `APP_LOCALE=id` (dan `APP_FALLBACK_LOCALE=id`) di `.env`/`config/app.php`, lalu publish/buat file terjemahan validasi `lang/id/validation.php`. Verifikasi pesan validasi tampil Bahasa Indonesia. ✅ DONE
- [x] Verifikasi app berjalan: dev server berjalan, semua halaman (welcome, login, register, dashboard, settings) render 200 via SSR. ✅ DONE
- [x] Jalankan test baseline `php artisan test --compact` — 25 passed, 4 skipped (Fortify 2FA off — expected). ✅ DONE
- [x] Konfirmasi rencana penamaan: aplikasi = **KosRank**, metode = **SAW**. ✅ DONE

---

## FASE 1 — Lapisan Data (Migration, Model, Factory, Seeder) ✅ SELESAI

### 1.1 Migration
- [x] Buat migration `criteria`: `php artisan make:migration create_criteria_table`. ✅
- [x] Buat migration `alternatives`: `php artisan make:migration create_alternatives_table`. ✅
- [x] Buat migration `alternative_values` dengan FK + unique constraint. ✅
- [x] Definisikan kolom sesuai desain skema di atas (`enum` untuk `type`, `decimal` untuk `weight`/`value`). ✅
  - Catatan: ketiga migration diberi timestamp berurutan (criteria → alternatives → alternative_values) agar FK terbentuk dengan urutan benar.
- [x] Jalankan `php artisan migrate` — ketiga tabel terbuat. ✅

### 1.2 Model
- [x] Buat model `Criterion` (tabel `criteria`). ✅
- [x] Buat model `Alternative`. ✅
- [x] Buat model `AlternativeValue`. ✅
- [x] Tambahkan `$fillable`, casts (`weight`/`value` → `decimal:2`, `type` → enum), dan relasi (hasMany + belongsToMany withPivot `value`). ✅
- [x] Buat Enum `App\Enums\CriterionType` (`Benefit`, `Cost`) dengan TitleCase keys dan cast di model. ✅

### 1.3 Factory & Seeder
- [x] Buat factory untuk `Criterion` (+ state `benefit`/`cost`), `Alternative`, `AlternativeValue`. ✅
- [x] Buat `CriteriaSeeder` dengan 4 kriteria awal (C1 Harga/cost/35, C2 Jarak/cost/30, C3 Fasilitas/benefit/20, C4 Keamanan/benefit/15). ✅
- [x] Buat `AlternativeSeeder` dengan 5 kos awal (Kos A–E) beserta `alternative_values` sesuai `plan.md`. ✅
- [x] Daftarkan seeder di `DatabaseSeeder` dan jalankan `php artisan db:seed`. ✅
- [x] Verifikasi data: 4 kriteria (total bobot **100.00**), 5 alternatif, 20 nilai. PHPStan & Pint bersih, test suite hijau (25 passed). ✅

---

## FASE 2 — Service Layer Perhitungan SAW ✅ SELESAI

Logika perhitungan dipisah ke service agar mudah diuji dan transparan.

- [x] Buat `app/Services/SawCalculatorService.php`. ✅
- [x] Implementasi method `calculate()` yang mengembalikan struktur lengkap & transparan: ✅
  - matriks keputusan awal (raw values per alternatif × kriteria)
  - nilai min/max tiap kriteria
  - matriks normalisasi (benefit: `nilai / max`; cost: `min / nilai`)
  - matriks terbobot (`normalisasi × bobot`), bobot dinormalkan `w/Σw`
  - skor preferensi `Vi` (penjumlahan baris terbobot)
  - ranking terurut dari skor tertinggi
- [x] Guard validasi di service: data nilai lengkap, tidak ada pembagian nol (cost nilai 0 / max benefit 0) → lempar `App\Exceptions\SawCalculationException`. ✅
- [x] Normalisasi bobot `w/Σw`; perhitungan internal presisi penuh (float), pembulatan hanya untuk tampilan. ✅
- [x] Buat DTO `App\Services\SawResult` (readonly) ber-PHPDoc `@phpstan-type` untuk tiap tahapan + `best()` & `toArray()`. ✅
- [x] Tulis **test** `SawCalculatorServiceTest` (7 test): bandingkan skor & ranking dengan perhitungan manual Kos A–E (rekomendasi Kos C), uji normalisasi benefit/cost, normalisasi bobot `w/Σw`, dan penolakan data tidak lengkap / cost nol / kosong. ✅
- [x] Jalankan `php artisan test --compact --filter=Saw` → **7 passed**. PHPStan & Pint bersih. ✅

---

## FASE 3 — Manajemen Kriteria (CRUD) ✅ SELESAI

### Backend
- [x] Buat `CriterionController` (index/store/update/destroy). ✅
- [x] Buat `StoreCriterionRequest` & `UpdateCriterionRequest` (validasi: `name` required, `weight` numeric `gt:0` `max:100`, `type` enum benefit/cost, `code` unik; pesan + atribut Bahasa Indonesia). ✅
- [x] Implementasi `index` (daftar kriteria + `totalWeight`), `store`, `update`, `destroy`. ✅
- [x] Flash message sukses (`Inertia::flash('toast', ...)`) pada store/update/destroy. ✅
- [x] Daftarkan `Route::resource('criteria')` (param `criterion`) dalam grup `auth,verified` di `routes/web.php`. ✅
- [x] Jalankan `php artisan wayfinder:generate`. ✅

### Frontend
- [x] Buat halaman `resources/js/pages/criteria/index.tsx` (tabel kriteria responsif + badge Benefit/Cost). ✅
- [x] Form tambah/edit via dialog memakai `useForm` + komponen UI `input`, `select`, `label`. ✅
- [x] Konfirmasi hapus pakai `dialog`; toast via `use-flash-toast` (di-wire ke `app-sidebar-layout`). ✅
- [x] Indikator total bobot: hijau bila 100%, peringatan amber bila ≠ 100%. ✅
- [x] Tambahkan komponen UI `table` (shadcn preset) & item menu "Kriteria" di `app-sidebar.tsx`. ✅

### Test
- [x] `CriterionManagementTest` (7 test): tampil daftar+total bobot, create, update, delete, tolak data invalid, tolak kode duplikat, wajib login. **7 passed**. ✅
- [x] Verifikasi: full suite **39 passed / 4 skipped**, PHPStan & Pint bersih, halaman render 200 via SSR. ✅

---

## FASE 4 — Manajemen Alternatif (CRUD) ✅ SELESAI

### Backend
- [x] Buat `AlternativeController` (index/store/update/destroy). ✅
- [x] Buat `StoreAlternativeRequest` & `UpdateAlternativeRequest` (validasi: `name` required, `code` unik, `location` required; atribut Bahasa Indonesia). ✅
- [x] Implementasi index/store/update/destroy + flash toast Bahasa Indonesia. ✅
- [x] Daftarkan `Route::resource('alternatives')` dalam grup `auth,verified` + `php artisan wayfinder:generate`. ✅
  - Catatan: pembuatan baris nilai dilakukan di Fase 5 (halaman matriks nilai), bukan saat create alternatif.

### Frontend
- [x] Buat halaman `resources/js/pages/alternatives/index.tsx` (tabel daftar kos responsif). ✅
- [x] Form tambah/edit via dialog (`useForm`) + konfirmasi hapus + toast. ✅
- [x] Tambahkan item menu "Alternatif" di sidebar (ikon `Building2`). ✅

### Test
- [x] `AlternativeManagementTest` (8 test): tampil daftar, create, update, delete (+nilai ikut terhapus via cascade), tolak data invalid, tolak kode duplikat, wajib login. **7 passed** (8 termasuk login guard). ✅
- [x] Verifikasi: full suite **46 passed / 4 skipped**, PHPStan & Pint bersih, build sukses. ✅

---

## FASE 5 — Pengelolaan Nilai Alternatif ✅ SELESAI

### Backend
- [x] Buat `AlternativeValueController` (`index` menampilkan matriks, `update` simpan massal). ✅
- [x] Buat `UpdateAlternativeValuesRequest`: semua nilai wajib `numeric` & `min:0`; kriteria `cost` divalidasi `> 0` via `after()` (cegah pembagian nol); pesan Bahasa Indonesia. ✅
- [x] Implementasi simpan massal (upsert `updateOrCreate` dalam transaksi, abaikan id tak dikenal). ✅
- [x] Daftarkan route `values.index` (GET) & `values.update` (PUT) + `wayfinder:generate`. ✅

### Frontend
- [x] Buat halaman `resources/js/pages/values/index.tsx` berupa **matriks editable** (baris = alternatif, kolom = kriteria, input numerik). ✅
- [x] Header kolom menampilkan badge Benefit/Cost + satuan; error per sel ditampilkan inline (key `values.{altId}.{critId}`). ✅
- [x] Simpan via `useForm`, toast sukses, indikator kelengkapan data (terisi/total). ✅
- [x] Empty state bila belum ada kriteria/alternatif. Tambahkan item menu "Nilai Alternatif" di sidebar (ikon `Table2`). ✅

### Test
- [x] `AlternativeValueTest` (7 test): tampil matriks, simpan valid, update tanpa duplikat, tolak kosong, tolak non-angka, tolak cost nol, wajib login. **7 passed**. ✅
- [x] Verifikasi: full suite **53 passed / 4 skipped**, PHPStan & Pint bersih, build sukses, halaman render 200 via SSR. ✅

---

## FASE 6 — Halaman Perhitungan SAW (Transparansi Proses) ✅ SELESAI

### Backend
- [x] Buat `CalculationController@index` yang memanggil `SawCalculatorService`. ✅
- [x] Implementasi **validasi pra-perhitungan** via `App\Services\SawDataValidator` (kembalikan daftar pesan, jangan hitung) bila: ✅
  - belum ada kriteria / belum ada alternatif
  - jumlah alternatif < 5
  - ada nilai alternatif belum lengkap
  - total bobot ≠ 100%
  - nilai cost ≤ 0 (potensi pembagian nol)
- [x] Kirim seluruh tahapan perhitungan (`result.toArray()`) atau `validationErrors` sebagai props; service dibungkus try/catch sebagai lapis pengaman. ✅
- [x] Daftarkan route `calculation.index` + `php artisan wayfinder:generate`. ✅

### Frontend
- [x] Buat halaman `resources/js/pages/calculation/index.tsx` menampilkan berurutan: kriteria+bobot (+bobot ternormalisasi), matriks keputusan, min/max, matriks normalisasi, matriks terbobot, nilai preferensi `Vi` + ranking (terbaik di-highlight). ✅
- [x] State error/blokir ramah memakai `alert-error` + tombol menuju pengaturan kriteria bila validasi gagal. ✅
- [x] Tambahkan item menu "Perhitungan" di sidebar (ikon `Calculator`). ✅

### Test
- [x] `CalculationTest` (5 test): tolak saat belum ada data, tolak bobot ≠ 100%, tolak alternatif < 5, tampil seluruh tahapan saat data valid (best = Kos C), wajib login. **5 passed**. ✅
- [x] Verifikasi: full suite **58 passed / 4 skipped**, PHPStan & Pint bersih, build sukses. ✅

---

## FASE 7 — Hasil, Ranking & Rekomendasi ✅ SELESAI

### Backend
- [x] Buat `ResultController@index` (memakai `SawDataValidator` + `SawCalculatorService`) yang mengembalikan ranking final + alternatif terbaik (atau `validationErrors`). ✅

### Frontend
- [x] Buat halaman `resources/js/pages/result/index.tsx`: ✅
  - kartu rekomendasi utama (alternatif terbaik + skor + penjelasan)
  - grafik batang nilai preferensi memakai **shadcn `chart` (recharts)** — `ChartContainer` + `BarChart` horizontal, bar terbaik berwarna emerald, tooltip & label nilai. Dependency `recharts` ditambah atas persetujuan pengguna.
  - tabel ranking (peringkat, kode, nama kos, nilai akhir) dengan highlight peringkat 1 + badge "Terbaik"
- [x] Ranking terurut dari nilai tertinggi. ✅
- [x] State blokir ramah (`alert-error`) + tombol "Lengkapi Nilai Alternatif" bila data belum lengkap. ✅
- [x] Tambahkan item menu "Hasil & Rekomendasi" di sidebar (ikon `Trophy`). ✅

### Test
- [x] `ResultTest` (4 test): ranking terurut + rekomendasi (best = Kos C, peringkat 5 = Kos D), urutan skor menurun, error blokir saat data belum lengkap, wajib login. **4 passed**. ✅
- [x] Verifikasi: full suite **62 passed / 4 skipped**, PHPStan & Pint bersih, build sukses. ✅

---

## FASE 8 — Dashboard ✅ SELESAI

- [x] Buat `DashboardController@index` yang mengirim ringkasan: jumlah kriteria, jumlah alternatif, total bobot, metode (SAW), status kesiapan, dan alternatif terbaik (via `SawDataValidator` + `SawCalculatorService`). Route `dashboard` diubah dari `Route::inertia` ke controller. ✅
- [x] Update `resources/js/pages/dashboard.tsx`: kartu ringkasan (jumlah kriteria + total bobot, jumlah alternatif, metode) + kartu alternatif terbaik (nilai tertinggi) dengan tombol menuju Perhitungan & Hasil. ✅
- [x] Kondisi data belum lengkap: tampilkan ajakan melengkapi data + tombol "Mulai Perhitungan" (bukan error). ✅
- [x] `DashboardTest` diperluas (4 test): guest redirect, user bisa akses, ringkasan benar saat data lengkap (best = Kos C), tanda belum siap saat data kosong. **4 passed**. ✅
- [x] Verifikasi: full suite **64 passed / 4 skipped**, PHPStan & Pint bersih, lint bersih, build sukses. ✅

---

## FASE 9 — Penyempurnaan UI/UX & Responsif

- [ ] Pastikan semua tabel responsif (scroll horizontal di mobile).
- [ ] Pesan validasi jelas di setiap form; konfirmasi sebelum hapus di semua entitas.
- [ ] Toast notifikasi konsisten untuk simpan/ubah/hapus.
- [ ] Navigasi sidebar lengkap & breadcrumb tiap halaman.
- [ ] Uji tampilan di viewport desktop dan mobile.
- [ ] Jalankan `npm run build` untuk memastikan bundling sukses.

---

## FASE 10 — Validasi Hasil & Pengujian

### Black-box (12 skenario dari plan.md §12)
- [ ] 1. Tambah kriteria
- [ ] 2. Ubah kriteria
- [ ] 3. Hapus kriteria
- [ ] 4. Tambah alternatif
- [ ] 5. Ubah alternatif
- [ ] 6. Hapus alternatif
- [ ] 7. Simpan nilai alternatif
- [ ] 8. Tolak perhitungan saat data belum lengkap
- [ ] 9. Tolak perhitungan saat total bobot ≠ 100%
- [ ] 10. Tampilkan hasil saat data valid
- [ ] 11. Ranking terurut dari nilai tertinggi
- [ ] 12. Tampilan dapat digunakan di layar mobile

### Verifikasi Akurasi
- [ ] Bandingkan hasil skor & ranking sistem dengan perhitungan manual / spreadsheet untuk data awal.
- [ ] Perbaiki selisih pembulatan bila ada (tentukan presisi desimal konsisten, mis. 4 angka).
- [ ] Jalankan seluruh suite `php artisan test --compact` — semua hijau.
- [ ] Jalankan `vendor/bin/pint --format agent` dan `npm run lint` bersih.

---

## FASE 11 — UAT & Finalisasi

- [ ] Siapkan kuesioner UAT (6 aspek, skala 1–5) untuk minimal 5 mahasiswa.
- [ ] Kumpulkan hasil UAT dan hitung persentase penerimaan.
- [ ] (Opsional) Ganti data contoh dengan data kos nyata sebagai data final.
- [ ] Bersihkan data & tampilan, pastikan tidak ada bug kritis pada alur utama.
- [ ] Ambil screenshot aplikasi untuk dokumentasi.

---

## FASE 12 — Dokumentasi (hanya bila diminta untuk dibuatkan filenya)

Catatan: file dokumentasi hanya dibuat bila diminta secara eksplisit. Checklist isi yang perlu disiapkan:

- [ ] Deskripsi & tujuan aplikasi, studi kasus.
- [ ] Daftar alternatif, kriteria, bobot, dan jenis.
- [ ] Alur penggunaan & penjelasan metode SAW.
- [ ] Perhitungan manual + perbandingan dengan hasil sistem.
- [ ] Screenshot aplikasi.
- [ ] Hasil black-box testing & hasil UAT.
- [ ] Link repository, petunjuk menjalankan aplikasi, link/bukti demo.

---

## Definition of Done (Kriteria Selesai — plan.md §16)

- [ ] Kriteria dapat dikelola dinamis.
- [ ] Alternatif dapat dikelola dinamis.
- [ ] Nilai tiap alternatif dapat disimpan.
- [ ] Total bobot divalidasi (harus 100%).
- [ ] Metode SAW menghasilkan nilai yang benar.
- [ ] Proses normalisasi ditampilkan.
- [ ] Nilai preferensi ditampilkan.
- [ ] Ranking ditampilkan dari nilai tertinggi.
- [ ] Grafik hasil tersedia.
- [ ] Hasil sistem == perhitungan manual.
- [ ] Tidak ada bug kritis pada alur utama.
- [ ] Tampilan dapat digunakan di desktop & mobile.
- [ ] Black-box testing selesai.
- [ ] UAT selesai.
- [ ] Dokumentasi & repository tersedia.

---

## Catatan Urutan Eksekusi yang Disarankan

Mengikuti prioritas plan.md §17 (ketepatan data → ketepatan SAW → fungsi → validasi → transparansi → pengujian → dokumentasi → tampilan):

`Fase 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12`

Service SAW (Fase 2) dibuat lebih awal dan diuji dengan unit test agar ketepatan perhitungan terjamin sebelum membangun UI di atasnya.
