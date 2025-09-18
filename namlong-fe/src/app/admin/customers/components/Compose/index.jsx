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
  Textarea,
  Group,
  Space,
  Container,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

export default function CustomerForm({ initialValues, loading, onSubmit }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const sizeInput = isMobile ? "xs" : "sm";

  useEffect(() => {
    // Add CSS to force full width and comfortable vertical spacing in Modal forms
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
        margin-bottom: 12px !important; /* extra vertical spacing */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const form = useForm({
    initialValues: {
      name: initialValues?.name || "",
      tax_number: initialValues?.tax_number || "",
      address: initialValues?.address || "",
      phone: initialValues?.phone || "",
      email: initialValues?.email || "",
      notes: initialValues?.notes || "",
    },
    validate: {
      tax_number: (value) => (!value ? "Vui lòng nhập mã số thuế" : null),
      name: (value) => (!value ? "Vui lòng nhập tên khách hàng" : null),
      address: (value) => (!value ? "Vui lòng nhập địa chỉ" : null),
      phone: (value) => {
        if (!value) return "Vui lòng nhập số điện thoại";
        if (!/^[0-9+\-\s()]+$/.test(value)) return "Số điện thoại không hợp lệ";
        return null;
      },
      email: (value) => {
        if (!value) return "Vui lòng nhập email";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email không hợp lệ";
        return null;
      },
    },
  });

  return (
    <div style={{ 
      width: '100%', 
      boxSizing: 'border-box',
      minWidth: '100%',
      maxWidth: '100%'
    }}>
      <form onSubmit={form.onSubmit(onSubmit)} style={{ width: '100%' }}>
        <Group grow style={{ width: '100%' }}>
        <TextInput
          label="Tên khách hàng"
          placeholder="Nhập tên khách hàng"
          {...form.getInputProps("name")}
          required
          size={sizeInput}
            style={{ width: '100%' }}
        />
        <TextInput
          label="Mã số thuế"
          placeholder="Nhập mã số thuế"
          {...form.getInputProps("tax_number")}
          required
          size={sizeInput}
            style={{ width: '100%' }}
        />
        </Group>
        
        <TextInput
          label="Địa chỉ"
          placeholder="Nhập địa chỉ"
          {...form.getInputProps("address")}
          required
          size={sizeInput}
          style={{ width: '100%' }}
        />

        <Group grow style={{ width: '100%' }}>
        <TextInput
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          {...form.getInputProps("phone")}
          required
          size={sizeInput}
            style={{ width: '100%' }}
        />
        <TextInput
          label="Email"
          placeholder="Nhập email"
          type="email"
          {...form.getInputProps("email")}
          required
          size={sizeInput}
            style={{ width: '100%' }}
        />
        </Group>
        
        <Textarea
          label="Ghi chú"
          placeholder="Nhập ghi chú (tùy chọn)"
          {...form.getInputProps("notes")}
          size={sizeInput}
          minRows={2}
          maxRows={4}
          style={{ width: '100%' }}
        />

        <Group justify="flex-end" style={{ width: '100%' }}>
          <Button 
            loading={loading} 
            type="submit"
            size={sizeInput}
          >
            {initialValues ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Group>
      </form>
    </div>
  );
}
