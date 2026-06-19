# PLAN — Sistem Pendukung Keputusan Pemilihan Kos Mahasiswa

## 1. Ringkasan Proyek

Bangun aplikasi web Sistem Pendukung Keputusan untuk membantu mahasiswa memilih tempat kos terbaik berdasarkan beberapa kriteria.

Aplikasi menggunakan metode **Simple Additive Weighting (SAW)** untuk mengolah data alternatif kos, melakukan normalisasi, menghitung nilai akhir, dan menghasilkan peringkat rekomendasi.

Proyek ini dibuat untuk memenuhi tugas UAS mata kuliah Sistem Pendukung Keputusan. Fokus utama adalah kelengkapan fungsi, ketepatan perhitungan, kemudahan penggunaan, dokumentasi, dan pengujian. Proyek tidak perlu memiliki fitur yang terlalu kompleks.

---

## 2. Judul Proyek

**Sistem Pendukung Keputusan Pemilihan Tempat Kos bagi Mahasiswa Menggunakan Metode Simple Additive Weighting Berbasis Web**

Nama aplikasi sementara:

**KosRank**

---

## 3. Tujuan

Aplikasi harus dapat:

1. Membantu mahasiswa membandingkan beberapa tempat kos.
2. Mengelola data kriteria pemilihan kos.
3. Mengelola data alternatif kos.
4. Menyimpan nilai setiap kos untuk setiap kriteria.
5. Melakukan perhitungan menggunakan metode SAW.
6. Menampilkan proses perhitungan secara transparan.
7. Menampilkan peringkat dan rekomendasi kos terbaik.
8. Menyediakan tampilan yang sederhana, responsif, dan mudah digunakan.

---

## 4. Ruang Lingkup

Gunakan ruang lingkup minimal berikut:

- Satu metode SPK, yaitu SAW.
- Minimal 4 kriteria.
- Minimal 5 alternatif kos.
- Terdapat kriteria bertipe benefit dan cost.
- Pengguna dapat menambah, mengubah, dan menghapus data.
- Sistem menampilkan hasil perhitungan dan ranking.
- Sistem tidak memerlukan autentikasi atau pembagian role.

---

## 5. Kriteria Awal

Gunakan empat kriteria berikut sebagai data awal:

| Kode | Kriteria | Jenis | Bobot Awal |
|---|---|---|---:|
| C1 | Harga sewa per bulan | Cost | 35% |
| C2 | Jarak ke kampus | Cost | 30% |
| C3 | Kelengkapan fasilitas | Benefit | 20% |
| C4 | Keamanan | Benefit | 15% |

Ketentuan:

- Total bobot harus 100%.
- Bobot dan jenis kriteria dapat diubah.
- Pengguna dapat menambahkan kriteria baru.
- Sistem harus mendukung satuan data yang berbeda.

---

## 6. Alternatif Awal

Sediakan minimal lima data kos sebagai data contoh.

Setiap alternatif minimal memiliki:

- Kode alternatif
- Nama kos
- Alamat atau lokasi singkat
- Nilai untuk setiap kriteria

Contoh data awal:

| Alternatif | Harga | Jarak | Fasilitas | Keamanan |
|---|---:|---:|---:|---:|
| Kos A | 700000 | 1.0 | 4 | 3 |
| Kos B | 600000 | 1.8 | 3 | 4 |
| Kos C | 850000 | 0.5 | 5 | 4 |
| Kos D | 550000 | 2.5 | 2 | 3 |
| Kos E | 750000 | 1.2 | 4 | 5 |

Data contoh dapat diganti dengan data kos nyata pada tahap akhir.

---

## 7. Fitur Utama

### 7.1 Dashboard

Tampilkan ringkasan berikut:

- Jumlah alternatif kos
- Jumlah kriteria
- Metode yang digunakan
- Alternatif terbaik
- Nilai tertinggi
- Tombol menuju proses perhitungan

### 7.2 Pengelolaan Kriteria

Pengguna dapat:

- Melihat daftar kriteria
- Menambah kriteria
- Mengubah kriteria
- Menghapus kriteria
- Menentukan bobot
- Menentukan jenis benefit atau cost

Validasi utama:

- Nama kriteria wajib diisi
- Bobot harus berupa angka positif
- Jenis wajib dipilih
- Total bobot harus 100% sebelum perhitungan dilakukan

### 7.3 Pengelolaan Alternatif

Pengguna dapat:

- Melihat daftar kos
- Menambah kos
- Mengubah data kos
- Menghapus kos

Data minimal:

- Kode
- Nama kos
- Alamat atau lokasi

### 7.4 Pengelolaan Nilai Alternatif

Pengguna dapat mengisi dan memperbarui nilai setiap alternatif untuk setiap kriteria.

Sistem harus memastikan:

- Semua alternatif memiliki nilai lengkap
- Nilai harus berupa angka
- Nilai tidak boleh kosong
- Nilai pada kriteria cost tidak boleh menyebabkan pembagian tidak valid

### 7.5 Proses Perhitungan SAW

Sistem harus menampilkan tahapan berikut:

1. Data kriteria dan bobot
2. Matriks keputusan awal
3. Nilai minimum atau maksimum setiap kriteria
4. Matriks hasil normalisasi
5. Hasil perkalian nilai normalisasi dengan bobot
6. Nilai preferensi setiap alternatif
7. Urutan ranking

Perhitungan dilakukan dengan aturan:

- Benefit: nilai alternatif dibagi nilai maksimum pada kriteria tersebut.
- Cost: nilai minimum pada kriteria tersebut dibagi nilai alternatif.
- Nilai akhir diperoleh dari penjumlahan nilai normalisasi yang telah dikalikan bobot.

### 7.6 Hasil dan Rekomendasi

Tampilkan:

- Peringkat setiap kos
- Nilai akhir setiap kos
- Alternatif terbaik
- Penjelasan singkat rekomendasi
- Grafik sederhana hasil ranking

Alternatif dengan nilai akhir tertinggi menjadi rekomendasi utama.

---

## 8. Alur Pengguna
1. Pengguna masuk/daftar
2. Pengguna membuka dashboard.
3. Pengguna memeriksa atau mengatur data kriteria.
4. Pengguna menambahkan data alternatif kos.
5. Pengguna mengisi nilai setiap kos untuk setiap kriteria.
6. Pengguna membuka halaman perhitungan.
7. Sistem memvalidasi kelengkapan data dan total bobot.
8. Sistem menjalankan metode SAW.
9. Sistem menampilkan seluruh proses perhitungan.
10. Sistem menampilkan ranking dan rekomendasi kos terbaik.

---

## 9. Tampilan dan Pengalaman Pengguna

Gunakan desain yang:

- Sederhana dan bersih
- Mudah dipahami mahasiswa
- Responsif di desktop dan perangkat mobile
- Memiliki navigasi yang jelas
- Menggunakan tabel yang mudah dibaca
- Memiliki pesan validasi yang jelas
- Menampilkan konfirmasi sebelum menghapus data
- Menampilkan notifikasi setelah data berhasil disimpan atau diubah

Tidak perlu membuat desain yang terlalu kompleks.

---

## 10. Batasan Proyek

Jangan menambahkan fitur berikut kecuali seluruh kebutuhan utama sudah selesai:

- Pembagian role pengguna
- Integrasi Google Maps
- Upload foto kos
- Rekomendasi berdasarkan akun pribadi
- Riwayat perhitungan kompleks
- Export PDF
- Multi-bahasa
- API eksternal
- Web scraping
- Machine learning
- Beberapa metode SPK sekaligus
- Fitur pembayaran atau pemesanan kos

Fokuskan pengerjaan pada fungsi wajib dan ketepatan perhitungan.

---

## 11. Validasi Sistem

Sistem tidak boleh menjalankan perhitungan jika:

- Belum ada kriteria
- Belum ada alternatif
- Jumlah alternatif kurang dari lima untuk data final
- Ada nilai alternatif yang belum diisi
- Total bobot tidak sama dengan 100%
- Ada nilai yang tidak valid
- Terdapat kondisi pembagian dengan nol

Tampilkan pesan kesalahan yang mudah dipahami pengguna.

---

## 12. Pengujian

Siapkan pengujian black-box minimal untuk skenario berikut:

1. Menambah kriteria
2. Mengubah kriteria
3. Menghapus kriteria
4. Menambah alternatif
5. Mengubah alternatif
6. Menghapus alternatif
7. Menyimpan nilai alternatif
8. Menolak perhitungan ketika data belum lengkap
9. Menolak perhitungan ketika total bobot tidak 100%
10. Menampilkan hasil perhitungan ketika data valid
11. Memastikan ranking diurutkan dari nilai tertinggi
12. Memastikan tampilan dapat digunakan pada layar mobile

Hasil perhitungan sistem harus dibandingkan dengan perhitungan manual atau spreadsheet.

---

## 13. User Acceptance Testing

Lakukan pengujian kepada minimal lima mahasiswa.

Aspek yang dinilai:

- Kemudahan penggunaan
- Kejelasan navigasi
- Kemudahan mengelola data
- Kejelasan proses perhitungan
- Kemudahan memahami ranking
- Kegunaan sistem dalam membantu memilih kos

Gunakan skala penilaian 1–5 dan hitung persentase penerimaan pengguna.

---

## 14. Dokumentasi yang Harus Disiapkan

Dokumentasi proyek minimal mencakup:

- Deskripsi aplikasi
- Tujuan sistem
- Studi kasus
- Daftar alternatif
- Daftar kriteria
- Bobot dan jenis kriteria
- Alur penggunaan
- Penjelasan metode SAW
- Perhitungan manual
- Screenshot aplikasi
- Hasil perbandingan perhitungan manual dan sistem
- Hasil black-box testing
- Hasil UAT
- Link repository
- Petunjuk menjalankan aplikasi
- Link aplikasi atau bukti demo

---

## 15. Tahapan Pengerjaan

### Tahap 1 — Persiapan

- Siapkan proyek dasar.
- Tentukan struktur halaman.
- Siapkan data contoh.
- Pastikan kebutuhan utama dipahami.

### Tahap 2 — Pengelolaan Data

- Buat pengelolaan kriteria.
- Buat pengelolaan alternatif.
- Buat pengelolaan nilai alternatif.
- Tambahkan validasi data.

### Tahap 3 — Perhitungan

- Implementasikan metode SAW.
- Tampilkan matriks keputusan.
- Tampilkan normalisasi.
- Tampilkan nilai akhir.
- Tampilkan ranking.

### Tahap 4 — Penyempurnaan Tampilan

- Buat dashboard.
- Tambahkan grafik.
- Tambahkan notifikasi.
- Pastikan responsif.

### Tahap 5 — Validasi

- Bandingkan hasil dengan perhitungan manual.
- Perbaiki selisih hasil atau pembulatan.
- Lakukan black-box testing.
- Lakukan UAT.

### Tahap 6 — Finalisasi

- Bersihkan data dan tampilan.
- Tambahkan data kos final.
- Siapkan screenshot.
- Lengkapi dokumentasi.
- Unggah source code.
- Siapkan aplikasi untuk demo.

---

## 16. Kriteria Selesai

Proyek dianggap selesai apabila:

- Kriteria dapat dikelola secara dinamis.
- Alternatif dapat dikelola secara dinamis.
- Nilai setiap alternatif dapat disimpan.
- Total bobot divalidasi.
- Metode SAW menghasilkan nilai yang benar.
- Proses normalisasi ditampilkan.
- Nilai preferensi ditampilkan.
- Ranking ditampilkan dari nilai tertinggi.
- Grafik hasil tersedia.
- Hasil sistem sama dengan perhitungan manual.
- Tidak ada bug kritis pada alur utama.
- Tampilan dapat digunakan di desktop dan mobile.
- Pengujian black-box telah dilakukan.
- UAT telah dilakukan.
- Dokumentasi dan repository tersedia.

---

## 17. Prioritas Pengerjaan

Urutan prioritas:

1. Ketepatan data
2. Ketepatan perhitungan SAW
3. Kelengkapan fungsi utama
4. Validasi input
5. Transparansi proses perhitungan
6. Pengujian
7. Dokumentasi
8. Penyempurnaan tampilan

Jangan mengorbankan ketepatan perhitungan demi fitur tambahan atau desain yang terlalu kompleks.
