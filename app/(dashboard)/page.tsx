import { supabase } from "@/lib/supabase";
import { EmployeeTable } from "@/components/EmployeeTable";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, name, role, is_active")
    .order("id", { ascending: true });

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      <p className="mt-4 text-zinc-300">Welcome to the admin dashboard.</p>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Employee Management</h2>

        {error ? (
          <p className="text-red-400">Failed to load employees.</p>
        ) : (
          <EmployeeTable initialEmployees={employees || []} />
        )}
      </section>
    </main>
  );
}
