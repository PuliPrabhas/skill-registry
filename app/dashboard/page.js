"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
      }
    });

    return () => unsub();
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6 bg-white p-6 rounded-lg border">

        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>

        <div className="flex gap-4">
          <Link
            href="/profile"
            className="px-4 py-2 bg-gray-900 text-white rounded-md"
          >
            Profile
          </Link>

          <Link
            href="/admin"
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Admin Dashboard
          </Link>

          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 border rounded-md"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}
