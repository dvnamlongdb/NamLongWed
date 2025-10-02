/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Container, Alert, Button, Text, Title, Stack, Group, Badge } from '@mantine/core';
import { IconShield, IconLock, IconArrowLeft, IconUser } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess, NAVIGATION_PERMISSIONS, getRoleLabel, getDepartmentLabel } from '../../constants/formOptions';

export default function PermissionGuard({ children }) {
  const { currentUser, userRole, userDepartment, userPosition, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading && currentUser) {
      // If user lands exactly on /admin, redirect to first accessible page
      if (pathname === '/admin') {
        const accessiblePages = [
          '/admin/projects',
          '/admin/notifications',
          '/admin/customers',
          '/admin/staff',
          '/admin/invoices',
        ];
        for (const page of accessiblePages) {
          if (canAccess(userRole, userDepartment, page, userPosition)) {
            router.replace(page);
            return;
          }
        }
      }

      const access = canAccess(userRole, userDepartment, pathname, userPosition);
      setHasAccess(access);
      
      // If no access and trying to access a protected route, redirect to allowed page
      if (!access && pathname.startsWith('/admin/') && pathname !== '/admin') {
        // Find first accessible page for redirect
        const accessiblePages = [
          '/admin/projects', // Everyone can access
          '/admin/notifications', // Everyone can access  
          '/admin/customers', // Most roles can access
          '/admin/staff', // HR and directors
          '/admin/invoices', // Accounting
        ];
        
        for (const page of accessiblePages) {
          if (canAccess(userRole, userDepartment, page, userPosition)) {
            router.replace(page);
            return;
          }
        }
        
        // If no accessible page found, show access denied
        setHasAccess(false);
      }
    }
  }, [currentUser, userRole, userDepartment, userPosition, pathname, isLoading, router]);

  // Show loading while checking permissions
  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <div className="text-center">
          <Text c="dimmed">Đang kiểm tra quyền truy cập...</Text>
        </div>
      </Container>
    );
  }

  // Allow login page at /admin to render without authentication
  if (pathname === '/admin') {
    return children;
  }

  // User not logged in
  if (!currentUser) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" icon={<IconLock size={16} />}>
          Vui lòng đăng nhập để truy cập trang này.
        </Alert>
      </Container>
    );
  }

  // User has access - render children
  if (hasAccess) {
    return children;
  }

  // Access denied page
  const pathPermissions = NAVIGATION_PERMISSIONS[pathname];

  return (
    <Container size="md" py="xl">
      <Stack gap="xl" align="center">
        <div className="text-center">
          <IconShield size={64} color="red" style={{ margin: '0 auto' }} />
        </div>
        
        <div className="text-center">
          <Title order={2} c="red" mb="md">
            Không có quyền truy cập
          </Title>
          
          <Text size="lg" c="dimmed" mb="md">
            Bạn không có quyền truy cập vào trang này
          </Text>

          <Group justify="center" gap="md" mb="xl">
            <Group gap="xs">
              <IconUser size={16} />
              <Text size="sm">
                <strong>{currentUser.fullName}</strong>
              </Text>
            </Group>
            <Badge color="blue">{getRoleLabel(userRole)}</Badge>
            <Badge color="green">{getDepartmentLabel(userDepartment)}</Badge>
          </Group>

          {pathPermissions && (
            <Alert color="yellow" mb="xl">
              <Title order={5} mb="xs">Yêu cầu quyền truy cập:</Title>
              <Text size="sm" mb="xs">
                <strong>Vai trò:</strong> {pathPermissions.roles.map(role => getRoleLabel(role)).join(', ')}
              </Text>
              <Text size="sm" mb="xs">
                <strong>Phòng ban:</strong> {
                  pathPermissions.departments.includes('all') 
                    ? 'Tất cả phòng ban' 
                    : pathPermissions.departments.map(dept => getDepartmentLabel(dept)).join(', ')
                }
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                {pathPermissions.description}
              </Text>
            </Alert>
          )}
        </div>

        <Group gap="md">
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.back()}
            variant="outline"
          >
            Quay lại
          </Button>
          
          <Button 
            onClick={() => {
              // Find first accessible page
              const accessiblePages = [
                '/admin/projects',
                '/admin/notifications',
                '/admin/customers',
                '/admin/staff',
                '/admin/invoices',
              ];
              
              for (const page of accessiblePages) {
                if (canAccess(userRole, userDepartment, page, userPosition)) {
                  router.push(page);
                  return;
                }
              }
              
              router.push('/admin');
            }}
          >
            Về trang chủ
          </Button>
        </Group>

        <Alert color="blue" variant="light">
          <Text size="sm">
            <strong>Cần hỗ trợ?</strong> Liên hệ với quản trị viên để được cấp quyền truy cập phù hợp.
          </Text>
        </Alert>
      </Stack>
    </Container>
  );
} 