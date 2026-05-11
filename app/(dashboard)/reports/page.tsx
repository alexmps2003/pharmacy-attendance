"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function formatTime(isoString: string | null) {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "-";
  }
}

function formatMinutes(minutes: number | null) {
  if (minutes == null) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
}

interface AttendanceRecord {
  id: number;
  check_in: string | null;
  lunch_start: string | null;
  lunch_end: string | null;
  check_out: string | null;
  extra_lunch_minutes: number | null;
  total_work_minutes: number | null;
  employees: {
    name: string;
    role: string;
  } | null;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "summary">(
    "daily",
  );
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTodayRecords() {
      try {
        setLoading(true);
        const today = new Date().toISOString().slice(0, 10);

        const { data, error } = await supabase
          .from("attendance_records")
          .select(
            `
            id,
            check_in,
            lunch_start,
            lunch_end,
            check_out,
            extra_lunch_minutes,
            total_work_minutes,
            employees (
              name,
              role
            )
          `,
          )
          .eq("work_date", today);

        if (error) throw error;

        setRecords((data as any) || []);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load today's records.");
      } finally {
        setLoading(false);
      }
    }

    if (activeTab === "daily") {
      loadTodayRecords();
    }
  }, [activeTab]);

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Reports</h1>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "daily"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "monthly"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Monthly Report
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "summary"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Employee Summary
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "daily" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Today's Attendance
            </h2>

            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-zinc-400 animate-pulse">
                Loading records...
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400">
                    <tr>
                      <th className="px-6 py-4 font-medium">Employee</th>
                      <th className="px-6 py-4 font-medium">Check In</th>
                      <th className="px-6 py-4 font-medium">Lunch Out</th>
                      <th className="px-6 py-4 font-medium">Lunch In</th>
                      <th className="px-6 py-4 font-medium">Check Out</th>
                      <th className="px-6 py-4 font-medium">
                        Extra Lunch (Deduct)
                      </th>
                      <th className="px-6 py-4 font-medium">Total Work Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {records.length > 0 ? (
                      records.map((record) => (
                        <tr key={record.id} className="text-zinc-100">
                          <td className="px-6 py-4">
                            <div className="font-medium">
                              {record.employees?.name}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {record.employees?.role}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-emerald-400">
                            {formatTime(record.check_in)}
                          </td>
                          <td className="px-6 py-4 text-yellow-500/90">
                            {formatTime(record.lunch_start)}
                          </td>
                          <td className="px-6 py-4 text-yellow-500/90">
                            {formatTime(record.lunch_end)}
                          </td>
                          <td className="px-6 py-4 text-emerald-400">
                            {formatTime(record.check_out)}
                          </td>
                          <td className="px-6 py-4 text-red-400">
                            {formatMinutes(record.extra_lunch_minutes)}
                          </td>
                          <td className="px-6 py-4 font-medium text-emerald-400">
                            {formatMinutes(record.total_work_minutes)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-zinc-500"
                        >
                          <p className="text-lg mb-1">
                            No attendance records today.
                          </p>
                          <p className="text-sm">
                            Employees haven't checked in yet.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "monthly" && (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <h3 className="text-lg font-medium text-white mb-2">
              Monthly Report
            </h3>
            <p className="text-zinc-500">Coming soon</p>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
            <h3 className="text-lg font-medium text-white mb-2">
              Employee Summary
            </h3>
            <p className="text-zinc-500">Coming soon</p>
          </div>
        )}
      </div>
    </main>
  );
}
