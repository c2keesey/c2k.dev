export type C2kEnv = "production" | "staging" | "feature";

export function getC2kEnv(value = process.env.C2K_ENV): C2kEnv {
  return value === "production" || value === "staging" || value === "feature"
    ? value
    : "feature";
}

export function isPrivateEnvironment(value = process.env.C2K_ENV): boolean {
  const environment = getC2kEnv(value);
  return environment === "staging" || environment === "feature";
}
