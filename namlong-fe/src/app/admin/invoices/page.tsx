/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import InvoiceForm from "./components/Compose";
import {
  ActionIcon,
  Button,
  Combobox,
  Flex,
  Group,
  LoadingOverlay,
  Modal,
  NumberFormatter,
  Paper,
  Select,
  Space,
  Table,
  Text,
  Title,
  useCombobox,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconEye, IconEdit, IconTrash, IconSearch, IconX } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useInvoices, useInvoiceMutation, useCustomers } from "../../../service/hook";
// import Layout from "../../../components/Layout";
import { useQueryParams } from "../../../hooks/useQueryParams";
import ClientOnly from "../../../components/ClientOnly";
import dayjs from "dayjs";
import { useMediaQuery } from "@mantine/hooks";
import Detail from "./components/Detail";
import { MonthPickerInput } from "@mantine/dates";
import localizedFormat from "dayjs/plugin/localizedFormat";
import ExportButton from "../../../components/ExportButton";

export const dynamic = 'force-dynamic';

dayjs.extend(localizedFormat);

const monthsObject = [
  { value: "01", label: "Tháng 1" },
  { value: "02", label: "Tháng 2" },
  { value: "03", label: "Tháng 3" },
  { value: "04", label: "Tháng 4" },
  { value: "05", label: "Tháng 5" },
  { value: "06", label: "Tháng 6" },
  { value: "07", label: "Tháng 7" },
  { value: "08", label: "Tháng 8" },
  { value: "09", label: "Tháng 9" },
  { value: "10", label: "Tháng 10" },
  { value: "11", label: "Tháng 11" },
  { value: "12", label: "Tháng 12" },
];

const yearsObject = [
  { value: "2022", label: "2022" },
  { value: "2023", label: "2023" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
];

const shallowEqual = (a: any, b: any) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
};

const InvoicePage = () => {
  const combobox = useCombobox();
  const [opened, { open, close }] = useDisclosure(false);
  const [openedDetail, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);

  // New hooks for mock data
  const { data: invoices, loading: invoicesLoading, getInvoices } = useInvoices();
  const { data: customers, loading: customersLoading, getCustomers } = useCustomers();
  const { createInvoice, updateInvoice, deleteInvoice, loading: mutationLoading } = useInvoiceMutation();

  const [customerTax, setCustomerTax] = useState("");
  const [customersData, setCustomersData] = useState([]);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    customer: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [detailInvoice, setDetailInvoice] = useState(null);

  const [urlFilters, updateQueryParams] = useQueryParams(['month', 'year', 'customer']);

  const params = useMemo(() => {
    const searchParams = new URLSearchParams();
    Object.entries(urlFilters || {}).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    return searchParams.toString();
  }, [urlFilters]);

  const handleChangeMonth = (month) => {
    setFilters({ ...filters, month });
  };

  const handleChangeYear = (year) => {
    setFilters({ ...filters, year });
  };

  const handleChangeCustomer = (c) => {
    setCustomerTax(c);
    setFilters({ ...filters, customer: c });
  };

  // Filter invoices based on filters + search
  const filteredInvoices = useMemo(() => {
    try {
      // Đảm bảo invoices luôn là array
      let filtered = Array.isArray(invoices) ? invoices : [];
      const q = (searchQuery || "").toLowerCase().trim();
      
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.signed_date);
        const monthMatch = !filters.month || 
          (invoiceDate.getMonth() + 1).toString().padStart(2, '0') === filters.month;
        const yearMatch = !filters.year || 
          invoiceDate.getFullYear().toString() === filters.year;
        const customerMatch = !filters.customer || 
          invoice.customer_tax === filters.customer;
        const searchMatch = q === "" ||
          String(invoice.invoice_number || "").toLowerCase().includes(q) ||
          String(invoice.customer_name || "").toLowerCase().includes(q) ||
          String(invoice.customer_tax || "").toLowerCase().includes(q);
        return monthMatch && yearMatch && customerMatch && searchMatch;
      });

      return filtered.sort((a, b) => {
        // Đảm bảo createdAt tồn tại và hợp lệ
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } catch {
      console.log("Lỗi khi lọc hóa đơn");
      return [];
    }
  }, [invoices, filters, searchQuery]);

  const handleSubmit = async (values) => {
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice._id, values);
      } else {
        await createInvoice(values);
      }
      await getInvoices(); // Refresh data
      close();
      setEditingInvoice(null);
    } catch (error) {
      console.error('Error submitting invoice:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) {
      try {
        await deleteInvoice(id);
        await getInvoices(); // Refresh data
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    open();
  };

  const handleDetail = (invoice) => {
    setDetailInvoice(invoice);
    openDetail();
  };

  // Load data on component mount
  useEffect(() => {
    getInvoices();
    getCustomers();
  }, []);

  // Sync URL -> local filters (avoid loops)
  useEffect(() => {
    if (urlFilters && !shallowEqual(urlFilters, filters)) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlFilters]);

  // Update URL when filters change (avoid loops by comparing current URL values)
  useEffect(() => {
    if (updateQueryParams && typeof updateQueryParams === 'function') {
      if (!shallowEqual(filters, urlFilters)) {
        updateQueryParams(filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Set customers data when loaded
  useEffect(() => {
    if (customers) {
      setCustomersData(customers);
    }
  }, [customers]);

  const isMobile = useMediaQuery("(max-width: 768px)", true, { getInitialValueInEffect: false });

  const isLoading = invoicesLoading || customersLoading || mutationLoading;

  return (
      <Suspense fallback={<div>Loading...</div>}>
      <>
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <LoadingOverlay visible={isLoading} />
        
        {/* Header & Filter Section */}
        <div style={{ 
          padding: '8px 12px',
          borderBottom: '1px solid #e9ecef',
          backgroundColor: '#fff',
          flexShrink: 0
        }}>
          {/* Title and Filters in one row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-end',
            gap: '16px',
            margin: 0
          }}>
            <Title order={2} style={{ color: '#2563eb', margin: 0 }}>
              Quản lý hóa đơn
            </Title>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'flex-end',
              flexWrap: 'wrap'
            }}>
            <TextInput
              placeholder="Tìm kiếm: số HĐ, tên KH, MST..."
              leftSection={<IconSearch size={14} />}
              rightSection={searchQuery ? (
                <ActionIcon size="sm" variant="subtle" onClick={() => setSearchQuery("")}> 
                  <IconX size={14} />
                </ActionIcon>
              ) : null}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="sm"
              style={{ minWidth: 220 }}
            />
            <Select
              label="Tháng"
              placeholder="Chọn tháng"
              data={monthsObject}
              value={filters.month}
              onChange={handleChangeMonth}
            clearable
                size="sm"
                style={{ minWidth: '120px' }}
          />
          <Select
              label="Năm"
              placeholder="Chọn năm"
              data={yearsObject}
              value={filters.year}
              onChange={handleChangeYear}
            clearable
                size="sm"
                style={{ minWidth: '100px' }}
            />
              <div style={{ minWidth: '180px' }}>
                <Text size="sm" style={{ marginBottom: '5px', fontWeight: 500 }}>
                  Khách hàng
                </Text>
            <Combobox
              store={combobox}
              onOptionSubmit={(val) => {
                handleChangeCustomer(val);
                combobox.closeDropdown();
              }}
            >
              <Combobox.Target>
                <Button
                      variant="default"
                      size="sm"
                  onClick={() => combobox.toggleDropdown()}
                      style={{ width: '100%', justifyContent: 'flex-start' }}
                >
                      {customerTax ? 
                        customersData.find(c => c.tax_number === customerTax)?.name || customerTax 
                        : "Chọn khách hàng"
                      }
                </Button>
              </Combobox.Target>
              <Combobox.Dropdown>
                <Combobox.Options>
                  {customersData.map((customer) => (
                    <Combobox.Option
                      value={customer.tax_number}
                      key={customer._id}
                    >
                          {customer.name} ({customer.tax_number})
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
              </div>
            {(filters.month || filters.year || filters.customer || searchQuery) && (
                             <Button
                  variant="light"
                  size="sm"
                  color="red"
                 onClick={() => {
                   setFilters({ month: "", year: "", customer: "" });
                   setCustomerTax("");
                   setSearchQuery("");
                 }}
               >
                Xóa bộ lọc
              </Button>
            )}
              {(
                <ExportButton
                  filename={`invoices_${Date.now()}`}
                  rows={filteredInvoices.map(inv => ({
                    SoHoaDon: inv.invoice_number,
                    KhachHang: inv.customer_name,
                    MST: inv.customer_tax,
                    TongTien: inv.total,
                    Thue: inv.tax,
                    TongSauVAT: inv.total_after_vat,
                    HoanLai: inv.refund_amount,
                    NgayKy: dayjs(inv.signed_date).format('YYYY-MM-DD'),
                  }))}
                  size="sm"
                />
              )}
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => {
                  setEditingInvoice(null);
                  open();
                }}
                size="sm"
              >
                Tạo hóa đơn
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto'
        }}>
          <Table striped highlightOnHover>
              <Table.Thead style={{ backgroundColor: '#f1f3f4' }}>
              <Table.Tr>
                <Table.Th>Số hóa đơn</Table.Th>
                <Table.Th>Khách hàng</Table.Th>
                <Table.Th>Mã số thuế</Table.Th>
                <Table.Th>Tổng tiền</Table.Th>
                <Table.Th>Thuế</Table.Th>
                <Table.Th>Tổng tiền sau VAT</Table.Th>
                <Table.Th>Hoàn lại</Table.Th>
                <Table.Th>Ngày ký</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Thao tác</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {filteredInvoices?.map((invoice) => (
                <Table.Tr key={invoice._id}>
                    <Table.Td style={{ fontWeight: 600, color: '#2563eb' }}>
                      {invoice.invoice_number}
                    </Table.Td>
                    <Table.Td>{invoice.customer_name}</Table.Td>
                    <Table.Td style={{ fontFamily: 'monospace' }}>
                      {invoice.customer_tax}
                    </Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      value={invoice.total}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Table.Td>
                    <Table.Td>{invoice.tax}%</Table.Td>
                    <Table.Td style={{ fontWeight: 600 }}>
                    <NumberFormatter
                        value={invoice.total_after_vat}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter
                        value={invoice.refund_amount}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Table.Td>
                  <Table.Td>
                      {dayjs(invoice.signed_date).format("DD/MM/YYYY")}
                  </Table.Td>
                  <Table.Td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <ActionIcon
                        size="sm"
                        variant="light"
                          color="blue"
                        onClick={() => handleDetail(invoice)}
                          title="Xem chi tiết"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                          variant="light"
                          color="yellow"
                        onClick={() => handleEdit(invoice)}
                          title="Chỉnh sửa"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        size="sm"
                          variant="light"
                        color="red"
                        onClick={() => handleDelete(invoice._id)}
                        title="Xóa"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                      </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

            {filteredInvoices?.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#6c757d'
              }}>
                <Text size="lg" style={{ marginBottom: '8px' }}>
                  Không có hóa đơn nào
                </Text>
                <Text size="sm">
                  {Object.values(filters).some(f => f) || searchQuery 
                    ? "Thử thay đổi bộ lọc để xem thêm hóa đơn"
                    : "Hãy tạo hóa đơn đầu tiên của bạn"
                  }
            </Text>
              </div>
          )}
        </div>
      </div>

      <Modal
        opened={opened}
          onClose={() => {
            close();
            setEditingInvoice(null);
          }}
          title={editingInvoice ? "Sửa hóa đơn" : "Tạo hóa đơn mới"}
        size="xl"
        styles={{
          body: { padding: '0' },
          content: { width: '100%', maxWidth: '100%' },
          inner: { padding: '0' }
        }}
      >
          <InvoiceForm
            onSubmit={handleSubmit}
            initialValues={editingInvoice}
            customers={customersData}
          />
        </Modal>

        <Modal
          opened={openedDetail}
          onClose={closeDetail}
          title="Chi tiết hóa đơn"
          size="lg"
        >
          {detailInvoice && <Detail invoice={detailInvoice} customers={customers} />}
      </Modal>
      </>
      </Suspense>
  );
};

export default InvoicePage;
