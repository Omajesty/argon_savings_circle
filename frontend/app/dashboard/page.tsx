"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, useEffect, useState } from "react";
import {
  api,
  naira,
  type CircleSummary,
  type MembershipRequest,
  type User,
} from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [circles, setCircles] = useState<CircleSummary[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      const me = await api.me();
      setUser(me);
      setCircles(await api.circles());
      if (me.role === "admin") {
        const [users, inbox] = await Promise.all([
          api.users(),
          api.allRequests(),
        ]);
        setPeople(users);
        setRequests(inbox.filter((row) => row.status === "pending"));
      }
    } catch {
      router.replace("/login");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createCircle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const circle = await api.createCircle({
        name: String(data.get("name")),
        weekly_amount: Number(data.get("weekly_amount")),
        member_limit: Number(data.get("member_limit")),
      });
      router.push(`/circles/${circle.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create");
    }
  }

  async function sendJoin(id: number) {
    setError("");
    setNotice("");
    try {
      await api.join(id);
      setNotice("Request sent. The circle admin has to approve you.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join");
    }
  }

  async function joinCircle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await sendJoin(Number(data.get("circle_id")));
  }

  async function joinFromCard(e: MouseEvent, id: number) {
    e.preventDefault();
    e.stopPropagation();
    await sendJoin(id);
  }

  function personName(userId: number) {
    return people.find((p) => p.id === userId)?.name || `user ${userId}`;
  }

  if (!user) {
    return <main className="px-5 py-20 text-center text-muted">Loading…</main>;
  }

  const pending = requests.filter((row) =>
    circles.some((c) => c.id === row.circle_id && c.admin_id === user.id),
  );

  return (
    <main className="bg-paper min-h-[80vh] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm text-teal">Hello, {user.name}</p>
        <h1 className="mt-1 text-3xl font-bold text-navy">Circles</h1>
        <p className="mt-2 text-sm text-muted">
          {user.role === "admin"
            ? "Create a circle, approve join requests, then declare payouts."
            : "Ask to join. The admin has to approve you before you can open the books or pay."}
        </p>

        {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
        {notice ? <p className="mt-4 text-sm text-teal">{notice}</p> : null}

        {user.role === "admin" && pending.length > 0 ? (
          <div className="card mt-8">
            <h3 className="font-semibold text-navy">Pending join requests</h3>
            <div className="mt-4 space-y-2 text-sm">
              {pending.map((row) => (
                <div
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper px-4 py-2"
                >
                  <span>
                    {personName(row.user_id)} wants circle #{row.circle_id}
                  </span>
                  <div className="flex gap-3">
                    <Link href={`/circles/${row.circle_id}`} className="text-muted">
                      Open
                    </Link>
                    <button
                      type="button"
                      className="text-teal"
                      onClick={() =>
                        api
                          .approveRequest(row.circle_id, row.id)
                          .then(() => {
                            setNotice("Request approved.");
                            return load();
                          })
                          .catch((err) =>
                            setError(
                              err instanceof Error ? err.message : "Could not approve",
                            ),
                          )
                      }
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {circles.map((circle) => (
            <Link
              key={circle.id}
              href={`/circles/${circle.id}`}
              className="card block hover:ring-2 hover:ring-teal/40"
            >
              <p className="text-xs text-muted">Circle #{circle.id}</p>
              <h2 className="mt-1 text-xl font-semibold text-navy">{circle.name}</h2>
              <p className="mt-3 text-sm text-muted">
                Week {circle.current_week} · {circle.member_count}/
                {circle.member_limit} members · {naira(circle.weekly_amount)} / week
              </p>
              {circle.admin_id === user.id ? (
                <p className="mt-3 text-xs font-medium text-teal">You run this circle</p>
              ) : (
                <button
                  type="button"
                  className="btn-ghost mt-4 !px-4 !py-2"
                  onClick={(e) => joinFromCard(e, circle.id)}
                >
                  Ask to join
                </button>
              )}
            </Link>
          ))}
          {circles.length === 0 ? (
            <p className="text-sm text-muted">No circles yet.</p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <form onSubmit={joinCircle} className="card">
            <h3 className="font-semibold text-navy">Ask to join by id</h3>
            <input
              className="field mt-4"
              name="circle_id"
              type="number"
              min={1}
              placeholder="Circle id"
              required
            />
            <button className="btn-teal mt-4">Send request</button>
          </form>

          {user.role === "admin" ? (
            <form onSubmit={createCircle} className="card">
              <h3 className="font-semibold text-navy">Create a circle</h3>
              <input className="field mt-4" name="name" placeholder="Name" required />
              <input
                className="field mt-3"
                name="weekly_amount"
                type="number"
                min={1}
                placeholder="Weekly amount"
                required
              />
              <input
                className="field mt-3"
                name="member_limit"
                type="number"
                min={2}
                placeholder="Member limit"
                required
              />
              <button className="btn-teal mt-4 !bg-orange hover:!bg-orange-soft">
                Create
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </main>
  );
}
