/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState } from "react";
import {
  Modal,
  Card,
  Text,
  Title,
  Group,
  Button,
  Stack,
  Textarea,
  Badge,
  Paper,
  Divider,
  Alert,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Timeline,
} from "@mantine/core";
import {
  IconNotes,
  IconPlus,
  IconX,
  IconInfoCircle,
  IconClock,
  IconUser,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

const InvestmentNotes = ({ opened, onClose, investment, onUpdateInvestment }) => {
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!investment) return null;

  const notes = investment.notes || [];
  const history = investment.history || [];

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      id: `note_${Date.now()}`,
      content: newNote.trim(),
      createdAt: new Date().toLocaleString('vi-VN'),
      type: 'note'
    };

    const updatedInvestment = {
      ...investment,
      notes: [...notes, note],
      history: [...history, {
        id: `history_${Date.now()}`,
        action: 'Thêm ghi chú',
        details: `Đã thêm ghi chú: "${newNote.trim().substring(0, 50)}${newNote.trim().length > 50 ? '...' : ''}"`,
        timestamp: new Date().toLocaleString('vi-VN')
      }]
    };

    onUpdateInvestment(updatedInvestment);
    setNewNote("");
    setIsAddingNote(false);
  };

  const handleDeleteNote = (noteId) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    const updatedNotes = notes.filter(n => n.id !== noteId);
    
    const updatedInvestment = {
      ...investment,
      notes: updatedNotes,
      history: [...history, {
        id: `history_${Date.now()}`,
        action: 'Xóa ghi chú',
        details: `Đã xóa ghi chú: "${noteToDelete?.content?.substring(0, 50) || 'N/A'}${(noteToDelete?.content?.length || 0) > 50 ? '...' : ''}"`,
        timestamp: new Date().toLocaleString('vi-VN')
      }]
    };

    onUpdateInvestment(updatedInvestment);
  };

  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? new Intl.NumberFormat('vi-VN').format(num) : '0';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconNotes size="1.2rem" />
          <Text size="lg" weight={600}>Ghi Chú & Lịch Sử</Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack spacing="md">
        {/* Investment Summary */}
        <Card withBorder p="md" bg="gray.0">
          <Group justify="space-between" mb="xs">
            <Text weight={600} size="lg">{investment.projectName || investment.name}</Text>
            <Badge color="blue" variant="light">
              {investment.category === 'real_estate' ? 'Bất động sản' :
               investment.category === 'manufacturing' ? 'Sản xuất' :
               investment.category === 'retail' ? 'Bán lẻ' :
               investment.category === 'technology' ? 'Công nghệ' :
               investment.category}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="xs">{investment.description}</Text>
          <Group gap="xl">
            <div>
              <Text size="xs" c="dimmed">Vốn đầu tư</Text>
              <Text weight={500}>{formatCurrency(investment.initialInvestment)} VNĐ</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Tạo ngày</Text>
              <Text weight={500}>{investment.createdDate}</Text>
            </div>
          </Group>
        </Card>

        <Divider />

        {/* Add New Note */}
        <div>
          <Group justify="space-between" mb="md">
            <Title order={4}>Ghi Chú</Title>
            {!isAddingNote && (
              <Button
                size="xs"
                leftSection={<IconPlus size="0.8rem" />}
                onClick={() => setIsAddingNote(true)}
              >
                Thêm ghi chú
              </Button>
            )}
          </Group>

          {isAddingNote && (
            <Card withBorder p="md" mb="md">
              <Stack spacing="sm">
                <Textarea
                  placeholder="Nhập ghi chú của bạn về phương án đầu tư này..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  minRows={3}
                  maxRows={6}
                />
                <Group justify="flex-end">
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => {
                      setIsAddingNote(false);
                      setNewNote("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="xs"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    Lưu ghi chú
                  </Button>
                </Group>
              </Stack>
            </Card>
          )}

          {/* Notes List */}
          <ScrollArea h={200}>
            <Stack spacing="sm">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <Card key={note.id} withBorder p="sm">
                    <Group justify="space-between" mb="xs">
                      <Group gap="xs">
                        <IconUser size="0.8rem" />
                        <Text size="xs" c="dimmed">Admin</Text>
                        <Text size="xs" c="dimmed">•</Text>
                        <Text size="xs" c="dimmed">{note.createdAt}</Text>
                      </Group>
                      <Tooltip label="Xóa ghi chú">
                        <ActionIcon
                          size="sm"
                          color="red"
                          variant="light"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <IconTrash size="0.7rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <Text size="sm">{note.content}</Text>
                  </Card>
                ))
              ) : (
                <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
                  Chưa có ghi chú nào. Thêm ghi chú đầu tiên để theo dõi quá trình quyết định đầu tư.
                </Alert>
              )}
            </Stack>
          </ScrollArea>
        </div>

        <Divider />

        {/* History Timeline */}
        <div>
          <Title order={4} mb="md">Lịch Sử Thay Đổi</Title>
          
          <ScrollArea h={150}>
            {history.length > 0 ? (
              <Timeline>
                {history.map((item) => (
                  <Timeline.Item
                    key={item.id}
                    bullet={<IconClock size="0.8rem" />}
                    title={item.action}
                  >
                    <Text size="xs" c="dimmed" mb="xs">{item.timestamp}</Text>
                    <Text size="sm">{item.details}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Alert icon={<IconInfoCircle size="1rem" />} color="gray">
                Lịch sử thay đổi sẽ được ghi lại tự động khi bạn chỉnh sửa phương án đầu tư.
              </Alert>
            )}
          </ScrollArea>
        </div>

        <Divider />

        {/* Action Buttons */}
        <Group justify="flex-end">
          <Button 
            variant="light" 
            leftSection={<IconX size="1rem" />}
            onClick={onClose}
          >
            Đóng
          </Button>
        </Group>

        <Alert icon={<IconInfoCircle size="1rem" />} color="gray">
          <Text size="sm">
            Ghi chú và lịch sử giúp bạn theo dõi quá trình ra quyết định đầu tư và lưu lại những thông tin quan trọng.
          </Text>
        </Alert>
      </Stack>
    </Modal>
  );
};

export default InvestmentNotes; 