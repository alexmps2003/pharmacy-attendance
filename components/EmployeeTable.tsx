"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Employee {
  id: number;
  name: string;
  role: string;
  is_active: boolean;
}

export function EmployeeTable({
  initialEmployees,
}: {
  initialEmployees: Employee[];
}) {
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDeactivate = async (id: number) => {
    if (!window.confirm("Are you sure you want to deactivate this employee?"))
      return;

    try {
      const { data: updatedEmployee, error: updateError } = await supabase
        .from("employees")
        .update({ is_active: false })
        .eq("id", id)
        .select("id, is_active")
        .single();

      if (updateError) throw updateError;

      if (!updatedEmployee || updatedEmployee.is_active !== false) {
        throw new Error("Employee was not deactivated in the database.");
      }

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === id ? { ...emp, is_active: false } : emp)),
      );
      setSuccess("Employee successfully deactivated.");
      setError("");
      router.refresh(); // Tells Next.js to refresh the server components
    } catch (err: any) {
      setError(err.message || "Failed to deactivate employee.");
      setSuccess("");
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
          {success}
        </div>
      )}

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
                    <Link
                      href={`/employees/${employee.id}/edit`}
                      className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-700 transition"
                    >
                      Edit
                    </Link>
                    {employee.is_active ? (
                      <button
                        onClick={() => handleDeactivate(employee.id)}
                        className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-red-900 transition"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        disabled
                        className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 opacity-50 cursor-not-allowed"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {employees?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
