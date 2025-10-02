/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Flex,
  Group,
  Text,
  Title,
  Badge,
  TextInput,
  Select,
  Stack,
  Grid,
  ScrollArea,
  Modal,
  LoadingOverlay,
  Alert,
  Divider,
  NumberFormatter,
  Tooltip,
  Menu,
  Indicator,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconSearch,
  IconX,
  IconHeart,
  IconHeartFilled,
  IconNotes,
  IconChartLine,
  IconTrendingUp,
  IconTrendingDown,
  IconDots,
  IconFilter,
  IconRefresh,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import ClientOnly from "../../../components/ClientOnly";
import InvestmentForm from "./components/InvestmentForm";
import FinancialMetrics from "./components/FinancialMetrics";
import ComparisonChart from "./components/ComparisonChart";
import PredictionChart from "./components/PredictionChart";
import InvestmentNotes from "./components/InvestmentNotes";

// Dynamic imports for client-only components
const nextDynamic = (dynamicImport, options) => {
  if (typeof window === 'undefined') {
    return () => null;
  }
  return React.lazy(dynamicImport);
};

const InvestmentFormDynamic = nextDynamic(() => import("./components/InvestmentForm"), { ssr: false });
const FinancialMetricsDynamic = nextDynamic(() => import("./components/FinancialMetrics"), { ssr: false });
const ComparisonChartDynamic = nextDynamic(() => import("./components/ComparisonChart"), { ssr: false });
const PredictionChartDynamic = nextDynamic(() => import("./components/PredictionChart"), { ssr: false });
const InvestmentNotesDynamic = nextDynamic(() => import("./components/InvestmentNotes"), { ssr: false });

export default function InvestmentCalculatorPage() {
  const [composeOpened, { open: openCompose, close: closeCompose }] = useDisclosure(false);
  const [notesOpened, { open: openNotes, close: closeNotes }] = useDisclosure(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [selectedInvestmentForNotes, setSelectedInvestmentForNotes] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => setIsClient(true), []);
  const [favoriteInvestments, setFavoriteInvestments] = useState(() => new Set());
  const [investments, setInvestments] = useState(() => []);
  
  useEffect(() => {
    // TODO: Implement API call to fetch investments
    // setInvestments([]);
  }, []);

  // Tính toán NPV
  const calculateNPV = (investment) => {
    const { initialInvestment = 0, cashFlows, discountRate = 0 } = investment || {};
    const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
    let npv = -Number(initialInvestment || 0);
    
    cashFlowList.forEach((cashFlow, index) => {
      const amount = Number(cashFlow?.amount || 0);
      npv += amount / Math.pow(1 + Number(discountRate) / 100, index + 1);
    });
    
    return npv;
  };

  // Tính toán IRR (simplified)
  const calculateIRR = (investment) => {
    const { initialInvestment = 0, cashFlows } = investment || {};
    const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
    
    if (cashFlowList.length === 0) return 0;
    
    // Simplified IRR calculation
    const totalCashFlow = cashFlowList.reduce((sum, cf) => sum + Number(cf?.amount || 0), 0);
    const initial = Number(initialInvestment || 0);
    
    if (initial === 0) return 0;
    
    return ((totalCashFlow - initial) / initial) * 100;
  };

  // Tính toán ROI
  const calculateROI = (investment) => {
    const { initialInvestment = 0, cashFlows } = investment || {};
    const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
    
    if (cashFlowList.length === 0) return 0;
    
    const totalCashFlow = cashFlowList.reduce((sum, cf) => sum + Number(cf?.amount || 0), 0);
    const initial = Number(initialInvestment || 0);
    
    if (initial === 0) return 0;
    
    return ((totalCashFlow - initial) / initial) * 100;
  };

  // Lọc investments
  const filteredInvestments = useMemo(() => {
    try {
      // Đảm bảo investments luôn là array
      let filtered = Array.isArray(investments) ? investments : [];

      filtered = filtered.filter((investment) => {
        const matchesSearch = !searchQuery || 
          investment.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          investment.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === "all" || investment.status === statusFilter;
        const matchesRisk = riskFilter === "all" || investment.riskLevel === riskFilter;
        
        return matchesSearch && matchesStatus && matchesRisk;
      });

      return filtered.sort((a, b) => {
        // Đảm bảo createdAt tồn tại và hợp lệ
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc đầu tư");
      return [];
    }
  }, [investments, searchQuery, statusFilter, riskFilter]);

  // Sắp xếp investments theo NPV
  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    const npvA = calculateNPV(a);
    const npvB = calculateNPV(b);
    return npvB - npvA;
  });

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    openCompose();
  };

  const handleDelete = (investmentId) => {
    if (confirm("Bạn có chắc chắn muốn xóa dự án đầu tư này?")) {
      setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
    }
  };

  const handleToggleFavorite = (investmentId) => {
    setFavoriteInvestments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(investmentId)) {
        newSet.delete(investmentId);
      } else {
        newSet.add(investmentId);
      }
      return newSet;
    });
  };

  const handleViewNotes = (investment) => {
    setSelectedInvestmentForNotes(investment);
    openNotes();
  };

  const handleSubmit = (values) => {
    if (editingInvestment) {
      setInvestments(prev => prev.map(inv => 
        inv.id === editingInvestment.id ? { ...inv, ...values } : inv
      ));
    } else {
      const newInvestment = {
        id: `inv_${Date.now()}`,
        ...values,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setInvestments(prev => [...prev, newInvestment]);
    }
    closeCompose();
    setEditingInvestment(null);
  };

  const isMobile = useMediaQuery("(max-width: 768px)", true, { getInitialValueInEffect: false });

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      <div style={{ position: 'relative' }}>
        <LoadingOverlay visible={false} />
        
        <Flex direction="row" justify="space-between" align="center" mb="md">
          <div>
            <Title order={2} c="blue">
              Công Cụ Tính Toán Đầu Tư
            </Title>
            <Text c="dimmed" size="sm">
              Phân tích và đánh giá các dự án đầu tư tiềm năng
            </Text>
          </div>
          <Button 
            leftSection={<IconPlus size={16} />} 
            variant="outline"
            onClick={() => {
              setEditingInvestment(null);
              openCompose();
            }}
          >
            Thêm Dự Án
          </Button>
        </Flex>

        {/* Filters */}
        <Card withBorder p="md" mb="md">
          <Flex direction={isMobile ? "column" : "row"} gap="md" align={isMobile ? "stretch" : "flex-end"}>
            <TextInput
              placeholder="Tìm kiếm dự án..."
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
            
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: "all", label: "Tất cả" },
                { value: "active", label: "Đang hoạt động" },
                { value: "completed", label: "Hoàn thành" },
                { value: "cancelled", label: "Đã hủy" }
              ]}
              leftSection={<IconFilter size={16} />}
              size={isMobile ? "sm" : "md"}
            />
            
            <Select
              placeholder="Mức rủi ro"
              value={riskFilter}
              onChange={setRiskFilter}
              data={[
                { value: "all", label: "Tất cả" },
                { value: "low", label: "Thấp" },
                { value: "medium", label: "Trung bình" },
                { value: "high", label: "Cao" }
              ]}
              leftSection={<IconTrendingUp size={16} />}
              size={isMobile ? "sm" : "md"}
            />
          </Flex>
        </Card>

        {/* Summary Cards */}
        <Grid mb="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Tổng dự án</Text>
                  <Text size="xl" fw={700} c="blue">
                    {investments.length}
                  </Text>
                </div>
                <IconChartLine size={24} color="var(--mantine-color-blue-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">Tổng đầu tư</Text>
                  <Text size="xl" fw={700} c="green">
                    <NumberFormatter
                      value={investments.reduce((sum, inv) => sum + Number(inv.initialInvestment || 0), 0)}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </div>
                <IconTrendingUp size={24} color="var(--mantine-color-green-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">NPV trung bình</Text>
                  <Text size="xl" fw={700} c="orange">
                    <NumberFormatter
                      value={investments.length > 0 ? investments.reduce((sum, inv) => sum + calculateNPV(inv), 0) / investments.length : 0}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </div>
                <IconTrendingUp size={24} color="var(--mantine-color-orange-6)" />
              </Group>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card withBorder p="md">
              <Group justify="space-between">
                <div>
                  <Text size="sm" c="dimmed">ROI trung bình</Text>
                  <Text size="xl" fw={700} c="purple">
                    {investments.length > 0 ? (investments.reduce((sum, inv) => sum + calculateROI(inv), 0) / investments.length).toFixed(1) : 0}%
                  </Text>
                </div>
                <IconStar size={24} color="var(--mantine-color-purple-6)" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Investments List */}
        <Card withBorder p="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Danh Sách Dự Án Đầu Tư</Title>
            <Text size="sm" c="dimmed">
              {filteredInvestments.length} dự án
            </Text>
          </Group>

          {sortedInvestments.length === 0 ? (
            <Alert color="blue" variant="light">
              <Text size="sm">
                {searchQuery || statusFilter !== "all" || riskFilter !== "all" 
                  ? "Không tìm thấy dự án nào phù hợp với bộ lọc"
                  : "Chưa có dự án đầu tư nào. Hãy thêm dự án đầu tiên!"
                }
              </Text>
            </Alert>
          ) : (
            <ScrollArea h={600}>
              <Stack gap="sm">
                {sortedInvestments.map((investment) => {
                  const npv = calculateNPV(investment);
                  const irr = calculateIRR(investment);
                  const roi = calculateROI(investment);
                  const isFavorite = favoriteInvestments.has(investment.id);

                  return (
                    <Card key={investment.id} withBorder p="md" style={{ cursor: 'pointer' }}>
                      <Group justify="space-between" align="flex-start">
                        <div style={{ flex: 1 }}>
                          <Group gap="sm" mb="xs">
                            <Text fw={600} size="md">
                              {investment.name}
                            </Text>
                            <Badge 
                              color={
                                investment.riskLevel === 'low' ? 'green' :
                                investment.riskLevel === 'medium' ? 'yellow' : 'red'
                              }
                              variant="light"
                            >
                              {investment.riskLevel === 'low' ? 'Thấp' :
                               investment.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
                            </Badge>
                            <Badge color="blue" variant="light">
                              {investment.category}
                            </Badge>
                          </Group>
                          
                          <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
                            {investment.description}
                          </Text>

                          <Grid>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">Vốn đầu tư</Text>
                              <Text fw={500}>
                                <NumberFormatter
                                  value={investment.initialInvestment}
                                  thousandSeparator=","
                                  suffix=" VNĐ"
                                />
                              </Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">NPV</Text>
                              <Text fw={500} c={npv >= 0 ? "green" : "red"}>
                                <NumberFormatter
                                  value={npv}
                                  thousandSeparator=","
                                  suffix=" VNĐ"
                                />
                              </Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">IRR</Text>
                              <Text fw={500} c={irr >= 0 ? "green" : "red"}>
                                {irr.toFixed(1)}%
                              </Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <Text size="xs" c="dimmed">ROI</Text>
                              <Text fw={500} c={roi >= 0 ? "green" : "red"}>
                                {roi.toFixed(1)}%
                              </Text>
                            </Grid.Col>
                          </Grid>
                        </div>

                        <Group gap="xs">
                          <Tooltip label={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}>
                            <ActionIcon
                              variant="subtle"
                              color={isFavorite ? "red" : "gray"}
                              onClick={() => handleToggleFavorite(investment.id)}
                            >
                              {isFavorite ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                            </ActionIcon>
                          </Tooltip>
                          
                          <Tooltip label="Xem ghi chú">
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleViewNotes(investment)}
                            >
                              <IconNotes size={16} />
                            </ActionIcon>
                          </Tooltip>

                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="subtle">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEdit size={14} />}
                                onClick={() => handleEdit(investment)}
                              >
                                Chỉnh sửa
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => handleDelete(investment.id)}
                              >
                                Xóa
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            </ScrollArea>
          )}
        </Card>

        {/* Modals */}
        <Modal
          opened={composeOpened}
          onClose={() => {
            closeCompose();
            setEditingInvestment(null);
          }}
          title={
            <Text c="blue" fw={700} size="lg">
              {editingInvestment ? "Chỉnh sửa dự án" : "Thêm dự án mới"}
            </Text>
          }
          size="xl"
          fullScreen={!!isMobile}
        >
          <ClientOnly fallback={<div>Loading form...</div>}>
            <InvestmentFormDynamic
              investment={editingInvestment}
              onSubmit={handleSubmit}
              onCancel={() => {
                closeCompose();
                setEditingInvestment(null);
              }}
            />
          </ClientOnly>
        </Modal>

        <Modal
          opened={notesOpened}
          onClose={() => {
            closeNotes();
            setSelectedInvestmentForNotes(null);
          }}
          title={
            <Text c="blue" fw={700} size="lg">
              Ghi chú dự án - {selectedInvestmentForNotes?.name}
            </Text>
          }
          size="lg"
        >
          <ClientOnly fallback={<div>Loading notes...</div>}>
            <InvestmentNotesDynamic
              investment={selectedInvestmentForNotes}
              onClose={() => {
                closeNotes();
                setSelectedInvestmentForNotes(null);
              }}
            />
          </ClientOnly>
        </Modal>
      </div>
    </ClientOnly>
  );
}