import type { OtpSendRequest, OtpSession, OtpSessionRow } from "../_lib/types";
import { readJsonBody, sendJson, methodNotAllowed } from "../_lib/http";
import {
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  deleteFallbackOtpSession,
  generateOtp,
  getFallbackOtpSession,
  getOtpGatewayConfig,
  hashOtp,
  normalizeIndianMobile,
  otpKey,
  sendOtpViaGateway,
  setFallbackOtpSession,
} from "../_lib/otp";
import { getSupabaseAdminClient, isMissingTableError } from "../_lib/supabase";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  try {
    const payload = (await readJsonBody(req)) as Partial<OtpSendRequest>;
    const channel = payload.channel;
    const normalizedMobile = normalizeIndianMobile(payload.mobile || "");

    if ((channel !== "principal" && channel !== "coordinator") || !normalizedMobile) {
      sendJson(res, 400, { message: "Invalid mobile number or OTP channel." });
      return;
    }

    const key = otpKey(channel, normalizedMobile);
    const now = Date.now();
    const supabaseAdmin = getSupabaseAdminClient();

    let existing: OtpSession | null = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("otp_sessions")
        .select("otp_hash, expires_at, attempts, last_sent_at")
        .eq("session_key", key)
        .maybeSingle();

      if (error) {
        const message = isMissingTableError(error.message)
          ? "Supabase table otp_sessions not found. Please run the schema SQL first."
          : `Supabase OTP lookup failed: ${error.message}`;
        sendJson(res, 500, { message });
        return;
      }

      existing = data
        ? {
            otpHash: data.otp_hash,
            expiresAt: Date.parse(data.expires_at),
            attempts: data.attempts,
            lastSentAt: Date.parse(data.last_sent_at),
          }
        : null;
    } else {
      existing = getFallbackOtpSession(key);
    }

    if (existing && now - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
      sendJson(res, 429, { message: "Please wait 30 seconds before requesting another OTP." });
      return;
    }

    const otp = generateOtp();
    await sendOtpViaGateway(normalizedMobile, otp, getOtpGatewayConfig());

    if (supabaseAdmin) {
      const row: OtpSessionRow = {
        session_key: key,
        channel,
        mobile: normalizedMobile,
        otp_hash: hashOtp(otp),
        expires_at: new Date(now + OTP_TTL_MS).toISOString(),
        attempts: 0,
        last_sent_at: new Date(now).toISOString(),
      };

      const { error } = await supabaseAdmin.from("otp_sessions").upsert(row, { onConflict: "session_key" });
      if (error) {
        const message = isMissingTableError(error.message)
          ? "Supabase table otp_sessions not found. Please run the schema SQL first."
          : `Supabase OTP save failed: ${error.message}`;
        sendJson(res, 500, { message });
        return;
      }
    } else {
      setFallbackOtpSession(key, {
        otpHash: hashOtp(otp),
        expiresAt: now + OTP_TTL_MS,
        attempts: 0,
        lastSentAt: now,
      });
    }

    sendJson(res, 200, { message: "OTP sent successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send OTP.";
    sendJson(res, 500, { message });
  }
}
