/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import {
  ActionIcon,
  Button,
  Flex,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  Space,
  Table,
  Text,
  Title,
  Group,
  TextInput,
  Badge,
  Card,
  Grid,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconEye, IconSearch, IconX, IconChartLine, IconList } from "@tabler/icons-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useInvestments, useInvestmentMutation, useCustomers } from "../../../service/hook";
import dayjs from "dayjs";
import ClientOnly from "../../../components/ClientOnly";
import PortfolioForm from "./components/PortfolioForm";

export const dynamic = 'force-dynamic';

const InvestmentPortfoliosInner = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [detailPortfolio, setDetailPortfolio] = useState(null);
  const [modalType, setModalType] = useState(""); // "detail" or "form"
  
  const { data: investmentList, loading: investmentLoading, getInvestments } = useInvestments();
  const { data: customerList, loading: customerLoading, getCustomers } = useCustomers();
  const { createInvestment, updateInvestment, deleteInvestment, loading: mutationLoading } = useInvestmentMutation();
  
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)", true, { getInitialValueInEffect: false });
  const searchParams = useSearchParams();
  const customerFilter = searchParams.get('customer');
  const router = useRouter();

  const loading = investmentLoading || customerLoading;

  // Memoize current date to prevent hydration mismatch
  const currentDate = React.useMemo(() => new Date(), []);

  // Group investments by customer
  const portfolios = React.useMemo(() => {
    if (!investmentList || !customerList) return [];
    
    const portfolioMap = {};
    
    investmentList.forEach(investment => {
      const customer = customerList.find(c => c.tax_id === investment.customer_tax);
      if (!customer) return;
      
      if (!portfolioMap[customer.tax_id]) {
        portfolioMap[customer.tax_id] = {
          customer_name: customer.name,
          customer_tax: customer.tax_id,
          customer_email: customer.email,
          investments: [],
          total_amount: 0,
          first_investment: null,
          recurring_investments: []
        };
      }
      
      portfolioMap[customer.tax_id].investments.push(investment);
      portfolioMap[customer.tax_id].total_amount += investment.amount || 0;
      
      // Determine first investment (earliest date)
      if (!portfolioMap[customer.tax_id].first_investment || 
          new Date(investment.investment_date) < new Date(portfolioMap[customer.tax_id].first_investment.investment_date)) {
        portfolioMap[customer.tax_id].first_investment = investment;
      }
      
      // Recurring investments (not the first one)
      if (portfolioMap[customer.tax_id].first_investment?._id !== investment._id) {
        portfolioMap[customer.tax_id].recurring_investments.push(investment);
      }
    });
    
    return Object.values(portfolioMap);
  }, [investmentList, customerList]);

  // Filter portfolios based on search and customer filter
  const filteredPortfolios = useMemo(() => {
    try {
      // Đảm bảo portfolios luôn là array
      let filtered = Array.isArray(portfolios) ? portfolios : [];

      filtered = filtered.filter((portfolio: any) => {
        // Filter by specific customer from URL params
        if (customerFilter && portfolio.customer_tax !== customerFilter) {
          return false;
        }
        
        // Filter by search query
        if (!searchQuery) return true;
        
        return (
          portfolio.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          portfolio.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          portfolio.first_investment?.project_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      return (filtered as any[]).sort((a: any, b: any) => {
        // Ưu tiên sort theo createdAt; nếu không có, fallback theo ngày đầu tư đầu tiên
        const aTime = a?.createdAt
          ? new Date(a.createdAt).getTime()
          : (a?.first_investment?.investment_date ? new Date(a.first_investment.investment_date).getTime() : 0);
        const bTime = b?.createdAt
          ? new Date(b.createdAt).getTime()
          : (b?.first_investment?.investment_date ? new Date(b.first_investment.investment_date).getTime() : 0);
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc portfolio");
      return [];
    }
  }, [portfolios, customerFilter, searchQuery]);

  const handleDetail = (portfolio: any) => {
    setDetailPortfolio(portfolio);
    setModalType("detail");
    open();
  };

  const handleClose = () => {
    close();
    setDetailPortfolio(null);
    setModalType("");
  };

  const handleFormSubmit = async (values: any) => {
    try {
      const investmentData = {
        _id: String(Date.now()), // Generate ID for new investment
        project_name: values.project_name,
        customer_tax: values.customer_tax,
        investment_type: values.investment_type,
        other_investment_type: values.other_investment_type,
        amount: values.amount,
        investment_date: values.investment_date,
        expected_return_date: values.expected_return_date,
        description: values.description,
        notes: values.notes,
        created_date: new Date()
      };

      if (detailPortfolio && modalType === "form") {
        // This is edit mode - for simplicity, we'll create a new investment
        await createInvestment(investmentData);
      } else {
        await createInvestment(investmentData);
      }
      
      await getInvestments(); // Refresh data
      handleClose();
    } catch (error) {
      console.error('Error submitting investment:', error);
    }
  };

  const handleViewInvestments = (portfolio: any) => {
    router.push(`/admin/investments?customer=${portfolio.customer_tax}`);
  };

  const handleEdit = (portfolio: any) => {
    setDetailPortfolio(portfolio);
    setModalType("form");
    open();
  };

  const handleDelete = async (portfolio: any) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tất cả đầu tư của ${portfolio.customer_name}?`)) {
      try {
        // Delete all investments for this customer
        for (const investment of portfolio.investments) {
          await deleteInvestment(investment._id);
        }
        console.log('Deleted portfolio for:', portfolio.customer_name);
        // Refresh data
        await getInvestments();
      } catch (error) {
        console.error('Error deleting portfolio:', error);
      }
    }
  };

  useEffect(() => {
    getInvestments();
    getCustomers();
  }, [getInvestments, getCustomers]);

  const rows = filteredPortfolios.map((portfolio: any) => {
    return (
      <Table.Tr key={portfolio.customer_tax}>
        <Table.Td style={{ wordWrap: 'break-word' }}>
          <div>
            <Text fw={600} size="sm" style={{ lineHeight: 1.3 }}>{portfolio.customer_name}</Text>
            <Text size="xs" c="dimmed" truncate>{portfolio.customer_email}</Text>
            <Text size="xs" c="dimmed">MST: {portfolio.customer_tax}</Text>
          </div>
        </Table.Td>
        <Table.Td style={{ wordWrap: 'break-word' }}>
          {portfolio.first_investment ? (
            <div>
              <Text fw={500} size="sm" style={{ lineHeight: 1.3 }}>{portfolio.first_investment.project_name}</Text>
              <Text size="xs" c="blue">
                <NumberFormatter
                  value={portfolio.first_investment.amount}
                  thousandSeparator=","
                  suffix=" VNĐ"
                />
              </Text>
              <Text size="xs" c="dimmed">
                {dayjs(portfolio.first_investment.investment_date).format("DD/MM/YYYY")}
              </Text>
            </div>
          ) : (
            <Text c="dimmed">Chưa có đầu tư</Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <Badge color="blue" variant="light">
              {portfolio.recurring_investments.length} khoản
            </Badge>
            {portfolio.recurring_investments.length > 0 && (
              <ActionIcon
                size="sm"
                variant="light"
                color="blue"
                onClick={() => handleDetail(portfolio)}
                title="Chi tiết các khoản định kỳ"
              >
                <IconChartLine size={16} />
              </ActionIcon>
            )}
          </Group>
        </Table.Td>
        <Table.Td>
          <Text fw={600} c="green">
            <NumberFormatter
              value={portfolio.total_amount}
              thousandSeparator=","
              suffix=" VNĐ"
            />
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{portfolio.investments.length} dự án</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <ActionIcon
              size="sm"
              variant="light"
              color="blue"
              onClick={() => handleViewInvestments(portfolio)}
              title="Xem Danh Sách Đầu Tư"
            >
              <IconList size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="light"
              onClick={() => handleDetail(portfolio)}
              title="Chi tiết portfolio"
            >
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="outline"
              onClick={() => handleEdit(portfolio)}
              title="Sửa portfolio"
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              color="red"
              variant="light"
              onClick={() => handleDelete(portfolio)}
              title="Xóa portfolio"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
      <>
        <div className="relative">
          <LoadingOverlay visible={loading} />
          <Flex direction="row" justify="space-between" align="center">
            <Title order={2} className="text-blue-500">
              Danh Sách Các Khoản Đầu Tư
            </Title>
            {customerFilter && (
              <Text size="sm" c="blue" mb="md">
                Hiển thị portfolio của khách hàng: {customerList?.find(c => c.tax_id === customerFilter)?.name || customerFilter}
              </Text>
            )}
            <Button 
              leftSection={<IconPlus />} 
              variant="outline" 
              onClick={() => {
                setDetailPortfolio(null);
                setModalType("form");
                open();
              }}
            >
              Tạo Portfolio Mới
            </Button>
          </Flex>

          <Flex gap="md" align="center">
            <TextInput
              placeholder="Tìm kiếm theo tên khách hàng, email, dự án..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              rightSection={
                searchQuery ? (
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    c="gray"
                    onClick={() => setSearchQuery("")}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                ) : null
              }
              style={{ flex: 1 }}
              size={isMobile ? "sm" : "md"}
            />
            {searchQuery && (
              <Text size="sm" c="dimmed">
                Tìm thấy {filteredPortfolios?.length || 0} portfolio
              </Text>
            )}
          </Flex>

          <Table striped highlightOnHover withTableBorder style={{ minWidth: '100%', tableLayout: 'fixed' }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '20%' }}>Tên khách hàng</Table.Th>
                <Table.Th style={{ width: '25%' }}>Khoản đầu tư đầu tiên</Table.Th>
                <Table.Th style={{ width: '15%' }}>Khoản đầu tư định kỳ</Table.Th>
                <Table.Th style={{ width: '15%' }}>Tổng giá trị</Table.Th>
                <Table.Th style={{ width: '10%' }}>Tổng dự án</Table.Th>
                <Table.Th style={{ width: '15%' }}>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>

          {filteredPortfolios?.length === 0 && (
            <Text ta="center" py="xl" c="dimmed">
              {searchQuery ? `Không tìm thấy portfolio nào với từ khóa "${searchQuery}"` : "Không có dữ liệu portfolio"}
            </Text>
          )}
        </div>
        
        <Modal
          opened={opened}
          onClose={handleClose}
          title={
            <Text c="blue" fw={700} size="lg">
              {modalType === "detail" && `Chi tiết Portfolio - ${detailPortfolio?.customer_name}`}
              {modalType === "form" && (detailPortfolio ? `Sửa Portfolio - ${detailPortfolio?.customer_name}` : "Tạo Portfolio Mới")}
            </Text>
          }
          size="98%"
          fullScreen={!!isMobile}
          styles={{
            content: { maxHeight: '90vh', overflow: 'auto', width: '100%', maxWidth: '100%' },
            body: { padding: '0' },
            inner: { padding: '0' }
          }}
        >
          {modalType === "detail" && detailPortfolio && (
            <div>
              <Grid gutter="md" mb="lg">
                <Grid.Col span={12}>
                  <Card withBorder p="lg">
                    <Text fw={600} mb="md" size="lg">Thông tin khách hàng</Text>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Text size="sm" mb="xs"><strong>Tên khách hàng:</strong></Text>
                        <Text fw={500} style={{ wordBreak: 'break-word' }}>{detailPortfolio.customer_name}</Text>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Text size="sm" mb="xs"><strong>Email:</strong></Text>
                        <Text fw={500} style={{ wordBreak: 'break-word' }}>{detailPortfolio.customer_email}</Text>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Text size="sm" mb="xs"><strong>Mã số thuế:</strong></Text>
                        <Text fw={500}>{detailPortfolio.customer_tax}</Text>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Text size="sm" mb="xs"><strong>Tổng giá trị đầu tư:</strong></Text>
                        <Text c="green" fw={700} size="lg">
                          <NumberFormatter
                            value={detailPortfolio.total_amount}
                            thousandSeparator=","
                            suffix=" VNĐ"
                          />
                        </Text>
                      </Grid.Col>
                    </Grid>
                  </Card>
                </Grid.Col>
              </Grid>

              <Text fw={600} mb="md">Danh sách các khoản đầu tư ({detailPortfolio.investments.length})</Text>
              
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th style={{ width: '120px' }}>STT</Table.Th>
                      <Table.Th style={{ minWidth: '20px' }}>Tên dự án</Table.Th>
                      <Table.Th style={{ width: '140px' }}>Loại đầu tư</Table.Th>
                      <Table.Th style={{ width: '170px' }}>Số tiền</Table.Th>
                      <Table.Th style={{ width: '80px' }}>Ngày đầu tư</Table.Th>
                      <Table.Th style={{ width: '120px' }}>Trạng thái</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                <Table.Tbody>
                  {React.useMemo(() => {
                    // Đảm bảo investments luôn là array
                    const safeInvestments = Array.isArray(detailPortfolio.investments) ? detailPortfolio.investments : [];
                    return safeInvestments.sort((a: any, b: any) => {
                      // Đảm bảo investment_date tồn tại và hợp lệ
                      const aTime = a.investment_date ? new Date(a.investment_date).getTime() : 0;
                      const bTime = b.investment_date ? new Date(b.investment_date).getTime() : 0;
                      return aTime - bTime;
                    });
                  }, [detailPortfolio.investments]).map((investment, index) => (
                    <Table.Tr key={investment._id}>
                      <Table.Td>
                        <Badge
                          color={index === 0 ? "blue" : "gray"}
                          variant={index === 0 ? "filled" : "light"}
                        >
                          {index === 0 ? "Đầu tiên" : index}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={500} style={{ wordBreak: 'break-word' }}>
                          {investment.project_name}
                        </Text>
                        {investment.description && (
                          <Text size="xs" c="dimmed" style={{ wordBreak: 'break-word', marginTop: '4px' }}>
                            {investment.description}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" style={{ maxWidth: '100%', whiteSpace: 'normal', height: 'auto', padding: '4px 8px' }}>
                          <Text size="xs" style={{ wordBreak: 'break-word' }}>
                            {investment.investment_type === 'other' 
                              ? investment.other_investment_type 
                              : {
                                  'technology': 'Công nghệ',
                                  'real_estate': 'Bất động sản', 
                                  'stocks': 'Cổ phiếu',
                                  'bonds': 'Trái phiếu',
                                  'crypto': 'Tiền mã hóa',
                                  'venture_capital': 'Đầu tư mạo hiểm'
                                }[investment.investment_type] || investment.investment_type
                            }
                          </Text>
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} c="blue">
                          <NumberFormatter
                            value={investment.amount}
                            thousandSeparator=","
                            suffix=" VNĐ"
                          />
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {dayjs(investment.investment_date).format("DD/MM/YYYY")}
                      </Table.Td>
                      <Table.Td>
                        <Badge 
                          color={new Date(investment.expected_return_date) > currentDate ? "green" : "orange"}
                          variant="light"
                        >
                          {new Date(investment.expected_return_date) > currentDate ? "Đang đầu tư" : "Đến hạn"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              </Table.ScrollContainer>
            </div>
          )}
          
          {modalType === "form" && (
            <ClientOnly fallback={<div>Loading form...</div>}>
              <PortfolioForm
                data={detailPortfolio}
                onSubmit={handleFormSubmit}
                loading={mutationLoading}
              />
            </ClientOnly>
          )}
        </Modal>
      </>
  );
};

export default function InvestmentPortfoliosPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientOnly fallback={<div>Loading...</div>}>
        <InvestmentPortfoliosInner />
      </ClientOnly>
    </Suspense>
  );
}
