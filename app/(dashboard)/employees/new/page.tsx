"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function NewEmployeePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Pharmacist");
  const [pinCode, setPinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    "Pharmacist",
    "Cashier",
    "Manager",
    "Stock Manager",
    "Assistant",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
      // Check if PIN already exists
      const { data: existingPins, error: fetchError } = await supabase
        .from("employees")
        .select("pin_code")
        .eq("pin_code", pinCode);

      if (fetchError) throw fetchError;

      if (existingPins && existingPins.length > 0) {
        setError("This PIN is already assigned.");
        setLoading(false);
        return;
      }

      // Insert new employee
      const { error: insertError } = await supabase.from("employees").insert([
        {
          name: name.trim(),
          role,
          pin_code: pinCode,
          is_active: true,
        },
      ]);

      if (insertError) throw insertError;

      router.push("/employees");
      router.refresh(); // Ensure the new employee appears in the list
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Add Employee</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
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
            disabled={loading}
            className="rounded-lg bg-white px-6 py-3 font-medium text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Employee"}
          </button>
          <Link
            href="/employees"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
