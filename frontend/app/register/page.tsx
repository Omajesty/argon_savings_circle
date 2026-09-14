"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      await api.register({
        name: String(data.get("name")),
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      await api.login(String(data.get("email")), String(data.get("password")));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-peach px-5 py-16">
      <form onSubmit={onSubmit} className="card mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-navy">Create a free account</h1>
        <p className="mt-2 text-sm text-muted">
          New people register as members. Then you ask to join a circle —
          Ade has to approve you.
        </p>
        <label className="mt-6 block text-xs font-medium text-muted">Name</label>
        <input className="field mt-1" name="name" required />
        <label className="mt-4 block text-xs font-medium text-muted">Email</label>
        <input className="field mt-1" name="email" type="email" required />
        <label className="mt-4 block text-xs font-medium text-muted">Password</label>
        <input className="field mt-1" name="password" type="password" required minLength={6} />
        {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
        <button className="btn-teal mt-6 w-full" disabled={busy}>
          {busy ? "Creating…" : "Sign Up"}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          Already in a circle?{" "}
          <Link href="/login" className="text-teal">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
