# SEPOffice – Panduan Pengguna

**Versi 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Kandungan

1. [Gambaran Keseluruhan](#1-gambaran-keseluruhan)
2. [Pemasangan dan Permulaan](#2-pemasangan-dan-permulaan)
3. [Papan Pemuka](#3-papan-pemuka)
4. [SEPWrite – Pemproses Kata](#4-sepwrite--pemproses-kata)
5. [SEPGrid – Hamparan Kerja](#5-sepgrid--hamparan-kerja)
6. [SEPShow – Pembentangan](#6-sepshow--pembentangan)
7. [Eliot – Pembantu AI](#7-eliot--pembantu-ai)
8. [Tetapan](#8-tetapan)
9. [Pintasan Papan Kekunci](#9-pintasan-papan-kekunci)

---

## 1. Gambaran Keseluruhan

SEPOffice ialah suite pejabat desktop berkuasa AI untuk Windows yang terdiri daripada tiga aplikasi bersepadu:

| Aplikasi | Fungsi |
|----------|--------|
| **SEPWrite** | Mencipta dokumen teks kaya, eksport ke Word/PDF |
| **SEPGrid** | Hamparan kerja dengan formula dan carta |
| **SEPShow** | Pembentangan dengan editor kanvas |

Ketiga-tiga aplikasi bersambung kepada **Eliot** – pembantu AI terbina dalam yang menulis teks, menjana formula, dan mereka bentuk slaid.

---

## 2. Pemasangan dan Permulaan

### Pemasang
Jalankan `SEPOffice Setup 1.0.1.exe`. Wizard akan memandu langkah-langkah pemasangan:
- Folder pemasangan boleh dipilih (lalai: `Program Files\SEPOffice`)
- Cipta item menu Mula
- Pintasan desktop (pilihan)

### Jalankan Terus (tanpa pemasangan)
Jalankan `release\win-unpacked\SEPOffice.exe`.

### Permulaan Pertama
Pada permulaan pertama, perkhidmatan AI memuatkan model bahasa (Qwen2.5-0.5B) di latar belakang. Kemajuan boleh dilihat dalam widget sembang Eliot di kanan bawah. Bergantung pada perkakasan, ia memerlukan masa **1–5 minit**.

> **Nota:** Aplikasi sedia untuk digunakan serta-merta – Eliot aktif apabila bar kemajuan mencapai 100%.

---

## 3. Papan Pemuka

Papan Pemuka ialah halaman utama SEPOffice.

### Tiga Jubin Aplikasi
- **SEPWrite** – Cipta atau buka dokumen
- **SEPGrid** – Cipta atau buka hamparan kerja
- **SEPShow** – Cipta atau buka pembentangan

### Dokumen Terkini
Di bawah jubin, dokumen yang baru diedit dipaparkan bersama ikon jenis, nama, dan tarikh pengubahsuaian terakhir.

### Navigasi

| Elemen | Fungsi |
|--------|--------|
| **SEPWrite / SEPGrid / SEPShow** | Tukar antara aplikasi |
| ⚙️ | Buka tetapan |
| ⌨️ | Paparkan pintasan papan kekunci |
| 🌙 / ☀️ | Togol mod gelap/terang |

---

## 4. SEPWrite – Pemproses Kata

SEPWrite ialah editor teks kaya moden berasaskan **TipTap**.

### 4.1 Pemformatan

| Simbol | Fungsi | Pintasan |
|--------|--------|----------|
| **Tebal** | Tebal | `Ctrl + B` |
| *Condong* | Condong | `Ctrl + I` |
| <u>Garis bawah</u> | Garis bawah | `Ctrl + U` |
| Tajuk 1 | Tajuk 1 | — |
| Tajuk 2 | Tajuk 2 | — |

### 4.2 Sisipkan Imej
**Sisip → Imej**: Muat naik dengan seret atau pilih fail.

### 4.3 Simpan dan Eksport

| Tindakan | Penerangan |
|----------|-----------|
| **Simpan** | Simpan automatik ke storan penyemak imbas setempat |
| **Eksport sebagai .docx** | Muat turun dokumen serasi Word |
| **Cetak / PDF** | Pratonton cetak, kemudian cetak atau simpan sebagai PDF |

---

## 5. SEPGrid – Hamparan Kerja

SEPGrid ialah hamparan kerja yang berkuasa dengan **10,000 baris × 26 lajur** setiap helaian – serupa dengan Microsoft Excel dan OpenOffice Calc.

### 5.1 Operasi Asas

| Tindakan | Penerangan |
|----------|-----------|
| Klik sel | Pilih sel |
| Klik dua kali / F2 | Edit sel |
| `Enter` | Sahkan, baris seterusnya |
| `Tab` | Sahkan, lajur seterusnya |
| `Escape` | Batalkan pengeditan |
| `Ctrl + Z` | Buat asal |
| `Ctrl + Y` | Buat semula |
| `Ctrl + C` | Salin |
| `Ctrl + V` | Tampal |
| `Ctrl + X` | Potong |
| `Ctrl + B` | Tebal |
| `Ctrl + I` | Condong |
| `Ctrl + U` | Garis bawah |
| `Ctrl + F` | Cari dan ganti |
| `Del` | Padam kandungan sel |

**Berbilang pilih:** Seret tetikus atau `Shift + klik`.

**Pemegang isi:** Seret kotak biru di penjuru kanan bawah sel untuk menyalin nilai atau formula.

### 5.2 Bar Formula

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Alamat sel   Simbol          Medan input (menunjukkan formula mentah)
```

- **Alamat sel**: Menunjukkan sel aktif atau pilihan (mis.: `A1:B5`)
- **Simbol fx**: Menunjukkan input formula
- **Medan input**: Sentiasa menunjukkan formula mentah – bukan hasilnya

**Paparan ralat:** Untuk ralat formula seperti `#ERROR`, `#REF!`, `#DIV/0!` medan dikelilingi sempadan merah.

### 5.3 Memasukkan Formula

Input formula sentiasa bermula dengan `=`:

```
=SUM(A1:A10)               Jumlah
=AVERAGE(B1:B5)            Purata
=MAX(C1:C100)              Nilai maksimum
=MIN(D1:D50)               Nilai minimum
=COUNT(A:A)                Kiraan
=IF(A1>0;"Ya";"Tidak")     Syarat
=VLOOKUP(...)              Carian menegak
=ROUND(A1; 2)              Pembundaran
```

#### Rujukan formula dengan klik tetikus

1. Taip `=` atau fungsi seperti `=SUM(`
2. Klik sel yang dikehendaki → alamat dimasukkan
3. Seret untuk julat → julat dimasukkan (mis.: `A1:B10`)

### 5.4 Formula Merentasi Helaian

Rujukan kepada helaian lain – sama seperti Excel:

```
=Sheet2!A1                    Sel tunggal daripada Sheet2
=SUM(Sheet2!A1:B10)           Jumlah daripada Sheet2
=Sheet1!A1 + Sheet2!B5        Gabungan pelbagai helaian
=AVERAGE(Jualan!C1:C100)      Julat daripada helaian 'Jualan'
```

**Dengan klik tetikus:**
1. Taip `=` dalam sel
2. Klik tab helaian lain → `Sheet2!` dimasukkan
3. Klik sel yang dikehendaki → `A1` ditambah

### 5.5 Format Nombor

Daripada **simbol 123** di bar alat:

| Format | Contoh | Penerangan |
|--------|--------|-----------|
| Umum | 1234.5 | Tiada format |
| Nombor | 1,234.56 | Format 2 perpuluhan |
| Mata wang | RM1,234.56 | Format mata wang |
| Peratusan | 12.5% | Nilai×100 dengan simbol % |
| Ribuan | 1,234 | Nombor bulat dengan pemisah ribuan |
| Tarikh | 24/02/2026 | Format tarikh |

### 5.6 Gabungkan Sel

1. Pilih julat sel
2. **Sisip → Gabungkan sel**
3. Hanya nilai sel kiri atas yang dikekalkan

**Nyahgabung:** **Sisip → Nyahgabung sel**

### 5.7 Format Bersyarat

1. Pilih julat
2. **Edit → Format bersyarat...**
3. Pilih peraturan: Lebih besar daripada / Lebih kecil daripada / Sama dengan / Antara / Mengandungi teks
4. Pilih warna teks dan latar belakang
5. **Tambah**

**Padam:** Pilih julat → **Edit → Padam format bersyarat**

### 5.8 Bekukan Baris/Lajur

1. Pilih sel tempat pengguliran dimulakan
2. **Paparan → Bekukan baris/lajur**
3. Semua baris di atas dan lajur di kiri dibekukan

**Nyahbeku:** **Paparan → Nyahbeku**

### 5.9 Ulasan

1. Pilih sel → **Sisip → Tambah ulasan** → Masukkan teks → OK
2. Sel dengan ulasan memaparkan **segitiga merah** di penjuru kanan atas

### 5.10 Cari dan Ganti

`Ctrl + F` atau **Edit → Cari dan ganti**:
- **Cari**: Navigasi dengan ◀ ▶
- **Ganti**: Satu persatu atau semua sekaligus

### 5.11 Sisipkan/Padam Baris dan Lajur

Daripada menu **Sisip**: Sisipkan baris di atas/bawah, sisipkan lajur di kiri/kanan, padam baris/lajur.

### 5.12 Bar Status

Di bahagian bawah, statistik berbilang pilih dipaparkan secara automatik:

```
Σ Jumlah: 12,345   ⌀ Purata: 1,234   ↓ Min: 100   ↑ Maks: 5,000   Kiraan: 10
```

### 5.13 Import / Eksport

| Ciri | Format | Penerangan |
|------|--------|-----------|
| Import | `.xlsx`, `.xlsm` | Buka fail Excel |
| Import CSV | `.csv` | Fail dipisah koma/titik koma |
| Eksport | `.xlsx` | Simpan sebagai fail Excel |
| Eksport CSV | `.csv` | Simpan sebagai CSV (UTF-8, titik koma) |
| Cetak / PDF | — | Pratonton cetak, hanya baris berdata |
| Sisip imej | PNG, JPG | Benam imej dalam hamparan kerja |

### 5.14 Ciri AI

#### Penjana Formula AI
Klik **✨** di bar formula:
> "Kira purata semua nilai positif dalam lajur B"
> → `=AVERAGEIF(B:B;">0")`

#### Pembantu Jadual AI
> "Cipta jadual jualan bulanan untuk 2025. Lajur: Bulan, Hasil, Kos, Keuntungan"

### 5.15 Senarai Pintasan

| Pintasan | Fungsi |
|----------|--------|
| `Ctrl + Z` | Buat asal |
| `Ctrl + Y` | Buat semula |
| `Ctrl + C` | Salin |
| `Ctrl + V` | Tampal |
| `Ctrl + X` | Potong |
| `Ctrl + B` | Tebal |
| `Ctrl + I` | Condong |
| `Ctrl + U` | Garis bawah |
| `Ctrl + F` | Cari dan ganti |
| `F2` | Edit sel |
| `Enter` | Sahkan + ke bawah |
| `Tab` | Sahkan + ke kanan |
| `Escape` | Batalkan |
| `Del` | Padam kandungan |
| `Shift + klik` | Perluaskan pilihan |

---

## 6. SEPShow – Pembentangan

SEPShow ialah editor pembentangan slaid berasaskan **Konva** (pemapar kanvas).

### 6.1 Antara Muka

| Kawasan | Penerangan |
|---------|-----------|
| **Bar sisi kiri** | Senarai slaid – pratonton, seret untuk menukar susunan |
| **Kawasan utama** | Editor kanvas untuk slaid aktif |
| **Bar alat** | Alat, eksport, mod pembentangan |
| **Nota pembentang** | Nota untuk slaid semasa |

### 6.2 Mod Pembentangan

Klik **Bentangkan** untuk pembentangan skrin penuh:
- Navigasi: Kekunci anak panah `→` / `←` atau klik
- `Esc` untuk keluar daripada mod pembentangan

---

## 7. Eliot – Pembantu AI

Eliot ialah pembantu AI terbina dalam yang tersedia dalam ketiga-tiga aplikasi.

### 7.1 Widget Sembang

**Ikon Eliot terapung** berada di kanan bawah semua aplikasi.

#### Penunjuk Status

| Simbol | Status |
|--------|--------|
| 💬 (normal) | AI sedia |
| ⏳ (berputar) | AI sedang dimuatkan |
| ❌ (merah) | Ralat atau tidak bersambung |

---

## 8. Tetapan

### Tetapan AI
| Pilihan | Penerangan |
|---------|-----------|
| **URL API** | URL bahagian belakang AI (lalai: `http://localhost:8080`) |
| **Kunci API** | Pilihan, untuk API AI luaran |
| **Uji sambungan** | Semak sama ada perkhidmatan AI boleh diakses |

### Bahasa
SEPOffice menyokong **29 bahasa**. Bahasa boleh dipilih dalam dialog tetapan.

---

## 9. Pintasan Papan Kekunci

### Global

| Pintasan | Fungsi |
|----------|--------|
| `Ctrl + Z` | Buat asal |
| `Ctrl + Y` | Buat semula |
| `Ctrl + S` | Simpan |

### SEPGrid

| Pintasan | Fungsi |
|----------|--------|
| `Enter` | Sahkan sel, ke bawah |
| `Tab` | Sahkan sel, ke kanan |
| `Escape` | Batalkan pengeditan |
| `Ctrl + C` | Salin |
| `Ctrl + V` | Tampal |
| `F2` | Edit sel |
| Kekunci anak panah | Navigasi antara sel |

---

## Nota Teknikal

- **Penyimpanan data:** Semua dokumen disimpan dalam storan penyemak imbas setempat. Tiada data dihantar ke pelayan luaran.
- **Model AI:** Qwen2.5-0.5B berjalan sepenuhnya secara setempat – tiada sambungan internet diperlukan untuk ciri AI.
- **Keperluan sistem:** Windows 10/11, minimum 4 GB RAM (8 GB disyorkan untuk model AI)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
