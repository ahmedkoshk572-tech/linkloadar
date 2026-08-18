import type { Express, Request, Response } from "express";
import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

  app.get("/downloader/download", async (req: Request, res: Response) => {
    let folder = "";
    try {
      const url = validatePublicUrl(req.query.url);
      const formatId = typeof req.query.format_id === "string" && /^[\w+./-]+$/.test(req.query.format_id) ? req.query.format_id : null;
      if (!formatId) return res.status(400).json({ error: "A valid format_id is required" });
      folder = await mkdtemp(join(tmpdir(), "linkload-"));
      const output = join(folder, "video.%(ext)s");
      const selector = `${formatId}+bestaudio/${formatId}/best`;
      await execFileAsync("yt-dlp", ["--no-warnings", "--no-playlist", "--merge-output-format", "mp4", "-f", selector, "-o", output, url], { timeout: 180_000, maxBuffer: 2 * 1024 * 1024 });
      const files = (await readdir(folder)).filter(file => /\.(mp4|webm|mkv|mov|mp3|m4a)$/i.test(file));
      if (!files.length) return res.status(502).json({ error: "The downloader did not produce a media file" });
      const filename = files[0];
      const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
      const mime = ext === "mp3" ? "audio/mpeg" : ext === "webm" ? "video/webm" : ext === "m4a" ? "audio/mp4" : "video/mp4";
      res.setHeader("Content-Type", mime);
      res.setHeader("Content-Disposition", `attachment; filename=\"linkload-video.${ext}\"`);
      const stream = createReadStream(join(folder, filename));
      stream.on("close", () => { void rm(folder, { recursive: true, force: true }); });
      stream.on("error", () => { if (!res.headersSent) res.status(502).json({ error: "The media file could not be read" }); });
      stream.pipe(res);
      return undefined;
    } catch (error) {
      if (folder) await rm(folder, { recursive: true, force: true }).catch(() => undefined);
      const stderr = String((error as { stderr?: string }).stderr || "").toLowerCase();
      if (stderr.includes("sign in") || stderr.includes("cookies")) return res.status(422).json({ error: "This source requires sign-in or cookies" });
      if (stderr.includes("403") || stderr.includes("forbidden")) return res.status(422).json({ error: "The source rejected access (403)" });
      return res.status(422).json({ error: error instanceof Error ? error.message : "Unable to download URL" });
    }
  });
}
