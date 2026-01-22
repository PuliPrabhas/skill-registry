"use client";
import { ADMIN_EMAIL } from "@/app/constants/admin";
import { useEffect, useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";


export default function Home() {
  const [user, setUser] = useState(null);
  const [showLearnMore, setShowLearnMore] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100">

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-16 flex items-center justify-between">

            {/* Brand */}
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-medium text-gray-900 tracking-tight">
                Skill Registry
              </span>
              <span className="text-sm text-gray-500">
                National Platform
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 text-sm">
              {user ? (
                <>
                  {/* Admin link (ONLY for admin) */}
                  {user.email === ADMIN_EMAIL && (
                    <Link
                      href="/admin"
                      className="relative text-gray-600 transition hover:text-gray-900
                                 after:absolute after:left-0 after:-bottom-1
                                 after:h-[1px] after:w-0 after:bg-gray-900
                                 after:transition-all after:duration-300
                                 hover:after:w-full"
                    >
                      Admin
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    className="relative text-gray-600 transition hover:text-gray-900
                               after:absolute after:left-0 after:-bottom-1
                               after:h-[1px] after:w-0 after:bg-gray-900
                               after:transition-all after:duration-300
                               hover:after:w-full"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={() => signOut(auth)}
                    className="px-4 py-2 rounded-md border border-gray-300
                               text-gray-700 transition-all duration-300
                               hover:bg-gray-900 hover:text-white hover:border-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="relative text-gray-600 transition hover:text-gray-900
                               after:absolute after:left-0 after:-bottom-1
                               after:h-[1px] after:w-0 after:bg-gray-900
                               after:transition-all after:duration-300
                               hover:after:w-full"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-md border border-gray-300
                               text-gray-700 transition-all duration-300
                               hover:bg-gray-900 hover:text-white hover:border-gray-900"
                  >
                    Register
                  </Link>
                  <Link
  href="/employer"
  className="relative text-gray-600 hover:text-gray-900"
>
  Employer View
</Link>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Divider */}
        <div className="group relative w-full h-4">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px
                          bg-gradient-to-r from-transparent via-gray-300 to-transparent
                          transition-opacity duration-300 group-hover:opacity-0" />
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px
                          bg-gray-400 opacity-0 transition-opacity duration-300
                          group-hover:opacity-100" />
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900">
            National Skill Registry
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            A verified digital platform where individuals showcase their skills,
            certifications, and employers discover trusted talent.
          </p>

          <div className="mt-10 flex gap-4 flex-wrap">
            <Link
              href={user ? "/profile" : "/register"}
              className="px-6 py-3 bg-gray-900 text-white rounded-md
                         transition-all duration-300 hover:bg-gray-700"
            >
              Get Started
            </Link>

            <button
              onClick={() => setShowLearnMore(!showLearnMore)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md
                         transition-all duration-300 hover:bg-gray-100"
            >
              {showLearnMore ? "Hide details" : "Learn More"}
            </button>
          </div>
        </div>
      </div>

      {/* ================= LEARN MORE ================= */}
      {showLearnMore && (
        <div className="max-w-6xl mx-auto px-6 pb-24">
          <div className="max-w-3xl p-6 bg-white border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900">
              How it works
            </h2>

            <ul className="mt-4 space-y-2 text-gray-600 list-disc list-inside">
              <li>Create an account</li>
              <li>Add your skills</li>
              <li>Upload certificates</li>
              <li>Get verified by admins</li>
              <li>Employers view verified profiles</li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
