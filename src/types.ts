export type Status = "available" | "full" | "unknown";

export interface SelectorsConfig {
  available?: string; // CSS selector that indicates availability
  full?: string; // CSS selector that indicates full
}

export interface TextHintsConfig {
  available?: string[]; // words like ["空き", "空車", "available"]
  full?: string[]; // words like ["満車", "full"]
}

export interface TargetConfig {
  parking_id: string;
  url: string;
  date: string; // YYYY-MM-DD
  selectors?: SelectorsConfig; // may include "{{date}}" placeholder
  textHints?: TextHintsConfig;
  // HND等、カレンダーセルのIDから判定する場合
  elementIdTemplate?: string; // e.g. "0-0-{{date}}"
  elementIdDateStyle?: "dash" | "slash"; // how to inject date in template (YYYY-MM-DD vs YYYY/MM/DD)
  classHints?: TextHintsConfig; // class属性に含まれる語で判定
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
  waitForSelector?: string; // optional selector to wait for
}

export interface AppConfig {
  targets: TargetConfig[];
}

export interface EnvConfig {
  slackWebhookUrl: string;
  stateFile: string;
  targetConfigPath: string;
  headless: boolean;
  notifyAlways: boolean;
}

export interface StateSnapshot {
  lastNotified: Record<string, { status: Status; at: string }>; // key: parking_id|date
}
