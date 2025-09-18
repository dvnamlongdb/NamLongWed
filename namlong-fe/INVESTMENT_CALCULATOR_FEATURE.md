# Công Cụ Tính Toán Đầu Tư

## Tổng Quan
Công cụ tính toán đầu tư chuyên nghiệp dành cho sếp để phân tích và so sánh các phương án đầu tư, hỗ trợ đưa ra quyết định đầu tư thông minh dựa trên các chỉ số tài chính quan trọng.

## Tính Năng Chính

### 🧮 **Tính Toán Các Chỉ Số Tài Chính**
- **NPV (Net Present Value)**: Giá trị hiện tại ròng
- **IRR (Internal Rate of Return)**: Tỷ suất sinh lời nội bộ
- **ROI (Return on Investment)**: Tỷ suất sinh lời
- **Payback Period**: Thời gian hoàn vốn
- **Risk-Adjusted NPV**: NPV hiệu chỉnh rủi ro

### 📊 **So Sánh Phương Án**
- So sánh tối đa 4 phương án cùng lúc
- Bảng so sánh chi tiết với tất cả chỉ số
- Xếp hạng tự động theo điểm tổng hợp
- Khuyến nghị đầu tư dựa trên phân tích

### 📈 **Phân Tích Danh Mục**
- Tổng quan toàn bộ danh mục đầu tư
- Phân bố rủi ro và lĩnh vực
- Biểu đồ trực quan (Ring Progress Charts)
- Khuyến nghị tối ưu hóa danh mục

### 🎯 **Hệ Thống Khuyến Nghị Thông Minh**
- **Rất khuyến nghị**: NPV > 0, IRR > 15%, ROI > 20%, Payback < 3 năm
- **Khuyến nghị**: NPV > 0, IRR > 10%, ROI > 10%
- **Cân nhắc**: NPV > 0
- **Không khuyến nghị**: NPV ≤ 0

## Cách Sử Dụng

### 1. **Truy Cập Công Cụ**
- Vào menu "Công cụ tính toán đầu tư"
- Giao diện hiển thị 2 tab: "Danh Sách Phương Án" và "Phân Tích Tổng Quan"

### 2. **Tạo Phương Án Đầu Tư**
- Click "Thêm Phương Án"
- Điền thông tin cơ bản:
  - Tên dự án
  - Mô tả
  - Loại hình đầu tư (9 lĩnh vực)
  - Mức độ rủi ro (Thấp/Trung bình/Cao/Rất cao)

### 3. **Nhập Thông Tin Tài Chính**
- **Vốn đầu tư ban đầu**: Số tiền bỏ ra lúc khởi đầu
- **Lãi suất chiết khấu**: Tự động đề xuất theo mức rủi ro
- **Dòng tiền hàng năm**: Có thể thêm/xóa năm tùy ý

### 4. **Xem Kết Quả Phân Tích**
Mỗi phương án hiển thị:
- NPV (màu xanh/đỏ tùy dương/âm)
- IRR (% tỷ suất sinh lời)
- ROI (% lợi nhuận trên đầu tư)
- Thời gian hoàn vốn
- Thanh tiến trình "Mức độ hấp dẫn"
- Badge khuyến nghị

### 5. **So Sánh Phương Án**
- Click icon so sánh trên các phương án muốn so sánh
- Khi chọn ≥ 2 phương án, nút "So Sánh" sẽ xuất hiện
- Xem bảng so sánh chi tiết và phân tích

### 6. **Phân Tích Tổng Quan**
- Tab "Phân Tích Tổng Quan" hiển thị:
  - Tổng quan danh mục (tổng vốn, NPV, tỷ lệ khả thi)
  - Hiệu quả trung bình
  - Phân bố rủi ro (biểu đồ tròn)
  - Phân bố lĩnh vực
  - Khuyến nghị tối ưu hóa

## Các Công Thức Tính Toán

### **NPV (Net Present Value)**
```
NPV = -Vốn_ban_đầu + Σ(Dòng_tiền_năm_t / (1 + r)^t)
```
- r = lãi suất chiết khấu
- t = năm thứ t

### **IRR (Internal Rate of Return)**
```
0 = -Vốn_ban_đầu + Σ(Dòng_tiền_năm_t / (1 + IRR)^t)
```
Tìm IRR sao cho NPV = 0 (sử dụng phương pháp Newton-Raphson)

### **ROI (Return on Investment)**
```
ROI = (Tổng_dòng_tiền - Vốn_ban_đầu) / Vốn_ban_đầu × 100%
```

### **Payback Period**
```
Thời gian để Σ(Dòng_tiền_tích_lũy) ≥ Vốn_ban_đầu
```

### **Điểm Tổng Hợp (0-100)**
```
Điểm = (NPV_Score + IRR_Score + ROI_Score + Payback_Score) / 4
```

## Mức Độ Rủi Ro & Lãi Suất Đề Xuất

| Rủi Ro | Lãi Suất Chiết Khấu | Ví Dụ Lĩnh Vực |
|---------|---------------------|-----------------|
| Thấp | 7% | Trái phiếu chính phủ, bất động sản ổn định |
| Trung bình | 10% | Dự án kinh doanh thông thường |
| Cao | 15% | Công nghệ mới, thị trường mới |
| Rất cao | 20% | Startup, lĩnh vực biến động cao |

## Loại Hình Đầu Tư Hỗ Trợ

1. **Bất động sản**: Mua bán, cho thuê, phát triển dự án
2. **Công nghệ**: Phần mềm, AI, blockchain
3. **Sản xuất**: Nhà máy, dây chuyền sản xuất
4. **Bán lẻ**: Cửa hàng, chuỗi bán lẻ
5. **Dịch vụ**: Tư vấn, giáo dục, y tế
6. **Tài chính**: Đầu tư tài chính, fintech
7. **Y tế**: Thiết bị y tế, phòng khám
8. **Giáo dục**: Trường học, khóa học
9. **Khác**: Các lĩnh vực khác

## Ưu Điểm Vượt Trội

### **🎯 Chính Xác**
- Công thức tài chính chuẩn quốc tế
- Thuật toán Newton-Raphson cho IRR
- Hiệu chỉnh rủi ro thông minh

### **⚡ Nhanh Chóng**
- Tính toán real-time
- Giao diện trực quan
- So sánh song song nhiều phương án

### **📱 Thân Thiện**
- Responsive design
- Thông báo song ngữ Việt-Anh
- Hướng dẫn chi tiết

### **🔍 Toàn Diện**
- 4+ chỉ số tài chính quan trọng
- Phân tích rủi ro
- Khuyến nghị cụ thể

## Kịch Bản Sử Dụng Thực Tế

### **Kịch Bản 1: So Sánh 2 Dự Án Bất Động Sản**
1. Dự án A: Mua chung cư cho thuê (rủi ro thấp)
2. Dự án B: Đầu tư đất nền (rủi ro cao)
3. So sánh NPV, IRR, thời gian hoàn vốn
4. Quyết định dựa trên khả năng chấp nhận rủi ro

### **Kịch Bản 2: Đánh Giá Danh Mục Đầu Tư**
1. Có 10 dự án đang xem xét
2. Phân tích phân bố rủi ro
3. Xác định dự án nào nên ưu tiên
4. Loại bỏ dự án có NPV âm

### **Kịch Bản 3: Thuyết Trình Với Đối Tác**
1. Tạo báo cáo so sánh chi tiết
2. Xuất dữ liệu (tính năng sắp có)
3. Trình bày với biểu đồ trực quan
4. Đưa ra khuyến nghị có căn cứ

## Lưu Ý Quan Trọng

### **⚠️ Giả Định**
- Dòng tiền ước tính chính xác
- Lãi suất chiết khấu phù hợp
- Không có biến động lớn về kinh tế vĩ mô

### **🔄 Cập Nhật Thường Xuyên**
- Xem xét lại giả định định kỳ
- Cập nhật dòng tiền thực tế
- Điều chỉnh lãi suất chiết khấu

### **💡 Kết Hợp Định Tính**
- Chỉ số định lượng + phân tích định tính
- Xem xét yếu tố ngoài tài chính
- Đánh giá tác động xã hội, môi trường

## Roadmap Tính Năng Tương Lai

### **Phase 2**
- [ ] Xuất báo cáo PDF/Excel
- [ ] Biểu đồ tương tác (Charts.js)
- [ ] Lưu trữ cloud
- [ ] Templates dự án phổ biến

### **Phase 3**
- [ ] Phân tích Monte Carlo (mô phỏng rủi ro)
- [ ] AI dự đoán dòng tiền
- [ ] Tích hợp dữ liệu thị trường real-time
- [ ] Cảnh báo thay đổi lãi suất

## Kết Luận

Công cụ tính toán đầu tư này cung cấp một giải pháp toàn diện cho việc đánh giá và so sánh các phương án đầu tư. Với giao diện thân thiện và các tính năng mạnh mẽ, đây là công cụ không thể thiếu cho các nhà đầu tư và doanh nghiệp muốn đưa ra quyết định đầu tư thông minh và có căn cứ khoa học. 