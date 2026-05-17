"use client";

import { Minus, Sparkles, TrendingUp } from "lucide-react";
import type { Group } from "@/lib/types";
import { memberCount } from "../types";

interface Props {
  groups: Group[];
}

export default function GroupInsights({ groups }: Props) {
  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <h4 className="text-[14px] font-bold text-text-primary">
            Group Overview
          </h4>
        </div>
        <p className="text-[13px] text-text-secondary">
          {groups.filter((g) => g.status.toLowerCase() !== "finished").length}{" "}
          active groups with{" "}
          {groups.reduce((sum, g) => sum + memberCount(g.members), 0)} total
          students enrolled.
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Minus size={20} className="text-warning" />
          <h4 className="text-[14px] font-bold text-text-primary">
            Attention Required
          </h4>
        </div>
        <p className="text-[13px] text-text-secondary">
          Review groups without scheduled sessions to ensure continuous learning
          progress.
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-border-light shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-success" />
          <h4 className="text-[14px] font-bold text-text-primary">
            AI Recommendation
          </h4>
        </div>
        <p className="text-[13px] text-text-secondary">
          Consider splitting large groups for more personalized learning
          outcomes.
        </p>
      </div>
    </div>
  );
}
