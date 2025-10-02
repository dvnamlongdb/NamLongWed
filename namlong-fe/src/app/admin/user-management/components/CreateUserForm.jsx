/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState } from "react";
import {
  Stack,
  TextInput,
  Select,
  Button,
  Group,
  Card,
  Text,
  Title,
  Grid,
  Alert,
  Textarea,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconBriefcase,
  IconInfoCircle,
  IconNotes,
} from "@tabler/icons-react";
import { DEPARTMENTS, ROLES, POSITIONS_BY_DEPARTMENT, getPositionsByDepartment } from "../../../../constants/formOptions";

export default function CreateUserForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    department: "",
    position: "",
    role: "employee",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập là bắt buộc";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.department) {
      newErrors.department = "Vui lòng chọn phòng ban";
    }

    if (!formData.position.trim()) {
      newErrors.position = "Chức vụ là bắt buộc";
    }

    if (!formData.role) {
      newErrors.role = "Vui lòng chọn vai trò";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new user object
      const newUser = {
        id: `usr_${Date.now()}`,
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        username: formData.username.trim(),
        password: formData.password.trim(),
        department: DEPARTMENTS.find(d => d.value === formData.department)?.label || formData.department,
        position: formData.position.trim(),
        role: formData.role,
        status: "pending",
        requestedBy: "HR Phòng Nhân Sự", // In real app, get from current user
        requestDate: new Date().toISOString().split('T')[0],
        approvedBy: null,
        approvedDate: null,
        notes: formData.notes.trim(),
        createdDate: new Date().toISOString().split('T')[0],
      };

      await onSubmit(newUser);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        department: "",
        position: "",
        role: "employee",
        notes: "",
      });
      
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle department change
  const handleDepartmentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      department: value,
      position: "", // Reset position when department changes
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Personal Information */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconUser size="1.2rem" />
              <Text>Thông tin cá nhân</Text>
            </Group>
          </Title>
          
          <Grid gutter="md">
            <Grid.Col span={12}>
              <TextInput
                label="Họ và tên"
                placeholder="Nhập họ và tên đầy đủ..."
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                error={errors.fullName}
                leftSection={<IconUser size={16} />}
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Email"
                placeholder="example@namlong.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                error={errors.email}
                leftSection={<IconMail size={16} />}
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Số điện thoại"
                placeholder="0901234567"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                error={errors.phone}
                leftSection={<IconPhone size={16} />}
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                error={errors.username}
                leftSection={<IconUser size={16} />}
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                error={errors.password}
                leftSection={<IconUser size={16} />}
                required
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Work Information */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconBriefcase size="1.2rem" />
              <Text>Thông tin công việc</Text>
            </Group>
          </Title>
          
          <Grid gutter="md">
            <Grid.Col span={6}>
              <Select
                label="Phòng ban"
                placeholder="Chọn phòng ban"
                data={DEPARTMENTS}
                value={formData.department}
                onChange={handleDepartmentChange}
                error={errors.department}
                leftSection={<IconBuilding size={16} />}
                required
                searchable
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Chức vụ"
                placeholder="Chọn chức vụ"
                data={getPositionsByDepartment(formData.department)}
                value={formData.position}
                onChange={(value) => setFormData(prev => ({ ...prev, position: value }))}
                error={errors.position}
                leftSection={<IconBriefcase size={16} />}
                required
                searchable
                creatable
                getCreateLabel={(query) => `+ Tạo \"${query}\"`}
                onCreate={(query) => {
                  setFormData(prev => ({ ...prev, position: query }));
                  return query;
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Select
                label="Vai trò trong hệ thống"
                placeholder="Chọn vai trò"
                data={ROLES}
                value={formData.role}
                onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                error={errors.role}
                required
              />
            </Grid.Col>
          </Grid>

          <Alert 
            icon={<IconInfoCircle size={16} />} 
            color="blue" 
            variant="light" 
            mt="md"
          >
            <Text size="sm">
              <strong>Lưu ý:</strong> Vai trò sẽ quyết định quyền truy cập của người dùng trong hệ thống. 
              Chỉ Giám đốc mới có thể duyệt và kích hoạt tài khoản.
            </Text>
          </Alert>
        </Card>

        {/* Additional Notes */}
        <Card withBorder p="md">
          <Title order={4} mb="md">
            <Group gap="xs">
              <IconNotes size="1.2rem" />
              <Text>Ghi chú bổ sung</Text>
            </Group>
          </Title>
          
          <Textarea
            label="Ghi chú"
            placeholder="Thêm ghi chú về nhân viên, kinh nghiệm, lý do tạo tài khoản..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            minRows={3}
            maxRows={6}
          />
        </Card>

        {/* Form Actions */}
        <Group justify="flex-end" gap="md">
          <Button 
            variant="light" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            type="submit"
            loading={isSubmitting}
            leftSection={<IconUser size={16} />}
          >
            Tạo Yêu Cầu Tài Khoản
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 