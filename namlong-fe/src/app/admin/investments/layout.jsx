/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import { LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";

export default function RootLayout({ children }) {
  return <Suspense fallback={<LoadingOverlay visible />}>{children}</Suspense>;
}
