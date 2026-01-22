"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";
import { useRouter } from "next/navigation";
export default function AdminPage() {
  const router = useRouter();

  const [users, setUsers] = useState({});
  const [certificates, setCertificates] = useState({});
  const [loading, setLoading] = useState(true);

  /* ================= AUTH PROTECT ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== "prabhaspuli152@gmail.com") {
        router.push("/");
      }
    });
    return () => unsub();
  }, [router]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const usersRef = ref(db, "users");
    const certRef = ref(db, "certificates");

    onValue(usersRef, (snap) => {
      setUsers(snap.val() || {});
    });

    onValue(certRef, (snap) => {
      setCertificates(snap.val() || {});
      setLoading(false);
    });
  }, []);

  /* ================= ANALYTICS ================= */
  const totalUsers = Object.keys(users).length;

  const verifiedProfiles = Object.values(users).filter(
    (u) => u.verified === true
  ).length;

  const allCerts = Object.values(certificates)
    .flatMap((u) => Object.values(u || {}));

  const verifiedCerts = allCerts.filter(
    (c) => c.status === "verified"
  ).length;

  const pendingCerts = allCerts.filter(
    (c) => c.status === "pending"
  ).length;

  /* ================= APPROVE ================= */
  const approveCertificate = async (uid, certId) => {
    await update(ref(db, `certificates/${uid}/${certId}`), {
      status: "verified",
    });

    await update(ref(db, `users/${uid}`), {
      verified: true,
      verifiedAt: Date.now(),
    });
  };

  if (loading) {
    return (
      <p className="p-10 text-gray-700">Loading admin dashboard…</p>
    );
  }

  return (
  <main className="min-h-screen bg-gray-50 px-6 py-12">
    <div className="max-w-6xl mx-auto space-y-10">

      {/* ===== ADMIN ACTION BAR ===== */}
      <div className="flex justify-end gap-4">
        <a
          href="/admin"
          className="px-4 py-2 bg-gray-900 text-white rounded-md
                     hover:bg-gray-700 transition"
        >
          Admin Dashboard
        </a>

        <a
          href="/profile"
          className="px-4 py-2 border border-gray-300 rounded-md
                     text-gray-700 hover:bg-gray-100 transition"
        >
          Profile
        </a>

        <button
          onClick={() => signOut(auth)}
          className="px-4 py-2 border border-gray-300 rounded-md
                     text-gray-700 hover:bg-gray-900 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      {/* ===== EXISTING ADMIN CONTENT BELOW ===== */}
      {/* analytics, approvals, etc */}


        {/* ================= ANALYTICS CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Stat title="Total Users" value={totalUsers} />
          <Stat title="Verified Profiles" value={verifiedProfiles} green />
          <Stat title="Pending Certificates" value={pendingCerts} />
          <Stat title="Verified Certificates" value={verifiedCerts} green />
        </div>

        {/* ================= SIMPLE BAR VISUAL ================= */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Verification Overview
          </h2>

          <Bar label="Verified Profiles" value={verifiedProfiles} total={totalUsers} />
          <Bar label="Verified Certificates" value={verifiedCerts} total={allCerts.length} />
        </div>

        {/* ================= CERTIFICATE APPROVAL ================= */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Certificate Verification
          </h2>

          {Object.entries(certificates).map(([uid, certs]) =>
            Object.entries(certs).map(([certId, cert]) => (
              <div
                key={certId}
                className="bg-white border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {cert.skill}
                  </p>

                  <a
                    href={cert.fileURL}
                    target="_blank"
                    className="text-blue-600 text-sm underline"
                  >
                    View Certificate
                  </a>

                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span className={cert.status === "verified" ? "text-green-600" : "text-orange-600"}>
                      {cert.status}
                    </span>
                  </p>
                </div>

                {cert.status === "pending" && (
                  <button
                    onClick={() => approveCertificate(uid, certId)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ title, value, green }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${green ? "text-green-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}

function Bar({ label, value, total }) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div className="mb-4">
      <p className="text-sm text-gray-700 mb-1">
        {label} ({value})
      </p>
      <div className="w-full bg-gray-200 h-3 rounded">
        <div
          className="bg-green-600 h-3 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
