/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ActionIcon,
  Indicator,
  Menu,
  Text,
  Group,
  Badge,
  ScrollArea,
  Button,
  Divider,
  Avatar,
  Stack,
  Alert,
} from "@mantine/core";
import {
  IconBell,
  IconBellRinging,
  IconUserCheck,
  IconCircleCheck,
  IconUserX,
  IconCalendar,
  IconInfoCircle,
  IconEye,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";

export default function NotificationBell({ currentUserRole = "director" }) {
  // Start with stable empty data on SSR to avoid hydration mismatch
  const [notifications, setNotifications] = useState([]);

  // Load notifications from API
  useEffect(() => {
    // TODO: Implement API call to fetch notifications
    // setNotifications([]);
  }, []);

  // Count unread notifications
  const unreadCount = useMemo(() => {
    // Đảm bảo notifications luôn là array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    return safeNotifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Get recent notifications (max 5)
  const recentNotifications = useMemo(() => {
    try {
      // Đảm bảo notifications luôn là array
      const safeNotifications = Array.isArray(notifications) ? notifications : [];
      return safeNotifications
        .slice()
        .sort((a, b) => {
          // Đảm bảo timestamp tồn tại và hợp lệ
          const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 5);
    } catch {
      console.log("Lỗi khi lọc thông báo");
      return [];
    }
  }, [notifications]);

  // Get notification icon
  const getNotificationIcon = (type) => {
    const iconProps = { size: 14 };
    
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
    if (minutes < 60) return `${minutes}p`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // Only show for admin users
  if (currentUserRole !== "admin") {
    return null;
  }

  return (
    <Menu shadow="md" width={350} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="light" size="lg">
          <Indicator color="red" disabled={unreadCount === 0} size={16}>
            {unreadCount > 0 ? (
              <IconBellRinging size={20} />
            ) : (
              <IconBell size={20} />
            )}
          </Indicator>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown p={0}>
        {/* Header */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
          <Group justify="space-between">
            <Group gap="xs">
              <Text fw={600} size="sm">Thông báo</Text>
              {unreadCount > 0 && (
                <Badge color="red" variant="filled" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </Group>
            <Button
              component={Link}
              href="/admin/notifications"
              variant="light"
              size="xs"
              rightSection={<IconArrowRight size={12} />}
            >
              Xem tất cả
            </Button>
          </Group>
        </div>

        {/* Notifications List */}
        <ScrollArea h={400} p="xs">
          <Stack gap="xs">
            {recentNotifications.length === 0 ? (
              <Alert color="blue" variant="light" m="md">
                <Text size="sm">Không có thông báo mới</Text>
              </Alert>
            ) : (
              recentNotifications.map((notification) => (
                <Menu.Item
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: notification.read ? undefined : "var(--mantine-color-blue-0)",
                    borderRadius: "4px",
                    border: "none",
                  }}
                >
                  <Group align="flex-start" gap="sm" wrap="nowrap">
                    {/* Icon */}
                    <Avatar
                      size="xs"
                      color={getNotificationColor(notification.type, notification.priority)}
                      variant="light"
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" align="flex-start" mb={4} wrap="nowrap">
                        <Text 
                          fw={notification.read ? 400 : 600} 
                          size="xs" 
                          style={{ flex: 1 }}
                          lineClamp={1}
                        >
                          {notification.title}
                        </Text>
                        <Group gap={4} wrap="nowrap">
                          {notification.priority === "high" && (
                            <Badge color="red" variant="light" size="xs">
                              !
                            </Badge>
                          )}
                          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                            {formatTimestamp(notification.timestamp)}
                          </Text>
                        </Group>
                      </Group>

                      <Text size="xs" c="dimmed" lineClamp={2} mb={4}>
                        {notification.message}
                      </Text>

                      {/* User info for user-related notifications */}
                      {(notification.type === "user_request" || 
                        notification.type === "user_approved" || 
                        notification.type === "user_rejected") && (
                        <Group gap={4} mb={4}>
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
                        <Group gap={4} mb={4}>
                          <IconCalendar size={10} />
                          <Text size="xs" c="blue">
                            {notification.scheduleTime.toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </Text>
                        </Group>
                      )}

                      {notification.actionRequired && currentUserRole === "director" && (
                        <Badge color="orange" variant="light" size="xs">
                          Cần xử lý
                        </Badge>
                      )}
                    </div>
                  </Group>
                </Menu.Item>
              ))
            )}
          </Stack>
        </ScrollArea>

        {/* Footer */}
        {unreadCount > 0 && (
          <>
            <Divider />
            <div style={{ padding: "8px 16px" }}>
              <Button
                variant="light"
                size="xs"
                fullWidth
                leftSection={<IconEye size={12} />}
                onClick={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
              >
                Đánh dấu tất cả đã đọc
              </Button>
            </div>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
} 