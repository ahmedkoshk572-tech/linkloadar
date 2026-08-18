import { describe, expect, it } from "vitest";
import { copy, detectPlatform, qualities } from "./Home";

describe("downloader options", () => {
  it("recognizes common supported platforms", () => {
    expect(detectPlatform("https://youtu.be/example")).toBe("YouTube");
    expect(detectPlatform("https://www.tiktok.com/@creator/video/1")).toBe("TikTok");
    expect(detectPlatform("https://fb.watch/example")).toBe("Facebook");
  });

  it("contains quality options from 360p through 4K", () => {
    expect(qualities.some((quality) => quality.detail.startsWith("2160p"))).toBe(true);
    expect(qualities.some((quality) => quality.detail.startsWith("360p"))).toBe(true);
    expect(qualities).toHaveLength(6);
  });

  it("keeps Arabic RTL and English LTR translation metadata", () => {
    expect(copy.ar.dir).toBe("rtl");
    expect(copy.en.dir).toBe("ltr");
    expect(copy.ar.other).toBe("English");
    expect(copy.en.other).toBe("العربية");
  });

  it("returns a safe fallback for unsupported URLs", () => {
    expect(detectPlatform("https://example.com/video")).toBe("Unknown platform");
  });
});
