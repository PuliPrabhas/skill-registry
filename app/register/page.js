"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Register to start showcasing your skills.
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-gray-900"
          />

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-md
                       transition hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </main>
  );
}
