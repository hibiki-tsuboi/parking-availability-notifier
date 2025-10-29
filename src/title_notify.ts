import dotenv from "dotenv";
import { chromium } from "playwright";
import { notifySlack } from "./notifier.js";

dotenv.config();

async function run() {
  const urlArg = process.argv[2];
  const url = urlArg || process.env.TITLE_URL;
  const webhook = process.env.SLACK_WEBHOOK_URL;
  const headlessEnv = (process.env.PLAYWRIGHT_HEADLESS ?? "true").toLowerCase();
  const headless = headlessEnv !== "false";

  if (!webhook) throw new Error("SLACK_WEBHOOK_URL が未設定です");
  if (!url) throw new Error("URL が未指定です。引数または TITLE_URL を設定してください");

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    const title = await page.title();
    const text = `サイトにアクセスしました\nURL: ${url}\nタイトル: ${title}`;
    await notifySlack(webhook, text);
    console.log("sent title to Slack:", title);
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

