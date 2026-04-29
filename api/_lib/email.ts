import fs from "node:fs";
import path from "node:path";
import type { RegistrationRecord } from "./types.js";

type RegistrationEmailConfig = {
  apiToken?: string;
  from: string;
  fromName: string;
  replyTo?: string;
  endpoint: string;
};

const dedupeRecipients = (recipients: string[]) => {
  return Array.from(
    new Set(
      recipients
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
};

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
    const logsDir = path.join(process.cwd(), "logs");
    fs.mkdirSync(logsDir, { recursive: true });
    const logPath = path.join(logsDir, "registration-email.log");
    fs.appendFileSync(logPath, `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`, "utf8");
  } catch (error) {
    console.error("[REG EMAIL] File log failed", error);
  }
};

export const getRegistrationEmailConfig = (): RegistrationEmailConfig => ({
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

export const sendRegistrationConfirmationEmail = async (record: RegistrationRecord) => {
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
  const html = `
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

  const text = [
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
    htmlbody: html,
    textbody: text,
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
    htmlLength: html.length,
    textLength: text.length,
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
