"use client";

import { MoreVertical } from "lucide-react";
import type { GroupRow } from "../types";

interface Props {
  rows: GroupRow[];
  loading: boolean;
  onOpenMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    group: GroupRow["group"],
  ) => void;
  onShowTooltip: (
    event: React.MouseEvent<HTMLElement>,
    label: string,
    value: string,
  ) => void;
  onHideTooltip: () => void;
}

export default function GroupsTable({
  rows,
  loading,
  onOpenMenu,
  onShowTooltip,
  onHideTooltip,
}: Props) {
  return (
    <>
      <div className="md:hidden space-y-4">
        {loading && (
          <div className="bg-white border border-border-light rounded-xl p-4 text-center text-[14px] text-text-muted">
            Loading…
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="bg-white border border-border-light rounded-xl p-4 text-center text-[14px] text-text-muted">
            No groups found.
          </div>
        )}
        {rows.map((g) => (
          <article
            key={g.id}
            className="bg-white border border-border-light rounded-2xl shadow-sm p-4 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-xl ${g.iconBg} flex items-center justify-center ${g.iconColor} shrink-0`}
              >
                <g.icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-bold text-text-primary truncate">
                  {g.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`text-[12px] px-3 py-1 rounded-full font-semibold ${g.typeClasses}`}>
                    {g.type}
                  </span>
                  <span
                    className={`text-[12px] px-3 py-1 rounded-full font-semibold ${
                      g.isActive
                        ? "bg-success-light text-success"
                        : "bg-[#f1f5f9] text-text-muted"
                    }`}
                  >
                    {g.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">
                  Members
                </p>
                <p className="text-text-primary mt-1 truncate">{g.members}</p>
              </div>
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">
                  Started
                </p>
                <p className="text-text-primary mt-1">{g.started}</p>
              </div>
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">
                  Finished
                </p>
                <p className="text-text-primary mt-1">{g.finished}</p>
              </div>
              <div>
                <p className="text-text-muted uppercase tracking-wider text-[10px] font-semibold">
                  Schedule
                </p>
                <p className="text-text-primary mt-1 truncate">{g.schedule}</p>
              </div>
            </div>
            <div className="space-y-2 text-[13px]">
              <div className="truncate">
                <span className="text-text-muted">Journal: </span>
                {g.journalUrl ? (
                  <a className="text-primary underline" href={g.journalUrl} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </div>
              <div className="truncate">
                <span className="text-text-muted">Telegram: </span>
                {g.telegramUrl ? (
                  <a className="text-primary underline" href={g.telegramUrl} target="_blank" rel="noopener noreferrer">
                    Open
                  </a>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </div>
              <p className="text-text-secondary line-clamp-3">
                {g.notes}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={(e) => onOpenMenu(e, g.group)}
                className="px-4 py-2 rounded-xl border border-border-light text-[13px] font-semibold text-text-primary hover:bg-surface-gray-light transition-colors"
              >
                Actions
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden md:block bg-white border border-border-light rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1660px] w-full table-fixed text-left border-collapse">
          <colgroup>
            <col className="w-[150px]" />
            <col className="w-[130px]" />
            <col className="w-[120px]" />
            <col className="w-[140px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            <col className="w-[230px]" />
            <col className="w-[230px]" />
            <col className="w-[320px]" />
            <col className="w-[72px]" />
          </colgroup>
          <thead>
            <tr className="bg-surface-gray-light border-b border-border-light h-12">
              {[
                "Group Name",
                "Type",
                "Status",
                "Members",
                "Started",
                "Finished",
                "Schedule",
                "Journal URL",
                "Telegram URL",
                "Notes",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-4 text-[12px] font-semibold text-text-secondary uppercase tracking-widest whitespace-nowrap ${
                    h === "" ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {loading && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-[14px] text-text-muted whitespace-nowrap"
                >
                  Loading…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-8 text-center text-[14px] text-text-muted whitespace-nowrap"
                >
                  No groups found.
                </td>
              </tr>
            )}
            {rows.map((g) => (
              <tr
                key={g.id}
                className="hover:bg-surface-gray-light transition-colors h-14"
              >
                <td className="px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg ${g.iconBg} flex items-center justify-center ${g.iconColor}`}
                    >
                      <g.icon size={20} />
                    </div>
                    <span className="text-[15px] font-bold text-text-primary whitespace-nowrap truncate">
                      {g.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <span
                    className={`text-[13px] px-3 py-1 rounded-full font-semibold ${g.typeClasses}`}
                  >
                    {g.type}
                  </span>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <span
                    className={`text-[13px] px-2 py-1 rounded-full font-semibold ${
                      g.isActive
                        ? "bg-success-light text-success"
                        : "bg-[#f1f5f9] text-text-muted"
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <span
                    className="block truncate text-[14px] text-text-secondary"
                    onMouseEnter={(e) => onShowTooltip(e, "Members", g.members)}
                    onMouseLeave={onHideTooltip}
                  >
                    {g.members}
                  </span>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <span className="block truncate text-[14px] text-text-secondary">
                    {g.started}
                  </span>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <span className="block truncate text-[14px] text-text-secondary">
                    {g.finished}
                  </span>
                </td>
                <td className="px-4 whitespace-nowrap">
                  <span className="block truncate text-[14px] text-text-secondary">
                    {g.schedule}
                  </span>
                </td>
                <td className="px-4 whitespace-nowrap">
                  {g.journalUrl ? (
                    <a
                      href={g.journalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-[14px] text-primary hover:underline"
                      onMouseEnter={(e) =>
                        onShowTooltip(e, "Journal URL", g.journalUrl ?? "")
                      }
                      onMouseLeave={onHideTooltip}
                    >
                      {g.journalUrl}
                    </a>
                  ) : (
                    <span className="text-[14px] text-text-secondary">—</span>
                  )}
                </td>
                <td className="px-4 whitespace-nowrap">
                  {g.telegramUrl ? (
                    <a
                      href={g.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-[14px] text-primary hover:underline"
                      onMouseEnter={(e) =>
                        onShowTooltip(e, "Telegram URL", g.telegramUrl ?? "")
                      }
                      onMouseLeave={onHideTooltip}
                    >
                      {g.telegramUrl}
                    </a>
                  ) : (
                    <span className="text-[14px] text-text-secondary">—</span>
                  )}
                </td>
                <td className="px-4 whitespace-nowrap">
                  <span
                    className="block max-w-[320px] text-[14px] text-text-secondary truncate"
                    onMouseEnter={(e) => onShowTooltip(e, "Notes", g.notes)}
                    onMouseLeave={onHideTooltip}
                  >
                    {g.notes}
                  </span>
                </td>
                <td className="px-4 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => onOpenMenu(e, g.group)}
                    className="p-2 hover:bg-surface-container rounded-lg text-text-muted hover:text-primary transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 sm:px-6 py-3 bg-surface-gray-light border-t border-border-light flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <span className="text-[12px] text-text-muted">Page 1 of 1</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border border-border-light rounded-lg text-[12px] font-semibold bg-white hover:bg-surface-container-low transition-colors disabled:opacity-50">
            Previous
          </button>
          <button className="px-3 py-1 border border-border-light rounded-lg text-[12px] font-semibold bg-white hover:bg-surface-container-low transition-colors">
            Next
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
