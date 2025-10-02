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
  ActionIcon,
  Button,
  Flex,
  LoadingOverlay,
  Modal,
  Space,
  Table,
  Text,
  Title,
  TextInput,
  Group,
} from "@mantine/core";
import { useCustomers, useCustomerMutation } from "../../../service/hook";
// import Layout from "../../../components/Layout";
import CustomerForm from "./components/Compose";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconPlus, IconChartPie, IconEye, IconEdit, IconTrash, IconSearch, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import ExportButton from "../../../components/ExportButton";

// Helpers to normalize BE field names (Atlas)
const getTax = (c: any) => c?.tax_id ?? c?.tax_number ?? c?.tax ?? "";
const getPhone = (c: any) => c?.phone_number ?? c?.phone ?? "";

const CustomersPage = () => {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const { data: customerList, loading, getCustomers } = useCustomers();
  const { createCustomer, updateCustomer, deleteCustomer, loading: mutationLoading } = useCustomerMutation();
  const [opened, { open, close }] = useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = () => {
    close();
    setEditingCustomer(null);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, values);
      } else {
        await createCustomer(values);
      }
      await getCustomers(); // Refresh data
      handleClose();
    } catch (error) {
      console.error('Error submitting customer:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      try {
        await deleteCustomer(id);
        await getCustomers(); // Refresh data
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    open();
  };

  const handleDetail = (customer) => {
    setDetailCustomer(customer);
    openDetail();
  };

  const handleViewPortfolio = (customer) => {
    router.push(`/admin/investment-portfolios?customer=${customer.tax_id}`);
  };

  const filteredCustomers = useMemo(() => {
    try {
      // Đảm bảo customerList luôn là array
      let filtered = Array.isArray(customerList) ? customerList : [];

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((c) => {
          const tax = String(getTax(c)).toLowerCase();
          const name = String(c.name || "").toLowerCase();
          const email = String(c.email || "").toLowerCase();
          const address = String(c.address || "").toLowerCase();
          const phone = String(getPhone(c)).toLowerCase();
          return (
            tax.includes(q) || name.includes(q) || email.includes(q) || address.includes(q) || phone.includes(q)
          );
        });
      }

      return filtered.sort((a, b) => {
        // Đảm bảo createdAt tồn tại và hợp lệ
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc khách hàng");
      return [];
    }
  }, [customerList, searchQuery]);

  const rows = filteredCustomers?.map((customer) => (
    <Table.Tr key={customer._id}>
      <Table.Td>{getTax(customer)}</Table.Td>
      <Table.Td>{customer.name}</Table.Td>
      <Table.Td>{customer.address}</Table.Td>
      <Table.Td>{getPhone(customer)}</Table.Td>
      <Table.Td>{customer.email}</Table.Td>
      <Table.Td>
        <Text size="sm" c={customer.notes ? "dark" : "dimmed"}>
          {customer.notes || "Không có ghi chú"}
        </Text>
      </Table.Td>
        <Table.Td>
        <Flex gap="xs" justify="center">
          <ActionIcon
            size="sm"
            variant="light"
            color="blue"
            onClick={() => handleDetail(customer)}
            title="Xem chi tiết"
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="light"
            color="yellow"
            onClick={() => handleEdit(customer)}
            title="Sửa"
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="light"
            color="purple"
            onClick={() => handleViewPortfolio(customer)}
            title="Xem Portfolio Đầu Tư"
          >
            <IconChartPie size={16} />
          </ActionIcon>
          <ActionIcon
            size="sm"
            variant="light"
            color="red"
            onClick={() => handleDelete(customer._id)}
            title="Xóa"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Flex>
        </Table.Td>
      </Table.Tr>
  ));

  useEffect(() => {
    getCustomers();
  }, []);

  const isLoading = loading || mutationLoading;

  return (
      <>
      <div className="relative" style={{ margin: 0, padding: 0 }}>
        <LoadingOverlay visible={isLoading} />
        <Flex direction="row" justify="space-between" align="center" gap="md">
          <Title order={2} className="text-blue-500">
            Quản lý khách hàng
          </Title>
          <Group align="flex-end" gap="sm">
            <TextInput
              placeholder="Tìm kiếm: tên, MST, email, SĐT, địa chỉ..."
              leftSection={<IconSearch size={14} />}
              rightSection={searchQuery ? (
                <ActionIcon size="sm" variant="subtle" onClick={() => setSearchQuery("")}>
                  <IconX size={14} />
                </ActionIcon>
              ) : null}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="sm"
              style={{ minWidth: 260 }}
            />
            <ExportButton
              filename={`customers_${Date.now()}`}
              rows={filteredCustomers.map(c => ({
                MST: getTax(c),
                TenKhachHang: c.name,
                DiaChi: c.address,
                SDT: getPhone(c),
                Email: c.email,
                GhiChu: c.notes || ""
              }))}
              size="sm"
            />
          {isMobile ? (
            <ActionIcon
              variant="outline"
              size="lg"
              aria-label="Create"
              onClick={() => {
                setEditingCustomer(null);
                open();
              }}
            >
              <IconPlus />
            </ActionIcon>
          ) : (
            <Button 
              leftSection={<IconPlus />} 
              variant="outline" 
              onClick={() => {
                setEditingCustomer(null);
                open();
              }}
            >
              Tạo mới
            </Button>
          )}
          </Group>
        </Flex>

        <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
              <Table.Th>Mã số thuế</Table.Th>
              <Table.Th>Tên khách hàng</Table.Th>
              <Table.Th>Địa chỉ</Table.Th>
              <Table.Th>Số điện thoại</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Ghi chú</Table.Th>
              <Table.Th>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>

        {filteredCustomers?.length === 0 && (
          <Text ta="center" py="xl" c="dimmed">
            {searchQuery ? "Không tìm thấy khách hàng phù hợp" : "Không có dữ liệu khách hàng"}
          </Text>
        )}
      </div>
      
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          <Text c="blue" fw={700} size="lg">
            {editingCustomer ? "Sửa khách hàng" : "Tạo khách hàng mới"}
          </Text>
        }
        fullScreen={!!isMobile}
        size="xl"
        styles={{
          body: { padding: '0', width: '100%' },
          content: { width: '100%', maxWidth: '100%' },
          inner: { padding: '0', width: '100%' },
          title: { width: '100%' }
        }}
      >
        <CustomerForm
          initialValues={editingCustomer}
          onSubmit={handleSubmit}
          loading={mutationLoading}
        />
      </Modal>

      <Modal
        opened={detailOpened}
        onClose={() => {
          closeDetail();
          setDetailCustomer(null);
        }}
        title={
          <Text c="blue" fw={700} size="lg">
            Chi tiết khách hàng
          </Text>
        }
        size="md"
      >
        {detailCustomer && (
          <div className="space-y-4">
            <div>
              <Text className="text-gray-600" size="sm">Mã số thuế:</Text>
              <Text fw={700}>{getTax(detailCustomer)}</Text>
            </div>
            <div>
              <Text className="text-gray-600" size="sm">Tên khách hàng:</Text>
              <Text fw={700}>{detailCustomer.name}</Text>
            </div>
            <div>
              <Text className="text-gray-600" size="sm">Địa chỉ:</Text>
              <Text fw={700}>{detailCustomer.address}</Text>
            </div>
            <div>
              <Text className="text-gray-600" size="sm">Số điện thoại:</Text>
              <Text fw={700}>{getPhone(detailCustomer)}</Text>
            </div>
            <div>
              <Text className="text-gray-600" size="sm">Email:</Text>
              <Text fw={700}>{detailCustomer.email}</Text>
            </div>
            <div>
              <Text className="text-gray-600" size="sm">Ghi chú:</Text>
              <Text fw={700} c={detailCustomer.notes ? "dark" : "dimmed"}>
                {detailCustomer.notes || "Không có ghi chú"}
              </Text>
            </div>
          </div>
        )}
      </Modal>
      </>
  );
};

export default CustomersPage;
