import { loadEnv, loadTargets } from "./config.js";
import { checkAvailability } from "./scraper.js";
import { notifySlack } from "./notifier.js";
import { markNotified, readState, shouldNotify, writeState } from "./state.js";

async function main() {
  const env = loadEnv();
  const app = loadTargets(env.targetConfigPath);
  const state = env.disableState ? { lastNotified: {} } : readState(env.stateFile);

  let notifiedCount = 0;

  for (const t of app.targets) {
    const status = await checkAvailability(t, { headless: env.headless });
    const key = `${t.parking_id}|${t.date}`;

    if (shouldNotify(state, key, status, { always: env.notifyAlways })) {
      const jp = status === "full" ? "満車" : status === "available" ? "空車" : "不明";
      const emoji = status === "full" ? ":x:" : status === "available" ? ":white_check_mark:" : ":question:";
      const msgParts = [
        `ステータス: ${emoji} ${jp}`,
        `日付: ${t.date}`,
        `URL: ${t.url}`,
      ];
      const msg = env.slackMention 
        ? `${env.slackMention}\n${msgParts.join("\n")}`
        : msgParts.join("\n");
      await notifySlack(env.slackWebhookUrl, msg, { mention: env.slackMention });
      markNotified(state, key, status);
      notifiedCount += 1;
      console.log(`[notify] ${key} -> ${status}`);
    } else {
      console.log(`[skip] ${key} status=${status}`);
    }
  }

  if (!env.disableState) {
    writeState(env.stateFile, state);
  } else {
    console.log("state disabled: not saving data/state.json");
  }
  console.log(`done. notified=${notifiedCount}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
