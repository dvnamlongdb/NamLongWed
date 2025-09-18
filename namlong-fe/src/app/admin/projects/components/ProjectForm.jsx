/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import React, { useEffect } from "react";
import {
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Grid,
  MultiSelect,
  Card,
  Text,
  Divider,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { PROJECT_STATUS, PRIORITY_LEVELS } from "../../../../constants/formOptions";

export default function ProjectForm({ 
  project = null, 
  onSubmit, 
  onCancel, 
  loading = false,
  staff = []
}) {
  const isEditing = !!project;

  const form = useForm({
    initialValues: {
      project_name: "",
      project_code: "",
      description: "",
      start_date: null,
      expected_end_date: null,
      status: "draft",
      priority: "medium",
      budget: 0,
      assigned_staff: [],
      project_manager: "",
      client_info: "",
      notes: "",
    },
    validate: {
      project_name: (value) => (!value ? "Tên dự án là bắt buộc" : null),
      project_code: (value) => (!value ? "Mã dự án là bắt buộc" : null),
      description: (value) => (!value ? "Mô tả dự án là bắt buộc" : null),
      start_date: (value) => (!value ? "Ngày bắt đầu là bắt buộc" : null),
      expected_end_date: (value) => (!value ? "Ngày dự kiến kết thúc là bắt buộc" : null),
      budget: (value) => (value <= 0 ? "Ngân sách phải lớn hơn 0" : null),
      project_manager: (value) => (!value ? "Phải chọn người quản lý dự án" : null),
    },
  });

  // Load initial data when editing
  useEffect(() => {
    if (isEditing && project) {
      form.setValues({
        project_name: project.project_name || "",
        project_code: project.project_code || "",
        description: project.description || "",
        start_date: project.start_date ? new Date(project.start_date) : null,
        expected_end_date: project.expected_end_date ? new Date(project.expected_end_date) : null,
        status: project.status || "draft",
        priority: project.priority || "medium",
        budget: project.budget || 0,
        assigned_staff: project.assigned_staff || [],
        project_manager: project.project_manager || "",
        client_info: project.client_info || "",
        notes: project.notes || "",
      });
    }
  }, [project, isEditing]);

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  // Remove hardcoded options and use centralized constants
  const statusOptions = PROJECT_STATUS;
  const priorityOptions = PRIORITY_LEVELS;

  // Staff options for select
  const staffOptions = staff.map(s => ({
    value: s._id,
    label: `${s.name} (${s.staff_code})`
  }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {/* Basic Information */}
        <Card withBorder p="md">
          <Text fw={600} mb="md">Thông tin cơ bản</Text>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Tên dự án"
                placeholder="Nhập tên dự án..."
                required
                {...form.getInputProps("project_name")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Mã dự án"
                placeholder="Nhập mã dự án..."
                required
                {...form.getInputProps("project_code")}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Mô tả dự án"
                placeholder="Nhập mô tả chi tiết về dự án..."
                required
                rows={3}
                {...form.getInputProps("description")}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Schedule & Status */}
        <Card withBorder p="md">
          <Text fw={600} mb="md">Lịch trình & Trạng thái</Text>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateInput
                label="Ngày bắt đầu"
                placeholder="Chọn ngày bắt đầu"
                required
                valueFormat="DD/MM/YYYY"
                {...form.getInputProps("start_date")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <DateInput
                label="Ngày dự kiến kết thúc"
                placeholder="Chọn ngày kết thúc"
                required
                valueFormat="DD/MM/YYYY"
                {...form.getInputProps("expected_end_date")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Trạng thái"
                placeholder="Chọn trạng thái"
                data={statusOptions}
                required
                {...form.getInputProps("status")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Mức độ ưu tiên"
                placeholder="Chọn mức độ ưu tiên"
                data={priorityOptions}
                required
                {...form.getInputProps("priority")}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Budget */}
        <Card withBorder p="md">
          <Text fw={600} mb="md">Ngân sách</Text>
          <NumberInput
            label="Ngân sách dự án (VNĐ)"
            placeholder="Nhập ngân sách..."
            required
            min={0}
            step={1000000}
            thousandSeparator=","
            {...form.getInputProps("budget")}
          />
        </Card>

        {/* Team Management */}
        <Card withBorder p="md">
          <Text fw={600} mb="md">Quản lý nhóm</Text>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Người quản lý dự án"
                placeholder="Chọn Project Manager"
                data={staffOptions}
                required
                searchable
                {...form.getInputProps("project_manager")}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MultiSelect
                label="Nhân viên được phân công"
                placeholder="Chọn nhân viên tham gia"
                data={staffOptions}
                searchable
                {...form.getInputProps("assigned_staff")}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Additional Information */}
        <Card withBorder p="md">
          <Text fw={600} mb="md">Thông tin bổ sung</Text>
          <Stack gap="md">
            <Textarea
              label="Thông tin khách hàng"
              placeholder="Nhập thông tin liên hệ khách hàng..."
              rows={2}
              {...form.getInputProps("client_info")}
            />
            <Textarea
              label="Ghi chú"
              placeholder="Nhập ghi chú bổ sung..."
              rows={2}
              {...form.getInputProps("notes")}
            />
          </Stack>
        </Card>

        <Divider />

        {/* Action Buttons */}
        <Group justify="flex-end">
          <Button
            variant="outline"
            leftSection={<IconX size={16} />}
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            leftSection={<IconDeviceFloppy size={16} />}
            loading={loading}
          >
            {isEditing ? "Cập Nhật" : "Tạo Dự Án"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 