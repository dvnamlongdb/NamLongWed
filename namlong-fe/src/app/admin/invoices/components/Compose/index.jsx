/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import React, { useEffect } from "react";
import { useForm } from "@mantine/form";
import "dayjs/locale/vi";
import {
  Button,
  TextInput,
  NumberInput,
  Textarea,
  Group,
  Space,
  Container,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";

export default function ComposeForm({ initialValues, customers, onSubmit }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sizeInput = isMobile ? "xs" : "sm";

  useEffect(() => {
    // Add CSS to force full width and comfortable spacing for Modal form controls
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
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const isEdit = !!initialValues?._id;

  const form = useForm({
    initialValues: {
      invoice_number: initialValues?.invoice_number || "",
      customer_tax: initialValues?.customer_tax || "",
      customer_name: initialValues?.customer_name || "",
      customer_address: initialValues?.customer_address || "",
      total: initialValues?.total || 0,
      tax: initialValues?.tax || 10,
      total_after_vat: initialValues?.total_after_vat || 0,
      refund_amount: initialValues?.refund_amount || 0,
      cash_back: initialValues?.cash_back || 5,
      signed_date: initialValues?.signed_date 
        ? dayjs(initialValues.signed_date).toDate()
        : new Date(),
      description: initialValues?.description || "",
      notes: initialValues?.notes || "",
    },
    validate: {
      invoice_number: (value) => (!value ? "Vui lòng nhập số hóa đơn" : null),
      customer_tax: (value) => (!value ? "Vui lòng chọn khách hàng" : null),
      customer_address: (value) => (!value ? "Vui lòng nhập địa chỉ khách hàng" : null),
      total: (value) => (value <= 0 ? "Tổng tiền phải lớn hơn 0" : null),
      tax: (value) => (value < 0 || value > 100 ? "Thuế phải từ 0-100%" : null),
      refund_amount: (value) => (value < 0 ? "Số tiền hoàn lại không được âm" : null),
      cash_back: (value) => (value < 0 || value > 100 ? "Hoàn lại phải từ 0-100%" : null),
      description: (value) => (!value ? "Vui lòng nhập mô tả" : null),
    },
  });

  // Calculate derived values
  const calculateRevenue = (total, tax, cashBack) => {
    const afterTax = total - (total * tax / 100);
    const afterCashBack = afterTax - (total * cashBack / 100);
    return afterCashBack;
  };

  const revenueTotal = calculateRevenue(
    form.values.total,
    form.values.tax,
    form.values.cash_back
  );

  const handleCustomerChange = (customerTax) => {
    const selectedCustomer = customers?.find(c => c.tax_number === customerTax);
    form.setValues({
      ...form.values,
      customer_tax: customerTax,
      customer_name: selectedCustomer?.name || "",
      customer_address: selectedCustomer?.address || "",
    });
  };

  const handleSubmit = (values) => {
    const submitData = {
      ...values,
      total_after_vat: values.total * (1 + values.tax / 100),
      revenue_total: calculateRevenue(values.total, values.tax, values.cash_back),
      expense_total: 0, // Default for now
      signed_date: dayjs(values.signed_date).toISOString(),
    };
    
    onSubmit(submitData);
  };

    return (
    <div style={{ 
      width: '100%', 
      boxSizing: 'border-box',
      minWidth: '100%',
      maxWidth: '100%'
    }}>
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '100%' }}>
        <Group grow style={{ width: '100%' }}>
          <TextInput
            label="Số hóa đơn"
            placeholder="Nhập số hóa đơn (VD: HD001/2024)"
            {...form.getInputProps("invoice_number")}
            size={sizeInput}
            required
            style={{ width: '100%' }}
          />
          <TextInput
            label="Mã số thuế"
            placeholder="Mã số thuế khách hàng"
            {...form.getInputProps("customer_tax")}
            size={sizeInput}
            required
            readOnly={!!form.values.customer_name}
            style={{ width: '100%' }}
          />
        </Group>

        <Group grow>
              <Select
            label="Khách hàng"
            placeholder="Chọn khách hàng"
            data={customers?.map(customer => ({
              value: customer.tax_number,
              label: `${customer.name} (${customer.tax_number})`
            })) || []}
            value={form.values.customer_tax}
            onChange={handleCustomerChange}
            error={form.errors.customer_tax}
            size={sizeInput}
                searchable
            required
          />
          <TextInput
            label="Địa chỉ khách hàng"
            placeholder="Địa chỉ khách hàng"
            {...form.getInputProps("customer_address")}
            size={sizeInput}
            required
              />
        </Group>

        <Group grow>
              <NumberInput
            label="Tổng tiền (VNĐ)"
            placeholder="Nhập tổng tiền"
            value={form.values.total}
            error={form.errors.total}
            size={sizeInput}
                thousandSeparator=","
            min={0}
            required
                onChange={(value) => {
              form.setFieldValue("total", value);
              if (value > 0 && form.values.refund_amount > 0) {
                const percentage = (form.values.refund_amount / value) * 100;
                const roundedPercentage = Math.round(percentage * 100) / 100;
                form.setFieldValue("cash_back", roundedPercentage);
              }
            }}
          />
              <NumberInput
            label="Thuế (%)"
            placeholder="Nhập thuế"
            value={form.values.tax}
            error={form.errors.tax}
            size={sizeInput}
            min={0}
            max={100}
            required
                onChange={(value) => {
              form.setFieldValue("tax", value);
                }}
              />
        </Group>

        <Group grow>
              <NumberInput
            label="Hoàn lại (VNĐ)"
            placeholder="Nhập số tiền hoàn lại"
            value={form.values.refund_amount}
            error={form.errors.refund_amount}
            size={sizeInput}
                thousandSeparator=","
                min={0}
                onChange={(value) => {
              form.setFieldValue("refund_amount", value);
              if (form.values.total > 0) {
                const percentage = ((value || 0) / form.values.total) * 100;
                const roundedPercentage = Math.round(percentage * 100) / 100;
                form.setFieldValue("cash_back", roundedPercentage);
              }
            }}
          />
          <DateInput
            label="Ngày ký"
            placeholder="Chọn ngày ký"
            {...form.getInputProps("signed_date")}
            size={sizeInput}
            required
          />
        </Group>

        <Group grow>
        <TextInput
          label="Mô tả"
          placeholder="Nhập mô tả hóa đơn"
          {...form.getInputProps("description")}
          size={sizeInput}
          required
        />
        <NumberInput
            label="Doanh thu (VNĐ)"
            value={revenueTotal}
          size={sizeInput}
            thousandSeparator=","
            readOnly
            styles={{
              input: { backgroundColor: '#f8f9fa', fontWeight: 'bold' }
            }}
          />
        </Group>

        <Textarea
          label="Ghi chú"
          placeholder="Nhập ghi chú (tùy chọn)"
          {...form.getInputProps("notes")}
          size={sizeInput}
          minRows={2}
          maxRows={4}
        />

        <Group justify="flex-end">
          <Button
            type="submit"
            size={sizeInput}
          >
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Group>
      </form>
    </div>
  );
}
