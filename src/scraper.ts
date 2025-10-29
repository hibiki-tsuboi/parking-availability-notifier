import { chromium } from "playwright";
import type { Status, TargetConfig } from "./types.js";

function applyDatePlaceholder(selector: string | undefined, date: string): string | undefined {
  if (!selector) return selector;
  return selector.replaceAll("{{date}}", date);
}

export async function checkAvailability(target: TargetConfig, opts: { headless: boolean }): Promise<Status> {
  const browser = await chromium.launch({ headless: opts.headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(target.url, { waitUntil: target.waitUntil ?? "load", timeout: 60_000 });
    if (target.waitForSelector) {
      await page.waitForSelector(applyDatePlaceholder(target.waitForSelector, target.date)!, { timeout: 15_000 }).catch(() => {});
    }

    const availableSel = applyDatePlaceholder(target.selectors?.available, target.date);
    const fullSel = applyDatePlaceholder(target.selectors?.full, target.date);

    if (availableSel) {
      const has = await page.$(availableSel);
      if (has) return "available";
    }
    if (fullSel) {
      const has = await page.$(fullSel);
      if (has) return "full";
    }

    // Fallback: text hints scan
    const content = (await page.content()).toLowerCase();
    const hintsAvail = (target.textHints?.available ?? []).map((s) => s.toLowerCase());
    const hintsFull = (target.textHints?.full ?? []).map((s) => s.toLowerCase());
    if (hintsAvail.some((h) => content.includes(h))) return "available";
    if (hintsFull.some((h) => content.includes(h))) return "full";

    return "unknown";
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
}

