/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Button,
  Alert,
  Divider,
  Avatar,
  Menu,
  Indicator,
  UnstyledButton,
  Tabs,
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
} from "@tabler/icons-react";

export default function NotificationPanel({ userAccounts = [], currentUserRole = "admin", onClose }) {
  // Start with stable empty data to avoid hydration mismatch
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Load notifications from API
  useEffect(() => {
    // TODO: Implement API call to fetch notifications
    // setNotifications([]);
  }, []);

  // Auto-generate notifications based on user account changes (client only)
  useEffect(() => {
    if (!Array.isArray(userAccounts) || userAccounts.length === 0) return;

    setNotifications(prev => {
      const exists = new Set(prev.map(n => `${n.type}:${n.userId || n.id}`));
      const added = [];

      userAccounts.forEach(user => {
        if (user.status === "pending") {
          const key = `user_request:${user.id}`;
          if (!exists.has(key)) {
            added.push({
              id: `notif_${user.id}_pending`,
              type: "user_request",
              title: "Yêu cầu tài khoản mới",
              message: `${user.fullName} đã yêu cầu tạo tài khoản ${user.position}`,
              userId: user.id,
              userName: user.fullName,
              department: user.department,
              timestamp: new Date(user.requestDate || Date.now()),
              read: false,
              priority: "high",
              actionRequired: currentUserRole === "director",
            });
          }
        }

        if (user.status === "approved") {
          const key = `user_approved:${user.id}`;
          if (!exists.has(key)) {
            added.push({
              id: `notif_${user.id}_approved`,
              type: "user_approved",
              title: "Tài khoản đã được duyệt",
              message: `${user.fullName} đã được duyệt và kích hoạt thành công`,
              userId: user.id,
              userName: user.fullName,
              department: user.department,
              timestamp: new Date(user.approvedDate || Date.now()),
              read: false,
              priority: "medium",
              actionRequired: false,
            });
          }
        }

        if (user.status === "rejected") {
          const key = `user_rejected:${user.id}`;
          if (!exists.has(key)) {
            added.push({
              id: `notif_${user.id}_rejected`,
              type: "user_rejected",
              title: "Yêu cầu tài khoản bị từ chối",
              message: `${user.fullName} - yêu cầu bị từ chối`,
              userId: user.id,
              userName: user.fullName,
              department: user.department,
              timestamp: new Date(user.approvedDate || Date.now()),
              read: false,
              priority: "low",
              actionRequired: false,
            });
          }
        }
      });

      return added.length > 0 ? [...added, ...prev] : prev;
    });
  }, [userAccounts, currentUserRole]);

  // Listen to profile update events to inform HR
  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail;
      if (!detail || detail.type !== "profile_update") return;
      
      const payload = detail.payload || {};
      const changedFields = [];
      
      // Build a summary of changed fields
      if (payload.fullName) changedFields.push("Họ tên");
      if (payload.phone) changedFields.push("SĐT");
      if (payload.email) changedFields.push("Email");
      if (payload.birthDate) changedFields.push("Ngày sinh");
      if (payload.address) changedFields.push("Địa chỉ");
      if (payload.emergencyContact) changedFields.push("Liên hệ khẩn cấp");
      if (payload.bankAccount) changedFields.push("Tài khoản ngân hàng");
      
      const changedText = changedFields.length > 0 
        ? ` (${changedFields.join(", ")})`
        : "";
      
      setNotifications(prev => [
        {
          id: `notif_profile_${Date.now()}`,
          type: "system",
          title: "Cập nhật thông tin cá nhân",
          message: `${payload?.fullName || "Nhân viên"} vừa cập nhật thông tin cá nhân${changedText}`,
          userName: payload?.fullName || "Nhân viên",
          department: "Hành chính", // Default department for profile updates
          timestamp: new Date(),
          read: false,
          priority: "medium",
          actionRequired: false,
        },
        ...prev,
      ]);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("app:notify-hr", handler);
      return () => window.removeEventListener("app:notify-hr", handler);
    }
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    try {
      // Đảm bảo notifications luôn là array
      let filtered = Array.isArray(notifications) ? notifications : [];

      if (activeTab !== "all") {
        filtered = filtered.filter(n => n.type === activeTab);
      }

      if (showUnreadOnly) {
        filtered = filtered.filter(n => !n.read);
      }

      return filtered.sort((a, b) => {
        // Đảm bảo timestamp tồn tại và hợp lệ
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc thông báo");
      return [];
    }
  }, [notifications, activeTab, showUnreadOnly]);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    // Đảm bảo notifications luôn là array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    return safeNotifications.filter(n => !n.read).length;
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
    const now = new Date();
    const diff = now - timestamp;
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

  return (
    <Card withBorder p="md" style={{ height: "fit-content", minHeight: "500px" }}>
      {/* Header */}
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <Indicator color="red" disabled={unreadCount === 0} size={16}>
            <IconBellRinging size={20} />
          </Indicator>
          <Title order={4}>Thông báo</Title>
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

          {onClose && (
            <Tooltip label="Đóng bảng thông báo">
              <ActionIcon 
                variant="light" 
                color="gray"
                onClick={onClose}
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} mb="md">
        <Tabs.List>
          <Tabs.Tab value="all">Tất cả</Tabs.Tab>
          <Tabs.Tab value="user_request" leftSection={<IconUserCheck size={12} />}>
            Yêu cầu
          </Tabs.Tab>
          <Tabs.Tab value="schedule" leftSection={<IconCalendar size={12} />}>
            Lịch trình
          </Tabs.Tab>
          <Tabs.Tab value="system" leftSection={<IconSettings size={12} />}>
            Hệ thống
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Toggle unread only */}
      <Group justify="space-between" mb="md">
        <Button
          variant={showUnreadOnly ? "filled" : "light"}
          size="xs"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          {showUnreadOnly ? "Hiện tất cả" : "Chỉ chưa đọc"}
        </Button>
        <Text size="xs" c="dimmed">
          {filteredNotifications.length} thông báo
        </Text>
      </Group>

      {/* Notifications List */}
      <ScrollArea h={400}>
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
                p="sm"
                style={{
                  backgroundColor: notification.read ? undefined : "var(--mantine-color-blue-0)",
                  borderLeft: `4px solid var(--mantine-color-${getNotificationColor(notification.type, notification.priority)}-6)`,
                }}
              >
                <Group align="flex-start" gap="sm">
                  {/* Icon */}
                  <Avatar
                    size="sm"
                    color={getNotificationColor(notification.type, notification.priority)}
                    variant="light"
                  >
                    {getNotificationIcon(notification.type, notification.priority)}
                  </Avatar>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start" mb="xs">
                      <Text fw={notification.read ? 400 : 600} size="sm">
                        {notification.title}
                      </Text>
                      <Group gap="xs">
                        {notification.priority === "high" && (
                          <Badge color="red" variant="light" size="xs">
                            Khẩn
                          </Badge>
                        )}
                        {!notification.read && (
                          <Tooltip label="Đánh dấu đã đọc">
                            <ActionIcon
                              size="xs"
                              variant="light"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <IconCheck size={12} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        <Tooltip label="Xóa thông báo">
                          <ActionIcon
                            size="xs"
                            variant="light"
                            color="red"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <IconX size={12} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>

                    <Text size="xs" c="dimmed" mb="xs">
                      {notification.message}
                    </Text>

                    {/* User info for user-related notifications */}
                    {(notification.type === "user_request" || 
                      notification.type === "user_approved" || 
                      notification.type === "user_rejected") && (
                      <Group gap="xs" mb="xs">
                        <Badge variant="outline" size="xs">
                          {notification.department}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {notification.userName}
                        </Text>
                      </Group>
                    )}

                    {/* Schedule time */}
                    {notification.scheduleTime && (
                      <Group gap="xs" mb="xs">
                        <IconClock size={12} />
                        <Text size="xs" c="blue">
                          {notification.scheduleTime.toLocaleString("vi-VN")}
                        </Text>
                      </Group>
                    )}

                    <Group justify="space-between" align="center">
                      <Text size="xs" c="dimmed">
                        {formatTimestamp(notification.timestamp)}
                      </Text>

                      {notification.actionRequired && currentUserRole === "director" && (
                        <Badge color="orange" variant="light" size="xs">
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
              size="xs"
              leftSection={<IconEye size={14} />}
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </Group>
        </>
      )}
    </Card>
  );
} 