/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Text,
  Title,
  Group,
  Badge,
  Button,
  Grid,
  Progress,
  Modal,
  ActionIcon,
  Tooltip,
  NumberFormatter,
  Flex,
  Select,
  TextInput,
  Divider,
  LoadingOverlay,
  Stack,
  Avatar,
  Timeline
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconTrash,
  IconCalendar,
  IconUsers,
  IconTarget,
  IconCurrency,
  IconProgress,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconChevronRight
} from "@tabler/icons-react";
import { useProjects, useProjectMutation, useProjectProgress, useProjectProgressMutation, useStaff } from "../../../service/hook";
import Layout from "../../../components/Layout";
import ClientOnly from "../../../components/ClientOnly";
import ProjectForm from "./components/ProjectForm";
import ProjectDetail from "./components/ProjectDetail";
import dayjs from "dayjs";
import { PROJECT_STATUS, PRIORITY_LEVELS, getStatusColor, getPriorityColor } from "../../../constants/formOptions";

export default function ProjectsPage() {
  const { data: projects, loading: projectsLoading, getProjects } = useProjects();
  const { data: staff, loading: staffLoading, getStaff } = useStaff();
  const { data: allProgress, loading: progressLoading, getProjectProgress } = useProjectProgress();
  const { createProject, updateProject, deleteProject, loading: mutationLoading } = useProjectMutation();
  const { createProgress, loading: progressMutationLoading } = useProjectProgressMutation();

  const [composeOpened, { open: openCompose, close: closeCompose }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [editingProject, setEditingProject] = useState(null);
  const [detailProject, setDetailProject] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loading = projectsLoading || staffLoading || progressLoading;
  const currentDate = React.useMemo(() => new Date(), []);

  // Load data
  useEffect(() => {
    getProjects();
    getStaff();
    getProjectProgress();
  }, [getProjects, getStaff, getProjectProgress]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    try {
      // Đảm bảo projects luôn là array
      let filtered = Array.isArray(projects) ? projects : [];

      filtered = filtered.filter(project => {
        const matchesStatus = filterStatus === "all" || project.status === filterStatus;
        const matchesPriority = filterPriority === "all" || project.priority === filterPriority;
        const matchesSearch = project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             project.project_code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesPriority && matchesSearch;
      });

      return filtered.sort((a, b) => {
        // Đảm bảo createdAt tồn tại và hợp lệ
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc dự án");
      return [];
    }
  }, [projects, filterStatus, filterPriority, searchQuery]);

  // Calculate project progress
  const getProjectProgressPercentage = (projectId) => {
    const projectProgress = allProgress.filter(p => p.project_id === projectId);
    if (projectProgress.length === 0) return 0;
    
    const completedCount = projectProgress.filter(p => p.status === 'completed').length;
    return Math.round((completedCount / projectProgress.length) * 100);
  };

  // Get staff name
  const getStaffName = (staffId) => {
    const staffMember = staff.find(s => s._id === staffId);
    return staffMember ? staffMember.name : 'Unknown';
  };

  // Handle project actions
  const handleCreate = () => {
    setEditingProject(null);
    openCompose();
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    openCompose();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) {
      try {
        await deleteProject(id);
        getProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleDetail = (project) => {
    setDetailProject(project);
    openDetail();
  };



  // Handle form submission
  const handleFormSubmit = async (values) => {
    try {
      if (editingProject) {
        await updateProject(editingProject._id, values);
      } else {
        await createProject(values);
      }
      getProjects();
      closeCompose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleFormCancel = () => {
    setEditingProject(null);
    closeCompose();
  };

  // Get project progress for detail view
  const getProjectProgressData = (projectId) => {
    return allProgress.filter(p => p.project_id === projectId);
  };

  // Handle adding progress
  const handleAddProgress = async (progressData) => {
    try {
      await createProgress(progressData);
      // Refresh progress data
      getProjectProgress();
      console.log("Progress added successfully / Thêm tiến trình thành công");
    } catch (error) {
      console.error('Error adding progress / Lỗi khi thêm tiến trình:', error);
      throw error;
    }
  };

  // Status and priority options for filtering
  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...PROJECT_STATUS
  ];

  const priorityOptions = [
    { value: "all", label: "Tất cả mức độ" },
    ...PRIORITY_LEVELS
  ];

  // Badge helpers using centralized functions
  const getStatusBadge = (status) => {
    const statusItem = PROJECT_STATUS.find(s => s.value === status);
    return {
      color: getStatusColor(status),
      label: statusItem?.label || status
    };
  };

  const getPriorityBadge = (priority) => {
    const priorityItem = PRIORITY_LEVELS.find(p => p.value === priority);
    return {
      color: getPriorityColor(priority),
      label: priorityItem?.label || priority
    };
  };

  return (
      <ClientOnly>
      <>
        <div style={{ margin: 0, padding: 0 }}>
          <div className="relative" style={{ margin: 0, padding: 0 }}>
            <LoadingOverlay visible={loading} />
            
            {/* Header */}
            <Flex justify="space-between" align="center">
              <Title order={2} className="text-blue-500">
                Quản Lý Dự Án
              </Title>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleCreate}
                loading={mutationLoading}
              >
                Tạo Dự Án Mới
              </Button>
            </Flex>

            {/* Filters */}
            <Card withBorder p="md">
              <Text fw={600}>Bộ lọc và tìm kiếm</Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    placeholder="Tìm kiếm theo tên hoặc mã dự án..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Lọc theo trạng thái"
                    data={statusOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Lọc theo mức độ ưu tiên"
                    data={priorityOptions}
                    value={filterPriority}
                    onChange={setFilterPriority}
                  />
                </Grid.Col>
              </Grid>
            </Card>

            {/* Projects Grid */}
            <Grid gutter="md">
              {filteredProjects.map((project) => {
                const statusBadge = getStatusBadge(project.status);
                const priorityBadge = getPriorityBadge(project.priority);
                const progressPercentage = getProjectProgressPercentage(project._id);
                const managerName = getStaffName(project.project_manager);
                const isOverdue = project.status === 'in_progress' && currentDate > new Date(project.expected_end_date);

                return (
                  <Grid.Col key={project._id} span={{ base: 12, md: 6, lg: 4 }}>
                    <Card withBorder p="md" h="100%" className="hover:shadow-lg transition-shadow">
                      <Stack gap="sm">
                        {/* Header */}
                        <Group justify="space-between">
                          <Badge color={priorityBadge.color} variant="light" size="sm">
                            {priorityBadge.label}
                          </Badge>
                          <Group gap="xs">
                            <Tooltip label="Xóa dự án">
                              <ActionIcon
                                variant="light"
                                color="red"
                                onClick={() => handleDelete(project._id)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>

                        {/* Project Info */}
                        <div>
                          <Text fw={600} size="lg" lineClamp={2}>
                            {project.project_name}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {project.project_code}
                          </Text>
                        </div>

                        <Text size="sm" lineClamp={3} c="dimmed">
                          {project.description}
                        </Text>

                        {/* Status and Progress */}
                        <Group justify="space-between">
                          <Badge color={statusBadge.color} variant="filled">
                            {statusBadge.label}
                          </Badge>
                          <Group gap="xs">
                            <IconProgress size={16} />
                            <Text size="sm" fw={500}>
                              {progressPercentage}%
                            </Text>
                          </Group>
                        </Group>

                        <Progress value={progressPercentage} size="sm" />

                        {/* Details */}
                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconUsers size={16} />
                            <Text size="sm">
                              PM: {managerName}
                            </Text>
                          </Group>
                          
                          <Group gap="xs">
                            <IconCalendar size={16} />
                            <Text size="sm" c={isOverdue ? "red" : "dimmed"}>
                              Hạn: {dayjs(project.expected_end_date).format("DD/MM/YYYY")}
                              {isOverdue && <IconAlertCircle size={16} color="red" style={{ marginLeft: 4 }} />}
                            </Text>
                          </Group>

                          <Group gap="xs">
                            <IconCurrency size={16} />
                            <Text size="sm">
                              <NumberFormatter
                                value={project.budget}
                                thousandSeparator=","
                                suffix=" VNĐ"
                              />
                            </Text>
                          </Group>
                        </Stack>

                        {/* Action Buttons */}
                        <Group grow>
                          <Button
                            variant="light"
                            size="xs"
                            onClick={() => handleDetail(project)}
                          >
                            Xem Chi Tiết
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(project)}
                          >
                            Chỉnh Sửa
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>

            {/* Empty State */}
            {filteredProjects.length === 0 && !loading && (
              <Card withBorder p="xl" className="text-center">
                <IconTarget size={48} className="mx-auto mb-4 text-gray-400" />
                <Text size="lg" fw={500} mb="xs">
                  Không tìm thấy dự án nào
                </Text>
                <Text c="dimmed" mb="lg">
                  {projects.length === 0 
                    ? "Hãy tạo dự án đầu tiên của bạn"
                    : "Thử thay đổi bộ lọc để xem thêm dự án"
                  }
                </Text>
                {projects.length === 0 && (
                  <Button onClick={handleCreate}>
                    Tạo Dự Án Đầu Tiên
                  </Button>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Create/Edit Modal */}
        <Modal
          opened={composeOpened}
          onClose={closeCompose}
          title={editingProject ? "Chỉnh Sửa Dự Án" : "Tạo Dự Án Mới"}
          size="xl"
        >
          <ProjectForm
            project={editingProject}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={mutationLoading}
            staff={staff}
          />
        </Modal>

        {/* Detail Modal */}
        <Modal
          opened={detailOpened}
          onClose={closeDetail}
          title="Chi Tiết Dự Án"
          size="98%"
          styles={{
            body: { maxHeight: '90vh', overflowY: 'auto' }
          }}
        >
          {detailProject && (
            <ProjectDetail
              project={detailProject}
              staff={staff}
              projectProgress={getProjectProgressData(detailProject._id)}
              onEdit={(project) => {
                closeDetail();
                handleEdit(project);
              }}
              onAddProgress={handleAddProgress}
            />
          )}
        </Modal>
      </>
      </ClientOnly>
  );
} 