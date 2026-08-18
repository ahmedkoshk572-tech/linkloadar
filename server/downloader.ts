import type { Express, Request, Response } from "express";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { URL } from "node:url";

const execFileAsync = promisify(execFile);

function validatePublicUrl(value: unknown): string {
  if (typeof value !== "string") throw new Error("A URL is required");
  const parsed = new URL(value);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("Only HTTP(S) URLs are supported");
  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "::1" || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) {
    throw new Error("Private network URLs are not allowed");
  }
  return value;
}

async function inspect(url: string) {
  try {
    const { stdout } = await execFileAsync("yt-dlp", ["--dump-single-json", "--no-warnings", "--skip-download", "--no-playlist", url], { timeout: 45_000, maxBuffer: 8 * 1024 * 1024 });
    return JSON.parse(stdout) as Record<string, unknown>;
  } catch (error) {
    const stderr = String((error as { stderr?: string }).stderr || "").toLowerCase();
    if (stderr.includes("sign in") || stderr.includes("cookies")) throw new Error("This source requires sign-in or cookies and cannot be processed anonymously");
    if (stderr.includes("403") || stderr.includes("forbidden")) throw new Error("The source rejected access (403)");
    throw new Error("The public URL is unavailable or unsupported");
  }
}

export function registerDownloaderRoutes(app: Express) {
  app.get("/downloader/health", (_req, res) => res.json({ ok: true, engine: "yt-dlp" }));

  app.get("/downloader/preview", async (req: Request, res: Response) => {
    try {
      const url = validatePublicUrl(req.query.url);
      const info = await inspect(url);
      const formats = Array.isArray(info.formats) ? info.formats.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && item.format_id && item.url)).map(item => ({
        formatId: String(item.format_id), ext: item.ext, width: item.width, height: item.height, fps: item.fps,
        filesize: item.filesize ?? item.filesize_approx, hasAudio: Boolean(item.acodec && item.acodec !== "none"), hasVideo: Boolean(item.vcodec && item.vcodec !== "none"),
      })) : [];
      res.json({ title: info.title, thumbnail: info.thumbnail, duration: info.duration, uploader: info.uploader, formats });
    } catch (error) {
      res.status(422).json({ error: error instanceof Error ? error.message : "Unable to inspect URL" });
    }
  });

  app.get("/downloader/download", (req: Request, res: Response) => {
    try {
      const url = validatePublicUrl(req.query.url);
      const formatId = typeof req.query.format_id === "string" && /^[\w+./-]+$/.test(req.query.format_id) ? req.query.format_id : null;
      if (!formatId) return res.status(400).json({ error: "A valid format_id is required" });
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", "attachment; filename=linkload-video");
      const child = spawn("yt-dlp", ["--no-warnings", "--no-playlist", "-f", formatId, "-o", "-", url], { stdio: ["ignore", "pipe", "pipe"] });
      child.stdout.pipe(res);
      child.stderr.on("data", chunk => console.warn(`[downloader] ${String(chunk).trim()}`));
      child.on("error", () => { if (!res.headersSent) res.status(503).json({ error: "Downloader engine is unavailable" }); else res.end(); });
      req.on("close", () => { if (!child.killed) child.kill("SIGTERM"); });
      return undefined;
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : "Unable to download URL" });
    }
  });
}
