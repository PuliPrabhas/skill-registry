"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set, push, onValue } from "firebase/database";

export default function ProfilePage() {
  const router = useRouter();

  // auth & loading
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // profile
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");

  // skills
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]); // array of { name, verified }

  // certificates (link based)
  const [certSkill, setCertSkill] = useState("");
  const [certURL, setCertURL] = useState("");
  const [certificates, setCertificates] = useState([]); // array

  // UI state
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState(""); // success/info
  const [error, setError] = useState(""); // error messages

  // ----------------- Auth listener -----------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setAuthChecking(false);
        router.push("/login");
        return;
      }
      setUser(u);
      setAuthChecking(false);
    });

    return () => unsub();
  }, [router]);

  // ----------------- Load DB data -----------------
  useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    const certRef = ref(db, `certificates/${user.uid}`);

    const offUser = onValue(userRef, (snap) => {
      const data = snap.val() || {};
      setName(data.name || "");
      setPhoto(data.photo || "");
      // if skills saved as objects, convert to array; if strings, keep them consistent
      const rawSkills = data.skills || {};
      // rawSkills may be { id: "React" } or { id: { name, verified } }
      const skillArr = Object.values(rawSkills).map((s) =>
        typeof s === "string" ? { name: s, verified: false } : { name: s.name, verified: !!s.verified }
      );
      setSkills(skillArr);
    });

    const offCerts = onValue(certRef, (snap) => {
      const data = snap.val() || {};
      const certArr = Object.values(data).map((c) => ({
        skill: c.skill,
        url: c.url,
        status: c.status || "pending",
        uploadedAt: c.uploadedAt || 0,
      }));
      setCertificates(certArr.reverse()); // newest first
    });

    return () => {
      offUser();
      offCerts();
    };
  }, [user]);

  // helper to clear messages after a short while
  useEffect(() => {
    if (!message && !error) return;
    const t = setTimeout(() => {
      setMessage("");
      setError("");
    }, 5000);
    return () => clearTimeout(t);
  }, [message, error]);

  // ----------------- Actions -----------------
  const saveProfile = async () => {
    if (!user) return;
    setLoadingAction(true);
    setError("");
    setMessage("");
    try {
      await set(ref(db, `users/${user.uid}`), {
        email: user.email,
        name: name || "",
        photo: photo || "",
      });
      setMessage("Profile saved ✅");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Check DB rules.");
    } finally {
      setLoadingAction(false);
    }
  };

  const addSkill = async () => {
    if (!skillInput.trim() || !user) return;
    setLoadingAction(true);
    setError("");
    setMessage("");
    try {
      // push an object with name + verified
      await push(ref(db, `users/${user.uid}/skills`), {
        name: skillInput.trim(),
        verified: false,
      });
      setSkillInput("");
      setMessage("Skill added");
    } catch (err) {
      console.error(err);
      setError("Failed to add skill. Check DB rules.");
    } finally {
      setLoadingAction(false);
    }
  };

  const submitCertificate = async () => {
    if (!certSkill.trim() || !certURL.trim() || !user) {
      setError("Please provide skill name and certificate URL");
      return;
    }
    setLoadingAction(true);
    setError("");
    setMessage("");
    try {
      await push(ref(db, `certificates/${user.uid}`), {
        skill: certSkill.trim(),
        url: certURL.trim(),
        status: "pending",
        uploadedAt: Date.now(),
      });
      setCertSkill("");
      setCertURL("");
      setMessage("Certificate submitted for verification ⏳");
    } catch (err) {
      console.error(err);
      setError("Failed to submit certificate. Check DB rules.");
    } finally {
      setLoadingAction(false);
    }
  };

  // ----------------- Render -----------------
  if (authChecking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-700">Checking authentication...</p>
      </main>
    );
  }

  if (!user) return null; // redirecting

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Profile card */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-6">
            <img
              src={photo || "https://i.pravatar.cc/150?img=12"}
              alt="profile"
              className="w-20 h-20 rounded-full object-cover"
            />

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md
                           bg-white text-gray-900 placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-gray-900"
              />

              <label className="block text-sm font-medium text-gray-700 mt-3">Email</label>
              <p className="mt-1 text-gray-700">{user.email}</p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={saveProfile}
                  disabled={loadingAction}
                  className="px-4 py-2 bg-gray-900 text-white rounded-md disabled:opacity-50"
                >
                  {loadingAction ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Your Skills</h2>

          <div className="mt-4 flex gap-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill (e.g. React)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md
                         bg-white text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              onClick={addSkill}
              disabled={loadingAction}
              className="px-4 py-2 bg-gray-900 text-white rounded-md disabled:opacity-50"
            >
              {loadingAction ? "Adding..." : "Add"}
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {skills.length === 0 ? (
              <li className="text-sm text-gray-600">No skills added yet.</li>
            ) : (
              skills.map((s, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center px-4 py-2 border rounded-md bg-gray-50"
                >
                  <span className="text-gray-900">{s.name}</span>
                  <span
                    className={`text-sm font-medium ${
                      s.verified ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {s.verified ? "Verified" : "Pending"}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Certificates (URL based) */}
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Certificates</h2>

          <div className="mt-4 space-y-3">
            <input
              value={certSkill}
              onChange={(e) => setCertSkill(e.target.value)}
              placeholder="Skill name (e.g. React)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md
                         bg-white text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <input
              value={certURL}
              onChange={(e) => setCertURL(e.target.value)}
              placeholder="Certificate URL (Drive / PDF / image link)"
              className="w-full px-4 py-2 border border-gray-300 rounded-md
                         bg-white text-gray-900 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
            />

            <div className="flex gap-3">
              <button
                onClick={submitCertificate}
                disabled={loadingAction}
                className="px-6 py-2 bg-gray-900 text-white rounded-md disabled:opacity-50"
              >
                {loadingAction ? "Submitting..." : "Submit for verification"}
              </button>
            </div>

            {message && <p className="text-sm font-medium text-gray-900">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <ul className="mt-6 space-y-2">
            {certificates.length === 0 ? (
              <li className="text-sm text-gray-600">No certificates submitted yet.</li>
            ) : (
              certificates.map((c, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center px-4 py-2 border rounded-md bg-gray-50"
                >
                  <div>
                    <div className="text-gray-900 font-medium">{c.skill}</div>
                    <a
                      className="text-sm text-blue-600 underline"
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View certificate
                    </a>
                  </div>
                  <div className="text-sm font-medium text-orange-600">{c.status}</div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </main>
  );
}
