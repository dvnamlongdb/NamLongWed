/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import { AuthProvider } from "../../contexts/AuthContext";

export default function TestPage() {
  return (
    <AuthProvider>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Test Page - Nam Long</h1>
        <p>Nếu bạn thấy trang này, nghĩa là:</p>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>✅ AuthContext hoạt động</li>
          <li>✅ React components render được</li>
          <li>✅ Build process thành công</li>
        </ul>
        <p style={{ marginTop: '20px' }}>
          <a href="/admin" style={{ color: 'blue', textDecoration: 'underline' }}>
            Về trang Admin →
          </a>
        </p>
      </div>
    </AuthProvider>
  );
} 