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
  Card,
  Text,
  Title,
  Group,
  Button,
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
  TextInput,
  Textarea,
  Select,
  MultiSelect,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconBell,
  IconBellRinging,
  IconCheck,
  IconX,
  IconCalendar,
  IconSettings,
  IconTrash,
  IconDots,
  IconInfoCircle,
  IconAlertTriangle,
  IconArrowLeft,
  IconPlus,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { useApi, useMutation } from "../../../service/hook";
import { apiService } from "../../../service";
import { notifications as mantineNotifications } from "@mantine/notifications";

export default function NotificationsPage() {
  const router = useRouter();
  const { userRole, isAdmin, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newNotification, setNewNotification] = useState({
    type: 'general',
    title: '',
    message: '',
    targetRoles: [],
    targetDepartments: ['all'],
    targetPositions: ['all']
  });

  const { data: notifications = [], loading, execute: fetchNotifications } = useApi();
  
  const markAsReadMutation = useMutation();
  const deleteMutation = useMutation();
  const createMutation = useMutation();

  useEffect(() => {
    fetchNotifications(() => apiService.get('/notifications'));
  }, [fetchNotifications]);

  const filteredNotifications = useMemo(() => {
    try {
      // Đảm bảo notifications luôn là array
      let filtered = Array.isArray(notifications) ? notifications : [];

      if (activeTab !== "all") {
        filtered = filtered.filter(n => n.type === activeTab);
      }

      if (showUnreadOnly) {
        filtered = filtered.filter(n => !isReadByCurrentUser(n));
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(n => 
          n.title?.toLowerCase().includes(query) ||
          n.message?.toLowerCase().includes(query) ||
          n.type?.toLowerCase().includes(query)
        );
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        filtered = filtered.filter(n => {
          if (!n.createdAt) return false;
          const notificationDate = new Date(n.createdAt);
          const fromDate = dateRange.from ? new Date(dateRange.from) : null;
          const toDate = dateRange.to ? new Date(dateRange.to) : null;
          
          if (fromDate && notificationDate < fromDate) return false;
          if (toDate && notificationDate > toDate) return false;
          return true;
        });
      }

      // Priority filter
      if (priorityFilter !== "all") {
        filtered = filtered.filter(n => n.priority === priorityFilter);
      }

      return filtered.sort((a, b) => {
        // Đảm bảo createdAt tồn tại và hợp lệ
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc thông báo");
      return [];
    }
  }, [notifications, activeTab, showUnreadOnly, searchQuery, dateRange, priorityFilter, currentUser?.id]);

  const isReadByCurrentUser = (notification) => {
    return notification.readBy && notification.readBy.some(userId => userId === currentUser?.id);
  };

  const unreadCount = useMemo(() => {
    // Đảm bảo notifications luôn là array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    return safeNotifications.filter(n => !isReadByCurrentUser(n)).length;
  }, [notifications, currentUser?.id]);

  const stats = useMemo(() => {
    // Đảm bảo notifications luôn là array
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const total = safeNotifications.length;
    const unread = safeNotifications.filter(n => !isReadByCurrentUser(n)).length;
    const actionRequired = safeNotifications.filter(n => n.type === 'account_mgmt' && !isReadByCurrentUser(n)).length;
    const high = safeNotifications.filter(n => n.type === 'teaching_schedule' && !isReadByCurrentUser(n)).length;
    
    return { total, unread, actionRequired, high };
  }, [notifications, currentUser?.id]);

  const getNotificationIcon = (type) => {
    const iconProps = { size: 16 };
    
    switch (type) {
      case "teaching_schedule":
        return <IconCalendar {...iconProps} />;
      case "project_progress":
        return <IconSettings {...iconProps} />;
      case "account_mgmt":
        return <IconBell {...iconProps} />;
      case "system":
        return <IconInfoCircle {...iconProps} />;
      case "general":
      default:
        return <IconBell {...iconProps} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "teaching_schedule":
        return "blue";
      case "project_progress":
        return "orange";
      case "account_mgmt":
        return "red";
      case "system":
        return "green";
      case "general":
      default:
        return "gray";
    }
  };

  const formatTimestamp = (timestamp) => {
    const nowMs = Date.now();
    const tsMs = new Date(timestamp).getTime();

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

  const markAsRead = async (notificationId) => {
    try {
      await markAsReadMutation.mutate(() => apiService.patch(`/notifications/${notificationId}/read`, {}));
      fetchNotifications(() => apiService.get('/notifications'));
      mantineNotifications.show({
        title: "Thành công",
        message: "Đã đánh dấu thông báo là đã đọc",
        color: "green",
      });
    } catch (error) {
      mantineNotifications.show({
        title: "Lỗi",
        message: "Không thể đánh dấu thông báo",
        color: "red",
      });
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await deleteMutation.mutate(() => apiService.delete(`/notifications/${notificationId}`));
      fetchNotifications(() => apiService.get('/notifications'));
      mantineNotifications.show({
        title: "Thành công",
        message: "Đã xóa thông báo",
        color: "green",
      });
    } catch (error) {
      mantineNotifications.show({
        title: "Lỗi",
        message: "Không thể xóa thông báo",
        color: "red",
      });
    }
  };

  const createNotification = async () => {
    try {
      await createMutation.mutate(() => apiService.post('/notifications', newNotification));
      setNewNotification({
        type: 'general',
        title: '',
        message: '',
        targetRoles: [],
        targetDepartments: ['all'],
        targetPositions: ['all']
      });
      setShowCreateForm(false);
      fetchNotifications(() => apiService.get('/notifications'));
      mantineNotifications.show({
        title: "Thành công",
        message: "Đã tạo thông báo mới",
        color: "green",
      });
    } catch (error) {
      mantineNotifications.show({
        title: "Lỗi",
        message: "Không thể tạo thông báo",
        color: "red",
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconBell size={28} />
              <Title order={2}>Trung Tâm Thông Báo</Title>
            </div>
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
      </div>

      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" style={{ marginBottom: '24px' }}>
        <Card withBorder p="md">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <IconBell size={24} color="blue" />
            <Text size="xl" fw={700} c="blue">
              {stats.total}
            </Text>
            <Text size="sm" c="dimmed">Tổng thông báo</Text>
          </div>
        </Card>
        
        <Card withBorder p="md">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <IconBellRinging size={24} color="orange" />
            <Text size="xl" fw={700} c="orange">
              {stats.unread}
            </Text>
            <Text size="sm" c="dimmed">Chưa đọc</Text>
          </div>
        </Card>
        
        <Card withBorder p="md">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <IconAlertTriangle size={24} color="red" />
            <Text size="xl" fw={700} c="red">
              {stats.actionRequired}
            </Text>
            <Text size="sm" c="dimmed">Cần xử lý</Text>
          </div>
        </Card>
        
        <Card withBorder p="md">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <IconBell size={24} color="yellow" />
            <Text size="xl" fw={700} c="yellow">
              {stats.high}
            </Text>
            <Text size="sm" c="dimmed">Ưu tiên cao</Text>
          </div>
        </Card>
      </SimpleGrid>

      <Card withBorder p="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Indicator color="red" disabled={unreadCount === 0} size={16}>
              <IconBellRinging size={20} />
            </Indicator>
            <Title order={4}>Tất Cả Thông Báo</Title>
            {unreadCount > 0 && (
              <Badge color="red" variant="filled" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={() => {
                    mantineNotifications.show({
                      title: "Thông báo",
                      message: "Tính năng đánh dấu tất cả đã đọc sẽ được cập nhật",
                      color: "blue",
                    });
                  }}
                  disabled={unreadCount === 0}
                >
                  Đánh dấu đã đọc
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => {
                    mantineNotifications.show({
                      title: "Thông báo",
                      message: "Tính năng xóa tất cả sẽ được cập nhật",
                      color: "blue",
                    });
                  }}
                  disabled={!Array.isArray(notifications) || notifications.length === 0}
                >
                  Xóa tất cả
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>

        <Tabs value={activeTab} onChange={setActiveTab} style={{ marginBottom: '16px' }}>
          <Tabs.List>
            <Tabs.Tab value="all">Tất cả</Tabs.Tab>
            <Tabs.Tab value="teaching_schedule" leftSection={<IconCalendar size={12} />}>
              Lịch giảng dạy ({Array.isArray(notifications) ? notifications.filter(n => n.type === "teaching_schedule").length : 0})
            </Tabs.Tab>
            <Tabs.Tab value="project_progress" leftSection={<IconSettings size={12} />}>
              Tiến trình ({Array.isArray(notifications) ? notifications.filter(n => n.type === "project_progress").length : 0})
            </Tabs.Tab>
            <Tabs.Tab value="account_mgmt" leftSection={<IconBell size={12} />}>
              Tài khoản ({Array.isArray(notifications) ? notifications.filter(n => n.type === "account_mgmt").length : 0})
            </Tabs.Tab>
            <Tabs.Tab value="system" leftSection={<IconInfoCircle size={12} />}>
              Hệ thống ({Array.isArray(notifications) ? notifications.filter(n => n.type === "system").length : 0})
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* Search Input */}
        <TextInput
          placeholder="Tìm kiếm thông báo..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          leftSection={<IconBell size={16} />}
          rightSection={searchQuery && (
            <ActionIcon
              size="sm"
              variant="transparent"
              c="gray"
              onClick={() => setSearchQuery("")}
            >
              <IconX size={14} />
            </ActionIcon>
          )}
          style={{ marginBottom: '16px' }}
        />

        {/* Date Range Filter */}
        <Group gap="md" style={{ marginBottom: '16px' }}>
          <DateInput
            placeholder="Từ ngày"
            value={dateRange.from}
            onChange={(date) => setDateRange(prev => ({ ...prev, from: date }))}
            clearable
            size="sm"
          />
          <DateInput
            placeholder="Đến ngày"
            value={dateRange.to}
            onChange={(date) => setDateRange(prev => ({ ...prev, to: date }))}
            clearable
            size="sm"
          />
          <Select
            placeholder="Độ ưu tiên"
            value={priorityFilter}
            onChange={setPriorityFilter}
            data={[
              { value: "all", label: "Tất cả" },
              { value: "high", label: "Cao" },
              { value: "medium", label: "Trung bình" },
              { value: "low", label: "Thấp" }
            ]}
            clearable
            size="sm"
            style={{ minWidth: 120 }}
          />
          {(dateRange.from || dateRange.to || priorityFilter !== "all") && (
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                setDateRange({ from: null, to: null });
                setPriorityFilter("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Group>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant={showUnreadOnly ? "filled" : "light"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? "Hiện tất cả" : "Chỉ chưa đọc"}
            </Button>
            {isAdmin && (
              <Button
                variant="light"
                size="sm"
                leftSection={<IconPlus size={14} />}
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                Tạo thông báo
              </Button>
            )}
          </div>
          <Text size="sm" c="dimmed">
            {filteredNotifications.length} thông báo
            {searchQuery && ` (tìm kiếm: "${searchQuery}")`}
            {(dateRange.from || dateRange.to) && ` (${dateRange.from ? `từ ${dateRange.from.toLocaleDateString()}` : ''}${dateRange.from && dateRange.to ? ' ' : ''}${dateRange.to ? `đến ${dateRange.to.toLocaleDateString()}` : ''})`}
            {priorityFilter !== "all" && ` (ưu tiên: ${priorityFilter})`}
          </Text>
        </div>

        <ScrollArea h={600}>
          <div>
            {filteredNotifications.length === 0 ? (
              <Alert color="blue" variant="light">
                <Text size="sm">Không có thông báo nào</Text>
              </Alert>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  withBorder
                  p="md"
                  style={{
                    backgroundColor: isReadByCurrentUser(notification) ? undefined : "var(--mantine-color-blue-0)",
                    borderLeft: `4px solid var(--mantine-color-${getNotificationColor(notification.type)}-6)`,
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <Avatar
                      size="md"
                      color={getNotificationColor(notification.type)}
                      variant="light"
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <Text fw={isReadByCurrentUser(notification) ? 400 : 600} size="md">
                          {notification.title}
                        </Text>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {notification.type === 'teaching_schedule' && (
                            <Badge color="blue" variant="light" size="sm">
                              Lịch giảng dạy
                            </Badge>
                          )}
                          {notification.type === 'account_mgmt' && (
                            <Badge color="red" variant="light" size="sm">
                              Cần duyệt
                            </Badge>
                          )}
                          {!isReadByCurrentUser(notification) && (
                            <Tooltip label="Đánh dấu đã đọc">
                              <ActionIcon
                                size="sm"
                                variant="light"
                                onClick={() => markAsRead(notification._id)}
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
                              onClick={() => deleteNotification(notification._id)}
                            >
                              <IconX size={14} />
                            </ActionIcon>
                          </Tooltip>
                        </div>
                      </div>

                      <Text size="sm" c="dimmed" style={{ marginBottom: '16px' }}>
                        {notification.message}
                      </Text>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        {notification.targetRoles && notification.targetRoles.length > 0 && (
                          <Badge variant="outline" size="sm">
                            {notification.targetRoles.join(', ')}
                          </Badge>
                        )}
                        {notification.targetDepartments && notification.targetDepartments.length > 0 && (
                          <Badge variant="outline" size="sm">
                            {notification.targetDepartments.join(', ')}
                          </Badge>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Text size="xs" c="dimmed">
                            {formatTimestamp(notification.createdAt)}
                          </Text>
                          {notification.createdBy && (
                            <Text size="xs" c="dimmed">
                              • {notification.createdBy.fullName || notification.createdBy.username}
                            </Text>
                          )}
                        </div>

                        {notification.type === 'account_mgmt' && isAdmin && (
                          <Badge color="orange" variant="light" size="sm">
                            Cần duyệt
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {showCreateForm && isAdmin && (
          <>
            <Divider my="md" />
            <Card p="md" withBorder>
              <Title order={4} mb="md">
                Tạo thông báo mới
              </Title>
              <div>
                <Select
                  label="Loại thông báo"
                  placeholder="Chọn loại thông báo"
                  value={newNotification.type}
                  onChange={(value) => setNewNotification(prev => ({ ...prev, type: value }))}
                  data={[
                    { value: 'teaching_schedule', label: 'Lịch giảng dạy' },
                    { value: 'project_progress', label: 'Tiến trình dự án' },
                    { value: 'account_mgmt', label: 'Quản lý tài khoản' },
                    { value: 'system', label: 'Hệ thống' },
                    { value: 'general', label: 'Chung' }
                  ]}
                  style={{ marginBottom: '16px' }}
                />
                
                <TextInput
                  label="Tiêu đề"
                  placeholder="Nhập tiêu đề thông báo"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  style={{ marginBottom: '16px' }}
                />
                
                <Textarea
                  label="Nội dung"
                  placeholder="Nhập nội dung thông báo"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  minRows={3}
                  style={{ marginBottom: '16px' }}
                />
                
                <MultiSelect
                  label="Vai trò đích"
                  placeholder="Chọn vai trò nhận thông báo"
                  value={newNotification.targetRoles}
                  onChange={(value) => setNewNotification(prev => ({ ...prev, targetRoles: value }))}
                  data={[
                    { value: 'admin', label: 'Quản trị viên' },
                    { value: 'director', label: 'Giám đốc' },
                    { value: 'hr', label: 'Nhân sự' },
                    { value: 'teacher', label: 'Giáo viên' },
                    { value: 'assistant', label: 'Trợ giảng' },
                    { value: 'staff', label: 'Nhân viên' }
                  ]}
                  style={{ marginBottom: '16px' }}
                />
                
                <MultiSelect
                  label="Phòng ban đích"
                  placeholder="Chọn phòng ban nhận thông báo"
                  value={newNotification.targetDepartments}
                  onChange={(value) => setNewNotification(prev => ({ ...prev, targetDepartments: value }))}
                  data={[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'education', label: 'Giáo dục' },
                    { value: 'technical', label: 'Kỹ thuật' },
                    { value: 'admin', label: 'Hành chính' },
                    { value: 'hr', label: 'Nhân sự' }
                  ]}
                  style={{ marginBottom: '16px' }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button
                    variant="light"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={createNotification}
                    loading={createMutation.loading}
                    disabled={!newNotification.title || !newNotification.message}
                  >
                    Tạo thông báo
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
}