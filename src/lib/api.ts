const PRODUCTION_API_URL = 'https://payechobackend.onrender.com';

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return PRODUCTION_API_URL;
  }
  return 'http://localhost:3001';
}

export async function apiPostJson<TResponse>(
  path: string,
  body: unknown,
  opts?: { token?: string | null },
): Promise<TResponse> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.token
        ? {
            Authorization: `Bearer ${opts.token}`,
            'privy-id-token': opts.token,
          }
        : {}),
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as TResponse & { message?: string; error?: string };
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? `Request failed: ${res.status}`);
  }
  return data as TResponse;
}

export async function apiGetJson<TResponse>(
  path: string,
  opts?: { token?: string | null },
): Promise<TResponse> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'GET',
    headers: {
      ...(opts?.token
        ? {
            Authorization: `Bearer ${opts.token}`,
            'privy-id-token': opts.token,
          }
        : {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as TResponse & { message?: string; error?: string };
  if (!res.ok) throw new Error(data?.message ?? data?.error ?? `Request failed: ${res.status}`);
  return data as TResponse;
}

export async function apiPatchJson<TResponse>(
  path: string,
  body: unknown,
  opts?: { token?: string | null },
): Promise<TResponse> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.token
        ? {
            Authorization: `Bearer ${opts.token}`,
            'privy-id-token': opts.token,
          }
        : {}),
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as TResponse & { message?: string };
  if (!res.ok) throw new Error(data?.message ?? `Request failed: ${res.status}`);
  return data as TResponse;
}

export async function apiPostBlob(
  path: string,
  body: unknown,
  opts?: { token?: string | null },
): Promise<Blob> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.token
        ? {
            Authorization: `Bearer ${opts.token}`,
            'privy-id-token': opts.token,
          }
        : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string })?.message ?? `Request failed: ${res.status}`);
  }
  return res.blob();
}

