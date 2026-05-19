import { notFound } from "next/navigation";
import { getCertConfig } from "@/lib/certifications";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";

export default async function CertLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ certId: string }>;
}) {
  const { certId } = await params;
  const config = getCertConfig(certId);
  if (!config) notFound();

  return (
    <div className="flex min-h-screen">
      <Sidebar certId={config.id} certName={config.name} />
      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
