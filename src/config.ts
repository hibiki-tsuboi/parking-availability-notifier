import { z } from "zod";
import dotenv from "dotenv";
import { AppConfig, EnvConfig, TargetConfig } from "./types.js";
import fs from "node:fs";
import path from "node:path";

dotenv.config();

const envSchema = z.object({
  SLACK_WEBHOOK_URL: z.string().url(),
  TARGET_CONFIG: z.string().default("config/targets.json"),
  STATE_FILE: z.string().default("data/state.json"),
  PLAYWRIGHT_HEADLESS: z
    .string()
    .optional()
    .transform((v) => (v ?? "true").toLowerCase() !== "false"),
  NOTIFY_ALWAYS: z
    .string()
    .optional()
    .transform((v) => (v ?? "false").toLowerCase() === "true"),
  SLACK_MENTION_ID: z.string().optional(),
});

export function loadEnv(): EnvConfig {
  const parsed = envSchema.parse(process.env);
  const normalizeMention = (v?: string): string | null => {
    if (!v) return null;
    const s = v.trim();
    if (!s) return null;
    if (/^<@[^>]+>$/.test(s)) return s;
    if (/^[A-Za-z][A-Za-z0-9]+$/.test(s)) return `<@${s}>`;
    return s;
  };
  return {
    slackWebhookUrl: parsed.SLACK_WEBHOOK_URL,
    targetConfigPath: parsed.TARGET_CONFIG,
    stateFile: parsed.STATE_FILE,
    headless: parsed.PLAYWRIGHT_HEADLESS as boolean,
    notifyAlways: parsed.NOTIFY_ALWAYS as boolean,
    slackMention: normalizeMention(parsed.SLACK_MENTION_ID),
  };
}

const targetSchema: z.ZodType<TargetConfig> = z.object({
  parking_id: z.string().min(1),
  url: z.string().url(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u, "YYYY-MM-DD 形式で指定してください"),
  selectors: z
    .object({
      available: z.string().optional(),
      full: z.string().optional(),
    })
    .optional(),
  textHints: z
    .object({
      available: z.array(z.string()).optional(),
      full: z.array(z.string()).optional(),
    })
    .optional(),
  elementIdTemplate: z.string().optional(),
  elementIdDateStyle: z.enum(["dash", "slash"]).optional(),
  classHints: z
    .object({
      available: z.array(z.string()).optional(),
      full: z.array(z.string()).optional(),
    })
    .optional(),
  waitUntil: z.enum(["load", "domcontentloaded", "networkidle"]).optional(),
  waitForSelector: z.string().optional(),
});

const appConfigSchema = z.object({
  targets: z.array(targetSchema).min(1),
});

export function loadTargets(configPath: string): AppConfig {
  const p = path.resolve(configPath);
  const raw = fs.readFileSync(p, "utf8");
  const json = JSON.parse(raw);
  return appConfigSchema.parse(json);
}
