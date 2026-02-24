# SEPOffice – Kullanıcı Kılavuzu

**Sürüm 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## İçindekiler

1. [Genel Bakış](#1-genel-bakış)
2. [Kurulum ve Başlatma](#2-kurulum-ve-başlatma)
3. [Kontrol Paneli](#3-kontrol-paneli)
4. [SEPWrite – Kelime İşlemci](#4-sepwrite--kelime-işlemci)
5. [SEPGrid – Elektronik Tablo](#5-sepgrid--elektronik-tablo)
6. [SEPShow – Sunumlar](#6-sepshow--sunumlar)
7. [Eliot – AI Asistan](#7-eliot--ai-asistan)
8. [Ayarlar](#8-ayarlar)
9. [Klavye Kısayolları](#9-klavye-kısayolları)

---

## 1. Genel Bakış

SEPOffice, Windows için yapay zeka destekli bir masaüstü ofis paketidir ve üç entegre uygulamadan oluşmaktadır:

| Uygulama | İşlev |
|----------|-------|
| **SEPWrite** | Zengin metin belgesi oluşturma, Word/PDF'e aktarma |
| **SEPGrid** | Formüller ve grafiklerle elektronik tablo |
| **SEPShow** | Tuval düzenleyiciyle sunum oluşturma |

Her üç uygulama da **Eliot** ile bağlantılıdır – metinler oluşturan, formüller üreyen ve slaytlar tasarlayan yerleşik bir AI asistanı.

---

## 2. Kurulum ve Başlatma

### Kurulum Programı
`SEPOffice Setup 1.0.1.exe` dosyasını çalıştırın. Sihirbaz kurulum sürecinde size rehberlik eder:
- Seçilebilir kurulum klasörü (varsayılan: `Program Files\SEPOffice`)
- Başlat menüsü öğesi oluşturulur
- İsteğe bağlı masaüstü kısayolu

### Doğrudan Başlatma (kurulum olmadan)
`release\win-unpacked\SEPOffice.exe` dosyasını çalıştırın.

### İlk Başlatma
İlk başlatmada, AI servisi dil modelini (Qwen2.5-0.5B) arka planda yükler. İlerleme sağ alttaki Eliot sohbet pencere aracında görünür. Donanıma bağlı olarak bu **1–5 dakika** sürer.

> **Not:** Uygulama hemen kullanılabilir – Eliot, ilerleme çubuğu %100'e ulaştığında aktif hale gelir.

---

## 3. Kontrol Paneli

Kontrol Paneli, SEPOffice'in başlangıç sayfasıdır.

### Üç Uygulama Kutucuğu
- **SEPWrite** – Belge oluşturma veya açma
- **SEPGrid** – Elektronik tablo oluşturma veya açma
- **SEPShow** – Sunum oluşturma veya açma

### Son Belgeler
Kutucukların altında, tür simgesi, ad ve son değiştirme tarihiyle birlikte son düzenlenen belgeler görünür.

### Gezinme

| Öğe | İşlev |
|-----|-------|
| **SEPWrite / SEPGrid / SEPShow** | Uygulamalar arasında geçiş |
| ⚙️ | Ayarları açma |
| ⌨️ | Klavye kısayollarını gösterme |
| 🌙 / ☀️ | Koyu/açık mod geçişi |

---

## 4. SEPWrite – Kelime İşlemci

SEPWrite, **TipTap** tabanlı modern bir zengin metin düzenleyicisidir.

### 4.1 Biçimlendirme

| Simge | İşlev | Kısayol |
|-------|-------|---------|
| **K** | Kalın | `Ctrl + B` |
| *İ* | İtalik | `Ctrl + I` |
| <u>A</u> | Altı Çizili | `Ctrl + U` |
| B1 | Başlık 1 | — |
| B2 | Başlık 2 | — |

### 4.2 Resim Ekleme
**Ekle → Resim** üzerinden: sürükle-bırak veya dosya seçimi ile yükleme.

### 4.3 Kaydetme ve Dışa Aktarma

| İşlem | Açıklama |
|-------|---------|
| **Kaydet** | Yerel tarayıcı deposuna otomatik kayıt |
| **.docx olarak dışa aktar** | Word uyumlu belge indirme |
| **Yazdır / PDF** | Baskı önizleme, sonra yazdır veya PDF olarak kaydet |

---

## 5. SEPGrid – Elektronik Tablo

SEPGrid, sayfa başına **10.000 satır × 26 sütun** ile güçlü bir elektronik tablodur – Microsoft Excel ve OpenOffice Calc'a benzer.

### 5.1 Temel Kullanım

| İşlem | Açıklama |
|-------|---------|
| Hücreye tıklama | Hücreyi seçme |
| Çift tıklama / F2 | Hücreyi düzenleme |
| `Enter` | Onayla, sonraki satıra git |
| `Tab` | Onayla, sonraki sütuna git |
| `Escape` | Düzenlemeyi iptal et |
| `Ctrl + Z` | Geri al |
| `Ctrl + Y` | Yinele |
| `Ctrl + C` | Kopyala |
| `Ctrl + V` | Yapıştır |
| `Ctrl + X` | Kes |
| `Ctrl + B` | Kalın |
| `Ctrl + I` | İtalik |
| `Ctrl + U` | Altı Çizili |
| `Ctrl + F` | Bul ve Değiştir |
| `Del` | Hücre içeriğini temizle |

**Çoklu seçim:** Fareyi sürükleyin veya `Shift + Tıklama`.

**Doldurma tutamacı:** Değerleri veya formülleri kopyalamak için hücrenin sağ alt köşesindeki mavi karedoryu sürükleyin.

### 5.2 Formül Çubuğu

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =TOPLA(A1:A10)                           │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Hücre adr.  Simge           Giriş alanı (ham formülü gösterir)
```

- **Hücre adresi**: Etkin hücreyi veya seçili aralığı gösterir (örn. `A1:B5`)
- **fx simgesi**: Formül girişini belirtir
- **Giriş alanı**: Her zaman ham formülü gösterir – sonucu değil

**Hata görüntüleme:** `#HATA`, `#REF!`, `#SAYI/0!` gibi formül hatalarında alan kırmızı çerçevelenir ve hata sağda görüntülenir.

### 5.3 Formül Girişi

Formül girişi her zaman `=` ile başlar:

```
=TOPLA(A1:A10)             Toplam
=ORTALAMA(B1:B5)           Ortalama
=MAK(C1:C100)              Maksimum
=MİN(D1:D50)               Minimum
=BAĞ_DEĞ_SAY(A:A)          Sayma
=EĞER(A1>0;"Evet";"Hayır") Koşul
=DÜŞEYARA(...)             Dikey arama
=YUVARLA(A1; 2)            Yuvarlama
```

#### Fare Tıklamasıyla Formül Başvuruları

1. `=` veya `=TOPLA(` gibi bir işlev yazın
2. İstenen hücreye tıklayın → Adres eklenir
3. Aralıklar için sürükleyin → Aralık eklenir (örn. `A1:B10`)

### 5.4 Sayfalar Arası Formüller

Excel'deki gibi diğer sayfalara başvurular:

```
=Sayfa2!A1                      Sayfa2'den tek hücre
=TOPLA(Sayfa2!A1:B10)           Sayfa2'den toplam
=Sayfa1!A1 + Sayfa2!B5          Birden fazla sayfanın kombinasyonu
=ORTALAMA(Satış!C1:C100)        "Satış" sayfasından aralık
```

**Fare tıklamasıyla:**
1. Bir hücreye `=` yazın
2. Başka bir sayfa sekmesine tıklayın → `Sayfa2!` eklenir
3. İstenen hücreye tıklayın → `A1` eklenir

### 5.5 Sayı Biçimleri

Araç çubuğundaki **123 simgesi** aracılığıyla:

| Biçim | Örnek | Açıklama |
|-------|-------|---------|
| Standart | 1234.5 | Biçimlendirme yok |
| Sayı | 1.234,56 | 2 ondalık basamakla |
| Para Birimi | ₺1.234,56 | Para birimi biçimi |
| Yüzde | %12,5 | Değer × 100 ile % işareti |
| Binler | 1.234 | Binlik ayırıcılı tam sayılar |
| Tarih | 24.02.2026 | Tarih biçimi |

### 5.6 Hücreleri Birleştirme

1. Hücre aralığını seçin
2. **Ekle → Hücreleri Birleştir**
3. Yalnızca sol üst hücrenin değeri korunur

**Birleştirmeyi kaldırma:** **Ekle → Birleştirmeyi Kaldır**

### 5.7 Koşullu Biçimlendirme

1. Aralığı seçin
2. **Düzenle → Koşullu Biçimlendirme...**
3. Kural seçin: Büyüktür / Küçüktür / Eşittir / Arasında / Metin İçeriyor
4. Metin ve arka plan renklerini seçin
5. **Ekle**

**Kaldırma:** Aralığı seçin → **Düzenle → Koşullu Biçimlendirmeyi Kaldır**

### 5.8 Bölmeleri Dondurma

1. Kaydırmanın başlayacağı hücreyi seçin
2. **Görünüm → Bölmeleri Dondur**
3. Üstündeki tüm satırlar ve soldaki sütunlar dondurulur

**Dondurmaları kaldırma:** **Görünüm → Dondurmaları Kaldır**

### 5.9 Yorumlar

1. Hücreyi seçin → **Ekle → Yorum Ekle** → Metin girin → Tamam
2. Yorumlu hücreler sağ üst köşede **kırmızı üçgen** gösterir

### 5.10 Bul ve Değiştir

`Ctrl + F` veya **Düzenle → Bul ve Değiştir**:
- **Bul**: ◀ ▶ ile gezinme
- **Değiştir**: Tek tek veya hepsini birden

### 5.11 Satır ve Sütun Ekleme/Silme

**Ekle** menüsü aracılığıyla: Üste/Alta satır ekle, Sola/Sağa sütun ekle, Satırı/Sütunu sil.

### 5.12 Durum Çubuğu

Altta, çoklu seçimler için istatistikler otomatik olarak görüntülenir:

```
Σ Toplam: 12.345   ⌀ Ort.: 1.234   ↓ Min: 100   ↑ Mak: 5.000   Sayı: 10
```

### 5.13 İçe/Dışa Aktarma

| İşlev | Biçim | Açıklama |
|-------|-------|---------|
| İçe aktar | `.xlsx`, `.xlsm` | Excel dosyalarını açma |
| CSV içe aktar | `.csv` | Virgülle/noktalı virgülle ayrılmış dosyalar |
| Dışa aktar | `.xlsx` | Excel dosyası olarak kaydetme |
| CSV dışa aktar | `.csv` | CSV olarak kaydetme (UTF-8, noktalı virgül) |
| Yazdır / PDF | — | Baskı önizleme, yalnızca dolu satırlar |
| Resim ekle | PNG, JPG | Tabloya resim gömme |

### 5.14 AI İşlevleri

#### AI Formül Üreteci
Formül çubuğundaki **✨** simgesine tıklayın:
> "B sütunundaki tüm pozitif değerlerin ortalamasını hesapla"
> → `=ORTALAMAEĞER(B:B;">0")`

#### AI Tablo Asistanı
> "2025 için aylık satış tablosu oluştur, sütunlar: Ay, Gelir, Giderler, Kâr"

### 5.15 Klavye Kısayolları Özeti

| Kısayol | İşlev |
|---------|-------|
| `Ctrl + Z` | Geri al |
| `Ctrl + Y` | Yinele |
| `Ctrl + C` | Kopyala |
| `Ctrl + V` | Yapıştır |
| `Ctrl + X` | Kes |
| `Ctrl + B` | Kalın |
| `Ctrl + I` | İtalik |
| `Ctrl + U` | Altı Çizili |
| `Ctrl + F` | Bul ve Değiştir |
| `F2` | Hücreyi düzenle |
| `Enter` | Onayla + aşağı |
| `Tab` | Onayla + sağ |
| `Escape` | İptal |
| `Del` | İçeriği temizle |
| `Shift + Tıklama` | Seçimi genişlet |

---

## 6. SEPShow – Sunumlar

SEPShow, **Konva** (tuval oluşturucu) tabanlı slayt sunumu düzenleyicisidir.

### 6.1 Arayüz

| Alan | Açıklama |
|------|---------|
| **Sol kenar çubuğu** | Slayt listesi – önizleme, sürükleyerek sıra değiştirme |
| **Ana alan** | Etkin slaydın tuval düzenleyicisi |
| **Araç çubuğu** | Araçlar, dışa aktarma, sunum modu |
| **Sunucu notları** | Geçerli slayt için notlar |

### 6.2 Sunum Modu

Tam ekran sunum için **Sunum Yap**'a tıklayın:
- Gezinme: `→` / `←` ok tuşları veya tıklama
- `Esc` sunum modunu sonlandırır

---

## 7. Eliot – AI Asistan

Eliot, üç uygulamada da mevcut olan yerleşik AI asistanıdır.

### 7.1 Sohbet Pencere Aracı

**Kayan Eliot simgesi** tüm uygulamalarda sağ altta yer alır.

#### Durum Göstergeleri

| Simge | Durum |
|-------|-------|
| 💬 (normal) | AI hazır |
| ⏳ (dönen) | AI yükleniyor |
| ❌ (kırmızı) | Hata veya bağlantı yok |

---

## 8. Ayarlar

### AI Ayarları
| Seçenek | Açıklama |
|---------|---------|
| **API URL** | AI arka uç URL'si (varsayılan: `http://localhost:8080`) |
| **API Anahtarı** | İsteğe bağlı, harici AI API'leri için |
| **Bağlantıyı Test Et** | AI servisinin erişilebilir olup olmadığını kontrol eder |

### Dil
SEPOffice **29 dili** destekler. Dil, ayarlar iletişim kutusunda seçilebilir.

---

## 9. Klavye Kısayolları

### Genel

| Kısayol | İşlev |
|---------|-------|
| `Ctrl + Z` | Geri al |
| `Ctrl + Y` | Yinele |
| `Ctrl + S` | Kaydet |

### SEPGrid

| Kısayol | İşlev |
|---------|-------|
| `Enter` | Hücreyi onayla, aşağı git |
| `Tab` | Hücreyi onayla, sağa git |
| `Escape` | Düzenlemeyi iptal et |
| `Ctrl + C` | Kopyala |
| `Ctrl + V` | Yapıştır |
| `F2` | Hücreyi düzenle |
| Ok tuşları | Hücreler arasında gezinme |

---

## Teknik Notlar

- **Veri depolama:** Tüm belgeler yerel tarayıcı deposunda depolanır. Harici sunuculara hiçbir veri gönderilmez.
- **AI modeli:** Qwen2.5-0.5B tamamen yerel olarak çalışır – AI işlevleri için internet bağlantısı gerekmez.
- **Sistem gereksinimleri:** Windows 10/11, min. 4 GB RAM (AI modeli için 8 GB önerilir)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
