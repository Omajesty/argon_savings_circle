"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  api,
  naira,
  type Circle,
  type CircleHealth,
  type Contribution,
  type MembershipRequest,
  type User,
} from "@/lib/api";

export default function CirclePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [user, setUser] = useState<User | null>(null);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [health, setHealth] = useState<CircleHealth | null>(null);
  const [history, setHistory] = useState<Contribution[]>([]);
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [people, setPeople] = useState<User[]>([]);
  const [order, setOrder] = useState<Circle["turn_order"]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [forbidden, setForbidden] = useState(false);

  async function load() {
    try {
      const me = await api.me();
      setUser(me);
      try {
        const c = await api.circle(id);
        setCircle(c);
        setOrder(c.turn_order);
        setForbidden(false);
        setHealth(await api.health(id));
        if (me.id !== c.admin_id || c.turn_order.some((m) => m.user_id === me.id)) {
          try {
            setHistory(await api.myContributions(id));
          } catch {
            setHistory([]);
          }
        }
        if (me.id === c.admin_id) {
          try {
            const [inbox, users] = await Promise.all([
              api.circleRequests(id),
              api.users(),
            ]);
            setRequests(inbox);
            setPeople(users);
          } catch {
            setRequests([]);
          }
        }
      } catch {
        setCircle(null);
        setForbidden(true);
      }
    } catch {
      router.replace("/login");
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function run(fn: () => Promise<unknown>, ok?: string) {
    setError("");
    setNotice("");
    try {
      await fn();
      if (ok) setNotice(ok);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
    }
  }

  function personName(userId: number) {
    return people.find((p) => p.id === userId)?.name || `user ${userId}`;
  }

  function moveTurn(index: number, direction: number) {
    const next = [...order];
    const swap = index + direction;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setOrder(next);
  }

  if (!user) {
    return <main className="px-5 py-20 text-center text-muted">Loading…</main>;
  }

  if (forbidden || !circle) {
    return (
      <main className="bg-paper min-h-[80vh] px-5 py-12">
        <div className="mx-auto max-w-xl">
          <Link href="/dashboard" className="text-sm text-teal">
            ← Circles
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-navy">Circle #{id}</h1>
          <p className="mt-3 text-sm text-muted">
            You are not a member yet. Send a request and wait for the admin to
            approve you.
          </p>
          {error ? <p className="mt-4 text-sm text-orange">{error}</p> : null}
          {notice ? <p className="mt-4 text-sm text-teal">{notice}</p> : null}
          <button
            className="btn-teal mt-6"
            onClick={() =>
              run(() => api.join(id), "Request sent. Wait for approval.")
            }
          >
            Ask to join
          </button>
        </div>
      </main>
    );
  }

  const isAdmin = user.id === circle.admin_id;
  const isMember = circle.turn_order.some((m) => m.user_id === user.id);

  return (
    <main className="bg-paper min-h-[80vh] px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm text-teal">
          ← Circles
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Circle #{circle.id}</p>
            <h1 className="text-3xl font-bold text-navy">{circle.name}</h1>
          </div>
          <div className="rounded-pill bg-peach px-5 py-2 text-sm text-navy">
            Week {circle.current_week} · next {circle.next_user_name || "—"}
          </div>
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl bg-peach px-4 py-3 text-sm text-orange">{error}</p>
        ) : null}
        {notice ? (
          <p className="mt-5 rounded-2xl bg-teal-pale px-4 py-3 text-sm text-teal-dark">
            {notice}
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="card md:col-span-1">
            <p className="text-xs uppercase tracking-wide text-muted">This week&apos;s pot</p>
            <p className="mt-2 text-4xl font-semibold text-navy">{naira(circle.pot)}</p>
            <p className="mt-2 text-sm text-muted">
              {naira(circle.weekly_amount)} each · {circle.member_count}/
              {circle.member_limit} people
            </p>
          </div>
          <div className="card md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted">Turn order</p>
            <ol className="mt-4 flex flex-wrap gap-3">
              {circle.turn_order.map((m) => (
                <li
                  key={m.user_id}
                  className={`rounded-pill px-4 py-2 text-sm ${
                    m.user_id === circle.next_user_id
                      ? "bg-orange text-white"
                      : "bg-teal-pale text-navy"
                  }`}
                >
                  {m.turn_position}. {m.name}
                </li>
              ))}
              {circle.turn_order.length === 0 ? (
                <li className="text-sm text-muted">Nobody has joined yet.</li>
              ) : null}
            </ol>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="card">
            <h2 className="font-semibold text-navy">Who is behind</h2>
            <div className="mt-4 space-y-2 text-sm">
              {health?.paid.map((p) => (
                <p key={p.user_id} className="rounded-xl bg-teal-pale px-4 py-2">
                  {p.name} — paid
                </p>
              ))}
              {health?.behind.map((p) => (
                <p key={p.user_id} className="rounded-xl bg-peach px-4 py-2">
                  {p.name} — behind
                </p>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-navy">Your history</h2>
            {isMember ? (
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {history.map((row) => (
                  <li key={row.id} className="flex justify-between rounded-xl bg-paper px-4 py-2">
                    <span>
                      Week {row.week} · #{row.id}
                    </span>
                    <span>
                      {naira(row.amount)} {row.confirmed ? "· cleared" : ""}
                    </span>
                  </li>
                ))}
                {history.length === 0 ? <li>No payments yet.</li> : null}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">
                You run this circle. You are not on the turn list unless you join.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {isMember ? (
            <div className="card">
              <h2 className="font-semibold text-navy">Record this week</h2>
              <p className="mt-2 text-sm text-muted">
                Amount is fixed at {naira(circle.weekly_amount)}.
              </p>
              <button
                className="btn-teal mt-5"
                onClick={() =>
                  run(
                    () => api.contribute(id, circle.weekly_amount),
                    "Contribution recorded.",
                  )
                }
              >
                Pay {naira(circle.weekly_amount)}
              </button>
            </div>
          ) : null}

          {isAdmin ? (
            <div className="card">
              <h2 className="font-semibold text-navy">Declare payout</h2>
              <p className="mt-2 text-sm text-muted">
                Only the person whose turn it is. Anyone else is 409.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="btn-teal !bg-orange hover:!bg-orange-soft"
                  disabled={!circle.next_user_id}
                  onClick={() =>
                    circle.next_user_id &&
                    run(
                      () => api.payout(id, circle.next_user_id as number),
                      "Payout declared.",
                    )
                  }
                >
                  Pay {circle.next_user_name || "next"}
                </button>
                {circle.turn_order
                  .filter((m) => m.user_id !== circle.next_user_id)
                  .map((m) => (
                    <button
                      key={m.user_id}
                      className="btn-ghost"
                      onClick={() => run(() => api.payout(id, m.user_id))}
                    >
                      Try {m.name}
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </div>

        {isAdmin ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                run(
                  () => api.approveRequest(id, Number(data.get("request_id"))),
                  "Request approved.",
                );
                e.currentTarget.reset();
              }}
              className="card"
            >
              <h2 className="font-semibold text-navy">Join requests</h2>
              <p className="mt-2 text-sm text-muted">
                Approve a pending request. Members are not in the circle until
                you do.
              </p>
              <div className="mt-4 space-y-2 text-sm">
                {requests.map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-xl bg-paper px-4 py-2"
                  >
                    <span>
                      {personName(row.user_id)} · request #{row.id}
                    </span>
                    <button
                      type="button"
                      className="text-teal"
                      onClick={() =>
                        run(
                          () => api.approveRequest(id, row.id),
                          "Request approved.",
                        )
                      }
                    >
                      Approve
                    </button>
                  </div>
                ))}
                {requests.length === 0 ? (
                  <p className="text-muted">No pending requests.</p>
                ) : null}
              </div>
            </form>
            <div className="card">
              <h2 className="font-semibold text-navy">Turn list</h2>
              <p className="mt-2 text-sm text-muted">
                Must include each member exactly once, then save.
              </p>
              <ol className="mt-4 space-y-2">
                {order.map((m, index) => (
                  <li
                    key={m.user_id}
                    className="flex items-center justify-between rounded-xl bg-paper px-4 py-2 text-sm"
                  >
                    <span>
                      {index + 1}. {m.name}
                    </span>
                    <span className="flex gap-2">
                      <button
                        type="button"
                        className="text-teal"
                        onClick={() => moveTurn(index, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="text-teal"
                        onClick={() => moveTurn(index, 1)}
                      >
                        Down
                      </button>
                    </span>
                  </li>
                ))}
                {order.length === 0 ? (
                  <li className="text-sm text-muted">Nobody has been approved yet.</li>
                ) : null}
              </ol>
              {order.length > 0 ? (
                <button
                  className="btn-teal mt-4"
                  onClick={() =>
                    run(
                      () => api.setTurns(id, order.map((m) => m.user_id)),
                      "Turn order saved.",
                    )
                  }
                >
                  Save turn order
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
