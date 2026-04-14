import type { OtpSession, OtpVerifyRequest } from "../_lib/types";
import { readJsonBody, sendJson, methodNotAllowed } from "../_lib/http";
import {
  OTP_MAX_VERIFY_ATTEMPTS,
  deleteFallbackOtpSession,
  getFallbackOtpSession,
  hashOtp,
  normalizeIndianMobile,
  otpKey,
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
    const payload = (await readJsonBody(req)) as Partial<OtpVerifyRequest>;
    const channel = payload.channel;
    const normalizedMobile = normalizeIndianMobile(payload.mobile || "");
    const otp = (payload.otp || "").trim();

    if ((channel !== "principal" && channel !== "coordinator") || !normalizedMobile || !otp) {
      sendJson(res, 400, { message: "Invalid verification payload." });
      return;
    }

    const key = otpKey(channel, normalizedMobile);
    const supabaseAdmin = getSupabaseAdminClient();

    let record: OtpSession | null = null;
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

      if (data && Date.now() > Date.parse(data.expires_at)) {
        await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
      }

      record = data
        ? {
            otpHash: data.otp_hash,
            expiresAt: Date.parse(data.expires_at),
            attempts: data.attempts,
            lastSentAt: Date.parse(data.last_sent_at),
          }
        : null;
    } else {
      record = getFallbackOtpSession(key);
    }

    if (!record) {
      sendJson(res, 400, { message: "OTP not found. Please request a new OTP." });
      return;
    }

    if (Date.now() > record.expiresAt) {
      if (supabaseAdmin) await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
      else deleteFallbackOtpSession(key);
      sendJson(res, 400, { message: "OTP expired. Please request a new OTP." });
      return;
    }

    if (record.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
      if (supabaseAdmin) await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
      else deleteFallbackOtpSession(key);
      sendJson(res, 429, { message: "Too many invalid attempts. Please request a new OTP." });
      return;
    }

    if (hashOtp(otp) !== record.otpHash) {
      if (supabaseAdmin) {
        const { error } = await supabaseAdmin
          .from("otp_sessions")
          .update({ attempts: record.attempts + 1 })
          .eq("session_key", key);

        if (error) {
          sendJson(res, 500, { message: `Supabase OTP update failed: ${error.message}` });
          return;
        }
      } else {
        setFallbackOtpSession(key, { ...record, attempts: record.attempts + 1 });
      }

      sendJson(res, 400, { message: "Invalid OTP. Please try again." });
      return;
    }

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
      if (error) {
        sendJson(res, 500, { message: `Supabase OTP cleanup failed: ${error.message}` });
        return;
      }
    } else {
      deleteFallbackOtpSession(key);
    }

    sendJson(res, 200, { message: "OTP verified successfully." });
  } catch {
    sendJson(res, 500, { message: "Could not verify OTP." });
  }
}
