"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col md:h-screen shrink-0 text-white">
      <div className="flex justify-between items-center mb-0 md:mb-8">
        <div className="font-bold text-xl tracking-tight">Iresha Pharmacy</div>
        <button
          className="md:hidden p-2 rounded-md hover:bg-zinc-800 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      <nav
        className={`${isOpen ? "flex mt-8" : "hidden"} md:flex md:mt-0 flex-col flex-1 gap-2 overflow-y-auto`}
      >
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
          Attendance
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

        <button
          onClick={handleLogout}
          className="md:mt-auto mt-4 px-3 py-2 rounded-md hover:bg-red-500/10 transition-colors text-sm font-medium text-red-400 hover:text-red-300 text-left"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
