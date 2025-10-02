/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import { Text, Grid, NumberFormatter, Table, Badge, Card, Divider, Group, CopyButton, ActionIcon, Tooltip } from "@mantine/core";
import { IconCopy, IconCheck, IconPhone, IconMapPin, IconUser, IconCreditCard } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useSalaries } from "../../../../../service/hook";
import { useEffect, useState } from "react";

export default function Detail({ data }) {
  const [relatedSalaries, setRelatedSalaries] = useState([]);
  const { data: salaries, getSalaries } = useSalaries();

  const { 
    _id, 
    staff_code, 
    name, 
    position, 
    phone_number, 
    address, 
    citizen_id, 
    personal_tax_code,
    health_insurance_number,
    social_insurance_number,
    bank_account, 
    bank_name, 
    qr_code, 
    notes, 
    email, 
    date_of_birth 
  } = data;

  useEffect(() => {
    getSalaries();
  }, []);

  // Filter salaries related to this staff member
  useEffect(() => {
    if (salaries && _id) {
      const filtered = salaries.filter(salary => salary.staffId === _id);
      setRelatedSalaries(filtered);
    }
  }, [salaries, _id]);

  return (
    <div className="space-y-6">
      {/* Header thông tin cơ bản */}
      <Card withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Text size="xl" fw={700} c="blue">
              {name}
            </Text>
            <Group gap="xs" mt="xs">
              <Badge variant="light" color="blue" size="lg">
                {staff_code}
              </Badge>
              {position && (
                <Badge variant="outline" color="teal">
                  {position}
                </Badge>
              )}
            </Group>
          </div>
        </Group>

        <Divider mb="md" />

        {/* Grid thông tin chi tiết */}
        <Grid gutter="md">
          {/* Thông tin liên hệ */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              <IconPhone size={16} style={{ marginRight: 4 }} />
              Số điện thoại
            </Text>
            <Group gap="xs">
              <Text fw={500}>{phone_number}</Text>
              <CopyButton value={phone_number}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Đã copy!' : 'Copy số điện thoại'}>
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Email
            </Text>
            <Group gap="xs">
              <Text fw={500}>{email}</Text>
              <CopyButton value={email}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Đã copy!' : 'Copy email'}>
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Grid.Col>

          {/* Địa chỉ */}
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed" mb="xs">
              <IconMapPin size={16} style={{ marginRight: 4 }} />
              Địa chỉ
            </Text>
            <Text fw={500}>{address}</Text>
          </Grid.Col>

          {/* Ngày sinh */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Ngày sinh
            </Text>
            <Text fw={500}>
              {date_of_birth ? dayjs(date_of_birth).format("DD/MM/YYYY") : "Chưa cập nhật"}
            </Text>
          </Grid.Col>

          {/* CCCD */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              <IconUser size={16} style={{ marginRight: 4 }} />
              Số CCCD
          </Text>
                <Group gap="xs">
              <Text fw={500}>{citizen_id}</Text>
              <CopyButton value={citizen_id}>
                      {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Đã copy!' : 'Copy CCCD'}>
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Grid.Col>

          {/* Mã số thuế cá nhân */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Mã số thuế cá nhân
            </Text>
            <Group gap="xs">
              <Text fw={500}>{personal_tax_code || "Chưa cập nhật"}</Text>
              {personal_tax_code && (
                <CopyButton value={personal_tax_code}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Đã copy!' : 'Copy MST'}>
                      <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  )}
                </Group>
          </Grid.Col>

          {/* Số bảo hiểm y tế */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Số bảo hiểm y tế
          </Text>
              <Group gap="xs">
              <Text fw={500}>{health_insurance_number || "Chưa cập nhật"}</Text>
              {health_insurance_number && (
                <CopyButton value={health_insurance_number}>
                    {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Đã copy!' : 'Copy BHYT'}>
                      <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                )}
              </Group>
          </Grid.Col>

          {/* Số bảo hiểm xã hội */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Số bảo hiểm xã hội
        </Text>
                <Group gap="xs">
              <Text fw={500}>{social_insurance_number || "Chưa cập nhật"}</Text>
              {social_insurance_number && (
                <CopyButton value={social_insurance_number}>
                      {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Đã copy!' : 'Copy BHXH'}>
                      <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  )}
                </Group>
          </Grid.Col>

          {/* Thông tin ngân hàng */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              <IconCreditCard size={16} style={{ marginRight: 4 }} />
              Số tài khoản
            </Text>
            <Group gap="xs">
              <Text fw={500}>{bank_account}</Text>
              <CopyButton value={bank_account}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Đã copy!' : 'Copy STK'}>
                    <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Ngân hàng
            </Text>
            <Text fw={500}>{bank_name}</Text>
          </Grid.Col>

          {/* Ghi chú */}
          {notes && (
            <Grid.Col span={12}>
              <Text size="sm" c="dimmed" mb="xs">
                Ghi chú
              </Text>
              <Text fw={500}>{notes}</Text>
            </Grid.Col>
          )}
        </Grid>
      </Card>

      {/* Lịch sử lương */}
      <Card withBorder radius="md" p="lg">
        <Text size="lg" fw={700} mb="md" c="green">
          Lịch sử lương
        </Text>
        
        {relatedSalaries.length > 0 ? (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
                <Table.Th>Mô tả công việc</Table.Th>
              <Table.Th>Số tiết</Table.Th>
                <Table.Th>Đơn giá</Table.Th>
                <Table.Th>Tổng lương</Table.Th>
                <Table.Th>Thuế (%)</Table.Th>
                <Table.Th>Thực nhận</Table.Th>
                <Table.Th>Ngày</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
              {relatedSalaries.map((salary, index) => (
                <Table.Tr key={index}>
                  <Table.Td>{salary.description}</Table.Td>
                  <Table.Td>
                    <NumberFormatter value={salary.amount} thousandSeparator="," decimalScale={0} />
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter value={salary.price} thousandSeparator="," decimalScale={0} suffix=" VNĐ" />
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter
                      value={salary.amount * salary.price} 
                      thousandSeparator="," 
                      decimalScale={0} 
                      suffix=" VNĐ" 
                    />
                  </Table.Td>
                  <Table.Td>{salary.tax}%</Table.Td>
                  <Table.Td>
                    <Text fw={700} c="green">
                    <NumberFormatter
                        value={salary.pay_price} 
                        thousandSeparator="," 
                        decimalScale={0} 
                        suffix=" VNĐ" 
                      />
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {dayjs(salary.created_date).format("DD/MM/YYYY")}
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
        ) : (
          <Text ta="center" c="dimmed" py="xl">
            Chưa có lịch sử lương
          </Text>
        )}

        {/* Tổng kết */}
        {relatedSalaries.length > 0 && (
          <Card withBorder mt="md" p="md" bg="gray.0">
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Tổng số công việc:</Text>
                <Text fw={700} size="lg">{relatedSalaries.length}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" c="dimmed">Tổng thu nhập:</Text>
                <Text fw={700} size="lg" c="green">
                <NumberFormatter
                    value={relatedSalaries.reduce((sum, salary) => sum + salary.pay_price, 0)} 
                    thousandSeparator="," 
                    decimalScale={0} 
                    suffix=" VNĐ" 
                  />
              </Text>
              </Grid.Col>
            </Grid>
          </Card>
        )}
      </Card>
    </div>
  );
}
