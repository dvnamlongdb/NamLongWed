/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import React, { useState } from "react";
import { useForm } from "@mantine/form";
import "dayjs/locale/vi";
import {
  Button,
  TextInput,
  Group,
  Space,
  Container,
  LoadingOverlay,
  Textarea,
  Select,
  Combobox,
  Grid,
  Text,
  Divider,
  FileInput,
  Box,
  Image,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { DateInput } from "@mantine/dates";
import { IconUpload, IconQrcode } from "@tabler/icons-react";
import { BANKS, DEPARTMENTS, ROLES, POSITIONS_BY_DEPARTMENT, getPositionsByDepartment, getBankLabel } from "../../../../../constants/formOptions";

export default function StaffForm({ data = undefined, loading, onSubmit }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sizeInput = isMobile ? "xs" : "sm";
  const [qrPreview, setQrPreview] = useState(data?.qr_code || null);
  const [showOtherPosition, setShowOtherPosition] = useState(data?.position === 'other');

  const form = useForm({
    mode: "uncontrolled",
    initialValues: data
      ? {
          id: data._id,
          staff_code: data?.staff_code || '',
          name: data?.name || '',
          position: data?.position || '',
          other_position: data?.other_position || '',
          phone_number: data?.phone_number || '',
          address: data?.address || '',
          citizen_id: data?.citizen_id || '',
          personal_tax_code: data?.personal_tax_code || '',
          health_insurance_number: data?.health_insurance_number || '',
          social_insurance_number: data?.social_insurance_number || '',
          bank_account: data?.bank_account || '',
          bank_name: data?.bank_name || '',
          notes: data?.notes || '',
          email: data?.email || '',
          date_of_birth: data?.date_of_birth
            ? dayjs(data.date_of_birth).toDate()
            : undefined,
          qr_code: data?.qr_code || '',
          department: data?.department || '',
          role: data?.role || 'employee',
        }
      : {
          staff_code: '',
          name: "",
          position: '',
          other_position: '',
          phone_number: "",
          address: "",
          citizen_id: '',
          personal_tax_code: '',
          health_insurance_number: '',
          social_insurance_number: '',
          bank_account: '',
          bank_name: '',
          notes: '',
          email: '',
          date_of_birth: undefined,
          qr_code: '',
          department: '',
          role: 'employee',
        },

    validate: {
      name: (value) => (value ? null : "Vui lòng nhập tên"),
      phone_number: (value) => (value ? null : "Vui lòng nhập số điện thoại"),
      date_of_birth: (value) => (value ? null : "Vui lòng nhập ngày sinh"),
      email: (value) => {
        if (!value) return null;
        return /^\S+@\S+$/.test(value) ? null : "Email không hợp lệ";
      },
      personal_tax_code: (value) => {
        if (!value) return null;
        return /^\d{10}$/.test(value) ? null : "Mã số thuế phải có 10 chữ số";
      },
      health_insurance_number: (value) => {
        if (!value) return null;
        return /^[A-Z]{2}\d{13}$/.test(value) ? null : "Số BHYT không đúng định dạng (VD: GD1234567890123)";
      },
      social_insurance_number: (value) => {
        if (!value) return null;
        return /^\d{10}$/.test(value) ? null : "Số BHXH phải có 10 chữ số";
      },
    },
  });

  const handleQrUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result;
        setQrPreview(base64);
        form.setFieldValue('qr_code', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get positions based on selected department
  const selectedDepartment = form.getValues().department;
  const availablePositions = selectedDepartment ? getPositionsByDepartment(selectedDepartment) : [];
  
  // Combine all positions for general selection if no department selected
  const allPositions = Object.values(POSITIONS_BY_DEPARTMENT).flat().map(pos => ({ value: pos, label: pos }));
  const positionOptions = selectedDepartment ? availablePositions : [...allPositions, { value: 'other', label: 'Khác' }];

  return (
    <div style={{ width: '100%' }}>
      <LoadingOverlay visible={loading} />
      <form noValidate onSubmit={form.onSubmit(onSubmit)} style={{ width: '100%' }}>
        {/* Thông tin cơ bản */}
        <Text size="lg" fw={600} c="blue" mb="md">
          📋 Thông tin cơ bản
        </Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Mã nhân viên"
              placeholder="Để trống để tự động tạo"
              {...form.getInputProps("staff_code")}
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Tên nhân viên"
              placeholder="Nhập tên nhân viên"
              {...form.getInputProps("name")}
              required
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Phòng ban"
              placeholder="Chọn phòng ban"
              data={DEPARTMENTS}
              {...form.getInputProps("department")}
              size={sizeInput}
              searchable
              clearable
              onChange={(value) => {
                form.setFieldValue("department", value);
                // Reset position when department changes
                form.setFieldValue("position", '');
                setShowOtherPosition(false);
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Vai trò"
              placeholder="Chọn vai trò"
              data={ROLES}
              {...form.getInputProps("role")}
              size={sizeInput}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Chức vụ"
              placeholder="Chọn chức vụ"
              data={positionOptions}
              {...form.getInputProps("position")}
              size={sizeInput}
              searchable
              clearable
              onChange={(value) => {
                form.setFieldValue("position", value);
                setShowOtherPosition(value === 'other');
                if (value !== 'other') {
                  form.setFieldValue("other_position", '');
                }
              }}
            />
          </Grid.Col>
          {showOtherPosition && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Nhập chức vụ khác"
                placeholder="Nhập chức vụ cụ thể"
                {...form.getInputProps("other_position")}
                required
                size={sizeInput}
              />
            </Grid.Col>
          )}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateInput
              label="Ngày sinh"
              placeholder="Chọn ngày sinh"
              locale="vi"
              {...form.getInputProps("date_of_birth")}
              required
              valueFormat="DD/MM/YYYY"
              size={sizeInput}
            />
          </Grid.Col>
        </Grid>

        <Space h="lg" />
        <Divider />
        <Space h="lg" />

        {/* Thông tin liên hệ */}
        <Text size="lg" fw={600} c="blue" mb="md">
          📞 Thông tin liên hệ
        </Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              {...form.getInputProps("phone_number")}
              required
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Email"
              placeholder="Nhập email"
              {...form.getInputProps("email")}
              size={sizeInput}
              type="email"
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <TextInput
              label="Địa chỉ"
              placeholder="Nhập địa chỉ"
              {...form.getInputProps("address")}
              size={sizeInput}
            />
          </Grid.Col>
        </Grid>

        <Space h="lg" />
        <Divider />
        <Space h="lg" />

        {/* Thông tin cá nhân */}
        <Text size="lg" fw={600} c="blue" mb="md">
          🆔 Thông tin cá nhân
        </Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Số căn cước công dân"
              placeholder="Nhập số căn cước"
              {...form.getInputProps("citizen_id")}
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Mã số thuế cá nhân"
              placeholder="Nhập mã số thuế (10 số)"
              {...form.getInputProps("personal_tax_code")}
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Số bảo hiểm y tế"
              placeholder="VD: GD1234567890123"
              {...form.getInputProps("health_insurance_number")}
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Số bảo hiểm xã hội"
              placeholder="Nhập số BHXH (10 số)"
              {...form.getInputProps("social_insurance_number")}
              size={sizeInput}
            />
          </Grid.Col>
        </Grid>

        <Space h="lg" />
        <Divider />
        <Space h="lg" />

        {/* Thông tin ngân hàng */}
        <Text size="lg" fw={600} c="blue" mb="md">
          🏦 Thông tin ngân hàng
        </Text>
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Số tài khoản ngân hàng"
              placeholder="Nhập số tài khoản"
              {...form.getInputProps("bank_account")}
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Ngân hàng"
              placeholder="Chọn ngân hàng"
              data={BANKS}
              {...form.getInputProps("bank_name")}
              size={sizeInput}
              searchable
              clearable
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Box>
              <Text size="sm" fw={500} mb="xs">
                QR Code thanh toán
              </Text>
              <FileInput
                placeholder="Chọn ảnh QR Code"
                accept="image/*"
                leftSection={<IconQrcode size={16} />}
                onChange={handleQrUpload}
                size={sizeInput}
                clearable
              />
              {qrPreview && (
                <Box mt="sm">
                  <Text size="xs" c="dimmed" mb="xs">Xem trước:</Text>
                  <Image
                    src={qrPreview}
                    alt="QR Code Preview"
                    fit="contain"
                    w={150}
                    h={150}
                    radius="md"
                  />
                </Box>
              )}
            </Box>
          </Grid.Col>
        </Grid>

        <Space h="lg" />
        <Divider />
        <Space h="lg" />

        {/* Ghi chú */}
        <Text size="lg" fw={600} c="blue" mb="md">
          📝 Ghi chú
        </Text>
        <Textarea
          label="Ghi chú"
          placeholder="Nhập ghi chú về nhân viên"
          {...form.getInputProps("notes")}
          size={sizeInput}
          autosize
          minRows={3}
          maxRows={6}
        />

        <Space h="xl" />

        <Group justify="right">
          <Button variant="light" size={sizeInput}>
            Hủy
          </Button>
          <Button loading={loading} type="submit" size={sizeInput}>
            {data ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Group>
      </form>
    </div>
  );
}
