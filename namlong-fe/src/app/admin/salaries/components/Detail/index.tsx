/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import {
  Text,
  Grid,
  NumberFormatter,
  Badge,
  Card,
  Divider,
  Group,
  Stack,
  Avatar,
  ActionIcon,
  Tooltip,
  CopyButton,
} from "@mantine/core";
import {
  IconUser,
  IconCalendar,
  IconCash,
  IconPlus,
  IconMinus,
  IconCheck,
  IconCopy,
} from "@tabler/icons-react";
import dayjs from "dayjs";

export default function SalaryDetail({ data, staff }) {
  const {
    month,
    basicSalary,
    allowances,
    deductions,
    netSalary,
    notes,
    overtimeHours,
    overtimeRate,
    bonus,
    // Detailed allowances
    transportAllowance,
    mealAllowance,
    phoneAllowance,
    performanceBonus,
    holidayBonus,
    otherAllowances,
    insurance,
    tax,
  } = data;

  const salaryDate = dayjs(month);
  const overtimePay = (overtimeHours || 0) * (overtimeRate || 0);

  return (
    <div className="space-y-6">
      {/* Header - Staff Info */}
      <Card withBorder radius="md" p="lg">
        <Group>
          <Avatar size="lg" color="blue">
            <IconUser size={30} />
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text size="xl" fw={700} c="blue">
              {staff?.name || "N/A"}
            </Text>
            <Group gap="xs" mt="xs">
              <Badge color="gray" variant="light">
                {staff?.staff_code || "N/A"}
              </Badge>
              <Badge color="blue" variant="light">
                {staff?.position || "N/A"}
              </Badge>
              <Badge color="green" variant="light">
                <IconCalendar size={12} style={{ marginRight: 4 }} />
                {salaryDate.format("MM/YYYY")}
              </Badge>
            </Group>
          </div>
        </Group>
      </Card>

      {/* Salary Breakdown */}
      <Card withBorder radius="md" p="lg">
        <Text size="lg" fw={600} mb="md" c="blue">
          📊 Chi Tiết Lương
        </Text>

        <Grid>
          {/* Basic Salary */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Lương cơ bản
            </Text>
            <Text fw={600} size="lg">
              <NumberFormatter
                value={basicSalary}
                thousandSeparator=","
                suffix=" VNĐ"
              />
            </Text>
          </Grid.Col>

          {/* Bonus */}
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed" mb="xs">
              Thưởng
            </Text>
            <Text fw={500} c="green">
              <NumberFormatter
                value={bonus || 0}
                thousandSeparator=","
                suffix=" VNĐ"
              />
            </Text>
          </Grid.Col>

          {/* Overtime */}
          {overtimeHours > 0 && (
            <>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed" mb="xs">
                  Giờ làm thêm
                </Text>
                <Text fw={500}>
                  {overtimeHours} giờ
                </Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed" mb="xs">
                  Đơn giá OT
                </Text>
                <Text fw={500}>
                  <NumberFormatter
                    value={overtimeRate || 0}
                    thousandSeparator=","
                    suffix=" VNĐ/giờ"
                  />
                </Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" c="dimmed" mb="xs">
                  Tiền làm thêm
                </Text>
                <Text fw={500} c="green">
                  <NumberFormatter
                    value={overtimePay}
                    thousandSeparator=","
                    suffix=" VNĐ"
                  />
                </Text>
              </Grid.Col>
            </>
          )}

          {/* Detailed Allowances */}
          {(transportAllowance > 0 || mealAllowance > 0 || phoneAllowance > 0 || performanceBonus > 0 || holidayBonus > 0 || otherAllowances > 0) && (
            <>
              <Grid.Col span={12}>
                <Divider label="Chi tiết phụ cấp" />
              </Grid.Col>

              {transportAllowance > 0 && (
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Phụ cấp di chuyển
                  </Text>
                  <Text fw={500} c="green">
                    <NumberFormatter
                      value={transportAllowance}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}

              {mealAllowance > 0 && (
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Phụ cấp ăn trưa
                  </Text>
                  <Text fw={500} c="green">
                    <NumberFormatter
                      value={mealAllowance}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}

              {phoneAllowance > 0 && (
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Phụ cấp điện thoại
                  </Text>
                  <Text fw={500} c="green">
                    <NumberFormatter
                      value={phoneAllowance}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}

              {performanceBonus > 0 && (
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Thưởng hiệu suất
                  </Text>
                  <Text fw={500} c="green">
                    <NumberFormatter
                      value={performanceBonus}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}

              {holidayBonus > 0 && (
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Thưởng lễ tết
                  </Text>
                  <Text fw={500} c="green">
                    <NumberFormatter
                      value={holidayBonus}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}

              {otherAllowances > 0 && (
                <Grid.Col span={4}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Phụ cấp khác
                  </Text>
                  <Text fw={500} c="green">
                    <NumberFormatter
                      value={otherAllowances}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}
            </>
          )}
        </Grid>

        <Divider my="md" />

        {/* Allowances & Deductions */}
        <Grid>
          <Grid.Col span={6}>
            <Card bg="green.0" p="md">
              <Group gap="xs" mb="xs">
                <IconPlus size={16} color="green" />
                <Text fw={600} c="green">
                  Tổng phụ cấp
                </Text>
              </Group>
              <Text size="xl" fw={700} c="green">
                <NumberFormatter
                  value={allowances}
                  thousandSeparator=","
                  suffix=" VNĐ"
                />
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card bg="red.0" p="md">
              <Group gap="xs" mb="xs">
                <IconMinus size={16} color="red" />
                <Text fw={600} c="red">
                  Tổng khấu trừ
                </Text>
              </Group>
              <Text size="xl" fw={700} c="red">
                <NumberFormatter
                  value={deductions}
                  thousandSeparator=","
                  suffix=" VNĐ"
                />
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Deduction Details */}
        {(insurance > 0 || tax > 0) && (
          <>
            <Divider my="md" label="Chi tiết khấu trừ" />
            <Grid>
              {insurance > 0 && (
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Bảo hiểm
                  </Text>
                  <Text fw={500} c="red">
                    <NumberFormatter
                      value={insurance}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}
              {tax > 0 && (
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Thuế TNCN
                  </Text>
                  <Text fw={500} c="red">
                    <NumberFormatter
                      value={tax}
                      thousandSeparator=","
                      suffix=" VNĐ"
                    />
                  </Text>
                </Grid.Col>
              )}
            </Grid>
          </>
        )}

        <Divider my="lg" />

        {/* Net Salary */}
        <Card bg="blue.0" p="lg" ta="center">
          <Group justify="center" gap="xs" mb="xs">
            <IconCash size={20} color="blue" />
            <Text fw={600} c="blue" size="lg">
              LƯƠNG THỰC NHẬN
            </Text>
          </Group>
          <Group justify="center" gap="xs">
            <Text size="2rem" fw={700} c="blue">
              <NumberFormatter
                value={netSalary}
                thousandSeparator=","
                suffix=" VNĐ"
              />
            </Text>
            <CopyButton value={netSalary.toString()}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Đã copy!' : 'Copy số tiền'}>
                  <ActionIcon 
                    color={copied ? 'teal' : 'blue'} 
                    variant="light" 
                    onClick={copy}
                    size="lg"
                  >
                    {copied ? <IconCheck size={20} /> : <IconCopy size={20} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Card>
      </Card>

      {/* Notes */}
      {notes && (
        <Card withBorder radius="md" p="lg">
          <Text size="lg" fw={600} mb="md" c="blue">
            📝 Ghi chú
          </Text>
          <Text>{notes}</Text>
        </Card>
      )}

      {/* Calculation Summary */}
      <Card withBorder radius="md" p="lg" bg="gray.0">
        <Text size="lg" fw={600} mb="md" c="blue">
          🧮 Công thức tính
        </Text>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm">Lương cơ bản:</Text>
            <Text fw={500}>
              <NumberFormatter
                value={basicSalary}
                thousandSeparator=","
                suffix=" VNĐ"
              />
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="green">+ Tổng phụ cấp:</Text>
            <Text fw={500} c="green">
              <NumberFormatter
                value={allowances}
                thousandSeparator=","
                suffix=" VNĐ"
              />
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="red">- Tổng khấu trừ:</Text>
            <Text fw={500} c="red">
              <NumberFormatter
                value={deductions}
                thousandSeparator=","
                suffix=" VNĐ"
              />
            </Text>
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text fw={600} c="blue">= Lương thực nhận:</Text>
            <Text fw={700} c="blue" size="lg">
              <NumberFormatter
                value={netSalary}
                thousandSeparator=","
                suffix=" VNĐ"
              />
            </Text>
          </Group>
        </Stack>
      </Card>
    </div>
  );
} 