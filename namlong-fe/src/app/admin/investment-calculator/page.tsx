/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import dayjs from "dayjs";
import {
  Card,
  Text,
  Title,
  Group,
  Button,
  Grid,
  Modal,
  Stack,
  NumberInput,
  Select,
  TextInput,
  Table,
  Badge,
  Progress,
  Alert,
  Divider,
  ActionIcon,
  Tooltip,
  Paper,
  SimpleGrid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconCalculator,
  IconEdit,
  IconTrash,
  IconDownload,
  IconChartBar,
  IconCurrency,
  IconCalendar,
  IconAlertCircle,
  IconCheck,
  IconBookmark,
  IconBookmarkFilled,
  IconNotes,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";

import ClientOnly from "../../../components/ClientOnly";
import nextDynamic from "next/dynamic";
import InvestmentForm from "./components/InvestmentForm";
import InvestmentNotes from "./components/InvestmentNotes";
import { notifications } from "@mantine/notifications";

const InvestmentFormDynamic = nextDynamic(() => import("./components/InvestmentForm"), { ssr: false });
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
  const [investments, setInvestments] = useState(() => [
    {
      id: "inv_001",
      name: "Dự án Bất động sản Quận 7",
      projectName: "Dự án Bất động sản Quận 7",
      description: "Đầu tư xây dựng chung cư cao cấp tại Quận 7, TP.HCM với 200 căn hộ",
      category: "real_estate",
      riskLevel: "medium",
      initialInvestment: 50000000000,
      discountRate: 8,
      cashFlows: [
        { year: 1, amount: 5000000000, description: "Bán 20% căn hộ" },
        { year: 2, amount: 15000000000, description: "Bán 60% căn hộ" },
        { year: 3, amount: 25000000000, description: "Bán hết căn hộ còn lại" },
        { year: 4, amount: 8000000000, description: "Thu từ cho thuê và dịch vụ" },
        { year: 5, amount: 10000000000, description: "Thu từ cho thuê và dịch vụ" }
      ],
      createdDate: "2024-01-15"
    },
    {
      id: "inv_002", 
      name: "Nhà máy sản xuất điện tử",
      projectName: "Nhà máy sản xuất điện tử",
      description: "Đầu tư nhà máy sản xuất linh kiện điện tử xuất khẩu",
      category: "manufacturing",
      riskLevel: "high",
      initialInvestment: 30000000000,
      discountRate: 12,
      cashFlows: [
        { year: 1, amount: 2000000000, description: "Doanh thu năm đầu (thấp do setup)" },
        { year: 2, amount: 8000000000, description: "Tăng trưởng 300%" },
        { year: 3, amount: 12000000000, description: "Đạt công suất 80%" },
        { year: 4, amount: 15000000000, description: "Đạt công suất tối đa" },
        { year: 5, amount: 18000000000, description: "Mở rộng sản xuất" }
      ],
      createdDate: "2024-02-20"
    },
    {
      id: "inv_003",
      name: "Chuỗi cửa hàng bán lẻ",
      projectName: "Chuỗi cửa hàng bán lẻ",
      description: "Mở 50 cửa hàng tiện lợi tại các khu đô thị mới",
      category: "retail", 
      riskLevel: "low",
      initialInvestment: 15000000000,
      discountRate: 6,
      cashFlows: [
        { year: 1, amount: 3000000000, description: "Mở 10 cửa hàng đầu tiên" },
        { year: 2, amount: 6000000000, description: "Mở thêm 20 cửa hàng" },
        { year: 3, amount: 9000000000, description: "Hoàn thành 50 cửa hàng" },
        { year: 4, amount: 12000000000, description: "Tối ưu hóa vận hành" },
        { year: 5, amount: 15000000000, description: "Mở rộng ra các tỉnh khác" }
      ],
      createdDate: "2024-03-10"
    },
    {
      id: "inv_004",
      name: "Startup Công nghệ AI",
      projectName: "Startup Công nghệ AI",
      description: "Đầu tư vào startup phát triển AI cho y tế",
      category: "technology",
      riskLevel: "high", 
      initialInvestment: 8000000000,
      discountRate: 15,
      cashFlows: [
        { year: 1, amount: 500000000, description: "MVP và thử nghiệm" },
        { year: 2, amount: 2000000000, description: "Tăng trưởng người dùng" },
        { year: 3, amount: 5000000000, description: "Mở rộng thị trường" },
        { year: 4, amount: 8000000000, description: "IPO hoặc M&A" },
        { year: 5, amount: 12000000000, description: "Mở rộng quốc tế" }
      ],
      createdDate: "2024-04-05"
    }
  ]);

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

  // Tính toán IRR (Internal Rate of Return)
  const calculateIRR = (investment) => {
    const { initialInvestment = 0, cashFlows } = investment || {};
    const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
    let rate = 0.1;
    const tolerance = 0.0001;
    const maxIterations = 1000;

    for (let i = 0; i < maxIterations; i++) {
      let npv = -Number(initialInvestment || 0);
      let derivative = 0;

      cashFlowList.forEach((cashFlow, index) => {
        const period = index + 1;
        const amount = Number(cashFlow?.amount || 0);
        npv += amount / Math.pow(1 + rate, period);
        derivative -= period * amount / Math.pow(1 + rate, period + 1);
      });

      if (Math.abs(npv) < tolerance) break;
      if (derivative === 0) break;
      rate = rate - npv / derivative;
    }

    return rate * 100;
  };

  // Tính toán Payback Period
  const calculatePaybackPeriod = (investment) => {
    const { initialInvestment = 0, cashFlows } = investment || {};
    const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
    let cumulativeCashFlow = 0;

    for (let i = 0; i < cashFlowList.length; i++) {
      cumulativeCashFlow += Number(cashFlowList[i]?.amount || 0);
      if (cumulativeCashFlow >= Number(initialInvestment || 0)) {
        const amountThisYear = Number(cashFlowList[i]?.amount || 0);
        return amountThisYear > 0
          ? i + 1 - (cumulativeCashFlow - Number(initialInvestment || 0)) / amountThisYear
          : null;
      }
    }

    return null;
  };

  // Tính toán ROI
  const calculateROI = (investment) => {
    const { initialInvestment = 0, cashFlows } = investment || {};
    const cashFlowList = Array.isArray(cashFlows) ? cashFlows : [];
    const totalCashFlow = cashFlowList.length > 0 ? cashFlowList.reduce((sum, cf) => sum + Number(cf?.amount || 0), 0) : 0;
    const base = Number(initialInvestment || 0);
    if (base === 0) return 0;
    return ((totalCashFlow - base) / base) * 100;
  };

  // Thêm hoặc cập nhật đầu tư
  const handleFormSubmit = (values) => {
    try {
      if (editingInvestment) {
        setInvestments(prev => 
          prev.map(inv => 
            inv.id === editingInvestment.id 
              ? { ...values, id: editingInvestment.id, createdDate: editingInvestment.createdDate }
              : inv
          )
        );
        console.log("Investment updated successfully / Cập nhật đầu tư thành công");
        notifications.show({
          title: "Thành công / Success",
          message: "Đã cập nhật phương án đầu tư! / Investment plan updated successfully!",
          color: "green",
          icon: <IconCheck size={16} />
        });
      } else {
        const newInvestment = {
          ...values,
          id: `inv_${(investments.length + 1).toString().padStart(3, '0')}`,
          createdDate: dayjs().format("YYYY-MM-DD"),
        };
        setInvestments(prev => [...prev, newInvestment]);
        console.log("Investment added successfully / Thêm đầu tư thành công");
        notifications.show({
          title: "Thành công / Success", 
          message: "Đã thêm phương án đầu tư mới! / New investment plan added successfully!",
          color: "green",
          icon: <IconCheck size={16} />
        });
      }
      closeCompose();
      setEditingInvestment(null);
    } catch (error) {
      console.error("Error saving investment / Lỗi lưu đầu tư:", error);
      notifications.show({
        title: "Lỗi / Error",
        message: "Không thể lưu phương án đầu tư! / Cannot save investment plan!",
        color: "red",
        icon: <IconAlertCircle size={16} />
      });
    }
  };

  // Handlers
  const handleCreate = () => {
    setEditingInvestment(null);
    openCompose();
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    openCompose();
  };

  const handleDelete = (id) => {
    setInvestments(prev => prev.filter(inv => inv.id !== id));
    // Also remove from favorites if deleted
    setFavoriteInvestments(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    notifications.show({
      title: "Đã xóa / Deleted",
      message: "Phương án đầu tư đã được xóa! / Investment plan has been deleted!",
      color: "blue"
    });
  };

  const handleFavoriteToggle = (investmentId) => {
    setFavoriteInvestments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(investmentId)) {
        newSet.delete(investmentId);
        notifications.show({
          title: "Đã bỏ yêu thích",
          message: "Phương án đầu tư đã được bỏ khỏi danh sách yêu thích",
          color: "blue",
          icon: <IconBookmark size={16} />
        });
      } else {
        newSet.add(investmentId);
        notifications.show({
          title: "Đã thêm vào yêu thích",
          message: "Phương án đầu tư đã được thêm vào danh sách yêu thích",
          color: "blue", 
          icon: <IconBookmarkFilled size={16} />
        });
      }
      return newSet;
    });
  };

  const handleOpenNotes = (investment) => {
    setSelectedInvestmentForNotes(investment);
    openNotes();
  };

  const handleUpdateInvestment = (updatedInvestment) => {
    setInvestments(prev => 
      prev.map(inv => 
        inv.id === updatedInvestment.id ? updatedInvestment : inv
      )
    );
  };

  // Precompute metrics per investment to avoid recalculations
  const metricsById = useMemo(() => {
    const map = new Map();
    investments.forEach((investment) => {
      const npv = calculateNPV(investment);
      const irr = calculateIRR(investment);
      const roi = calculateROI(investment);
      const payback = calculatePaybackPeriod(investment);
      map.set(investment.id, { npv, irr, roi, payback });
    });
    return map;
  }, [investments]);

  // Filter and search logic (memoized)
  const deferredSearch = useDeferredValue(searchQuery);
  const filteredInvestments = useMemo(() => {
    const q = (deferredSearch || "").toLowerCase().trim();
    return investments.filter((investment) => {
      const matchesSearch = q === "" ||
        (investment.projectName || investment.name || "").toLowerCase().includes(q) ||
        (investment.description || "").toLowerCase().includes(q);

      const metrics = metricsById.get(investment.id) || { npv: 0, irr: 0 };
      const status = metrics.npv > 0 && metrics.irr > 15
        ? "recommended"
        : metrics.npv > 0 && metrics.irr > 10
          ? "consider"
          : "not_recommended";

      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "recommended" && status === "recommended") ||
        (statusFilter === "consider" && status === "consider") ||
        (statusFilter === "not_recommended" && status === "not_recommended") ||
        (statusFilter === "favorite" && favoriteInvestments.has(investment.id));

      const matchesRisk = riskFilter === "all" || investment.riskLevel === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [investments, metricsById, deferredSearch, statusFilter, riskFilter, favoriteInvestments]);

  const getStatusColor = (npv, irr) => {
    if (npv > 0 && irr > 15) return "green";
    if (npv > 0 && irr > 10) return "yellow";
    return "red";
  };

  const getRecommendation = (npv, irr, roi, payback) => {
    if (npv > 0 && irr > 15 && roi > 20 && payback && payback < 3) {
      return { text: "Rất khuyến nghị", color: "green" };
    } else if (npv > 0 && irr > 10 && roi > 10) {
      return { text: "Khuyến nghị", color: "yellow" };
    } else if (npv > 0) {
      return { text: "Cân nhắc", color: "orange" };
    } else {
      return { text: "Không khuyến nghị", color: "red" };
    }
  };

  return (
      <ClientOnly>
        <div suppressHydrationWarning>
          <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <Title order={2} className="flex items-center gap-2">
                <IconCalculator size={28} />
                Công Cụ Tính Toán Đầu Tư
              </Title>
              <Text c="dimmed" mt="xs">
                Quản lý và tính toán các phương án đầu tư
              </Text>
            </div>
            <Group>
              <Button 
                leftSection={<IconPlus size={16} />}
                onClick={handleCreate}
              >
                Thêm Phương Án
              </Button>
            </Group>
          </div>

          {/* Filter and Search */}
          <Card withBorder p="md" mb="md">
            <Title order={4} mb="md">
              <Group gap="xs">
                <IconFilter size="1.2rem" />
                <Text>Bộ lọc và tìm kiếm</Text>
              </Group>
            </Title>
            
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
              <TextInput
                placeholder="Tìm kiếm theo tên hoặc mã dự án..."
                leftSection={<IconSearch size="1rem" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              <Select
                placeholder="Tất cả trạng thái"
                data={[
                  { value: "all", label: "Tất cả trạng thái" },
                  { value: "recommended", label: "Rất khuyến nghị" },
                  { value: "consider", label: "Cân nhắc" },
                  { value: "not_recommended", label: "Không khuyến nghị" },
                  { value: "favorite", label: "Yêu thích" }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
              />
              
              <Select
                placeholder="Tất cả mức độ"
                data={[
                  { value: "all", label: "Tất cả mức độ" },
                  { value: "low", label: "Thấp" },
                  { value: "medium", label: "Trung bình" },
                  { value: "high", label: "Cao" }
                ]}
                value={riskFilter}
                onChange={setRiskFilter}
              />
              
              <Group>
                <Text size="sm" c="dimmed">
                  {filteredInvestments.length} / {investments.length} phương án
                </Text>
              </Group>
            </SimpleGrid>
          </Card>

          {/* Investment List */}
          {filteredInvestments.length === 0 ? (
                <Card withBorder p="xl" className="text-center">
                  <IconCalculator size={48} className="mx-auto mb-4 text-gray-400" />
                  <Text size="lg" fw={500} mb="xs">
                    {investments.length === 0 ? "Chưa có phương án đầu tư nào" : "Không tìm thấy phương án phù hợp"}
                  </Text>
                  <Text c="dimmed" mb="lg">
                    {investments.length === 0 ? "Tạo phương án đầu tư đầu tiên để bắt đầu phân tích" : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
                  </Text>
                  {investments.length === 0 && (
                    <Button onClick={handleCreate}>
                      Tạo Phương Án Đầu Tiên
                    </Button>
                  )}
                </Card>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing="md">
                  {filteredInvestments.map((investment) => {
                    const { npv, irr, roi, payback } = metricsById.get(investment.id) || { npv: 0, irr: 0, roi: 0, payback: null };
                    const statusColor = getStatusColor(npv, irr);
                    const recommendation = getRecommendation(npv, irr, roi, payback);
                    const isFavorite = favoriteInvestments.has(investment.id);

                    return (
                        <Card 
                          key={investment.id}
                          withBorder 
                          p="md" 
                          h="100%" 
                          className={`transition-all hover:shadow-lg ${
                            isFavorite ? 'ring-2 ring-yellow-400' : ''
                          }`}
                        >
                          <Stack gap="sm">
                            {/* Header */}
                            <Group justify="space-between">
                              <Badge color={recommendation.color} variant="light">
                                {recommendation.text}
                              </Badge>
                              <Group gap="xs">
                                <Tooltip label={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}>
                                  <ActionIcon
                                    variant="light"
                                    color="yellow"
                                    onClick={() => handleFavoriteToggle(investment.id)}
                                  >
                                    {isFavorite ? <IconBookmarkFilled size={16} /> : <IconBookmark size={16} />}
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Ghi chú">
                                  <ActionIcon
                                    variant="light"
                                    color="blue"
                                    onClick={() => handleOpenNotes(investment)}
                                  >
                                    <IconNotes size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Chỉnh sửa">
                                  <ActionIcon
                                    variant="light"
                                    color="yellow"
                                    onClick={() => handleEdit(investment)}
                                  >
                                    <IconEdit size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Xóa">
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    onClick={() => handleDelete(investment.id)}
                                  >
                                    <IconTrash size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </Group>

                            {/* Project Info */}
                            <div>
                              <Text fw={600} size="lg" lineClamp={2}>
                                {investment.projectName}
                              </Text>
                              <Text size="sm" c="dimmed" lineClamp={2} mt="xs">
                                {investment.description}
                              </Text>
                            </div>

                            {/* Key Metrics */}
                            <Stack gap="xs">
                              <Group justify="space-between">
                                <Text size="sm" c="dimmed">Vốn đầu tư:</Text>
                                <Text fw={500}>
                                  {new Intl.NumberFormat('vi-VN').format(investment.initialInvestment || 0)} VNĐ
                                </Text>
                              </Group>
                              
                              <Group justify="space-between">
                                <Text size="sm" c="dimmed">NPV:</Text>
                                <Text fw={500} c={npv > 0 ? "green" : "red"}>
                                  {new Intl.NumberFormat('vi-VN').format(npv)} VNĐ
                                </Text>
                              </Group>
                              
                              <Group justify="space-between">
                                <Text size="sm" c="dimmed">IRR:</Text>
                                <Text fw={500} c={irr > 10 ? "green" : "red"}>
                                  {(Number.isFinite(irr) ? irr : 0).toFixed(2)}%
                                </Text>
                              </Group>
                              
                              <Group justify="space-between">
                                <Text size="sm" c="dimmed">ROI:</Text>
                                <Text fw={500} c={roi > 0 ? "green" : "red"}>
                                  {(Number.isFinite(roi) ? roi : 0).toFixed(2)}%
                                </Text>
                              </Group>
                              
                              {Number.isFinite(payback) && (
                                <Group justify="space-between">
                                  <Text size="sm" c="dimmed">Hoàn vốn:</Text>
                                  <Text fw={500}>
                                    {(Number.isFinite(payback) ? payback : 0).toFixed(1)} năm
                                  </Text>
                                </Group>
                              )}
                            </Stack>

                            {/* Progress bar for IRR */}
                            <div>
                              <Group justify="space-between" mb="xs">
                                <Text size="xs" c="dimmed">Mức độ hấp dẫn</Text>
                                <Text size="xs" c="dimmed">{Math.min(Number.isFinite(irr) ? irr : 0, 30).toFixed(1)}/30%</Text>
                              </Group>
                              <Progress 
                                value={Math.min(Number.isFinite(irr) ? irr : 0, 30) / 30 * 100} 
                                color={statusColor}
                                size="sm"
                              />
                            </div>

                            {/* Date */}
                            <Group gap="xs" mt="auto">
                              <IconCalendar size={14} />
                              <Text size="xs" c="dimmed">
                                Tạo: {investment.createdDate}
                              </Text>
                            </Group>
                          </Stack>
                        </Card>
                    );
                  })}
                </SimpleGrid>
              )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          opened={composeOpened}
          onClose={closeCompose}
          title={editingInvestment ? "Chỉnh Sửa Phương Án Đầu Tư" : "Tạo Phương Án Đầu Tư Mới"}
          size="xl"
        >
          <InvestmentFormDynamic
            investment={editingInvestment}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              closeCompose();
              setEditingInvestment(null);
            }}
          />
                  </Modal>

          {/* Investment Notes Modal */}
          <InvestmentNotesDynamic 
            opened={notesOpened}
            onClose={() => {
              closeNotes();
              setSelectedInvestmentForNotes(null);
            }}
            investment={selectedInvestmentForNotes}
            onUpdateInvestment={handleUpdateInvestment}
          />
        </div>
        </ClientOnly>
  );
} 