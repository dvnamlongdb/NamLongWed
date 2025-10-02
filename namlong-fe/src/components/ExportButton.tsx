/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
import React from "react";
import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

export type ExportButtonProps = {
  filename: string; // without extension
  rows: any[]; // array of objects
  disabled?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
};

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing && (existing as any)._loaded) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      (script as any)._loaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function ensureHtmlDocx(): Promise<any> {
  const cdn = "https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.js";
  await loadScript(cdn);
  const w = window as any;
  if (!w.htmlDocx || !w.htmlDocx.asBlob) throw new Error("html-docx-js not available");
  return w.htmlDocx;
}

function buildHiddenTable(headers: string[], rows: any[]): HTMLDivElement {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "0";
  const style = document.createElement("style");
  style.textContent = `
    .doc-root { font-family: Arial, Helvetica, sans-serif; font-size: 12pt; color: #212529; }
    .doc-title { font-size: 14pt; font-weight: 700; margin-bottom: 12px; }
    .doc-table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    .doc-table th, .doc-table td { border: 1px solid #adb5bd; padding: 6pt 8pt; text-align: left; word-wrap: break-word; }
    .doc-table th { background: #f1f3f5; font-weight: 700; }
    @page { size: A4 landscape; margin: 20mm; }
  `;
  container.appendChild(style);

  const root = document.createElement("div");
  root.className = "doc-root";

  const title = document.createElement("div");
  title.className = "doc-title";
  title.textContent = "Danh sách";
  root.appendChild(title);

  const table = document.createElement("table");
  table.className = "doc-table";
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  headers.forEach(h => { const th = document.createElement("th"); th.textContent = h; trh.appendChild(th); });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(r => {
    const tr = document.createElement("tr");
    headers.forEach(h => { const td = document.createElement("td"); td.textContent = String(r[h] ?? ""); tr.appendChild(td); });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  root.appendChild(table);
  container.appendChild(root);
  document.body.appendChild(container);
  return container;
}

async function exportToDocx(filename: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const htmlDocx = await ensureHtmlDocx();

  const host = buildHiddenTable(headers, rows);
  try {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>${host.innerHTML}</body></html>`;
    const blob = htmlDocx.asBlob(html);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } finally {
    host.remove();
  }
}

export default function ExportButton({ filename, rows, disabled, size = "sm" }: ExportButtonProps) {
  return (
    <Button
      variant="light"
      leftSection={<IconDownload size={16} />}
      onClick={() => exportToDocx(filename, rows)}
      disabled={disabled || !rows || rows.length === 0}
      size={size}
    >
      Xuất DOC
    </Button>
  );
} 