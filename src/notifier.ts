import axios from "axios";

export async function notifySlack(webhookUrl: string, text: string): Promise<void> {
  await axios.post(
    webhookUrl,
    {
      text,
    },
    { timeout: 10_000 }
  );
}

