"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

export default function EmployerPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const usersRef = ref(db, "users");

  onValue(usersRef, (snapshot) => {
    console.log("SNAPSHOT:", snapshot.val());

    if (!snapshot.exists()) {
      console.log("NO USERS FOUND");
      setProfiles([]);
      setLoading(false);
      return;
    }

    const usersData = snapshot.val();

    const verifiedProfiles = Object.keys(usersData)
  .map((uid) => ({
    uid,
    ...usersData[uid],
  }))
  .filter((user) => user.verified === true)
  .sort((a, b) => (b.verifiedAt || 0) - (a.verifiedAt || 0));

    console.log("VERIFIED PROFILES:", verifiedProfiles);

    setProfiles(verifiedProfiles);
    setLoading(false);
  });
}, []);


  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        <h1 className="text-3xl font-bold text-gray-900">
          Employer – Verified Talent
        </h1>

        {loading && (
          <p className="text-gray-600">Loading profiles...</p>
        )}

        {!loading && profiles.length === 0 && (
          <p className="text-gray-600">
            No verified profiles available.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <div
              key={profile.uid}
              className="bg-white border rounded-lg p-6 space-y-3"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.name || "Unnamed User"}
              </h2>

              <p className="text-sm text-gray-600">
                {profile.email}
              </p>

              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">
                  Verified Skills
                </p>

                <ul className="list-disc list-inside text-gray-700">
                  {profile.skills &&
                    Object.values(profile.skills)
                      .filter((s) => s.verified === true)
                      .map((s, idx) => (
                        <li key={idx}>{s.name}</li>
                      ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
