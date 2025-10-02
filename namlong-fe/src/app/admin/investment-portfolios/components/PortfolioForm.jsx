/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Group,
  Space,
  Container,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useCustomers } from "../../../../service/hook";
import { INVESTMENT_CATEGORIES } from "../../../../constants/formOptions";

const PortfolioForm = ({ data, onSubmit, loading }) => {
  const { data: customers, getCustomers } = useCustomers();
  const isEditing = !!data;
  const [mounted, setMounted] = useState(false);

  const form = useForm({
    initialValues: {
      customer_tax: data?.customer_tax || "",
      project_name: "",
      investment_type: "technology",
      other_investment_type: "",
      amount: 0,
      investment_date: "",
      expected_return_date: "",
      description: "",
      notes: "",
    },
    validate: {
      customer_tax: (value) => (!value ? "Vui lòng chọn khách hàng" : null),
      project_name: (value) => (!value ? "Vui lòng nhập tên dự án" : null),
      amount: (value) => (value <= 0 ? "Số tiền phải lớn hơn 0" : null),
      description: (value) => (!value ? "Vui lòng nhập mô tả" : null),
      investment_date: (value) => (!value ? "Vui lòng chọn ngày đầu tư" : null),
      expected_return_date: (value) => (!value ? "Vui lòng chọn ngày thu hồi" : null),
    },
  });

  const customerOptions = (Array.isArray(customers) ? customers : []).map((customer) => {
    const tax = customer?.tax_id || customer?.tax_number || customer?.tax;
    return {
      value: String(tax || ""),
      label: `${customer?.name || "Không tên"} (${tax || "N/A"})`,
    };
  }).filter(opt => opt.value !== "");

  const handleSubmit = (values) => {
    const submitData = {
      ...values,
      investment_date: values.investment_date ? new Date(values.investment_date) : new Date(),
      expected_return_date: values.expected_return_date ? new Date(values.expected_return_date) : new Date(),
    };
    onSubmit(submitData);
  };

  useEffect(() => {
    setMounted(true);
    getCustomers();
    
    // Set default dates after component mounts to avoid hydration issues
    if (!form.values.investment_date) {
      const today = new Date().toISOString().split('T')[0];
      form.setFieldValue('investment_date', today);
    }
    if (!form.values.expected_return_date) {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      form.setFieldValue('expected_return_date', futureDateStr);
    }

    // Add comfortable spacing in modal controls
    const style = document.createElement('style');
    style.textContent = `
      .mantine-Modal-body .mantine-Group-root,
      .mantine-Modal-body .mantine-TextInput-root,
      .mantine-Modal-body .mantine-Textarea-root,
      .mantine-Modal-body .mantine-NumberInput-root,
      .mantine-Modal-body .mantine-Select-root {
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 12px !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, [getCustomers]);

  if (!mounted) {
    return <div>Loading form...</div>;
  }

  const showOtherInvestmentType = form.values.investment_type === "other";

  return (
    <div className="relative" style={{ width: '100%' }}>
      <LoadingOverlay visible={loading} />
      
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
        <Group grow>
          <Select
            label="Khách hàng"
            placeholder="Chọn khách hàng"
            data={customerOptions}
            {...form.getInputProps("customer_tax")}
            disabled={isEditing}
            searchable
            required
          />
          <TextInput
            label="Tên dự án"
            placeholder="Nhập tên dự án đầu tư"
            {...form.getInputProps("project_name")}
            required
          />
        </Group>

        <Group grow>
          <Select
            label="Loại đầu tư"
            data={INVESTMENT_CATEGORIES}
            {...form.getInputProps("investment_type")}
            required
          />
          <NumberInput
            label="Số tiền đầu tư (VNĐ)"
            placeholder="Nhập số tiền"
            {...form.getInputProps("amount")}
            thousandSeparator=","
            min={0}
            required
          />
        </Group>

        {showOtherInvestmentType && (
            <TextInput
              label="Loại đầu tư khác"
              placeholder="Nhập loại đầu tư khác"
              {...form.getInputProps("other_investment_type")}
            />
        )}

        <Group grow>
          <TextInput
            label="Ngày đầu tư"
            placeholder="YYYY-MM-DD"
            type="date"
            {...form.getInputProps("investment_date")}
            required
          />
          <TextInput
            label="Ngày kỳ vọng thu hồi"
            placeholder="YYYY-MM-DD"
            type="date"
            {...form.getInputProps("expected_return_date")}
            required
          />
        </Group>

        <Textarea
          label="Mô tả dự án"
          placeholder="Nhập mô tả chi tiết về dự án"
          {...form.getInputProps("description")}
          minRows={3}
          maxRows={6}
          required
        />

        <Textarea
          label="Ghi chú"
          placeholder="Nhập ghi chú (tùy chọn)"
          {...form.getInputProps("notes")}
          minRows={2}
          maxRows={4}
        />

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            {isEditing ? "Cập nhật Portfolio" : "Tạo Portfolio Mới"}
          </Button>
        </Group>
      </form>
    </div>
  );
};

export default PortfolioForm; 