/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import "dayjs/locale/vi";
import {
  Button,
  TextInput,
  Textarea,
  Group,
  Space,
  Container,
  Grid,
  Select,
  LoadingOverlay,
  NumberInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";
import { INVESTMENT_CATEGORIES } from "../../../../../constants/formOptions";

export default function InvestmentForm({ data, loading, onSubmit }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sizeInput = isMobile ? "xs" : "sm";
  const [showOtherInvestmentType, setShowOtherInvestmentType] = useState(data?.investment_type === 'other');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .mantine-Modal-body .mantine-Group-root,
      .mantine-Modal-body .mantine-TextInput-root,
      .mantine-Modal-body .mantine-Textarea-root,
      .mantine-Modal-body .mantine-NumberInput-root,
      .mantine-Modal-body .mantine-Select-root,
      .mantine-Modal-body .mantine-DateInput-root {
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 12px !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: data
      ? {
          id: data._id,
          project_name: data.project_name || "",
          investor_name: data.investor_name || "",
          investment_type: data.investment_type || "",
          other_investment_type: data.other_investment_type || "",
          amount: data.amount || 0,

          investment_date: data.investment_date
            ? dayjs(data.investment_date).toDate()
            : dayjs().toDate(),
          expected_return_date: data.expected_return_date
            ? dayjs(data.expected_return_date).toDate()
            : undefined,
          description: data.description || "",
          notes: data.notes || "",
        }
      : {
          project_name: "",
          investor_name: "",
          investment_type: "",
          other_investment_type: "",
          amount: 0,

          investment_date: dayjs().toDate(),
          expected_return_date: undefined,
          description: "",
          notes: "",
        },

    validate: {
      project_name: (value) => (value ? null : "Vui lòng nhập tên dự án"),
      investor_name: (value) => (value ? null : "Vui lòng nhập tên nhà đầu tư"),
      investment_type: (value) => (value ? null : "Vui lòng chọn loại đầu tư"),
      amount: (value) => (value && value > 0 ? null : "Vui lòng nhập số tiền đầu tư"),
      investment_date: (value) => (value ? null : "Vui lòng chọn ngày đầu tư"),
    },
  });

  return (
    <div style={{ width: '100%' }}>
      <LoadingOverlay visible={loading} />
      <form noValidate onSubmit={form.onSubmit(onSubmit)} style={{ width: '100%' }}>
        {/* Thông tin cơ bản */}
        <Grid gutter={{ base: 'md', md: 20 }}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Tên dự án"
              placeholder="Nhập tên dự án"
              {...form.getInputProps("project_name")}
              required
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label="Tên nhà đầu tư"
              placeholder="Nhập tên nhà đầu tư"
              {...form.getInputProps("investor_name")}
              required
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              label="Loại đầu tư"
              placeholder="Chọn loại đầu tư"
              data={INVESTMENT_CATEGORIES}
              {...form.getInputProps("investment_type")}
              required
              size={sizeInput}
              searchable
              clearable
              onChange={(value) => {
                form.setFieldValue("investment_type", value);
                setShowOtherInvestmentType(value === 'other');
                if (value !== 'other') {
                  form.setFieldValue("other_investment_type", '');
                }
              }}
            />
          </Grid.Col>
          {showOtherInvestmentType && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Nhập loại đầu tư khác"
                placeholder="Nhập loại đầu tư cụ thể"
                {...form.getInputProps("other_investment_type")}
                required
                size={sizeInput}
              />
            </Grid.Col>
          )}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              label="Số tiền đầu tư (VNĐ)"
              placeholder="Nhập số tiền"
              {...form.getInputProps("amount")}
              required
              size={sizeInput}
              thousandSeparator=","
              min={0}
              hideControls
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateInput
              label="Ngày đầu tư"
              placeholder="Chọn ngày đầu tư"
              locale="vi"
              {...form.getInputProps("investment_date")}
              required
              valueFormat="DD/MM/YYYY"
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DateInput
              label="Ngày dự kiến thu hồi"
              placeholder="Chọn ngày dự kiến"
              locale="vi"
              {...form.getInputProps("expected_return_date")}
              valueFormat="DD/MM/YYYY"
              size={sizeInput}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Mô tả dự án"
              placeholder="Nhập mô tả chi tiết về dự án đầu tư"
              {...form.getInputProps("description")}
              size={sizeInput}
              minRows={3}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Ghi chú"
              placeholder="Nhập ghi chú bổ sung"
              {...form.getInputProps("notes")}
              size={sizeInput}
              minRows={2}
            />
          </Grid.Col>
        </Grid>

        <Space h="lg" />
        <Group justify="flex-end">
          <Button type="submit" loading={loading} size={sizeInput}>
            {data ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Group>
      </form>
    </div>
  );
}
