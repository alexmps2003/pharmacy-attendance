"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { use } from "react";

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const employeeId = unwrappedParams.id;

  const [name, setName] = useState("");
  const [role, setRole] = useState("Pharmacist");
  const [pinCode, setPinCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roles = [
    "Pharmacist",
    "Cashier",
    "Manager",
    "Stock Manager",
    "Assistant",
  ];

  useEffect(() => {
    async function loadEmployee() {
      try {
        const { data, error: fetchError } = await supabase
          .from("employees")
          .select("name, role, pin_code, is_active")
          .eq("id", employeeId)
          .single();

        if (fetchError) throw fetchError;
        if (data) {
          setName(data.name);
          setRole(data.role);
          setPinCode(data.pin_code);
          setIsActive(data.is_active);
        }
      } catch (err: any) {
        setError("Failed to load employee details.");
      } finally {
        setFetching(false);
      }
    }

    loadEmployee();
  }, [employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      setLoading(false);
      return;
    }

    if (pinCode.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      setLoading(false);
      return;
    }

    try {
      // Check if PIN already exists for active employees AND not this employee
      const { data: existingPins, error: fetchError } = await supabase
        .from("employees")
        .select("id")
        .eq("pin_code", pinCode)
        .eq("is_active", true)
        .neq("id", employeeId);

      if (fetchError) throw fetchError;

      if (existingPins && existingPins.length > 0) {
        setError("This PIN is already assigned to another active employee.");
        setLoading(false);
        return;
      }

      // Update employee
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          name: name.trim(),
          role,
          pin_code: pinCode,
        })
        .eq("id", employeeId);

      if (updateError) throw updateError;

      setSuccess("Employee updated successfully.");

      // Navigate slightly after to show success msg
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the employee.");
    } finally {
      if (!success) setLoading(false);
    }
  };

  if (fetching) {
    return (
      <main className="p-8 max-w-2xl">
        <p className="text-zinc-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Edit Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Employee Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
            placeholder="John Doe"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
            disabled={loading}
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="pinCode"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            4-Digit PIN
          </label>
          <input
            id="pinCode"
            type="text"
            inputMode="numeric"
            value={pinCode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPinCode(val);
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
            placeholder="1234"
            maxLength={4}
            required
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading || !isActive}
            className="rounded-lg bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update Employee"}
          </button>
          <Link
            href="/"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
