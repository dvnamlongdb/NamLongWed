/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
// Centralized form options for consistency across the application

// Department options
export const DEPARTMENTS = [
  { value: "accounting", label: "Kế toán", key: "accounting" },
  { value: "hr", label: "Nhân sự", key: "hr" },
  { value: "it", label: "Công nghệ thông tin", key: "it" },
  { value: "marketing", label: "Marketing", key: "marketing" },
  { value: "sales", label: "Kinh doanh", key: "sales" },
  { value: "operations", label: "Vận hành", key: "operations" },
  { value: "finance", label: "Tài chính", key: "finance" },
  { value: "legal", label: "Pháp chế", key: "legal" },
  { value: "admin", label: "Hành chính", key: "admin" },
  { value: "education", label: "Giáo dục", key: "education" },
  { value: "technical", label: "Kỹ thuật", key: "technical" },
];

// Role options with hierarchy and permissions
export const ROLES = [
  { 
    value: "admin", 
    label: "Quản trị viên", 
    level: 5, 
    permissions: ["all"],
    description: "Quyền cao nhất, truy cập tất cả chức năng"
  },
  { 
    value: "director", 
    label: "Giám đốc", 
    level: 4, 
    permissions: ["all", "investment_calculator", "financial_management", "staff_management", "project_management"],
    description: "Quyền giám đốc, truy cập hầu hết chức năng"
  },
  { 
    value: "deputy_director", 
    label: "Phó Giám đốc", 
    level: 3, 
    permissions: ["staff_management", "project_management", "basic_financial"],
    description: "Quyền phó giám đốc"
  },
  { 
    value: "manager", 
    label: "Trưởng phòng", 
    level: 2, 
    permissions: ["department_management", "project_management"],
    description: "Quyền trưởng phòng"
  },
  { 
    value: "deputy_manager", 
    label: "Phó phòng", 
    level: 1, 
    permissions: ["basic_management"],
    description: "Quyền phó phòng"
  },
  { 
    value: "hr", 
    label: "Nhân sự", 
    level: 2, 
    permissions: ["hr_management", "staff_management"],
    description: "Quyền nhân sự"
  },
  { 
    value: "tech_manager", 
    label: "Trưởng Phòng Kỹ Thuật", 
    level: 2, 
    permissions: ["technical_management", "project_management", "schedule_view"],
    description: "Quyền trưởng phòng kỹ thuật"
  },
  { 
    value: "employee", 
    label: "Nhân viên", 
    level: 0, 
    permissions: ["basic"],
    description: "Quyền nhân viên cơ bản"
  },
  { 
    value: "intern", 
    label: "Thực tập sinh", 
    level: 0, 
    permissions: ["limited"],
    description: "Quyền hạn chế"
  },
];

// Navigation permissions mapping
export const NAVIGATION_PERMISSIONS = {
  "/admin/invoices": {
    roles: ["admin", "director", "manager", "deputy_manager"],
    departments: ["accounting", "finance", "admin"],
    description: "Danh sách hóa đơn - Chỉ kế toán, tài chính và giám đốc"
  },
  "/admin/customers": {
    roles: ["admin", "director", "manager", "deputy_manager", "employee"],
    departments: ["sales", "marketing", "admin", "accounting"],
    description: "Danh sách khách hàng - Sales, marketing, kế toán"
  },
  "/admin/staff": {
    roles: ["admin", "director", "hr", "manager"],
    departments: ["hr", "admin"],
    description: "Danh sách nhân viên - HR và giám đốc"
  },
  "/admin/user-management": {
    roles: ["admin", "director", "hr"],
    departments: ["hr", "admin"],
    description: "Quản lý tài khoản - HR và giám đốc"
  },
  "/admin/notifications": {
    roles: ["admin", "director", "hr", "manager", "deputy_manager", "employee"],
    departments: ["all"],
    description: "Thông báo - Tất cả mọi người"
  },
  "/admin/investments": {
    roles: ["admin", "director", "manager"],
    departments: ["finance", "accounting", "admin"],
    description: "Đầu tư - Chỉ tài chính, kế toán và giám đốc"
  },
  "/admin/investment-portfolios": {
    roles: ["admin", "director", "manager"],
    departments: ["finance", "accounting", "admin"],
    description: "Danh mục đầu tư - Chỉ tài chính, kế toán và giám đốc"
  },
  "/admin/salaries": {
    roles: ["admin", "director", "hr", "manager"],
    departments: ["hr", "accounting", "admin"],
    description: "Lương nhân viên - HR, kế toán và giám đốc"
  },
  "/admin/revenue": {
    roles: ["admin", "director", "manager"],
    departments: ["accounting", "finance", "admin"],
    description: "Doanh thu - Chỉ kế toán, tài chính và giám đốc"
  },
  "/admin/projects": {
    roles: ["admin", "director", "hr", "manager", "deputy_manager", "employee"],
    departments: ["all"],
    description: "Tiến trình công việc - Tất cả mọi người"
  },
  "/admin/investment-calculator": {
    roles: ["admin", "director"],
    departments: ["admin"],
    description: "Công cụ tính toán đầu tư - Chỉ giám đốc"
  },
  "/admin/teaching/schedule": {
    roles: ["admin", "director", "manager", "deputy_manager", "hr", "tech_manager", "employee", "intern"],
    departments: ["all"],
    description: "Lịch Giảng Dạy - Tất cả nhân viên, đặc biệt giáo viên và trợ giảng",
    positionBased: true, // Cho phép kiểm tra dựa trên chức vụ
    allowedPositions: ["Giáo viên chính", "Giáo viên", "Trợ giảng", "Hiệu trưởng", "Phó Hiệu trưởng", "Trưởng khoa", "Phó trưởng khoa"]
  },
};

// Position options organized by department
export const POSITIONS_BY_DEPARTMENT = {
  accounting: [
    "Trưởng phòng Kế toán",
    "Phó phòng Kế toán", 
    "Kế toán trưởng",
    "Kế toán tổng hợp",
    "Kế toán chi phí",
    "Kế toán doanh thu",
    "Nhân viên kế toán",
    "Thủ quỹ",
    "Thực tập sinh kế toán",
  ],
  hr: [
    "Trưởng phòng Nhân sự",
    "Phó phòng Nhân sự",
    "Chuyên viên nhân sự",
    "Chuyên viên tuyển dụng",
    "Chuyên viên đào tạo",
    "Chuyên viên lương bảo hiểm",
    "Nhân viên nhân sự",
    "Thực tập sinh nhân sự",
  ],
  it: [
    "Trưởng phòng IT",
    "Phó phòng IT",
    "Team Lead",
    "Senior Developer",
    "Developer",
    "Junior Developer",
    "System Admin",
    "DevOps Engineer",
    "QA Engineer",
    "Business Analyst",
    "UI/UX Designer",
    "Database Administrator",
    "Network Administrator",
    "IT Support",
    "Thực tập sinh IT",
  ],
  marketing: [
    "Trưởng phòng Marketing",
    "Phó phòng Marketing",
    "Marketing Manager",
    "Digital Marketing Specialist",
    "Content Marketing",
    "Social Media Specialist",
    "SEO Specialist",
    "Graphic Designer",
    "Video Editor",
    "Brand Manager",
    "PR Specialist",
    "Event Coordinator",
    "Nhân viên marketing",
    "Thực tập sinh marketing",
  ],
  sales: [
    "Giám đốc Kinh doanh",
    "Trưởng phòng Kinh doanh", 
    "Phó phòng Kinh doanh",
    "Sales Manager",
    "Key Account Manager",
    "Account Executive",
    "Sales Executive",
    "Business Development",
    "Customer Success Manager",
    "Nhân viên kinh doanh",
    "Telesales",
    "Thực tập sinh kinh doanh",
  ],
  operations: [
    "Giám đốc Vận hành",
    "Trưởng phòng Vận hành",
    "Phó phòng Vận hành",
    "Operations Manager",
    "Project Manager",
    "Operations Specialist",
    "Process Improvement Specialist",
    "Quality Assurance Manager",
    "Supply Chain Manager",
    "Logistics Coordinator",
    "Nhân viên vận hành",
    "Thực tập sinh vận hành",
  ],
  finance: [
    "Giám đốc Tài chính",
    "Trưởng phòng Tài chính",
    "Phó phòng Tài chính",
    "Financial Manager",
    "Investment Manager",
    "Financial Analyst",
    "Risk Manager",
    "Treasury Specialist",
    "Budget Analyst",
    "Nhân viên tài chính",
    "Thực tập sinh tài chính",
  ],
  legal: [
    "Trưởng phòng Pháp chế",
    "Phó phòng Pháp chế",
    "Legal Manager",
    "Legal Advisor",
    "Contract Specialist",
    "Compliance Officer",
    "Chuyên viên pháp chế",
    "Nhân viên pháp chế",
    "Thực tập sinh pháp chế",
  ],
  admin: [
    "Trưởng phòng Hành chính",
    "Phó phòng Hành chính",
    "Administrative Manager",
    "Office Manager",
    "Administrative Assistant",
    "Receptionist",
    "Security Manager",
    "Facility Manager",
    "Nhân viên hành chính",
    "Thực tập sinh hành chính",
  ],
  education: [
    "Hiệu trưởng",
    "Phó Hiệu trưởng",
    "Trưởng khoa",
    "Phó trưởng khoa",
    "Giáo viên chính",
    "Giáo viên",
    "Trợ giảng",
    "Cố vấn học tập",
    "Thư ký khoa",
    "Nhân viên giáo vụ",
    "Thực tập sinh giáo dục",
  ],
  technical: [
    "Trưởng phòng Kỹ thuật",
    "Phó phòng Kỹ thuật",
    "Kỹ sư trưởng",
    "Kỹ sư chính",
    "Kỹ sư",
    "Kỹ thuật viên",
    "Technician",
    "Maintenance Specialist",
    "Cộng tác viên kỹ thuật",
    "Nhân viên kỹ thuật",
    "Thực tập sinh kỹ thuật",
  ],
};

// Bank options
export const BANKS = [
  { value: "vietcombank", label: "Vietcombank", fullName: "Ngân hàng TMCP Ngoại thương Việt Nam" },
  { value: "techcombank", label: "Techcombank", fullName: "Ngân hàng TMCP Kỹ thương Việt Nam" },
  { value: "bidv", label: "BIDV", fullName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam" },
  { value: "vietinbank", label: "VietinBank", fullName: "Ngân hàng TMCP Công thương Việt Nam" },
  { value: "agribank", label: "Agribank", fullName: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam" },
  { value: "acb", label: "ACB", fullName: "Ngân hàng TMCP Á Châu" },
  { value: "mbbank", label: "MB Bank", fullName: "Ngân hàng TMCP Quân đội" },
  { value: "vpbank", label: "VPBank", fullName: "Ngân hàng TMCP Việt Nam Thịnh Vượng" },
  { value: "sacombank", label: "Sacombank", fullName: "Ngân hàng TMCP Sài Gòn Thương Tín" },
  { value: "tpbank", label: "TPBank", fullName: "Ngân hàng TMCP Tiên Phong" },
  { value: "other", label: "Khác", fullName: "Ngân hàng khác" },
];

// Investment categories
export const INVESTMENT_CATEGORIES = [
  { value: "real_estate", label: "Bất động sản", description: "Đầu tư vào bất động sản, nhà đất" },
  { value: "technology", label: "Công nghệ", description: "Đầu tư vào công nghệ, startup" },
  { value: "manufacturing", label: "Sản xuất", description: "Đầu tư vào sản xuất, chế tạo" },
  { value: "retail", label: "Bán lẻ", description: "Đầu tư vào chuỗi bán lẻ" },
  { value: "service", label: "Dịch vụ", description: "Đầu tư vào các dịch vụ" },
  { value: "finance", label: "Tài chính", description: "Đầu tư tài chính, ngân hàng" },
  { value: "healthcare", label: "Y tế", description: "Đầu tư vào y tế, dược phẩm" },
  { value: "education", label: "Giáo dục", description: "Đầu tư vào giáo dục, đào tạo" },
  { value: "equity", label: "Cổ phần", description: "Đầu tư cổ phần" },
  { value: "debt", label: "Nợ", description: "Đầu tư trái phiếu, cho vay" },
  { value: "bond", label: "Trái phiếu", description: "Đầu tư trái phiếu chính phủ, doanh nghiệp" },
  { value: "venture", label: "Đầu tư mạo hiểm", description: "Đầu tư vào startup, dự án mới" },
  { value: "renewable_energy", label: "Năng lượng tái tạo", description: "Đầu tư năng lượng xanh" },
  { value: "other", label: "Khác", description: "Các loại đầu tư khác" },
];

// Risk levels
export const RISK_LEVELS = [
  { value: "low", label: "Thấp (5-8%)", description: "Rủi ro thấp, lợi nhuận ổn định" },
  { value: "medium", label: "Trung bình (8-12%)", description: "Rủi ro vừa phải, lợi nhuận khá" },
  { value: "high", label: "Cao (12-20%)", description: "Rủi ro cao, lợi nhuận cao" },
  { value: "very_high", label: "Rất cao (>20%)", description: "Rủi ro rất cao, lợi nhuận rất cao" },
];

// Project status options
export const PROJECT_STATUS = [
  { value: "draft", label: "Nháp", color: "gray" },
  { value: "planning", label: "Lên kế hoạch", color: "blue" },
  { value: "in_progress", label: "Đang thực hiện", color: "yellow" },
  { value: "review", label: "Đang xem xét", color: "orange" },
  { value: "completed", label: "Hoàn thành", color: "green" },
  { value: "cancelled", label: "Đã hủy", color: "red" },
  { value: "on_hold", label: "Tạm dừng", color: "gray" },
];

// Priority levels
export const PRIORITY_LEVELS = [
  { value: "low", label: "Thấp", color: "gray" },
  { value: "medium", label: "Trung bình", color: "blue" },
  { value: "high", label: "Cao", color: "orange" },
  { value: "urgent", label: "Khẩn cấp", color: "red" },
];

// Gender options
export const GENDERS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

// Permission checking functions
export const hasPermission = (userRole, userDepartment, requiredPath, userPosition = null) => {
  // Admin always has access
  if (userRole === "admin") return true;
  
  const pathPermissions = NAVIGATION_PERMISSIONS[requiredPath];
  if (!pathPermissions) return false;
  
  // Check role permission
  const hasRolePermission = pathPermissions.roles.includes(userRole);
  
  // Check department permission (if not "all")
  const hasDepartmentPermission = 
    pathPermissions.departments.includes("all") || 
    pathPermissions.departments.includes(userDepartment);
  
  // Check position-based permission (for teaching schedule)
  let hasPositionPermission = true;
  if (pathPermissions.positionBased && pathPermissions.allowedPositions && userPosition) {
    hasPositionPermission = pathPermissions.allowedPositions.includes(userPosition);
  }
  
  return hasRolePermission && hasDepartmentPermission && hasPositionPermission;
};

export const getAccessibleNavItems = (userRole, userDepartment, allNavItems, userPosition = null) => {
  return allNavItems.filter(item => 
    hasPermission(userRole, userDepartment, item.href, userPosition)
  );
};

export const canAccess = (userRole, userDepartment, path, userPosition = null) => {
  return hasPermission(userRole, userDepartment, path, userPosition);
};

// Helper functions
export const getDepartmentLabel = (value) => {
  return DEPARTMENTS.find(d => d.value === value)?.label || value;
};

export const getRoleLabel = (value) => {
  return ROLES.find(r => r.value === value)?.label || value;
};

export const getBankLabel = (value) => {
  return BANKS.find(b => b.value === value)?.label || value;
};

export const getPositionsByDepartment = (department) => {
  return POSITIONS_BY_DEPARTMENT[department]?.map(pos => ({ value: pos, label: pos })) || [];
};

export const getCategoryLabel = (value) => {
  return INVESTMENT_CATEGORIES.find(c => c.value === value)?.label || value;
};

export const getStatusColor = (value) => {
  return PROJECT_STATUS.find(s => s.value === value)?.color || "gray";
};

export const getPriorityColor = (value) => {
  return PRIORITY_LEVELS.find(p => p.value === value)?.color || "gray";
};

export const getRolePermissions = (role) => {
  return ROLES.find(r => r.value === role)?.permissions || [];
};

export const getRoleLevel = (role) => {
  return ROLES.find(r => r.value === role)?.level || 0;
}; 