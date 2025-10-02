# 🚀 Hướng dẫn thiết lập hệ thống Nam Long

## 📋 Bước 1: Chuẩn bị môi trường

### Cài đặt Node.js
1. Tải Node.js từ: https://nodejs.org/
2. Chọn phiên bản LTS (Long Term Support)
3. Cài đặt theo hướng dẫn

## ⚙️ Bước 2: Thiết lập Environment

### Tạo file .env cho Backend
1. Trong thư mục `namlong`, tạo file `.env`
2. Thêm nội dung:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_REFRESH_EXPIRE=30d
```

## 🖥️ Bước 3: Khởi động Backend

```bash
# Trong thư mục namlong
npm install
npm run dev
```

Backend sẽ chạy tại: http://localhost:3000

## 🌐 Bước 4: Khởi động Frontend

```bash
# Mở terminal mới, trong thư mục namlong-fe
npm install
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3000

## 🔑 Bước 5: Đăng nhập

- **URL:** http://localhost:3000
- **Username:** admin
- **Password:** admin123

## 📊 Dữ liệu mẫu có sẵn

Hệ thống đã được cấu hình với dữ liệu mẫu để demo:

### 👥 Nhân viên
- Nguyễn Văn An (0901234567)
- Trần Thị Bình (0912345678)  
- Lê Văn Cường (0923456789)

### 🏢 Khách hàng
- Công ty TNHH ABC (MST: 0123456789)
- Công ty Cổ phần XYZ (MST: 0987654321)
- Doanh nghiệp tư nhân DEF (MST: 0111222333)

### 💰 Đầu tư
- Đầu tư dự án phần mềm (50,000,000 VNĐ)
- Đầu tư hệ thống ERP (75,000,000 VNĐ)

## 🛠️ Xử lý sự cố

### Port bị chiếm dụng
- Frontend (3000): Đổi port trong `namlong-fe/package.json`
- Backend (3000): Đổi PORT trong file `.env`

### Node.js không tìm thấy
- Thêm Node.js vào PATH trong Environment Variables
- Restart Command Prompt

## 📁 Cấu trúc thư mục

```
My_Job/
├── namlong/           # Backend API
│   ├── controllers/   # API controllers với dữ liệu mẫu
│   ├── routes/        # API routes
│   └── .env          # Environment config
└── namlong-fe/        # Frontend React
    ├── src/
    └── package.json
```

## 🆘 Hỗ trợ

Nếu gặp vấn đề:

1. ✅ Kiểm tra file .env đã tạo đúng
2. ✅ Kiểm tra npm install đã chạy
3. ✅ Kiểm tra không có lỗi trong console
4. ✅ Kiểm tra cả 2 port 3000 (FE) và 3000 (BE) không bị chiếm dụng

## 🔄 Script hữu ích

```bash
# Khởi động development mode
npm run dev

# Build production
npm run build
```

---

**Lưu ý:** Hệ thống hiện tại sử dụng dữ liệu mẫu trong bộ nhớ, dữ liệu sẽ được reset khi restart server. 
