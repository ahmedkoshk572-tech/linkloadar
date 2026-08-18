import { describe, expect, it } from "vitest";
import { detectPlatform } from "./Home";

describe("detectPlatform", () => {
  it("recognizes common supported platforms", () => {
    expect(detectPlatform("https://youtu.be/example")).toBe("يوتيوب");
    expect(detectPlatform("https://www.tiktok.com/@creator/video/1")).toBe("تيك توك");
    expect(detectPlatform("https://fb.watch/example")).toBe("فيسبوك");
  });

  it("returns a safe fallback for unsupported URLs", () => {
    expect(detectPlatform("https://example.com/video")).toBe("منصة غير معروفة");
  });
});
