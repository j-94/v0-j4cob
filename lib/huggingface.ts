export async function hfFetch(url: string, init: RequestInit): Promise<Response> {
  if (!process.env.HF_TOKEN) {
    throw new Error("Missing HF_TOKEN");
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${process.env.HF_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HF ${res.status}: ${await res.text()}`);
  }

  return res;
}
