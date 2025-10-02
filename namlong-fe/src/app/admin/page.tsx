/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import React, { useState } from "react";
import AdminLayout from "./layout";
import { useRouter } from "next/navigation";
import { Container, Paper, Title, TextInput, PasswordInput, Button, Stack, Group, Text } from "@mantine/core";
import { IconUser, IconKey, IconLogin, IconShield } from "@tabler/icons-react";
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

  return (
    <Container size="sm" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <Paper shadow="xl" p="xl" radius="md" withBorder style={{ width: "100%" }}>
        <Stack gap="xl">
          <Group justify="center">
            <IconShield size={32} color="var(--mantine-color-blue-6)" />
            <Title order={2} c="blue">Hệ thống quản lý Nam Long</Title>
          </Group>
          <Text c="dimmed" ta="center">Đăng nhập để truy cập hệ thống</Text>

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
        </Stack>
      </Paper>
    </Container>
  );
}

const App = () => {
  return (
    <AdminLayout>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </AdminLayout>
  );
};

export default App;