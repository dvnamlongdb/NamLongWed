/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Alert, Group, Badge, Divider, Text } from "@mantine/core";
import { IconUser, IconKey, IconLogin, IconInfoCircle, IconShield } from "@tabler/icons-react";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { notifications } from "@mantine/notifications";

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [user, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const finish = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      await login(user, pass);
      notifications.show({
        title: "Đăng nhập thành công",
        message: "Chào mừng bạn quay trở lại!",
        color: "green",
      });
      
      // Redirect based on role
      router.push("/admin/projects");
    } catch (error) {
      notifications.show({
        title: "Đăng nhập thất bại",
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Chỉ sử dụng tài khoản admin mặc định
  const adminAccount = {
    username: "admin",
    role: "Quản trị viên",
    description: "Tài khoản quản trị viên mặc định",
    color: "red",
    permissions: "Toàn quyền"
  };

  const handleAdminLogin = () => {
    setUsername("admin");
    setPass("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Container size="sm">
        <Paper shadow="xl" p="xl" radius="md" withBorder>
          <div className="text-center mb-8">
            <Group justify="center" mb="md">
              <IconShield size={32} color="var(--mantine-color-blue-6)" />
              <Title order={2} c="blue">Hệ thống quản lý Nam Long</Title>
            </Group>
            <Text c="dimmed">Đăng nhập để truy cập hệ thống</Text>
          </div>

          <form onSubmit={finish}>
            <Stack gap="md">
              <TextInput
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                value={user}
                onChange={(e) => setUsername(e.target.value)}
                leftSection={<IconUser size={16} />}
                required
              />

              <PasswordInput
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                leftSection={<IconKey size={16} />}
                required
              />

              <Button
                type="submit"
                fullWidth
                leftSection={<IconLogin size={16} />}
                loading={loading}
                size="md"
              >
                Đăng nhập
              </Button>
            </Stack>
          </form>

          <Divider label="Tài khoản mặc định" my="xl" />

          <Alert icon={<IconInfoCircle size={16} />} color="blue" mb="md">
            <Text size="sm">
              <strong>Admin:</strong> Sử dụng tài khoản admin mặc định để đăng nhập và quản lý hệ thống.
            </Text>
          </Alert>

          <Paper
            p="sm"
            withBorder
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleAdminLogin}
          >
            <Group justify="space-between">
              <div>
                <Group gap="xs" mb="xs">
                  <Badge color={adminAccount.color} size="sm">
                    {adminAccount.role}
                  </Badge>
                  <Text size="sm" fw={500}>
                    {adminAccount.username}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  {adminAccount.description}
                </Text>
              </div>
              <Text size="xs" c="dimmed">
                {adminAccount.permissions}
              </Text>
            </Group>
          </Paper>

          <Alert color="green" mt="md">
            <Text size="xs">
              <strong>Thông tin đăng nhập:</strong> Username: <code>admin</code> | Password: <code>admin123</code>
            </Text>
          </Alert>
        </Paper>
      </Container>
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
};

export default App;
