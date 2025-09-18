/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Group,
  Grid,
  Select,
  NumberInput,
  Textarea,
  Card,
  Text,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";

export default function SalaryForm({ data, onSubmit, onCancel, staff = [] }) {
  const [selectedStaff, setSelectedStaff] = useState(null);

  const form = useForm({
    initialValues: {
      staffId: data?.staffId || "",
      month: data?.month ? new Date(data.month) : new Date(),
      basicSalary: data?.basicSalary || 0,
      allowances: data?.allowances || 0,
      deductions: data?.deductions || 0,
      netSalary: data?.netSalary || 0,
      notes: data?.notes || "",
      overtimeHours: data?.overtimeHours || 0,
      overtimeRate: data?.overtimeRate || 50000,
      bonus: data?.bonus || 0,
      // Detailed allowances
      transportAllowance: data?.transportAllowance || 0,
      mealAllowance: data?.mealAllowance || 0,
      phoneAllowance: data?.phoneAllowance || 0,
      performanceBonus: data?.performanceBonus || 0,
      holidayBonus: data?.holidayBonus || 0,
      otherAllowances: data?.otherAllowances || 0,
      insurance: data?.insurance || 0,
      tax: data?.tax || 0,
    },
    validate: {
      staffId: (value) => !value ? "Vui lòng chọn nhân viên" : null,
      month: (value) => !value ? "Vui lòng chọn tháng" : null,
      basicSalary: (value) => value < 0 ? "Lương cơ bản không được âm" : null,
    },
  });

  // Calculate net salary automatically
  useEffect(() => {
    const basicSalary = form.values.basicSalary || 0;
    const bonus = form.values.bonus || 0;
    const overtimeHours = form.values.overtimeHours || 0;
    const overtimeRate = form.values.overtimeRate || 0;
    
    // Detailed allowances
    const transportAllowance = form.values.transportAllowance || 0;
    const mealAllowance = form.values.mealAllowance || 0;
    const phoneAllowance = form.values.phoneAllowance || 0;
    const performanceBonus = form.values.performanceBonus || 0;
    const holidayBonus = form.values.holidayBonus || 0;
    const otherAllowances = form.values.otherAllowances || 0;
    
    const deductions = form.values.deductions || 0;
    const insurance = form.values.insurance || 0;
    const tax = form.values.tax || 0;

    const overtimePay = overtimeHours * overtimeRate;
    const totalAllowances = bonus + overtimePay + transportAllowance + mealAllowance + phoneAllowance + performanceBonus + holidayBonus + otherAllowances;
    const totalDeductions = deductions + insurance + tax;
    const netSalary = basicSalary + totalAllowances - totalDeductions;

    form.setFieldValue("allowances", totalAllowances);
    form.setFieldValue("deductions", totalDeductions);
    form.setFieldValue("netSalary", Math.max(0, netSalary));
  }, [
    form.values.basicSalary,
    form.values.bonus,
    form.values.overtimeHours,
    form.values.overtimeRate,
    form.values.transportAllowance,
    form.values.mealAllowance,
    form.values.phoneAllowance,
    form.values.performanceBonus,
    form.values.holidayBonus,
    form.values.otherAllowances,
    form.values.insurance,
    form.values.tax,
  ]);

  // Update selected staff when staffId changes
  useEffect(() => {
    if (form.values.staffId && staff) {
      const staffMember = staff.find(s => s._id === form.values.staffId);
      setSelectedStaff(staffMember);
    }
  }, [form.values.staffId, staff]);

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values);
  });

  // Generate staff options
  const staffOptions = staff?.map(s => ({
    value: s._id,
    label: `${s.staff_code} - ${s.name} (${s.position})`,
  })) || [];

  return (
    <form onSubmit={handleSubmit}>
      <Grid>
        {/* Staff Selection */}
        <Grid.Col span={12}>
          <Select
            label="Nhân viên"
            placeholder="Chọn nhân viên"
            data={staffOptions}
            {...form.getInputProps("staffId")}
            searchable
            required
          />
        </Grid.Col>

        {/* Selected Staff Info */}
        {selectedStaff && (
          <Grid.Col span={12}>
            <Card withBorder p="sm" bg="blue.0">
              <Text size="sm" fw={500}>
                📋 {selectedStaff.name} - {selectedStaff.position}
              </Text>
              <Text size="xs" c="dimmed">
                Mã NV: {selectedStaff.staff_code} | Email: {selectedStaff.email}
              </Text>
            </Card>
          </Grid.Col>
        )}

        {/* Month */}
        <Grid.Col span={12}>
          <DateInput
            label="Tháng lương"
            placeholder="Chọn tháng"
            {...form.getInputProps("month")}
            valueFormat="MM/YYYY"
            required
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Divider label="Thông tin lương" />
        </Grid.Col>

        {/* Basic Salary */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <NumberInput
            label="Lương cơ bản"
            placeholder="Nhập lương cơ bản"
            min={0}
            step={100000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.basicSalary}
            onChange={(value) => form.setFieldValue("basicSalary", value || 0)}
            error={form.errors.basicSalary}
            required
          />
        </Grid.Col>

        {/* Bonus */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <NumberInput
            label="Thưởng"
            placeholder="Nhập thưởng"
            min={0}
            step={50000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.bonus}
            onChange={(value) => form.setFieldValue("bonus", value || 0)}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Divider label="Các khoản phụ cấp" />
        </Grid.Col>

        {/* Transport Allowance */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Phụ cấp di chuyển"
            placeholder="Nhập phụ cấp di chuyển"
            min={0}
            step={50000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.transportAllowance}
            onChange={(value) => form.setFieldValue("transportAllowance", value || 0)}
          />
        </Grid.Col>

        {/* Meal Allowance */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Phụ cấp ăn trưa"
            placeholder="Nhập phụ cấp ăn trưa"
            min={0}
            step={25000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.mealAllowance}
            onChange={(value) => form.setFieldValue("mealAllowance", value || 0)}
          />
        </Grid.Col>

        {/* Phone Allowance */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Phụ cấp điện thoại"
            placeholder="Nhập phụ cấp điện thoại"
            min={0}
            step={25000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.phoneAllowance}
            onChange={(value) => form.setFieldValue("phoneAllowance", value || 0)}
          />
        </Grid.Col>

        {/* Performance Bonus */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Thưởng hiệu suất"
            placeholder="Nhập thưởng hiệu suất"
            min={0}
            step={100000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.performanceBonus}
            onChange={(value) => form.setFieldValue("performanceBonus", value || 0)}
          />
        </Grid.Col>

        {/* Holiday Bonus */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Thưởng lễ tết"
            placeholder="Nhập thưởng lễ tết"
            min={0}
            step={100000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.holidayBonus}
            onChange={(value) => form.setFieldValue("holidayBonus", value || 0)}
          />
        </Grid.Col>

        {/* Other Allowances */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Phụ cấp khác"
            placeholder="Nhập phụ cấp khác"
            min={0}
            step={50000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.otherAllowances}
            onChange={(value) => form.setFieldValue("otherAllowances", value || 0)}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Divider label="Làm thêm giờ" />
        </Grid.Col>

        {/* Overtime */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Số giờ làm thêm"
            placeholder="0"
            min={0}
            max={100}
            step={0.5}
            suffix=" giờ"
            value={form.values.overtimeHours}
            onChange={(value) => form.setFieldValue("overtimeHours", value || 0)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Đơn giá OT"
            placeholder="50,000"
            min={0}
            step={10000}
            thousandSeparator=","
            suffix=" VNĐ/giờ"
            value={form.values.overtimeRate}
            onChange={(value) => form.setFieldValue("overtimeRate", value || 0)}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Tiền làm thêm"
            value={(form.values.overtimeHours || 0) * (form.values.overtimeRate || 0)}
            thousandSeparator=","
            suffix=" VNĐ"
            readOnly
            styles={{
              input: { backgroundColor: "#f8f9fa", color: "#495057" }
            }}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Divider label="Các khoản khấu trừ" />
        </Grid.Col>

        {/* Insurance */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Bảo hiểm"
            placeholder="Nhập bảo hiểm"
            min={0}
            step={50000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.insurance}
            onChange={(value) => form.setFieldValue("insurance", value || 0)}
          />
        </Grid.Col>

        {/* Tax */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Thuế TNCN"
            placeholder="Nhập thuế"
            min={0}
            step={50000}
            thousandSeparator=","
            suffix=" VNĐ"
            value={form.values.tax}
            onChange={(value) => form.setFieldValue("tax", value || 0)}
          />
        </Grid.Col>

        {/* Total Deductions (calculated) */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Tổng khấu trừ"
            value={form.values.deductions}
            thousandSeparator=","
            suffix=" VNĐ"
            readOnly
            styles={{
              input: { backgroundColor: "#fff3cd", color: "#856404" }
            }}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Divider label="Kết quả" />
        </Grid.Col>

        {/* Summary */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Tổng phụ cấp"
            value={form.values.allowances}
            thousandSeparator=","
            suffix=" VNĐ"
            readOnly
            styles={{
              input: { backgroundColor: "#d1ecf1", color: "#0c5460" }
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Tổng khấu trừ"
            value={form.values.deductions}
            thousandSeparator=","
            suffix=" VNĐ"
            readOnly
            styles={{
              input: { backgroundColor: "#f8d7da", color: "#721c24" }
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <NumberInput
            label="Lương thực nhận"
            value={form.values.netSalary}
            thousandSeparator=","
            suffix=" VNĐ"
            readOnly
            styles={{
              input: { 
                backgroundColor: "#d4edda", 
                color: "#155724",
                fontWeight: 600,
                fontSize: "1.1rem"
              }
            }}
          />
        </Grid.Col>

        {/* Notes */}
        <Grid.Col span={12}>
          <Textarea
            label="Ghi chú"
            placeholder="Nhập ghi chú về bản lương này..."
            {...form.getInputProps("notes")}
            rows={3}
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="lg">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          {data ? "Cập nhật" : "Tạo mới"}
        </Button>
      </Group>
    </form>
  );
} 