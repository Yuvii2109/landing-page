import { createHash, randomInt, randomUUID } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "dist");
const logsDir = path.join(__dirname, "logs");
const port = Number(process.env.PORT || 5104);

const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = 5;
const otpStore = new Map();
let cachedSupabaseAdmin = null;

const loadDotEnv = () => {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
};

loadDotEnv();

const sendJson = (res, statusCode, body) => {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};

const readJsonBody = async (req) => {
  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
  }
  const body = rawBody.trim();
  return body ? JSON.parse(body) : {};
};

const normalizeIndianMobile = (input) => {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 10) return digits;
  return null;
};

const decodeBase64 = (value) => {
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return "";
  }
};

const dedupeRecipients = (recipients) =>
  Array.from(new Set(recipients.map((value) => String(value || "").trim().toLowerCase()).filter(Boolean)));

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const examWindowLabels = {
  october: "October 26th - 31st",
  november: "November 23rd - 30th",
  december: "December 1st - 15th",
};

const getExamWindowLabel = (value) => examWindowLabels[value] || value;

const appendEmailLog = (entry) => {
  try {
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

const isAuthorizedDashboardRequest = (req) => {
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

const sendUnauthorized = (res) => {
  res.setHeader("WWW-Authenticate", 'Basic realm="SPARK Dashboard"');
  sendJson(res, 401, { message: "Unauthorized. Please sign in to access the registrations dashboard." });
};

const otpKey = (channel, mobile) => `${channel}:${mobile}`;
const hashOtp = (otp) => createHash("sha256").update(otp).digest("hex");
const generateOtp = () => randomInt(100000, 1000000).toString();

const isMissingTableError = (message) => {
  const lowered = message.toLowerCase();
  return lowered.includes("relation") || lowered.includes("does not exist") || lowered.includes("42p01");
};

const getSupabaseAdminClient = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  if (cachedSupabaseAdmin) return cachedSupabaseAdmin;

  cachedSupabaseAdmin = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cachedSupabaseAdmin;
};

const getOtpGatewayConfig = () => ({
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

const getRegistrationEmailConfig = () => ({
  apiToken: process.env.ZEPTOMAIL_API_TOKEN,
  from: process.env.REGISTRATION_EMAIL_FROM || "reachout@sparkolympiads.com",
  fromName: process.env.REGISTRATION_EMAIL_FROM_NAME || "Team SPARK Olympiads",
  replyTo: process.env.REGISTRATION_EMAIL_REPLY_TO || "reachout@sparkolympiads.com",
  endpoint: process.env.ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email",
});

const maskSecret = (value) => {
  if (!value) return undefined;
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

const normalizeApiToken = (value) => value?.replace(/^Zoho-enczapikey\s+/i, "").trim();

const truncateForLog = (value, limit = 800) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}... [truncated ${value.length - limit} chars]`;
};

const getResponseHeadersForLog = (headers) => {
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

  return Object.fromEntries(names.map((name) => [name, headers.get(name)]).filter(([, value]) => Boolean(value)));
};

const parseResponseBodyForLog = (body) => {
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
      json: JSON.parse(body),
    };
  } catch {
    return {
      isEmpty: false,
      preview: truncateForLog(body),
      json: null,
    };
  }
};

const renderOtpText = (template, otp, schoolName, recipientName) =>
  template
    .replace(/\{\{\s*OTP\s*\}\}/gi, otp)
    .replace(/\$otp/gi, otp)
    .replace(/\{\{\s*NAME\s*\}\}/gi, recipientName)
    .replace(/\$name/gi, recipientName)
    .replace(/\{\{\s*SCHOOL\s*\}\}/gi, schoolName)
    .replace(/\$school/gi, schoolName);

const sendOtpViaGateway = async (mobile, otp, schoolName, recipientName, config) => {
  if (!config.username || !config.password || !config.templateId || !config.principalEntityId || !config.telemarketerId) {
    throw new Error("OTP service is not configured. Missing NexG environment variables.");
  }

  const text = renderOtpText(config.otpTextTemplate, otp, schoolName, recipientName);
  const query = new URLSearchParams({
    username: config.username,
    password: config.password,
    from: config.from,
    to: `91${mobile}`,
    indiaDltContentTemplateId: config.templateId,
    indiaDltPrincipalEntityId: config.principalEntityId,
    indiaDltTelemarketerId: config.telemarketerId,
    text,
  });

  const response = await fetch(`https://api2.nexgplatforms.com/sms/1/text/query?${query.toString()}`, {
    method: "GET",
  });
  const bodyText = await response.text();
  if (!response.ok) throw new Error(`SMS gateway request failed (${response.status}).`);

  const lowered = bodyText.toLowerCase();
  if (lowered.includes("error") || lowered.includes("invalid") || lowered.includes("failed")) {
    throw new Error("SMS gateway rejected OTP request.");
  }
};

const sendRegistrationConfirmationEmail = async (record) => {
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
  let response;
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

const handleOtpSend = async (req, res) => {
  if (req.method !== "POST") {
    sendJson(res, 405, { message: "Method not allowed. Use POST." });
    return;
  }

  const payload = await readJsonBody(req);
  const channel = payload.channel;
  const mobile = normalizeIndianMobile(payload.mobile);
  const schoolName = String(payload.schoolName || "").trim() || "School";
  const recipientName = String(payload.recipientName || payload.schoolName || "").trim() || "Participant";
  if ((channel !== "principal" && channel !== "coordinator") || !mobile) {
    sendJson(res, 400, { message: "Invalid mobile number or OTP channel." });
    return;
  }

  const key = otpKey(channel, mobile);
  const now = Date.now();
  const supabaseAdmin = getSupabaseAdminClient();
  let existing = null;

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
    existing = otpStore.get(key) || null;
  }

  if (existing && now - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    sendJson(res, 429, { message: "Please wait 30 seconds before requesting another OTP." });
    return;
  }

  const otp = generateOtp();
  await sendOtpViaGateway(mobile, otp, schoolName, recipientName, getOtpGatewayConfig());

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("otp_sessions").upsert(
      {
        session_key: key,
        channel,
        mobile,
        otp_hash: hashOtp(otp),
        expires_at: new Date(now + OTP_TTL_MS).toISOString(),
        attempts: 0,
        last_sent_at: new Date(now).toISOString(),
      },
      { onConflict: "session_key" },
    );
    if (error) {
      const message = isMissingTableError(error.message)
        ? "Supabase table otp_sessions not found. Please run the schema SQL first."
        : `Supabase OTP save failed: ${error.message}`;
      sendJson(res, 500, { message });
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

  sendJson(res, 200, { message: "OTP sent successfully." });
};

const handleOtpVerify = async (req, res) => {
  if (req.method !== "POST") {
    sendJson(res, 405, { message: "Method not allowed. Use POST." });
    return;
  }

  const payload = await readJsonBody(req);
  const channel = payload.channel;
  const mobile = normalizeIndianMobile(payload.mobile);
  const otp = String(payload.otp || "").trim();
  if ((channel !== "principal" && channel !== "coordinator") || !mobile || !otp) {
    sendJson(res, 400, { message: "Invalid verification payload." });
    return;
  }

  const key = otpKey(channel, mobile);
  const supabaseAdmin = getSupabaseAdminClient();
  let record = null;

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
    record = otpStore.get(key) || null;
  }

  if (!record) {
    sendJson(res, 400, { message: "OTP not found. Please request a new OTP." });
    return;
  }

  if (Date.now() > record.expiresAt) {
    if (supabaseAdmin) await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
    else otpStore.delete(key);
    sendJson(res, 400, { message: "OTP expired. Please request a new OTP." });
    return;
  }

  if (record.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
    if (supabaseAdmin) await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
    else otpStore.delete(key);
    sendJson(res, 429, { message: "Too many invalid attempts. Please request a new OTP." });
    return;
  }

  if (hashOtp(otp) !== record.otpHash) {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("otp_sessions").update({ attempts: record.attempts + 1 }).eq("session_key", key);
      if (error) {
        sendJson(res, 500, { message: `Supabase OTP update failed: ${error.message}` });
        return;
      }
    } else {
      otpStore.set(key, { ...record, attempts: record.attempts + 1 });
    }
    sendJson(res, 400, { message: "Invalid OTP. Please try again." });
    return;
  }

  if (supabaseAdmin) await supabaseAdmin.from("otp_sessions").delete().eq("session_key", key);
  else otpStore.delete(key);

  sendJson(res, 200, { message: "OTP verified successfully." });
};

const generateRegistrationId = () => {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const token = randomUUID().split("-")[0].toUpperCase();
  return `SPARK-${stamp}-${token}`;
};

const saveRegistrationFallback = (record) => {
  fs.mkdirSync(logsDir, { recursive: true });
  const logPath = path.join(logsDir, "registrations.log");
  const dbPath = path.join(logsDir, "registrations.db.json");
  fs.appendFileSync(logPath, `${JSON.stringify(record)}\n`, "utf8");
  const existing = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, "utf8")) : [];
  existing.push(record);
  fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2), "utf8");
};

const handleRegistration = async (req, res) => {
  if (req.method !== "POST") {
    sendJson(res, 405, { message: "Method not allowed. Use POST." });
    return;
  }

  const payload = await readJsonBody(req);
  const record = {
    ...payload,
    registrationId: generateRegistrationId(),
    createdAt: new Date().toISOString(),
  };

  const supabaseAdmin = getSupabaseAdminClient();
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
      const message = isMissingTableError(error.message)
        ? "Supabase table registrations not found. Please run the schema SQL first."
        : `Supabase registration save failed: ${error.message}`;
      sendJson(res, 500, { message });
      return;
    }
  } else {
    saveRegistrationFallback(record);
  }

  try {
    await sendRegistrationConfirmationEmail(record);
  } catch (emailError) {
    console.error(emailError);
  }

  sendJson(res, 201, record);
};

const handleDashboardRegistrations = async (req, res) => {
  if (req.method !== "GET") {
    sendJson(res, 405, { message: "Method not allowed. Use GET." });
    return;
  }

  if (!isAuthorizedDashboardRequest(req)) {
    sendUnauthorized(res);
    return;
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    sendJson(res, 500, {
      message: "Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from("registrations")
    .select(
      "registration_id, created_at, school_name, city, state, board, strength, principal_name, principal_email, principal_mobile, coordinator_name, coordinator_designation, coordinator_email, coordinator_mobile, expected_participants, exam_window",
    )
    .order("created_at", { ascending: false });

  if (error) {
    const message = isMissingTableError(error.message)
      ? "Supabase table registrations not found. Please run the schema SQL first."
      : `Supabase registration fetch failed: ${error.message}`;
    sendJson(res, 500, { message });
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

  sendJson(res, 200, { registrations });
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

const serveStatic = (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  const requestedPath = path.resolve(distDir, `.${pathname}`);
  const filePath = requestedPath.startsWith(distDir) && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
    ? requestedPath
    : path.join(distDir, "index.html");

  if (!fs.existsSync(filePath)) {
    sendJson(res, 500, { message: "Production build not found. Run npm run build first." });
    return;
  }

  res.writeHead(200, {
    "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/api/otp/send") {
      await handleOtpSend(req, res);
      return;
    }
    if (url.pathname === "/api/otp/verify") {
      await handleOtpVerify(req, res);
      return;
    }
    if (url.pathname === "/api/registrations") {
      await handleRegistration(req, res);
      return;
    }
    if (url.pathname === "/api/dashboard/registrations") {
      await handleDashboardRegistrations(req, res);
      return;
    }
    serveStatic(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    sendJson(res, 500, { message });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Spark registration app running at http://localhost:${port}`);
});
