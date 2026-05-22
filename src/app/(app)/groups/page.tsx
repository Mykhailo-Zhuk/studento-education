"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { supabase } from "@/lib/supabase";
import type { Group } from "@/lib/types";
import GroupActionMenu from "./components/GroupActionMenu";
import DeleteGroupDialog from "./components/DeleteGroupDialog";
import GroupFilters from "./components/GroupFilters";
import GroupInsights from "./components/GroupInsights";
import GroupModal from "./components/GroupModal";
import GroupTooltip from "./components/GroupTooltip";
import GroupsTable from "./components/GroupsTable";
import {
  formatDate,
  TYPE_BADGE,
  TYPE_ICON,
  type CellTooltip,
  type GroupRow,
  type MenuAnchor,
} from "./types";
import { UserPlus, Zap } from "lucide-react";
import { downloadJSON, downloadCSV, downloadExcel } from "@/lib/import-export";
import ImportExportButtons from "@/components/ui/ImportExportButtons";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Group | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cellTooltip, setCellTooltip] = useState<CellTooltip | null>(null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const tooltipHideTimer = useRef<number | null>(null);

  const fetchGroups = useCallback(async () => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });
    setGroups(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      setGroups(data ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () =>
      groups
        .filter((g) => !filterType || g.type === filterType)
        .filter(
          (g) => !search || g.name.toLowerCase().includes(search.toLowerCase()),
        ),
    [groups, filterType, search],
  );

  const rows = useMemo<GroupRow[]>(
    () =>
      filtered.map((g) => {
        const iconInfo = TYPE_ICON[g.type] ?? TYPE_ICON.Other;
        const badgeClass = TYPE_BADGE[g.type] ?? TYPE_BADGE.Other;
        return {
          group: g,
          id: g.id,
          name: g.name,
          members: g.members ?? "—",
          icon: iconInfo.icon,
          iconBg: iconInfo.bg,
          iconColor: iconInfo.color,
          type: g.type,
          typeClasses: badgeClass,
          started: formatDate(g.started),
          finished: formatDate(g.finished),
          schedule: g.schedule_time ?? "—",
          journalUrl: g.journal_url,
          telegramUrl: g.telegram_url,
          notes: g.notes ?? "—",
          status: g.status,
          isActive: g.status.toLowerCase() !== "finished",
        };
      }),
    [filtered],
  );

  function openCreate() {
    setEditGroup(null);
    setModalOpen(true);
  }

  function openEdit(g: Group) {
    setEditGroup(g);
    setModalOpen(true);
    setMenuAnchor(null);
  }

  function openMenu(e: React.MouseEvent<HTMLButtonElement>, g: Group) {
    e.stopPropagation();
    if (menuAnchor?.group.id === g.id) {
      setMenuAnchor(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuAnchor({
      group: g,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/groups/${confirmDelete.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (!res.ok) return;
    setConfirmDelete(null);
    await fetchGroups();
  }

  function clearTooltipHideTimer() {
    if (tooltipHideTimer.current !== null) {
      window.clearTimeout(tooltipHideTimer.current);
      tooltipHideTimer.current = null;
    }
  }

  function showCellTooltip(
    e: React.MouseEvent<HTMLElement>,
    label: string,
    value: string,
  ) {
    clearTooltipHideTimer();
    const rect = e.currentTarget.getBoundingClientRect();
    const width = 360;
    const padding = 12;
    const left = Math.min(
      Math.max(padding, rect.left),
      Math.max(padding, window.innerWidth - width - padding),
    );
    const top =
      rect.bottom + 10 + 180 > window.innerHeight
        ? Math.max(padding, rect.top - 190)
        : rect.bottom + 10;
    setCellTooltip({ label, value, top, left });
  }

  function hideCellTooltip() {
    clearTooltipHideTimer();
    tooltipHideTimer.current = window.setTimeout(() => {
      setCellTooltip(null);
    }, 120);
  }

  async function copyTooltipValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedCell(value);
      window.setTimeout(() => setCopiedCell(null), 1200);
    } catch {
      setCopiedCell(null);
    }
  }

  const GROUP_HEADERS = ["Name", "Type", "Status", "Members", "Started", "Finished", "Schedule", "Journal URL", "Telegram URL", "Notes"];

  function getGroupRows() {
    return groups.map((g) => [g.name, g.type, g.status, g.members ?? "", g.started, g.finished ?? "", g.schedule_time ?? "", g.journal_url ?? "", g.telegram_url ?? "", g.notes ?? ""]);
  }

  function handleExport(format: "json" | "csv" | "excel") {
    if (format === "json") {
      downloadJSON(groups, "groups");
    } else if (format === "csv") {
      downloadCSV(GROUP_HEADERS, getGroupRows(), "groups");
    } else {
      downloadExcel(GROUP_HEADERS, getGroupRows(), "groups", "Groups");
    }
  }

  async function handleImport(importedRows: Record<string, string>[]) {
    for (const row of importedRows) {
      await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row["Name"] ?? row["name"] ?? "",
          type: row["Type"] ?? row["type"] ?? "",
          status: row["Status"] ?? row["status"] ?? "active",
          members: row["Members"] ?? row["members"] ?? null,
          started: row["Started"] ?? row["started"] ?? new Date().toISOString().slice(0, 10),
          finished: row["Finished"] ?? row["finished"] ?? null,
          schedule_time: row["Schedule"] ?? row["schedule_time"] ?? null,
          journal_url: row["Journal URL"] ?? row["journal_url"] ?? null,
          telegram_url: row["Telegram URL"] ?? row["telegram_url"] ?? null,
          notes: row["Notes"] ?? row["notes"] ?? null,
        }),
      });
    }
    await fetchGroups();
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar
        breadcrumb={["Main Hub", "Groups"]}
        searchPlaceholder="Search groups..."
        onSearch={setSearch}
      />

      <section className="p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-[26px] sm:text-[32px] font-bold text-text-primary tracking-tight">
              Learning Cohorts
            </h2>
            <p className="text-[13px] sm:text-[14px] text-text-secondary mt-1 max-w-2xl">
              Manage and monitor student progress across all active learning
              groups.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <ImportExportButtons onExport={handleExport} onImport={handleImport} />
            <button
              onClick={openCreate}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <UserPlus size={16} />
              Create New Group
            </button>
          </div>
        </div>

        <GroupFilters
          filterType={filterType}
          onChange={setFilterType}
          shownCount={rows.length}
        />

        <GroupsTable
          rows={rows}
          loading={loading}
          onOpenMenu={openMenu}
          onShowTooltip={showCellTooltip}
          onHideTooltip={hideCellTooltip}
        />

        <GroupInsights groups={groups} />
      </section>

      <button
        onClick={openCreate}
        className="fixed bottom-12 right-12 bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50"
      >
        <Zap size={24} />
      </button>

      <GroupActionMenu
        anchor={menuAnchor}
        onEdit={openEdit}
        onDelete={(group) => {
          setConfirmDelete(group);
          setMenuAnchor(null);
        }}
        onClose={() => setMenuAnchor(null)}
      />

      <GroupTooltip
        tooltip={cellTooltip}
        copiedValue={copiedCell}
        onCopy={copyTooltipValue}
        onMouseEnter={clearTooltipHideTimer}
        onMouseLeave={hideCellTooltip}
      />

      {modalOpen && (
        <GroupModal
          group={editGroup}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchGroups();
          }}
        />
      )}

      {confirmDelete && (
        <DeleteGroupDialog
          group={confirmDelete}
          deleting={deleting}
          onCancel={() => setConfirmDelete(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
