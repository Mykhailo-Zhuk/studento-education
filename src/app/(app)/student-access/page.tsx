"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import type { Group } from "@/lib/types";
import { Link2, Copy, Check, RefreshCw } from "lucide-react";

const DURATIONS = [
  { label: "1 година", hours: 1 },
  { label: "24 години", hours: 24 },
  { label: "7 днів", hours: 168 },
  { label: "30 днів", hours: 720 },
];

interface GeneratedLink {
  groupName: string;
  url: string;
  expiresAt: string;
}

export default function StudentAccessPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [duration, setDuration] = useState(168);
  const [generating, setGenerating] = useState(false);
  const [links, setLinks] = useState<GeneratedLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((data: Group[]) => {
        setGroups(data);
        if (data.length > 0) setSelectedGroup(data[0].name);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function generate() {
    if (!selectedGroup) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/student-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_name: selectedGroup, expires_hours: duration }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinks((prev) => [
          { groupName: selectedGroup, url: data.share_link, expiresAt: data.expires_at },
          ...prev,
        ]);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar onSearch={() => {}} />
      <section className="p-4 sm:p-6 lg:p-10 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-[26px] sm:text-[32px] font-bold text-text-primary tracking-tight">
            Student Access Links
          </h2>
          <p className="text-[14px] text-text-secondary mt-1">
            Generate a shareable link for a group. Students identify themselves from the group list.
          </p>
        </div>

        <div className="space-y-5">
          {/* Group selector */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-widest text-text-muted mb-2">
              Select Group
            </label>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-surface-gray-light animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroup(g.name)}
                    className={[
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all",
                      selectedGroup === g.name
                        ? "bg-primary/10 border-primary text-text-primary"
                        : "bg-white border-border-light text-text-secondary hover:border-primary/40 hover:bg-surface-container",
                    ].join(" ")}
                  >
                    <span className="font-medium text-[14px]">{g.name}</span>
                    <span className="text-[12px] text-text-muted">{g.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[12px] font-semibold uppercase tracking-widest text-text-muted mb-2">
              Link expires in
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.hours}
                  onClick={() => setDuration(d.hours)}
                  className={[
                    "px-4 py-2 rounded-lg text-[13px] font-medium transition-colors border",
                    duration === d.hours
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-border-light text-text-secondary hover:border-primary/40",
                  ].join(" ")}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating || !selectedGroup}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-3 rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            {generating ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Link2 size={16} />
            )}
            {generating ? "Generating..." : "Generate Link"}
          </button>
        </div>

        {links.length > 0 && (
          <div className="mt-8 space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-text-muted">
              Generated Links
            </p>
            {links.map((link, i) => (
              <div
                key={i}
                className="bg-white border border-border-light rounded-xl p-4 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-text-primary">
                    {link.groupName}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    до {new Date(link.expiresAt).toLocaleDateString("uk-UA")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[12px] text-primary bg-surface-container rounded-lg px-3 py-2 truncate">
                    {link.url}
                  </code>
                  <button
                    onClick={() => copyUrl(link.url)}
                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    {copied === link.url ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
