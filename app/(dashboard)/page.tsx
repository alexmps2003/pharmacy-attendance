import { supabase } from "@/lib/supabase";

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
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {employees?.map((employee) => (
                  <tr
                    key={employee.id}
                    className={
                      !employee.is_active ? "text-zinc-500" : "text-zinc-100"
                    }
                  >
                    <td className="px-6 py-4">{employee.name}</td>
                    <td className="px-6 py-4">{employee.role}</td>
                    <td className="px-6 py-4">
                      {employee.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-zinc-400/10 px-2 py-1 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-400/20">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          disabled
                          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 opacity-50 cursor-not-allowed"
                        >
                          Edit
                        </button>
                        <button
                          disabled
                          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 opacity-50 cursor-not-allowed"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees?.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-zinc-500"
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
