import PublicTopBar from "@/components/public/PublicTopBar";
import StudentView from "@/components/public/StudentView";
import GroupView from "@/components/public/GroupView";
import type { StudentBundle, GroupBundle } from "@/lib/types";

interface Params {
  params: Promise<{ token: string }>;
}

async function fetchData(token: string): Promise<StudentBundle | GroupBundle | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/view/${token}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ViewPage({ params }: Params) {
  const { token } = await params;
  const data = await fetchData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col">
        <PublicTopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-white text-[32px] font-bold mb-2">Access Expired</h1>
            <p className="text-text-muted text-[16px]">
              This link has expired or is invalid. Please ask your instructor for a new link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isGroup = "type" in data && (data as GroupBundle).type === "group";

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <PublicTopBar />
      {isGroup ? (
        <GroupView token={token} data={data as GroupBundle} />
      ) : (
        <StudentView {...(data as StudentBundle)} />
      )}
    </div>
  );
}
