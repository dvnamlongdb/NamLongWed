/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Card,
  Text,
  Title,
  Group,
  Badge,
  NumberFormatter,
  Flex,
  Grid,
  Divider,
  LoadingOverlay,
  Select,
  Button,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconTrendingUp, IconTrendingDown, IconCash, IconFileDollar, IconMoneybag, IconFilter, IconRefresh } from "@tabler/icons-react";
import { useInvoices, useInvestments, useEmployeeSalaries } from "../../../service/hook";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isBetween);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function RevenuePage() {
  const { data: invoices, loading: invoicesLoading, getInvoices } = useInvoices();
  const { data: investments, loading: investmentsLoading, getInvestments } = useInvestments();
  const { data: salaries, loading: salariesLoading, getEmployeeSalaries } = useEmployeeSalaries();

  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loading = invoicesLoading || investmentsLoading || salariesLoading;

  // Set a stable timestamp after mount to avoid hydration mismatch
  useEffect(() => {
    setUpdatedAt(dayjs().format("DD/MM/YYYY HH:mm"));
  }, []);

  // Filter data based on date range
  const getDateRange = () => {
    const now = dayjs();
    switch (filterType) {
      case "today":
        return {
          start: now.startOf("day"),
          end: now.endOf("day")
        };
      case "thisWeek":
        return {
          start: now.startOf("week"),
          end: now.endOf("week")
        };
      case "thisMonth":
        return {
          start: now.startOf("month"),
          end: now.endOf("month")
        };
      case "custom":
        return {
          start: startDate ? dayjs(startDate) : null,
          end: endDate ? dayjs(endDate) : null
        };
      default:
        return { start: null, end: null };
    }
  };

  // Filter function for data
  const filterByDate = (data, dateField) => {
    if (!data) return [];
    
    const { start, end } = getDateRange();
    
    if (!start || !end) return data;
    
    return data.filter(item => {
      const itemDate = dayjs(item[dateField]);
      return itemDate.isSameOrAfter(start) && itemDate.isSameOrBefore(end);
    });
  };

  // Filtered data
  const filteredInvoices = filterByDate(invoices, "created_date");
  const filteredInvestments = filterByDate(investments, "investment_date");
  const filteredSalaries = filterByDate(salaries, "month");

  // Calculate revenue data with filtered data
  const calculateRevenue = React.useMemo(() => {
    if (!filteredInvoices || !filteredInvestments || !filteredSalaries) return null;

    // Calculate total revenue from invoices
    const totalInvoiceRevenue = filteredInvoices.reduce((sum, invoice) => {
      return sum + (invoice.total_after_vat || invoice.total * (1 + (invoice.tax || 0) / 100));
    }, 0);

    // Calculate total investment amount
    const totalInvestmentAmount = filteredInvestments.reduce((sum, investment) => {
      return sum + (investment.amount || 0);
    }, 0);

    // Calculate total salary expenses
    const totalSalaryExpenses = filteredSalaries.reduce((sum, salary) => {
      return sum + (salary.netSalary || 0);
    }, 0);

    // Calculate net revenue
    const netRevenue = totalInvoiceRevenue - totalSalaryExpenses;

    // Calculate profit margin
    const profitMargin = totalInvoiceRevenue > 0 ? (netRevenue / totalInvoiceRevenue) * 100 : 0;

    return {
      totalInvoiceRevenue,
      totalInvestmentAmount,
      totalSalaryExpenses,
      netRevenue,
      profitMargin,
      invoiceCount: filteredInvoices.length,
      investmentCount: filteredInvestments.length,
      salaryCount: filteredSalaries.length,
    };
  }, [filteredInvoices, filteredInvestments, filteredSalaries]);

  // Calculate revenue by categories
  const revenueByCategory = React.useMemo(() => {
    if (!filteredInvoices || !filteredInvestments || !filteredSalaries) return [];

    const categories = [
      {
        id: 'invoice_revenue',
        name: 'Doanh thu hóa đơn',
        description: 'Thu nhập từ các hóa đơn đã xuất',
        amount: filteredInvoices.reduce((sum, invoice) => {
          return sum + (invoice.total_after_vat || invoice.total * (1 + (invoice.tax || 0) / 100));
        }, 0),
        count: filteredInvoices.length,
        color: 'green',
        icon: <IconFileDollar size={20} />,
        type: 'revenue'
      },
      {
        id: 'investment_amount',
        name: 'Số tiền đầu tư',
        description: 'Tổng số tiền đã đầu tư vào các dự án',
        amount: filteredInvestments.reduce((sum, investment) => {
          return sum + (investment.amount || 0);
        }, 0),
        count: filteredInvestments.length,
        color: 'blue',
        icon: <IconMoneybag size={20} />,
        type: 'investment'
      },
      {
        id: 'salary_expenses',
        name: 'Chi phí lương',
        description: 'Tổng chi phí trả lương nhân viên',
        amount: filteredSalaries.reduce((sum, salary) => {
          return sum + (salary.netSalary || 0);
        }, 0),
        count: filteredSalaries.length,
        color: 'red',
        icon: <IconCash size={20} />,
        type: 'expense'
      }
    ];

    return categories;
  }, [filteredInvoices, filteredInvestments, filteredSalaries]);

  // Filter categories by type
  const filteredCategories = React.useMemo(() => {
    if (categoryFilter === "all") return revenueByCategory;
    return revenueByCategory.filter(category => category.type === categoryFilter);
  }, [revenueByCategory, categoryFilter]);

  useEffect(() => {
    getInvoices();
    getInvestments();
    getEmployeeSalaries();
  }, [getInvoices, getInvestments, getEmployeeSalaries]);

  // Recent transactions for detailed view with filtered data
  const recentTransactions = React.useMemo(() => {
    if (!filteredInvoices || !filteredInvestments || !filteredSalaries) return [];

    const transactions = [];

    // Add recent invoices (only if category filter allows)
    if (categoryFilter === "all" || categoryFilter === "revenue") {
      filteredInvoices.slice(0, 5).forEach(invoice => {
        transactions.push({
          id: `invoice_${invoice._id}`,
          type: 'Hóa đơn',
          description: `Hóa đơn ${invoice.invoice_number || invoice._id}`,
          amount: invoice.total_after_vat || invoice.total * (1 + (invoice.tax || 0) / 100),
          date: invoice.created_date,
          category: 'revenue',
          icon: <IconFileDollar size={16} />,
          color: 'green'
        });
      });
    }

    // Add recent investments (only if category filter allows)
    if (categoryFilter === "all" || categoryFilter === "investment") {
      filteredInvestments.slice(0, 5).forEach(investment => {
        transactions.push({
          id: `investment_${investment._id}`,
          type: 'Đầu tư',
          description: investment.project_name,
          amount: investment.amount,
          date: investment.investment_date,
          category: 'investment',
          icon: <IconMoneybag size={16} />,
          color: 'blue'
        });
      });
    }

    // Add recent salaries (only if category filter allows)
    if (categoryFilter === "all" || categoryFilter === "expense") {
      filteredSalaries.slice(0, 5).forEach(salary => {
        transactions.push({
          id: `salary_${salary._id}`,
          type: 'Lương',
          description: `Lương tháng ${dayjs(salary.month).format('MM/YYYY')}`,
          amount: salary.netSalary,
          date: salary.month,
          category: 'expense',
          icon: <IconCash size={16} />,
          color: 'red'
        });
      });
    }

    // Sort by date (most recent first)
    return transactions
      .sort((a, b) => {
        // Đảm bảo date tồn tại và hợp lệ
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10);
  }, [filteredInvoices, filteredInvestments, filteredSalaries, categoryFilter]);

  // Handle filter reset
  const handleResetFilter = () => {
    setFilterType("all");
    setStartDate(null);
    setEndDate(null);
    setCategoryFilter("all");
  };

  // Filter options
  const filterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "today", label: "Hôm nay" },
    { value: "thisWeek", label: "Tuần này" },
    { value: "thisMonth", label: "Tháng này" },
    { value: "custom", label: "Tùy chọn" }
  ];

  // Category filter options
  const categoryFilterOptions = [
    { value: "all", label: "Tất cả" },
    { value: "investment", label: "Đầu tư" },
    { value: "revenue", label: "Thu nhập" },
    { value: "expense", label: "Chi phí" }
  ];

  const rows = recentTransactions.map((transaction) => (
    <Table.Tr key={transaction.id}>
      <Table.Td>
        <Group gap="xs">
          {transaction.icon}
          <Text size="sm" fw={500}>{transaction.type}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{transaction.description}</Text>
      </Table.Td>
      <Table.Td>
        <Text 
          size="sm" 
          fw={600} 
          c={transaction.category === 'expense' ? 'red' : 'green'}
        >
          <NumberFormatter
            value={transaction.amount}
            thousandSeparator=","
            suffix=" VNĐ"
          />
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={transaction.color} variant="light">
          {transaction.category === 'revenue' ? 'Thu nhập' : 
           transaction.category === 'investment' ? 'Đầu tư' : 'Chi phí'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {dayjs(transaction.date).format("DD/MM/YYYY")}
        </Text>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <div>
          <div className="relative">
            <LoadingOverlay visible={loading} />
            
          <Flex justify="space-between" align="center">
              <Title order={2} className="text-blue-500">
                Bảng Doanh Thu Tổng Hợp
              </Title>
              <Badge size="lg" color="blue" variant="light">
                Cập nhật: {updatedAt}
              </Badge>
            </Flex>

            {/* Filter Section */}
            <Card withBorder p="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconFilter size={20} />
                  <Text fw={600}>Lọc theo thời gian và phân loại</Text>
                </Group>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconRefresh size={14} />}
                  onClick={handleResetFilter}
                >
                  Đặt lại
                </Button>
              </Group>
              
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <Select
                    label="Lọc theo thời gian"
                    placeholder="Chọn khoảng thời gian"
                    data={filterOptions}
                    value={filterType}
                    onChange={setFilterType}
                  />
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <Select
                    label="Lọc theo loại"
                    placeholder="Chọn loại doanh thu"
                    data={categoryFilterOptions}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                  />
                </Grid.Col>
                
                {filterType === "custom" && (
                  <>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <DateInput
                        label="Từ ngày"
                        placeholder="Chọn ngày bắt đầu"
                        value={startDate}
                        onChange={setStartDate}
                        valueFormat="DD/MM/YYYY"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <DateInput
                        label="Đến ngày"
                        placeholder="Chọn ngày kết thúc"
                        value={endDate}
                        onChange={setEndDate}
                        valueFormat="DD/MM/YYYY"
                      />
                    </Grid.Col>
                  </>
                )}
                
                {filterType !== "custom" && (
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <div style={{ paddingTop: "25px" }}>
                      <Group gap="md">
                        <Badge 
                          size="lg" 
                          variant="light" 
                          color={filterType === "all" ? "gray" : "blue"}
                        >
                          {filterType === "all" ? "Hiển thị tất cả" : 
                           filterType === "today" ? "Hôm nay" :
                           filterType === "thisWeek" ? "Tuần này" :
                           filterType === "thisMonth" ? "Tháng này" :
                           "Khoảng tùy chọn"}
                        </Badge>
                        <Badge 
                          size="lg" 
                          variant="light" 
                          color={categoryFilter === "all" ? "gray" : "teal"}
                        >
                          {categoryFilter === "all" ? "Tất cả" :
                           categoryFilter === "revenue" ? "Thu nhập" :
                           categoryFilter === "investment" ? "Đầu tư" :
                           "Chi phí"}
                        </Badge>
                      </Group>
                    </div>
                  </Grid.Col>
                )}
              </Grid>
            </Card>

            {/* Summary Cards */}
            <Grid gutter="md" mb="xl">
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Card withBorder p="lg" className="bg-green-50">
                  <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">Tổng Doanh Thu</Text>
                    <IconTrendingUp size={20} className="text-green-600" />
                  </Group>
                  <Text size="xl" fw={700} c="green">
                    <NumberFormatter
                      value={calculateRevenue?.totalInvoiceRevenue || 0}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {calculateRevenue?.invoiceCount || 0} hóa đơn
                  </Text>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <Card withBorder p="lg" className="bg-blue-50">
                  <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">Tổng Đầu Tư</Text>
                    <IconMoneybag size={20} className="text-blue-600" />
                  </Group>
                  <Text size="xl" fw={700} c="blue">
                    <NumberFormatter
                      value={calculateRevenue?.totalInvestmentAmount || 0}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {calculateRevenue?.investmentCount || 0} dự án
                  </Text>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <Card withBorder p="lg" className="bg-red-50">
                  <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">Tổng Chi Phí Lương</Text>
                    <IconCash size={20} className="text-red-600" />
                  </Group>
                  <Text size="xl" fw={700} c="red">
                    <NumberFormatter
                      value={calculateRevenue?.totalSalaryExpenses || 0}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {calculateRevenue?.salaryCount || 0} bản lương
                  </Text>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <Card withBorder p="lg" className={calculateRevenue?.netRevenue >= 0 ? "bg-teal-50" : "bg-orange-50"}>
                  <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">Lợi Nhuận Ròng</Text>
                    {calculateRevenue?.netRevenue >= 0 ? 
                      <IconTrendingUp size={20} className="text-teal-600" /> : 
                      <IconTrendingDown size={20} className="text-orange-600" />
                    }
                  </Group>
                  <Text size="xl" fw={700} c={calculateRevenue?.netRevenue >= 0 ? "teal" : "orange"}>
                    <NumberFormatter
                      value={calculateRevenue?.netRevenue || 0}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    Biên lợi nhuận: {calculateRevenue?.profitMargin?.toFixed(1) || 0}%
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>

            <Divider my="xl" />

            {/* Detailed Transactions Table */}
            <Card withBorder p="lg">
              <Title order={3} mb="md">Giao Dịch Gần Đây</Title>
              
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Loại</Table.Th>
                    <Table.Th>Mô tả</Table.Th>
                    <Table.Th>Số tiền</Table.Th>
                    <Table.Th>Phân loại</Table.Th>
                    <Table.Th>Ngày</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>

              {recentTransactions.length === 0 && (
                <Text ta="center" c="dimmed" py="xl">
                  Không có dữ liệu giao dịch trong khoảng thời gian đã chọn
                </Text>
              )}
            </Card>
          </div>
        </div>
      </>
  );
} 