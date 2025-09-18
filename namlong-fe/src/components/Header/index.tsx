/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import { Title, Group, Text } from "@mantine/core";
import { IconPhone, IconMail } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window?.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window?.addEventListener("scroll", handleScroll);
    return () => window?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 bg-[#153e6d] px-6 py-4 z-50 shadow-md">
      {/* Top info bar */}
      <div className="hidden md:flex justify-end items-center gap-6 pb-2 border-b border-blue-400 border-opacity-30 mb-3">
        <Group gap="xs">
          <IconPhone size={16} className="text-blue-300" />
          <Text size="sm" className="text-white">0913.176.858</Text>
        </Group>
        <Group gap="xs">
          <IconMail size={16} className="text-blue-300" />
          <Text size="sm" className="text-white">giaoducnamlong@gmail.com</Text>
        </Group>
      </div>

      {/* Main header */}
      <div className="flex items-center justify-between">
        <Group gap="md">
          <Link href={"/"}>
            <Image src="/logo.png" width={64} height={64} alt="Logo" />
          </Link>
          <div className="hidden lg:block">
            <Title order={3} className="text-white">GIÁO DỤC NAM LONG</Title>
            <Text size="sm" className="text-blue-300">Trung tâm đào tạo tin học quốc tế</Text>
          </div>
        </Group>

        <nav className="flex gap-8">
          <Link href={"/"}>
            <Title className="text-blue-300 hover:text-white transition-colors" order={4}>
              Trang chủ
            </Title>
          </Link>

          <Title
            className="cursor-pointer text-white hover:text-blue-300 transition-colors"
            order={4}
            onClick={() => {
              window?.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }}
          >
            Liên hệ
          </Title>
        </nav>
      </div>
    </header>
  );
};

export default Header; 