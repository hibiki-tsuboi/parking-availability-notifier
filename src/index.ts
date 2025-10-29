import { loadEnv, loadTargets } from "./config.js";
import { checkAvailability } from "./scraper.js";
import { notifySlack } from "./notifier.js";
import { markNotified, readState, shouldNotify, writeState } from "./state.js";

async function main() {
  const env = loadEnv();
  const app = loadTargets(env.targetConfigPath);
  const state = readState(env.stateFile);

  let notifiedCount = 0;

  for (const t of app.targets) {
    const status = await checkAvailability(t, { headless: env.headless });
    const key = `${t.parking_id}|${t.date}`;

    if (shouldNotify(state, key, status, { always: env.notifyAlways })) {
      const jp = status === "full" ? "満車" : status === "available" ? "空車" : "不明";
      const emoji = status === "full" ? ":x:" : status === "available" ? ":white_check_mark:" : ":question:";
      const msg = [
        "<@U80KNCCE5>",
        `ステータス: ${emoji} ${jp}`,
        `日付: ${t.date}`,
        `URL: ${t.url}`,
      ].join("\n");
      await notifySlack(env.slackWebhookUrl, msg);
      markNotified(state, key, status);
      notifiedCount += 1;
      console.log(`[notify] ${key} -> ${status}`);
    } else {
      console.log(`[skip] ${key} status=${status}`);
    }
  }

  writeState(env.stateFile, state);
  console.log(`done. notified=${notifiedCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
