"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);

  // Protect route
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setName(currentUser.displayName || "");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) return null;

  // Add skill locally (no DB yet)
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    setSkills([...skills, { name: skillInput, status: "Pending" }]);
    setSkillInput("");
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* PROFILE CARD */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center gap-6">
          <img
            src="https://i.pravatar.cc/100"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />

          <div className="flex-1">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md
                         text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <p className="mt-2 text-sm text-gray-600">
              {user.email}
            </p>

            <button
              type="button"
              className="mt-4 px-5 py-2 bg-gray-900 text-white rounded-md
                         hover:bg-gray-700 transition"
            >
              Save Profile
            </button>
          </div>
        </div>

        {/* SKILLS SECTION */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Skills
          </h2>

          <div className="mt-4 flex gap-3">
            <input
              type="text"
              placeholder="Add a skill (e.g. React)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md
                         text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <button
              type="button"
              onClick={handleAddSkill}
              className="px-5 py-2 bg-gray-900 text-white rounded-md
                         hover:bg-gray-700 transition"
            >
              Add
            </button>
          </div>

          {/* Skills List */}
          {skills.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">
              No skills added yet.
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {skills.map((skill, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between
                             px-4 py-2 border border-gray-200 rounded-md"
                >
                  <span className="text-gray-900">
                    {skill.name}
                  </span>

                  <span className="text-sm text-orange-600">
                    {skill.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CERTIFICATE UPLOAD SECTION */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Skill Certificates
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Upload proof of your skills for verification.
          </p>

          <div className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Skill name (e.g. React)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md
                         text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <input
              type="url"
              placeholder="Certificate URL (PDF / image link)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md
                         text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <button
              type="button"
              className="px-5 py-2 bg-gray-900 text-white rounded-md
                         hover:bg-gray-700 transition"
            >
              Upload Certificate
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Uploaded certificates will be reviewed by admins.
          </p>
        </div>

      </div>
    </main>
  );
}
