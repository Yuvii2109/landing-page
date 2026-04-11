import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
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

const registrationApiPlugin = () => ({
  name: "registration-api-plugin",
  configureServer(server: { middlewares: { use: (route: string, handler: (req: any, res: any, next: () => void) => void) => void } }) {
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
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), registrationApiPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
