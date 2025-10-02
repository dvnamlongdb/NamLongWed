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
  Grid,
  Modal,
  Stack,
  Table,
  Badge,
  Alert,
  ActionIcon,
  Tooltip,
  SimpleGrid,
  TextInput,
  Select,
  Tabs,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconUser,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconClock,
  IconUsers,
  IconUserCheck,
  IconUserX,
  IconSearch,
  IconFilter,
  IconEye,
  IconShield,
  IconBell,
} from "@tabler/icons-react";

import { notifications } from "@mantine/notifications";
import CreateUserForm from "./components/CreateUserForm";
import UserStats from "./components/UserStats";
import NotificationPanel from "./components/NotificationPanel";
import { DEPARTMENTS, ROLES, getDepartmentLabel, getRoleLabel } from "../../../constants/formOptions";

// Mock current user role - in real app, get from auth context or API
const CURRENT_USER_ROLE = "director"; // director | hr | employee

export default function UserManagementPage() {
  const [composeOpened, { open: openCompose, close: closeCompose }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  // Load user accounts from API
  const [userAccounts, setUserAccounts] = useState([]);
  
  useEffect(() => {
    // TODO: Implement API call to fetch user accounts
    // setUserAccounts([]);
  }, []);

  // Notification state for tracking changes
  const [notificationTrigger, setNotificationTrigger] = useState(0);

  // Listen for notification toggle events from header bell
  useEffect(() => {
    const handleToggle = () => {
      setShowNotifications(prev => !prev);
    };
    
    if (typeof window !== "undefined") {
      window.addEventListener("app:toggle-notifications", handleToggle);
      return () => window.removeEventListener("app:toggle-notifications", handleToggle);
    }
  }, []);

  // Check permissions
  const canViewUserManagement = ["director", "hr"].includes(CURRENT_USER_ROLE);
  const canApproveUsers = CURRENT_USER_ROLE === "director";
  const canCreateUsers = ["director", "hr"].includes(CURRENT_USER_ROLE);

  if (!canViewUserManagement) {
    return (
        <Card withBorder p="xl" className="text-center">
          <IconShield size={48} className="mx-auto mb-4 text-gray-400" />
          <Text size="lg" fw={500} mb="xs">
            Không có quyền truy cập
          </Text>
          <Text c="dimmed">
            Chỉ Giám đốc và HR mới có thể xem mục quản lý tài khoản nhân viên.
          </Text>
        </Card>
    );
  }

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return userAccounts.filter(user => {
      const matchesSearch = searchQuery === "" ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [userAccounts, searchQuery, statusFilter, roleFilter]);

  // Group users by status for tabs
  const usersByStatus = useMemo(() => {
    return {
      pending: filteredUsers.filter(u => u.status === "pending"),
      approved: filteredUsers.filter(u => u.status === "approved"),
      active: filteredUsers.filter(u => u.status === "active"),
      rejected: filteredUsers.filter(u => u.status === "rejected"),
      inactive: filteredUsers.filter(u => u.status === "inactive"),
    };
  }, [filteredUsers]);

  // Handle create new user request
  const handleCreateUser = () => {
    openCompose();
  };

  // Handle form submit for new user
  const handleFormSubmit = (newUser) => {
    setUserAccounts(prev => [...prev, newUser]);
    
    notifications.show({
      title: "Thành công",
      message: "Đã tạo yêu cầu tài khoản thành công. Chờ Giám đốc duyệt.",
      color: "green",
    });
    
    closeCompose();
    setActiveTab("pending"); // Switch to pending tab to see the new request
    setNotificationTrigger(prev => prev + 1); // Trigger notification update
  };

  // Handle approve user
  const handleApproveUser = (userId) => {
    if (!canApproveUsers) {
      notifications.show({
        title: "Lỗi phân quyền",
        message: "Chỉ Giám đốc mới có thể duyệt tài khoản",
        color: "red",
      });
      return;
    }

    setUserAccounts(prev => prev.map(user => 
      user.id === userId ? {
        ...user,
        status: "approved",
        approvedBy: "Giám đốc Nguyễn Văn Nam",
        approvedDate: new Date().toISOString().split('T')[0]
      } : user
    ));

    notifications.show({
      title: "Thành công",
      message: "Đã duyệt tài khoản thành công",
      color: "green",
    });
    setNotificationTrigger(prev => prev + 1); // Trigger notification update
  };

  // Handle reject user
  const handleRejectUser = (userId) => {
    if (!canApproveUsers) {
      notifications.show({
        title: "Lỗi phân quyền", 
        message: "Chỉ Giám đốc mới có thể từ chối tài khoản",
        color: "red",
      });
      return;
    }

    setUserAccounts(prev => prev.map(user =>
      user.id === userId ? {
        ...user,
        status: "rejected",
        approvedBy: "Giám đốc Nguyễn Văn Nam",
        approvedDate: new Date().toISOString().split('T')[0]
      } : user
    ));

    notifications.show({
      title: "Đã từ chối",
      message: "Đã từ chối yêu cầu tạo tài khoản",
      color: "orange",
    });
    setNotificationTrigger(prev => prev + 1); // Trigger notification update
  };

  // Handle activate user
  const handleActivateUser = (userId) => {
    if (!canApproveUsers) {
      notifications.show({
        title: "Lỗi phân quyền",
        message: "Chỉ Giám đốc mới có thể kích hoạt tài khoản", 
        color: "red",
      });
      return;
    }

    setUserAccounts(prev => prev.map(user =>
      user.id === userId ? { ...user, status: "active" } : user
    ));

    notifications.show({
      title: "Thành công",
      message: "Đã kích hoạt tài khoản",
      color: "green",
    });
    setNotificationTrigger(prev => prev + 1); // Trigger notification update
  };

  // Handle view user details
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    openDetail();
  };

  // Handle delete user
  const handleDeleteUser = (userId) => {
    if (!canApproveUsers) {
      notifications.show({
        title: "Lỗi phân quyền",
        message: "Chỉ Giám đốc mới có thể xóa tài khoản",
        color: "red",
      });
      return;
    }

    if (confirm("Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.")) {
      setUserAccounts(prev => prev.filter(user => user.id !== userId));
      
      notifications.show({
        title: "Thành công",
        message: "Đã xóa tài khoản thành công",
        color: "green",
      });
      setNotificationTrigger(prev => prev + 1); // Trigger notification update
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Chờ duyệt", color: "yellow" },
      approved: { label: "Đã duyệt", color: "blue" },
      active: { label: "Đang hoạt động", color: "green" },
      rejected: { label: "Đã từ chối", color: "red" },
      inactive: { label: "Ngừng hoạt động", color: "gray" },
    };

    const config = statusConfig[status] || { label: status, color: "gray" };
    return <Badge color={config.color} variant="light">{config.label}</Badge>;
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const roleInfo = ROLES.find(r => r.value === role);
    const color = roleInfo?.level >= 3 ? "purple" : 
                 roleInfo?.level >= 2 ? "blue" : 
                 roleInfo?.level >= 1 ? "teal" : "gray";
    return <Badge color={color} variant="light">{getRoleLabel(role)}</Badge>;
  };

  return (
    <>
      <div>
      <Grid gutter="md">
        {/* Main Content */}
        <Grid.Col span={showNotifications ? 8 : 12}>
          <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title order={2} className="flex items-center gap-2">
              <IconUsers size={28} />
              Quản Lý Tài Khoản Nhân Viên
            </Title>
            <Text c="dimmed" mt="xs">
              Tạo và quản lý tài khoản cho nhân viên trong hệ thống
            </Text>
          </div>
          {canCreateUsers && (
            <Button 
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateUser}
            >
              Tạo Tài Khoản Mới
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 2, md: 5 }} spacing="md">
          <Card withBorder p="md" className="text-center">
            <IconClock size={24} className="mx-auto mb-2 text-yellow-500" />
            <Text size="xl" fw={700} c="yellow">
              {usersByStatus.pending.length}
            </Text>
            <Text size="sm" c="dimmed">Chờ duyệt</Text>
          </Card>
          
          <Card withBorder p="md" className="text-center">
            <IconUserCheck size={24} className="mx-auto mb-2 text-blue-500" />
            <Text size="xl" fw={700} c="blue">
              {usersByStatus.approved.length}
            </Text>
            <Text size="sm" c="dimmed">Đã duyệt</Text>
          </Card>
          
          <Card withBorder p="md" className="text-center">
            <IconUser size={24} className="mx-auto mb-2 text-green-500" />
            <Text size="xl" fw={700} c="green">
              {usersByStatus.active.length}
            </Text>
            <Text size="sm" c="dimmed">Đang hoạt động</Text>
          </Card>
          
          <Card withBorder p="md" className="text-center">
            <IconUserX size={24} className="mx-auto mb-2 text-red-500" />
            <Text size="xl" fw={700} c="red">
              {usersByStatus.rejected.length}
            </Text>
            <Text size="sm" c="dimmed">Đã từ chối</Text>
          </Card>
          
          <Card withBorder p="md" className="text-center">
            <IconUser size={24} className="mx-auto mb-2 text-gray-500" />
            <Text size="xl" fw={700} c="gray">
              {usersByStatus.inactive.length}
            </Text>
            <Text size="sm" c="dimmed">Ngừng hoạt động</Text>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconFilter size="1.2rem" />
              <Text>Bộ lọc và tìm kiếm</Text>
            </Group>
          </Title>
          
          <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
            <TextInput
              placeholder="Tìm kiếm theo tên, email, phòng ban..."
              leftSection={<IconSearch size="1rem" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select
              placeholder="Tất cả trạng thái"
              data={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "pending", label: "Chờ duyệt" },
                { value: "approved", label: "Đã duyệt" },
                { value: "active", label: "Đang hoạt động" },
                { value: "rejected", label: "Đã từ chối" },
                { value: "inactive", label: "Ngừng hoạt động" }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            
            <Select
              placeholder="Tất cả vai trò"
              data={[
                { value: "all", label: "Tất cả vai trò" },
                ...ROLES
              ]}
              value={roleFilter}
              onChange={setRoleFilter}
            />
            
            <Group>
              <Text size="sm" c="dimmed">
                {filteredUsers.length} / {userAccounts.length} tài khoản
              </Text>
            </Group>
          </SimpleGrid>
        </Card>

        {/* User List with Tabs */}
        <Card withBorder p="md">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="dashboard" leftSection={<IconUsers size={14} />}>
                Tổng quan
              </Tabs.Tab>
              <Tabs.Tab value="pending" leftSection={<IconClock size={14} />}>
                Chờ duyệt ({usersByStatus.pending.length})
              </Tabs.Tab>
              <Tabs.Tab value="approved" leftSection={<IconUserCheck size={14} />}>
                Đã duyệt ({usersByStatus.approved.length})
              </Tabs.Tab>
              <Tabs.Tab value="active" leftSection={<IconUser size={14} />}>
                Hoạt động ({usersByStatus.active.length})
              </Tabs.Tab>
              <Tabs.Tab value="rejected" leftSection={<IconUserX size={14} />}>
                Từ chối ({usersByStatus.rejected.length})
              </Tabs.Tab>
            </Tabs.List>

            {/* Dashboard Tab */}
            <Tabs.Panel value="dashboard" pt="md">
              <UserStats userAccounts={userAccounts} />
            </Tabs.Panel>

            {Object.entries(usersByStatus).map(([status, users]) => (
              <Tabs.Panel key={status} value={status} pt="md">
                {users.length === 0 ? (
                  <Alert color="blue" variant="light">
                    Không có tài khoản nào trong trạng thái này
                  </Alert>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Thông tin</Table.Th>
                          <Table.Th>Phòng ban</Table.Th>
                          <Table.Th>Vai trò</Table.Th>
                          <Table.Th>Trạng thái</Table.Th>
                          <Table.Th>Ngày tạo</Table.Th>
                          <Table.Th>Người duyệt</Table.Th>
                          <Table.Th>Thao tác</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {users.map((user) => (
                          <Table.Tr key={user.id}>
                            <Table.Td>
                              <div>
                                <Text fw={500} size="sm">{user.fullName}</Text>
                                <Text size="xs" c="dimmed">{user.email}</Text>
                                <Text size="xs" c="dimmed">{user.phone}</Text>
                              </div>
                            </Table.Td>
                            <Table.Td>
                              <div>
                                <Text size="sm">{user.department}</Text>
                                <Text size="xs" c="dimmed">{user.position}</Text>
                              </div>
                            </Table.Td>
                            <Table.Td>{getRoleBadge(user.role)}</Table.Td>
                            <Table.Td>{getStatusBadge(user.status)}</Table.Td>
                            <Table.Td>
                              <Text size="sm">{user.requestDate}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm">
                                {user.approvedBy || "Chưa duyệt"}
                              </Text>
                              {user.approvedDate && (
                                <Text size="xs" c="dimmed">{user.approvedDate}</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <Tooltip label="Xem chi tiết">
                                  <ActionIcon
                                    variant="light"
                                    onClick={() => handleViewDetails(user)}
                                  >
                                    <IconEye size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                
                                {user.status === "pending" && canApproveUsers && (
                                  <>
                                    <Tooltip label="Duyệt">
                                      <ActionIcon
                                        color="green"
                                        variant="light"
                                        onClick={() => handleApproveUser(user.id)}
                                      >
                                        <IconCheck size={16} />
                                      </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Từ chối">
                                      <ActionIcon
                                        color="red"
                                        variant="light"
                                        onClick={() => handleRejectUser(user.id)}
                                      >
                                        <IconX size={16} />
                                      </ActionIcon>
                                    </Tooltip>
                                  </>
                                )}
                                
                                {user.status === "approved" && canApproveUsers && (
                                  <Tooltip label="Kích hoạt">
                                    <ActionIcon
                                      color="blue"
                                      variant="light"
                                      onClick={() => handleActivateUser(user.id)}
                                    >
                                      <IconUserCheck size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                                
                                {canApproveUsers && (
                                  <Tooltip label="Xóa tài khoản">
                                    <ActionIcon
                                      color="red"
                                      variant="light"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                )}
              </Tabs.Panel>
            ))}
          </Tabs>
        </Card>

        {/* User Detail Modal */}
        <Modal
          opened={detailOpened}
          onClose={closeDetail}
          title="Chi tiết tài khoản"
          size="md"
        >
          {selectedUser && (
            <Stack gap="md">
              <Card withBorder p="md">
                <Title order={4} mb="md">Thông tin cá nhân</Title>
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Họ và tên</Text>
                    <Text fw={500}>{selectedUser.fullName}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Email</Text>
                    <Text fw={500}>{selectedUser.email}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Số điện thoại</Text>
                    <Text fw={500}>{selectedUser.phone}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Vai trò</Text>
                    {getRoleBadge(selectedUser.role)}
                  </Grid.Col>
                </Grid>
              </Card>

              <Card withBorder p="md">
                <Title order={4} mb="md">Thông tin công việc</Title>
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Phòng ban</Text>
                    <Text fw={500}>{selectedUser.department}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Chức vụ</Text>
                    <Text fw={500}>{selectedUser.position}</Text>
                  </Grid.Col>
                </Grid>
              </Card>

              <Card withBorder p="md">
                <Title order={4} mb="md">Trạng thái duyệt</Title>
                <Grid gutter="md">
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Trạng thái</Text>
                    {getStatusBadge(selectedUser.status)}
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Người yêu cầu</Text>
                    <Text fw={500}>{selectedUser.requestedBy}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Ngày yêu cầu</Text>
                    <Text fw={500}>{selectedUser.requestDate}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="sm" c="dimmed">Người duyệt</Text>
                    <Text fw={500}>{selectedUser.approvedBy || "Chưa duyệt"}</Text>
                  </Grid.Col>
                </Grid>
                
                {selectedUser.notes && (
                  <div className="mt-4">
                    <Text size="sm" c="dimmed">Ghi chú</Text>
                    <Text fw={500}>{selectedUser.notes}</Text>
                  </div>
                )}
              </Card>

              <Group justify="flex-end" gap="md">
                <Button variant="light" onClick={closeDetail}>
                  Đóng
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Create User Modal */}
        <Modal
          opened={composeOpened}
          onClose={closeCompose}
          title="Tạo Tài Khoản Nhân Viên Mới"
          size="lg"
        >
          <CreateUserForm
            onSubmit={handleFormSubmit}
            onCancel={closeCompose}
          />
        </Modal>
          </div>
        </Grid.Col>

        {/* Notification Panel */}
        {showNotifications && (
          <Grid.Col span={4}>
            <NotificationPanel 
              userAccounts={userAccounts} 
              currentUserRole={CURRENT_USER_ROLE}
              onClose={() => setShowNotifications(false)}
              key={notificationTrigger}
            />
          </Grid.Col>
        )}
      </Grid>
      </div>
    </>
  );
} 