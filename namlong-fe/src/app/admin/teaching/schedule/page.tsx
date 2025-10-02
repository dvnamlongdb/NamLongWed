/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { Table, Select, Group, Button, Text, Title, TextInput, Popover } from "@mantine/core";
import { useStaff } from "../../../../service/hook";
// Removed ExportButton to tránh trùng nút và chỉ giữ 1 nút PDF

const DAYS = [
  { value: "mon", label: "T2" },
  { value: "tue", label: "T3" },
  { value: "wed", label: "T4" },
  { value: "thu", label: "T5" },
  { value: "fri", label: "T6" },
  { value: "sat", label: "T7" },
];

// helpers tải jsPDF UMD qua CDN để tránh lỗi thiếu module
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing && (existing as any)._loaded) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => { (script as any)._loaded = true; resolve(); };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}
async function ensureJsPdf(): Promise<any> {
  const jsPdfCdn = "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js";
  await loadScript(jsPdfCdn);
  const w = window as any;
  if (!w.jspdf || !w.jspdf.jsPDF) throw new Error("jsPDF not available");
  return w.jspdf.jsPDF;
}
async function loadHtml2Canvas(): Promise<any> {
  const cdn = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
  await loadScript(cdn);
  const w = window as any;
  if (!w.html2canvas) throw new Error("html2canvas not available");
  return w.html2canvas;
}
async function loadAutoTable(): Promise<void> {
  const cdn = "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js";
  await loadScript(cdn);
}

type CellAssignment = {
  school?: string;      // Trường
  className?: string;   // Lớp
};

type TimeRow = { id: string; start: Date | null; end: Date | null };

// Options for teachers will be loaded from API (staff list)
const TEACHERS_DEFAULT: { value: string; label: string }[] = [];

function formatTime(d: Date | null) {
  if (!d) return "--:--";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function parseTimeToDate(value: string | null): Date | null {
  if (!value) return null;
  const [hh, mm] = value.split(":").map((x) => Number(x));
  const base = new Date();
  base.setHours(hh, mm, 0, 0);
  return base;
}

export default function TeachingSchedulePage() {
  const { data: staffList, getStaff } = useStaff();
  const [teacherOptions, setTeacherOptions] = useState<{ value: string; label: string }[]>(TEACHERS_DEFAULT);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [assignmentsByTeacher, setAssignmentsByTeacher] = useState<Record<string, Record<string, CellAssignment>>>({});
  const [rows, setRows] = useState<TimeRow[]>(Array.from({ length: 6 }).map((_, i) => ({ id: `r${i + 1}`, start: null, end: null })));
  const [timeStep, setTimeStep] = useState<number>(30); // phút: 15/30/45
  const tableRef = useRef<HTMLDivElement | null>(null);
  const hiddenTableRef = useRef<HTMLDivElement | null>(null);

  const timeOptions = useMemo(() => {
    const items: { value: string; label: string }[] = [];
    // Khung giờ 06:00 - 22:00, bước theo timeStep
    for (let h = 6; h <= 22; h++) {
      for (let m = 0; m < 60; m += timeStep) {
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const label = `${hh}:${mm}`;
        items.push({ value: label, label });
      }
    }
    return items;
  }, [timeStep]);

  // Load teachers from staff API
  useEffect(() => {
    getStaff();
  }, [getStaff]);

  useEffect(() => {
    const options = Array.isArray(staffList)
      ? staffList.map((s: any) => ({ value: s._id || s.staff_code || s.name, label: `${s.name || "Không tên"} (${s.staff_code || s._id || ""})` }))
      : [];
    setTeacherOptions(options);
    // If current selected teacher is not in options, clear it
    if (!options.some(o => o.value === selectedTeacher)) {
      setSelectedTeacher(options.length ? options[0].value : null);
    }
  }, [staffList]);

  const assignments = useMemo(() => {
    if (!selectedTeacher) return {} as Record<string, CellAssignment>;
    return assignmentsByTeacher[selectedTeacher] || {};
  }, [assignmentsByTeacher, selectedTeacher]);

  const setCell = (rowId: string, day: string, patch: Partial<CellAssignment>) => {
    if (!selectedTeacher) return;
    const key = `${rowId}_${day}`;
    setAssignmentsByTeacher(prev => ({
      ...prev,
      [selectedTeacher]: {
        ...(prev[selectedTeacher] || {}),
        [key]: { ...(prev[selectedTeacher]?.[key] || {}), ...patch },
      },
    }));
  };

  const getCell = (rowId: string, day: string): CellAssignment => {
    const key = `${rowId}_${day}`;
    return assignments[key] || {};
  };

  const handleClear = () => {
    if (!selectedTeacher) return;
    setAssignmentsByTeacher(prev => ({ ...prev, [selectedTeacher]: {} }));
  };

  const selectedTeacherLabel = useMemo(() => teacherOptions.find(t => t.value === selectedTeacher)?.label || "teacher", [selectedTeacher, teacherOptions]);

  const exportRows = useMemo(() => {
    // Tạo dữ liệu hàng: { ThoiGian, T2, T3, ... }
    return rows.map((r) => {
      const rowObj: Record<string, any> = { ThoiGian: `${formatTime(r.start)} - ${formatTime(r.end)}` };
      DAYS.forEach((d) => {
        const key = `${r.id}_${d.value}`;
        const cell = (assignmentsByTeacher[selectedTeacher || ""] || {})[key] || {};
        rowObj[d.label] = [cell.school, cell.className].filter(Boolean).join(" - ");
      });
      return rowObj;
    });
  }, [rows, assignmentsByTeacher, selectedTeacher]);

  function buildScheduleHtml(): string {
    const headCells = ["Thời gian", ...DAYS.map(d => d.label)];
    const rowsHtml = rows.map((row) => {
      const time = `${formatTime(row.start)} - ${formatTime(row.end)}`;
      const cells = DAYS.map((d) => {
        const cell = getCell(row.id, d.value);
        const school = cell.school || "Trường";
        const klass = cell.className || "Lớp";
        return `<td><div>${school}</div><div>${klass}</div></td>`;
      }).join("");
      return `<tr><td>${time}</td>${cells}</tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #212529; }
    .title { font-size: 14pt; font-weight: 700; margin-bottom: 12px; }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    th, td { border: 1px solid #adb5bd; padding: 6pt 8pt; text-align: left; vertical-align: top; word-wrap: break-word; }
    th { background: #f1f3f5; font-weight: 700; }
    @page { size: A4 landscape; margin: 15mm; }
  </style>
</head>
<body>
  <div class="title">${selectedTeacherLabel}</div>
  <table>
    <thead>
      <tr>${headCells.map(h => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>
</body>
</html>`;
    return html;
  }

  async function ensureHtmlDocx(): Promise<any> {
    const cdn = "https://cdn.jsdelivr.net/npm/html-docx-js/dist/html-docx.js";
    await loadScript(cdn);
    const w = window as any;
    if (!w.htmlDocx || !w.htmlDocx.asBlob) throw new Error("html-docx-js not available");
    return w.htmlDocx;
  }

  const handleExport = async () => {
    const htmlDocx = await ensureHtmlDocx();
    const html = buildScheduleHtml();
    const blob = htmlDocx.asBlob(html);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teaching_schedule_${selectedTeacherLabel}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const addRow = () => setRows(prev => [...prev, { id: `r${prev.length + 1}`, start: null, end: null }]);
  const removeRow = () => setRows(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));

  return (
    <div style={{ padding: 16 }}>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2} c="blue">Lịch Giảng Dạy</Title>
          <Text c="dimmed">Thời khóa biểu theo giáo viên • Chọn 1 ô thời gian (HH:mm - HH:mm) cho mỗi hàng</Text>
        </div>
        <Group>
          <Select
            label="Giáo viên / Giảng viên"
            placeholder="Chọn người dạy"
            data={teacherOptions}
            value={selectedTeacher}
            onChange={setSelectedTeacher}
            searchable
          />
          <Select
            label="Bước (phút)"
            placeholder="Chọn bước"
            data={[
              { value: "15", label: "15" },
              { value: "30", label: "30" },
              { value: "45", label: "45" },
            ]}
            value={String(timeStep)}
            onChange={(v) => setTimeStep(Number(v || 30))}
            maw={120}
          />
          <Button onClick={handleExport} variant="light">Xuất DOC</Button>
          <Button variant="light" onClick={handleClear}>Xóa lịch tuần</Button>
          <Button variant="light" onClick={addRow}>Thêm hàng</Button>
          <Button variant="light" onClick={removeRow}>Xóa hàng cuối</Button>
        </Group>
      </Group>

      {/* Bảng hiển thị UI */}
      <div ref={tableRef}>
      <Table withTableBorder highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 220, textAlign: "center" }}>Thời gian</Table.Th>
            {DAYS.map(d => (
              <Table.Th key={d.value} style={{ textAlign: "center" }}>{d.label}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.id}>
              <Table.Td>
                <Popover width={360} position="bottom-start" withArrow>
                  <Popover.Target>
                    <Button variant="default" size="sm">
                      {`${formatTime(row.start)} - ${formatTime(row.end)}`}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Group gap="sm" align="center">
                      <Select
                        placeholder="Từ"
                        data={timeOptions}
                        value={row.start ? formatTime(row.start) : null}
                        onChange={(val) =>
                          setRows(prev => prev.map(r => {
                            if (r.id !== row.id) return r;
                            const nextStart = parseTimeToDate(val);
                            const nextEnd = r.end && nextStart && r.end <= nextStart ? null : r.end;
                            return { ...r, start: nextStart, end: nextEnd };
                          }))
                        }
                        searchable
                        nothingFoundMessage="Không có"
                        comboboxProps={{ withinPortal: false }}
                        maw={140}
                      />
                      <Text>đến</Text>
                      <Select
                        placeholder="Đến"
                        data={timeOptions}
                        value={row.end ? formatTime(row.end) : null}
                        onChange={(val) =>
                          setRows(prev => prev.map(r => {
                            if (r.id !== row.id) return r;
                            const candidate = parseTimeToDate(val);
                            // Chỉ nhận khi > start
                            const valid = r.start && candidate && candidate <= r.start ? null : candidate;
                            return { ...r, end: valid };
                          }))
                        }
                        searchable
                        nothingFoundMessage="Không có"
                        comboboxProps={{ withinPortal: false }}
                        maw={140}
                      />
                    </Group>
                  </Popover.Dropdown>
                </Popover>
              </Table.Td>
              {DAYS.map(d => {
                const cell = getCell(row.id, d.value);
                return (
                  <Table.Td key={`${row.id}_${d.value}`}>
                    <Group gap="xs" align="flex-start">
                      <TextInput
                        placeholder="Trường"
                        value={cell.school || ""}
                        onChange={(e) => setCell(row.id, d.value, { school: e.currentTarget.value })}
                        style={{ minWidth: 140 }}
                      />
                      <TextInput
                        placeholder="Lớp"
                        value={cell.className || ""}
                        onChange={(e) => setCell(row.id, d.value, { className: e.currentTarget.value })}
                        style={{ minWidth: 120 }}
                      />
                    </Group>
                  </Table.Td>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
      </div>

      {/* Bảng ẩn để xuất PDF với Times New Roman (giống UI) */}
      <div ref={hiddenTableRef} style={{ position: "absolute", left: -99999, top: 0, fontFamily: '"Times New Roman", Times, serif' }}>
        <style>{`
          .pdf-table { border-collapse: collapse; width: 100%; }
          .pdf-table th, .pdf-table td { border: 1px solid #e9ecef; padding: 12px; vertical-align: top; }
          .pdf-table th { text-align: left; font-weight: 700; }
          .pdf-time { width: 180px; text-align: left; }
          .pdf-box { border: 1px solid #dee2e6; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; min-height: 20px; }
        `}</style>
        <table className="pdf-table">
          <thead>
            <tr>
              <th className="pdf-time">Thời gian</th>
              {DAYS.map((d) => (
                <th key={`h_${d.value}`}>{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`hr_${row.id}`}>
                <td className="pdf-time">{`${formatTime(row.start)} - ${formatTime(row.end)}`}</td>
                {DAYS.map((d) => {
                  const cell = getCell(row.id, d.value);
                  return (
                    <td key={`hc_${row.id}_${d.value}`}>
                      <div className="pdf-box">{cell.school || "Trường"}</div>
                      <div className="pdf-box">{cell.className || "Lớp"}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 