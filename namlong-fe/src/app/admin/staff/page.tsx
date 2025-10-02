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
  Group,
  TextInput,
} from "@mantine/core";
import { useStaff, useStaffMutation } from "../../../service/hook";
import Layout from "../../../components/Layout";
import StaffForm from "./components/Compose";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconPlus, IconEdit, IconTrash, IconEye, IconSearch, IconX } from "@tabler/icons-react";
import Detail from "./components/Detail";
import dayjs from "dayjs";
import ClientOnly from "../../../components/ClientOnly";
import ExportButton from "../../../components/ExportButton";

const Action = ({ onDetail, onEdit, onDelete }) => {
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
      <ActionIcon
        size="sm"
        variant="light"
        color="yellow"
        onClick={onEdit}
        title="Sửa"
      >
        <IconEdit size={16} />
      </ActionIcon>
      <ActionIcon
        size="sm"
        variant="light"
        color="red"
        onClick={onDelete}
        title="Xóa"
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  );
};

const StaffPage = () => {
  const [editingStaff, setEditingStaff] = useState(null);
  const [detailStaff, setDetailStaff] = useState(null);
  const [modalType, setModalType] = useState(""); // "form", "detail", "info"
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: staffList, loading, getStaff } = useStaff();
  const { createStaff, updateStaff, deleteStaff, loading: mutationLoading } = useStaffMutation();
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)", true, { getInitialValueInEffect: false });

  const handleClose = () => {
    close();
    setEditingStaff(null);
    setDetailStaff(null);
    setModalType("");
  };

  const handleSubmit = async (values) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff._id, values);
      } else {
        await createStaff(values);
      }
      await getStaff(); // Refresh data
      handleClose();
    } catch (error) {
      console.error('Error submitting staff:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
    try {
        await deleteStaff(id);
        await getStaff(); // Refresh data
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setModalType("form");
    open();
  };

  const handleDetail = (staff) => {
    setDetailStaff(staff);
    setModalType("detail");
    open();
  };

  // Filter staff based on search query
  const filteredStaff = useMemo(() => {
    try {
      // Đảm bảo staffList luôn là array
      let filtered = Array.isArray(staffList) ? staffList : [];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((staff) => (
          staff.staff_code?.toLowerCase().includes(query) ||
          staff.name?.toLowerCase().includes(query) ||
          staff.position?.toLowerCase().includes(query) ||
          staff.phone_number?.toLowerCase().includes(query) ||
          staff.email?.toLowerCase().includes(query) ||
          staff.address?.toLowerCase().includes(query) ||
          staff.citizen_id?.toLowerCase().includes(query) ||
          staff.bank_account?.toLowerCase().includes(query) ||
          staff.bank_name?.toLowerCase().includes(query) ||
          staff.notes?.toLowerCase().includes(query)
        ));
      }

      return filtered.sort((a, b) => {
        // Đảm bảo createdAt tồn tại và hợp lệ
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc nhân viên");
      return [];
    }
  }, [staffList, searchQuery]);

  const rows = filteredStaff?.map((staff) => (
    <Table.Tr key={staff._id}>
      <Table.Td>{staff.staff_code}</Table.Td>
      <Table.Td>{staff.name}</Table.Td>
      <Table.Td>{staff.position}</Table.Td>
      <Table.Td>{staff.phone_number}</Table.Td>
      <Table.Td>{staff.email}</Table.Td>
      <Table.Td>
        <Action
          onDetail={() => handleDetail(staff)}
          onEdit={() => handleEdit(staff)}
          onDelete={() => handleDelete(staff._id)}
        />
      </Table.Td>
    </Table.Tr>
  ));

  useEffect(() => {
    getStaff();
  }, []);

  const isLoading = loading || mutationLoading;

  const getModalTitle = () => {
    switch (modalType) {
      case "form":
        return editingStaff ? "Sửa nhân viên" : "Tạo nhân viên mới";
      case "detail":
        return "Chi tiết nhân viên";
      default:
        return "";
    }
  };

  return (
      <ClientOnly fallback={<div>Loading...</div>}>
      <>
      <div style={{ position: 'relative', margin: 5, padding: 5 }}>
          <LoadingOverlay visible={isLoading} />
        <Flex direction="row" justify="space-between" align="center">
          <Title order={2} c="blue">
              Quản lý nhân viên
          </Title>
          <Group gap="sm">
            <ExportButton
              filename={`staff_${Date.now()}`}
              rows={(filteredStaff || []).map((s: any) => ({
                MaNV: s.staff_code,
                Ten: s.name,
                ChucVu: s.position,
                PhongBan: s.department || '',
                VaiTro: s.role || '',
                SDT: s.phone_number,
                Email: s.email,
                DiaChi: s.address || ''
              }))}
            />
            {isMobile ? (
              <ActionIcon
                variant="outline"
                size="lg"
                aria-label="Create"
                onClick={() => {
                  setEditingStaff(null);
                  setModalType("form");
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
                  setEditingStaff(null);
                  setModalType("form");
                  open();
                }}
              >
            Tạo mới
          </Button>
            )}
          </Group>
        </Flex>

          {/* Search Bar */}
          <Flex direction={isMobile ? "column" : "row"} gap="md" align={isMobile ? "stretch" : "flex-end"}>
            <TextInput
              placeholder="Tìm kiếm theo tên, mã NV, chức vụ, SĐT, email..."
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
                Tìm thấy {filteredStaff?.length || 0} nhân viên
              </Text>
            )}
          </Flex>

                     <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                 <Table.Th>Mã NV</Table.Th>
                 <Table.Th>Tên nhân viên</Table.Th>
                 <Table.Th>Chức vụ</Table.Th>
                 <Table.Th>Số điện thoại</Table.Th>
                 <Table.Th>Email</Table.Th>
                 <Table.Th>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>

                     {filteredStaff?.length === 0 && (
             <Text ta="center" py="xl" c="dimmed">
               {searchQuery ? `Không tìm thấy nhân viên nào với từ khóa "${searchQuery}"` : "Không có dữ liệu nhân viên"}
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
          <StaffForm
               data={editingStaff}
            onSubmit={handleSubmit}
               loading={mutationLoading}
             />
           )}
           {modalType === "detail" && detailStaff && (
             <Detail 
               data={detailStaff}
          />
        )}
      </Modal>
      </>
      </ClientOnly>
  );
};

export default StaffPage;
