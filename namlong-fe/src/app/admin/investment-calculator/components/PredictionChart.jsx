/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState, memo, useMemo } from "react";
import {
  Card,
  Text,
  Title,
  Group,
  Button,
  Select,
  Alert,
  Badge,
  SimpleGrid,
  Table,
  Paper,
  Stack,
  NumberInput,
  Divider,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconChartLine,
  IconCalendar,
  IconCurrency,
  IconInfoCircle,
} from "@tabler/icons-react";

// Mock prediction data generator
const generatePrediction = (investment, years = 5) => {
  if (!investment || !investment.cashFlows || investment.cashFlows.length === 0) {
    return [];
  }

  const baseRevenue = investment.cashFlows.reduce((sum, flow) => sum + (parseFloat(flow) || 0), 0) / investment.cashFlows.length;
  const predictions = [];

  for (let year = 1; year <= years; year++) {
    // Simulate growth with some variance
    const growthRate = 0.08 + (Math.random() - 0.5) * 0.04; // 6-10% growth
    const revenue = baseRevenue * Math.pow(1 + growthRate, year);
    const profitMargin = 0.15 + (Math.random() - 0.5) * 0.05; // 12-17%
    const profit = revenue * profitMargin;
    const confidence = Math.min(1, 0.7 + Math.random() * 0.3);

    predictions.push({ year, revenue, profit, confidence, trend: growthRate > 0.08 ? 'up' : growthRate < 0.08 ? 'down' : 'flat' });
  }

  return predictions;
};

function PredictionChartComponent({ investments = [] }) {
  const [selectedInvestment, setSelectedInvestment] = useState(investments[0]?.id || null);
  const [predictionYears, setPredictionYears] = useState(5);

  const selectedData = useMemo(() => investments.find((inv) => inv.id === selectedInvestment), [investments, selectedInvestment]);
  const investmentOptions = useMemo(() => investments.map(inv => ({ value: inv.id, label: inv.projectName || `Dự án ${inv.id}` })), [investments]);
  const predictions = useMemo(() => generatePrediction(selectedData, predictionYears), [selectedData, predictionYears]);

  if (investments.length === 0) {
    return (
      <Alert icon={<IconInfoCircle size="1rem" />} title="Thông báo">
        Chưa có dữ liệu đầu tư để dự đoán
      </Alert>
    );
  }

  return (
    <Stack spacing="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>
            <Group gap="xs">
              <IconChartLine size="1.5rem" />
              <Text>Biểu Đồ Dự Đoán</Text>
            </Group>
          </Title>
        </Group>

        <SimpleGrid cols={2} spacing="md" mb="md">
          <Select
            label="Chọn dự án đầu tư"
            placeholder="Chọn dự án để dự đoán"
            data={investmentOptions}
            value={selectedInvestment}
            onChange={setSelectedInvestment}
          />
          
          <NumberInput
            label="Số năm dự đoán"
            value={predictionYears}
            onChange={setPredictionYears}
            min={1}
            max={10}
          />
        </SimpleGrid>

        {selectedData && (
          <Stack spacing="md">
            <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
              Dự đoán cho dự án: <strong>{selectedData.projectName}</strong>
              <br />
              Vốn đầu tư hiện tại: <strong>{new Intl.NumberFormat('vi-VN').format(Number(selectedData.initialInvestment || 0))}</strong>
            </Alert>

            <Paper p="md" withBorder>
              <Title order={4} mb="md">
                <Group gap="xs">
                  <IconCalendar size="1.2rem" />
                  <Text>Dự Báo {predictionYears} Năm Tới</Text>
                </Group>
              </Title>

              <Table>
                <thead>
                  <tr>
                    <th>Năm</th>
                    <th>Doanh Thu Dự Kiến</th>
                    <th>Lợi Nhuận Dự Kiến</th>
                    <th>Độ Tin Cậy</th>
                    <th>Xu Hướng</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((pred, index) => (
                    <tr key={index}>
                      <td>
                        <Text weight={500}>{pred.year}</Text>
                      </td>
                      <td>
                        <Text color="blue">
                          {new Intl.NumberFormat('vi-VN').format(Math.round(pred.revenue))}
                        </Text>
                      </td>
                      <td>
                        <Text color="green">
                          {new Intl.NumberFormat('vi-VN').format(Math.round(pred.profit))}
                        </Text>
                      </td>
                      <td>
                        <Badge 
                          color={pred.confidence > 0.8 ? 'green' : pred.confidence > 0.6 ? 'yellow' : 'red'}
                          variant="light"
                        >
                          {Math.round(pred.confidence * 100)}%
                        </Badge>
                      </td>
                      <td>
                        <Group gap="xs">
                          {pred.trend === 'up' ? (
                            <IconTrendingUp size="1rem" color="green" />
                          ) : pred.trend === 'down' ? (
                            <IconTrendingDown size="1rem" color="red" />
                          ) : (
                            <Text size="sm" color="gray">Ổn định</Text>
                          )}
                        </Group>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

export default memo(PredictionChartComponent); 