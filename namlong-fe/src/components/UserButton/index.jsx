/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import { forwardRef, useState, useEffect } from "react";
import {
  Group,
  Avatar,
  Text,
  Menu,
  UnstyledButton,
  Modal,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Select,
  Divider,
  Badge,
} from "@mantine/core";
import {
  IconChevronRight,
  IconUser,
  IconKey,
  IconLogout,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { notifications } from "@mantine/notifications";
import { useAuth } from "../../contexts/AuthContext";
import { DEPARTMENTS, ROLES, BANKS, GENDERS, getDepartmentLabel, getRoleLabel } from "../../constants/formOptions";

const UserButton = forwardRef(({ ...others }, ref) => {
  const { currentUser } = useAuth();
  
  return (
    <UnstyledButton
      ref={ref}
      style={{
        padding: "var(--mantine-spacing-md)",
        color: "var(--mantine-color-text)",
        borderRadius: "var(--mantine-radius-sm)",
      }}
      {...others}
    >
      <Group>
        <Avatar src={currentUser?.avatar} radius="xl" />
        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {currentUser?.fullName || "Đang tải..."}
          </Text>
          <Text c="dimmed" size="xs">
            {currentUser?.email || ""}
          </Text>
        </div>
        <IconChevronRight size={16} />
      </Group>
    </UnstyledButton>
  )
});

function UserButtonMenu() {
  const { push } = useRouter();
  const { currentUser, logout, updateUser } = useAuth();
  const [changePwdOpened, setChangePwdOpened] = useState(false);
  const [profileOpened, setProfileOpened] = useState(false);

  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [profileForm, setProfileForm] = useState({ 
    fullName: "", 
    phone: "", 
    email: "",
    birthDate: "",
    gender: "",
    idNumber: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bankAccount: "",
    bankName: "",
    notes: "",
    department: "",
    position: "",
    role: "",
  });

  // Load current user data when profile modal opens
  useEffect(() => {
    if (profileOpened && currentUser) {
      setProfileForm({
        fullName: currentUser.fullName || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        birthDate: currentUser.birthDate || "",
        gender: currentUser.gender || "",
        idNumber: currentUser.idNumber || "",
        address: currentUser.address || "",
        emergencyContact: currentUser.emergencyContact || "",
        emergencyPhone: currentUser.emergencyPhone || "",
        bankAccount: currentUser.bankAccount || "",
        bankName: currentUser.bankName || "",
        notes: currentUser.notes || "",
        department: currentUser.department || "",
        position: currentUser.position || "",
        role: currentUser.role || "",
      });
    }
  }, [profileOpened, currentUser]);

  const handleLogout = () => {
    logout();
    Cookies.remove("token");
    push("/admin");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    
    if (pwdForm.next !== pwdForm.confirm) {
      notifications.show({
        title: "Lỗi",
        message: "Mật khẩu xác nhận không khớp",
        color: "red",
      });
      return;
    }

    if (pwdForm.next.length < 6) {
      notifications.show({
        title: "Lỗi", 
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        color: "red",
      });
      return;
    }

    // Simulate password change
    notifications.show({
      title: "Thành công",
      message: "Đổi mật khẩu thành công",
      color: "green",
    });

    setPwdForm({ current: "", next: "", confirm: "" });
    setChangePwdOpened(false);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    
    // Update user profile
    updateUser(profileForm);
    
    // Notify HR about profile update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("profile:updated", {
        detail: {
          userId: currentUser.id,
          userName: profileForm.fullName,
          changes: profileForm,
          timestamp: new Date().toISOString(),
        }
      }));
    }

    notifications.show({
      title: "Thành công",
      message: "Cập nhật thông tin cá nhân thành công",
      color: "green",
    });

    setProfileOpened(false);
  };

  // Removed demo user switching in production

  return (
    <>
      <Menu withArrow>
        <Menu.Target>
          <UserButton />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>
            <Group gap="xs">
              <Text size="sm" fw={600}>{currentUser?.fullName}</Text>
              <Badge size="xs" color={currentUser?.role === "admin" ? "red" : "blue"}>
                {getRoleLabel(currentUser?.role)}
              </Badge>
            </Group>
          </Menu.Label>
          
          <Menu.Item
            leftSection={<IconUser size={16} />}
            onClick={() => setProfileOpened(true)}
          >
            Cập nhật thông tin
          </Menu.Item>
          
          <Menu.Item
            leftSection={<IconKey size={16} />}
            onClick={() => setChangePwdOpened(true)}
          >
            Đổi mật khẩu
          </Menu.Item>

          <Menu.Divider />
          
          <Menu.Item
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
            color="red"
          >
            Đăng xuất
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* Change Password Modal */}
      <Modal
        opened={changePwdOpened}
        onClose={() => setChangePwdOpened(false)}
        title="Đổi mật khẩu"
        centered
      >
        <form onSubmit={handleChangePassword}>
          <Stack gap="md">
            <PasswordInput
              label="Mật khẩu hiện tại"
              placeholder="Nhập mật khẩu hiện tại"
              value={pwdForm.current}
              onChange={(e) => setPwdForm(prev => ({...prev, current: e.target.value}))}
              required
            />
            
            <PasswordInput
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              value={pwdForm.next}
              onChange={(e) => setPwdForm(prev => ({...prev, next: e.target.value}))}
              required
            />
            
            <PasswordInput
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              value={pwdForm.confirm}
              onChange={(e) => setPwdForm(prev => ({...prev, confirm: e.target.value}))}
              required
            />

            <Group justify="flex-end" gap="md">
              <Button variant="outline" onClick={() => setChangePwdOpened(false)}>
                Hủy
              </Button>
              <Button type="submit">
                Đổi mật khẩu
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Update Profile Modal */}
      <Modal
        opened={profileOpened}
        onClose={() => setProfileOpened(false)}
        title="Cập nhật thông tin cá nhân"
        centered
        size="lg"
      >
        <form onSubmit={handleUpdateProfile}>
          <Stack gap="md">
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              Thông tin hiện có sẽ được hiển thị. Bạn cần xóa và nhập lại để thay đổi.
            </Alert>

            <Group grow>
              <TextInput
                label="Họ và tên"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm(prev => ({...prev, fullName: e.target.value}))}
                required
              />
              <TextInput
                label="Số điện thoại"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({...prev, phone: e.target.value}))}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({...prev, email: e.target.value}))}
              />
              <TextInput
                label="Ngày sinh"
                value={profileForm.birthDate}
                onChange={(e) => setProfileForm(prev => ({...prev, birthDate: e.target.value}))}
                placeholder="dd/mm/yyyy"
              />
            </Group>

            <Group grow>
              <Select
                label="Giới tính"
                data={GENDERS}
                value={profileForm.gender}
                onChange={(value) => setProfileForm(prev => ({...prev, gender: value}))}
              />
              <TextInput
                label="Số CCCD"
                value={profileForm.idNumber}
                onChange={(e) => setProfileForm(prev => ({...prev, idNumber: e.target.value}))}
                placeholder="123456789012"
              />
            </Group>

            <TextInput
              label="Địa chỉ"
              value={profileForm.address}
              onChange={(e) => setProfileForm(prev => ({...prev, address: e.target.value}))}
            />

            <Group grow>
              <TextInput
                label="Người liên hệ khẩn cấp"
                value={profileForm.emergencyContact}
                onChange={(e) => setProfileForm(prev => ({...prev, emergencyContact: e.target.value}))}
              />
              <TextInput
                label="SĐT liên hệ khẩn cấp"
                value={profileForm.emergencyPhone}
                onChange={(e) => setProfileForm(prev => ({...prev, emergencyPhone: e.target.value}))}
              />
            </Group>

            <Group grow>
              <TextInput
                label="Số tài khoản ngân hàng"
                value={profileForm.bankAccount}
                onChange={(e) => setProfileForm(prev => ({...prev, bankAccount: e.target.value}))}
              />
              <Select
                label="Ngân hàng"
                data={BANKS}
                value={profileForm.bankName}
                onChange={(value) => setProfileForm(prev => ({...prev, bankName: value}))}
                searchable
              />
            </Group>

            <Divider label="Thông tin công việc (chỉ đọc)" />
            
            <Group grow>
              <TextInput
                label="Phòng ban"
                value={getDepartmentLabel(profileForm.department)}
                readOnly
                styles={{ input: { backgroundColor: '#f8f9fa' } }}
              />
              <TextInput
                label="Chức vụ"
                value={profileForm.position}
                readOnly
                styles={{ input: { backgroundColor: '#f8f9fa' } }}
              />
            </Group>

            <TextInput
              label="Vai trò"
              value={getRoleLabel(profileForm.role)}
              readOnly
              styles={{ input: { backgroundColor: '#f8f9fa' } }}
            />

            <Group justify="flex-end" gap="md">
              <Button variant="outline" onClick={() => setProfileOpened(false)}>
                Hủy
              </Button>
              <Button type="submit">
                Cập nhật thông tin
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Demo user switching removed */}
    </>
  );
}

export default UserButtonMenu;
