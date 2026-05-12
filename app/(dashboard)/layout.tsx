import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row min-h-screen md:h-screen md:overflow-hidden bg-zinc-950 text-white">
        <Sidebar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </AuthGuard>
  );
}
