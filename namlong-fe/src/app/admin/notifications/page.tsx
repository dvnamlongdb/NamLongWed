/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Text,
  Title,
  Group,
  Button,
  Grid,
  Stack,
  Badge,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Alert,
  Divider,
  Avatar,
  Menu,
  Indicator,
  Tabs,
  SimpleGrid,
} from "@mantine/core";
import {
  IconBell,
  IconBellRinging,
  IconCheck,
  IconX,
  IconEye,
  IconClock,
  IconUserCheck,
  IconUserX,
  IconCalendar,
  IconSettings,
  IconTrash,
  IconDots,
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";

import Layout from "../../../components/Layout";

export default function NotificationsPage() {
  const router = useRouter();
  const { userRole, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: "notif_001",
      type: "user_request",
      title: "Yêu cầu tài khoản mới",
      message: "Nguyễn Văn An đã yêu cầu tạo tài khoản nhân viên kế toán",
      userId: "usr_001",
      userName: "Nguyễn Văn An",
      department: "Kế toán",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: "high",
      actionRequired: true,
    },
    {
      id: "notif_002",
      type: "user_approved",
      title: "Tài khoản đã được duyệt",
      message: "Trần Thị Bình (Marketing) đã được duyệt và kích hoạt thành công",
      userId: "usr_002",
      userName: "Trần Thị Bình",
      department: "Marketing",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: "medium",
      actionRequired: false,
    },
    {
      id: "notif_003",
      type: "user_rejected",
      title: "Yêu cầu tài khoản bị từ chối",
      message: "Phạm Thu Hà (Nhân sự) - Chưa đủ kinh nghiệm yêu cầu",
      userId: "usr_004",
      userName: "Phạm Thu Hà",
      department: "Nhân sự",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      priority: "low",
      actionRequired: false,
    },
    {
      id: "notif_004",
      type: "schedule",
      title: "Lịch họp đánh giá nhân sự",
      message: "Cuộc họp đánh giá hồ sơ nhân viên mới - 14:00 hôm nay",
      timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      read: false,
      priority: "high",
      actionRequired: true,
      scheduleTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    },
    {
      id: "notif_005",
      type: "system",
      title: "Cập nhật hệ thống",
      message: "Hệ thống quản lý tài khoản đã được cập nhật với tính năng mới",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: "low",
      actionRequired: false,
    },
    {
      id: "notif_006",
      type: "user_request",
      title: "Yêu cầu tài khoản mới",
      message: "Lê Văn Đức đã yêu cầu tạo tài khoản kỹ thuật viên",
      userId: "usr_005",
      userName: "Lê Văn Đức",
      department: "Kỹ thuật",
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: false,
      priority: "high",
      actionRequired: true,
    },
  ]);

  const [activeTab, setActiveTab] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (activeTab !== "all") {
      filtered = filtered.filter(n => n.type === activeTab);
    }

    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, activeTab, showUnreadOnly]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Statistics
  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const actionRequired = notifications.filter(n => n.actionRequired && !n.read).length;
    const high = notifications.filter(n => n.priority === "high" && !n.read).length;
    
    return { total, unread, actionRequired, high };
  }, [notifications]);

  // Get notification icon and color
  const getNotificationIcon = (type, priority) => {
    const iconProps = { size: 16 };
    
    switch (type) {
      case "user_request":
        return <IconUserCheck {...iconProps} />;
      case "user_approved":
        return <IconCircleCheck {...iconProps} />;
      case "user_rejected":
        return <IconUserX {...iconProps} />;
      case "schedule":
        return <IconCalendar {...iconProps} />;
      case "system":
        return <IconInfoCircle {...iconProps} />;
      default:
        return <IconBell {...iconProps} />;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === "high") return "red";
    if (type === "user_approved") return "green";
    if (type === "user_rejected") return "orange";
    if (type === "schedule") return "blue";
    return "gray";
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const nowMs = Date.now();
    const tsMs =
      typeof timestamp === "number"
        ? timestamp
        : new Date(timestamp).getTime();

    if (Number.isNaN(tsMs)) {
      return "";
    }

    const diff = nowMs - tsMs;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Check permissions
  const canViewNotifications = ["director", "hr"].includes(CURRENT_USER_ROLE);

  if (!canViewNotifications) {
    return (
        <Card withBorder p="xl" className="text-center">
          <IconBell size={48} className="mx-auto mb-4 text-gray-400" />
          <Text size="lg" fw={500} mb="xs">
            Không có quyền truy cập
          </Text>
          <Text c="dimmed">
            Chỉ Giám đốc và HR mới có thể xem thông báo hệ thống.
          </Text>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Title order={2} className="flex items-center gap-2">
            <IconBell size={28} />
            Trung Tâm Thông Báo
          </Title>
          <Text c="dimmed" mt="xs">
            Quản lý tất cả thông báo và cập nhật hệ thống
          </Text>
        </div>
        <Button 
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
      </div>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
        <Card withBorder p="md" className="text-center">
          <IconBell size={24} className="mx-auto mb-2 text-blue-500" />
          <Text size="xl" fw={700} c="blue">
            {stats.total}
          </Text>
          <Text size="sm" c="dimmed">Tổng thông báo</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconBellRinging size={24} className="mx-auto mb-2 text-orange-500" />
          <Text size="xl" fw={700} c="orange">
            {stats.unread}
          </Text>
          <Text size="sm" c="dimmed">Chưa đọc</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconAlertTriangle size={24} className="mx-auto mb-2 text-red-500" />
          <Text size="xl" fw={700} c="red">
            {stats.actionRequired}
          </Text>
          <Text size="sm" c="dimmed">Cần xử lý</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconClock size={24} className="mx-auto mb-2 text-yellow-500" />
          <Text size="xl" fw={700} c="yellow">
            {stats.high}
          </Text>
          <Text size="sm" c="dimmed">Ưu tiên cao</Text>
        </Card>
      </SimpleGrid>

      {/* Main Notification Panel */}
      <Card withBorder p="md">
        {/* Header */}
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <Indicator color="red" disabled={unreadCount === 0} size={16}>
              <IconBellRinging size={20} />
            </Indicator>
            <Title order={4}>Tất Cả Thông Báo</Title>
            {unreadCount > 0 && (
              <Badge color="red" variant="filled" size="sm">
                {unreadCount}
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Đánh dấu đã đọc
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                >
                  Xóa tất cả
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab} mb="md">
          <Tabs.List>
            <Tabs.Tab value="all">Tất cả</Tabs.Tab>
            <Tabs.Tab value="user_request" leftSection={<IconUserCheck size={12} />}>
              Yêu cầu ({notifications.filter(n => n.type === "user_request").length})
            </Tabs.Tab>
            <Tabs.Tab value="schedule" leftSection={<IconCalendar size={12} />}>
              Lịch trình ({notifications.filter(n => n.type === "schedule").length})
            </Tabs.Tab>
            <Tabs.Tab value="system" leftSection={<IconSettings size={12} />}>
              Hệ thống ({notifications.filter(n => n.type === "system").length})
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Toggle unread only */}
        <Group justify="space-between" mb="md">
          <Button
            variant={showUnreadOnly ? "filled" : "light"}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            {showUnreadOnly ? "Hiện tất cả" : "Chỉ chưa đọc"}
          </Button>
          <Text size="sm" c="dimmed">
            {filteredNotifications.length} thông báo
          </Text>
        </Group>

        {/* Notifications List */}
        <ScrollArea h={600}>
          <Stack gap="sm">
            {filteredNotifications.length === 0 ? (
              <Alert color="blue" variant="light">
                <Text size="sm">Không có thông báo nào</Text>
              </Alert>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  withBorder
                  p="md"
                  style={{
                    backgroundColor: notification.read ? undefined : "var(--mantine-color-blue-0)",
                    borderLeft: `4px solid var(--mantine-color-${getNotificationColor(notification.type, notification.priority)}-6)`,
                  }}
                >
                  <Group align="flex-start" gap="md">
                    {/* Icon */}
                    <Avatar
                      size="md"
                      color={getNotificationColor(notification.type, notification.priority)}
                      variant="light"
                    >
                      {getNotificationIcon(notification.type, notification.priority)}
                    </Avatar>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Text fw={notification.read ? 400 : 600} size="md">
                          {notification.title}
                        </Text>
                        <Group gap="xs">
                          {notification.priority === "high" && (
                            <Badge color="red" variant="light" size="sm">
                              Khẩn cấp
                            </Badge>
                          )}
                          {!notification.read && (
                            <Tooltip label="Đánh dấu đã đọc">
                              <ActionIcon
                                size="sm"
                                variant="light"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <IconCheck size={14} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                          <Tooltip label="Xóa thông báo">
                            <ActionIcon
                              size="sm"
                              variant="light"
                              color="red"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Group>

                      <Text size="sm" c="dimmed" mb="md">
                        {notification.message}
                      </Text>

                      {/* User info for user-related notifications */}
                      {(notification.type === "user_request" || 
                        notification.type === "user_approved" || 
                        notification.type === "user_rejected") && (
                        <Group gap="xs" mb="sm">
                          <Badge variant="outline" size="sm">
                            {notification.department}
                          </Badge>
                          <Text size="sm" c="dimmed">
                            {notification.userName}
                          </Text>
                        </Group>
                      )}

                      {/* Schedule time */}
                      {notification.scheduleTime && (
                        <Group gap="xs" mb="sm">
                          <IconClock size={14} />
                          <Text size="sm" c="blue">
                            Lịch: {notification.scheduleTime.toLocaleString("vi-VN")}
                          </Text>
                        </Group>
                      )}

                      <Group justify="space-between" align="center">
                        <Text size="xs" c="dimmed">
                          {formatTimestamp(notification.timestamp)}
                        </Text>

                        {notification.actionRequired && isAdmin && (
                          <Badge color="orange" variant="light" size="sm">
                            Cần xử lý
                          </Badge>
                        )}
                      </Group>
                    </div>
                  </Group>
                </Card>
              ))
            )}
          </Stack>
        </ScrollArea>

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <>
            <Divider my="md" />
            <Group justify="center">
              <Button
                variant="light"
                leftSection={<IconEye size={16} />}
                onClick={markAllAsRead}
              >
                Đánh dấu tất cả đã đọc ({unreadCount})
              </Button>
            </Group>
          </>
        )}

        {/* Admin Notification Form */}
        {isAdmin && (
          <>
            <Divider my="md" />
            <Card p="md" withBorder>
              <Title order={4} mb="md">
                Gửi thông báo mới (Chỉ Admin)
              </Title>
              <Stack gap="md">
                <Group>
                  <Text size="sm" fw={500}>
                    Từ: Admin ({userRole})
                  </Text>
                  <Badge color="red" size="sm">
                    Quản trị viên
                  </Badge>
                </Group>
                <Alert color="blue" variant="light">
                  <Text size="sm">
                    <strong>Thông báo:</strong> Chỉ tài khoản admin mới có thể gửi thông báo hệ thống.
                    Tất cả thông báo sẽ được gửi đến tất cả người dùng trong hệ thống.
                  </Text>
                </Alert>
                <Button
                  variant="filled"
                  color="blue"
                  leftSection={<IconBell size={16} />}
                  onClick={() => {
                    // Tạo thông báo mẫu từ admin
                    const newNotification = {
                      id: `admin_notif_${Date.now()}`,
                      type: "system",
                      title: "Thông báo từ Admin",
                      message: "Đây là thông báo mẫu từ quản trị viên hệ thống.",
                      timestamp: new Date(),
                      read: false,
                      priority: "medium",
                      actionRequired: false,
                      fromAdmin: true
                    };
                    setNotifications(prev => [newNotification, ...prev]);
                  }}
                >
                  Gửi thông báo mẫu
                </Button>
              </Stack>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
} 