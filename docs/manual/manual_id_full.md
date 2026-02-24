# SEPOffice – Panduan Pengguna

**Versi 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Daftar Isi

1. [Ikhtisar](#1-ikhtisar)
2. [Instalasi dan Mulai](#2-instalasi-dan-mulai)
3. [Dasbor](#3-dasbor)
4. [SEPWrite – Pengolah Kata](#4-sepwrite--pengolah-kata)
5. [SEPGrid – Lembar Kerja](#5-sepgrid--lembar-kerja)
6. [SEPShow – Presentasi](#6-sepshow--presentasi)
7. [Eliot – Asisten AI](#7-eliot--asisten-ai)
8. [Pengaturan](#8-pengaturan)
9. [Pintasan Keyboard](#9-pintasan-keyboard)

---

## 1. Ikhtisar

SEPOffice adalah suite kantor desktop bertenaga AI untuk Windows yang terdiri dari tiga aplikasi terintegrasi:

| Aplikasi | Fungsi |
|----------|--------|
| **SEPWrite** | Membuat dokumen teks kaya, ekspor ke Word/PDF |
| **SEPGrid** | Lembar kerja dengan rumus dan grafik |
| **SEPShow** | Presentasi dengan editor kanvas |

Ketiga aplikasi terhubung ke **Eliot** – asisten AI bawaan yang menulis teks, membuat rumus, dan merancang slide.

---

## 2. Instalasi dan Mulai

### Penginstal
Jalankan `SEPOffice Setup 1.0.1.exe`. Wizard akan memandu langkah-langkah instalasi:
- Folder instalasi dapat dipilih (default: `Program Files\SEPOffice`)
- Buat item menu Start
- Pintasan desktop (opsional)

### Jalankan Langsung (tanpa instalasi)
Jalankan `release\win-unpacked\SEPOffice.exe`.

### Pertama Kali Dijalankan
Saat pertama kali dijalankan, layanan AI memuat model bahasa (Qwen2.5-0.5B) di latar belakang. Kemajuan dapat dilihat di widget obrolan Eliot di kanan bawah. Tergantung perangkat keras, diperlukan waktu **1–5 menit**.

> **Catatan:** Aplikasi siap digunakan segera – Eliot aktif ketika bilah kemajuan mencapai 100%.

---

## 3. Dasbor

Dasbor adalah halaman beranda SEPOffice.

### Tiga Ubin Aplikasi
- **SEPWrite** – Buat atau buka dokumen
- **SEPGrid** – Buat atau buka lembar kerja
- **SEPShow** – Buat atau buka presentasi

### Dokumen Terbaru
Di bawah ubin, dokumen yang baru diedit ditampilkan dengan ikon jenis, nama, dan tanggal modifikasi terakhir.

### Navigasi

| Elemen | Fungsi |
|--------|--------|
| **SEPWrite / SEPGrid / SEPShow** | Beralih antar aplikasi |
| ⚙️ | Buka pengaturan |
| ⌨️ | Tampilkan pintasan keyboard |
| 🌙 / ☀️ | Toggle mode gelap/terang |

---

## 4. SEPWrite – Pengolah Kata

SEPWrite adalah editor teks kaya modern berbasis **TipTap**.

### 4.1 Pemformatan

| Simbol | Fungsi | Pintasan |
|--------|--------|----------|
| **Tebal** | Tebal | `Ctrl + B` |
| *Miring* | Miring | `Ctrl + I` |
| <u>Garis bawah</u> | Garis bawah | `Ctrl + U` |
| Jdl 1 | Judul 1 | — |
| Jdl 2 | Judul 2 | — |

### 4.2 Sisipkan Gambar
**Sisipkan → Gambar**: Unggah dengan seret atau pilih file.

### 4.3 Simpan dan Ekspor

| Tindakan | Keterangan |
|----------|-----------|
| **Simpan** | Simpan otomatis ke penyimpanan browser lokal |
| **Ekspor sebagai .docx** | Unduh dokumen yang kompatibel dengan Word |
| **Cetak / PDF** | Pratinjau cetak, lalu cetak atau simpan sebagai PDF |

---

## 5. SEPGrid – Lembar Kerja

SEPGrid adalah lembar kerja yang kuat dengan **10.000 baris × 26 kolom** per lembar – mirip dengan Microsoft Excel dan OpenOffice Calc.

### 5.1 Operasi Dasar

| Tindakan | Keterangan |
|----------|-----------|
| Klik sel | Pilih sel |
| Klik ganda / F2 | Edit sel |
| `Enter` | Konfirmasi, baris berikutnya |
| `Tab` | Konfirmasi, kolom berikutnya |
| `Escape` | Batalkan pengeditan |
| `Ctrl + Z` | Urungkan |
| `Ctrl + Y` | Ulangi |
| `Ctrl + C` | Salin |
| `Ctrl + V` | Tempel |
| `Ctrl + X` | Potong |
| `Ctrl + B` | Tebal |
| `Ctrl + I` | Miring |
| `Ctrl + U` | Garis bawah |
| `Ctrl + F` | Temukan dan ganti |
| `Del` | Hapus isi sel |

**Multi-pilih:** Seret mouse atau `Shift + klik`.

**Gagang isi:** Seret kotak biru di pojok kanan bawah sel untuk menyalin nilai atau rumus.

### 5.2 Bilah Rumus

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Alamat sel   Simbol          Kolom input (menampilkan rumus mentah)
```

- **Alamat sel**: Menampilkan sel aktif atau rentang yang dipilih (mis.: `A1:B5`)
- **Simbol fx**: Menunjukkan input rumus
- **Kolom input**: Selalu menampilkan rumus mentah – bukan hasilnya

**Tampilan kesalahan:** Untuk kesalahan rumus seperti `#ERROR`, `#REF!`, `#DIV/0!` kolom dikelilingi batas merah.

### 5.3 Memasukkan Rumus

Input rumus selalu dimulai dengan `=`:

```
=SUM(A1:A10)               Jumlah
=AVERAGE(B1:B5)            Rata-rata
=MAX(C1:C100)              Nilai terbesar
=MIN(D1:D50)               Nilai terkecil
=COUNT(A:A)                Hitung
=IF(A1>0;"Ya";"Tidak")     Kondisi
=VLOOKUP(...)              Pencarian vertikal
=ROUND(A1; 2)              Pembulatan
```

#### Referensi rumus dengan klik mouse

1. Ketik `=` atau fungsi seperti `=SUM(`
2. Klik sel yang diinginkan → alamat dimasukkan
3. Seret untuk rentang → rentang dimasukkan (mis.: `A1:B10`)

### 5.4 Rumus Lintas Lembar

Referensi ke lembar lain – persis seperti Excel:

```
=Sheet2!A1                    Sel tunggal dari Sheet2
=SUM(Sheet2!A1:B10)           Jumlah dari Sheet2
=Sheet1!A1 + Sheet2!B5        Kombinasi beberapa lembar
=AVERAGE(Penjualan!C1:C100)   Rentang dari lembar 'Penjualan'
```

**Dengan klik mouse:**
1. Ketik `=` di dalam sel
2. Klik tab lembar lain → `Sheet2!` dimasukkan
3. Klik sel yang diinginkan → `A1` ditambahkan

### 5.5 Format Angka

Dari **simbol 123** di bilah alat:

| Format | Contoh | Keterangan |
|--------|--------|-----------|
| Umum | 1234.5 | Tanpa format |
| Angka | 1.234,56 | Format 2 desimal |
| Mata uang | Rp1.234,56 | Format mata uang |
| Persentase | 12,5% | Nilai×100 dengan simbol % |
| Ribuan | 1.234 | Bilangan bulat dengan pemisah ribuan |
| Tanggal | 24/02/2026 | Format tanggal |

### 5.6 Gabungkan Sel

1. Pilih rentang sel
2. **Sisipkan → Gabungkan sel**
3. Hanya nilai sel kiri atas yang tetap dipertahankan

**Pisahkan sel:** **Sisipkan → Pisahkan sel**

### 5.7 Format Bersyarat

1. Pilih rentang
2. **Edit → Format bersyarat...**
3. Pilih aturan: Lebih besar dari / Lebih kecil dari / Sama dengan / Di antara / Berisi teks
4. Pilih warna teks dan latar belakang
5. **Tambahkan**

**Hapus:** Pilih rentang → **Edit → Hapus format bersyarat**

### 5.8 Bekukan Baris/Kolom

1. Pilih sel tempat pengguliran dimulai
2. **Tampilan → Bekukan baris/kolom**
3. Semua baris di atas dan kolom di kiri dibekukan

**Bebaskan:** **Tampilan → Bebaskan bekuan**

### 5.9 Komentar

1. Pilih sel → **Sisipkan → Tambahkan komentar** → Masukkan teks → OK
2. Sel dengan komentar menampilkan **segitiga merah** di pojok kanan atas

### 5.10 Temukan dan Ganti

`Ctrl + F` atau **Edit → Temukan dan ganti**:
- **Temukan**: Navigasi dengan ◀ ▶
- **Ganti**: Satu per satu atau semua sekaligus

### 5.11 Sisipkan/Hapus Baris dan Kolom

Dari menu **Sisipkan**: Sisipkan baris di atas/bawah, sisipkan kolom di kiri/kanan, hapus baris/kolom.

### 5.12 Bilah Status

Di bagian bawah, statistik multi-pilih ditampilkan secara otomatis:

```
Σ Jumlah: 12.345   ⌀ Rata-rata: 1.234   ↓ Min: 100   ↑ Maks: 5.000   Jumlah: 10
```

### 5.13 Impor / Ekspor

| Fitur | Format | Keterangan |
|-------|--------|-----------|
| Impor | `.xlsx`, `.xlsm` | Buka file Excel |
| Impor CSV | `.csv` | File dipisah koma/titik koma |
| Ekspor | `.xlsx` | Simpan sebagai file Excel |
| Ekspor CSV | `.csv` | Simpan sebagai CSV (UTF-8, titik koma) |
| Cetak / PDF | — | Pratinjau cetak, hanya baris berisi data |
| Sisipkan gambar | PNG, JPG | Sematkan gambar di lembar kerja |

### 5.14 Fitur AI

#### Generator Rumus AI
Klik **✨** di bilah rumus:
> "Hitung rata-rata semua nilai positif di kolom B"
> → `=AVERAGEIF(B:B;">0")`

#### Asisten Tabel AI
> "Buat tabel penjualan bulanan untuk 2025. Kolom: Bulan, Pendapatan, Biaya, Laba"

### 5.15 Daftar Pintasan

| Pintasan | Fungsi |
|----------|--------|
| `Ctrl + Z` | Urungkan |
| `Ctrl + Y` | Ulangi |
| `Ctrl + C` | Salin |
| `Ctrl + V` | Tempel |
| `Ctrl + X` | Potong |
| `Ctrl + B` | Tebal |
| `Ctrl + I` | Miring |
| `Ctrl + U` | Garis bawah |
| `Ctrl + F` | Temukan dan ganti |
| `F2` | Edit sel |
| `Enter` | Konfirmasi + ke bawah |
| `Tab` | Konfirmasi + ke kanan |
| `Escape` | Batalkan |
| `Del` | Hapus isi |
| `Shift + klik` | Perluas pilihan |

---

## 6. SEPShow – Presentasi

SEPShow adalah editor presentasi slide berbasis **Konva** (renderer kanvas).

### 6.1 Antarmuka

| Area | Keterangan |
|------|-----------|
| **Bilah sisi kiri** | Daftar slide – pratinjau, seret untuk mengubah urutan |
| **Area utama** | Editor kanvas untuk slide aktif |
| **Bilah alat** | Alat, ekspor, mode presentasi |
| **Catatan presenter** | Catatan untuk slide saat ini |

### 6.2 Mode Presentasi

Klik **Presentasikan** untuk presentasi layar penuh:
- Navigasi: Tombol panah `→` / `←` atau klik
- `Esc` untuk keluar dari mode presentasi

---

## 7. Eliot – Asisten AI

Eliot adalah asisten AI bawaan yang tersedia di ketiga aplikasi.

### 7.1 Widget Obrolan

**Ikon Eliot mengambang** ada di kanan bawah semua aplikasi.

#### Indikator Status

| Simbol | Status |
|--------|--------|
| 💬 (normal) | AI siap |
| ⏳ (berputar) | AI sedang dimuat |
| ❌ (merah) | Kesalahan atau tidak terhubung |

---

## 8. Pengaturan

### Pengaturan AI
| Opsi | Keterangan |
|------|-----------|
| **URL API** | URL backend AI (default: `http://localhost:8080`) |
| **Kunci API** | Opsional, untuk API AI eksternal |
| **Uji koneksi** | Periksa apakah layanan AI dapat diakses |

### Bahasa
SEPOffice mendukung **29 bahasa**. Bahasa dapat dipilih di dialog pengaturan.

---

## 9. Pintasan Keyboard

### Global

| Pintasan | Fungsi |
|----------|--------|
| `Ctrl + Z` | Urungkan |
| `Ctrl + Y` | Ulangi |
| `Ctrl + S` | Simpan |

### SEPGrid

| Pintasan | Fungsi |
|----------|--------|
| `Enter` | Konfirmasi sel, ke bawah |
| `Tab` | Konfirmasi sel, ke kanan |
| `Escape` | Batalkan pengeditan |
| `Ctrl + C` | Salin |
| `Ctrl + V` | Tempel |
| `F2` | Edit sel |
| Tombol panah | Navigasi antar sel |

---

## Catatan Teknis

- **Penyimpanan data:** Semua dokumen disimpan di penyimpanan browser lokal. Tidak ada data yang dikirim ke server eksternal.
- **Model AI:** Qwen2.5-0.5B berjalan sepenuhnya secara lokal – tidak perlu koneksi internet untuk fitur AI.
- **Persyaratan sistem:** Windows 10/11, minimum 4 GB RAM (disarankan 8 GB untuk model AI)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
