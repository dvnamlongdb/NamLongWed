/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import React from "react";
import {
  Card,
  Text,
  Title,
  Group,
  Badge,
  Stack,
  Grid,
  Progress,
  Avatar,
  Divider,
  NumberFormatter,
  Timeline,
} from "@mantine/core";
import {
  IconCalendar,
  IconUsers,
  IconCurrency,
  IconClipboardText,
  IconPhone,
  IconNotes,
  IconTarget,
  IconFlag,
  IconClock,
  IconBuildingBank,
  IconProgress,
  IconCheck,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import ProjectProgress from "./ProjectProgress";

export default function ProjectDetail({ 
  project, 
  staff = [], 
  projectProgress = [],
  onEdit,
  onAddProgress 
}) {
  if (!project) return null;

  // Stabilize current date to avoid hydration mismatch
  const currentDate = React.useMemo(() => new Date(), []);

  // Get staff info
  const getStaffInfo = (staffId) => {
    return staff.find(s => s._id === staffId) || { name: 'Unknown', staff_code: 'N/A' };
  };

  const manager = getStaffInfo(project.project_manager);
  const assignedStaffList = project.assigned_staff?.map(id => getStaffInfo(id)) || [];

  // Calculate project metrics
  const totalTasks = projectProgress.length;
  const completedTasks = projectProgress.filter(p => p.status === 'completed').length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const spentPercentage = project.budget > 0 ? Math.round((project.spent_amount / project.budget) * 100) : 0;

  // Status configurations
  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: "gray", label: "Nháp", icon: <IconClipboardText size={16} /> },
      in_progress: { color: "blue", label: "Đang thực hiện", icon: <IconProgress size={16} /> },
      completed: { color: "green", label: "Hoàn thành", icon: <IconCheck size={16} /> },
      cancelled: { color: "red", label: "Đã hủy", icon: <IconFlag size={16} /> }
    };
    return configs[status] || configs.draft;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { color: "green", label: "Thấp" },
      medium: { color: "yellow", label: "Trung bình" },
      high: { color: "red", label: "Cao" }
    };
    return configs[priority] || configs.medium;
  };

  const statusConfig = getStatusConfig(project.status);
  const priorityConfig = getPriorityConfig(project.priority);
  const isOverdue = project.status === 'in_progress' && currentDate > new Date(project.expected_end_date);
  const daysLeft = React.useMemo(() => dayjs(project.expected_end_date).diff(dayjs(currentDate), 'day'), [project.expected_end_date, currentDate]);

  return (
    <Stack gap="md">
      {/* Header Section */}
      <Card withBorder p="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Group gap="xs" mb="xs">
              <Title order={3}>{project.project_name}</Title>
            </Group>
            <Text c="dimmed">{project.project_code}</Text>
          </div>
          <Group gap="sm">
            <Badge 
              color={priorityConfig.color} 
              variant="light" 
              size="lg"
            >
              Ưu tiên {priorityConfig.label}
            </Badge>
            <Badge 
              color={statusConfig.color} 
              variant="filled" 
              size="lg"
              leftSection={statusConfig.icon}
            >
              {statusConfig.label}
            </Badge>
          </Group>
        </Group>

        <Text size="sm" c="dimmed" mb="lg">
          {project.description}
        </Text>

        {/* Progress Overview */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder p="md" className="text-center">
              <Text size="sm" c="dimmed" mb="xs">Tiến độ công việc</Text>
              <Progress value={progressPercentage} size="lg" mb="xs" />
              <Text fw={600} size="lg">{progressPercentage}%</Text>
              <Text size="xs" c="dimmed">{completedTasks}/{totalTasks} nhiệm vụ</Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder p="md" className="text-center">
              <Text size="sm" c="dimmed" mb="xs">Ngân sách sử dụng</Text>
              <Progress value={spentPercentage} size="lg" mb="xs" color="orange" />
              <Text fw={600} size="lg">{spentPercentage}%</Text>
              <Text size="xs" c="dimmed">
                <NumberFormatter value={project.spent_amount} thousandSeparator="," suffix=" VNĐ" />
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder p="md" className="text-center">
              <Text size="sm" c="dimmed" mb="xs">Thời gian còn lại</Text>
              <Text fw={600} size="lg" c={isOverdue ? "red" : "blue"}>
                {isOverdue ? "Quá hạn" : daysLeft + " ngày"}
              </Text>
              <Text size="xs" c="dimmed">
                Đến {dayjs(project.expected_end_date).format("DD/MM/YYYY")}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Card>

      <Grid gutter="md">
        {/* Left Column */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          {/* Timeline */}
          <Card withBorder p="md" mb="md">
            <Group gap="xs" mb="md">
              <IconClock size={20} />
              <Text fw={600}>Timeline dự án</Text>
            </Group>
            <Timeline active={1} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                bullet={<IconCalendar size={12} />}
                title="Ngày bắt đầu"
                color="blue"
              >
                <Text c="dimmed" size="sm">
                  {dayjs(project.start_date).format("DD/MM/YYYY")}
                </Text>
              </Timeline.Item>
              <Timeline.Item
                bullet={<IconTarget size={12} />}
                title="Ngày dự kiến hoàn thành"
                color={isOverdue ? "red" : "green"}
              >
                <Text c="dimmed" size="sm">
                  {dayjs(project.expected_end_date).format("DD/MM/YYYY")}
                  {isOverdue && (
                    <Text component="span" c="red" size="xs" ml="xs">(Quá hạn)</Text>
                  )}
                </Text>
              </Timeline.Item>
              {project.actual_end_date && (
                <Timeline.Item
                  bullet={<IconCheck size={12} />}
                  title="Ngày hoàn thành thực tế"
                  color="green"
                >
                  <Text c="dimmed" size="sm">
                    {dayjs(project.actual_end_date).format("DD/MM/YYYY")}
                  </Text>
                </Timeline.Item>
              )}
            </Timeline>
          </Card>

          {/* Budget Information */}
          <Card withBorder p="md">
            <Group gap="xs" mb="md">
              <IconBuildingBank size={20} />
              <Text fw={600}>Thông tin ngân sách</Text>
            </Group>
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm">Tổng ngân sách:</Text>
                <Text fw={600}>
                  <NumberFormatter value={project.budget} thousandSeparator="," suffix=" VNĐ" />
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Đã sử dụng:</Text>
                <Text fw={600} c="orange">
                  <NumberFormatter value={project.spent_amount} thousandSeparator="," suffix=" VNĐ" />
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Còn lại:</Text>
                <Text fw={600} c="green">
                  <NumberFormatter value={project.budget - project.spent_amount} thousandSeparator="," suffix=" VNĐ" />
                </Text>
              </Group>
              <Progress 
                value={spentPercentage} 
                color={spentPercentage > 80 ? "red" : spentPercentage > 60 ? "orange" : "blue"} 
                size="lg" 
              />
            </Stack>
          </Card>
        </Grid.Col>

        {/* Right Column */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          {/* Project Progress Section */}
          <ProjectProgress 
            project={project}
            projectProgress={projectProgress}
            onAddProgress={onAddProgress}
          />

          {/* Team Information */}
          <Card withBorder p="md" mb="md" mt="md">
            <Group gap="xs" mb="md">
              <IconUsers size={20} />
              <Text fw={600}>Đội ngũ dự án</Text>
            </Group>
            <Stack gap="md">
              {/* Project Manager */}
              <div>
                <Text size="sm" c="dimmed" mb="xs">Quản lý dự án</Text>
                <Group gap="sm">
                  <Avatar size="sm" color="blue">
                    {manager.name.charAt(0)}
                  </Avatar>
                  <div>
                    <Text size="sm" fw={500}>{manager.name}</Text>
                    <Text size="xs" c="dimmed">{manager.staff_code}</Text>
                  </div>
                </Group>
              </div>

              <Divider />

              {/* Assigned Staff */}
              <div>
                <Text size="sm" c="dimmed" mb="xs">
                  Nhân viên tham gia ({assignedStaffList.length})
                </Text>
                <Stack gap="xs">
                  {assignedStaffList.map((member, index) => (
                    <Group key={index} gap="sm">
                      <Avatar size="sm" color="teal">
                        {member.name.charAt(0)}
                      </Avatar>
                      <div>
                        <Text size="sm">{member.name}</Text>
                        <Text size="xs" c="dimmed">{member.staff_code}</Text>
                      </div>
                    </Group>
                  ))}
                  {assignedStaffList.length === 0 && (
                    <Text size="sm" c="dimmed" fs="italic">
                      Chưa phân công nhân viên
                    </Text>
                  )}
                </Stack>
              </div>
            </Stack>
          </Card>

          {/* Additional Information */}
          <Card withBorder p="md">
            <Group gap="xs" mb="md">
              <IconNotes size={20} />
              <Text fw={600}>Thông tin bổ sung</Text>
            </Group>
            <Stack gap="sm">
              {project.client_info && (
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Thông tin khách hàng</Text>
                  <Text size="sm">{project.client_info}</Text>
                </div>
              )}
              {project.notes && (
                <div>
                  <Text size="sm" c="dimmed" mb="xs">Ghi chú</Text>
                  <Text size="sm">{project.notes}</Text>
                </div>
              )}
              <div>
                <Text size="sm" c="dimmed" mb="xs">Ngày tạo</Text>
                <Text size="sm">{dayjs(project.created_date).format("DD/MM/YYYY HH:mm")}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed" mb="xs">Cập nhật lần cuối</Text>
                <Text size="sm">{dayjs(project.updated_date).format("DD/MM/YYYY HH:mm")}</Text>
              </div>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
} 