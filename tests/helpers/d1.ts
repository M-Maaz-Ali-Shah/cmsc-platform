import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Runs a read-only query against the local D1 database via the same
 * `wrangler d1 execute --local` CLI used for manual verification
 * throughout this project's development. Lets tests assert on internal
 * state (e.g. "no duplicate row was created") that isn't otherwise
 * observable through the UI alone.
 *
 * Uses `exec` with a single quoted command string rather than
 * `execFile` with an argument array — `npx` is a .cmd shim on Windows
 * and can only be spawned through a shell, and passing an args array
 * through a shell re-splits an unquoted multi-word --command value on
 * whitespace (breaking the SQL). A single pre-quoted string sidesteps
 * both problems.
 *
 * Not for use against --remote / production — this is a local dev/CI
 * testing helper only.
 */
export async function queryD1<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  const escaped = sql.replace(/"/g, '\\"');
  const { stdout } = await execAsync(
    `npx wrangler d1 execute cmsc-platform-db --local --json --command "${escaped}"`,
    { cwd: process.cwd() }
  );
  const parsed = JSON.parse(stdout);
  return parsed[0]?.results ?? [];
}
