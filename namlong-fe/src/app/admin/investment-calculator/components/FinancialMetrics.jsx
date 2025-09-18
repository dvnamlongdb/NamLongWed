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
  Card,
  Text,
  Group,
  Grid,
  Progress,
  Alert,
  Badge,
  Divider,
  SimpleGrid,
  RingProgress,
  Center,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCalculator,
  IconTarget,
  IconAlertTriangle,
  IconInfoCircle,
  IconCurrency,
  IconChartPie,
} from "@tabler/icons-react";

function FinancialMetricsComponent({ investments = [] }) {
  // Tính toán metrics tổng hợp
  const portfolioMetrics = useMemo(() => {
    if (investments.length === 0) {
      return {
        totalInvestment: 0,
        totalNPV: 0,
        averageIRR: 0,
        averageROI: 0,
        averagePayback: 0,
        riskDistribution: {},
        categoryDistribution: {},
        recommendedCount: 0,
        positiveNPVCount: 0,
        totalProjects: 0,
      };
    }

    let totalInvestment = 0;
    let totalNPV = 0;
    let totalIRR = 0;
    let totalROI = 0;
    let totalPayback = 0;
    let paybackCount = 0;
    let positiveNPVCount = 0;
    let recommendedCount = 0;
    
    const riskDistribution = {};
    const categoryDistribution = {};

    investments.forEach(investment => {
      const { initialInvestment = 0, cashFlows, discountRate = 0, riskLevel, category } = investment || {};
      const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
      
      // Calculate NPV
      let npv = -Number(initialInvestment || 0);
      cashFlowList.forEach((cashFlow, index) => {
        const amount = Number(cashFlow?.amount || 0);
        npv += amount / Math.pow(1 + Number(discountRate) / 100, index + 1);
      });

      // Calculate IRR
      let rate = 0.1;
      let tolerance = 0.0001;
      let maxIterations = 200; // giảm vòng lặp
      
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

      // Calculate ROI
      const totalCashFlow = cashFlowList.reduce((sum, cf) => sum + Number(cf?.amount || 0), 0);
      const base = Number(initialInvestment || 0);
      const roi = base === 0 ? 0 : ((totalCashFlow - base) / base) * 100;

      // Calculate Payback Period
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

      // Accumulate metrics
      totalInvestment += initialInvestment;
      totalNPV += npv;
      totalIRR += irr;
      totalROI += roi;
      
      if (paybackPeriod) {
        totalPayback += paybackPeriod;
        paybackCount++;
      }

      if (npv > 0) positiveNPVCount++;
      if (npv > 0 && irr > 10) recommendedCount++;

      // Risk distribution
      riskDistribution[riskLevel] = (riskDistribution[riskLevel] || 0) + 1;

      // Category distribution
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    return {
      totalInvestment,
      totalNPV,
      averageIRR: investments.length ? totalIRR / investments.length : 0,
      averageROI: investments.length ? totalROI / investments.length : 0,
      averagePayback: paybackCount ? totalPayback / paybackCount : 0,
      riskDistribution,
      categoryDistribution,
      recommendedCount,
      positiveNPVCount,
      totalProjects: investments.length,
    };
  }, [investments]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Risk level labels and colors
  const getRiskInfo = (riskLevel) => {
    const riskMap = {
      low: { label: "Thấp", color: "green" },
      medium: { label: "Trung bình", color: "yellow" },
      high: { label: "Cao", color: "orange" },
      very_high: { label: "Rất cao", color: "red" }
    };
    return riskMap[riskLevel] || { label: "Không xác định", color: "gray" };
  };

  // Category labels
  const getCategoryLabel = (category) => {
    const categoryMap = {
      real_estate: "Bất động sản",
      technology: "Công nghệ",
      manufacturing: "Sản xuất",
      retail: "Bán lẻ",
      service: "Dịch vụ",
      finance: "Tài chính",
      healthcare: "Y tế",
      education: "Giáo dục",
      other: "Khác"
    };
    return categoryMap[category] || category;
  };

  // Derive chart data (memoized)
  const riskChartData = useMemo(() => {
    const levels = [
      { key: 'low', name: 'Thấp', color: 'green' },
      { key: 'medium', name: 'Trung bình', color: 'yellow' },
      { key: 'high', name: 'Cao', color: 'orange' },
      { key: 'very_high', name: 'Rất cao', color: 'red' },
    ];
    return levels.map(l => ({ name: l.name, value: portfolioMetrics.riskDistribution[l.key] || 0, color: l.color }));
  }, [portfolioMetrics.riskDistribution]);

  const categoryChartData = useMemo(() => {
    return Object.entries(portfolioMetrics.categoryDistribution || {}).map(([key, value]) => ({
      name: key,
      value: Number(value || 0),
      color: 'var(--mantine-color-blue-6)'
    }));
  }, [portfolioMetrics.categoryDistribution]);

  if (investments.length === 0) {
    return (
      <Card withBorder p="xl" className="text-center">
        <IconCalculator size={48} className="mx-auto mb-4 text-gray-400" />
        <Text size="lg" fw={500} mb="xs">
          Chưa có dữ liệu để phân tích
        </Text>
        <Text c="dimmed">
          Thêm các phương án đầu tư để xem phân tích tổng quan
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Portfolio Overview */}
      <Card withBorder p="lg">
        <Title order={3} mb="md">Tổng Quan Danh Mục Đầu Tư</Title>
        
        <SimpleGrid cols={4} spacing="md">
          <div className="text-center">
            <Text size="xl" fw={700} c="blue">
              {portfolioMetrics.totalProjects}
            </Text>
            <Text size="sm" c="dimmed">Tổng Dự Án</Text>
          </div>
          
          <div className="text-center">
            <Text size="xl" fw={700} c="green">
              {formatCurrency(portfolioMetrics.totalInvestment)} VNĐ
            </Text>
            <Text size="sm" c="dimmed">Tổng Vốn Đầu Tư</Text>
          </div>
          
          <div className="text-center">
            <Text size="xl" fw={700} c={portfolioMetrics.totalNPV > 0 ? "green" : "red"}>
              {formatCurrency(portfolioMetrics.totalNPV)} VNĐ
            </Text>
            <Text size="sm" c="dimmed">Tổng NPV</Text>
          </div>
          
          <div className="text-center">
            <Text size="xl" fw={700} c="purple">
              {((portfolioMetrics.positiveNPVCount / portfolioMetrics.totalProjects) * 100).toFixed(0)}%
            </Text>
            <Text size="sm" c="dimmed">Tỷ Lệ Khả Thi</Text>
          </div>
        </SimpleGrid>
      </Card>

      {/* Key Performance Indicators */}
      <Grid gutter="md">
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group gap="xs" mb="md">
              <IconTrendingUp size={20} color="blue" />
              <Text fw={600}>Hiệu Quả Trung Bình</Text>
            </Group>
            
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">IRR trung bình:</Text>
                <Text fw={500} c={portfolioMetrics.averageIRR > 10 ? "green" : "red"}>
                  {portfolioMetrics.averageIRR.toFixed(1)}%
                </Text>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">ROI trung bình:</Text>
                <Text fw={500} c={portfolioMetrics.averageROI > 0 ? "green" : "red"}>
                  {portfolioMetrics.averageROI.toFixed(1)}%
                </Text>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Thời gian hoàn vốn:</Text>
                <Text fw={500}>
                  {portfolioMetrics.averagePayback > 0 ? 
                    `${portfolioMetrics.averagePayback.toFixed(1)} năm` : 
                    'N/A'
                  }
                </Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group gap="xs" mb="md">
              <IconTarget size={20} color="green" />
              <Text fw={600}>Tình Trạng Dự Án</Text>
            </Group>
            
            <Stack gap="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Dự án khả thi:</Text>
                <Badge color="green" variant="light">
                  {portfolioMetrics.positiveNPVCount}/{portfolioMetrics.totalProjects}
                </Badge>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Khuyến nghị đầu tư:</Text>
                <Badge color="blue" variant="light">
                  {portfolioMetrics.recommendedCount}/{portfolioMetrics.totalProjects}
                </Badge>
              </Group>
              
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Tỷ lệ thành công:</Text>
                <Text fw={500} c="green">
                  {((portfolioMetrics.recommendedCount / portfolioMetrics.totalProjects) * 100).toFixed(0)}%
                </Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Risk and Category Distribution */}
      <Grid gutter="md">
        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group gap="xs" mb="md">
              <IconAlertTriangle size={20} color="orange" />
              <Text fw={600}>Phân Bố Rủi Ro</Text>
            </Group>
            
            <Center>
              <RingProgress
                size={180}
                thickness={16}
                data={riskChartData.map(item => ({
                  value: (item.value / portfolioMetrics.totalProjects) * 100,
                  color: item.color === 'green' ? 'var(--mantine-color-green-6)' :
                         item.color === 'yellow' ? 'var(--mantine-color-yellow-6)' :
                         item.color === 'orange' ? 'var(--mantine-color-orange-6)' :
                         item.color === 'red' ? 'var(--mantine-color-red-6)' :
                         'var(--mantine-color-gray-6)',
                  tooltip: `${item.name}: ${item.value} dự án`
                }))}
                label={
                  <Text c="dimmed" fw={700} ta="center" size="xl">
                    {portfolioMetrics.totalProjects}
                  </Text>
                }
              />
            </Center>
            
            <Stack gap="xs" mt="md">
              {riskChartData.map((item, index) => (
                <Group key={index} justify="space-between">
                  <Group gap="xs">
                    <div 
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color === 'green' ? 'var(--mantine-color-green-6)' :
                                       item.color === 'yellow' ? 'var(--mantine-color-yellow-6)' :
                                       item.color === 'orange' ? 'var(--mantine-color-orange-6)' :
                                       item.color === 'red' ? 'var(--mantine-color-red-6)' :
                                       'var(--mantine-color-gray-6)'
                      }}
                    />
                    <Text size="sm">{item.name}</Text>
                  </Group>
                  <Text size="sm" fw={500}>{item.value}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={6}>
          <Card withBorder p="md">
            <Group gap="xs" mb="md">
              <IconChartPie size={20} color="blue" />
              <Text fw={600}>Phân Bố Theo Lĩnh Vực</Text>
            </Group>
            
            <Center>
              <RingProgress
                size={180}
                thickness={16}
                data={categoryChartData.map(item => ({
                  value: (item.value / portfolioMetrics.totalProjects) * 100,
                  color: item.color,
                  tooltip: `${item.name}: ${item.value} dự án`
                }))}
                label={
                  <Text c="dimmed" fw={700} ta="center" size="xl">
                    {Object.keys(portfolioMetrics.categoryDistribution).length}
                  </Text>
                }
              />
            </Center>
            
            <Stack gap="xs" mt="md">
              {categoryChartData.map((item, index) => (
                <Group key={index} justify="space-between">
                  <Group gap="xs">
                    <div 
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color
                      }}
                    />
                    <Text size="sm">{item.name}</Text>
                  </Group>
                  <Text size="sm" fw={500}>{item.value}</Text>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Recommendations */}
      <Card withBorder p="lg">
        <Title order={3} mb="md">Khuyến Nghị Đầu Tư</Title>
        
        <Stack gap="md">
          {portfolioMetrics.totalNPV > 0 ? (
            <Alert icon={<IconTrendingUp size={16} />} color="green" variant="light">
              <Text fw={500} mb="xs">Danh mục đầu tư khả quan</Text>
              <Text size="sm">
                Tổng NPV dương ({formatCurrency(portfolioMetrics.totalNPV)} VNĐ) cho thấy danh mục có tiềm năng tạo giá trị.
                {portfolioMetrics.averageIRR > 15 && " IRR trung bình cao cho thấy hiệu quả đầu tư tốt."}
              </Text>
            </Alert>
          ) : (
            <Alert icon={<IconTrendingDown size={16} />} color="red" variant="light">
              <Text fw={500} mb="xs">Cần xem xét lại danh mục</Text>
              <Text size="sm">
                Tổng NPV âm cho thấy danh mục có thể không tạo ra giá trị. 
                Nên tập trung vào các dự án có NPV dương.
              </Text>
            </Alert>
          )}

          {(portfolioMetrics.recommendedCount / portfolioMetrics.totalProjects) < 0.5 && (
            <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
              <Text fw={500} mb="xs">Tỷ lệ dự án khuyến nghị thấp</Text>
              <Text size="sm">
                Chỉ {((portfolioMetrics.recommendedCount / portfolioMetrics.totalProjects) * 100).toFixed(0)}% 
                dự án được khuyến nghị. Nên xem xét loại bỏ các dự án có hiệu quả thấp.
              </Text>
            </Alert>
          )}

          <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
            <Text fw={500} mb="xs">Gợi ý tối ưu hóa</Text>
            <Stack gap="xs">
              <Text size="sm">- Ưu tiên các dự án có IRR {'>'} 15% và NPV dương</Text>
              <Text size="sm">- Cân nhắc đa dạng hóa rủi ro trong danh mục</Text>
              <Text size="sm">- Thường xuyên đánh giá và điều chỉnh các giả định</Text>
            </Stack>
          </Alert>
        </Stack>
      </Card>
    </Stack>
  );
}

export default memo(FinancialMetricsComponent); 