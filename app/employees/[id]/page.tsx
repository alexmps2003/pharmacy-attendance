"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const employees = [
  {
    id: 1,
    name: "Nimal Perera",
    role: "Cashier",
  },
  {
    id: 2,
    name: "Kamal Silva",
    role: "Pharmacist",
  },
  {
    id: 3,
    name: "Saman Kumara",
    role: "Stock Manager",
  },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMinutesBetween(start: string | null, end: string | null) {
  if (!start || !end) return 0;

  const today = new Date().toDateString();
  const startDate = new Date(`${today} ${start}`);
  const endDate = new Date(`${today} ${end}`);

  return Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / 60000),
  );
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
}

export default function EmployeePage() {
  const params = useParams<{ id: string }>();
  const employee = employees.find((item) => item.id === Number(params.id));

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [lunchStart, setLunchStart] = useState<string | null>(null);
  const [lunchEnd, setLunchEnd] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const lunchMinutes = getMinutesBetween(lunchStart, lunchEnd);
  const extraLunchMinutes = Math.max(0, lunchMinutes - 30);
  const totalMinutes = Math.max(
    0,
    getMinutesBetween(checkIn, checkOut) - extraLunchMinutes,
  );

  function saveCurrentTime(setter: (time: string) => void) {
    setter(formatTime(new Date()));
  }

  if (!employee) {
    return (
      <main className="min-h-screen bg-zinc-950 p-8 text-white">
        <h1 className="text-3xl font-bold">Employee not found</h1>

        <Link
          href="/employees"
          className="mt-6 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-black"
        >
          Back to Employees
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6 md:p-8 text-white">
      <Link
        href="/employees"
        className="inline-flex items-center text-sm text-zinc-400 hover:text-white transition-colors duration-200"
      >
        ← Back to Employees
      </Link>

      {/* Profile Header */}
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-white">{employee.name}</h1>
            <p className="mt-3 text-lg text-zinc-400">{employee.role}</p>
          </div>
          <div className="hidden sm:flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-2xl font-bold text-zinc-300">
            {employee.name.charAt(0)}
          </div>
        </div>

        {/* PIN Input Section */}
        <div className="mt-8 rounded-xl border border-zinc-700 bg-zinc-900/50 p-5 backdrop-blur-sm">
          <label className="block text-sm font-semibold text-zinc-200 uppercase tracking-wide">
            Employee PIN
          </label>
          <input
            type="password"
            placeholder="Enter PIN (optional)"
            className="mt-3 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/50"
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => saveCurrentTime(setCheckIn)}
            className="group relative rounded-xl bg-linear-to-br from-green-600 to-green-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-green-500 hover:to-green-600 hover:shadow-green-500/50 hover:shadow-2xl active:scale-95 cursor-pointer border border-green-500/30 hover:border-green-400/50"
          >
            <span className="relative z-10">✓ Check In</span>
            {checkIn && (
              <span className="absolute top-2 right-3 text-xs text-green-200">
                {checkIn}
              </span>
            )}
          </button>

          <button
            onClick={() => saveCurrentTime(setLunchStart)}
            className="group relative rounded-xl bg-linear-to-br from-amber-600 to-amber-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-amber-500 hover:to-amber-600 hover:shadow-amber-500/50 hover:shadow-2xl active:scale-95 cursor-pointer border border-amber-500/30 hover:border-amber-400/50"
          >
            <span className="relative z-10">⏸ Start Lunch</span>
            {lunchStart && (
              <span className="absolute top-2 right-3 text-xs text-amber-200">
                {lunchStart}
              </span>
            )}
          </button>

          <button
            onClick={() => saveCurrentTime(setLunchEnd)}
            className="group relative rounded-xl bg-linear-to-br from-blue-600 to-blue-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/50 hover:shadow-2xl active:scale-95 cursor-pointer border border-blue-500/30 hover:border-blue-400/50"
          >
            <span className="relative z-10">▶ End Lunch</span>
            {lunchEnd && (
              <span className="absolute top-2 right-3 text-xs text-blue-200">
                {lunchEnd}
              </span>
            )}
          </button>

          <button
            onClick={() => saveCurrentTime(setCheckOut)}
            className="group relative rounded-xl bg-linear-to-br from-red-600 to-red-700 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-red-500 hover:to-red-600 hover:shadow-red-500/50 hover:shadow-2xl active:scale-95 cursor-pointer border border-red-500/30 hover:border-red-400/50"
          >
            <span className="relative z-10">✕ Check Out</span>
            {checkOut && (
              <span className="absolute top-2 right-3 text-xs text-red-200">
                {checkOut}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* Attendance Summary */}
      <section className="mt-8 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide">
          Today&apos;s Attendance
        </h2>

        {/* Time Logs */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Check In
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {checkIn ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Check Out
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {checkOut ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Lunch Start
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {lunchStart ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Lunch End
            </p>
            <p className="mt-2 text-lg font-bold text-white">
              {lunchEnd ?? "—"}
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 rounded-xl border border-zinc-700 bg-linear-to-br from-zinc-800/50 to-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="border-r border-zinc-700 pr-6 md:border-r">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Lunch Duration
              </p>
              <p className="mt-2 text-2xl font-bold text-amber-400">
                {formatMinutes(lunchMinutes)}
              </p>
            </div>
            <div className="border-r border-zinc-700 pr-6 md:border-r">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Extra Lunch
              </p>
              <p className="mt-2 text-2xl font-bold text-red-400">
                {formatMinutes(extraLunchMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Total Working Time
              </p>
              <p className="mt-2 text-2xl font-bold text-green-400">
                {formatMinutes(totalMinutes)}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
