"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Employee = {
  id: number;
  name: string;
  role: string;
  pin_code: string;
};

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
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [lunchStart, setLunchStart] = useState<string | null>(null);
  const [lunchEnd, setLunchEnd] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);

  const [pendingAction, setPendingAction] = useState<
    "checkin" | "startLunch" | "endLunch" | "checkout" | null
  >(null);
  const [modalPinInput, setModalPinInput] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  // Admin correction state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminModalError, setAdminModalError] = useState<string | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminActionError, setAdminActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmployee() {
      setIsLoadingEmployee(true);

      const { data, error } = await supabase
        .from("employees")
        .select("id, name, role, pin_code")
        .eq("id", Number(params.id))
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error loading employee:", error);
        setEmployee(null);
      } else {
        setEmployee(data);
      }

      setIsLoadingEmployee(false);
    }

    loadEmployee();
  }, [params.id]);

  useEffect(() => {
    // Load today's attendance record (if any) for this employee
    async function loadToday() {
      try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const employeeId = Number(params.id);

        const { data, error } = await supabase
          .from("attendance_records")
          .select("id, check_in, lunch_start, lunch_end, check_out")
          .eq("employee_id", employeeId)
          .eq("work_date", today)
          .limit(1);

        if (error) {
          console.error("Error loading attendance:", error);
          return;
        }

        if (data && data.length > 0) {
          const rec: any = data[0];
          setRecordId(rec.id ?? null);

          if (rec.check_in) setCheckIn(formatTime(new Date(rec.check_in)));
          if (rec.lunch_start)
            setLunchStart(formatTime(new Date(rec.lunch_start)));
          if (rec.lunch_end) setLunchEnd(formatTime(new Date(rec.lunch_end)));
          if (rec.check_out) setCheckOut(formatTime(new Date(rec.check_out)));
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadToday();
  }, [params.id]);

  const lunchMinutes =
    !lunchStart || !lunchEnd ? 0 : getMinutesBetween(lunchStart, lunchEnd);
  const extraLunchMinutes = Math.max(0, lunchMinutes - 30);
  const totalMinutes = Math.max(
    0,
    getMinutesBetween(checkIn, checkOut) - extraLunchMinutes,
  );

  function saveCurrentTime(setter: (time: string) => void) {
    setter(formatTime(new Date()));
  }

  async function ensureRecordExists() {
    const today = new Date().toISOString().slice(0, 10);
    const employeeId = Number(params.id);

    if (recordId) return recordId;

    // Try to select again (race safety)
    const { data } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("work_date", today)
      .limit(1);

    if (data && data.length > 0) {
      setRecordId(data[0].id);
      return data[0].id;
    }

    // Insert a new record
    const { data: inserted, error: insertErr } = await supabase
      .from("attendance_records")
      .insert({ employee_id: employeeId, work_date: today })
      .select("id")
      .limit(1);

    if (insertErr) {
      console.error("Error creating attendance record:", insertErr);
      return null;
    }

    if (inserted && inserted.length > 0) {
      setRecordId(inserted[0].id);
      return inserted[0].id;
    }

    return null;
  }

  function openActionModal(
    action: "checkin" | "startLunch" | "endLunch" | "checkout",
  ) {
    // reset modal state
    setModalPinInput("");
    setModalError(null);

    // pre-validate action-specific rules and show message inside modal if needed
    if (action === "endLunch" && !lunchStart) {
      setModalError("Please start lunch first.");
    }

    if (action === "checkout" && !checkIn) {
      setModalError("Please check in first.");
    }

    setPendingAction(action);
  }

  async function performPendingAction() {
    if (!pendingAction) return;

    // re-check preconditions
    if (pendingAction === "endLunch" && !lunchStart) {
      setModalError("Please start lunch first.");
      return;
    }
    if (pendingAction === "checkout" && !checkIn) {
      setModalError("Please check in first.");
      return;
    }

    // PIN validation
    if (!modalPinInput) {
      setModalError("Please enter employee PIN.");
      return;
    }
    if (employee?.pin_code && modalPinInput !== employee.pin_code) {
      setModalError("Incorrect PIN.");
      return;
    }

    // all good - perform the selected action
    try {
      const now = new Date();
      const iso = now.toISOString();

      const rid = await ensureRecordExists();
      if (!rid) return;

      if (pendingAction === "checkin") {
        await supabase
          .from("attendance_records")
          .update({ check_in: iso })
          .eq("id", rid);
        saveCurrentTime(setCheckIn);
      }

      if (pendingAction === "startLunch") {
        await supabase
          .from("attendance_records")
          .update({ lunch_start: iso })
          .eq("id", rid);
        saveCurrentTime(setLunchStart);
      }

      if (pendingAction === "endLunch") {
        await supabase
          .from("attendance_records")
          .update({ lunch_end: iso })
          .eq("id", rid);
        saveCurrentTime(setLunchEnd);
      }

      if (pendingAction === "checkout") {
        // compute minutes based on current local display values
        const lunchMins =
          !lunchStart || !lunchEnd
            ? 0
            : getMinutesBetween(lunchStart, lunchEnd);
        const extra = Math.max(0, lunchMins - 30);
        const total = Math.max(
          0,
          getMinutesBetween(checkIn, formatTime(now)) - extra,
        );

        await supabase
          .from("attendance_records")
          .update({
            check_out: iso,
            extra_lunch_minutes: extra,
            total_work_minutes: total,
          })
          .eq("id", rid);

        saveCurrentTime(setCheckOut);
      }

      // close modal and clear pin
      setPendingAction(null);
      setModalPinInput("");
      setModalError(null);
    } catch (err) {
      console.error("Attendance action error:", err);
      setModalError("An unexpected error occurred.");
    }
  }

  // Admin login handler (hardcoded password for now)
  async function performAdminLogin() {
    if (!adminPassword) {
      setAdminModalError("Please enter admin password.");
      return;
    }

    if (adminPassword === "200329") {
      setIsAdminMode(true);
      setShowAdminModal(false);
      setAdminPassword("");
      setAdminModalError(null);
      setAdminActionError(null);
    } else {
      setAdminModalError("Incorrect admin password.");
    }
  }

  if (isLoadingEmployee) {
    return (
      <main className=" p-8 text-white">
        <h1 className="text-3xl font-bold">Loading employee...</h1>
      </main>
    );
  }

  if (!employee) {
    return (
      <main className=" p-8 text-white">
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
    <main className=" p-6 md:p-8 text-white">
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

        {/* PIN is requested in a modal per-action; no permanent input here */}

        {/* Action Buttons */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => openActionModal("checkin")}
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
            onClick={() => openActionModal("startLunch")}
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
            onClick={() => openActionModal("endLunch")}
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
            onClick={() => openActionModal("checkout")}
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
        {/* Admin Correction entry/button */}
        <div className="mt-6">
          <button
            onClick={() => {
              setShowAdminModal(true);
              setAdminModalError(null);
            }}
            className="rounded-lg bg-zinc-800 px-4 py-2 font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition"
          >
            Admin Correction
          </button>
        </div>
      </section>

      {/* Admin Corrections Panel (visible when admin mode is active) */}
      {isAdminMode && (
        <section className="mt-8 rounded-2xl border border-zinc-800 bg-linear-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl">
          <h3 className="text-xl font-bold text-white">Admin Corrections</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Use these to clear specific timestamps.
          </p>

          {adminActionError && (
            <p className="mt-3 text-sm text-red-400">{adminActionError}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                setAdminActionError(null);
                if (!recordId) {
                  setAdminActionError("No attendance record for today.");
                  return;
                }
                if (checkOut) {
                  setAdminActionError("Clear check out first.");
                  return;
                }

                try {
                  const { error } = await supabase
                    .from("attendance_records")
                    .update({ check_in: null })
                    .eq("id", recordId);

                  if (error) {
                    console.error(error);
                    setAdminActionError("Failed to clear check in.");
                    return;
                  }

                  setCheckIn(null);
                } catch (err) {
                  console.error(err);
                  setAdminActionError("Failed to clear check in.");
                }
              }}
              className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-600 transition"
            >
              Clear Check In
            </button>

            <button
              onClick={async () => {
                setAdminActionError(null);
                if (!recordId) {
                  setAdminActionError("No attendance record for today.");
                  return;
                }

                try {
                  const { error } = await supabase
                    .from("attendance_records")
                    .update({
                      check_out: null,
                      total_work_minutes: 0,
                      extra_lunch_minutes: 0,
                    })
                    .eq("id", recordId);

                  if (error) {
                    console.error(error);
                    setAdminActionError("Failed to clear check out.");
                    return;
                  }

                  setCheckOut(null);
                } catch (err) {
                  console.error(err);
                  setAdminActionError("Failed to clear check out.");
                }
              }}
              className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-600 transition"
            >
              Clear Check Out
            </button>

            <button
              onClick={async () => {
                setAdminActionError(null);
                if (!recordId) {
                  setAdminActionError("No attendance record for today.");
                  return;
                }
                if (checkOut) {
                  setAdminActionError("Clear check out first.");
                  return;
                }
                if (lunchEnd) {
                  setAdminActionError("Clear lunch end first.");
                  return;
                }

                try {
                  const { error } = await supabase
                    .from("attendance_records")
                    .update({ lunch_start: null })
                    .eq("id", recordId);

                  if (error) {
                    console.error(error);
                    setAdminActionError("Failed to clear lunch start.");
                    return;
                  }

                  setLunchStart(null);
                } catch (err) {
                  console.error(err);
                  setAdminActionError("Failed to clear lunch start.");
                }
              }}
              className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-600 transition"
            >
              Clear Lunch Start
            </button>

            <button
              onClick={async () => {
                setAdminActionError(null);
                if (!recordId) {
                  setAdminActionError("No attendance record for today.");
                  return;
                }
                if (checkOut) {
                  setAdminActionError("Clear check out first.");
                  return;
                }

                try {
                  const { error } = await supabase
                    .from("attendance_records")
                    .update({ lunch_end: null })
                    .eq("id", recordId);

                  if (error) {
                    console.error(error);
                    setAdminActionError("Failed to clear lunch end.");
                    return;
                  }

                  setLunchEnd(null);
                } catch (err) {
                  console.error(err);
                  setAdminActionError("Failed to clear lunch end.");
                }
              }}
              className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-600 transition"
            >
              Clear Lunch End
            </button>
          </div>
        </section>
      )}

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

      {/* Reusable Confirmation Modal for all attendance actions */}
      {pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">
              {pendingAction === "checkin" && "Confirm Check In"}
              {pendingAction === "startLunch" && "Confirm Start Lunch"}
              {pendingAction === "endLunch" && "Confirm End Lunch"}
              {pendingAction === "checkout" && "Confirm Check Out"}
            </h3>
            <p className="text-zinc-300 mb-4">Enter employee PIN to confirm.</p>

            <input
              type="password"
              placeholder="Employee PIN"
              value={modalPinInput}
              onChange={(e) => setModalPinInput(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/50"
            />

            {modalError && (
              <p className="mt-3 text-sm text-red-400">{modalError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setPendingAction(null);
                  setModalPinInput("");
                  setModalError(null);
                }}
                className="rounded-lg bg-zinc-800 px-4 py-2 font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={performPendingAction}
                className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-500 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">
              Admin Correction
            </h3>
            <p className="text-zinc-300 mb-4">
              Enter admin password to unlock corrections.
            </p>

            <input
              type="password"
              placeholder="Admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-all duration-200 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-600/50"
            />

            {adminModalError && (
              <p className="mt-3 text-sm text-red-400">{adminModalError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminPassword("");
                  setAdminModalError(null);
                }}
                className="rounded-lg bg-zinc-800 px-4 py-2 font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={performAdminLogin}
                className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-500 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
