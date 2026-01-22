"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";

const ADMIN_EMAIL = "prabhaspuli152@gmail.com"; // 👈 change if needed

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedProfiles, setVerifiedProfiles] = useState(0);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u || u.email !== ADMIN_EMAIL) {
        router.push("/");
      } else {
        setUser(u);
      }
    });
    return () => unsub();
  }, [router]);

  /* ================= LOAD USERS ================= */
  useEffect(() => {
    const usersRef = ref(db, "users");

    onValue(usersRef, (snap) => {
      if (!snap.exists()) return;

      const usersData = snap.val();
      const usersArray = Object.values(usersData);

      setTotalUsers(usersArray.length);

      const verified = usersArray.filter((u) => u.verified === true);
      setVerifiedProfiles(verified.length);
    });
  }, []);

  /* ================= LOAD CERTIFICATES ================= */
  useEffect(() => {
    const certRef = ref(db, "certificates");

    onValue(certRef, (snap) => {
      if (!snap.exists()) {
        setCertificates([]);
        return;
      }

      const all = [];
      const data = snap.val();

      Object.keys(data).forEach((uid) => {
        Object.keys(data[uid]).forEach((cid) => {
          all.push({
            uid,
            cid,
            ...data[uid][cid],
          });
        });
      });

      setCertificates(all);
    });
  }, []);

  /* ================= APPROVE CERT ================= */
  const approveCertificate = async (uid, cid, skill) => {
    // 1. Approve certificate
    await update(ref(db, `certificates/${uid}/${cid}`), {
      status: "approved",
    });

    // 2. Mark skill as verified
    await update(ref(db, `users/${uid}/skills/${cid}`), {
      name: skill,
      verified: true,
    });

    // 3. Mark profile verified
    await update(ref(db, `users/${uid}`), {
      verified: true,
    });
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ================= HEADER ================= */}
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        {/* ================= ANALYTICS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">
              {totalUsers}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <p className="text-sm text-gray-600">Verified Profiles</p>
            <p className="text-3xl font-bold text-green-600">
              {verifiedProfiles}
            </p>
          </div>
        </div>

        {/* ================= CERTIFICATES ================= */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Certificate Verification
          </h2>

          {certificates.length === 0 ? (
            <p className="text-gray-600">
              No certificates submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => (
                <div
                  key={cert.cid}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">
                      {cert.skill}
                    </p>

                    <a
                      href={cert.fileURL}
                      target="_blank"
                      className="text-blue-700 font-medium underline hover:text-blue-800"
                    >
                      View Certificate
                    </a>

                    <p className="text-sm">
                      Status:{" "}
                      <span
                        className={
                          cert.status === "approved"
                            ? "text-green-600 font-medium"
                            : "text-yellow-600 font-medium"
                        }
                      >
                        {cert.status}
                      </span>
                    </p>
                  </div>

                  {cert.status !== "approved" && (
                    <button
                      onClick={() =>
                        approveCertificate(
                          cert.uid,
                          cert.cid,
                          cert.skill
                        )
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
