import { notFound } from "next/navigation";
import PublicTopBar from "@/components/public/PublicTopBar";
import StudentView from "@/components/public/StudentView";
import type { StudentBundle } from "@/lib/types";

interface Params {
  params: Promise<{ token: string }>;
}

async function fetchStudentData(token: string): Promise<StudentBundle | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/view/${token}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

export default async function StudentViewPage({ params }: Params) {
  const { token } = await params;

  const data = await fetchStudentData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col">
        <PublicTopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-white text-[32px] font-bold mb-2">Access Expired</h1>
            <p className="text-text-muted text-[16px]">
              This link has expired or is invalid. Please ask your instructor for a new link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark flex flex-col">
      <PublicTopBar />
      <StudentView {...data} />
    </div>
  );
}
