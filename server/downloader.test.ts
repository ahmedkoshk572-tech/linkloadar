import { describe, expect, it } from "vitest";
import { classifyYtdlpError } from "./downloader";

describe("downloader error classification", () => {
  it("distinguishes protected and unavailable sources", () => {
    expect(classifyYtdlpError("Sign in to confirm you are not a bot")).toContain("sign-in");
    expect(classifyYtdlpError("HTTP Error 403 Forbidden")).toContain("403");
    expect(classifyYtdlpError("DRM encrypted protected content")).toContain("DRM");
    expect(classifyYtdlpError("no extractor found")).toContain("unavailable");
  });
});
