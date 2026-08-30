import { describe, expect, it } from "vitest";
import { getC2kEnv, isPrivateEnvironment } from "@/lib/env";

describe("runtime environment gating", () => {
  it("defaults local work to feature mode", () => expect(getC2kEnv(undefined)).toBe("feature"));
  it("gates private routes in production", () => expect(isPrivateEnvironment("production")).toBe(false));
  it.each(["feature", "staging"])("enables private routes in %s", (value) => expect(isPrivateEnvironment(value)).toBe(true));
  it("treats invalid values as feature mode", () => expect(isPrivateEnvironment("unexpected")).toBe(true));
});
