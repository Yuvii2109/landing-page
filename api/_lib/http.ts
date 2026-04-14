type ReqLike = {
  method?: string;
  body?: unknown;
  on?: (event: string, callback: (chunk: unknown) => void) => void;
};

type ResLike = {
  status: (code: number) => ResLike;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
  end?: (body?: string) => void;
};

export const readJsonBody = async (req: ReqLike): Promise<Record<string, unknown>> => {
  if (req.body && typeof req.body === "object") {
    return req.body as Record<string, unknown>;
  }

  let rawBody = "";
  await new Promise<void>((resolve, reject) => {
    if (!req.on) {
      resolve();
      return;
    }

    req.on("data", (chunk) => {
      rawBody += String(chunk);
    });
    req.on("end", () => resolve());
    req.on("error", (error) => reject(error));
  });

  const body = rawBody.trim();
  if (!body) return {};

  return JSON.parse(body) as Record<string, unknown>;
};

export const sendJson = (res: ResLike, statusCode: number, body: unknown) => {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(statusCode).json(body);
    return;
  }

  if (res.setHeader) res.setHeader("Content-Type", "application/json");
  if (res.end) res.end(JSON.stringify(body));
};

export const methodNotAllowed = (res: ResLike, allowed = "POST") => {
  sendJson(res, 405, { message: `Method not allowed. Use ${allowed}.` });
};
