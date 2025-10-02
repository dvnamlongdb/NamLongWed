# Hệ thống phân quyền Nam Long

## 📋 Tổng quan

Hệ thống phân quyền được thiết kế dựa trên **Role-Based Access Control (RBAC)** kết hợp với **Department-Based Access Control**, đảm bảo mỗi người dùng chỉ có thể truy cập vào các chức năng phù hợp với vai trò và phòng ban của họ.

## 🏗️ Kiến trúc hệ thống

### 1. **AuthContext** (`src/contexts/AuthContext.js`)
- Quản lý thông tin người dùng hiện tại
- Xử lý đăng nhập/đăng xuất
- Cung cấp utility functions cho permission checking

### 2. **Constants** (`src/constants/formOptions.js`)
- Định nghĩa các roles, departments, permissions
- Mapping giữa routes và quyền truy cập
- Helper functions cho permission logic

### 3. **PermissionGuard** (`src/components/PermissionGuard/index.jsx`)
- Component bảo vệ routes
- Kiểm tra quyền truy cập trước khi render content
- Hiển thị trang "Access Denied" nếu không có quyền

### 4. **Navbar** (`src/components/Navbar/index.tsx`)
- Dynamic navigation dựa trên permissions
- Hiển thị menu items theo vai trò người dùng
- Badge indicators cho permission levels

## 👥 Phân cấp vai trò (Roles)

| Vai trò | Level | Mô tả | Quyền truy cập |
|---------|-------|-------|----------------|
| **Admin** | 5 | Quản trị viên | Toàn quyền - tất cả chức năng |
| **Director** | 4 | Giám đốc | Hầu hết chức năng + công cụ tính toán đầu tư |
| **Deputy Director** | 3 | Phó Giám đốc | Quản lý nhân sự + dự án |
| **Manager** | 2 | Trưởng phòng | Quản lý phòng ban + dự án |
| **HR** | 2 | Nhân sự | Quản lý nhân viên + tài khoản |
| **Tech Manager** | 2 | Trưởng Phòng Kỹ Thuật | Quản lý kỹ thuật + dự án + lịch |
| **Deputy Manager** | 1 | Phó phòng | Quản lý cơ bản |
| **Employee** | 0 | Nhân viên | Chức năng cơ bản |
| **Intern** | 0 | Thực tập sinh | Quyền hạn chế |

## 🏢 Phòng ban (Departments)

- **Admin** - Hành chính
- **Accounting** - Kế toán
- **Finance** - Tài chính
- **HR** - Nhân sự
- **Sales** - Kinh doanh
- **Marketing** - Marketing
- **IT** - Công nghệ thông tin
- **Operations** - Vận hành
- **Legal** - Pháp chế
- **Education** - Giáo dục
- **Technical** - Kỹ thuật

## 🛡️ Ma trận phân quyền

### Chức năng theo vai trò:

| Chức năng | Admin | Director | HR | Manager | Tech Manager | Employee |
|-----------|-------|----------|----|---------|--------------| ---------|
| **Công cụ tính toán đầu tư** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Quản lý tài khoản** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Danh sách nhân viên** | ✅ | ✅ | ✅ | ✅* | ✅* | ❌ |
| **Lương nhân viên** | ✅ | ✅ | ✅ | ✅* | ❌ | ❌ |
| **Hóa đơn** | ✅ | ✅ | ❌ | ✅* | ❌ | ❌ |
| **Đầu tư & Tài chính** | ✅ | ✅ | ❌ | ✅* | ❌ | ❌ |
| **Doanh thu** | ✅ | ✅ | ❌ | ✅* | ❌ | ❌ |
| **Tiến trình công việc** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Thông báo** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lịch giảng dạy** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅* |
| **Khách hàng** | ✅ | ✅ | ❌ | ✅* | ✅* | ✅* |

*\* Phụ thuộc vào phòng ban*

### Chức năng theo phòng ban:

| Chức năng | Admin | Accounting | Finance | HR | Sales | Marketing | Technical |
|-----------|-------|------------|---------|----|---------| ----------|-----------|
| **Hóa đơn** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Lương nhân viên** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Đầu tư & Tài chính** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Doanh thu** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Lịch giảng dạy** | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Khách hàng** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |

## 🔧 Cách sử dụng

### 1. Kiểm tra quyền truy cập trong component:

```javascript
import { useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../constants/formOptions';

function MyComponent() {
  const { userRole, userDepartment, userPosition } = useAuth();
  
  const hasAccess = canAccess(userRole, userDepartment, '/admin/teaching/schedule', userPosition);
  
  if (!hasAccess) {
    return <div>Không có quyền truy cập</div>;
  }
  
  return <div>Nội dung...</div>;
}
```

### 2. Sử dụng PermissionGuard:

```javascript
import PermissionGuard from '../../components/PermissionGuard';

function ProtectedPage() {
  return (
    <PermissionGuard>
      <div>Nội dung được bảo vệ</div>
    </PermissionGuard>
  );
}
```

### 3. Lấy danh sách menu có quyền truy cập:

```javascript
import { getAccessibleNavItems } from '../../constants/formOptions';

const accessibleItems = getAccessibleNavItems(userRole, userDepartment, allNavItems, userPosition);
```

## 🔐 Tài khoản Mặc định

Hệ thống sử dụng tài khoản admin mặc định:

| Username | Password | Role | Department | Mô tả |
|----------|----------|------|------------|-------|
| `admin` | `admin123` | Admin | Admin | Toàn quyền - Quản lý hệ thống |

## 🔄 Luồng hoạt động

1. **Đăng nhập**: User nhập credentials → AuthContext verify → Set currentUser
2. **Route Access**: PermissionGuard kiểm tra quyền → Allow/Deny/Redirect
3. **Navigation**: Navbar filter menu items theo permissions
4. **Component Level**: Individual components check permissions if needed

## ⚙️ Cấu hình mới

### Thêm route mới:
```javascript
// Trong src/constants/formOptions.js
export const NAVIGATION_PERMISSIONS = {
  "/admin/new-feature": {
    roles: ["admin", "director"],
    departments: ["admin", "finance"],
    description: "Chức năng mới"
  }
};
```

### Thêm role mới:
```javascript
// Trong ROLES array
{
  value: "new_role",
  label: "Vai trò mới",
  level: 3,
  permissions: ["custom_permission"],
  description: "Mô tả vai trò"
}
```

## 🛠️ Maintenance

- **Cập nhật permissions**: Chỉ cần sửa `NAVIGATION_PERMISSIONS` trong `formOptions.js`
- **Thêm role mới**: Update `ROLES` array và permission logic
- **Debug**: Check browser console cho permission logs
- **Testing**: Sử dụng user switching trong UserButton menu

## 🔐 Security Notes

- Permissions chỉ là UI-level protection
- Server-side validation vẫn cần thiết cho security thực sự
- AuthContext sử dụng localStorage (demo only)
- Production cần JWT tokens và secure authentication 