"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-8">

        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome, {user.email}
        </p>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Link
            href="/profile"
            className="px-6 py-3 bg-gray-900 text-white rounded-md
                       transition hover:bg-gray-700"
          >
            Go to Profile
          </Link>

          <button
            onClick={() => signOut(auth)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md
                       transition hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}
