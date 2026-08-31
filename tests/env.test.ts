import { describe, expect, it } from "vitest";
import { getC2kEnv, isPrivateEnvironment } from "@/lib/env";

describe("runtime environment gating", () => {
  it("fails closed when deployment configuration is absent", () => expect(getC2kEnv(undefined)).toBe("production"));
  it("gates private routes in production", () => expect(isPrivateEnvironment("production")).toBe(false));
  it.each(["feature", "staging"])("enables private routes in %s", (value) => expect(isPrivateEnvironment(value)).toBe(true));
  it("fails closed when deployment configuration is invalid", () => expect(isPrivateEnvironment("unexpected")).toBe(false));
});
