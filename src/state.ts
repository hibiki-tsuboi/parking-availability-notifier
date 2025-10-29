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

export function shouldNotify(state: StateSnapshot, key: string, status: Status): boolean {
  const prev = state.lastNotified[key]?.status;
  // 通知ポリシー: available のときのみ通知。重複は抑止。
  if (status !== "available") return false;
  return prev !== "available";
}

export function markNotified(state: StateSnapshot, key: string, status: Status): void {
  state.lastNotified[key] = { status, at: new Date().toISOString() };
}

