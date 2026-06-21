import { redirect, notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCertConfig } from "@/lib/certifications";
import { CertDashboard } from "@/components/CertDashboard";

export default async function DashboardPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const config = getCertConfig(certId);
  if (!config) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col">
        <CertDashboard certId={certId} config={config} showHeader />
      </div>
    </div>
  );
}
