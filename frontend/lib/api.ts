const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
};

export type TurnMember = {
  user_id: number;
  name: string;
  turn_position: number;
};

export type Circle = {
  id: number;
  name: string;
  weekly_amount: number;
  member_limit: number;
  current_week: number;
  admin_id: number;
  pot: number;
  member_count: number;
  turn_order: TurnMember[];
  next_user_id: number | null;
  next_user_name: string | null;
};

export type CircleSummary = {
  id: number;
  name: string;
  weekly_amount: number;
  member_limit: number;
  current_week: number;
  member_count: number;
  admin_id: number;
};

export type Contribution = {
  id: number;
  user_id: number;
  circle_id: number;
  amount: number;
  week: number;
  confirmed: boolean;
  created_at: string;
};

export type MembershipRequest = {
  id: number;
  user_id: number;
  circle_id: number;
  status: "pending" | "approved" | "rejected";
};

export type CircleHealth = {
  week: number;
  paid: { user_id: number; name: string }[];
  behind: { user_id: number; name: string }[];
};

function token() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("ajo_token") || "";
}

async function parseError(res: Response) {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    return JSON.stringify(data.detail);
  } catch {
    return res.statusText;
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean; form?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!init.form) headers.set("Content-Type", "application/json");
  if (init.auth !== false && token()) {
    headers.set("Authorization", `Bearer ${token()}`);
  }
  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(await parseError(res));
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function naira(n: number) {
  return `₦${n.toLocaleString("en-NG")}`;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  login: async (email: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    const data = await request<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: form,
      form: true,
      auth: false,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    localStorage.setItem("ajo_token", data.access_token);
    return data;
  },

  me: () => request<User>("/auth/me"),

  circles: () => request<CircleSummary[]>("/circles"),

  circle: (id: number) => request<Circle>(`/circles/${id}`),

  createCircle: (body: {
    name: string;
    weekly_amount: number;
    member_limit: number;
  }) =>
    request<Circle>("/admin/circles", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  join: (id: number) =>
    request<MembershipRequest>(`/circles/${id}/join`, { method: "POST" }),

  users: () => request<User[]>("/admin/users"),

  allRequests: () => request<MembershipRequest[]>("/admin/requests"),

  circleRequests: (id: number) =>
    request<MembershipRequest[]>(`/admin/circles/${id}/requests`),

  approveRequest: (circleId: number, requestId: number) =>
    request(`/admin/circles/${circleId}/requests/${requestId}/approve`, {
      method: "POST",
    }),

  setTurns: (id: number, user_ids: number[]) =>
    request<Circle>(`/admin/circles/${id}/turn-order`, {
      method: "PUT",
      body: JSON.stringify({ user_ids }),
    }),

  health: (id: number) => request<CircleHealth>(`/circles/${id}/health`),

  contribute: (id: number, amount: number) =>
    request<Contribution>(`/circles/${id}/contributions`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  myContributions: (id: number) =>
    request<Contribution[]>(`/circles/${id}/contributions/me`),

  myAllContributions: () =>
    request<Contribution[]>("/circles/my_contributions"),

  payout: (id: number, user_id: number) =>
    request(`/circles/${id}/payouts`, {
      method: "POST",
      body: JSON.stringify({ user_id }),
    }),
};

export function logout() {
  localStorage.removeItem("ajo_token");
}
