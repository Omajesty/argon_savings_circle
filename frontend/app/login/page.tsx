"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      await api.login(String(data.get("email")), String(data.get("password")));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-peach px-5 py-16">
      <form onSubmit={onSubmit} className="card mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Email goes in as the username. Same as /docs.
        </p>
        <label className="mt-6 block text-xs font-medium text-muted">Email</label>
        <input className="field mt-1" name="email" type="email" required defaultValue="amaka@ajo.com" />
        <label className="mt-4 block text-xs font-medium text-muted">Password</label>
        <input className="field mt-1" name="password" type="password" required defaultValue="secret123" />
        {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
        <button className="btn-teal mt-6 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Login"}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="text-teal">
            Sign up
          </Link>
        </p>
        <p className="mt-6 text-xs leading-5 text-muted">
          Ade: ade@ajo.com · Amaka: amaka@ajo.com · Chinedu: chinedu@ajo.com
          <br />
          Password for all three: secret123
        </p>
      </form>
    </main>
  );
}
