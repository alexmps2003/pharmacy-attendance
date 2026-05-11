import Link from "next/link";

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

export default function EmployeesPage() {
  return (
    <main className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="text-4xl font-bold">Employees</h1>

      <div className="mt-8 grid gap-4">
        {employees.map((employee) => (
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