import fs from "node:fs";
import path from "node:path";
import { StateSnapshot, Status } from "./types.js";

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function readState(filePath: string): StateSnapshot {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as StateSnapshot;
  } catch {
    return { lastNotified: {} };
  }
}

export function writeState(filePath: string, state: StateSnapshot): void {
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

export function shouldNotify(state: StateSnapshot, key: string, status: Status, opts?: { always?: boolean }): boolean {
  const prev = state.lastNotified[key]?.status;
  // 通知ポリシー: 満車/空車のいずれも通知し、同一ステータスは重複抑止。unknown は通知しない。
  if (status === "unknown") return false;
  
  const datesWithNoFullNotification = ["2025-11-22", "2025-11-23", "2025-11-24"];
  const shouldBlockFull = datesWithNoFullNotification.some(date => key.endsWith(`|${date}`));
  if (shouldBlockFull && status === "full") {
    return false;
  }
  
  if (opts?.always) return true;
  return prev !== status;
}

export function markNotified(state: StateSnapshot, key: string, status: Status): void {
  state.lastNotified[key] = { status, at: new Date().toISOString() };
}
