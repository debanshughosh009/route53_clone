const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("route53_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("route53_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("route53_token");
    localStorage.removeItem("route53_user");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData && errData.detail) {
        errorMsg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function loginUser(username: string, password: string) {
  const data = await request<{ user: any; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(data.token);
  if (typeof window !== "undefined") {
    localStorage.setItem("route53_user", JSON.stringify(data.user));
  }
  return data;
}

export async function getCurrentUser() {
  return request<any>("/api/auth/me");
}

export async function logoutUser() {
  try {
    await request<void>("/api/auth/logout", { method: "POST" });
  } catch {
    // proceed anyway
  }
  removeToken();
}

// ---------------------------------------------------------------------------
// Hosted Zones
// ---------------------------------------------------------------------------
export async function getHostedZones(params: {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  offset?: number;
  limit?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.search) q.append("search", params.search);
  if (params.sortBy) q.append("sort_by", params.sortBy);
  if (params.sortOrder) q.append("sort_order", params.sortOrder);
  if (params.offset !== undefined) q.append("offset", params.offset.toString());
  if (params.limit !== undefined) q.append("limit", params.limit.toString());

  return request<any>(`/api/hosted-zones?${q.toString()}`);
}

export async function getHostedZone(id: string) {
  return request<any>(`/api/hosted-zones/${id}`);
}

export async function createHostedZone(body: {
  name: string;
  type?: string;
  comment?: string;
  vpc_id?: string;
  vpc_region?: string;
}) {
  return request<any>("/api/hosted-zones", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateHostedZone(id: string, body: { comment: string }) {
  return request<any>(`/api/hosted-zones/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteHostedZone(id: string) {
  return request<void>(`/api/hosted-zones/${id}`, {
    method: "DELETE",
  });
}

// ---------------------------------------------------------------------------
// DNS Records
// ---------------------------------------------------------------------------
export async function getRecords(zoneId: string, params: {
  search?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  offset?: number;
  limit?: number;
} = {}) {
  const q = new URLSearchParams();
  if (params.search) q.append("search", params.search);
  if (params.type) q.append("type", params.type);
  if (params.sortBy) q.append("sort_by", params.sortBy);
  if (params.sortOrder) q.append("sort_order", params.sortOrder);
  if (params.offset !== undefined) q.append("offset", params.offset.toString());
  if (params.limit !== undefined) q.append("limit", params.limit.toString());

  return request<any>(`/api/hosted-zones/${zoneId}/records?${q.toString()}`);
}

export async function createRecord(zoneId: string, body: {
  name: string;
  type: string;
  ttl: number;
  values: string[];
  routing_policy?: string;
}) {
  return request<any>(`/api/hosted-zones/${zoneId}/records`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateRecord(zoneId: string, recordId: string, body: {
  name?: string;
  type?: string;
  ttl?: number;
  values?: string[];
  routing_policy?: string;
}) {
  return request<any>(`/api/hosted-zones/${zoneId}/records/${recordId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteRecord(zoneId: string, recordId: string) {
  return request<void>(`/api/hosted-zones/${zoneId}/records/${recordId}`, {
    method: "DELETE",
  });
}

export async function bulkDeleteRecords(zoneId: string, recordIds: string[]) {
  return request<{ deleted: number; protected: string[] }>(`/api/hosted-zones/${zoneId}/records/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ record_ids: recordIds }),
  });
}

export function getExportUrl(zoneId: string, format: "json" | "bind") {
  return `${API_BASE}/api/hosted-zones/${zoneId}/records/export?format=${format}`;
}

export async function importBindFile(zoneId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const res = await fetch(`${API_BASE}/api/hosted-zones/${zoneId}/import`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Import failed" }));
    throw new Error(err.detail || "Import failed");
  }

  return res.json();
}
