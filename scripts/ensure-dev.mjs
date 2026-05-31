import { spawn, execSync } from "child_process";
import { existsSync, rmSync, writeFileSync, unlinkSync } from "fs";
import { join } from "path";

const PORTS = [3000, 3001];
const LOCK_PATH = join(process.cwd(), ".dev-server.lock");
const clean = process.argv.includes("--clean");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function killPort(port) {
  if (process.platform === "win32") {
    try {
      const output = execSync(`netstat -ano | findstr ":${port}" | findstr "LISTENING"`, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      });
      const pids = new Set();
      for (const line of output.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const pid = trimmed.split(/\s+/).at(-1);
        if (pid && pid !== "0") pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`Stopped process ${pid} on port ${port}`);
        } catch {
          /* already exited */
        }
      }
    } catch {
      /* nothing listening */
    }
    return;
  }

  try {
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null`, {
      stdio: "ignore",
      shell: true,
    });
    console.log(`Cleared port ${port}`);
  } catch {
    /* nothing listening */
  }
}

function removeLock() {
  try {
    unlinkSync(LOCK_PATH);
  } catch {
    /* ignore */
  }
}

function cleanup() {
  removeLock();
}

async function main() {
  if (clean && existsSync(".next")) {
    rmSync(".next", { recursive: true, force: true });
    console.log("Removed .next cache");
  }

  for (const port of PORTS) {
    killPort(port);
  }

  await sleep(500);

  writeFileSync(LOCK_PATH, String(process.pid));

  process.on("SIGINT", () => {
    cleanup();
    process.exit(0);
  });
  process.on("SIGTERM", cleanup);
  process.on("exit", cleanup);

  const nextBin = join(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform === "win32" ? "next.cmd" : "next",
  );

  console.log("Starting dev server on http://localhost:3000 ...");

  const child = spawn(nextBin, ["dev"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    cwd: process.cwd(),
  });

  child.on("exit", (code) => {
    cleanup();
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  cleanup();
  console.error(error);
  process.exit(1);
});
