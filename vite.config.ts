import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { componentTagger } from "lovable-tagger";

type RegistrationCreateRequest = {
  schoolName: string;
  schoolAddress: string;
  schoolEmail: string;
  schoolPhone: string;
  city: string;
  state: string;
  board: string;
  strength: string;
  labAvailable: "yes" | "no";
  computerCount: string;
  principalName: string;
  principalEmail: string;
  principalMobile: string;
  coordinatorName: string;
  coordinatorDesignation: string;
  coordinatorEmail: string;
  coordinatorMobile: string;
  expectedParticipants: string;
  examWindow: string;
  declaration: boolean;
};

type RegistrationRecord = RegistrationCreateRequest & {
  registrationId: string;
  createdAt: string;
};

type OtpSendRequest = {
  mobile: string;
  channel: "principal" | "coordinator";
  schoolName?: string;
  recipientName?: string;
};

type OtpVerifyRequest = {
  mobile: string;
  otp: string;
  channel: "principal" | "coordinator";
};

type OtpSession = {
  otpHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
};

type OtpGatewayConfig = {
  username?: string;
  password?: string;
  from: string;
  templateId?: string;
  principalEntityId?: string;
  telemarketerId?: string;
  otpTextTemplate: string;
};

type SupabaseConfig = {
  url?: string;
  serviceRoleKey?: string;
};

type OtpSessionRow = {
  session_key: string;
  channel: "principal" | "coordinator";
  mobile: string;
  otp_hash: string;
  expires_at: string;
  attempts: number;
  last_sent_at: string;
};

const otpStore = new Map<string, OtpSession>();
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = 5;

let cachedSupabaseAdmin: SupabaseClient | null = null;

const normalizeIndianMobile = (input: string) => {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 10) {
    return digits;
  }
  return null;
};

const decodeBase64 = (value: string) => {
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return "";
  }
};

const dedupeRecipients = (recipients: string[]) =>
  Array.from(new Set(recipients.map((value) => value.trim().toLowerCase()).filter(Boolean)));

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const examWindowLabels: Record<string, string> = {
  october: "October 26th - 31st",
  november: "November 23rd - 30th",
  december: "December 1st - 15th",
};

const getExamWindowLabel = (value: string) => examWindowLabels[value] || value;

const appendEmailLog = (entry: Record<string, unknown>) => {
  try {
    const logsDir = path.resolve(process.cwd(), "logs");
    fs.mkdirSync(logsDir, { recursive: true });
    const logPath = path.join(logsDir, "registration-email.log");
    fs.appendFileSync(logPath, `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`, "utf8");
  } catch (error) {
    console.error("[REG EMAIL] File log failed", error);
  }
};

const getDashboardCredentials = () => ({
  username: process.env.DASHBOARD_USERNAME || "admin",
  password: process.env.DASHBOARD_PASSWORD || "spark123",
});

const isAuthorizedDashboardRequest = (req: { headers?: { authorization?: string } }) => {
  const authorization = req.headers?.authorization || "";
  if (!authorization.startsWith("Basic ")) return false;

  const decoded = decodeBase64(authorization.slice(6));
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  const credentials = getDashboardCredentials();
  return username === credentials.username && password === credentials.password;
};

const getRegistrationEmailConfig = () => ({
  apiToken: process.env.ZEPTOMAIL_API_TOKEN,
  from: process.env.REGISTRATION_EMAIL_FROM || "reachout@sparkolympiads.com",
  fromName: process.env.REGISTRATION_EMAIL_FROM_NAME || "Team SPARK Olympiads",
  replyTo: process.env.REGISTRATION_EMAIL_REPLY_TO || "reachout@sparkolympiads.com",
  endpoint: process.env.ZEPTOMAIL_API_URL || "https://api.zeptomail.in/v1.1/email",
});

const maskSecret = (value?: string) => {
  if (!value) return undefined;
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

const normalizeApiToken = (value?: string) => value?.replace(/^Zoho-enczapikey\s+/i, "").trim();

const truncateForLog = (value: string, limit = 800) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}... [truncated ${value.length - limit} chars]`;
};

const getResponseHeadersForLog = (headers: Headers) => {
  const names = [
    "content-type",
    "content-length",
    "date",
    "server",
    "via",
    "x-request-id",
    "x-response-time",
    "x-frame-options",
    "cf-ray",
    "cf-cache-status",
  ];

  return Object.fromEntries(
    names
      .map((name) => [name, headers.get(name)] as const)
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
};

const parseResponseBodyForLog = (body: string) => {
  if (!body.trim()) {
    return {
      isEmpty: true,
      preview: "",
      json: null,
    };
  }

  try {
    return {
      isEmpty: false,
      preview: truncateForLog(body),
      json: JSON.parse(body) as unknown,
    };
  } catch {
    return {
      isEmpty: false,
      preview: truncateForLog(body),
      json: null,
    };
  }
};

const otpKey = (channel: "principal" | "coordinator", mobile: string) => `${channel}:${mobile}`;

const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

const renderOtpText = (template: string, otp: string, schoolName: string, recipientName: string) => {
  return template
    .replace(/\{\{\s*OTP\s*\}\}/gi, otp)
    .replace(/\$otp/gi, otp)
    .replace(/\{\{\s*NAME\s*\}\}/gi, recipientName)
    .replace(/\$name/gi, recipientName)
    .replace(/\{\{\s*SCHOOL\s*\}\}/gi, schoolName)
    .replace(/\$school/gi, schoolName);
};

const sendOtpViaGateway = async (
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

const sendRegistrationConfirmationEmail = async (record: RegistrationRecord) => {
  const config = getRegistrationEmailConfig();
  const normalizedApiToken = normalizeApiToken(config.apiToken);

  if (!normalizedApiToken) {
    appendEmailLog({
      stage: "skipped_missing_token",
      endpoint: config.endpoint,
      from: config.from,
      registrationId: record.registrationId,
    });
    return false;
  }

  const to = dedupeRecipients([record.schoolEmail, record.principalEmail, record.coordinatorEmail]);
  if (!to.length) {
    appendEmailLog({
      stage: "skipped_no_recipients",
      endpoint: config.endpoint,
      from: config.from,
      registrationId: record.registrationId,
    });
    return false;
  }

  const subject = "Thank You for Registering for SPARK Olympiad 2026–27";
  const htmlbody = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.65;">
      <p>Dear Principal / Coordinator,</p>
      <p>Greetings from SPARK Olympiads!</p>
      <p>
        Thank you for registering your school for SPARK Olympiad 2026-27. We are delighted to welcome your institution to
        this national academic initiative focused on assessing thinking, measuring performance, and nurturing excellence among students.
      </p>
      <p>
        Your registration has been successfully received, and our team will soon connect with your school coordinator to assist
        with the next steps, including:
      </p>
      <ul style="padding-left: 20px;">
        <li>Registration confirmation &amp; onboarding</li>
        <li>Student participation planning</li>
        <li>Exam timelines &amp; process guidance</li>
        <li>Resource sharing &amp; continuous support</li>
      </ul>
      <p>
        At SPARK, we aim to go beyond traditional Olympiads by providing meaningful academic benchmarking, deeper learning insights,
        and long-term value addition for schools, teachers, and students.
      </p>
      <p>
        We look forward to partnering with your school and creating a rewarding, enriching, and impactful experience for your students.
      </p>
      <p>For any assistance, please feel free to connect with us:</p>
      <p>
        Email: <a href="mailto:reachout@sparkolympiads.com">reachout@sparkolympiads.com</a><br />
        Phone: +91-8447477275
      </p>
      <p>
        Warm regards,<br />
        Team SPARK Olympiads<br />
        An Initiative by EDXSO | Powered by Prometric
      </p>
    </div>
  `.trim();
  const textbody = [
    "Dear Principal / Coordinator,",
    "",
    "Greetings from SPARK Olympiads!",
    "",
    "Thank you for registering your school for SPARK Olympiad 2026–27.",
    "We are delighted to welcome your institution to this national academic initiative focused on assessing thinking, measuring performance, and nurturing excellence among students.",
    "",
    "Your registration has been successfully received, and our team will soon connect with your school coordinator to assist with the next steps, including:",
    "- Registration confirmation & onboarding",
    "- Student participation planning",
    "- Exam timelines & process guidance",
    "- Resource sharing & continuous support",
    "",
    "At SPARK, we aim to go beyond traditional Olympiads by providing meaningful academic benchmarking, deeper learning insights, and long-term value addition for schools, teachers, and students.",
    "We look forward to partnering with your school and creating a rewarding, enriching, and impactful experience for your students.",
    "",
    "For any assistance, please feel free to connect with us:",
    "Email: reachout@sparkolympiads.com",
    "Phone: +91-8447477275",
    "",
    "Regards,",
    "Team SPARK Olympiads",
    "An Initiative by EDXSO | Powered by Prometric",
  ].join("\n");
  const payload = {
    from: {
      address: config.from,
      name: config.fromName,
    },
    to: to.map((address) => ({
      email_address: {
        address,
        name: record.schoolName,
      },
    })),
    subject,
    htmlbody,
    textbody,
    reply_to: config.replyTo
      ? [
          {
            address: config.replyTo,
            name: config.fromName,
          },
        ]
      : undefined,
  };
  const requestBody = JSON.stringify(payload);
  const requestMeta = {
    endpoint: config.endpoint,
    from: config.from,
    fromName: config.fromName,
    replyTo: config.replyTo,
    to,
    subject,
    registrationId: record.registrationId,
    recipientCount: to.length,
    schoolName: record.schoolName,
    apiTokenMasked: maskSecret(normalizedApiToken),
    apiTokenSourceHadPrefix: Boolean(config.apiToken && /^Zoho-enczapikey\s+/i.test(config.apiToken)),
    payloadBytes: Buffer.byteLength(requestBody, "utf8"),
    htmlLength: htmlbody.length,
    textLength: textbody.length,
  };
  console.log("[REG EMAIL] Sending confirmation email", {
    ...requestMeta,
  });
  appendEmailLog({
    stage: "sending",
    ...requestMeta,
  });
  appendEmailLog({
    stage: "payload_prepared",
    registrationId: record.registrationId,
    payload: {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      reply_to: payload.reply_to,
    },
  });
  let response: Response;
  try {
    response = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Zoho-enczapikey ${normalizedApiToken}`,
        "Content-Type": "application/json",
      },
      body: requestBody,
    });
  } catch (error) {
    const errorForLog = error instanceof Error ? error : new Error(String(error));
    console.error("[REG EMAIL] Request threw before response", {
      ...requestMeta,
      errorName: errorForLog.name,
      errorMessage: errorForLog.message,
      errorStack: errorForLog.stack,
    });
    appendEmailLog({
      stage: "request_exception",
      ...requestMeta,
      errorName: errorForLog.name,
      errorMessage: errorForLog.message,
      errorStack: errorForLog.stack,
    });
    throw errorForLog;
  }

  appendEmailLog({
    stage: "response_received",
    registrationId: record.registrationId,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: getResponseHeadersForLog(response.headers),
  });

  const body = await response.text();
  const parsedBody = parseResponseBodyForLog(body);

  if (!response.ok) {
    console.error("[REG EMAIL] Failed", {
      ...requestMeta,
      status: response.status,
      statusText: response.statusText,
      headers: getResponseHeadersForLog(response.headers),
      bodyLength: body.length,
      bodyPreview: parsedBody.preview,
      parsedBody: parsedBody.json,
      isEmptyBody: parsedBody.isEmpty,
    });
    appendEmailLog({
      stage: "failed",
      ...requestMeta,
      status: response.status,
      statusText: response.statusText,
      headers: getResponseHeadersForLog(response.headers),
      bodyLength: body.length,
      bodyPreview: parsedBody.preview,
      parsedBody: parsedBody.json,
      isEmptyBody: parsedBody.isEmpty,
    });
    throw new Error(`Registration confirmation email failed: ${body || response.statusText}`);
  }

  console.log("[REG EMAIL] Success", {
    ...requestMeta,
    status: response.status,
    statusText: response.statusText,
    headers: getResponseHeadersForLog(response.headers),
    bodyLength: body.length,
    bodyPreview: parsedBody.preview,
    parsedBody: parsedBody.json,
    isEmptyBody: parsedBody.isEmpty,
  });
  appendEmailLog({
    stage: "success",
    ...requestMeta,
    status: response.status,
    statusText: response.statusText,
    headers: getResponseHeadersForLog(response.headers),
    bodyLength: body.length,
    bodyPreview: parsedBody.preview,
    parsedBody: parsedBody.json,
    isEmptyBody: parsedBody.isEmpty,
  });

  return true;
};

const readJsonBody = async (req: NodeJS.ReadableStream): Promise<unknown> => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks).toString("utf8");
  if (!body) return {};
  return JSON.parse(body);
};

const generateRegistrationId = () => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const token = randomUUID().split("-")[0].toUpperCase();
  return `SPARK-${stamp}-${token}`;
};

const getSupabaseAdminClient = (config: SupabaseConfig) => {
  if (!config.url || !config.serviceRoleKey) return null;
  if (cachedSupabaseAdmin) return cachedSupabaseAdmin;

  cachedSupabaseAdmin = createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return cachedSupabaseAdmin;
};

const isMissingTableError = (message: string) => {
  const lowered = message.toLowerCase();
  return lowered.includes("relation") || lowered.includes("does not exist") || lowered.includes("42p01");
};

const registrationApiPlugin = (otpConfig: OtpGatewayConfig, supabaseConfig: SupabaseConfig) => ({
  name: "registration-api-plugin",
  configureServer(server: { middlewares: { use: (route: string, handler: (req: any, res: any, next: () => void) => void) => void } }) {
    server.middlewares.use("/api/otp/send", async (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      try {
        const payload = (await readJsonBody(req)) as Partial<OtpSendRequest>;
        const channel = payload.channel;
        const normalizedMobile = normalizeIndianMobile(payload.mobile || "");
        const schoolName = (payload.schoolName || "").trim() || "School";
        const recipientName = (payload.recipientName || payload.schoolName || "").trim() || "Participant";

        if ((channel !== "principal" && channel !== "coordinator") || !normalizedMobile) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid mobile number or OTP channel." }));
          return;
        }

        const key = otpKey(channel, normalizedMobile);
        const now = Date.now();
        const supabaseAdmin = getSupabaseAdminClient(supabaseConfig);

        let existing: OtpSession | null = null;
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from("otp_sessions")
            .select("otp_hash, expires_at, attempts, last_sent_at")
            .eq("session_key", key)
            .maybeSingle();

          if (error) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            const message = isMissingTableError(error.message)
              ? "Supabase table otp_sessions not found. Please run the schema SQL first."
              : `Supabase OTP lookup failed: ${error.message}`;
            res.end(JSON.stringify({ message }));
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
          existing = otpStore.get(key) ?? null;
        }

        if (existing && now - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
          res.statusCode = 429;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Please wait 30 seconds before requesting another OTP." }));
          return;
        }

        const otp = randomInt(100000, 1000000).toString();
        await sendOtpViaGateway(normalizedMobile, otp, schoolName, recipientName, otpConfig);

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
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            const message = isMissingTableError(error.message)
              ? "Supabase table otp_sessions not found. Please run the schema SQL first."
              : `Supabase OTP save failed: ${error.message}`;
            res.end(JSON.stringify({ message }));
            return;
          }
        } else {
          otpStore.set(key, {
            otpHash: hashOtp(otp),
            expiresAt: now + OTP_TTL_MS,
            attempts: 0,
            lastSentAt: now,
          });
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "OTP sent successfully." }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        const message = error instanceof Error ? error.message : "Could not send OTP.";
        res.end(JSON.stringify({ message }));
      }
    });

    server.middlewares.use("/api/otp/verify", async (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      try {
        const payload = (await readJsonBody(req)) as Partial<OtpVerifyRequest>;
        const channel = payload.channel;
        const normalizedMobile = normalizeIndianMobile(payload.mobile || "");
        const otp = (payload.otp || "").trim();

        if ((channel !== "principal" && channel !== "coordinator") || !normalizedMobile || !otp) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid verification payload." }));
          return;
        }

        const key = otpKey(channel, normalizedMobile);
        const supabaseAdmin = getSupabaseAdminClient(supabaseConfig);

        let record: OtpSession | null = null;
        if (supabaseAdmin) {
          const { data, error } = await supabaseAdmin
            .from("otp_sessions")
            .select("otp_hash, expires_at, attempts, last_sent_at")
            .eq("session_key", key)
            .maybeSingle();

          if (error) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            const message = isMissingTableError(error.message)
              ? "Supabase table otp_sessions not found. Please run the schema SQL first."
              : `Supabase OTP lookup failed: ${error.message}`;
            res.end(JSON.stringify({ message }));
            return;
          }

          // Lazy cleanup when stale record is encountered during verification.
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
          record = otpStore.get(key) ?? null;
        }

        if (!record) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "OTP not found. Please request a new OTP." }));
          return;
        }

        if (Date.now() > record.expiresAt) {
          if (supabaseAdmin) {
            await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
          } else {
            otpStore.delete(key);
          }
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "OTP expired. Please request a new OTP." }));
          return;
        }

        if (record.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
          if (supabaseAdmin) {
            await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
          } else {
            otpStore.delete(key);
          }
          res.statusCode = 429;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Too many invalid attempts. Please request a new OTP." }));
          return;
        }

        if (hashOtp(otp) !== record.otpHash) {
          if (supabaseAdmin) {
            const { error } = await supabaseAdmin
              .from("otp_sessions")
              .update({ attempts: record.attempts + 1 })
              .eq("session_key", key);
            if (error) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: `Supabase OTP update failed: ${error.message}` }));
              return;
            }
          } else {
            otpStore.set(key, {
              ...record,
              attempts: record.attempts + 1,
            });
          }

          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid OTP. Please try again." }));
          return;
        }

        if (supabaseAdmin) {
          const { error } = await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
          if (error) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: `Supabase OTP cleanup failed: ${error.message}` }));
            return;
          }
        } else {
          otpStore.delete(key);
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "OTP verified successfully." }));
      } catch {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Could not verify OTP." }));
      }
    });

    server.middlewares.use("/api/registrations", async (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }

      try {
        const payload = (await readJsonBody(req)) as RegistrationCreateRequest;
        const record: RegistrationRecord = {
          ...payload,
          registrationId: generateRegistrationId(),
          createdAt: new Date().toISOString(),
        };

        const supabaseAdmin = getSupabaseAdminClient(supabaseConfig);
        if (supabaseAdmin) {
          const { error } = await supabaseAdmin.from("registrations").insert({
            registration_id: record.registrationId,
            created_at: record.createdAt,
            school_name: record.schoolName,
            school_address: record.schoolAddress,
            school_email: record.schoolEmail,
            school_phone: record.schoolPhone,
            city: record.city,
            state: record.state,
            board: record.board,
            strength: record.strength,
            lab_available: record.labAvailable,
            computer_count: record.computerCount,
            principal_name: record.principalName,
            principal_email: record.principalEmail,
            principal_mobile: record.principalMobile,
            coordinator_name: record.coordinatorName,
            coordinator_designation: record.coordinatorDesignation,
            coordinator_email: record.coordinatorEmail,
            coordinator_mobile: record.coordinatorMobile,
            expected_participants: record.expectedParticipants,
            exam_window: record.examWindow,
            declaration: record.declaration,
          });

          if (error) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            const message = isMissingTableError(error.message)
              ? "Supabase table registrations not found. Please run the schema SQL first."
              : `Supabase registration save failed: ${error.message}`;
            res.end(JSON.stringify({ message }));
            return;
          }
        }

        const logsDir = path.resolve(__dirname, "logs");
        const logPath = path.join(logsDir, "registrations.log");
        const dbPath = path.join(logsDir, "registrations.db.json");

        fs.mkdirSync(logsDir, { recursive: true });
        fs.appendFileSync(logPath, `${JSON.stringify(record)}\n`, "utf8");

        const existing = fs.existsSync(dbPath)
          ? (JSON.parse(fs.readFileSync(dbPath, "utf8")) as RegistrationRecord[])
          : [];
        existing.push(record);
        fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2), "utf8");

        try {
          await sendRegistrationConfirmationEmail(record);
        } catch (emailError) {
          console.error(emailError);
        }

        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(record));
      } catch {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Could not persist registration" }));
      }
    });

    server.middlewares.use("/api/dashboard/registrations", async (req, res, next) => {
      if (req.method !== "GET") {
        next();
        return;
      }

      if (!isAuthorizedDashboardRequest(req)) {
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", 'Basic realm="SPARK Dashboard"');
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Unauthorized. Please sign in to access the registrations dashboard." }));
        return;
      }

      try {
        const supabaseAdmin = getSupabaseAdminClient(supabaseConfig);
        if (!supabaseAdmin) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY." }));
          return;
        }

        const { data, error } = await supabaseAdmin
          .from("registrations")
          .select(
            "registration_id, created_at, school_name, city, state, board, strength, principal_name, principal_email, principal_mobile, coordinator_name, coordinator_designation, coordinator_email, coordinator_mobile, expected_participants, exam_window",
          )
          .order("created_at", { ascending: false });

        if (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          const message = isMissingTableError(error.message)
            ? "Supabase table registrations not found. Please run the schema SQL first."
            : `Supabase registration fetch failed: ${error.message}`;
          res.end(JSON.stringify({ message }));
          return;
        }

        const registrations = (data || []).map((row) => ({
          registrationId: row.registration_id,
          createdAt: row.created_at,
          schoolName: row.school_name,
          city: row.city,
          state: row.state,
          board: row.board,
          strength: row.strength,
          principalName: row.principal_name,
          principalEmail: row.principal_email,
          principalMobile: row.principal_mobile,
          coordinatorName: row.coordinator_name,
          coordinatorDesignation: row.coordinator_designation,
          coordinatorEmail: row.coordinator_email,
          coordinatorMobile: row.coordinator_mobile,
          expectedParticipants: row.expected_participants,
          examWindow: row.exam_window,
        }));

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ registrations }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        const message = error instanceof Error ? error.message : "Could not load registrations.";
        res.end(JSON.stringify({ message }));
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const otpConfig: OtpGatewayConfig = {
    username: env.NEXG_USERNAME || process.env.NEXG_USERNAME || "SparkOlympiads",
    password: env.NEXG_PASSWORD || process.env.NEXG_PASSWORD || "Devanshi@123",
    from: env.NEXG_FROM || process.env.NEXG_FROM || "EDXSOL",
    templateId: env.NEXG_DLT_TEMPLATE_ID || process.env.NEXG_DLT_TEMPLATE_ID || "1707175085053959674",
    principalEntityId: env.NEXG_DLT_PRINCIPAL_ENTITY_ID || process.env.NEXG_DLT_PRINCIPAL_ENTITY_ID || "1701175006776504702",
    telemarketerId: env.NEXG_DLT_TELEMARKETER_ID || process.env.NEXG_DLT_TELEMARKETER_ID || "1702171328200125899",
    otpTextTemplate:
      env.NEXG_OTP_TEXT_TEMPLATE ||
      process.env.NEXG_OTP_TEXT_TEMPLATE ||
      "Dear {{NAME}}, Your one time password (OTP) is {{OTP}} Do not disclose it to anyone. Team Spark Olympiads(EDXSO)",
  };

  const supabaseConfig: SupabaseConfig = {
    url: env.SUPABASE_URL || process.env.SUPABASE_URL,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), registrationApiPlugin(otpConfig, supabaseConfig), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
