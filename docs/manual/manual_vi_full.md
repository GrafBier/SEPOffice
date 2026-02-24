# SEPOffice – Hướng dẫn Người dùng

**Phiên bản 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Cài đặt và Khởi động](#2-cài-đặt-và-khởi-động)
3. [Bảng điều khiển](#3-bảng-điều-khiển)
4. [SEPWrite – Trình xử lý văn bản](#4-sepwrite--trình-xử-lý-văn-bản)
5. [SEPGrid – Bảng tính](#5-sepgrid--bảng-tính)
6. [SEPShow – Trình chiếu](#6-sepshow--trình-chiếu)
7. [Eliot – Trợ lý AI](#7-eliot--trợ-lý-ai)
8. [Cài đặt](#8-cài-đặt)
9. [Phím tắt bàn phím](#9-phím-tắt-bàn-phím)

---

## 1. Tổng quan

SEPOffice là bộ ứng dụng văn phòng máy tính để bàn được hỗ trợ bởi AI dành cho Windows, bao gồm ba ứng dụng tích hợp:

| Ứng dụng | Chức năng |
|----------|----------|
| **SEPWrite** | Tạo tài liệu văn bản phong phú, xuất sang Word/PDF |
| **SEPGrid** | Bảng tính với công thức và biểu đồ |
| **SEPShow** | Trình chiếu với trình chỉnh sửa canvas |

Cả ba ứng dụng đều kết nối với **Eliot** – trợ lý AI tích hợp viết văn bản, tạo công thức và thiết kế slide.

---

## 2. Cài đặt và Khởi động

### Trình cài đặt
Chạy `SEPOffice Setup 1.0.1.exe`. Trình hướng dẫn sẽ dẫn qua các bước cài đặt:
- Có thể chọn thư mục cài đặt (mặc định: `Program Files\SEPOffice`)
- Tạo mục menu Start
- Phím tắt trên màn hình desktop (tùy chọn)

### Chạy trực tiếp (không cài đặt)
Chạy `release\win-unpacked\SEPOffice.exe`.

### Lần khởi động đầu tiên
Khi chạy lần đầu, dịch vụ AI tải mô hình ngôn ngữ (Qwen2.5-0.5B) trong nền. Tiến trình có thể thấy trong widget trò chuyện Eliot ở góc dưới bên phải. Tùy theo phần cứng, có thể mất **1–5 phút**.

> **Lưu ý:** Ứng dụng sẵn sàng sử dụng ngay – Eliot kích hoạt khi thanh tiến trình đạt 100%.

---

## 3. Bảng điều khiển

Bảng điều khiển là trang chủ của SEPOffice.

### Ba ô ứng dụng
- **SEPWrite** – Tạo hoặc mở tài liệu
- **SEPGrid** – Tạo hoặc mở bảng tính
- **SEPShow** – Tạo hoặc mở trình chiếu

### Tài liệu gần đây
Bên dưới các ô, tài liệu đã chỉnh sửa gần đây được hiển thị cùng biểu tượng loại, tên và ngày sửa đổi lần cuối.

### Điều hướng

| Phần tử | Chức năng |
|---------|----------|
| **SEPWrite / SEPGrid / SEPShow** | Chuyển đổi giữa các ứng dụng |
| ⚙️ | Mở cài đặt |
| ⌨️ | Hiển thị phím tắt bàn phím |
| 🌙 / ☀️ | Chuyển đổi chế độ tối/sáng |

---

## 4. SEPWrite – Trình xử lý văn bản

SEPWrite là trình chỉnh sửa văn bản phong phú hiện đại dựa trên **TipTap**.

### 4.1 Định dạng

| Biểu tượng | Chức năng | Phím tắt |
|-----------|----------|---------|
| **Đậm** | In đậm | `Ctrl + B` |
| *Nghiêng* | In nghiêng | `Ctrl + I` |
| <u>Gạch chân</u> | Gạch chân | `Ctrl + U` |
| Tiêu đề 1 | Tiêu đề 1 | — |
| Tiêu đề 2 | Tiêu đề 2 | — |

### 4.2 Chèn hình ảnh
**Chèn → Hình ảnh**: Tải lên bằng kéo thả hoặc chọn tệp.

### 4.3 Lưu và Xuất

| Thao tác | Mô tả |
|----------|-------|
| **Lưu** | Tự động lưu vào bộ nhớ trình duyệt cục bộ |
| **Xuất dưới dạng .docx** | Tải xuống tài liệu tương thích Word |
| **In / PDF** | Xem trước in, sau đó in hoặc lưu dưới dạng PDF |

---

## 5. SEPGrid – Bảng tính

SEPGrid là bảng tính mạnh mẽ với **10.000 hàng × 26 cột** mỗi trang – tương tự Microsoft Excel và OpenOffice Calc.

### 5.1 Thao tác cơ bản

| Thao tác | Mô tả |
|----------|-------|
| Nhấp ô | Chọn ô |
| Nhấp đôi / F2 | Chỉnh sửa ô |
| `Enter` | Xác nhận, hàng tiếp theo |
| `Tab` | Xác nhận, cột tiếp theo |
| `Escape` | Hủy chỉnh sửa |
| `Ctrl + Z` | Hoàn tác |
| `Ctrl + Y` | Làm lại |
| `Ctrl + C` | Sao chép |
| `Ctrl + V` | Dán |
| `Ctrl + X` | Cắt |
| `Ctrl + B` | In đậm |
| `Ctrl + I` | In nghiêng |
| `Ctrl + U` | Gạch chân |
| `Ctrl + F` | Tìm và thay thế |
| `Del` | Xóa nội dung ô |

**Chọn nhiều:** Kéo chuột hoặc `Shift + nhấp`.

**Nút điều khiển điền:** Kéo ô vuông màu xanh ở góc dưới bên phải của ô để sao chép giá trị hoặc công thức.

### 5.2 Thanh công thức

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Địa chỉ ô   Biểu tượng      Trường nhập (hiển thị công thức thô)
```

- **Địa chỉ ô**: Hiển thị ô đang hoạt động hoặc vùng chọn (ví dụ: `A1:B5`)
- **Biểu tượng fx**: Chỉ ra nhập công thức
- **Trường nhập**: Luôn hiển thị công thức thô – không phải kết quả

**Hiển thị lỗi:** Với lỗi công thức như `#LỖI`, `#REF!`, `#DIV/0!` trường được bao quanh bởi viền đỏ.

### 5.3 Nhập công thức

Nhập công thức luôn bắt đầu bằng `=`:

```
=SUM(A1:A10)               Tổng
=AVERAGE(B1:B5)            Trung bình
=MAX(C1:C100)              Giá trị lớn nhất
=MIN(D1:D50)               Giá trị nhỏ nhất
=COUNT(A:A)                Đếm
=IF(A1>0;"Có";"Không")     Điều kiện
=VLOOKUP(...)              Tra cứu dọc
=ROUND(A1; 2)              Làm tròn
```

#### Tham chiếu công thức bằng nhấp chuột

1. Gõ `=` hoặc hàm như `=SUM(`
2. Nhấp ô mong muốn → địa chỉ được chèn
3. Kéo cho phạm vi → phạm vi được chèn (ví dụ: `A1:B10`)

### 5.4 Công thức xuyên trang tính

Tham chiếu đến trang tính khác – giống như Excel:

```
=Sheet2!A1                    Ô đơn từ Sheet2
=SUM(Sheet2!A1:B10)           Tổng từ Sheet2
=Sheet1!A1 + Sheet2!B5        Kết hợp nhiều trang tính
=AVERAGE(DoanhThu!C1:C100)    Phạm vi từ trang 'DoanhThu'
```

**Bằng nhấp chuột:**
1. Gõ `=` trong ô
2. Nhấp tab trang tính khác → `Sheet2!` được chèn
3. Nhấp ô mong muốn → `A1` được thêm

### 5.5 Định dạng số

Từ **biểu tượng 123** trong thanh công cụ:

| Định dạng | Ví dụ | Mô tả |
|----------|-------|-------|
| Chung | 1234.5 | Không có định dạng |
| Số | 1.234,56 | Định dạng 2 chữ số thập phân |
| Tiền tệ | ₫1.234,56 | Định dạng tiền tệ |
| Phần trăm | 12,5% | Giá trị×100 với ký hiệu % |
| Nghìn | 1.234 | Số nguyên với dấu phân cách hàng nghìn |
| Ngày | 24/02/2026 | Định dạng ngày |

### 5.6 Gộp ô

1. Chọn phạm vi ô
2. **Chèn → Gộp ô**
3. Chỉ giữ giá trị của ô trên bên trái

**Tách ô:** **Chèn → Tách ô**

### 5.7 Định dạng có điều kiện

1. Chọn phạm vi
2. **Chỉnh sửa → Định dạng có điều kiện...**
3. Chọn quy tắc: Lớn hơn / Nhỏ hơn / Bằng / Ở giữa / Chứa văn bản
4. Chọn màu văn bản và nền
5. **Thêm**

**Xóa:** Chọn phạm vi → **Chỉnh sửa → Xóa định dạng có điều kiện**

### 5.8 Cố định hàng/cột

1. Chọn ô mà cuộn sẽ bắt đầu
2. **Xem → Cố định hàng/cột**
3. Tất cả hàng phía trên và cột bên trái được cố định

**Hủy cố định:** **Xem → Hủy cố định**

### 5.9 Nhận xét

1. Chọn ô → **Chèn → Thêm nhận xét** → Nhập văn bản → OK
2. Ô có nhận xét hiển thị **tam giác đỏ** ở góc trên bên phải

### 5.10 Tìm và thay thế

`Ctrl + F` hoặc **Chỉnh sửa → Tìm và thay thế**:
- **Tìm**: Điều hướng bằng ◀ ▶
- **Thay thế**: Từng cái hoặc tất cả cùng một lúc

### 5.11 Chèn/Xóa hàng và cột

Từ menu **Chèn**: Chèn hàng phía trên/dưới, chèn cột bên trái/phải, xóa hàng/cột.

### 5.12 Thanh trạng thái

Ở phía dưới, thống kê chọn nhiều hiển thị tự động:

```
Σ Tổng: 12.345   ⌀ TB: 1.234   ↓ Min: 100   ↑ Max: 5.000   Số: 10
```

### 5.13 Nhập / Xuất

| Tính năng | Định dạng | Mô tả |
|----------|----------|-------|
| Nhập | `.xlsx`, `.xlsm` | Mở tệp Excel |
| Nhập CSV | `.csv` | Tệp phân cách bằng dấu phẩy/chấm phẩy |
| Xuất | `.xlsx` | Lưu dưới dạng tệp Excel |
| Xuất CSV | `.csv` | Lưu dưới dạng CSV (UTF-8, chấm phẩy) |
| In / PDF | — | Xem trước in, chỉ các hàng có dữ liệu |
| Chèn hình ảnh | PNG, JPG | Nhúng hình ảnh vào bảng tính |

### 5.14 Tính năng AI

#### Bộ tạo công thức AI
Nhấp **✨** trong thanh công thức:
> "Tính trung bình tất cả các giá trị dương trong cột B"
> → `=AVERAGEIF(B:B;">0")`

#### Trợ lý bảng AI
> "Tạo bảng doanh thu hàng tháng cho năm 2025. Cột: Tháng, Doanh thu, Chi phí, Lợi nhuận"

### 5.15 Danh sách phím tắt

| Phím tắt | Chức năng |
|---------|----------|
| `Ctrl + Z` | Hoàn tác |
| `Ctrl + Y` | Làm lại |
| `Ctrl + C` | Sao chép |
| `Ctrl + V` | Dán |
| `Ctrl + X` | Cắt |
| `Ctrl + B` | In đậm |
| `Ctrl + I` | In nghiêng |
| `Ctrl + U` | Gạch chân |
| `Ctrl + F` | Tìm và thay thế |
| `F2` | Chỉnh sửa ô |
| `Enter` | Xác nhận + xuống |
| `Tab` | Xác nhận + phải |
| `Escape` | Hủy |
| `Del` | Xóa nội dung |
| `Shift + nhấp` | Mở rộng vùng chọn |

---

## 6. SEPShow – Trình chiếu

SEPShow là trình chỉnh sửa slide thuyết trình dựa trên **Konva** (trình kết xuất canvas).

### 6.1 Giao diện

| Khu vực | Mô tả |
|---------|-------|
| **Thanh bên trái** | Danh sách slide – xem trước, kéo để thay đổi thứ tự |
| **Khu vực chính** | Trình chỉnh sửa canvas cho slide đang hoạt động |
| **Thanh công cụ** | Công cụ, xuất, chế độ trình chiếu |
| **Ghi chú người trình bày** | Ghi chú cho slide hiện tại |

### 6.2 Chế độ trình chiếu

Nhấp **Trình chiếu** để xem toàn màn hình:
- Điều hướng: Phím mũi tên `→` / `←` hoặc nhấp
- `Esc` để thoát chế độ trình chiếu

---

## 7. Eliot – Trợ lý AI

Eliot là trợ lý AI tích hợp có sẵn trong cả ba ứng dụng.

### 7.1 Widget trò chuyện

**Biểu tượng Eliot nổi** ở góc dưới bên phải của tất cả các ứng dụng.

#### Chỉ báo trạng thái

| Biểu tượng | Trạng thái |
|-----------|----------|
| 💬 (bình thường) | AI sẵn sàng |
| ⏳ (đang xoay) | AI đang tải |
| ❌ (đỏ) | Lỗi hoặc không kết nối |

---

## 8. Cài đặt

### Cài đặt AI
| Tùy chọn | Mô tả |
|---------|-------|
| **URL API** | URL backend AI (mặc định: `http://localhost:8080`) |
| **Khóa API** | Tùy chọn, cho API AI bên ngoài |
| **Kiểm tra kết nối** | Kiểm tra xem dịch vụ AI có thể truy cập |

### Ngôn ngữ
SEPOffice hỗ trợ **29 ngôn ngữ**. Ngôn ngữ có thể được chọn trong hộp thoại cài đặt.

---

## 9. Phím tắt bàn phím

### Toàn cục

| Phím tắt | Chức năng |
|---------|----------|
| `Ctrl + Z` | Hoàn tác |
| `Ctrl + Y` | Làm lại |
| `Ctrl + S` | Lưu |

### SEPGrid

| Phím tắt | Chức năng |
|---------|----------|
| `Enter` | Xác nhận ô, xuống |
| `Tab` | Xác nhận ô, sang phải |
| `Escape` | Hủy chỉnh sửa |
| `Ctrl + C` | Sao chép |
| `Ctrl + V` | Dán |
| `F2` | Chỉnh sửa ô |
| Phím mũi tên | Điều hướng giữa các ô |

---

## Ghi chú kỹ thuật

- **Lưu trữ dữ liệu:** Tất cả tài liệu được lưu trong bộ nhớ trình duyệt cục bộ. Không có dữ liệu nào được gửi đến máy chủ bên ngoài.
- **Mô hình AI:** Qwen2.5-0.5B chạy hoàn toàn cục bộ – không cần kết nối internet cho các tính năng AI.
- **Yêu cầu hệ thống:** Windows 10/11, tối thiểu 4 GB RAM (khuyến nghị 8 GB cho mô hình AI)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
