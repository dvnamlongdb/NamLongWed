	/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { NavbarNested } from "../Navbar";
import UserButtonMenu from "../UserButton";
import { AuthProvider } from "../../contexts/AuthContext";

const HEADER_HEIGHT = 74;
const SIDEBAR_WIDTH = 325;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header cố định */}
        <header
          style={{
            height: HEADER_HEIGHT,
            borderBottom: "1px solid #e9ecef",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
          }}
        >
          <Link href="/admin/invoices">
            <Image src="/logo.png" width={50} height={50} alt="Logo" />
          </Link>
          <UserButtonMenu />
        </header>

        {/* Thân trang: Sidebar cố định bên trái + Nội dung */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <aside
            style={{
              width: SIDEBAR_WIDTH,
              borderRight: "1px solid #e9ecef",
              background: "#fff",
              overflow: "auto",
            }}
          >
            <NavbarNested />
          </aside>

          <main style={{ flex: 1, overflow: "auto", padding: 16 }}>
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
