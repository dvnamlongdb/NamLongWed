/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useMemo } from "react";
import {
  Card,
  Text,
  Title,
  Group,
  SimpleGrid,
  Progress,
  Alert,
  Stack,
  Badge,
} from "@mantine/core";
import {
  IconUsers,
  IconClock,
  IconUserCheck,
  IconUserX,
  IconTrendingUp,
  IconInfoCircle,
  IconShield,
} from "@tabler/icons-react";
import { DEPARTMENTS, ROLES, getDepartmentLabel, getRoleLabel } from "../../../../constants/formOptions";

export default function UserStats({ userAccounts = [] }) {
  // Calculate statistics
  const stats = useMemo(() => {
    // Đảm bảo userAccounts luôn là array
    const safeUserAccounts = Array.isArray(userAccounts) ? userAccounts : [];
    const total = safeUserAccounts.length;
    const pending = safeUserAccounts.filter(u => u.status === "pending").length;
    const approved = safeUserAccounts.filter(u => u.status === "approved").length;
    const active = safeUserAccounts.filter(u => u.status === "active").length;
    const rejected = safeUserAccounts.filter(u => u.status === "rejected").length;
    const inactive = safeUserAccounts.filter(u => u.status === "inactive").length;

    // Department distribution
    const departments = {};
    safeUserAccounts.forEach(user => {
      departments[user.department] = (departments[user.department] || 0) + 1;
    });

    // Role distribution
    const roles = {};
    safeUserAccounts.forEach(user => {
      roles[user.role] = (roles[user.role] || 0) + 1;
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = safeUserAccounts.filter(user => 
      user.requestDate && new Date(user.requestDate) >= thirtyDaysAgo
    ).length;

    // Approval rate
    const totalProcessed = approved + rejected + active;
    const approvalRate = totalProcessed > 0 ? ((approved + active) / totalProcessed) * 100 : 0;

    return {
      total,
      pending,
      approved,
      active,
      rejected,
      inactive,
      departments,
      roles,
      recentRequests,
      approvalRate,
    };
  }, [userAccounts]);

  const getDepartmentColor = (dept) => {
    const deptInfo = DEPARTMENTS.find(d => d.label === dept);
    const colorMap = {
      "accounting": "blue",
      "hr": "teal", 
      "it": "violet",
      "marketing": "orange",
      "sales": "green",
      "operations": "indigo",
      "finance": "cyan",
      "legal": "red",
      "admin": "gray",
      "education": "lime",
      "technical": "grape",
    };
    return colorMap[deptInfo?.value] || "gray";
  };

  const getRoleColor = (role) => {
    const roleInfo = ROLES.find(r => r.value === role);
    return roleInfo?.level >= 3 ? "purple" : 
           roleInfo?.level >= 2 ? "blue" : 
           roleInfo?.level >= 1 ? "teal" : "gray";
  };

  return (
    <Stack gap="md">
      {/* Overview Cards */}
      <SimpleGrid cols={{ base: 2, sm: 3, md: 6 }} spacing="md">
        <Card withBorder p="md" className="text-center">
          <IconUsers size={24} className="mx-auto mb-2 text-blue-500" />
          <Text size="xl" fw={700} c="blue">
            {stats.total}
          </Text>
          <Text size="sm" c="dimmed">Tổng tài khoản</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconClock size={24} className="mx-auto mb-2 text-yellow-500" />
          <Text size="xl" fw={700} c="yellow">
            {stats.pending}
          </Text>
          <Text size="sm" c="dimmed">Chờ duyệt</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconUserCheck size={24} className="mx-auto mb-2 text-green-500" />
          <Text size="xl" fw={700} c="green">
            {stats.active}
          </Text>
          <Text size="sm" c="dimmed">Đang hoạt động</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconUserX size={24} className="mx-auto mb-2 text-red-500" />
          <Text size="xl" fw={700} c="red">
            {stats.rejected}
          </Text>
          <Text size="sm" c="dimmed">Đã từ chối</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconTrendingUp size={24} className="mx-auto mb-2 text-blue-500" />
          <Text size="xl" fw={700} c="blue">
            {stats.recentRequests}
          </Text>
          <Text size="sm" c="dimmed">Yêu cầu gần đây</Text>
        </Card>
        
        <Card withBorder p="md" className="text-center">
          <IconShield size={24} className="mx-auto mb-2 text-purple-500" />
          <Text size="xl" fw={700} c="purple">
            {stats.approvalRate.toFixed(0)}%
          </Text>
          <Text size="sm" c="dimmed">Tỷ lệ duyệt</Text>
        </Card>
      </SimpleGrid>

      {/* Department & Role Distribution */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {/* Department Distribution */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconUsers size="1.2rem" />
              <Text>Phân bố theo phòng ban</Text>
            </Group>
          </Title>
          
          <Stack gap="sm">
            {Object.entries(stats.departments).map(([dept, count]) => (
              <div key={dept}>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">{dept}</Text>
                  <Badge color={getDepartmentColor(dept)} variant="light" size="sm">
                    {count}
                  </Badge>
                </Group>
                <Progress 
                  value={(count / stats.total) * 100} 
                  color={getDepartmentColor(dept)}
                  size="sm"
                />
              </div>
            ))}
          </Stack>
        </Card>

        {/* Role Distribution */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconShield size="1.2rem" />
              <Text>Phân bố theo vai trò</Text>
            </Group>
          </Title>
          
          <Stack gap="sm">
            {Object.entries(stats.roles).map(([role, count]) => (
              <div key={role}>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">{getRoleLabel(role)}</Text>
                  <Badge color={getRoleColor(role)} variant="light" size="sm">
                    {count}
                  </Badge>
                </Group>
                <Progress 
                  value={(count / stats.total) * 100} 
                  color={getRoleColor(role)}
                  size="sm"
                />
              </div>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Insights */}
      <Card withBorder p="md">
        <Title order={4} mb="md">
          <Group gap="xs">
            <IconInfoCircle size="1.2rem" />
            <Text>Thông tin tổng quan</Text>
          </Group>
        </Title>
        
        <Stack gap="sm">
          {stats.pending > 0 && (
            <Alert color="yellow" variant="light">
              <Text size="sm">
                Có <strong>{stats.pending}</strong> yêu cầu tài khoản đang chờ duyệt. 
                Cần sự phê duyệt của Giám đốc để kích hoạt.
              </Text>
            </Alert>
          )}
          
          {stats.approvalRate < 70 && stats.total > 5 && (
            <Alert color="orange" variant="light">
              <Text size="sm">
                Tỷ lệ duyệt tài khoản hiện tại là <strong>{stats.approvalRate.toFixed(0)}%</strong>. 
                Có thể cần xem xét lại quy trình tạo tài khoản.
              </Text>
            </Alert>
          )}
          
          {stats.recentRequests > 5 && (
            <Alert color="blue" variant="light">
              <Text size="sm">
                Có <strong>{stats.recentRequests}</strong> yêu cầu tài khoản mới trong 30 ngày qua. 
                Hoạt động tuyển dụng đang tăng cao.
              </Text>
            </Alert>
          )}
          
          {stats.active > stats.total * 0.8 && stats.total > 0 && (
            <Alert color="green" variant="light">
              <Text size="sm">
                Hệ thống đang hoạt động tốt với <strong>{((stats.active / stats.total) * 100).toFixed(0)}%</strong> tài khoản đang hoạt động.
              </Text>
            </Alert>
          )}
        </Stack>
      </Card>
    </Stack>
  );
} 