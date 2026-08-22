import * as SecureStore from "expo-secure-store";

const DEFAULT_API_URL = "https://your-downloader-backend.example.com";
const API_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export type MediaFormat = {
  formatId: string;
  ext?: string;
  width?: number;
  height?: number;
  fps?: number;
  filesize?: number;
  hasAudio?: boolean;
  hasVideo?: boolean;
};

export type PreviewInfo = {
  title?: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  formats: MediaFormat[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await SecureStore.getItemAsync("linkload_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.message || payload.detail || "تعذر الاتصال بخدمة LinkLoad.");
  return payload as T;
}

export function analyze(url: string) {
  return request<PreviewInfo>(`/downloader/preview?url=${encodeURIComponent(url)}`);
}

export function downloadUrl(url: string, formatId: string) {
  return `${API_URL}/downloader/download?url=${encodeURIComponent(url)}&format_id=${encodeURIComponent(formatId)}`;
}

export function health() {
  return request<{ ok: boolean; engine: string }>("/downloader/health");
}
