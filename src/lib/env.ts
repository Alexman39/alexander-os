import "server-only";
import { parseServerEnv, type ServerEnv } from "./env-schema";

let cached: ServerEnv | null = null;

/**
 * Validated server environment. Parsed on first use (not at import time) so
 * builds and pages that don't need secrets still work; throws an `EnvError`
 * naming every missing or malformed key.
 */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
