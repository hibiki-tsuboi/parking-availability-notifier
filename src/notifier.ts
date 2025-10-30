import axios from "axios";

export async function notifySlack(
  webhookUrl: string,
  text: string,
  opts?: { mention?: string | null }
): Promise<void> {
  const payload: { text: string; link_names?: 1 } = { text };
  
  // @から始まる表記をSlack側でリンク化（ユーザーID <@UXXXX> の場合は不要だが影響なし）
  if (opts?.mention?.startsWith("@")) {
    payload.link_names = 1;
  }
  
  await axios.post(webhookUrl, payload, { timeout: 10_000 });
}

