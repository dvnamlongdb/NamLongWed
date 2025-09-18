/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useMemo, memo } from "react";
import {
  Stack,
  Title,
  Table,
  Badge,
  Text,
  Group,
  Card,
  Grid,
  Progress,
  Alert,
  Button,
  Divider,
  Paper,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconInfoCircle,
  IconDownload,
  IconStar,
} from "@tabler/icons-react";

function ComparisonChartComponent({ investments = [], onClose }) {
  const safeInvestments = Array.isArray(investments) ? investments : [];

  // Tính toán metrics cho tất cả investments
  const comparisonData = useMemo(() => {
    if (safeInvestments.length === 0) return [];
    return safeInvestments.map(investment => {
      const { initialInvestment = 0, cashFlows, discountRate = 0 } = investment || {};
      const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
      
      // NPV calculation
      let npv = -Number(initialInvestment || 0);
      cashFlowList.forEach((cashFlow, index) => {
        const amount = Number(cashFlow?.amount || 0);
        npv += amount / Math.pow(1 + Number(discountRate) / 100, index + 1);
      });

      // IRR calculation (simplified)
      let rate = 0.1;
      let tolerance = 0.0001;
      let maxIterations = 200;
      
      for (let i = 0; i < maxIterations; i++) {
        let npvCalc = -Number(initialInvestment || 0);
        let derivative = 0;
        
        cashFlowList.forEach((cashFlow, index) => {
          const period = index + 1;
          const amount = Number(cashFlow?.amount || 0);
          npvCalc += amount / Math.pow(1 + rate, period);
          derivative -= period * amount / Math.pow(1 + rate, period + 1);
        });
        
        if (Math.abs(npvCalc) < tolerance) break;
        if (derivative === 0) break;
        rate = rate - npvCalc / derivative;
      }
      
      const irr = rate * 100;

      // ROI calculation
      const totalCashFlow = cashFlowList.reduce((sum, cf) => sum + Number(cf?.amount || 0), 0);
      const base = Number(initialInvestment || 0);
      const roi = base === 0 ? 0 : ((totalCashFlow - base) / base) * 100;

      // Payback Period
      let cumulativeCashFlow = 0;
      let paybackPeriod = null;
      
      for (let i = 0; i < cashFlowList.length; i++) {
        cumulativeCashFlow += Number(cashFlowList[i]?.amount || 0);
        if (cumulativeCashFlow >= Number(initialInvestment || 0)) {
          const amountThisYear = Number(cashFlowList[i]?.amount || 0);
          paybackPeriod = amountThisYear > 0
            ? i + 1 - (cumulativeCashFlow - Number(initialInvestment || 0)) / amountThisYear
            : null;
          break;
        }
      }

      // Risk-adjusted return
      const riskFactor = {
        low: 1.0,
        medium: 0.9,
        high: 0.8,
        very_high: 0.7
      }[investment.riskLevel] || 0.9;

      const riskAdjustedNPV = npv * riskFactor;

      // Overall score (0-100)
      const npvScore = Math.max(0, Math.min(100, (npv / initialInvestment) * 100 + 50));
      const irrScore = Math.max(0, Math.min(100, irr * 3));
      const roiScore = Math.max(0, Math.min(100, roi + 50));
      const paybackScore = paybackPeriod ? Math.max(0, Math.min(100, 100 - (paybackPeriod * 10))) : 0;
      
      const overallScore = (npvScore + irrScore + roiScore + paybackScore) / 4;

      return {
        ...investment,
        npv,
        irr,
        roi,
        paybackPeriod,
        riskAdjustedNPV,
        overallScore,
        totalCashFlow
      };
    });
  }, [safeInvestments]);

  if (comparisonData.length === 0) {
    return (
      <Card withBorder p="lg">
        <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />}> 
          <Group justify="space-between">
            <Text>Vui lòng chọn ít nhất 2 phương án để so sánh.</Text>
            <Button onClick={onClose} variant="light">Đóng</Button>
          </Group>
        </Alert>
      </Card>
    );
  }

  // Tìm best và worst performers
  const bestNPV = comparisonData.reduce((best, current) => 
    current.npv > best.npv ? current : best
  , comparisonData[0]);
  
  const bestIRR = comparisonData.reduce((best, current) => 
    current.irr > best.irr ? current : best
  , comparisonData[0]);

  const bestOverall = comparisonData.reduce((best, current) => 
    current.overallScore > best.overallScore ? current : best
  , comparisonData[0]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Get status color
  const getStatusColor = (value, type) => {
    switch (type) {
      case 'npv':
        return value > 0 ? 'green' : 'red';
      case 'irr':
        return value > 15 ? 'green' : value > 10 ? 'yellow' : 'red';
      case 'roi':
        return value > 20 ? 'green' : value > 10 ? 'yellow' : 'red';
      case 'payback':
        return value && value < 3 ? 'green' : value && value < 5 ? 'yellow' : 'red';
      default:
        return 'gray';
    }
  };

  // Get recommendation
  const getRecommendation = (investment) => {
    const { npv, irr, roi, paybackPeriod, overallScore } = investment;
    
    if (overallScore > 80) {
      return { text: "Rất khuyến nghị", color: "green", icon: <IconTrendingUp size={16} /> };
    } else if (overallScore > 60) {
      return { text: "Khuyến nghị", color: "blue", icon: <IconTrendingUp size={16} /> };
    } else if (overallScore > 40) {
      return { text: "Cân nhắc", color: "yellow", icon: <IconMinus size={16} /> };
    } else {
      return { text: "Không khuyến nghị", color: "red", icon: <IconTrendingDown size={16} /> };
    }
  };

  // Risk level labels
  const getRiskLabel = (riskLevel) => {
    const labels = {
      low: "Thấp",
      medium: "Trung bình", 
      high: "Cao",
      very_high: "Rất cao"
    };
    return labels[riskLevel] || "Không xác định";
  };

  return (
    <Stack gap="lg">
      {/* Summary Cards */}
      <Grid gutter="md">
        <Grid.Col span={4}>
          <Card withBorder p="md" className="text-center">
            <Group gap="xs" justify="center" mb="xs">
              <IconStar size={20} color="gold" />
              <Text fw={600}>NPV Tốt Nhất</Text>
            </Group>
            <Text size="xl" fw={700} c="green">
              {formatCurrency(bestNPV.npv)} VNĐ
            </Text>
            <Text size="sm" c="dimmed">{bestNPV.projectName}</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={4}>
          <Card withBorder p="md" className="text-center">
            <Group gap="xs" justify="center" mb="xs">
              <IconTrendingUp size={20} color="blue" />
              <Text fw={600}>IRR Tốt Nhất</Text>
            </Group>
            <Text size="xl" fw={700} c="blue">
              {bestIRR.irr.toFixed(1)}%
            </Text>
            <Text size="sm" c="dimmed">{bestIRR.projectName}</Text>
          </Card>
        </Grid.Col>
        
        <Grid.Col span={4}>
          <Card withBorder p="md" className="text-center">
            <Group gap="xs" justify="center" mb="xs">
              <IconStar size={20} color="purple" />
              <Text fw={600}>Tổng Thể Tốt Nhất</Text>
            </Group>
            <Text size="xl" fw={700} c="purple">
              {bestOverall.overallScore.toFixed(0)}/100
            </Text>
            <Text size="sm" c="dimmed">{bestOverall.projectName}</Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Comparison Table */}
      <Card withBorder p="lg">
        <Title order={3} mb="md">Bảng So Sánh Chi Tiết</Title>
        
        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Dự Án</Table.Th>
                <Table.Th>Loại Hình</Table.Th>
                <Table.Th>Vốn Đầu Tư</Table.Th>
                <Table.Th>NPV</Table.Th>
                <Table.Th>IRR</Table.Th>
                <Table.Th>ROI</Table.Th>
                <Table.Th>Hoàn Vốn</Table.Th>
                <Table.Th>Rủi Ro</Table.Th>
                <Table.Th>Điểm Tổng</Table.Th>
                <Table.Th>Khuyến Nghị</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {comparisonData.map((investment) => {
                const recommendation = getRecommendation(investment);
                
                return (
                  <Table.Tr key={investment.id}>
                    <Table.Td>
                      <div>
                        <Text fw={500} size="sm">{investment.projectName}</Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {investment.description}
                        </Text>
                      </div>
                    </Table.Td>
                    
                    <Table.Td>
                      <Badge variant="light" size="sm">
                        {investment.category}
                      </Badge>
                    </Table.Td>
                    
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {formatCurrency(investment.initialInvestment)} VNĐ
                      </Text>
                    </Table.Td>
                    
                    <Table.Td>
                      <Text 
                        size="sm" 
                        fw={500}
                        c={getStatusColor(investment.npv, 'npv')}
                      >
                        {formatCurrency(investment.npv)} VNĐ
                      </Text>
                    </Table.Td>
                    
                    <Table.Td>
                      <Text 
                        size="sm" 
                        fw={500}
                        c={getStatusColor(investment.irr, 'irr')}
                      >
                        {investment.irr.toFixed(1)}%
                      </Text>
                    </Table.Td>
                    
                    <Table.Td>
                      <Text 
                        size="sm" 
                        fw={500}
                        c={getStatusColor(investment.roi, 'roi')}
                      >
                        {investment.roi.toFixed(1)}%
                      </Text>
                    </Table.Td>
                    
                    <Table.Td>
                      <Text 
                        size="sm" 
                        fw={500}
                        c={getStatusColor(investment.paybackPeriod, 'payback')}
                      >
                        {investment.paybackPeriod ? 
                          `${investment.paybackPeriod.toFixed(1)} năm` : 
                          'N/A'
                        }
                      </Text>
                    </Table.Td>
                    
                    <Table.Td>
                      <Badge 
                        color={investment.riskLevel === 'low' ? 'green' : 
                               investment.riskLevel === 'medium' ? 'yellow' : 'red'}
                        variant="light"
                        size="sm"
                      >
                        {getRiskLabel(investment.riskLevel)}
                      </Badge>
                    </Table.Td>
                    
                    <Table.Td>
                      <div>
                        <Text size="sm" fw={500}>
                          {investment.overallScore.toFixed(0)}/100
                        </Text>
                        <Progress 
                          value={investment.overallScore} 
                          size="xs" 
                          color={recommendation.color}
                          mt="xs"
                        />
                      </div>
                    </Table.Td>
                    
                    <Table.Td>
                      <Badge 
                        color={recommendation.color}
                        variant="light"
                        leftSection={recommendation.icon}
                        size="sm"
                      >
                        {recommendation.text}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </div>
      </Card>

      {/* Phân tích & khuyến nghị */}
      <Card withBorder p="lg">
        <Title order={3} mb="md">Phân Tích & Khuyến Nghị</Title>
        
        <Stack gap="md">
          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text fw={500} mb="xs">Dự án có NPV cao nhất:</Text>
            <Text size="sm">
              <strong>{bestNPV.projectName}</strong> với NPV = {formatCurrency(bestNPV.npv)} VNĐ.
              Dự án này có khả năng tạo ra giá trị gia tăng cao nhất.
            </Text>
          </Alert>

          <Alert icon={<IconTrendingUp size={16} />} color="green" variant="light">
            <Text fw={500} mb="xs">Dự án có tỷ suất sinh lời tốt nhất:</Text>
            <Text size="sm">
              <strong>{bestIRR.projectName}</strong> với IRR = {bestIRR.irr.toFixed(1)}%.
              Đây là dự án có hiệu quả đầu tư cao nhất.
            </Text>
          </Alert>

          <Alert icon={<IconStar size={16} />} color="purple" variant="light">
            <Text fw={500} mb="xs">Khuyến nghị tổng thể:</Text>
            <Text size="sm">
              <strong>{bestOverall.projectName}</strong> là lựa chọn tốt nhất với điểm tổng {bestOverall.overallScore.toFixed(0)}/100.
              Dự án này cân bằng tốt giữa lợi nhuận và rủi ro.
            </Text>
          </Alert>
        </Stack>
      </Card>

      {/* Action Buttons */}
      <Group justify="flex-end" gap="md">
        <Button 
          variant="light" 
          leftSection={<IconDownload size={16} />}
          onClick={() => {
            // TODO: Implement export functionality
            console.log("Exporting comparison data / Xuất dữ liệu so sánh");
          }}
        >
          Xuất Báo Cáo
        </Button>
        <Button onClick={onClose}>
          Đóng
        </Button>
      </Group>
    </Stack>
  );
}

export default memo(ComparisonChartComponent); 