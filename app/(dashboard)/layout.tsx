import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-white">
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </AuthGuard>
  );
}
