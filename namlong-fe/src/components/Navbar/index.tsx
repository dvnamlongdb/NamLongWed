/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import {
  IconDashboard,
  IconUsers,
  IconUserDollar,
  IconFileInvoice,
  IconPigMoney,
  IconBriefcase,
  IconCash,
  IconTrendingUp,
  IconClipboardList, // Added for projects
  IconCalculator, // Added for investment calculator
  IconUserCog, // Added for user management
  IconBell, // Added for notifications
  IconShield, // Added for admin indicator
} from "@tabler/icons-react";
import { NavLink, ScrollArea, Group, Text, Badge, Divider, Box } from "@mantine/core";
import "./index.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { getAccessibleNavItems, NAVIGATION_PERMISSIONS } from "../../constants/formOptions";
import type { ReactNode } from "react";

// Define the shape of a navigation item for strong typing
type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  category: string;
};

export function NavbarNested() {
  const pathname = usePathname();
  const { currentUser, userRole, userDepartment, userPosition } = useAuth();

  // All navigation items with permissions
  const allNavLinks: NavItem[] = [
    {
      href: "/admin/invoices",
      label: "Danh sách hóa đơn",
      icon: <IconFileInvoice size={16} />,
      category: "Tài chính"
    },
    {
      href: "/admin/customers",
      label: "Danh sách khách hàng",
      icon: <IconUsers size={16} />,
      category: "Quản lý"
    },
    {
      href: "/admin/staff",
      label: "Danh sách nhân viên",
      icon: <IconUserDollar size={16} />,
      category: "Nhân sự"
    },
    {
      href: "/admin/user-management",
      label: "Quản lý tài khoản",
      icon: <IconUserCog size={16} />,
      category: "Nhân sự"
    },
    {
      href: "/admin/notifications",
      label: "Trung tâm thông báo",
      icon: <IconBell size={16} />,
      category: "Hệ thống"
    },
    {
      href: "/admin/investments",
      label: "Danh sách đầu tư", // was 'Danh sách các khoản đầu tư'
      icon: <IconPigMoney size={16} />,
      category: "Tài chính"
    },
    {
      href: "/admin/investment-portfolios",
      label: "Danh sách các khoản đầu tư", // portfolio theo khách hàng
      icon: <IconBriefcase size={16} />,
      category: "Tài chính"
    },
    {
      href: "/admin/salaries",
      label: "Danh sách lương nhân viên",
      icon: <IconCash size={16} />,
      category: "Nhân sự"
    },
    {
      href: "/admin/revenue",
      label: "Doanh Thu",
      icon: <IconTrendingUp size={16} />,
      category: "Tài chính"
    },
    {
      href: "/admin/projects",
      label: "Tiến trình công việc",
      icon: <IconClipboardList size={16} />,
      category: "Quản lý"
    },
    {
      href: "/admin/investment-calculator",
      label: "Công cụ tính toán đầu tư",
      icon: <IconCalculator size={16} />,
      category: "Đặc biệt"
    },
    // Teaching
    {
      href: "/admin/teaching/schedule",
      label: "Lịch Giảng Dạy",
      icon: <IconClipboardList size={16} />,
      category: "Giảng Dạy"
    },
  ];

  // Filter navigation items based on user permissions
  const accessibleNavLinks: NavItem[] = currentUser 
    ? (getAccessibleNavItems(userRole, userDepartment, allNavLinks, userPosition) as NavItem[])
    : [];

  // Group navigation items by category
  const groupedNavLinks = accessibleNavLinks.reduce<Record<string, NavItem[]>>((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  // Desired category order – put 'Hệ thống' first
  const categoryOrder = ["Hệ thống", "Tài chính", "Quản lý", "Nhân sự", "Giảng Dạy", "Đặc biệt"];
  const orderedCategories = [
    ...categoryOrder.filter((c) => c in groupedNavLinks),
    ...Object.keys(groupedNavLinks).filter((c) => !categoryOrder.includes(c))
  ];

  const getPermissionBadge = (href: string) => {
    const permissions = NAVIGATION_PERMISSIONS[href];
    if (!permissions) return null;
    
    if (userRole === "admin") {
      return <Badge size="xs" color="red" variant="light">ADMIN</Badge>;
    }
    
    if (permissions.roles.includes("director") && userRole === "director") {
      return <Badge size="xs" color="blue" variant="light">GIÁM ĐỐC</Badge>;
    }
    
    if (permissions.departments.includes(userDepartment)) {
      return <Badge size="xs" color="green" variant="light">{userDepartment.toUpperCase()}</Badge>;
    }
    
    return null;
  };

  if (!currentUser) {
    return (
      <nav className="navbar h-full flex flex-col">
        <div className="p-4 text-center">
          <Text c="dimmed">Đang tải...</Text>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar h-full flex flex-col">
      {/* Fixed header with user info */}
      <div className="p-3 border-b bg-white border-gray-200 flex-shrink-0">
        <Group gap="xs" align="center">
          <IconShield size={16} color={userRole === "admin" ? "red" : "blue"} />
          <div className="flex-1 min-w-0">
            <Text size="sm" fw={600} className="truncate">{currentUser.fullName}</Text>
            <Text size="xs" c="dimmed" className="truncate">
              {userRole === "admin" ? "Quản trị viên" : 
               userRole === "director" ? "Giám đốc" : 
               userRole === "hr" ? "Nhân sự" : 
               "Nhân viên"} • {currentUser.department?.toUpperCase()}
            </Text>
          </div>
        </Group>
      </div>

      {/* Scrollable navigation area */}
      <ScrollArea className="flex-1" type="auto" offsetScrollbars>
        <div className="p-2">
          {orderedCategories.map((category) => (
            <Box key={category} mb="md">
              <div className="px-2 py-1">
                <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                  {category}
                </Text>
              </div>
              
              {(groupedNavLinks[category] as NavItem[]).map((item) => (
                <NavLink
                  key={item.href}
                  className={`${
                    pathname === item.href 
                      ? "!bg-blue-50 !text-blue-600" 
                      : "hover:bg-gray-100"
                  } !rounded-md !mb-1`}
                  href={item.href}
                  label={
                    <Group justify="space-between" w="100%" gap="xs">
                      <Text size="sm" className="flex-1 truncate">
                        {item.label}
                      </Text>
                      {getPermissionBadge(item.href) && (
                        <div className="flex-shrink-0">
                          {getPermissionBadge(item.href)}
                        </div>
                      )}
                    </Group>
                  }
                  component={Link}
                  leftSection={item.icon}
                />
              ))}
            </Box>
          ))}
          
          {accessibleNavLinks.length === 0 && (
            <div className="p-4 text-center">
              <Text c="dimmed" size="sm">
                Không có chức năng khả dụng
              </Text>
            </div>
          )}
        </div>
      </ScrollArea>
    </nav>
  );
}
