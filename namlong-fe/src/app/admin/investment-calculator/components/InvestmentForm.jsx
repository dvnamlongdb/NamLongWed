/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState, useEffect } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Button,
  Group,
  Card,
  Text,
  Title,
  ActionIcon,
  Grid,
  Alert,
  Divider,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconInfoCircle,
  IconCurrency,
  IconCalendar,
} from "@tabler/icons-react";
import { INVESTMENT_CATEGORIES, RISK_LEVELS } from "../../../../constants/formOptions";

export default function InvestmentForm({ investment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    projectName: "",
    description: "",
    category: "",
    initialInvestment: 0,
    discountRate: 10,
    projectDuration: 5,
    cashFlows: [
      { year: 1, amount: 0, description: "" },
      { year: 2, amount: 0, description: "" },
      { year: 3, amount: 0, description: "" },
      { year: 4, amount: 0, description: "" },
      { year: 5, amount: 0, description: "" },
    ],
    riskLevel: "medium",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Load existing investment data
  useEffect(() => {
    if (investment) {
      setFormData({
        ...investment,
        cashFlows: investment.cashFlows || formData.cashFlows,
      });
    }
  }, [investment]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = "Tên dự án là bắt buộc";
    }

    if (!formData.initialInvestment || formData.initialInvestment <= 0) {
      newErrors.initialInvestment = "Vốn đầu tư phải lớn hơn 0";
    }

    if (!formData.discountRate || formData.discountRate < 0) {
      newErrors.discountRate = "Lãi suất chiết khấu không hợp lệ";
    }

    if (!formData.category) {
      newErrors.category = "Vui lòng chọn loại hình đầu tư";
    }

    // Validate cash flows
    const hasCashFlow = formData.cashFlows.some(cf => cf.amount > 0);
    if (!hasCashFlow) {
      newErrors.cashFlows = "Phải có ít nhất một dòng tiền dương";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add cash flow year
  const addCashFlowYear = () => {
    const nextYear = formData.cashFlows.length + 1;
    setFormData(prev => ({
      ...prev,
      cashFlows: [
        ...prev.cashFlows,
        { year: nextYear, amount: 0, description: "" }
      ]
    }));
  };

  // Remove cash flow year
  const removeCashFlowYear = (index) => {
    if (formData.cashFlows.length > 1) {
      setFormData(prev => ({
        ...prev,
        cashFlows: prev.cashFlows.filter((_, i) => i !== index)
      }));
    }
  };

  // Update cash flow
  const updateCashFlow = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cashFlows: prev.cashFlows.map((cf, i) => 
        i === index ? { ...cf, [field]: value } : cf
      )
    }));
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Calculate suggested discount rate based on risk
  const getSuggestedDiscountRate = (riskLevel) => {
    switch (riskLevel) {
      case "low": return 7;
      case "medium": return 10;
      case "high": return 15;
      case "very_high": return 20;
      default: return 10;
    }
  };

  // Auto-update discount rate when risk level changes
  const handleRiskLevelChange = (value) => {
    setFormData(prev => ({
      ...prev,
      riskLevel: value,
      discountRate: getSuggestedDiscountRate(value)
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Basic Information */}
        <Card withBorder p="md">
          <Title order={4} mb="md">Thông Tin Cơ Bản</Title>
          
          <Grid gutter="md">
            <Grid.Col span={12}>
              <TextInput
                label="Tên dự án"
                placeholder="Nhập tên dự án đầu tư..."
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                error={errors.projectName}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Mô tả dự án"
                placeholder="Mô tả chi tiết về dự án..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                minRows={3}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Loại hình đầu tư"
                placeholder="Chọn loại hình"
                data={INVESTMENT_CATEGORIES}
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                error={errors.category}
                required
                searchable
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label="Mức độ rủi ro"
                placeholder="Chọn mức độ rủi ro"
                data={RISK_LEVELS}
                value={formData.riskLevel}
                onChange={handleRiskLevelChange}
                required
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Financial Information */}
        <Card withBorder p="md">
          <Title order={4} mb="md">Thông Tin Tài Chính</Title>
          
          <Grid gutter="md">
            <Grid.Col span={6}>
              <NumberInput
                label="Vốn đầu tư ban đầu"
                placeholder="0"
                value={formData.initialInvestment}
                onChange={(value) => setFormData(prev => ({ ...prev, initialInvestment: value }))}
                leftSection={<IconCurrency size={16} />}
                thousandSeparator=","
                suffix=" VNĐ"
                error={errors.initialInvestment}
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="Lãi suất chiết khấu (%)"
                placeholder="10"
                value={formData.discountRate}
                onChange={(value) => setFormData(prev => ({ ...prev, discountRate: value }))}
                min={0}
                max={50}
                step={0.5}
                decimalScale={1}
                error={errors.discountRate}
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
              <strong>Lãi suất chiết khấu</strong> được đề xuất dựa trên mức độ rủi ro: {getSuggestedDiscountRate(formData.riskLevel)}%
            </Text>
          </Alert>
        </Card>

        {/* Cash Flows */}
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Dòng Tiền Dự Kiến</Title>
            <Button 
              variant="light" 
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={addCashFlowYear}
            >
              Thêm Năm
            </Button>
          </Group>

          {errors.cashFlows && (
            <Alert color="red" variant="light" mb="md">
              {errors.cashFlows}
            </Alert>
          )}

          <Stack gap="sm">
            {formData.cashFlows.map((cashFlow, index) => (
              <Card key={index} withBorder p="sm" style={{ backgroundColor: '#f8f9fa' }}>
                <Grid gutter="md" align="center">
                  <Grid.Col span={2}>
                    <Text fw={500} size="sm">
                      Năm {cashFlow.year}
                    </Text>
                  </Grid.Col>
                  
                  <Grid.Col span={4}>
                    <NumberInput
                      placeholder="Dòng tiền..."
                      value={cashFlow.amount}
                      onChange={(value) => updateCashFlow(index, 'amount', value)}
                      leftSection={<IconCurrency size={14} />}
                      thousandSeparator=","
                      suffix=" VNĐ"
                      size="sm"
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={5}>
                    <TextInput
                      placeholder="Mô tả (tùy chọn)..."
                      value={cashFlow.description}
                      onChange={(e) => updateCashFlow(index, 'description', e.target.value)}
                      size="sm"
                    />
                  </Grid.Col>
                  
                  <Grid.Col span={1}>
                    {formData.cashFlows.length > 1 && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        onClick={() => removeCashFlowYear(index)}
                        size="sm"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    )}
                  </Grid.Col>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Alert 
            icon={<IconInfoCircle size={16} />} 
            color="green" 
            variant="light" 
            mt="md"
          >
            <Text size="sm">
              <strong>Lưu ý:</strong> Nhập dòng tiền ròng dự kiến cho mỗi năm. 
              Dòng tiền dương = Thu nhập - Chi phí vận hành.
            </Text>
          </Alert>
        </Card>

        {/* Additional Notes */}
        <Card withBorder p="md">
          <Title order={4} mb="md">Ghi Chú Bổ Sung</Title>
          
          <Textarea
            label="Ghi chú"
            placeholder="Thêm các thông tin, giả định, hoặc lưu ý khác..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            minRows={3}
          />
        </Card>

        {/* Form Actions */}
        <Group justify="flex-end" gap="md">
          <Button variant="light" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit">
            {investment ? "Cập Nhật" : "Tạo Phương Án"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
} 