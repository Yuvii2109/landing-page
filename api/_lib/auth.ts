import { sendJson } from "./http.js";

const decodeBase64 = (value: string) => {
  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return "";
  }
};

export const getDashboardCredentials = () => ({
  username: process.env.DASHBOARD_USERNAME || "admin",
  password: process.env.DASHBOARD_PASSWORD || "spark123",
});

export const readAuthorizationHeader = (req: { headers?: Record<string, string | string[] | undefined> }) => {
  const authorization = req.headers?.authorization;
  if (Array.isArray(authorization)) return authorization[0] || "";
  return authorization || "";
};

export const isAuthorizedDashboardRequest = (req: { headers?: Record<string, string | string[] | undefined> }) => {
  const authorization = readAuthorizationHeader(req);
  if (!authorization.startsWith("Basic ")) return false;

  const decoded = decodeBase64(authorization.slice(6));
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return false;

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);
  const credentials = getDashboardCredentials();
  return username === credentials.username && password === credentials.password;
};

export const unauthorized = (res: {
  setHeader?: (name: string, value: string) => void;
  status?: (code: number) => { json: (body: unknown) => void };
  json?: (body: unknown) => void;
  end?: (body?: string) => void;
}) => {
  if (res.setHeader) {
    res.setHeader("WWW-Authenticate", 'Basic realm="SPARK Dashboard"');
  }
  sendJson(res, 401, { message: "Unauthorized. Please sign in to access the registrations dashboard." });
};
