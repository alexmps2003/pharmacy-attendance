import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default async function EmployeesPage() {
  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, name, role")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        <h1 className="text-4xl font-bold">Employees</h1>
        <p className="mt-4 text-red-400">Failed to load employees.</p>
        <p className="mt-2 text-sm text-zinc-500">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="text-4xl font-bold">Employees</h1>

      <div className="mt-8 grid gap-4">
        {employees?.length === 0 && (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-zinc-400">
            No active employees found. Check your Supabase employees table.
          </p>
        )}

        {employees?.map((employee) => (
          <Link
            key={employee.id}
            href={`/employees/${employee.id}`}
            className="block rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold">{employee.name}</h2>

            <p className="mt-1 text-zinc-400">{employee.role}</p>
            <p className="mt-3 text-sm text-zinc-500">
              Click to check in or check out
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
