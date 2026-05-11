import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col min-h-screen shrink-0 text-white">
      <div className="mb-8 font-bold text-xl tracking-tight">
        Iresha Pharmacy
      </div>

      <nav className="flex flex-col gap-2">
        <Link
          href="/"
          className="px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          Dashboard
        </Link>
        <Link
          href="/employees"
          className="px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          Employees
        </Link>
        <Link
          href="/employees/new"
          className="px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          Add Employee
        </Link>
        <Link
          href="/reports"
          className="px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm font-medium"
        >
          Reports
        </Link>
      </nav>
    </aside>
  );
}
