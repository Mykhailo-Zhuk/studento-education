import { ExternalLink } from "lucide-react";
import type { LessonStatus } from "../types";

export function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === "live")
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 bg-error-light text-error rounded-full text-[12px] font-bold">
        <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
        LIVE
      </span>
    );
  if (status === "pending")
    return (
      <span className="px-3 py-1 bg-warning-light text-warning rounded-full text-[12px] font-bold">
        PENDING
      </span>
    );
  return (
    <span className="px-3 py-1 bg-success-light text-success rounded-full text-[12px] font-bold">
      COMPLETED
    </span>
  );
}

export function LessonAction({
  status,
  youtubeUrl,
  onPrepareContent,
}: {
  status: LessonStatus;
  youtubeUrl: string | null;
  onPrepareContent: () => void;
}) {
  if (status === "live")
    return (
      <button className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all text-[14px]">
        Join Stream
      </button>
    );
  if (status === "pending")
    return (
      <button
        onClick={onPrepareContent}
        className="w-full sm:w-auto px-6 py-3 border border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all text-[14px]"
      >
        Prepare Content
      </button>
    );
  if (youtubeUrl)
    return (
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto px-6 py-3 text-error font-bold hover:underline text-[14px] flex items-center gap-2 justify-center sm:justify-start"
      >
        <ExternalLink size={16} />
        Watch Recording
      </a>
    );
  return (
    <span className="w-full sm:w-auto px-6 py-3 text-text-muted text-[14px] italic">
      No recording URL
    </span>
  );
}
