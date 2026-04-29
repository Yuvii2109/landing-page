import { createHash, randomInt } from "node:crypto";
import type { OtpGatewayConfig, OtpSession } from "./types.js";

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const OTP_MAX_VERIFY_ATTEMPTS = 5;

const otpStore = new Map<string, OtpSession>();

export const normalizeIndianMobile = (input: string) => {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 10) return digits;
  return null;
};

export const otpKey = (channel: "principal" | "coordinator", mobile: string) => `${channel}:${mobile}`;

export const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

export const generateOtp = () => randomInt(100000, 1000000).toString();

export const getFallbackOtpSession = (key: string) => otpStore.get(key) ?? null;

export const setFallbackOtpSession = (key: string, session: OtpSession) => {
  otpStore.set(key, session);
};

export const deleteFallbackOtpSession = (key: string) => {
  otpStore.delete(key);
};

const renderOtpText = (template: string, otp: string, schoolName: string, recipientName: string) => {
  return template
    .replace(/\{\{\s*OTP\s*\}\}/gi, otp)
    .replace(/\$otp/gi, otp)
    .replace(/\{\{\s*NAME\s*\}\}/gi, recipientName)
    .replace(/\$name/gi, recipientName)
    .replace(/\{\{\s*SCHOOL\s*\}\}/gi, schoolName)
    .replace(/\$school/gi, schoolName);
};

export const sendOtpViaGateway = async (
  mobile: string,
  otp: string,
  schoolName: string,
  recipientName: string,
  config: OtpGatewayConfig,
) => {
  const username = config.username;
  const password = config.password;
  const from = config.from;
  const templateId = config.templateId;
  const principalEntityId = config.principalEntityId;
  const telemarketerId = config.telemarketerId;
  const otpTextTemplate = config.otpTextTemplate;

  if (!username || !password || !templateId || !principalEntityId || !telemarketerId) {
    throw new Error("OTP service is not configured. Missing NexG environment variables.");
  }

  const text = renderOtpText(otpTextTemplate, otp, schoolName, recipientName);
  const query = new URLSearchParams({
    username,
    password,
    from,
    to: `91${mobile}`,
    indiaDltContentTemplateId: templateId,
    indiaDltPrincipalEntityId: principalEntityId,
    indiaDltTelemarketerId: telemarketerId,
    text,
  });

  const response = await fetch(`https://api2.nexgplatforms.com/sms/1/text/query?${query.toString()}`, {
    method: "GET",
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`SMS gateway request failed (${response.status}): ${bodyText || "No response body"}`);
  }

  try {
    const parsed = JSON.parse(bodyText) as {
      messages?: Array<{
        status?: {
          groupName?: string;
          description?: string;
          name?: string;
        };
      }>;
    };

    const first = parsed.messages?.[0];
    const group = first?.status?.groupName?.toUpperCase();
    if (group && group !== "PENDING" && group !== "ACCEPTED") {
      const description = first?.status?.description || first?.status?.name || "Unknown gateway status";
      throw new Error(`SMS gateway rejected OTP request: ${description}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("SMS gateway rejected OTP request:")) {
      throw error;
    }
    // Non-JSON responses are evaluated by fallback string checks below.
  }

  const lowered = bodyText.toLowerCase();
  if (lowered.includes("error") || lowered.includes("invalid") || lowered.includes("failed") || lowered.includes("rejected")) {
    throw new Error(`SMS gateway rejected OTP request: ${bodyText}`);
  }
};

export const getOtpGatewayConfig = (): OtpGatewayConfig => ({
  username: process.env.NEXG_USERNAME || "SparkOlympiads",
  password: process.env.NEXG_PASSWORD || "Devanshi@123",
  from: process.env.NEXG_FROM || "EDXSOL",
  templateId: process.env.NEXG_DLT_TEMPLATE_ID || "1707175085053959674",
  principalEntityId: process.env.NEXG_DLT_PRINCIPAL_ENTITY_ID || "1701175006776504702",
  telemarketerId: process.env.NEXG_DLT_TELEMARKETER_ID || "1702171328200125899",
  otpTextTemplate:
    process.env.NEXG_OTP_TEXT_TEMPLATE ||
    "Dear {{NAME}}, Your one time password (OTP) is {{OTP}} Do not disclose it to anyone. Team Spark Olympiads(EDXSO)",
});
