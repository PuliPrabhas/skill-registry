"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/app/constants/admin";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/"); // ❌ not admin → kick out
      } else {
        setLoading(false); // ✅ admin → allow
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking admin access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-semibold text-gray-900">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-gray-600">
        Verify user skills and certificates.
      </p>
    </main>
  );
}
