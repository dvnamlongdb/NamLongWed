/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import InvestmentForm from "./components/Compose";
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
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconEye, IconSearch, IconX } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useInvestments, useInvestmentMutation, useCustomers } from "../../../service/hook";
import { useSearchParams } from "next/navigation";
import Layout from "../../../components/Layout";
import dayjs from "dayjs";
import ClientOnly from "../../../components/ClientOnly";
import ExportButton from "../../../components/ExportButton";

export const dynamic = 'force-dynamic';

const Action = ({ onDetail }) => {
  return (
    <Group gap="xs" justify="center">
      <ActionIcon
        size="sm"
        variant="light"
        color="blue"
        onClick={onDetail}
        title="Xem chi tiết"
      >
        <IconEye size={16} />
      </ActionIcon>
    </Group>
  );
};

const InvestmentsPage = () => {
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [detailInvestment, setDetailInvestment] = useState(null);
  const [modalType, setModalType] = useState(""); // "form", "detail"
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: investmentList, loading, getInvestments } = useInvestments();
  const { createInvestment, updateInvestment, deleteInvestment, loading: mutationLoading } = useInvestmentMutation();
  const { data: customers, getCustomers } = useCustomers();
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)", true, { getInitialValueInEffect: false });
  const searchParams = useSearchParams();
  const customerFilter = searchParams.get('customer');

  const handleClose = () => {
    close();
    setEditingInvestment(null);
    setDetailInvestment(null);
    setModalType("");
  };

  const handleSubmit = async (values) => {
    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment._id, values);
      } else {
        await createInvestment(values);
      }
      await getInvestments(); // Refresh data
      handleClose();
    } catch (error) {
      console.error('Error submitting investment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa đầu tư này?")) {
      try {
        await deleteInvestment(id);
        await getInvestments(); // Refresh data
      } catch (error) {
        console.error('Error deleting investment:', error);
      }
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setModalType("form");
    open();
  };

  const handleDetail = (investment) => {
    setDetailInvestment(investment);
    setModalType("detail");
    open();
  };

  // Group investments by project and calculate totals
  const projectSummaries = React.useMemo(() => {
    if (!investmentList || !customers) return [];
    
    const projectMap = {};
    
    investmentList.forEach(investment => {
      const projectKey = investment.project_name;
      
      if (!projectMap[projectKey]) {
        projectMap[projectKey] = {
          project_name: investment.project_name,
          investment_type: investment.investment_type,
          other_investment_type: investment.other_investment_type,
          description: investment.description,
          total_amount: 0,
          investment_count: 0,
          latest_date: investment.investment_date,
          earliest_date: investment.investment_date,
          investors: new Set(),
          all_investments: []
        };
      }
      
      projectMap[projectKey].total_amount += investment.amount || 0;
      projectMap[projectKey].investment_count += 1;
      // Find customer name from customer_tax
      const customer = customers?.find(c => c.tax_id === investment.customer_tax);
      const customerName = customer?.name || 'Unknown Customer';
      projectMap[projectKey].investors.add(customerName);
      projectMap[projectKey].all_investments.push(investment);
      
      // Track date range
      if (new Date(investment.investment_date) > new Date(projectMap[projectKey].latest_date)) {
        projectMap[projectKey].latest_date = investment.investment_date;
      }
      if (new Date(investment.investment_date) < new Date(projectMap[projectKey].earliest_date)) {
        projectMap[projectKey].earliest_date = investment.investment_date;
    }
    });
    
    return Object.values(projectMap).map((project: any) => {
      return {
        project_name: project.project_name,
        investment_type: project.investment_type,
        other_investment_type: project.other_investment_type,
        description: project.description,
        total_amount: project.total_amount,
        investment_count: project.investment_count,
        latest_date: project.latest_date,
        earliest_date: project.earliest_date,
        investors: Array.from(project.investors),
        all_investments: project.all_investments
      };
    });
  }, [investmentList, customers]);

  // Filter project summaries based on search query and customer filter
  const filteredProjects = useMemo(() => {
    try {
      // Đảm bảo projectSummaries luôn là array
      let filtered = Array.isArray(projectSummaries) ? projectSummaries : [];

      filtered = filtered.filter((project) => {
        // Filter by specific customer from URL params
        if (customerFilter) {
          const hasCustomer = project.all_investments.some((investment: any) => 
            investment.customer_tax === customerFilter
          );
          if (!hasCustomer) return false;
        }
        
        // Filter by search query
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        return (
          project.project_name?.toLowerCase().includes(query) ||
          project.investment_type?.toLowerCase().includes(query) ||
          project.other_investment_type?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.investors.some((investor: string) => investor.toLowerCase().includes(query))
        );
      });

          return (filtered as any[]).sort((a: any, b: any) => {
            // Ưu tiên sort theo createdAt; nếu thiếu dùng earliest/latest date của dự án
            const aTime = a?.createdAt
              ? new Date(a.createdAt).getTime()
              : (a?.latest_date ? new Date(a.latest_date).getTime() : (a?.earliest_date ? new Date(a.earliest_date).getTime() : 0));
            const bTime = b?.createdAt
              ? new Date(b.createdAt).getTime()
              : (b?.latest_date ? new Date(b.latest_date).getTime() : (b?.earliest_date ? new Date(b.earliest_date).getTime() : 0));
            return bTime - aTime;
          });
    } catch {
      console.log("Lỗi khi lọc dự án đầu tư");
      return [];
    }
  }, [projectSummaries, customerFilter, searchQuery]);

  const rows = filteredProjects?.map((project, index) => (
    <Table.Tr key={`project-${index}`}>
      <Table.Td>
        <Text fw={600}>{project.project_name}</Text>
      </Table.Td>
      <Table.Td>
        <Text fw={500}>
          {(project.investors as string[]).length === 1 
            ? (project.investors as string[])[0] 
            : `${(project.investors as string[])[0]} +${(project.investors as string[]).length - 1} khác`}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500} c="blue">
          {project.investment_type === 'equity' ? 'Cổ phần' :
           project.investment_type === 'debt' ? 'Nợ' :
           project.investment_type === 'bond' ? 'Trái phiếu' :
           project.investment_type === 'venture' ? 'Đầu tư mạo hiểm' :
           project.investment_type === 'real_estate' ? 'Bất động sản' :
           project.investment_type === 'technology' ? 'Công nghệ' : 
           project.investment_type === 'other' ? project.other_investment_type || 'Khác' : 'Khác'}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fw={700} c="green">
          <NumberFormatter 
            value={project.total_amount} 
            thousandSeparator="," 
            decimalScale={0} 
            suffix=" VNĐ" 
          />
        </Text>
      </Table.Td>
      <Table.Td>
        <div>
          <Text size="sm">{dayjs(project.earliest_date).format("DD/MM/YYYY")}</Text>
          {project.investment_count > 1 && (
            <Text size="xs" c="dimmed">→ {dayjs(project.latest_date).format("DD/MM/YYYY")}</Text>
          )}
        </div>
      </Table.Td>
      <Table.Td>
        <Action
          onDetail={() => handleDetail(project.all_investments[0])}
        />
      </Table.Td>
    </Table.Tr>
  ));

  // Fetch data on component mount
  useEffect(() => {
    getInvestments();
    getCustomers();
  }, [getInvestments, getCustomers]);

  const isLoading = loading || mutationLoading;

  const getModalTitle = () => {
    switch (modalType) {
      case "form":
        return editingInvestment ? "Sửa đầu tư" : "Tạo đầu tư mới";
      case "detail":
        return "Chi tiết đầu tư";
      default:
        return "";
    }
  };

  return (
      <Suspense fallback={<div>Loading...</div>}>
      <ClientOnly fallback={<div>Loading...</div>}>
      <>
      <div className="relative">
          <LoadingOverlay visible={isLoading} />
        <Flex direction="row" justify="space-between" align="center">
          <Title order={2} className="text-blue-500">
              Danh Sách Đầu Tư
          </Title>
          <ExportButton
            filename={`investments_${Date.now()}`}
            rows={(filteredProjects || []).map((p: any) => ({
              TenDuAn: p.project_name,
              LoaiDauTu: p.investment_type === 'other' ? p.other_investment_type : p.investment_type,
              TongDauTu: p.total_amount,
              SoKhoan: p.investment_count,
              TuNgay: dayjs(p.earliest_date).format('YYYY-MM-DD'),
              DenNgay: dayjs(p.latest_date).format('YYYY-MM-DD'),
              NhaDauTu: (p.investors || []).join('; ')
            }))}
          />
          </Flex>
          
          {customerFilter && (
            <Text size="sm" c="blue" mb="md">
              Hiển thị dự án của khách hàng: {customers?.find(c => c.tax_id === customerFilter)?.name || customerFilter}
            </Text>
          )}

          {/* Search Bar */}
          <Flex direction={isMobile ? "column" : "row"} gap="md" align={isMobile ? "stretch" : "flex-end"}>
            <TextInput
              placeholder="Tìm kiếm theo tên dự án, loại đầu tư, nhà đầu tư..."
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
                Tìm thấy {filteredProjects?.length || 0} dự án
              </Text>
            )}
        </Flex>

                     <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                 <Table.Th>Tên dự án</Table.Th>
                 <Table.Th>Khách hàng</Table.Th>
                 <Table.Th>Loại đầu tư</Table.Th>
                 <Table.Th>Tổng đầu tư</Table.Th>
                 <Table.Th>Thời gian đầu tư</Table.Th>
                 <Table.Th>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>

          {filteredProjects?.length === 0 && (
            <Text ta="center" py="xl" c="dimmed">
                              {searchQuery ? `Không tìm thấy dự án nào với từ khóa "${searchQuery}"` : "Không có dữ liệu dự án"}
            </Text>
          )}
      </div>
        
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Text c="blue" fw={700} size="lg">
              {getModalTitle()}
          </Text>
        }
        fullScreen={!!isMobile}
          size="xl"
          styles={{
            body: { padding: '0' },
            content: { width: '100%', maxWidth: '100%' },
            inner: { padding: '0' }
          }}
      >
          {modalType === "form" && (
            <InvestmentForm
              data={editingInvestment}
          onSubmit={handleSubmit}
              loading={mutationLoading}
        />
          )}
          {modalType === "detail" && detailInvestment && (
            <div className="space-y-4">
              <Text size="lg" fw={600}>Chi tiết đầu tư</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text size="sm" c="dimmed">Tên dự án:</Text>
                  <Text fw={500}>{detailInvestment.project_name}</Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Loại đầu tư:</Text>
                  <Text fw={500}>
                    {detailInvestment.investment_type === 'equity' ? 'Cổ phần' :
                     detailInvestment.investment_type === 'debt' ? 'Nợ' :
                     detailInvestment.investment_type === 'bond' ? 'Trái phiếu' :
                     detailInvestment.investment_type === 'venture' ? 'Đầu tư mạo hiểm' :
                     detailInvestment.investment_type === 'real_estate' ? 'Bất động sản' :
                     detailInvestment.investment_type === 'technology' ? 'Công nghệ' :
                     detailInvestment.investment_type === 'other' ? detailInvestment.other_investment_type || 'Khác' : 'Khác'}
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Số tiền:</Text>
                  <Text fw={500}>
                    <NumberFormatter 
                      value={detailInvestment.amount} 
                      thousandSeparator="," 
                      decimalScale={0} 
                      suffix=" VNĐ" 
                    />
                  </Text>
                </div>
                <div>
                  <Text size="sm" c="dimmed">Ngày đầu tư:</Text>
                  <Text fw={500}>
                    {detailInvestment.investment_date ? dayjs(detailInvestment.investment_date).format("DD/MM/YYYY") : ""}
                  </Text>
                </div>
                {detailInvestment.description && (
                  <div className="col-span-2">
                    <Text size="sm" c="dimmed">Mô tả:</Text>
                    <Text fw={500}>{detailInvestment.description}</Text>
                  </div>
                )}
                {detailInvestment.notes && (
                  <div className="col-span-2">
                    <Text size="sm" c="dimmed">Ghi chú:</Text>
                    <Text fw={500}>{detailInvestment.notes}</Text>
                  </div>
                )}
              </div>
            </div>
          )}
      </Modal>
      </>
      </ClientOnly>
      </Suspense>
  );
};

export default InvestmentsPage;
