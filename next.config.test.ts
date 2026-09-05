import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("Next.js configuration", () => {
  it("allows Codespaces forwarded hosts without disabling Server Action origin checks", () => {
    const allowedOrigins = nextConfig.experimental?.serverActions?.allowedOrigins ?? [];

    expect(allowedOrigins).toContain("localhost:3000");
    expect(allowedOrigins).toContain("127.0.0.1:3000");
    expect(allowedOrigins).toContain("*.app.github.dev");
    expect(allowedOrigins).not.toContain("*");
  });
});
