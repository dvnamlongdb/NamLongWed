/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import { Text, Grid, NumberFormatter, Table } from "@mantine/core";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSalaries } from "../../../../../service/hook";

export default function Detail({ invoice, customers }) {
  const [relatedSalaries, setRelatedSalaries] = useState([]);
  const { data: salaries, getSalaries } = useSalaries();

  const {
    _id,
    invoice_number,
    customer_tax,
    customer_name,
    customer_address,
    total,
    tax,
    total_after_vat,
    refund_amount,
    expense_total,
    revenue_total,
    cash_back,
    signed_date,
    description,
    notes,
  } = invoice;

    useEffect(() => {
    getSalaries();
  }, []);

  // Filter salaries related to this invoice
  useEffect(() => {
    if (salaries && _id) {
      const filtered = salaries.filter(salary => salary.invoiceId === _id);
      setRelatedSalaries(filtered);
    }
  }, [salaries, _id]);

  return (
    <Grid gutter="xs">
      <Grid.Col span={12}>
        <Text className="text-gray-600">Số hóa đơn:</Text>
        <Text fw={700}>{invoice_number}</Text>
      </Grid.Col>

      <Grid.Col span={12}>
        <Text className="text-gray-600">Tên khách hàng:</Text>
        <Text fw={700}>{customers?.find(c => c.tax_number === customer_tax)?.name || 'N/A'}</Text>
      </Grid.Col>
      
      <Grid.Col span={12}>
        <Text className="text-gray-600">MST khách hàng:</Text>
        <Text fw={700}>{customer_tax}</Text>
      </Grid.Col>

      <Grid.Col span={12}>
        <Text className="text-gray-600">Địa chỉ khách hàng:</Text>
        <Text fw={700}>{customer_address || 'Không có thông tin'}</Text>
      </Grid.Col>
      
      <Grid.Col span={12}>
        <Text className="text-gray-600">Ngày ký:</Text>
        <Text fw={700}>{dayjs(signed_date).format("DD/MM/YYYY")}</Text>
      </Grid.Col>

      {description && (
        <Grid.Col span={12}>
          <Text className="text-gray-600">Mô tả:</Text>
          <Text fw={700}>{description}</Text>
        </Grid.Col>
      )}

      {notes && (
        <Grid.Col span={12}>
          <Text className="text-gray-600">Ghi chú:</Text>
          <Text fw={700} className="text-blue-700">{notes}</Text>
        </Grid.Col>
      )}

      <Grid.Col span={6}>
        <Text className="text-gray-600">Tổng tiền:</Text>
        <Text fw={700} className="!text-red-500">
          <NumberFormatter value={total} thousandSeparator decimalScale={2} />{" "}
          VNĐ
        </Text>
      </Grid.Col>
      
      <Grid.Col span={6}>
        <Text className="text-gray-600">Tiền thuế:</Text>
        <Text fw={700}>
          <NumberFormatter
            value={tax}
            thousandSeparator
            decimalScale={2}
          />{" "}
          VNĐ
        </Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text className="text-gray-600">Tổng tiền sau VAT:</Text>
        <Text fw={700} className="!text-blue-600">
          <NumberFormatter
            value={total_after_vat || (total * (1 + tax / 100))}
            thousandSeparator
            decimalScale={2}
          />{" "}
          VNĐ
        </Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text className="text-gray-600">
          Tiền hoàn lại ({cash_back}%):
        </Text>
        <Text fw={700} className="font-medium text-green-600">
          <NumberFormatter
            value={refund_amount || (total * cash_back) / 100}
            thousandSeparator
            decimalScale={2}
          />{" "}
          VNĐ
        </Text>
      </Grid.Col>

      <Grid.Col span={6}>
        <Text className="text-gray-600">Tổng chi phí:</Text>
        <Text fw={700} className="font-medium text-orange-600">
          <NumberFormatter
            value={expense_total}
            thousandSeparator
            decimalScale={2}
          />{" "}
          VNĐ
        </Text>
      </Grid.Col>

      <Grid.Col span={12}>
        <Text className="text-gray-600" fw={600} mt="md">Danh sách chi phí nhân viên</Text>
        
        {relatedSalaries.length > 0 ? (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
                <Table.Th>Mô tả công việc</Table.Th>
              <Table.Th>Số tiết</Table.Th>
              <Table.Th>Lương theo tiết</Table.Th>
              <Table.Th>Tổng lương</Table.Th>
                <Table.Th>Thuế TNCN (%)</Table.Th>
              <Table.Th>Tổng lương nhận</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
              {relatedSalaries.map((salary, i) => (
              <Table.Tr key={i}>
                  <Table.Td>{salary.description}</Table.Td>
                <Table.Td>
                  <NumberFormatter
                      value={salary.amount}
                    thousandSeparator
                      decimalScale={0}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberFormatter
                      value={salary.price}
                    thousandSeparator
                      decimalScale={0}
                  />{" "}
                    VNĐ
                </Table.Td>
                <Table.Td>
                  <NumberFormatter
                      value={salary.amount * salary.price}
                    thousandSeparator
                      decimalScale={0}
                  />{" "}
                    VNĐ
                </Table.Td>
                <Table.Td>
                  <NumberFormatter
                      value={salary.tax}
                    thousandSeparator
                      decimalScale={0}
                  />
                  %
                </Table.Td>
                <Table.Td>
                    <Text fw={700} c="green">
                  <NumberFormatter
                        value={salary.pay_price}
                    thousandSeparator
                        decimalScale={0}
                  />{" "}
                      VNĐ
                    </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        ) : (
          <Text c="dimmed" ta="center" py="md">
            Chưa có chi phí nhân viên cho hóa đơn này
          </Text>
        )}
      </Grid.Col>
      
      <Grid.Col className="text-right" span={12}>
        <Text className="text-gray-600">Tổng doanh thu:</Text>
        <Text fw={700} className="!text-xl !text-green-600">
          <NumberFormatter
            value={revenue_total}
            thousandSeparator
            decimalScale={2}
          />{" "}
          VNĐ
        </Text>
      </Grid.Col>
    </Grid>
  );
}
