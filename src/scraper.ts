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

    // 1) elementIdTemplate が指定されている場合は、その要素の class から判定
    if (target.elementIdTemplate) {
      const idDate = target.elementIdDateStyle === "slash" ? target.date.replaceAll("-", "/") : target.date;
      const elementId = target.elementIdTemplate.replaceAll("{{date}}", idDate);

      // 要素が出現するまで待機
      await page
        .waitForFunction((eid) => !!document.getElementById(eid as string), elementId, { timeout: 20_000 })
        .catch(() => {});

      const className: string | null = await page.evaluate((eid) => {
        const el = document.getElementById(eid as string);
        return el ? (el.getAttribute("class") || "") : null;
      }, elementId);

      if (className) {
        const cls = className.toLowerCase();
        // HND仕様: class に "full" が含まれれば満車、それ以外は空車とみなす
        if (!target.classHints) {
          return cls.includes("full") ? "full" : "available";
        }
        // classHints が与えられている場合は hints に従う
        const hintsAvail = (target.classHints.available ?? []).map((s) => s.toLowerCase());
        const hintsFull = (target.classHints.full ?? []).map((s) => s.toLowerCase());
        if (hintsAvail.some((h) => cls.includes(h))) return "available";
        if (hintsFull.some((h) => cls.includes(h))) return "full";
      }
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
