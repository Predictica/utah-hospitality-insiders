import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn("[Resend] RESEND_API_KEY is not set — emails will fail.");
} else {
  console.log("[Resend] Client initialized. Key starts with:", apiKey.substring(0, 8) + "...");
}

export const resend = new Resend(apiKey);
