import dotenv from "dotenv";
import { chromium } from "playwright";
import { notifySlack } from "./notifier.js";

dotenv.config();

async function run() {
  const idArg = process.argv[2];
  const urlArg = process.argv[3];
  const id = idArg || process.env.CALENDAR_CELL_ID;
  const url = urlArg || process.env.TITLE_URL || "https://hnd-rsv.aeif.or.jp/airport2/app/toppage";
  const webhook = process.env.SLACK_WEBHOOK_URL;
  const headlessEnv = (process.env.PLAYWRIGHT_HEADLESS ?? "true").toLowerCase();
  const headless = headlessEnv !== "false";

  if (!webhook) throw new Error("SLACK_WEBHOOK_URL が未設定です");
  if (!id) throw new Error("要素ID が未指定です。引数または CALENDAR_CELL_ID を設定してください");

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });

    // 要素の存在を待つ（CSSエスケープを避け、DOM APIで待機）
    await page.waitForFunction(
      (targetId) => !!document.getElementById(targetId as string),
      id,
      { timeout: 30_000 }
    );

    const info = await page.evaluate((targetId) => {
      const el = document.getElementById(targetId as string);
      if (!el) return null;
      const cls = el.getAttribute("class") || "";
      const text = (el.textContent || "").trim();
      return { className: cls, text };
    }, id);

    if (!info) {
      throw new Error(`ID='${id}' の要素が見つかりませんでした`);
    }

    const isFull = (info.className || "").toLowerCase().includes("full");
    const statusJp = isFull ? "満車" : "空車";
    const emoji = isFull ? ":x:" : ":white_check_mark:";
    const text = [
      "<@U80KNCCE5>",
      `ステータス: ${emoji} ${statusJp}`,
      `日付: ${id.split("-").slice(2).join("-")}`,
      `URL: ${url}`,
      `class: ${info.className || "(empty)"}`,
      info.text ? `text: ${info.text}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    await notifySlack(webhook, text);
    console.log("sent class info to Slack:", info);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
