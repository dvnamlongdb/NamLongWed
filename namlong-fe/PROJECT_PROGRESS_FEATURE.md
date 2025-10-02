# Tính Năng Cập Nhật Tiến Trình Dự Án

## Tổng Quan
Tính năng mới cho phép người dùng cập nhật tiến trình dự án với khả năng chụp ảnh và ghi chú chi tiết.

## Tính Năng Chính

### 1. Cập Nhật Tiến Trình
- **Trạng thái**: Đang thực hiện, Hoàn thành, Tạm dừng, Bị trễ
- **Mô tả**: Nhập mô tả chi tiết về tiến trình
- **Phần trăm hoàn thành**: Slider để chọn từ 0-100%
- **Hình ảnh**: Chụp ảnh hoặc upload từ thiết bị

### 2. Chụp Ảnh
- **Camera Web**: Truy cập camera để chụp ảnh trực tiếp
- **Upload File**: Chọn ảnh từ thiết bị
- **Preview**: Xem trước ảnh trước khi lưu
- **Chụp lại**: Có thể chụp ảnh mới nếu không hài lòng

### 3. Hiển Thị Tiến Trình
- **Lịch sử cập nhật**: Danh sách tất cả cập nhật tiến trình
- **Tiến độ tổng thể**: Thanh progress bar hiển thị tiến độ chung
- **Xem ảnh**: Click để xem ảnh đính kèm trong modal

## Cấu Trúc Component

### ProjectProgress.jsx
Component chính xử lý việc cập nhật tiến trình:
- State management cho form data
- Camera controls
- Image handling
- Progress submission

### ProjectDetail.jsx
Component được cập nhật để tích hợp ProjectProgress:
- Thêm ProjectProgress vào cột phải
- Truyền props cần thiết

## API Integration

### Hooks Sử Dụng
- `useProjectProgressMutation`: Thêm, sửa, xóa progress
- `useProjectProgress`: Lấy danh sách progress

### Mock Service
- `createProjectProgress`: Tạo progress mới
- `getProjectProgress`: Lấy progress theo project

## Thông Báo Song Ngữ
Tất cả console logs và notifications đều hiển thị bằng cả tiếng Việt và tiếng Anh:
```javascript
console.log("Camera started successfully / Khởi động camera thành công");
notifications.show({
  title: "Thành công / Success",
  message: "Đã cập nhật tiến trình dự án! / Project progress updated successfully!",
  color: "green"
});
```

## Cách Sử Dụng

### 1. Mở Chi Tiết Dự Án
- Vào trang Dự Án
- Click "Xem" trên dự án muốn cập nhật

### 2. Cập Nhật Tiến Trình
- Trong phần "Cập nhật tiến trình", click "Cập nhật tiến trình"
- Chọn trạng thái
- Nhập mô tả
- Điều chỉnh phần trăm hoàn thành
- Thêm ảnh (tùy chọn):
  - Click "Chụp ảnh" để dùng camera
  - Hoặc click "Chọn từ thiết bị" để upload
- Click "Cập nhật tiến trình"

### 3. Xem Lịch Sử
- Lịch sử cập nhật hiển thị ở dưới form
- Click icon mắt để xem ảnh đính kèm

## Tính Năng Bảo Mật
- Kiểm tra quyền truy cập camera
- Validation form data
- Error handling đầy đủ

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support (iOS cần https)
- Mobile: Responsive design

## Dependencies Mới
- `@mantine/notifications`: Để hiển thị thông báo
- Camera API: getUserMedia() (built-in browser)

## Files Được Thêm/Sửa
- `ProjectProgress.jsx` (mới)
- `ProjectDetail.jsx` (cập nhật)
- `layout.jsx` (thêm Notifications provider)
- `page.tsx` (thêm hooks và handlers)

## Lưu Ý Kỹ Thuật
- Ảnh được convert sang JPEG với chất lượng 80%
- Camera tự động chọn rear camera trên mobile
- Progress được lưu vào sessionData (mock mode)
- Responsive design hoạt động tốt trên mobile 