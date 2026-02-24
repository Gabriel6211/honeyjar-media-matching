import type { SearchRequest, SearchResponse } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function searchReporters(
  request: SearchRequest
): Promise<SearchResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Search failed: ${res.status}`);
    }

    return res.json();
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Could not connect to backend. Is it running on port 4000?");
    }
    throw err;
  }
}
