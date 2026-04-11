import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs";
import { createHash, randomInt, randomUUID } from "node:crypto";
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

const otpStore = new Map<string, OtpSession>();
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_VERIFY_ATTEMPTS = 5;

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

const otpKey = (channel: "principal" | "coordinator", mobile: string) => `${channel}:${mobile}`;

const hashOtp = (otp: string) => createHash("sha256").update(otp).digest("hex");

const sendOtpViaGateway = async (mobile: string, otp: string, config: OtpGatewayConfig) => {
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

  const text = otpTextTemplate.replace("{{OTP}}", otp);
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
    throw new Error(`SMS gateway request failed (${response.status}).`);
  }

  const lowered = bodyText.toLowerCase();
  if (lowered.includes("error") || lowered.includes("invalid") || lowered.includes("failed")) {
    throw new Error("SMS gateway rejected OTP request.");
  }
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

const registrationApiPlugin = (otpConfig: OtpGatewayConfig) => ({
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

        if ((channel !== "principal" && channel !== "coordinator") || !normalizedMobile) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid mobile number or OTP channel." }));
          return;
        }

        const key = otpKey(channel, normalizedMobile);
        const existing = otpStore.get(key);
        const now = Date.now();

        if (existing && now - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
          res.statusCode = 429;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Please wait 30 seconds before requesting another OTP." }));
          return;
        }

        const otp = randomInt(100000, 1000000).toString();
        await sendOtpViaGateway(normalizedMobile, otp, otpConfig);

        otpStore.set(key, {
          otpHash: hashOtp(otp),
          expiresAt: now + OTP_TTL_MS,
          attempts: 0,
          lastSentAt: now,
        });

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
        const record = otpStore.get(key);
        if (!record) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "OTP not found. Please request a new OTP." }));
          return;
        }

        if (Date.now() > record.expiresAt) {
          otpStore.delete(key);
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "OTP expired. Please request a new OTP." }));
          return;
        }

        if (record.attempts >= OTP_MAX_VERIFY_ATTEMPTS) {
          otpStore.delete(key);
          res.statusCode = 429;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Too many invalid attempts. Please request a new OTP." }));
          return;
        }

        if (hashOtp(otp) !== record.otpHash) {
          otpStore.set(key, {
            ...record,
            attempts: record.attempts + 1,
          });

          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Invalid OTP. Please try again." }));
          return;
        }

        otpStore.delete(key);
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

        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(record));
      } catch {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Could not persist registration" }));
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const otpConfig: OtpGatewayConfig = {
    username: env.NEXG_USERNAME || process.env.NEXG_USERNAME,
    password: env.NEXG_PASSWORD || process.env.NEXG_PASSWORD,
    from: env.NEXG_FROM || process.env.NEXG_FROM || "EDXSOL",
    templateId: env.NEXG_DLT_TEMPLATE_ID || process.env.NEXG_DLT_TEMPLATE_ID,
    principalEntityId: env.NEXG_DLT_PRINCIPAL_ENTITY_ID || process.env.NEXG_DLT_PRINCIPAL_ENTITY_ID,
    telemarketerId: env.NEXG_DLT_TELEMARKETER_ID || process.env.NEXG_DLT_TELEMARKETER_ID,
    otpTextTemplate:
      env.NEXG_OTP_TEXT_TEMPLATE ||
      process.env.NEXG_OTP_TEXT_TEMPLATE ||
      "Your OTP for EDXSO workshop registration is {{OTP}}. Do not share it with anyone.",
  };

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), registrationApiPlugin(otpConfig), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
