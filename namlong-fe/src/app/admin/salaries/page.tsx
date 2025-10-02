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
  Button,
  Modal,
  Text,
  Group,
  ActionIcon,
  TextInput,
  Card,
  Badge,
  NumberFormatter,
  Select,
  Flex,
  Grid,
} from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconEye,
} from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useStaff, useEmployeeSalaries, useEmployeeSalaryMutation } from "../../../service/hook";
import SalaryForm from "./components/Compose";
import SalaryDetail from "./components/Detail";
import ClientOnly from "../../../components/ClientOnly";
import Layout from "../../../components/Layout";
import dayjs from "dayjs";

export default function SalaryPage() {
  const isMobile = useMediaQuery("(max-width: 768px)", true);
  const [opened, { open, close }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const [editingData, setEditingData] = useState(null);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const { data: staff, getStaff } = useStaff();
  const { data: salaries, getEmployeeSalaries } = useEmployeeSalaries();
  const { createEmployeeSalary, updateEmployeeSalary, deleteEmployeeSalary } = useEmployeeSalaryMutation();

  useEffect(() => {
    getStaff();
    getEmployeeSalaries();
  }, []);

  // Create staff lookup map
  const staffMap = useMemo(() => {
    if (!staff) return {};
    return staff.reduce((acc, s) => {
      acc[s._id] = s;
      return acc;
    }, {});
  }, [staff]);

  // Filter salaries based on search, month, year
  const filteredSalaries = useMemo(() => {
    try {
      // Đảm bảo salaries luôn là array
      let filtered = Array.isArray(salaries) ? salaries : [];

      filtered = filtered.filter((salary) => {
        const staffMember = staffMap[salary.staffId];
        const salaryDate = dayjs(salary.month);
        
        // Search filter
        const matchesSearch = !searchTerm || 
          (staffMember?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (staffMember?.staff_code?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (staffMember?.position?.toLowerCase().includes(searchTerm.toLowerCase()));

        // Month filter
        const matchesMonth = !monthFilter || salaryDate.format("MM") === monthFilter;

        // Year filter  
        const matchesYear = !yearFilter || salaryDate.format("YYYY") === yearFilter;

        return matchesSearch && matchesMonth && matchesYear;
      });

      return filtered.sort((a, b) => {
        // Đảm bảo createdAt tồn tại và hợp lệ
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc lương");
      return [];
    }
  }, [salaries, staffMap, searchTerm, monthFilter, yearFilter]);

  const handleCreate = () => {
    setEditingData(null);
    open();
  };

  const handleEdit = (salary) => {
    setEditingData(salary);
    open();
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi lương này?")) {
      await deleteEmployeeSalary(id);
      getEmployeeSalaries();
    }
  };

  const handleViewDetail = (salary) => {
    setSelectedSalary(salary);
    openDetail();
  };

  const handleSubmit = async (data) => {
    try {
      if (editingData) {
        await updateEmployeeSalary(editingData._id, data);
      } else {
        await createEmployeeSalary(data);
      }
      getEmployeeSalaries();
      close();
    } catch (error) {
      console.error("Error saving salary:", error);
    }
  };

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: `Tháng ${i + 1}`,
  }));

  // Generate year options
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  }));

  const rows = filteredSalaries.map((salary) => {
    const staffMember = staffMap[salary.staffId];
    const salaryDate = dayjs(salary.month);

    return (
      <Table.Tr key={salary._id}>
        <Table.Td>
          <Text fw={500}>{staffMember?.staff_code || "N/A"}</Text>
        </Table.Td>
        <Table.Td>
          <Text fw={500}>{staffMember?.name || "N/A"}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">{staffMember?.position || "N/A"}</Text>
        </Table.Td>
        <Table.Td>
          <Badge color="blue" variant="light">
            {salaryDate.format("MM/YYYY")}
          </Badge>
        </Table.Td>
        <Table.Td>
          <NumberFormatter
            value={salary.basicSalary}
            thousandSeparator=","
            suffix=" VNĐ"
          />
        {/* <Table.Td>
  <NumberFormatter
    value={salary.allowances || 0}
    thousandSeparator=","
    suffix=" VNĐ"
  />
</Table.Td> */}

{/* <Table.Td>
  <NumberFormatter
    value={salary.deductions || 0}
    thousandSeparator=","
    suffix=" VNĐ"
  />
</Table.Td> */}

        </Table.Td>
        <Table.Td>
          <Text fw={600} c="green">
            <NumberFormatter
              value={salary.netSalary}
              thousandSeparator=","
              suffix=" VNĐ"
            />
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => handleViewDetail(salary)}
              size="sm"
            >
              <IconEye size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="yellow"
              onClick={() => handleEdit(salary)}
              size="sm"
            >
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(salary._id)}
              size="sm"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ClientOnly>
      <>
        <div>
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <Text size="xl" fw={700}>
              Danh Sách Lương Nhân Viên
            </Text>
            <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
              Tạo Bản Lương
            </Button>
          </Group>

          {/* Filters */}
          <Grid mb="md">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <TextInput
                placeholder="Tìm kiếm theo tên, mã NV, chức vụ..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Select
                placeholder="Tháng"
                data={monthOptions}
                value={monthFilter}
                onChange={setMonthFilter}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, md: 2 }}>
              <Select
                placeholder="Năm"
                data={yearOptions}
                value={yearFilter}
                onChange={setYearFilter}
                clearable
              />
            </Grid.Col>
          </Grid>

          {/* Stats */}
          <Flex gap="md" mb="lg">
            <Card withBorder p="md" style={{ flex: 1 }}>
              <Text size="sm" c="dimmed">Tổng bản lương</Text>
              <Text size="lg" fw={700}>{filteredSalaries.length}</Text>
            </Card>
            <Card withBorder p="md" style={{ flex: 1 }}>
              <Text size="sm" c="dimmed">Tổng chi lương</Text>
              <Text size="lg" fw={700} c="green">
                <NumberFormatter
                  value={filteredSalaries.reduce((sum, s) => sum + s.netSalary, 0)}
                  thousandSeparator=","
                  suffix=" VNĐ"
                />
              </Text>
            </Card>
          </Flex>

          {/* Table */}
          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Mã NV</Table.Th>
                  <Table.Th>Tên nhân viên</Table.Th>
                  <Table.Th>Chức vụ</Table.Th>
                  <Table.Th>Tháng/Năm</Table.Th>
                  <Table.Th>Lương cơ bản</Table.Th>
                  {/* <Table.Th>Phụ cấp</Table.Th> */}
                  {/* <Table.Th>Khấu trừ</Table.Th> */}
                  <Table.Th>Lương thực nhận</Table.Th>
                  <Table.Th>Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {filteredSalaries.length === 0 && (
            <Text ta="center" c="dimmed" py="xl">
              Không có dữ liệu lương
            </Text>
          )}
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          opened={opened}
          onClose={close}
          title={editingData ? "Sửa Thông Tin Lương" : "Tạo Bản Lương Mới"}
          size="lg"
        >
          <SalaryForm
            data={editingData}
            onSubmit={handleSubmit}
            onCancel={close}
            staff={staff}
          />
        </Modal>

        {/* Detail Modal */}
        <Modal
          opened={detailOpened}
          onClose={closeDetail}
          title="Chi Tiết Lương"
          size="md"
        >
          {selectedSalary && (
            <SalaryDetail
              data={selectedSalary}
              staff={staffMap[selectedSalary.staffId]}
            />
          )}
        </Modal>
        </div>
        </>
      </ClientOnly>
  );
} 
